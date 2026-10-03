import { useLanguage, type Lang } from "@/hooks/use-language";

/**
 * Admin (ERP) strings — English | नेपाली.
 *
 * The public site keeps its own translations in `use-language.ts`; the admin
 * shell, sidebar and dashboards use this dictionary so the whole ERP can be
 * switched between EN and नेपाली without mixing the two inside one screen.
 *
 * Lookup order: this dictionary → the key itself (English labels in `nav.ts`
 * are the canonical keys, so an untranslated key still renders sensibly).
 */
export type AdminLang = "en" | "ne";

const EN: Record<string, string> = {
  /* ── Sidebar / chrome ─────────────────────────────── */
  searchPages: "Search pages...",
  noResultsMatch: "No results match",
  menu: "Menu",
  signOut: "Sign out",
  notifications: "Notifications",
  profile: "Profile",
  Profile: "Profile",
  Admin: "Admin",
  Support: "Support",
  SMS: "SMS",
  Email: "Email",
  "User Management": "User Management",
  "Super Admin": "Super Admin",
  Teacher: "Teacher",
  Student: "Student",
  Parent: "Parent",
  Accountant: "Accountant",
  language: "Language",
  search: "Search...",
  loading: "Loading...",
  noData: "No data yet",
  tryAgain: "Try Again",
  errorLoad: "Unable to load data. Please try again.",
  accessDenied: "Access denied",
  accessDeniedBody:
    "This page isn't available for your role. If you think this is a mistake, contact the administrator.",
  backToDashboard: "Back to dashboard",
  commandSearch: "Search pages, actions...",
  noResultsFound: "No results found",
  caughtUp: "You're all caught up.",
  all: "All",

  /* ── Header ───────────────────────────────────────── */
  goodMorning: "Good morning",
  goodAfternoon: "Good afternoon",
  goodEvening: "Good evening",
  dayLabel: "Day",
  now: "Now",

  /* ── Nav section headers ──────────────────────────── */
  Main: "Main",
  Teaching: "Teaching",
  "People & Communication": "People & Communication",
  Schedule: "Schedule",
  Academics: "Academics",
  "Attendance & Exams": "Attendance & Exams",
  Finance: "Finance",
  Communication: "Communication",
  Overview: "Overview",
  "Student Management": "Student Management",
  "Courses & Study": "Courses & Study",
  Facilities: "Facilities",
  "Reports & Analytics": "Reports & Analytics",
  CRM: "CRM",
  Marketing: "Marketing",
  System: "System",
  Reports: "Reports",
  "Website Content": "Website Content",

  /* ── Nav items ────────────────────────────────────── */
  Dashboard: "Dashboard",
  "My Classes": "My Classes",
  "My Students": "My Students",
  Attendance: "Attendance",
  Assignments: "Assignments",
  Gradebook: "Gradebook",
  Resources: "Resources",
  "Learning Materials": "Learning Materials",
  Examinations: "Examinations",
  Results: "Results",
  Students: "Students",
  Parents: "Parents",
  Messaging: "Messaging",
  "Notices & Events": "Notices & Events",
  Calendar: "Calendar",
  "My Courses": "My Courses",
  "Live Classes": "Live Classes",
  Homework: "Homework",
  Exams: "Exams",
  "Fee Structure": "Fee Structure",
  Payments: "Payments",
  "Support / Help": "Support / Help",
  "Fee Payments": "Fee Payments",
  Accounting: "Accounting",
  Admissions: "Admissions",
  "Courses & Pricing": "Courses & Pricing",
  "Preparation Content": "Preparation Content",
  "Student Cards": "Student Cards",
  Teachers: "Teachers",
  Courses: "Courses",
  LMS: "LMS",
  Hostel: "Hostel",
  Analytics: "Analytics",
  "Hero Slides": "Hero Slides",
  "Feature Slides / Banners": "Feature Slides / Banners",
  "Top Selections": "Top Selections",
  Testimonials: "Testimonials",
  "Why Choose Us": "Why Choose Us",
  "MD Message": "MD Message",
  "Physical Training": "Physical Training",
  "Site Settings": "Site Settings",
  "Stats Bar": "Stats Bar",
  "Course Categories": "Course Categories",
  Faculty: "Faculty",
  Gallery: "Gallery",
  Messages: "Messages",
  "Career Services": "Career Services",
  Advertisements: "Advertisements",
  "Feature Content": "Feature Content",
  "Media Library": "Media Library",
  Inquiries: "Inquiries",
  "SMS Campaigns": "SMS Campaigns",
  "Email Campaigns": "Email Campaigns",
  WhatsApp: "WhatsApp",
  "Push Notifications": "Push Notifications",
  Users: "Users",
  Roles: "Roles",
  Permissions: "Permissions",
  Settings: "Settings",
  "AI Assistant": "AI Assistant",
  Backup: "Backup",
  Branches: "Branches",
  "Audit Logs": "Audit Logs",
  "API Keys": "API Keys",
  Integrations: "Integrations",
  "Feature Slides": "Feature Slides",

  /* ── Dashboard cards ──────────────────────────────── */
  totalStudents: "Total Students",
  totalTeachers: "Total Teachers",
  totalParents: "Total Parents",
  totalClasses: "Total Classes",
  activeStudents: "Active Students",
  revenue: "Revenue",
  admissions: "Admissions",
  activeUsers: "Active Users",
  todayAttendance: "Today's Attendance",
  upcomingExams: "Upcoming Exams",
  pendingFees: "Pending Fees",
  notices: "Notices",
  myClasses: "My Classes",
  myStudents: "My Students",
  myAttendance: "My Attendance",
  myExams: "My Exams",
  myResults: "My Results",
  myFees: "My Fees",
  myClass: "My Class",
  feeStatus: "Fee Status",
  children: "Children",
  passPercentage: "Pass Percentage",
  feeCollection: "Fee Collection",
  pendingDues: "Pending Dues",
  revenueTrend: "Revenue Trend",
  revenueTrendSub: "Monthly revenue over the last 6 months",
  incomeDistribution: "Income Distribution",
  incomeDistributionSub: "Revenue by source",
  recentActivities: "Recent Activities",
  recentActivitiesSub: "Latest actions across the institute",
  pendingApprovals: "Pending Approvals",
  pendingApprovalsSub: "items awaiting review",
  quickManagement: "Quick Management",
  reviewInAdmissions: "Review in Admissions →",
  nothingToShow: "Nothing to show",
  noActivity: "No activity yet",
  manageStudents: "Manage Students",
  viewCollections: "View Collections",
  viewReports: "View Reports",
  addStudent: "Add Student",
  addTeacher: "Add Teacher",
  collectFee: "Collect Fee",
  createNotice: "Create Notice",
  scheduleExam: "Schedule Exam",
  hereToday: "Here is what is happening at Star Coaching Institute today.",
  resultsEmpty: "No records to show yet",

  /* ── Dashboard chrome & panels ────────────────────── */
  loadingDashboard: "Loading dashboard...",
  teacherDashboard: "Teacher Dashboard",
  studentDashboard: "Student Dashboard",
  parentDashboard: "Parent Dashboard",
  accountantDashboard: "Accountant Dashboard",
  adminDashboard: "Admin Dashboard",
  welcomeBackTeacher: "Welcome back, Teacher",
  welcomeBackStudent: "Welcome back, Student",
  welcomeParent: "Welcome, Parent",
  financialOverview: "Financial Overview",
  teacherIntro: "Manage your classes, assignments, and students",
  studentIntro: "Track your courses, attendance, and progress",
  parentIntro: "Monitor your child's progress and school activities",
  accountantIntro: "Track income, expenses, and fee collections",

  todaySchedule: "Today's Schedule",
  todayScheduleSub: "Your classes scheduled for today",
  noClassesToday: "No classes scheduled today",
  upcomingTasks: "Upcoming Tasks",
  tasksSub: "Pending items requiring attention",
  noPendingTasks: "No pending tasks",
  recentActivity: "Recent Activity",
  recentActivitySub: "Latest actions and updates",
  quickActions: "Quick Actions",
  takeAttendance: "Take Attendance",
  uploadNotes: "Upload Notes",
  createAssignment: "Create Assignment",
  sendNotice: "Send Notice",
  due: "Due",
  statusLive: "Live",
  statusUpcoming: "Upcoming",
  statusEnded: "Ended",
  gradeHomework: "Grade Homework",
  prepareExamPaper: "Prepare Exam Paper",

  enrolledCourses: "Enrolled Courses",
  todaysClasses: "Today's Classes",
  todaysClassesSub: "Your schedule for today",
  noUpcomingClasses: "No upcoming classes",
  recentScores: "Recent Scores",
  recentScoresSub: "Your latest exam results",
  noResultsYet: "No results yet",
  quickAccess: "Quick Access",
  studyMaterials: "Study Materials",
  studyMaterialsDesc: "Notes & videos",
  homeworkPendingDesc: "Pending submissions",
  viewResults: "View Results",
  examScores: "Exam scores",
  payFees: "Pay Fees",
  payFeesDesc: "Online payment",
  nextTests: "Next tests scheduled",

  childrenOverview: "Children Overview",
  childrenOverviewSub: "Academic status of your children",
  noChildrenLinked: "No children linked to this account yet",
  attendanceLabel: "Attendance",
  avgScoreLabel: "Avg. Score",
  viewFullReport: "View Full Report →",
  recentUpdates: "Recent Updates",
  recentUpdatesSub: "Your child's activity feed",
  homeworkPend: "Homework Pending",

  todaysCollection: "Today's Collection",
  pendingDuesLabel: "Pending Dues",
  monthlyRev: "Monthly Income",
  monthlyExp: "Monthly Expense",
  incomeVsExpense: "Income vs Expense",
  monthlyComparison: "Monthly comparison",
  net: "Net",
  recentTxns: "Recent Transactions",
  recentTxnsSub: "Latest financial activities",
  noTxns: "No transactions yet",
  feeCollectionStatus: "Fee Collection Status",
  noFeeData: "No fee data yet",
  paidSuffix: "paid",
  targetSuffix: "target",
  recordPayment: "Record Payment",
  invoice: "Invoice",
  addExpense: "Add Expense",
};

