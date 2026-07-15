import {
  LayoutDashboard, ClipboardList, GraduationCap, Users, Baby, Building2, Wallet,
  BookOpen, PlayCircle, Radio, PenSquare, FileText, CalendarCheck, FileBadge,
  Trophy, Award, IdCard, Library, Bed, Bus, Briefcase, UsersRound, Coins,
  CalendarOff, Layers, Target, Phone, UserPlus, Compass, MessageSquare, Mail,
  Send, Bell, Globe, Newspaper, Image, Megaphone, Star, HelpCircle, Search,
  CreditCard, BarChart3, PieChart, GitBranch, ShieldCheck, KeyRound, Settings,
  History, Database, PlugZap, Sparkles, LifeBuoy, LogOut, Cog, Building,
  UserCog,
} from "lucide-react";

export type NavItem = {
  label: string;
  to?: string;
  icon: React.ComponentType<{ className?: string }>;
  badge?: string;
  children?: { label: string; to: string }[];
};

export type NavSection = { title: string; items: NavItem[] };

export const NAV: NavSection[] = [
  {
    title: "Overview",
    items: [
      { label: "Dashboard", to: "/admin", icon: LayoutDashboard },
      { label: "Admissions", to: "/admin/admissions", icon: ClipboardList, badge: "24" },
      { label: "Students", to: "/admin/students", icon: GraduationCap },
      { label: "Teachers", to: "/admin/teachers", icon: Users },
      { label: "Parents", to: "/admin/parents", icon: Baby },
      { label: "Reception", to: "/admin/reception", icon: Building2 },
      { label: "Accounting", to: "/admin/accounting", icon: Wallet, badge: "₹" },
    ],
  },
  {
    title: "Academics",
    items: [
      { label: "Courses", to: "/admin/courses", icon: BookOpen },
      { label: "LMS", to: "/admin/lms", icon: PlayCircle, badge: "NEW" },
      { label: "Live Classes", to: "/admin/live", icon: Radio },
      { label: "Homework", to: "/admin/homework", icon: PenSquare },
      { label: "Assignments", to: "/admin/assignments", icon: FileText },
      { label: "Attendance", to: "/admin/attendance", icon: CalendarCheck },
      { label: "Examinations", to: "/admin/exams", icon: FileBadge },
      { label: "Results", to: "/admin/results", icon: Trophy },
      { label: "Certificates", to: "/admin/certificates", icon: Award },
      { label: "ID Cards", to: "/admin/id-cards", icon: IdCard },
    ],
  },
  {
    title: "Facilities",
    items: [
      { label: "Library", to: "/admin/library", icon: Library },
      { label: "Hostel", to: "/admin/hostel", icon: Bed },
      { label: "Transport", to: "/admin/transport", icon: Bus },
    ],
  },
  {
    title: "HR",
    items: [
      { label: "Employees", to: "/admin/hr/employees", icon: Briefcase },
      { label: "Payroll", to: "/admin/hr/payroll", icon: Coins },
      { label: "Leaves", to: "/admin/hr/leaves", icon: CalendarOff },
      { label: "Departments", to: "/admin/hr/departments", icon: Layers },
    ],
  },
  {
    title: "CRM",
    items: [
      { label: "Leads", to: "/admin/crm/leads", icon: Target, badge: "142" },
      { label: "Inquiries", to: "/admin/crm/inquiries", icon: Phone },
      { label: "Visitors", to: "/admin/crm/visitors", icon: UserPlus },
      { label: "Counselling", to: "/admin/crm/counselling", icon: Compass },
    ],
  },
  {
    title: "Marketing",
    items: [
      { label: "SMS", to: "/admin/marketing/sms", icon: MessageSquare },
      { label: "Email", to: "/admin/marketing/email", icon: Mail },
      { label: "WhatsApp", to: "/admin/marketing/whatsapp", icon: Send },
      { label: "Push", to: "/admin/marketing/push", icon: Bell },
    ],
  },
  {
    title: "CMS",
    items: [
      { label: "Website", to: "/admin/cms/website", icon: Globe },
      { label: "Hero Banners", to: "/admin/banners", icon: Image },
      { label: "Blogs", to: "/admin/cms/blogs", icon: Newspaper },
      { label: "News & Events", to: "/admin/cms/events", icon: Megaphone },
      { label: "Testimonials", to: "/admin/cms/testimonials", icon: Star },
      { label: "FAQ", to: "/admin/cms/faq", icon: HelpCircle },
      { label: "SEO", to: "/admin/cms/seo", icon: Search },
      { label: "Notices", to: "/admin/notices", icon: Bell },
    ],
  },
  {
    title: "Insights",
    items: [
      { label: "Payments", to: "/admin/payments", icon: CreditCard },
      { label: "Reports", to: "/admin/reports", icon: BarChart3 },
      { label: "Analytics", to: "/admin/analytics", icon: PieChart },
      { label: "Branches", to: "/admin/branches", icon: GitBranch },
    ],
  },
  {
    title: "System",
    items: [
      { label: "Roles", to: "/admin/roles", icon: UserCog },
      { label: "Permissions", to: "/admin/permissions", icon: ShieldCheck },
      { label: "API Keys", to: "/admin/api-keys", icon: KeyRound },
      { label: "Settings", to: "/admin/settings", icon: Settings },
      { label: "Audit Logs", to: "/admin/audit", icon: History },
      { label: "Backup", to: "/admin/backup", icon: Database },
      { label: "Integrations", to: "/admin/integrations", icon: PlugZap },
      { label: "AI Assistant", to: "/admin/ai", icon: Sparkles, badge: "AI" },
      { label: "Support", to: "/admin/support", icon: LifeBuoy },
    ],
  },
];

export const QUICK_ACTIONS = [
  { label: "Add Student", icon: GraduationCap, to: "/admin/students" },
  { label: "Take Attendance", icon: CalendarCheck, to: "/admin/attendance" },
  { label: "Create Exam", icon: FileBadge, to: "/admin/exams" },
  { label: "Upload Notes", icon: BookOpen, to: "/admin/lms" },
  { label: "Send Notice", icon: Bell, to: "/admin/notices" },
  { label: "Collect Fee", icon: Wallet, to: "/admin/accounting" },
  { label: "Certificate", icon: Award, to: "/admin/certificates" },
  { label: "Settings", icon: Cog, to: "/admin/settings" },
];

export { LogOut, Building };
