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

export const ALL_ROLES: string[] = ["super_admin", "teacher", "student", "parent", "accountant"];

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
      { label: "Students", to: "/admin/teacher/students", icon: GraduationCap, roles: ["teacher"] },
      { label: "Parents", to: "/admin/teacher/parents", icon: Baby, roles: ["teacher"] },
      { label: "Messaging", to: "/admin/messages", icon: MessageSquare, roles: ["teacher"] },
      { label: "Notices & Events", to: "/admin/communication/notices", icon: Megaphone, roles: ["teacher"] },
    ],
  },
  {
    header: "Schedule",
    roles: ["teacher"],
    items: [
      { label: "Calendar", to: "/admin/calendar", icon: Clock, roles: ["teacher"] },
    ],
  },

  // ========== STUDENT ==========
  {
    header: "Academics",
    roles: ["student"],
    items: [
      { label: "My Courses", to: "/admin/courses", icon: BookOpen, roles: ["student"] },
      { label: "LMS", to: "/admin/lms", icon: PlayCircle, badge: "NEW", roles: ["student"] },
      { label: "Live Classes", to: "/admin/live", icon: Radio, roles: ["student"] },
      { label: "Homework", to: "/admin/homework", icon: FileText, roles: ["student"] },
      { label: "Assignments", to: "/admin/assignments", icon: FileText, roles: ["student"] },
    ],
  },
  {
    header: "Attendance & Exams",
    roles: ["student"],
    items: [
      { label: "Attendance", to: "/admin/attendance", icon: CalendarCheck, roles: ["student"] },
      { label: "Exams", to: "/admin/exams", icon: FileText, roles: ["student"] },
      { label: "Results", to: "/admin/results", icon: Trophy, roles: ["student"] },
      { label: "Certificates", to: "/admin/certificates", icon: Award, roles: ["student"] },
    ],
  },
  {
    header: "Finance",
    roles: ["student"],
    items: [
      { label: "Fee Structure", to: "/admin/fee-structure", icon: Receipt, roles: ["student"] },
      { label: "Payments", to: "/admin/payments", icon: CreditCard, roles: ["student"] },
    ],
  },
  {
    header: "Communication",
    roles: ["student"],
    items: [
      { label: "Notices & Events", to: "/admin/communication/notices", icon: Bell, roles: ["student"] },
      { label: "Support / Help", to: "/admin/support", icon: LifeBuoy, roles: ["student"] },
    ],
  },

  // ========== PARENT ==========
  {
    header: "Overview",
    roles: ["parent"],
    items: [
      { label: "Attendance", to: "/admin/attendance", icon: CalendarCheck, roles: ["parent"] },
      { label: "Results", to: "/admin/results", icon: Trophy, roles: ["parent"] },
      { label: "Fee Payments", to: "/admin/payments", icon: CreditCard, roles: ["parent"] },
    ],
  },
  {
    header: "Communication",
    roles: ["parent"],
    items: [
      { label: "Notices & Events", to: "/admin/communication/notices", icon: Megaphone, roles: ["parent"] },
      { label: "Support / Help", to: "/admin/support", icon: LifeBuoy, roles: ["parent"] },
    ],
  },

  // ========== ACCOUNTANT ==========
  {
    header: "Finance",
    roles: ["accountant"],
    items: [
      { label: "Accounting", to: "/admin/accounting", icon: Wallet, roles: ["accountant"] },
      { label: "Payments", to: "/admin/payments", icon: CreditCard, roles: ["accountant"] },
      { label: "Fee Structure", to: "/admin/fee-structure", icon: Receipt, roles: ["accountant"] },
      { label: "Payroll", to: "/admin/hr/payroll", icon: BookMarked, roles: ["accountant"] },
    ],
  },
  {
    header: "Reports",
    roles: ["accountant"],
    items: [
      { label: "Reports", to: "/admin/reports", icon: BarChart3, roles: ["accountant"] },
      { label: "Support / Help", to: "/admin/support", icon: LifeBuoy, roles: ["accountant"] },
    ],
  },

  // ========== SUPER ADMIN ==========
  {
    header: "Academics",
    roles: ["super_admin"],
    items: [
      { label: "People", to: "/admin/academics/people", icon: Users, roles: ["super_admin"] },
      { label: "Students", to: "/admin/academics/students", icon: GraduationCap, roles: ["super_admin"] },
      { label: "Admissions", to: "/admin/admissions", icon: FileText, badge: 24, roles: ["super_admin"] },
    ],
  },
  {
    header: "Student Management",
    roles: ["super_admin"],
    items: [
      { label: "Students", to: "/admin/students", icon: GraduationCap, roles: ["super_admin"] },
      { label: "Teachers", to: "/admin/teachers", icon: Users, roles: ["super_admin"] },
      { label: "Parents", to: "/admin/parents", icon: Baby, roles: ["super_admin"] },
    ],
  },
  {
    header: "Courses & Study",
    roles: ["super_admin"],
    items: [
      { label: "Courses", to: "/admin/courses", icon: BookOpen, roles: ["super_admin"] },
      { label: "LMS", to: "/admin/lms", icon: PlayCircle, badge: "NEW", roles: ["super_admin"] },
      { label: "Live Classes", to: "/admin/live", icon: Radio, roles: ["super_admin"] },
      { label: "Homework", to: "/admin/homework", icon: FileText, roles: ["super_admin"] },
      { label: "Assignments", to: "/admin/assignments", icon: FileText, roles: ["super_admin"] },
    ],
  },
  {
    header: "Attendance & Exams",
    roles: ["super_admin"],
    items: [
      { label: "Attendance", to: "/admin/attendance", icon: CalendarCheck, roles: ["super_admin"] },
      { label: "Exams", to: "/admin/exams", icon: FileText, roles: ["super_admin"] },
      { label: "Results", to: "/admin/results", icon: Trophy, roles: ["super_admin"] },
      { label: "Certificates", to: "/admin/certificates", icon: Award, roles: ["super_admin"] },
      { label: "ID Cards", to: "/admin/id-cards", icon: Shield, roles: ["super_admin"] },
    ],
  },
  {
    header: "Finance",
    roles: ["super_admin"],
    items: [
      { label: "Accounting", to: "/admin/accounting", icon: Wallet, roles: ["super_admin"] },
      { label: "Payments", to: "/admin/payments", icon: CreditCard, roles: ["super_admin"] },
      { label: "Fee Structure", to: "/admin/fee-structure", icon: Receipt, roles: ["super_admin"] },
      { label: "Payroll", to: "/admin/hr/payroll", icon: BookMarked, roles: ["super_admin"] },
    ],
  },
  {
    header: "Facilities",
    roles: ["super_admin"],
    items: [
      { label: "Hostel", to: "/admin/hostel", icon: Trophy, roles: ["super_admin"] },
      { label: "Transport", to: "/admin/transport", icon: BookMarked, roles: ["super_admin"] },
      { label: "Library", to: "/admin/library", icon: BookOpen, roles: ["super_admin"] },
    ],
  },
  {
    header: "Reports & Analytics",
    roles: ["super_admin"],
    items: [
      { label: "Reports", to: "/admin/reports", icon: BarChart3, roles: ["super_admin"] },
      { label: "Analytics", to: "/admin/analytics", icon: LineChart, roles: ["super_admin"] },
    ],
  },
  {
    header: "Communication",
    roles: ["super_admin"],
    items: [
      { label: "Notices & Events", to: "/admin/communication/notices", icon: Bell, roles: ["super_admin"] },
      { label: "Support / Help", to: "/admin/support", icon: LifeBuoy, roles: ["super_admin"] },
    ],
  },
  {
    header: "Human Resources",
    roles: ["super_admin"],
    items: [
      { label: "Employees", to: "/admin/hr/employees", icon: Users, roles: ["super_admin"] },
      { label: "Departments", to: "/admin/hr/departments", icon: BookMarked, roles: ["super_admin"] },
      { label: "Leaves", to: "/admin/hr/leaves", icon: FileText, roles: ["super_admin"] },
      { label: "Shift Attendance", to: "/admin/hr/shift-attendance", icon: CalendarCheck, roles: ["super_admin"] },
    ],
  },
  {
    header: "CRM",
    roles: ["super_admin"],
    items: [
      { label: "Leads", to: "/admin/crm/leads", icon: BookOpen, badge: 13, roles: ["super_admin"] },
      { label: "Inquiries", to: "/admin/crm/inquiries", icon: MessageSquare, roles: ["super_admin"] },
      { label: "Visitors", to: "/admin/crm/visitors", icon: Users, roles: ["super_admin"] },
      { label: "Counselling", to: "/admin/crm/counselling", icon: Trophy, roles: ["super_admin"] },
    ],
  },
  {
    header: "System",
    roles: ["super_admin"],
    items: [
      { label: "Users", to: "/admin/users", icon: Users, roles: ["super_admin"] },
      { label: "Roles", to: "/admin/roles", icon: Shield, roles: ["super_admin"] },
      { label: "Permissions", to: "/admin/permissions", icon: Shield, roles: ["super_admin"] },
      { label: "Branches", to: "/admin/branches", icon: BookMarked, roles: ["super_admin"] },
      { label: "Settings", to: "/admin/settings", icon: Settings, roles: ["super_admin"] },
      { label: "Audit Logs", to: "/admin/audit", icon: FileText, roles: ["super_admin"] },
      { label: "AI Assistant", to: "/admin/ai", icon: Trophy, roles: ["super_admin"] },
      { label: "Backup", to: "/admin/backup", icon: FileText, badge: "New", roles: ["super_admin"] },
      { label: "Integrations", to: "/admin/integrations", icon: Radio, roles: ["super_admin"] },
      { label: "API Keys", to: "/admin/api-keys", icon: Shield, roles: ["super_admin"] },
      { label: "Feature Slides", to: "/admin/light", icon: Image, roles: ["super_admin"] },
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