const NE: Record<string, string> = {
  /* ── Sidebar / chrome ─────────────────────────────── */
  searchPages: "पृष्ठ खोज्नुहोस्...",
  noResultsMatch: "कुनै नतिजा भेटिएन",
  menu: "मेनु",
  signOut: "लगआउट",
  notifications: "सूचनाहरू",
  profile: "प्रोफाइल",
  Profile: "प्रोफाइल",
  Admin: "प्रशासन",
  Support: "सहायता",
  SMS: "एसएमएस",
  Email: "इमेल",
  "User Management": "प्रयोगकर्ता व्यवस्थापन",
  "Super Admin": "सुपर एड्मिन",
  Teacher: "शिक्षक",
  Student: "विद्यार्थी",
  Parent: "अभिभावक",
  Accountant: "लेखापरीक्षक",
  language: "भाषा",
  search: "खोज्नुहोस्...",
  loading: "लोड हुँदैछ...",
  noData: "अहिले डेटा छैन",
  tryAgain: "पुनः प्रयास गर्नुहोस्",
  errorLoad: "डेटा लोड गर्न सकिएन। कृपया पुनः प्रयास गर्नुहोस्।",
  accessDenied: "पहुँच अस्वीकृत",
  accessDeniedBody:
    "यो पृष्ठ तपाईंको भूमिकाका लागि उपलब्ध छैन। यो गल्ती भएको ठानिएमा प्रशासनलाई सम्पर्क गर्नुहोस्।",
  backToDashboard: "ड्यासबोर्डमा फर्कनुहोस्",
  commandSearch: "पृष्ठ र कार्य खोज्नुहोस्...",
  noResultsFound: "कुनै नतिजा भेटिएन",
  caughtUp: "सबै सूचनाहरू हेरिसक्नुभयो।",
  all: "सबै",

  /* ── Header ───────────────────────────────────────── */
  goodMorning: "शुभ बिहान",
  goodAfternoon: "शुभ दिउँसो",
  goodEvening: "शुभ साँझ",
  dayLabel: "दिन",
  now: "अहिले",

  /* ── Nav section headers ──────────────────────────── */
  Main: "मुख्य",
  Teaching: "शिक्षण",
  "People & Communication": "मानिस र सञ्चार",
  Schedule: "तालिका",
  Academics: "शैक्षिक",
  "Attendance & Exams": "उपस्थिति र परीक्षा",
  Finance: "वित्त",
  Communication: "सञ्चार",
  Overview: "अवलोकन",
  "Student Management": "विद्यार्थी व्यवस्थापन",
  "Courses & Study": "पाठ्यक्रम र अध्ययन",
  Facilities: "सुविधाहरू",
  "Reports & Analytics": "प्रतिवेदन र विश्लेषण",
  CRM: "ग्राहक सम्बन्ध",
  Marketing: "मार्केटिङ",
  System: "प्रणाली",
  Reports: "प्रतिवेदन",
  "Website Content": "वेबसाइट सामग्री",

  /* ── Nav items ────────────────────────────────────── */
  Dashboard: "ड्यासबोर्ड",
  "My Classes": "मेरा कक्षाहरू",
  "My Students": "मेरा विद्यार्थीहरू",
  Attendance: "उपस्थिति",
  Assignments: "कार्यहरू",
  Gradebook: "ग्रेडबुक",
  Resources: "स्रोतहरू",
  "Learning Materials": "अध्ययन सामग्री",
  Examinations: "परीक्षाहरू",
  Results: "नतिजाहरू",
  Students: "विद्यार्थीहरू",
  Parents: "अभिभावकहरू",
  Messaging: "सन्देश",
  "Notices & Events": "सूचना र कार्यक्रम",
  Calendar: "पात्रो",
  "My Courses": "मेरा पाठ्यक्रम",
  "Live Classes": "लाइभ कक्षा",
  Homework: "गृहकार्य",
  Exams: "परीक्षा",
  "Fee Structure": "शुल्क संरचना",
  Payments: "भुक्तानी",
  "Support / Help": "सहायता",
  "Fee Payments": "शुल्क भुक्तानी",
  Accounting: "हिसाब",
  Admissions: "भर्ना",
  "Courses & Pricing": "पाठ्यक्रम र मूल्य",
  "Preparation Content": "तयारी सामग्री",
  "Student Cards": "विद्यार्थी कार्ड",
  Teachers: "शिक्षकहरू",
  Courses: "पाठ्यक्रम",
  LMS: "एलएमएस",
  Hostel: "छात्रावास",
  Analytics: "विश्लेषण",
  "Hero Slides": "मुख्य स्लाइड",
  "Feature Slides / Banners": "विशेष स्लाइड / ब्यानर",
  "Top Selections": "शीर्ष चयन",
  Testimonials: "प्रशंसापत्र",
  "Why Choose Us": "किन छान्ने",
  "MD Message": "प्रबन्ध निर्देशकको सन्देश",
  "Physical Training": "शारीरिक प्रशिक्षण",
  "Site Settings": "साइट सेटिङ",
  "Stats Bar": "तथ्याङ्क पट्टी",
  "Course Categories": "पाठ्यक्रम श्रेणी",
  Faculty: "शिक्षकहरू",
  Gallery: "ग्यालरी",
  Messages: "सन्देशहरू",
  "Career Services": "करियर सेवा",
  Advertisements: "विज्ञापन",
  "Feature Content": "विशेष सामग्री",
  "Media Library": "मिडिया लाइब्रेरी",
  Inquiries: "सोधपुछ",
  "SMS Campaigns": "एसएमएस अभियान",
  "Email Campaigns": "इमेल अभियान",
  WhatsApp: "व्हाट्सएप",
  "Push Notifications": "पुश सूचना",
  Users: "प्रयोगकर्ता",
  Roles: "भूमिका",
  Permissions: "अनुमतिहरू",
  Settings: "सेटिङ",
  "AI Assistant": "एआई सहायक",
  Backup: "ब्याकअप",
  Branches: "शाखाहरू",
  "Audit Logs": "अडिट लग",
  "API Keys": "एपीआई कुञ्जी",
  Integrations: "एकीकरण",
  "Feature Slides": "विशेष स्लाइड",

  /* ── Dashboard cards ──────────────────────────────── */
  totalStudents: "कुल विद्यार्थी",
  totalTeachers: "कुल शिक्षक",
  totalParents: "कुल अभिभावक",
  totalClasses: "कुल कक्षा",
  activeStudents: "सक्रिय विद्यार्थी",
  revenue: "आम्दानी",
  admissions: "भर्ना",
  activeUsers: "सक्रिय प्रयोगकर्ता",
  todayAttendance: "आजको उपस्थिति",
  upcomingExams: "आगामी परीक्षा",
  pendingFees: "बाँकी शुल्क",
  notices: "सूचनाहरू",
  myClasses: "मेरा कक्षाहरू",
  myStudents: "मेरा विद्यार्थी",
  myAttendance: "मेरो उपस्थिति",
  myExams: "मेरा परीक्षा",
  myResults: "मेरा नतिजा",
  myFees: "मेरो शुल्क",
  myClass: "मेरो कक्षा",
  feeStatus: "शुल्क स्थिति",
  children: "सन्तानहरू",
  passPercentage: "उत्तीर्ण प्रतिशत",
  feeCollection: "शुल्क सङ्कलन",
  pendingDues: "बाँकी रकम",
  revenueTrend: "आम्दानी प्रवृत्ति",
  revenueTrendSub: "पछिल्ला ६ महिनाको मासिक आम्दानी",
  incomeDistribution: "आम्दानी वितरण",
  incomeDistributionSub: "स्रोत अनुसार आम्दानी",
  recentActivities: "हालका गतिविधि",
  recentActivitiesSub: "संस्थाभरका नवीनतम कार्य",
  pendingApprovals: "बाँकी स्वीकृति",
  pendingApprovalsSub: "समीक्षाका लागि बाँकी",
  quickManagement: "छिटो व्यवस्थापन",
  reviewInAdmissions: "भर्नामा समीक्षा गर्नुहोस् →",
  nothingToShow: "केही देखाउन छैन",
  noActivity: "अहिले कुनै गतिविधि छैन",
  manageStudents: "विद्यार्थी व्यवस्थापन",
  viewCollections: "सङ्कलन हेर्नुहोस्",
  viewReports: "प्रतिवेदन हेर्नुहोस्",
  addStudent: "विद्यार्थी थप्नुहोस्",
  addTeacher: "शिक्षक थप्नुहोस्",
  collectFee: "शुल्क लिनुहोस्",
  createNotice: "सूचना बनाउनुहोस्",
  scheduleExam: "परीक्षा तोक्नुहोस्",
  hereToday: "आज स्टार कोचिङ इन्स्टियुटमा के भइरहेको छ यहाँ हेर्नुहोस्।",
  resultsEmpty: "अहिले कुनै रेकर्ड छैन",

  /* ── Dashboard chrome & panels ────────────────────── */
  loadingDashboard: "ड्यासबोर्ड लोड हुँदैछ...",
  teacherDashboard: "शिक्षक ड्यासबोर्ड",
  studentDashboard: "विद्यार्थी ड्यासबोर्ड",
  parentDashboard: "अभिभावक ड्यासबोर्ड",
  accountantDashboard: "लेखापरीक्षक ड्यासबोर्ड",
  adminDashboard: "प्रशासन ड्यासबोर्ड",
  welcomeBackTeacher: "फेरि स्वागत छ, शिक्षक",
  welcomeBackStudent: "फेरि स्वागत छ, विद्यार्थी",
  welcomeParent: "स्वागत छ, अभिभावक",
  financialOverview: "वित्तीय अवलोकन",
  teacherIntro: "आफ्ना कक्षा, कार्य र विद्यार्थीहरू व्यवस्थापन गर्नुहोस्",
  studentIntro: "आफ्ना पाठ्यक्रम, उपस्थिति र प्रगति हेर्नुहोस्",
  parentIntro: "आफ्ना सन्तानको प्रगति र विद्यालय गतिविधि हेर्नुहोस्",
  accountantIntro: "आय, खर्च र शुल्क सङ्कलन हेर्नुहोस्",

  todaySchedule: "आजको तालिका",
  todayScheduleSub: "आजका आफ्ना कक्षाहरू",
  noClassesToday: "आज कुनै कक्षा तोकिएको छैन",
  upcomingTasks: "आउने कार्यहरू",
  tasksSub: "ध्यान दिनुपर्ने बाँकी कामहरू",
  noPendingTasks: "कुनै बाँकी काम छैन",
  recentActivity: "हालका गतिविधि",
  recentActivitySub: "नवीनतम कार्य र अद्यावधिक",
  quickActions: "छिटो कार्यहरू",
  takeAttendance: "उपस्थिति लिनुहोस्",
  uploadNotes: "नोट अपलोड",
  createAssignment: "कार्य बनाउनुहोस्",
  sendNotice: "सूचना पठाउनुहोस्",
  due: "गर्नुपर्ने",
  statusLive: "चालु",
  statusUpcoming: "आउने",
  statusEnded: "सकियो",
  gradeHomework: "गृहकार्य मूल्याङ्कन",
  prepareExamPaper: "परीक्षा पत्र तयार गर्नुहोस्",

  enrolledCourses: "भर्ना भएका पाठ्यक्रम",
  todaysClasses: "आजका कक्षाहरू",
  todaysClassesSub: "आजको तिम्रो तालिका",
  noUpcomingClasses: "कुनै कक्षा आउँदैन",
  recentScores: "हालका नम्बरहरू",
  recentScoresSub: "तिम्रा नवीनतम परीक्षा नतिजा",
  noResultsYet: "अहिले नतिजा छैन",
  quickAccess: "छिटो पहुँच",
  studyMaterials: "अध्ययन सामग्री",
  studyMaterialsDesc: "नोट र भिडियो",
  homeworkPendingDesc: "बाँकी पेश गर्नुपर्ने",
  viewResults: "नतिजा हेर्नुहोस्",
  examScores: "परीक्षा नम्बर",
  payFees: "शुल्क तिर्नुहोस्",
  payFeesDesc: "अनलाइन भुक्तानी",
  nextTests: "आउने परीक्षाहरू",

  childrenOverview: "सन्तानको अवलोकन",
  childrenOverviewSub: "तपाईंका सन्तानहरूको शैक्षिक स्थिति",
  noChildrenLinked: "यो खातामा अझै सन्तान जोडिएको छैन",
  attendanceLabel: "उपस्थिति",
  avgScoreLabel: "औसत नम्बर",
  viewFullReport: "पूरा प्रतिवेदन हेर्नुहोस् →",
  recentUpdates: "हालका अद्यावधिक",
  recentUpdatesSub: "तपाईंका सन्तानको गतिविधि",
  homeworkPend: "बाँकी गृहकार्य",

  todaysCollection: "आजको सङ्कलन",
  pendingDuesLabel: "बाँकी रकम",
  monthlyRev: "मासिक आय",
  monthlyExp: "मासिक खर्च",
  incomeVsExpense: "आय बनाम खर्च",
  monthlyComparison: "मासिक तुलना",
  net: "शुद्ध",
  recentTxns: "हालका लेनदेन",
  recentTxnsSub: "नवीनतम वित्तीय गतिविधि",
  noTxns: "अहिले कुनै लेनदेन छैन",
  feeCollectionStatus: "शुल्क सङ्कलन स्थिति",
  noFeeData: "अहिले शुल्क डेटा छैन",
  paidSuffix: "तिरिएको",
  targetSuffix: "लक्ष्य",
  recordPayment: "भुक्तानी दर्ता",
  invoice: "बीजक",
  addExpense: "खर्च थप्नुहोस्",
};

