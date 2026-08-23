import { useEffect, useState } from "react";
import { PageHeader } from "@/components/admin/AdminShell";
import { Panel } from "@/components/admin/ui";
import { Loader2, ShieldCheck, Save } from "lucide-react";
import { toast } from "sonner";
import { db } from "@/integrations/firebase/config";
import { collection, onSnapshot, doc, setDoc } from "firebase/firestore";

const ROLES = ["super_admin", "teacher", "student", "parent", "accountant"] as const;

const ROLE_LABELS: Record<string, string> = {
  super_admin: "Super Admin",
  teacher: "Teacher",
  student: "Student",
  parent: "Parent",
  accountant: "Accountant",
};

const MODULES = [
  "dashboard",
  "students",
  "teachers",
  "classes",
  "attendance",
  "homework",
  "assignments",
  "exams",
  "results",
  "fees",
  "payments",
  "notices",
  "messages",
  "admissions",
  "reports",
];

interface PermissionRow {
  id: string;
  roles?: Record<string, boolean>;
}

export function PermissionsPage() {
  const [rows, setRows] = useState<PermissionRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [savingId, setSavingId] = useState<string | null>(null);

  useEffect(() => {
    const unsub = onSnapshot(
      collection(db, "permissions"),
      (snap) => {
        setRows(snap.docs.map((d) => ({ id: d.id, ...(d.data() as object) })) as PermissionRow[]);
        setLoading(false);
      },
      () => setLoading(false),
    );
    return unsub;
  }, []);

  const hasAccess = (moduleId: string, role: string): boolean => {
    if (role === "super_admin") return true;
    const row = rows.find((r) => r.id === moduleId);
    if (!row?.roles) return moduleId === "dashboard";
    return !!row.roles[role];
  };

  const toggle = async (moduleId: string, role: string) => {
    if (role === "super_admin") {
      toast.info("Super Admin always has full access");
      return;
    }
    setSavingId(moduleId);
    try {
      const current = { ...rows.find((r) => r.id === moduleId)?.roles };
      current[role] = !hasAccess(moduleId, role);
      await setDoc(
        doc(db, "permissions", moduleId),
        { roles: current, updatedAt: new Date().toISOString() },
        { merge: true },
      );
    } catch {
      toast.error("Failed to update permission");
    } finally {
      setSavingId(null);
    }
  };

  return (
    <div className="space-y-6">
      <PageHeader title="Permissions" subtitle="Control which modules each role can access" />
      <Panel
        title="Role Permission Matrix"
        subtitle="Toggle module access per role — changes save instantly to Firebase"
      >
        {loading ? (
          <div className="flex items-center justify-center py-12">
            <Loader2 className="w-6 h-6 animate-spin text-[hsl(var(--ap-muted))]" />
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-[hsl(var(--ap-border))]">
                  <th className="text-left py-3 px-3 font-semibold">Module</th>
                  {ROLES.map((r) => (
                    <th key={r} className="py-3 px-2 font-semibold text-center min-w-[90px]">
                      {ROLE_LABELS[r]}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {MODULES.map((m) => (
                  <tr
                    key={m}
                    className="border-b border-[hsl(var(--ap-border)/0.5)] hover:bg-[hsl(var(--ap-bg))] transition-colors"
                  >
                    <td className="py-2.5 px-3 font-medium capitalize flex items-center gap-2">
                      <ShieldCheck className="w-4 h-4 text-[hsl(var(--ap-purple))]" />
                      {m}
                    </td>
                    {ROLES.map((r) => {
                      const active = hasAccess(m, r);
                      return (
                        <td key={r} className="py-2.5 px-2 text-center">
                          <button
                            onClick={() => toggle(m, r)}
                            disabled={savingId === m}
                            className={`w-11 h-6 rounded-full relative transition-colors disabled:opacity-50 ${
                              active ? "bg-[hsl(var(--ap-success))]" : "bg-[hsl(var(--ap-border))]"
                            } ${r === "super_admin" ? "opacity-60 cursor-not-allowed" : ""}`}
                            aria-label={`${m} - ${ROLE_LABELS[r]}`}
                          >
                            <span
                              className={`absolute top-0.5 w-5 h-5 bg-white rounded-full shadow transition-all ${
                                active ? "left-[22px]" : "left-0.5"
                              }`}
                            />
                          </button>
                        </td>
                      );
                    })}
                  </tr>
                ))}
              </tbody>
            </table>
            <p className="text-xs text-[hsl(var(--ap-muted))] mt-3 flex items-center gap-1.5">
              <Save className="w-3.5 h-3.5" />
              Changes are saved to Firestore in real time. Super Admin always has full access.
            </p>
          </div>
        )}
      </Panel>
    </div>
  );
}
