import { useEffect, useState } from "react";
import { firebaseAuth } from "@/integrations/firebase/auth";
import { doc, getDoc } from "firebase/firestore";
import { db } from "@/integrations/firebase/config";

export type Role = "super_admin" | "teacher" | "student" | "parent" | "accountant" | null;

export const ROLE_LABELS: Record<string, string> = {
  super_admin: "Super Admin",
  teacher: "Teacher",
  student: "Student",
  parent: "Parent",
  accountant: "Accountant",
};

export const ROLE_PERMISSIONS: Record<string, string[]> = {
  super_admin: ["*"],
  teacher: ["dashboard", "classes", "attendance", "homework", "assignments", "exams", "results", "notices", "students", "lms"],
  student: ["dashboard", "courses", "attendance", "homework", "exams", "results", "fees", "notices", "lms"],
  parent: ["dashboard", "attendance", "results", "fees", "notices"],
  accountant: ["dashboard", "fees", "income", "expenses", "reports", "payments"],
};

export const ROLE_DASHBOARD_ROUTES: Record<string, string> = {
  super_admin: "/admin",
  teacher: "/dashboard/teacher",
  student: "/dashboard/student",
  parent: "/dashboard/parent",
  accountant: "/dashboard/accountant",
};

export async function fetchUserRole(userId: string): Promise<Role> {
  try {
    const userDoc = await getDoc(doc(db, "users", userId));
    if (!userDoc.exists()) return null;
    const data = userDoc.data();
    const role = data.role as string;
    if (role in ROLE_LABELS) return role as Role;
    return null;
  } catch {
    return null;
  }
}

export function routeForRole(role: Role): string {
  if (!role) return "/auth";
  return ROLE_DASHBOARD_ROUTES[role] || "/auth";
}

export function hasPermission(role: Role, permission: string): boolean {
  if (!role) return false;
  const perms = ROLE_PERMISSIONS[role] || [];
  if (perms.includes("*")) return true;
  return perms.includes(permission);
}

export function useUserRole() {
  const [state, setState] = useState<{ userId: string | null; role: Role } | undefined>(undefined);

  useEffect(() => {
    let active = true;

    const load = async (userId: string | null) => {
      if (!userId) {
        // Fallback: check localStorage for demo login
        try {
          const raw = localStorage.getItem("auth_user");
          if (raw) {
            const stored = JSON.parse(raw);
            if (stored?.uid && stored?.role && stored.role in ROLE_LABELS) {
              if (active) setState({ userId: stored.uid, role: stored.role as Role });
              return;
            }
          }
        } catch { /* ignore parse errors */ }
        if (active) setState({ userId: null, role: null });
        return;
      }
      const role = await fetchUserRole(userId);
      if (active) setState({ userId, role });
    };
    firebaseAuth.getUser().then(({ data }) => load(data?.user?.uid ?? null));
    const unsub = firebaseAuth.onAuthStateChange((_e, user) => {
      load(user?.uid ?? null);
    });
    return () => {
      active = false;
      unsub();
    };
  }, []);

  return state;
}