export const ADMIN_STRINGS: Record<AdminLang, Record<string, string>> = { en: EN, ne: NE };

/** Resolve an admin label for the active language (falls back to the key). */
export function adminString(lang: AdminLang, key: string): string {
  return ADMIN_STRINGS[lang]?.[key] ?? key;
}

export function toAdminLang(lang: Lang): AdminLang {
  return lang === "ne" ? "ne" : "en";
}

/**
 * `lang` (admin-normalised: only en/ne), `setLang`, and `t(key)`.
 * Reads the shared `app_lang` preference so the admin and the public site
 * always agree.
 */
export function useAdminT() {
  const { lang, setLang } = useLanguage();
  const adminLang = toAdminLang(lang);
  return {
    lang: adminLang,
    setLang: (l: AdminLang) => setLang(l),
    t: (key: string) => adminString(adminLang, key),
  };
}

/* ── Nepali / English date-time vocabulary ───────────────────── */

export const NE_DAYS = [
  "आइतबार",
  "सोमबार",
  "मंगलबार",
  "बुधबार",
  "बिहीबार",
  "शुक्रबार",
  "शनिबार",
] as const;

export const NE_MONTHS = [
  "जनवरी",
  "फेब्रुअरी",
  "मार्च",
  "अप्रिल",
  "मे",
  "जुन",
  "जुलाई",
  "अगस्ट",
  "सेप्टेम्बर",
  "अक्टोबर",
  "नोभेम्बर",
  "डिसेम्बर",
] as const;

