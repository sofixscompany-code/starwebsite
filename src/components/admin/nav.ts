import {
  LayoutDashboard, ClipboardList, GraduationCap, Users, Baby, Building2, Wallet,
  BookOpen, PlayCircle, Radio, PenSquare, FileText, CalendarCheck, FileBadge,
  Trophy, Award, Bed, CreditCard, Coins,
  BarChart3, Bell, Settings, Shield, LifeBuoy,
  UserPlus, Calendar, MapPin, Phone, Mail, MessageSquare,
  UserCheck, Clock, FileCheck, Download, Upload,
  IdCard, Bus, Library, Lightbulb, Bot, GitBranch,
  Layers, Briefcase, CalendarOff, Target, History,
  KeyRound, Database, PlugZap, Send, Megaphone,
  MessageCircle, QrCode, Fingerprint, Eye,
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
  // ── MAIN ──
  {
    header: "Main",
    roles: ALL_ROLES.slice(),
    items: [
      { label: "Dashboard", to: "/admin", icon: LayoutDashboard, roles: ALL_ROLES.slice() },
    ],
  },

  // ─ ADMISSIONS & FRONT DESK ──
  {
    header: "Admissions",
    roles: ["super_admin", "branch_admin", "receptionist"],
    items: [
      { label: "Admissions", to: "/admin/admissions", icon: ClipboardList, badge: 24, roles: ["super_admin", "branch_admin", "receptionist"] },
      { label: "Reception", to: "/admin/reception", icon: Building2, roles: ["super_admin", "receptionist"] },
      { label: "Visitors", to: "/admin/crm/visitors", icon: UserPlus, roles: ["super_admin", "receptionist"] },
      { label: "Inquiries", to: "/admin/crm/inquiries", icon: Phone, roles: ["super_admin", "receptionist"] },
      { label: "Leads", to: "/admin/crm/leads", icon: Target, roles: ["super_admin", "receptionist"] },
      { label: "Counselling", to: "/admin/crm/counselling", icon: MessageSquare, roles: ["super_admin", "receptionist"] },
    ],
  },

  // ── PEOPLE ──
  {
    header: "People",
    roles: ["super_admin", "branch_admin", "teacher"],
    items: [
      { label: "Students", to: "/admin/students", icon: GraduationCap, roles: ["super_admin", "branch_admin", "teacher", "receptionist"] },
      { label: "Teachers", to: "/admin/teachers", icon: Users, roles: ["super_admin", "branch_admin"] },
      { label: "Parents", to: "/admin/parents", icon: Baby, roles: ["super_admin", "branch_admin"] },
      { label: "Employees", to: "/admin/hr/employees", icon: Briefcase, roles: ["super_admin", "branch_admin"] },
      { label: "User Management", to: "/admin/users", icon: UserCheck, roles: ["super_admin", "branch_admin"] },
    ],
  },

  // ── ACADEMICS ──
  {
    header: "Academics",
    roles: ["super_admin", "branch_admin", "teacher", "student", "parent"],
    items: [
      { label: "Courses", to: "/admin/courses", icon: BookOpen, roles: ["super_admin", "branch_admin", "teacher", "student", "parent"] },
      { label: "LMS", to: "/admin/lms", icon: PlayCircle, badge: "NEW", roles: ["super_admin", "branch_admin", "teacher", "student"] },
      { label: "Live Classes", to: "/admin/live", icon: Radio, roles: ["super_admin", "branch_admin", "teacher", "student"] },
      { label: "Homework", to: "/admin/homework", icon: PenSquare, roles: ["super_admin", "branch_admin", "teacher", "student", "parent"] },
      { label: "Assignments", to: "/admin/assignments", icon: FileText, roles: ["super_admin", "branch_admin", "teacher", "student", "parent"] },
      { label: "Attendance", to: "/admin/attendance", icon: CalendarCheck, roles: ["super_admin", "branch_admin", "teacher", "student", "parent"] },
      { label: "Examinations", to: "/admin/exams", icon: FileBadge, roles: ["super_admin", "branch_admin", "teacher", "student", "parent"] },
      { label: "Results", to: "/admin/results", icon: Trophy, roles: ["super_admin", "branch_admin", "teacher", "student", "parent"] },
      { label: "Certificates", to: "/admin/certificates", icon: Award, roles: ["super_admin", "branch_admin", "student"] },
    ],
  },

  // ── FINANCE ──
  {
    header: "Finance",
    roles: ["super_admin", "branch_admin", "accountant", "receptionist", "student", "parent"],
    items: [
      { label: "Accounting", to: "/admin/accounting", icon: Wallet, roles: ["super_admin", "branch_admin", "accountant"] },
      { label: "Payments", to: "/admin/payments", icon: CreditCard, roles: ["super_admin", "branch_admin", "accountant", "receptionist", "student", "parent"] },
      { label: "Payroll", to: "/admin/hr/payroll", icon: Coins, roles: ["super_admin", "accountant"] },
      { label: "Fee Structure", to: "/admin/fee-structure", icon: FileCheck, roles: ["super_admin", "branch_admin", "accountant"] },
    ],
  },

  // ── FACILITIES ──
  {
    header: "Facilities",
    roles: ["super_admin", "branch_admin", "student", "parent"],
    items: [
      { label: "Hostel", to: "/admin/hostel", icon: Bed, roles: ["super_admin", "branch_admin", "student", "parent"] },
      { label: "Transport", to: "/admin/transport", icon: Bus, roles: ["super_admin", "branch_admin", "student", "parent"] },
      { label: "Library", to: "/admin/library", icon: BookOpen, roles: ["super_admin", "branch_admin", "teacher", "student"] },
      { label: "ID Cards", to: "/admin/id-cards", icon: IdCard, roles: ["super_admin", "branch_admin", "student", "teacher"] },
    ],
  },

  // ── HR ──
  {
    header: "HR",
    roles: ["super_admin", "branch_admin"],
    items: [
      { label: "Departments", to: "/admin/hr/departments", icon: Layers, roles: ["super_admin", "branch_admin"] },
      { label: "Leaves", to: "/admin/hr/leaves", icon: CalendarOff, roles: ["super_admin", "branch_admin", "teacher"] },
      { label: "Shift & Attendance", to: "/admin/hr/shift-attendance", icon: Clock, roles: ["super_admin", "branch_admin"] },
    ],
  },

  // ── MARKETING ──
  {
    header: "Marketing",
    roles: ["super_admin", "branch_admin"],
    items: [
      { label: "Email Campaigns", to: "/admin/marketing/email", icon: Mail, roles: ["super_admin", "branch_admin"] },
      { label: "SMS Campaigns", to: "/admin/marketing/sms", icon: Send, roles: ["super_admin", "branch_admin"] },
      { label: "Push Notifications", to: "/admin/marketing/push", icon: Megaphone, roles: ["super_admin", "branch_admin"] },
      { label: "WhatsApp", to: "/admin/marketing/whatsapp", icon: MessageCircle, roles: ["super_admin", "branch_admin"] },
    ],
  },

  // ── ANALYTICS ──
  {
    header: "Analytics",
    roles: ["super_admin", "branch_admin", "accountant"],
    items: [
      { label: "Reports", to: "/admin/reports", icon: BarChart3, roles: ["super_admin", "branch_admin", "accountant"] },
      { label: "Analytics", to: "/admin/analytics", icon: BarChart3, roles: ["super_admin", "branch_admin"] },
    ],
  },

  // ── NOTICES ──
  {
    header: "Communication",
    roles: ALL_ROLES.slice(),
    items: [
      { label: "Notices & Events", to: "/admin/notices", icon: Bell, roles: ["super_admin", "branch_admin", "teacher", "student", "parent"] },
    ],
  },

  // ── SYSTEM ──
  {
    header: "System",
    roles: ["super_admin"],
    items: [
      { label: "Branches", to: "/admin/branches", icon: GitBranch, roles: ["super_admin"] },
      { label: "Roles & Permissions", to: "/admin/roles", icon: Shield, roles: ["super_admin"] },
      { label: "API Keys", to: "/admin/api-keys", icon: KeyRound, roles: ["super_admin"] },
      { label: "Integrations", to: "/admin/integrations", icon: PlugZap, roles: ["super_admin"] },
      { label: "Audit Log", to: "/admin/audit", icon: History, roles: ["super_admin"] },
      { label: "Backup", to: "/admin/backup", icon: Database, roles: ["super_admin"] },
      { label: "AI Assistant", to: "/admin/ai", icon: Bot, roles: ["super_admin"] },
      { label: "Light Manager", to: "/admin/light", icon: Lightbulb, roles: ["super_admin"] },
      { label: "Settings", to: "/admin/settings", icon: Settings, roles: ["super_admin", "branch_admin"] },
      { label: "Support", to: "/admin/support", icon: LifeBuoy, roles: ALL_ROLES.slice() },
    ],
  },
];

// Flat list for backward compatibility
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
