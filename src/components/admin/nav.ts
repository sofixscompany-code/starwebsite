import {
  LayoutDashboard,
  GraduationCap,
  Users,
  Baby,
  Wallet,
  BookOpen,
  FileText,
  CalendarCheck,
  Trophy,
  Award,
  CreditCard,
  BarChart3,
  Bell,
  Settings,
  LifeBuoy,
  BookMarked,
  LineChart,
  Images,
  Library,
  Megaphone,
  MessageSquare,
  Receipt,
  Image,
  Clock,
  Shield,
  MessageSquareQuote,
  Sparkles,
  Dumbbell,
  Newspaper,
  FolderOpen,
  Briefcase,
  Send,
  Phone,
  Key,
  History,
  Building2,
  Plug,
  type LucideIcon,
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
    items: [{ label: "Dashboard", to: "/admin", icon: LayoutDashboard }],
  },

  // ========== TEACHER ==========
  {
    header: "Teaching",
    roles: ["teacher"],
    items: [
      { label: "My Classes", to: "/admin/teacher/classes", icon: BookMarked, roles: ["teacher"] },
      {
        label: "Attendance",
        to: "/admin/teacher/attendance",
        icon: CalendarCheck,
        roles: ["teacher"],
      },
      {
        label: "Assignments",
        to: "/admin/teacher/assignments",
        icon: FileText,
        roles: ["teacher"],
      },
      { label: "Gradebook", to: "/admin/teacher/gradebook", icon: Trophy, roles: ["teacher"] },
      {
        label: "My Students",
        to: "/admin/teacher/students",
        icon: GraduationCap,
        roles: ["teacher"],
      },
      { label: "Resources", to: "/admin/teacher/resources", icon: BookOpen, roles: ["teacher"] },
      {
        label: "Learning Materials",
        to: "/admin/teacher/learning-materials",
        icon: Library,
        roles: ["teacher"],
      },
      {
        label: "Examinations",
        to: "/admin/teacher/examinations",
        icon: LineChart,
        roles: ["teacher"],
      },
      { label: "Results", to: "/admin/teacher/results", icon: Award, roles: ["teacher"] },
    ],
  },
  {
    header: "Communication",
    roles: ["teacher"],
    items: [
      {
        label: "Notices & Events",
        to: "/admin/communication/notices",
        icon: Megaphone,
        roles: ["teacher"],
      },
    ],
  },
  {
    header: "Schedule",
    roles: ["teacher"],
    items: [{ label: "Calendar", to: "/admin/calendar", icon: Clock, roles: ["teacher"] }],
  },
  {
    header: "Finance",
    roles: ["teacher"],
    items: [{ label: "My Payments", to: "/admin/payments", icon: CreditCard, roles: ["teacher"] }],
  },

  // ========== STUDENT ==========
  {
    header: "Academics",
    roles: ["student"],
    items: [
      { label: "My Courses", to: "/admin/courses", icon: BookOpen, roles: ["student"] },
      { label: "Live Classes", to: "/admin/live", icon: LineChart, roles: ["student"] },
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
    ],
  },
  {
    header: "Finance",
    roles: ["student"],
    items: [{ label: "Payments", to: "/admin/payments", icon: CreditCard, roles: ["student"] }],
  },
  {
    header: "Communication",
    roles: ["student"],
    items: [
      {
        label: "Notices & Events",
        to: "/admin/communication/notices",
        icon: Bell,
        roles: ["student"],
      },
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
      {
        label: "Notices & Events",
        to: "/admin/communication/notices",
        icon: Megaphone,
        roles: ["parent"],
      },
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
    roles: ["super_admin", "accountant"],
    items: [
      {
        label: "Admissions",
        to: "/admin/admissions",
        icon: FileText,
        // Accountant: read-only view (sees discount/payable on admissions).
        roles: ["super_admin", "accountant"],
      },
      {
        label: "Courses & Pricing",
        to: "/admin/admission-pricing",
        icon: Receipt,
        roles: ["super_admin"],
      },
      {
        label: "Preparation Content",
        to: "/admin/prep-content",
        icon: BookMarked,
        roles: ["super_admin"],
      },
      {
        label: "Student Cards",
        to: "/admin/student-cards",
        icon: CreditCard,
        roles: ["super_admin"],
      },
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
      { label: "LMS", to: "/admin/lms", icon: Library, roles: ["super_admin"] },
      { label: "Live Classes", to: "/admin/live", icon: LineChart, roles: ["super_admin"] },
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
    ],
  },
  {
    header: "Finance",
    roles: ["super_admin"],
    items: [
      { label: "Accounting", to: "/admin/accounting", icon: Wallet, roles: ["super_admin"] },
      { label: "Payments", to: "/admin/payments", icon: CreditCard, roles: ["super_admin"] },
      { label: "Fee Structure", to: "/admin/fee-structure", icon: Receipt, roles: ["super_admin"] },
    ],
  },
  {
    header: "Facilities",
    roles: ["super_admin"],
    items: [{ label: "Hostel", to: "/admin/hostel", icon: Trophy, roles: ["super_admin"] }],
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
    header: "Website Content",
    roles: ["super_admin"],
    items: [
      {
        label: "Hero Slides",
        to: "/admin/hero-slides",
        icon: Image,
        roles: ["super_admin"],
      },
      {
        label: "Feature Slides / Banners",
        to: "/admin/banners",
        icon: Images,
        roles: ["super_admin"],
      },
      {
        label: "Feature Slides",
        to: "/admin/light",
        icon: Image,
        roles: ["super_admin"],
      },
      {
        label: "Top Selections",
        to: "/admin/selections",
        icon: Trophy,
        roles: ["super_admin"],
      },
      {
        label: "Testimonials",
        to: "/admin/homepage-testimonials",
        icon: MessageSquareQuote,
        roles: ["super_admin"],
      },
      {
        label: "Why Choose Us",
        to: "/admin/why-choose-us",
        icon: Sparkles,
        roles: ["super_admin"],
      },
      {
        label: "MD Message",
        to: "/admin/md-message",
        icon: Megaphone,
        roles: ["super_admin"],
      },
      {
        label: "Physical Training",
        to: "/admin/physical-training",
        icon: Dumbbell,
        roles: ["super_admin"],
      },
      {
        label: "Stats Bar",
        to: "/admin/homepage-stats",
        icon: BarChart3,
        roles: ["super_admin"],
      },
      {
        label: "Course Categories",
        to: "/admin/homepage-categories",
        icon: BookOpen,
        roles: ["super_admin"],
      },
      { label: "Faculty", to: "/admin/faculty", icon: GraduationCap, roles: ["super_admin"] },
      { label: "Gallery", to: "/admin/gallery", icon: Images, roles: ["super_admin"] },
      {
        label: "Career Services",
        to: "/admin/career",
        icon: Briefcase,
        roles: ["super_admin"],
      },
      {
        label: "Advertisements",
        to: "/admin/advertisements",
        icon: Newspaper,
        roles: ["super_admin"],
      },
      {
        label: "Feature Content",
        to: "/admin/feature-content",
        icon: Sparkles,
        roles: ["super_admin"],
      },
      {
        label: "Media Library",
        to: "/admin/media-library",
        icon: FolderOpen,
        roles: ["super_admin"],
      },
      {
        label: "Site Settings",
        to: "/admin/site-settings",
        icon: Settings,
        roles: ["super_admin"],
      },
    ],
  },
  {
    header: "Communication",
    roles: ["super_admin"],
    items: [
      {
        label: "Notices & Events",
        to: "/admin/communication/notices",
        icon: Bell,
        roles: ["super_admin"],
      },
      { label: "Messages", to: "/admin/messages", icon: MessageSquare, roles: ["super_admin"] },
      { label: "Support / Help", to: "/admin/support", icon: LifeBuoy, roles: ["super_admin"] },
    ],
  },
  {
    header: "CRM",
    roles: ["super_admin"],
    items: [
      {
        label: "Inquiries",
        to: "/admin/crm/inquiries",
        icon: MessageSquare,
        roles: ["super_admin"],
      },
    ],
  },
  {
    header: "Marketing",
    roles: ["super_admin"],
    items: [
      {
        label: "SMS Campaigns",
        to: "/admin/marketing/sms",
        icon: MessageSquare,
        roles: ["super_admin"],
      },
      {
        label: "Email Campaigns",
        to: "/admin/marketing/email",
        icon: Send,
        roles: ["super_admin"],
      },
      {
        label: "WhatsApp",
        to: "/admin/marketing/whatsapp",
        icon: Phone,
        roles: ["super_admin"],
      },
      {
        label: "Push Notifications",
        to: "/admin/marketing/push",
        icon: Bell,
        roles: ["super_admin"],
      },
    ],
  },
  {
    header: "System",
    roles: ["super_admin"],
    items: [
      { label: "Users", to: "/admin/users", icon: Users, roles: ["super_admin"] },
      { label: "Roles", to: "/admin/roles", icon: Shield, roles: ["super_admin"] },
      { label: "Permissions", to: "/admin/permissions", icon: Shield, roles: ["super_admin"] },
      { label: "Settings", to: "/admin/settings", icon: Settings, roles: ["super_admin"] },
      { label: "AI Assistant", to: "/admin/ai", icon: Sparkles, roles: ["super_admin"] },
      {
        label: "Backup",
        to: "/admin/backup",
        icon: FileText,
        roles: ["super_admin"],
      },
      { label: "Branches", to: "/admin/branches", icon: Building2, roles: ["super_admin"] },
      { label: "Audit Logs", to: "/admin/audit", icon: History, roles: ["super_admin"] },
      { label: "API Keys", to: "/admin/api-keys", icon: Key, roles: ["super_admin"] },
      { label: "Integrations", to: "/admin/integrations", icon: Plug, roles: ["super_admin"] },
    ],
  },
  {
    header: "Schedule",
    roles: ["super_admin"],
    items: [{ label: "Calendar", to: "/admin/calendar", icon: Clock, roles: ["super_admin"] }],
  },
];

export const NAV_ITEMS: NavItem[] = NAV_SECTIONS.flatMap((s) => s.items);

export function getNavSectionsForRole(role: string): NavSection[] {
  return NAV_SECTIONS.map((section) => ({
    ...section,
    items: section.items.filter(
      (item) =>
        (!section.roles || section.roles.includes(role)) &&
        (!item.roles || item.roles.includes(role)),
    ),
  })).filter((section) => section.items.length > 0);
}

export function getNavItemsForRole(role: string): NavItem[] {
  return getNavSectionsForRole(role).flatMap((s) => s.items);
}
