export const JWT_SECRET = process.env.JWT_SECRET || "star-coaching-institute-super-secret-key-2026";
export const JWT_EXPIRES_IN = "24h";
export const DEMO_JWT_EXPIRES_IN = "1h";

export const DEMO_USERS: Record<string, { email: string; password: string; role: string; name: string }> = {
  super_admin: { email: "demo_admin@sofixs.com", password: "Demo@12345", role: "super_admin", name: "Super Admin" },
  branch_admin: { email: "demo_branch@sofixs.com", password: "Demo@12345", role: "branch_admin", name: "Branch Admin" },
  teacher: { email: "demo_teacher@sofixs.com", password: "Demo@12345", role: "teacher", name: "Teacher" },
  student: { email: "demo_student@sofixs.com", password: "Demo@12345", role: "student", name: "Student" },
  parent: { email: "demo_parent@sofixs.com", password: "Demo@12345", role: "parent", name: "Parent" },
  receptionist: { email: "demo_reception@sofixs.com", password: "Demo@12345", role: "receptionist", name: "Receptionist" },
  accountant: { email: "demo_accounts@sofixs.com", password: "Demo@12345", role: "accountant", name: "Accountant" },
};

export const ROLE_DASHBOARD_MAP: Record<string, string> = {
  super_admin: "/dashboard/super-admin",
  branch_admin: "/dashboard/branch-admin",
  teacher: "/dashboard/teacher",
  student: "/dashboard/student",
  parent: "/dashboard/parent",
  receptionist: "/dashboard/receptionist",
  accountant: "/dashboard/accountant",
};

export const ROLE_HIERARCHY: Record<string, number> = {
  super_admin: 7,
  branch_admin: 6,
  teacher: 4,
  student: 3,
  parent: 3,
  receptionist: 4,
  accountant: 5,
};
