import {
  LayoutDashboard,
  Users,
  BookOpen,
  Wallet,
  CalendarCheck,
  FileText,
  BarChart3,
  Settings,
  Bell,
  UserCheck,
  ClipboardList,
  TrendingUp,
  Shield,
  Building,
  Award,
  Bed,
  UserPlus,
  User,
  BookMarked,
  Video,
  Calculator,
  UsersRound,
} from "lucide-react";

export const ROLES = {
  SUPER_ADMIN: "super_admin",
  TEACHER: "teacher",
  STUDENT: "student",
  PARENT: "parent",
  ACCOUNTANT: "accountant",
} as const;

export type Role = (typeof ROLES)[keyof typeof ROLES];

export interface MenuItem {
  title: string;
  icon: React.ComponentType<{ className?: string }>;
  path: string;
  roles: Role[];
  badge?: string | number;
  children?: MenuItem[];
}

export const MENU_ITEMS: MenuItem[] = [
  {
    title: "Dashboard",
    icon: LayoutDashboard,
    path: "/dashboard",
    roles: [ROLES.SUPER_ADMIN, ROLES.TEACHER, ROLES.STUDENT, ROLES.PARENT, ROLES.ACCOUNTANT],
  },
  {
    title: "Students",
    icon: Users,
    path: "/admin/students",
    roles: [ROLES.SUPER_ADMIN, ROLES.TEACHER],
  },
  {
    title: "Teachers",
    icon: UserCheck,
    path: "/admin/teachers",
    roles: [ROLES.SUPER_ADMIN],
  },
  {
    title: "Parents",
    icon: UsersRound,
    path: "/admin/parents",
    roles: [ROLES.SUPER_ADMIN],
  },
  {
    title: "Admissions",
    icon: UserPlus,
    path: "/admin/admissions",
    roles: [ROLES.SUPER_ADMIN],
  },
  {
    title: "Courses",
    icon: BookOpen,
    path: "/admin/courses",
    roles: [ROLES.SUPER_ADMIN, ROLES.TEACHER],
  },
  {
    title: "Attendance",
    icon: CalendarCheck,
    path: "/admin/attendance",
    roles: [ROLES.SUPER_ADMIN, ROLES.TEACHER, ROLES.STUDENT, ROLES.PARENT],
  },
  {
    title: "Exams & Results",
    icon: Award,
    path: "/admin/exams",
    roles: [ROLES.SUPER_ADMIN, ROLES.TEACHER, ROLES.STUDENT, ROLES.PARENT],
  },
  {
    title: "Homework",
    icon: FileText,
    path: "/admin/homework",
    roles: [ROLES.SUPER_ADMIN, ROLES.TEACHER, ROLES.STUDENT, ROLES.PARENT],
  },
  {
    title: "Assignments",
    icon: ClipboardList,
    path: "/admin/assignments",
    roles: [ROLES.SUPER_ADMIN, ROLES.TEACHER, ROLES.STUDENT, ROLES.PARENT],
  },
  {
    title: "LMS",
    icon: BookMarked,
    path: "/admin/lms",
    roles: [ROLES.SUPER_ADMIN, ROLES.TEACHER, ROLES.STUDENT],
  },
  {
    title: "Live Classes",
    icon: Video,
    path: "/admin/live",
    roles: [ROLES.SUPER_ADMIN, ROLES.TEACHER, ROLES.STUDENT],
  },
  {
    title: "Fee Management",
    icon: Wallet,
    path: "/admin/payments",
    roles: [ROLES.SUPER_ADMIN, ROLES.ACCOUNTANT, ROLES.STUDENT, ROLES.PARENT],
  },
  {
    title: "Accounting",
    icon: Calculator,
    path: "/admin/accounting",
    roles: [ROLES.SUPER_ADMIN, ROLES.ACCOUNTANT],
  },
  {
    title: "Reports",
    icon: BarChart3,
    path: "/admin/reports",
    roles: [ROLES.SUPER_ADMIN, ROLES.ACCOUNTANT],
  },
  {
    title: "Analytics",
    icon: TrendingUp,
    path: "/admin/analytics",
    roles: [ROLES.SUPER_ADMIN],
  },
  {
    title: "Notices & Events",
    icon: Bell,
    path: "/admin/notices",
    roles: [ROLES.SUPER_ADMIN, ROLES.TEACHER, ROLES.STUDENT, ROLES.PARENT],
  },
  {
    title: "Hostel",
    icon: Bed,
    path: "/admin/hostel",
    roles: [ROLES.SUPER_ADMIN],
  },
  {
    title: "Certificates",
    icon: Award,
    path: "/admin/certificates",
    roles: [ROLES.SUPER_ADMIN],
  },
  {
    title: "Branches",
    icon: Building,
    path: "/admin/branches",
    roles: [ROLES.SUPER_ADMIN],
  },
  {
    title: "Users & Roles",
    icon: Shield,
    path: "/admin/users",
    roles: [ROLES.SUPER_ADMIN],
  },
  {
    title: "Settings",
    icon: Settings,
    path: "/admin/settings",
    roles: [ROLES.SUPER_ADMIN],
  },
  {
    title: "Profile",
    icon: User,
    path: "/admin/profile",
    roles: [ROLES.SUPER_ADMIN, ROLES.TEACHER, ROLES.STUDENT, ROLES.PARENT, ROLES.ACCOUNTANT],
  },
];

export function getMenuItemsForRole(role: Role): MenuItem[] {
  return MENU_ITEMS.filter((item) => item.roles.includes(role));
}

export function hasAccess(role: Role, path: string): boolean {
  return MENU_ITEMS.some((item) => item.path === path && item.roles.includes(role));
}
