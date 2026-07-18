"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ROLE_HIERARCHY = exports.ROLE_DASHBOARD_MAP = exports.DEMO_USERS = exports.DEMO_JWT_EXPIRES_IN = exports.JWT_EXPIRES_IN = exports.JWT_SECRET = void 0;
exports.JWT_SECRET = process.env.JWT_SECRET || "star-coaching-institute-super-secret-key-2026";
exports.JWT_EXPIRES_IN = "24h";
exports.DEMO_JWT_EXPIRES_IN = "1h";
exports.DEMO_USERS = {
    super_admin: { email: "demo_admin@sofixs.com", password: "Demo@12345", role: "super_admin", name: "Super Admin" },
    branch_admin: { email: "demo_branch@sofixs.com", password: "Demo@12345", role: "branch_admin", name: "Branch Admin" },
    teacher: { email: "demo_teacher@sofixs.com", password: "Demo@12345", role: "teacher", name: "Teacher" },
    student: { email: "demo_student@sofixs.com", password: "Demo@12345", role: "student", name: "Student" },
    parent: { email: "demo_parent@sofixs.com", password: "Demo@12345", role: "parent", name: "Parent" },
    receptionist: { email: "demo_reception@sofixs.com", password: "Demo@12345", role: "receptionist", name: "Receptionist" },
    accountant: { email: "demo_accounts@sofixs.com", password: "Demo@12345", role: "accountant", name: "Accountant" },
};
exports.ROLE_DASHBOARD_MAP = {
    super_admin: "/dashboard/super-admin",
    branch_admin: "/dashboard/branch-admin",
    teacher: "/dashboard/teacher",
    student: "/dashboard/student",
    parent: "/dashboard/parent",
    receptionist: "/dashboard/receptionist",
    accountant: "/dashboard/accountant",
};
exports.ROLE_HIERARCHY = {
    super_admin: 7,
    branch_admin: 6,
    teacher: 4,
    student: 3,
    parent: 3,
    receptionist: 4,
    accountant: 5,
};
//# sourceMappingURL=config.js.map