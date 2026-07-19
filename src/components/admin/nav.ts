import {
  LayoutDashboard, ClipboardList, GraduationCap, Users, Baby, Building2, Wallet,
  BookOpen, PlayCircle, Radio, PenSquare, FileText, CalendarCheck, FileBadge,
  Trophy, Award, Bed, CreditCard, Coins,
  BarChart3, Bell, Settings, Shield, LifeBuoy, User, Calendar,
  BookMarked, LineChart, Library, Megaphone, MessageSquare,
  PiggyBank, Receipt, DollarSign, Banknote, TrendingUp, TrendingDown, PieChart,
  Calculator, HandCoins, CircleDollarSign, UserCheck, Search,
  LogOut, HelpCircle, ChevronDown,
} from "lucide-react";

export type NavItem = {
  label: string;
  to?: string;
  icon: React.ComponentType<{ className?: string }>;
  badge?: string | number;
  roles?: string[];
};

export type NavSection = {
  header: string;
  items: NavItem[];
  roles?: string[];
};

const ALL_ROLES = ["super_admin", "branch_admin", "teacher", "student", "parent", "accountant", "receptionist"] as const;

export const NAV_SECTIONS: NavSection[] = [
  // ========== MAIN (all roles) ==========
  {
    header: "Main",
    roles: ALL_ROLES.slice(),
    items: [
      { label: "Dashboard", to: "/admin", icon: LayoutDashboard, roles: ALL_ROLES.slice() },
    ],
  },

  // ========== TEACHER SECTIONS ==========
  {
    header: "Teaching",
    roles: ["teacher"],
    items: [
      { label: "My Classes", to: "/admin/teacher/classes", icon: BookMarked, roles: ["teacher"] },
      { label: "Attendance", to: "/admin/attendance", icon: CalendarCheck, roles: ["teacher"] },
      { label: "Assignments", to: "/admin/assignments", icon: FileText, roles: ["teacher"] },
      { label: "Gradebook", to: "/admin/teacher/gradebook", icon: Trophy, roles: ["teacher"] },
    ],
  },
  {
    header: "Resources",
    roles: ["teacher"],
    items: [
      { label: "Learning Materials", to: "/admin/lms", icon: Library, roles: ["teacher"] },
      { label: "Examinations", to: "/admin/exams", icon: FileBadge, roles: ["teacher"] },
      { label: "Results", to: "/admin/results", icon: LineChart, roles: ["teacher"] },
    ],
  },
  {
    header: "People & Communication",
    roles: ["teacher"],
    items: [
      { label: "Students", to: "/admin/students", icon: GraduationCap, roles: ["teacher"] },
      { label: "Parents", to: "/admin/parents", icon: Baby, roles: ["teacher"] },
      { label: "Messaging", to: "/admin/teacher/messages", icon: MessageSquare, roles: ["teacher"] },
      { label: "Notices & Events", to: "/admin/notices", icon: Megaphone, roles: ["teacher"] },
    ],
  },
  {
    header: "Schedule",
    roles: ["teacher"],
    items: [
      { label: "Calendar", to: "/admin/teacher/calendar", icon: Calendar, roles: ["teacher"] },
    ],
  },

  // ========== STUDENT SECTIONS ==========
  {
    header: "Academics",
    roles: ["student"],
    items: [
      { label: "My Courses", to: "/admin/courses", icon: BookOpen, roles: ["student"] },
      { label: "My Schedule", to: "/admin/student/schedule", icon: Calendar, roles: ["student"] },
      { label: "Assignments", to: "/admin/assignments", icon: FileText, roles: ["student"] },
      { label: "Homework", to: "/admin/homework", icon: PenSquare, roles: ["student"] },
      { label: "Study Resources", to: "/admin/lms", icon: Library, roles: ["student"] },
      { label: "Live Classes", to: "/admin/live", icon: Radio, roles: ["student"] },
    ],
  },
  {
    header: "Assessment",
    roles: ["student"],
    items: [
      { label: "Examinations", to: "/admin/exams", icon: FileBadge, roles: ["student"] },
      { label: "Grades & Reports", to: "/admin/results", icon: LineChart, roles: ["student"] },
      { label: "Certificates", to: "/admin/certificates", icon: Award, roles: ["student"] },
    ],
  },
  {
    header: "Finance",
    roles: ["student"],
    items: [
      { label: "Fee Status", to: "/admin/payments", icon: CreditCard, roles: ["student"] },
      { label: "Fee Structure", to: "/admin/fee-structure", icon: Receipt, roles: ["student"] },
    ],
  },
  {
    header: "Notifications & Communication",
    roles: ["student"],
    items: [
      { label: "Notifications", to: "/admin/notices", icon: Bell, roles: ["student"] },
      { label: "Messages", to: "/admin/student/messages", icon: MessageSquare, roles: ["student"] },
    ],
  },

  // ========== PARENT SECTIONS ==========
  {
    header: "Overview",
    roles: ["parent"],
    items: [
      { label: "Child Overview", to: "/admin/parents", icon: Baby, roles: ["parent"] },
      { label: "Attendance", to: "/admin/attendance", icon: CalendarCheck, roles: ["parent"] },
      { label: "Academic Progress", to: "/admin/results", icon: LineChart, roles: ["parent"] },
    ],
  },
  {
    header: "School Interaction",
    roles: ["parent"],
    items: [
      { label: "School Notices", to: "/admin/notices", icon: Megaphone, roles: ["parent"] },
      { label: "Teacher Interaction", to: "/admin/parents", icon: MessageSquare, roles: ["parent"] },
    ],
  },
  {
    header: "Finance",
    roles: ["parent"],
    items: [
      { label: "Fee Payments", to: "/admin/payments", icon: CreditCard, roles: ["parent"] },
      { label: "Fee Statement", to: "/admin/fee-structure", icon: Receipt, roles: ["parent"] },
    ],
  },

  // ========== ACCOUNTANT SECTIONS ==========
  {
    header: "Collections",
    roles: ["accountant"],
    items: [
      { label: "Fee Collection", to: "/admin/accounting", icon: HandCoins, roles: ["accountant"] },
      { label: "Student Billing", to: "/admin/accounting", icon: Receipt, roles: ["accountant"] },
      { label: "Invoices", to: "/admin/accounting", icon: FileText, roles: ["accountant"] },
    ],
  },
  {
    header: "Payments",
    roles: ["accountant"],
    items: [
      { label: "Payroll", to: "/admin/hr/payroll", icon: Coins, roles: ["accountant"] },
      { label: "Expense Tracking", to: "/admin/accounting", icon: TrendingDown, roles: ["accountant"] },
    ],
  },
  {
    header: "Reports & Compliance",
    roles: ["accountant"],
    items: [
      { label: "Financial Reports", to: "/admin/reports", icon: PieChart, roles: ["accountant"] },
      { label: "Tax & Compliance", to: "/admin/reports", icon: Calculator, roles: ["accountant"] },
    ],
  },

  // ========== SHARED SECTIONS ==========

  // Academics (for super_admin and branch_admin)
  {
    header: "Academics",
    roles: ["super_admin", "branch_admin", "teacher"],
    items: [
      { label: "Courses", to: "/admin/courses", icon: BookOpen, roles: ["super_admin", "branch_admin", "teacher"] },
      { label: "LMS", to: "/admin/lms", icon: PlayCircle, badge: "NEW", roles: ["super_admin", "branch_admin", "teacher"] },
      { label: "Live Classes", to: "/admin/live", icon: Radio, roles: ["super_admin", "branch_admin", "teacher"] },
      { label: "Homework", to: "/admin/homework", icon: PenSquare, roles: ["super_admin", "branch_admin", "teacher"] },
      { label: "Assignments", to: "/admin/assignments", icon: FileText, roles: ["super_admin", "branch_admin", "teacher"] },
      { label: "Attendance", to: "/admin/attendance", icon: CalendarCheck, roles: ["super_admin", "branch_admin", "teacher"] },
      { label: "Examinations", to: "/admin/exams", icon: FileBadge, roles: ["super_admin", "branch_admin", "teacher"] },
      { label: "Results", to: "/admin/results", icon: Trophy, roles: ["super_admin", "branch_admin", "teacher"] },
      { label: "Certificates", to: "/admin/certificates", icon: Award, roles: ["super_admin", "branch_admin"] },
    ],
  },

  // People (for super_admin and branch_admin)
  {
    header: "People",
    roles: ["super_admin", "branch_admin"],
    items: [
      { label: "Students", to: "/admin/students", icon: GraduationCap, roles: ["super_admin", "branch_admin", "teacher"] },
      { label: "Teachers", to: "/admin/teachers", icon: Users, roles: ["super_admin", "branch_admin"] },
      { label: "Parents", to: "/admin/parents", icon: Baby, roles: ["super_admin", "branch_admin"] },
    ],
  },

  // Admissions (for super_admin, branch_admin, receptionist)
  {
    header: "Admissions",
    roles: ["super_admin", "branch_admin", "receptionist"],
    items: [
      { label: "Admissions", to: "/admin/admissions", icon: ClipboardList, badge: 24, roles: ["super_admin", "branch_admin", "receptionist"] },
      { label: "Reception", to: "/admin/reception", icon: Building2, roles: ["super_admin", "receptionist"] },
    ],
  },

  // Finance (for super_admin, branch_admin, accountant, receptionist)
  {
    header: "Finance",
    roles: ["super_admin", "branch_admin", "accountant", "receptionist"],
    items: [
      { label: "Accounting", to: "/admin/accounting", icon: Wallet, roles: ["super_admin", "branch_admin", "accountant"] },
      { label: "Payments", to: "/admin/payments", icon: CreditCard, roles: ["super_admin", "branch_admin", "accountant", "receptionist"] },
      { label: "Payroll", to: "/admin/hr/payroll", icon: Coins, roles: ["super_admin", "accountant"] },
    ],
  },

  // Facilities (shared)
  {
    header: "Facilities",
    roles: ["super_admin", "branch_admin"],
    items: [
      { label: "Hostel", to: "/admin/hostel", icon: Bed, roles: ["super_admin", "branch_admin"] },
    ],
  },

  // Reports (for super_admin, branch_admin)
  {
    header: "Reports",
    roles: ["super_admin", "branch_admin"],
    items: [
      { label: "Reports", to: "/admin/reports", icon: BarChart3, roles: ["super_admin", "branch_admin"] },
    ],
  },

  // Communication (shared for super_admin, branch_admin, teacher, parent, student)
  {
    header: "Communication",
    roles: ["super_admin", "branch_admin", "teacher"],
    items: [
      { label: "Notices & Events", to: "/admin/notices", icon: Bell, roles: ["super_admin", "branch_admin", "teacher"] },
      { label: "Support", to: "/admin/support", icon: LifeBuoy, roles: ALL_ROLES.slice() },
    ],
  },

  // System (for super_admin only)
  {
    header: "System",
    roles: ["super_admin"],
    items: [
      { label: "Users", to: "/admin/users", icon: Users, roles: ["super_admin"] },
      { label: "Roles", to: "/admin/roles", icon: Shield, roles: ["super_admin"] },
      { label: "Settings", to: "/admin/settings", icon: Settings, roles: ["super_admin"] },
    ],
  },
];

export const NAV_ITEMS: NavItem[] = NAV_SECTIONS.flatMap((s) => s.items);

export const QUICK_ACTIONS = [
  { label: "Add Student", icon: GraduationCap, to: "/admin/students" },
  { label: "Take Attendance", icon: CalendarCheck, to: "/admin/attendance" },
  { label: "Create Exam", icon: FileBadge, to: "/admin/exams" },
  { label: "Upload Notes", icon: BookOpen, to: "/admin/lms" },
  { label: "Send Notice", icon: Bell, to: "/admin/notices" },
  { label: "Collect Fee", icon: Wallet, to: "/admin/accounting" },
];

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
