import { useEffect, useState, useCallback } from "react";
import {
  collection,
  onSnapshot,
  addDoc,
  updateDoc,
  deleteDoc,
  writeBatch,
  doc,
} from "firebase/firestore";
import { db } from "@/integrations/firebase/config";

export interface ModuleRecord {
  id: string;
  [key: string]: unknown;
}

export function useModuleData(collectionName: string) {
  const [rows, setRows] = useState<ModuleRecord[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const unsub = onSnapshot(
      collection(db, collectionName),
      (snap) => {
        setRows(snap.docs.map((d) => ({ id: d.id, ...d.data() }) as ModuleRecord));
        setLoading(false);
      },
      () => setLoading(false),
    );
    return unsub;
  }, [collectionName]);

  const create = useCallback(
    async (data: Record<string, unknown>) => {
      await addDoc(collection(db, collectionName), {
        ...data,
        createdAt: new Date().toISOString(),
      });
    },
    [collectionName],
  );

  const update = useCallback(
    async (id: string, data: Record<string, unknown>) => {
      await updateDoc(doc(db, collectionName, id), {
        ...data,
        updatedAt: new Date().toISOString(),
      });
    },
    [collectionName],
  );

  const remove = useCallback(
    async (id: string) => {
      await deleteDoc(doc(db, collectionName, id));
    },
    [collectionName],
  );

  const bulkDelete = useCallback(
    async (ids: string[]) => {
      const batch = writeBatch(db);
      ids.forEach((id) => batch.delete(doc(db, collectionName, id)));
      await batch.commit();
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
    },
    [collectionName],
  );

  return { rows, loading, create, update, remove, bulkDelete, bulkUpdate };
}
