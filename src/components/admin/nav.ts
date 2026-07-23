import {
  LayoutDashboard, GraduationCap, Users, Baby, Wallet,
  BookOpen, PlayCircle, Radio, FileText, CalendarCheck,
  Trophy, Award, CreditCard, BarChart3, Bell, Settings, LifeBuoy,
  BookMarked, LineChart, Library, Megaphone, MessageSquare,
  Receipt, Image, Clock, Shield, type LucideIcon,
} from "lucide-react";

export type NavItem = {
  label: string;
  to?: string;
  icon: LucideIcon;
  badge?: string | number;
  roles?: string[];
};

export type NavSection = {
  header: string;
  items: NavItem[];
  roles?: string[];
};

const ALL_ROLES: string[] = ["super_admin", "branch_admin", "teacher", "student", "parent", "accountant", "receptionist"];

export const NAV_SECTIONS: NavSection[] = [
  // ========== MAIN (all roles) ==========
  {
    header: "Main",
    items: [
      { label: "Dashboard", to: "/admin", icon: LayoutDashboard },
    ],
  },

  // ========== TEACHER ==========
  {
    header: "Teaching",
    roles: ["teacher"],
    items: [
      { label: "My Classes", to: "/admin/teacher/classes", icon: BookMarked, roles: ["teacher"] },
      { label: "Attendance", to: "/admin/teacher/attendance", icon: CalendarCheck, roles: ["teacher"] },
      { label: "Assignments", to: "/admin/teacher/assignments", icon: FileText, roles: ["teacher"] },
      { label: "Gradebook", to: "/admin/teacher/gradebook", icon: Trophy, roles: ["teacher"] },
      { label: "Resources", to: "/admin/teacher/resources", icon: BookOpen, roles: ["teacher"] },
      { label: "Learning Materials", to: "/admin/teacher/learning-materials", icon: Library, roles: ["teacher"] },
      { label: "Examinations", to: "/admin/teacher/examinations", icon: LineChart, roles: ["teacher"] },
      { label: "Results", to: "/admin/teacher/results", icon: Award, roles: ["teacher"] },
    ],
  },
  {
    header: "People & Communication",
    roles: ["teacher"],
    items: [
      { label: "Students", to: "/admin/teacher/students", icon: Users, roles: ["teacher"] },
      { label: "Parents", to: "/admin/teacher/parents", icon: Baby, roles: ["teacher"] },
      { label: "Messaging", to: "/admin/messages", icon: MessageSquare, roles: ["teacher"] },
      { label: "Notices & Events", to: "/admin/notices", icon: Megaphone, roles: ["teacher"] },
    ],
  },
  {
    header: "Schedule",
    roles: ["teacher"],
    items: [
      { label: "Calendar", to: "/admin/calendar", icon: Clock, roles: ["teacher"] },
    ],
  },

  // ========== ACADEMICS (super_admin, branch_admin) ==========
  {
    header: "Academics",
    roles: ["super_admin", "branch_admin"],
    items: [
      { label: "People", to: "/admin/academics/people", icon: Users, roles: ["super_admin", "branch_admin"] },
      { label: "Students", to: "/admin/academics/students", icon: GraduationCap, roles: ["super_admin", "branch_admin"] },
    ],
  },

  // ========== COMMUNICATION (super_admin, branch_admin, teacher) ==========
  {
    header: "Communication",
    roles: ["super_admin", "teacher", "branch_admin"],
    items: [
      { label: "Notices & Events", to: "/admin/communication/notices", icon: Bell, roles: ["super_admin", "teacher", "branch_admin"] },
      { label: "Support / Help", to: "/admin/support", icon: LifeBuoy },
    ],
  },

  // ========== ADMISSIONS ==========
  {
    header: "Admissions",
    roles: ["super_admin", "branch_admin"],
    items: [
      { label: "Admissions", to: "/admin/admissions", icon: FileText, roles: ["super_admin", "user"], badge: 24 },
      { label: "Reception", to: "/admin/reception", icon: Users, roles: ["receptionist", "super_admin"] },
    ],
  },

  // ========== STUDENT MANAGEMENT ==========
  {
    header: "Student Management",
    roles: ["super_admin", "branch_admin"],
    items: [
      { label: "Students", to: "/admin/students", icon: GraduationCap, roles: ["super_admin", "branch_admin"] },
      { label: "Teachers", to: "/admin/teachers", icon: Users, roles: ["super_admin", "branch_admin"] },
      { label: "Parents", to: "/admin/parents", icon: Baby, roles: ["super_admin", "branch_admin"] },
    ],
  },

  // ========== COURSES & STUDY ==========
  {
    header: "Courses & Study",
    roles: ["super_admin", "user", "student"],
    items: [
      { label: "Courses", to: "/admin/courses", icon: BookOpen, roles: ["super_admin", "user"] },
      { label: "LMS", to: "/admin/lms", icon: PlayCircle, badge: "NEW", roles: ["super_admin", "user"] },
      { label: "Radio", to: "/admin/live", icon: Radio, roles: ["super_admin", "user", "student"] },
      { label: "Homework", to: "/admin/homework", icon: FileText, roles: ["super_admin", "student"] },
      { label: "Assignments", to: "/admin/assignments", icon: FileText, roles: ["super_admin", "student"] },
    ],
  },

  // ========== EXAMS / ATTENDANCE ==========
  {
    header: "Attendance & Exams",
    roles: ["super_admin", "student"],
    items: [
      { label: "Attendance", to: "/admin/attendance", icon: CalendarCheck },
      { label: "Exams", to: "/admin/exams", icon: FileText },
      { label: "Results", to: "/admin/results", icon: Trophy },
      { label: "Certificates", to: "/admin/certificates", icon: Award },
    ],
  },

  // === FINANCE ===
  {
    header: "Finance",
    roles: ["super_admin", "user", "accountant", "receptionist"],
    items: [
      { label: "Accounting", to: "/admin/accounting", icon: Wallet },
      { label: "Payments", to: "/admin/payments", icon: CreditCard },
      { label: "Fee Structure", to: "/admin/fee-structure", icon: Receipt },
    ],
  },

  // === FACILITIES ===
  {
    header: "Facilities",
    roles: ["super_admin"],
    items: [
      { label: "Hostel", to: "/admin/hostel", icon: Trophy },
    ],
  },
  {
    header: "Transportation",
    roles: ["super_admin"],
    items: [
      { label: "Transport", to: "/admin/transport", icon: BookMarked },
      { label: "Library", to: "/admin/library", icon: BookOpen },
    ],
  },

  // === COMMUNICATION (secondary) ===
  {
    header: "Marketing",
    roles: ["super_admin"],
    items: [
      { label: "Notices", to: "/admin/notices", icon: Megaphone },
    ],
  },

  // === REPORTS ===
  {
    header: "Reports & Analytics",
    roles: ["super_admin"],
    items: [
      { label: "Reports", to: "/admin/reports", icon: BarChart3 },
      { label: "Analytics", to: "/admin/analytics", icon: LineChart },
    ],
  },

  // === HR ===
  {
    header: "Human Resources",
    roles: ["super_admin"],
    items: [
      { label: "Employees", to: "/admin/hr/employees", icon: Users },
      { label: "Departments", to: "/admin/hr/departments", icon: BookMarked },
      { label: "Leaves", to: "/admin/hr/leaves", icon: FileText },
    ],
  },
  {
    header: "Attendance (HR)",
    roles: ["super_admin"],
    items: [
      { label: "Shift Attendance", to: "/admin/hr/shift-attendance", icon: CalendarCheck },
      { label: "Payroll", to: "/admin/hr/payroll", icon: Wallet },
    ],
  },

  // === CRM ===
  {
    header: "CRM",
    roles: ["super_admin"],
    items: [
      { label: "Leads", to: "/admin/crm/leads", icon: BookOpen, badge: 13 },
      { label: "Inquiries", to: "/admin/notices", icon: MessageSquare },
      { label: "Visitors", to: "/admin/crm/visitors", icon: Users },
      { label: "Counselling", to: "/admin/crm/counselling", icon: Trophy },
    ],
  },

  // === SYSTEM ===
  {
    header: "System",
    roles: ["super_admin"],
    items: [
      { label: "Users", to: "/admin/users", icon: Users },
      { label: "Roles", to: "/admin/roles", icon: Users },
      { label: "Permissions", to: "/admin/permissions", icon: Shield },
      { label: "Branches", to: "/admin/branches", icon: BookMarked },
      { label: "Settings", to: "/admin/settings", icon: Settings },
      { label: "Audit Logs", to: "/admin/audit", icon: FileText },
      { label: "AI Assistant", to: "/admin/ai", icon: Trophy },
      { label: "Backup", to: "/admin/backup", icon: FileText, badge: "New" },
      { label: "Integration", to: "/admin/integrations", icon: Radio },
      { label: "API Keys", to: "/admin/api-keys", icon: Shield },
      { label: "Feature Slides", to: "/admin/light", icon: Image },
    ],
  },
];

export const NAV_ITEMS: NavItem[] = NAV_SECTIONS.flatMap((s) => s.items);

export function getNavSectionsForRole(role: string): NavSection[] {
  return NAV_SECTIONS
    .map((section) => ({
      ...section,
      items: section.items.filter(
        (item) => !item.roles || item.roles.includes(role)
      ),
    }))
    .filter((section) => section.items.length > 0);
}

export function getNavItemsForRole(role: string): NavItem[] {
  return getNavSectionsForRole(role).flatMap((s) => s.items);
}