export const NE_PERIODS = ["रात", "बिहान", "दिउँसो", "साँझ"] as const;

const DEVANAGARI_DIGITS = ["०", "१", "२", "३", "४", "५", "६", "७", "८", "९"];

/** 0–9 → ०–९ */
export function toDevanagari(input: string | number): string {
  return String(input).replace(/[0-9]/g, (d) => DEVANAGARI_DIGITS[Number(d)]);
}

const pad = (n: number) => String(n).padStart(2, "0");

export interface ClockParts {
  /** "Friday" / "शुक्रबार" */
  weekday: string;
  /** "03 October 2026" / "०३ अक्टोबर २०२६" */
  date: string;
  /** "10:34 AM" / "१०:३४ बिहान" */
  time: string;
  /** Combined line for compact headers */
  full: string;
}

/** Build day / date / time strings for a moment in the given language. */
export function formatClock(now: Date, lang: AdminLang): ClockParts {
  if (lang === "ne") {
    const weekday = NE_DAYS[now.getDay()];
    const date = `${toDevanagari(pad(now.getDate()))} ${NE_MONTHS[now.getMonth()]} ${toDevanagari(
      now.getFullYear(),
    )}`;
    let h = now.getHours();
    const period = NE_PERIODS[h < 4 ? 0 : h < 12 ? 1 : h < 17 ? 2 : 3];
    h = h % 12 || 12;
    const time = `${toDevanagari(pad(h))}:${toDevanagari(pad(now.getMinutes()))} ${period}`;
    return { weekday, date, time, full: `${weekday}, ${date}` };
  }

  const weekday = now.toLocaleDateString("en-GB", { weekday: "long" });
  const date = now.toLocaleDateString("en-GB", {
    day: "2-digit",
    month: "long",
    year: "numeric",
  });
  const time = now
    .toLocaleTimeString("en-US", { hour: "2-digit", minute: "2-digit", hour12: true })
    .replace(/\u202f/g, " ");
  return { weekday, date, time, full: `${weekday}, ${date}` };
}

/** "03 Oct 2026" — short, human date for rows/records. */
export function shortDate(value: string | number | Date | undefined | null): string {
  if (!value) return "—";
  const d = value instanceof Date ? value : new Date(value);
  if (Number.isNaN(d.getTime())) return String(value).slice(0, 10);
  return d.toLocaleDateString("en-GB", { day: "2-digit", month: "short", year: "numeric" });
}
