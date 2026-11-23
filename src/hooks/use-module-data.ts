import { useEffect, useState, useCallback } from "react";
import {
  collection,
  onSnapshot,
  addDoc,
  updateDoc,
  deleteDoc,
  writeBatch,
  doc,
} from "@/integrations/aws/firestore";
import { db } from "@/integrations/aws/config";

export interface ModuleRecord {
  id: string;
  [key: string]: unknown;
}

function getActor(): { name: string; role: string; uid: string } {
  try {
    const raw = localStorage.getItem("auth_user");
    if (raw) {
      const u = JSON.parse(raw);
      return {
        name: u?.name || u?.email || "Unknown user",
        role: u?.role || "",
        uid: u?.uid || "",
      };
    }
  } catch {
    // ignore
  }
  return { name: "Unknown user", role: "", uid: "" };
}

async function logAudit(action: string, target: string) {
  const actor = getActor();
  await addDoc(collection(db, "audit_logs"), {
    user: actor.name,
    action,
    target,
    date: new Date().toISOString(),
    role: actor.role,
    actorUid: actor.uid,
    createdAt: new Date().toISOString(),
  });
}

export function useModuleData(collectionName: string) {
  const [rows, setRows] = useState<ModuleRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);

  useEffect(() => {
    const unsub = onSnapshot(
      collection(db, collectionName),
      (snap) => {
        setError(false);
        setRows(snap.docs.map((d) => ({ id: d.id, ...d.data() }) as ModuleRecord));
        setLoading(false);
      },
      () => {
        setError(true);
        setLoading(false);
      },
    );
    return unsub;
  }, [collectionName]);

  const create = useCallback(
    async (data: Record<string, unknown>) => {
      const actor = getActor();
      // Ownership stamps: dashboards filter records by these fields
      // (e.g. useTeacherDashboard filters teacherId == uid), and Firestore
      // rules rely on them too. An explicit form value always wins.
      const stamp: Record<string, unknown> = {};
      if (actor.uid) stamp.createdBy = actor.uid;
      if (actor.role === "teacher" && !data.teacherId) stamp.teacherId = actor.uid;
      if (actor.role === "student" && !data.studentId) stamp.studentId = actor.uid;
      const ref = await addDoc(collection(db, collectionName), {
        ...stamp,
        ...data,
        createdAt: new Date().toISOString(),
      });
      if (collectionName !== "audit_logs")
        await logAudit("Created", `${collectionName} #${ref.id}`);
    },
    [collectionName],
  );

  const update = useCallback(
    async (id: string, data: Record<string, unknown>) => {
      await updateDoc(doc(db, collectionName, id), {
        ...data,
        updatedAt: new Date().toISOString(),
      });
      if (collectionName !== "audit_logs") await logAudit("Updated", `${collectionName} #${id}`);
    },
    [collectionName],
  );

  const remove = useCallback(
    async (id: string) => {
      await deleteDoc(doc(db, collectionName, id));
      if (collectionName !== "audit_logs") await logAudit("Deleted", `${collectionName} #${id}`);
    },
    [collectionName],
  );

  const bulkDelete = useCallback(
    async (ids: string[]) => {
      const batch = writeBatch(db);
      ids.forEach((id) => batch.delete(doc(db, collectionName, id)));
      await batch.commit();
      if (collectionName !== "audit_logs")
        await logAudit("Bulk Deleted", `${collectionName} (${ids.length} items)`);
    },
    [collectionName],
  );

  const bulkUpdate = useCallback(
    async (ids: string[], data: Record<string, unknown>) => {
      const batch = writeBatch(db);
      ids.forEach((id) =>
        batch.update(doc(db, collectionName, id), { ...data, updatedAt: new Date().toISOString() }),
      );
      await batch.commit();
      if (collectionName !== "audit_logs")
        await logAudit("Bulk Updated", `${collectionName} (${ids.length} items)`);
    },
    [collectionName],
  );

  return { rows, loading, error, create, update, remove, bulkDelete, bulkUpdate };
}
