import { motion } from "framer-motion";
import { Link } from "react-router-dom";
import {
  GraduationCap,
  Users,
  Baby,
  Wallet,
  CalendarCheck,
  TrendingUp,
  TrendingDown,
  ChevronRight,
  ArrowRight,
  UserPlus,
  FileBadge,
  Bell,
  BookOpen,
  Clock,
  AlertCircle,
  CheckCircle2,
  Circle,
  Calendar,
  Star,
  Zap,
  Eye,
} from "lucide-react";
import {
  AreaChart,
  Area,
  PieChart,
  Pie,
  Cell,
  ResponsiveContainer,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
} from "recharts";

/* ─── animation variants ─── */
const stagger = {
  hidden: { opacity: 0 },
  show: { opacity: 1, transition: { staggerChildren: 0.06 } },
};
const fadeUp = {
  hidden: { opacity: 0, y: 24 },
  show: { opacity: 1, y: 0, transition: { duration: 0.45, ease: "easeOut" as const } },
};
const fadeIn = {
  hidden: { opacity: 0, scale: 0.97 },
  show: { opacity: 1, scale: 1, transition: { duration: 0.4 } },
};

/* ─── demo data ─── */
const statsData = [
  {
    label: "Students",
    value: "2,540",
    icon: GraduationCap,
    change: "+12%",
    positive: true,
    progress: 85,
    desc: "Total enrolled students",
  },
  {
    label: "Teachers",
    value: "128",
    icon: Users,
    change: "+4%",
    positive: true,
    progress: 72,
    desc: "Active faculty members",
  },
  {
    label: "Parents",
    value: "1,890",
    icon: Baby,
    change: "+8%",
    positive: true,
    progress: 78,
    desc: "Registered parents",
  },
  {
    label: "Revenue",
    value: "₹45.6L",
    icon: Wallet,
    change: "+22%",
    positive: true,
    progress: 92,
    desc: "Total collections this year",
  },
  {
    label: "Attendance",
    value: "94%",
    icon: CalendarCheck,
    change: "+2%",
    positive: true,
    progress: 94,
    desc: "Overall attendance rate",
  },
];

const admissionTrend = [
  { month: "Apr", applications: 34, approved: 28 },
  { month: "May", applications: 42, approved: 36 },
  { month: "Jun", applications: 55, approved: 48 },
  { month: "Jul", applications: 48, approved: 40 },
  { month: "Aug", applications: 62, approved: 54 },
  { month: "Sep", applications: 74, approved: 65 },
  { month: "Oct", applications: 88, approved: 78 },
  { month: "Nov", applications: 95, approved: 84 },
  { month: "Dec", applications: 112, approved: 98 },
];

const studentDistribution = [
  { name: "Police Prep", value: 35, color: "#1E3A8A" },
  { name: "Loksewa", value: 25, color: "#EF4444" },
  { name: "Medical", value: 18, color: "#22C55E" },
  { name: "Banking", value: 12, color: "#FBBF24" },
  { name: "Engineering", value: 10, color: "#8b5cf6" },
];

const quickActions = [
  { label: "Add Student", icon: UserPlus, to: "/admin/students", color: "#1E3A8A" },
  { label: "Take Attendance", icon: CalendarCheck, to: "/admin/attendance", color: "#22C55E" },
  { label: "Create Exam", icon: FileBadge, to: "/admin/exams", color: "#FBBF24" },
  { label: "Upload Notes", icon: BookOpen, to: "/admin/lms", color: "#1E3A8A" },
  { label: "Send Notice", icon: Bell, to: "/admin/notices", color: "#EF4444" },
  { label: "Collect Fee", icon: Wallet, to: "/admin/accounting", color: "#1E3A8A" },
];

const pendingHomework = [
  {
    subject: "Mathematics",
    title: "Quadratic Equations - Exercise 4.2",
    due: "Today",
    status: "urgent",
  },
  { subject: "Physics", title: "Newton's Laws Worksheet", due: "Tomorrow", status: "upcoming" },
  { subject: "English", title: "Essay: Environmental Pollution", due: "Dec 20", status: "normal" },
  { subject: "Chemistry", title: "Periodic Table Revision Notes", due: "Dec 22", status: "normal" },
];

const upcomingExams = [
  { subject: "Mathematics", date: "Dec 18, 2025", time: "10:00 AM", type: "Unit Test" },
  { subject: "Physics", date: "Dec 20, 2025", time: "02:00 PM", type: "Mid Term" },
  { subject: "English", date: "Dec 23, 2025", time: "10:00 AM", type: "Assignment" },
  { subject: "Chemistry", date: "Dec 27, 2025", time: "09:30 AM", type: "Final Exam" },
];

const recentAdmissions = [
  { name: "Aarav Sharma", course: "Police Prep", date: "Dec 15", status: "confirmed" },
  { name: "Priya Patel", course: "Loksewa", date: "Dec 14", status: "confirmed" },
  { name: "Rohan Thapa", course: "Medical", date: "Dec 14", status: "pending" },
  { name: "Sneha Gurung", course: "Banking", date: "Dec 13", status: "confirmed" },
  { name: "Kiran Rai", course: "Engineering", date: "Dec 12", status: "confirmed" },
];

const latestNotices = [
  { date: "Dec 15", category: "Exam", title: "Mid-term exam schedule has been published" },
  { date: "Dec 14", category: "Event", title: "Annual sports day on December 28th" },
  { date: "Dec 12", category: "Holiday", title: "Winter vacation from Dec 25 to Jan 2" },
];

const calendarEvents = [
  { date: "Dec 18", title: "Math Unit Test", color: "#1E3A8A" },
  { date: "Dec 20", title: "Physics Mid Term", color: "#EF4444" },
  { date: "Dec 25", title: "Winter Vacation Starts", color: "#EF4444" },
  { date: "Dec 28", title: "Annual Sports Day", color: "#22C55E" },
];

const activityTimeline = [
  { time: "2 min ago", text: "New student Aarav Sharma enrolled in Police Prep", color: "#1E3A8A" },
  {
    time: "15 min ago",
    text: "Fee payment of ₹12,500 received from Priya Patel",
    color: "#22C55E",
  },
  { time: "1 hour ago", text: "Attendance marked for Batch A - 94% present", color: "#1E3A8A" },
  { time: "2 hours ago", text: "New notice published: Mid-term exam schedule", color: "#FBBF24" },
  {
    time: "3 hours ago",
    text: "Teacher Rajesh Kumar uploaded new study material",
    color: "#1E3A8A",
  },
  { time: "5 hours ago", text: "Exam results published for November mock test", color: "#EF4444" },
  { time: "Yesterday", text: "15 new parent accounts registered", color: "#1E3A8A" },
  { time: "Yesterday", text: "Monthly revenue report generated - ₹45.6L", color: "#22C55E" },
  { time: "2 days ago", text: "Library book inventory updated - 1,240 books", color: "#FBBF24" },
];

const topCourses = [
  { name: "Police Preparation", count: 892, color: "#1E3A8A" },
  { name: "Loksewa Prep", count: 642, color: "#EF4444" },
  { name: "Medical Entrance", count: 456, color: "#22C55E" },
  { name: "Banking Exam", count: 310, color: "#FBBF24" },
  { name: "Engineering", count: 240, color: "#8b5cf6" },
];

const recentPayments = [
  { name: "Priya Patel", amount: "₹12,500", time: "15 min ago" },
  { name: "Aarav Sharma", amount: "₹15,000", time: "2 hours ago" },
  { name: "Sneha Gurung", amount: "₹10,000", time: "5 hours ago" },
];

/* ─── helper: greeting ─── */
function getGreeting() {
  const h = new Date().getHours();
  if (h < 12) return "Good Morning";
  if (h < 17) return "Good Afternoon";
  return "Good Evening";
}

function getFormattedDate() {
  return new Date().toLocaleDateString("en-US", {
    weekday: "long",
    year: "numeric",
    month: "long",
    day: "numeric",
  });
}

/* ─── reusable: stat card colors ─── */
const statColors: Record<string, { bg: string; ring: string; text: string }> = {
  Students: { bg: "bg-navy/5", ring: "ring-navy/20", text: "text-navy" },
  Teachers: { bg: "bg-brand-red/5", ring: "ring-brand-red/20", text: "text-brand-red" },
  Parents: { bg: "bg-emerald-50", ring: "ring-emerald-200", text: "text-emerald-600" },
  Revenue: { bg: "bg-gold/5", ring: "ring-gold/20", text: "text-amber-600" },
  Attendance: { bg: "bg-navy/5", ring: "ring-navy/20", text: "text-navy" },
};

/* ─── custom chart tooltip ─── */
interface TooltipPayload {
  dataKey: string;
  name: string;
  value: number;
  color: string;
}

function ChartTooltip({
  active,
  payload,
  label,
}: {
  active?: boolean;
  payload?: TooltipPayload[];
  label?: string;
}) {
  if (!active || !payload?.length) return null;
  return (
    <div className="rounded-xl border border-gray-200 bg-white px-4 py-3 shadow-lg">
      <p className="text-xs font-semibold text-gray-500 mb-1">{label}</p>
      {payload.map((p) => (
        <p key={p.dataKey} className="text-sm font-bold" style={{ color: p.color }}>
          {p.name}: {p.value}
        </p>
      ))}
    </div>
  );
}

/* ─── MAIN COMPONENT ─── */
export function Dashboard() {
  const attendancePresent = 2388;
  const attendanceAbsent = 98;
  const attendanceLate = 54;
  const attendanceTotal = 2540;
  const attendancePercent = 94;

  const feeTarget = 5000000;
  const feeCollected = 4560000;
  const feePercent = Math.round((feeCollected / feeTarget) * 100);

  return (
    <div className="min-h-screen space-y-6 pb-10">
      {/* ═══════ 1. WELCOME HERO ═══════ */}
      <motion.section
        initial={{ opacity: 0, y: -16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, ease: "easeOut" }}
        className="relative overflow-hidden rounded-3xl p-8 md:p-10"
        style={{
          background: "linear-gradient(135deg, #1E3A8A 0%, #1E3A8A 50%, #1E3A8A 100%)",
        }}
      >
        {/* decorative blobs */}
        <div className="pointer-events-none absolute -right-20 -top-20 h-72 w-72 rounded-full bg-gold/10 blur-3xl" />
        <div className="pointer-events-none absolute -bottom-16 -left-16 h-56 w-56 rounded-full bg-brand-red/10 blur-3xl" />
        <div className="pointer-events-none absolute right-1/3 bottom-0 h-40 w-40 rounded-full bg-navy/20 blur-2xl" />

        <div className="relative z-10">
          <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-6">
            <div>
              <motion.h1
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.15, duration: 0.5 }}
                className="text-3xl md:text-4xl font-extrabold text-white leading-tight"
              >
                {getGreeting()}, Welcome back <span className="text-amber-300">Administrator</span>
              </motion.h1>
              <motion.p
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.3 }}
                className="mt-2 text-white/80 text-base md:text-lg"
              >
                Here's what's happening at your institute today
              </motion.p>
              <motion.p
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.35 }}
                className="mt-1 text-white/60 text-sm flex items-center gap-2"
              >
                <Calendar className="w-4 h-4" />
                {getFormattedDate()}
              </motion.p>
            </div>

            {/* quick action buttons */}
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.35, duration: 0.5 }}
              className="flex flex-wrap gap-3"
            >
              {[
                {
                  label: "New Admission",
                  icon: UserPlus,
                  to: "/admin/admissions",
                  bg: "bg-white/20 hover:bg-white/30",
                },
                {
                  label: "Add Student",
                  icon: GraduationCap,
                  to: "/admin/students",
                  bg: "bg-white/20 hover:bg-white/30",
                },
                {
                  label: "Collect Fee",
                  icon: Wallet,
                  to: "/admin/accounting",
                  bg: "bg-amber-400/30 hover:bg-amber-400/40 text-amber-50",
                },
                {
                  label: "View Reports",
                  icon: Eye,
                  to: "/admin/reports",
                  bg: "bg-white/15 hover:bg-white/25",
                },
              ].map((a) => (
                <Link
                  key={a.label}
                  to={a.to}
                  className={`${a.bg} text-white text-sm font-semibold px-5 py-2.5 rounded-xl flex items-center gap-2 transition-all duration-200 backdrop-blur-sm hover:scale-105 hover:shadow-lg active:scale-95`}
                >
                  <a.icon className="w-4 h-4" />
                  {a.label}
                </Link>
              ))}
            </motion.div>
          </div>
        </div>
      </motion.section>

      {/* ═══════ 2. STATS CARDS ═══════ */}
      <motion.div
        variants={stagger}
        initial="hidden"
        animate="show"
        className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4"
      >
        {statsData.map((stat) => {
          const Icon = stat.icon;
          const colors = statColors[stat.label] || statColors.Students;
          return (
            <motion.div
              key={stat.label}
              variants={fadeUp}
              whileHover={{ y: -6, boxShadow: "0 20px 40px -12px rgba(0,0,0,0.12)" }}
              className="ap-card p-5 flex flex-col gap-3 cursor-pointer group"
            >
              <div className="flex items-start justify-between">
                <div
                  className={`w-12 h-12 rounded-2xl ${colors.bg} ring-1 ${colors.ring} flex items-center justify-center transition-transform group-hover:scale-110`}
                >
                  <Icon className={`w-6 h-6 ${colors.text}`} />
                </div>
                <span
                  className={`text-xs font-bold px-2.5 py-1 rounded-lg flex items-center gap-0.5 ${
                    stat.positive ? "bg-emerald-50 text-emerald-600" : "bg-red-50 text-red-600"
                  }`}
                >
                  {stat.positive ? (
                    <TrendingUp className="w-3 h-3" />
                  ) : (
                    <TrendingDown className="w-3 h-3" />
                  )}
                  {stat.change}
                </span>
              </div>
              <div>
                <p className="text-sm text-gray-500 font-medium">{stat.label}</p>
                <p className="text-2xl font-extrabold text-gray-900 mt-0.5">{stat.value}</p>
                <p className="text-xs text-gray-400 mt-0.5">{stat.desc}</p>
              </div>
              <div className="mt-auto">
                <div className="w-full h-1.5 bg-gray-100 rounded-full overflow-hidden">
                  <motion.div
                    initial={{ width: 0 }}
                    animate={{ width: `${stat.progress}%` }}
                    transition={{ delay: 0.5, duration: 0.8, ease: "easeOut" }}
                    className="h-full rounded-full"
                    style={{
                      background: `linear-gradient(90deg, ${colors.text.includes("navy") ? "#1E3A8A" : colors.text.includes("brand-red") ? "#EF4444" : colors.text.includes("emerald") ? "#22C55E" : colors.text.includes("amber") ? "#FBBF24" : "#EF4444"}, ${colors.text.includes("navy") ? "#1E3A8A" : colors.text.includes("brand-red") ? "#EF4444" : colors.text.includes("emerald") ? "#4ADE80" : colors.text.includes("amber") ? "#FBBF24" : "#F87171"})`,
                    }}
                  />
                </div>
                <div className="flex items-center justify-between mt-2">
                  <p className="text-[11px] text-gray-400 font-medium">{stat.progress}% complete</p>
                  <Link
                    to="/admin/students"
                    className="text-[11px] font-semibold text-navy hover:text-navy/80 flex items-center gap-0.5 transition-colors"
                  >
                    View Details <ChevronRight className="w-3 h-3" />
                  </Link>
                </div>
              </div>
            </motion.div>
          );
        })}
      </motion.div>

      {/* ═══════ 3. CHARTS ROW ═══════ */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
        {/* Admission Trends – Area Chart */}
        <motion.div
          variants={fadeUp}
          initial="hidden"
          whileInView="show"
          viewport={{ once: true }}
          className="lg:col-span-2 ap-card p-6"
        >
          <div className="flex items-center justify-between mb-6">
            <div>
              <h3 className="text-lg font-bold text-gray-900">Admission Trends</h3>
              <p className="text-sm text-gray-400 mt-0.5">
                Applications vs Approved (last 9 months)
              </p>
            </div>
            <div className="flex items-center gap-4 text-xs font-medium">
              <span className="flex items-center gap-1.5">
                <span className="w-2.5 h-2.5 rounded-full bg-navy" /> Applications
              </span>
              <span className="flex items-center gap-1.5">
                <span className="w-2.5 h-2.5 rounded-full bg-emerald-500" /> Approved
              </span>
            </div>
          </div>
          <div className="h-72">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={admissionTrend} margin={{ top: 5, right: 10, left: -10, bottom: 0 }}>
                <defs>
                  <linearGradient id="gradApplications" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="#1E3A8A" stopOpacity={0.25} />
                    <stop offset="95%" stopColor="#1E3A8A" stopOpacity={0} />
                  </linearGradient>
                  <linearGradient id="gradApproved" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="#22C55E" stopOpacity={0.2} />
                    <stop offset="95%" stopColor="#22C55E" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#F1F5F9" />
                <XAxis
                  dataKey="month"
                  axisLine={false}
                  tickLine={false}
                  tick={{ fontSize: 12, fill: "#9CA3AF" }}
                />
                <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: "#9CA3AF" }} />
                <Tooltip content={<ChartTooltip />} />
                <Area
                  type="monotone"
                  dataKey="applications"
                  name="Applications"
                  stroke="#1E3A8A"
                  strokeWidth={2.5}
                  fill="url(#gradApplications)"
                />
                <Area
                  type="monotone"
                  dataKey="approved"
                  name="Approved"
                  stroke="#22C55E"
                  strokeWidth={2.5}
                  fill="url(#gradApproved)"
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </motion.div>

        {/* Student Distribution – Pie Chart */}
        <motion.div
          variants={fadeUp}
          initial="hidden"
          whileInView="show"
          viewport={{ once: true }}
          className="ap-card p-6"
        >
          <div className="mb-4">
            <h3 className="text-lg font-bold text-gray-900">Student Distribution</h3>
            <p className="text-sm text-gray-400 mt-0.5">By course category</p>
          </div>
          <div className="h-52">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={studentDistribution}
                  cx="50%"
                  cy="50%"
                  innerRadius={55}
                  outerRadius={90}
                  paddingAngle={4}
                  dataKey="value"
                  stroke="none"
                >
                  {studentDistribution.map((entry, i) => (
                    <Cell key={i} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip
                  content={({ active, payload }) => {
                    if (!active || !payload?.length) return null;
                    const d = payload[0].payload;
                    return (
                      <div className="rounded-xl border border-gray-200 bg-white px-4 py-3 shadow-lg">
                        <p className="text-sm font-bold" style={{ color: d.color }}>
                          {d.name}
                        </p>
                        <p className="text-xs text-gray-500 mt-0.5">{d.value}% of students</p>
                      </div>
                    );
                  }}
                />
              </PieChart>
            </ResponsiveContainer>
          </div>
          <div className="space-y-2.5 mt-2">
            {studentDistribution.map((d) => (
              <div key={d.name} className="flex items-center justify-between text-sm">
                <span className="flex items-center gap-2">
                  <span
                    className="w-2.5 h-2.5 rounded-full shrink-0"
                    style={{ background: d.color }}
                  />
                  <span className="text-gray-600 font-medium">{d.name}</span>
                </span>
                <span className="font-bold text-gray-900">{d.value}%</span>
              </div>
            ))}
          </div>
        </motion.div>
      </div>

      {/* ═══════ 4. WIDGETS GRID ═══════ */}
      <motion.div
        variants={stagger}
        initial="hidden"
        whileInView="show"
        viewport={{ once: true, margin: "-50px" }}
        className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-5"
      >
        {/* ── Today's Attendance ── */}
        <motion.div variants={fadeUp} className="ap-card p-6">
          <h4 className="text-sm font-bold text-gray-900 mb-4 flex items-center gap-2">
            <CalendarCheck className="w-4 h-4 text-navy" />
            Today's Attendance
          </h4>
          <div className="flex items-center gap-5">
            <div className="relative w-24 h-24 shrink-0">
              <svg viewBox="0 0 100 100" className="w-full h-full -rotate-90">
                <circle cx="50" cy="50" r="42" fill="none" stroke="#F1F5F9" strokeWidth="8" />
                <motion.circle
                  cx="50"
                  cy="50"
                  r="42"
                  fill="none"
                  stroke="#1E3A8A"
                  strokeWidth="8"
                  strokeLinecap="round"
                  strokeDasharray={2 * Math.PI * 42}
                  initial={{ strokeDashoffset: 2 * Math.PI * 42 }}
                  animate={{ strokeDashoffset: 2 * Math.PI * 42 * (1 - attendancePercent / 100) }}
                  transition={{ delay: 0.5, duration: 1, ease: "easeOut" }}
                />
              </svg>
              <div className="absolute inset-0 flex flex-col items-center justify-center">
                <span className="text-xl font-extrabold text-gray-900">{attendancePercent}%</span>
                <span className="text-[10px] text-gray-400 font-medium">Present</span>
              </div>
            </div>
            <div className="space-y-2 text-sm flex-1">
              <div className="flex items-center justify-between">
                <span className="flex items-center gap-1.5 text-gray-500">
                  <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500" /> Present
                </span>
                <span className="font-bold text-gray-900">{attendancePresent}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="flex items-center gap-1.5 text-gray-500">
                  <AlertCircle className="w-3.5 h-3.5 text-red-500" /> Absent
                </span>
                <span className="font-bold text-gray-900">{attendanceAbsent}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="flex items-center gap-1.5 text-gray-500">
                  <Clock className="w-3.5 h-3.5 text-amber-500" /> Late
                </span>
                <span className="font-bold text-gray-900">{attendanceLate}</span>
              </div>
            </div>
          </div>
        </motion.div>

        {/* ── Pending Homework ── */}
        <motion.div variants={fadeUp} className="ap-card p-6">
          <h4 className="text-sm font-bold text-gray-900 mb-4 flex items-center gap-2">
            <BookOpen className="w-4 h-4 text-navy" />
            Pending Homework
          </h4>
          <div className="space-y-3">
            {pendingHomework.map((hw, i) => (
              <div
                key={i}
                className="flex items-start gap-3 p-2.5 rounded-xl bg-gray-50/80 hover:bg-gray-100/80 transition-colors"
              >
                <Circle
                  className="w-2 h-2 mt-1.5 shrink-0"
                  style={{
                    fill:
                      hw.status === "urgent"
                        ? "#EF4444"
                        : hw.status === "upcoming"
                          ? "#F59E0B"
                          : "#22C55E",
                    stroke:
                      hw.status === "urgent"
                        ? "#EF4444"
                        : hw.status === "upcoming"
                          ? "#F59E0B"
                          : "#22C55E",
                  }}
                />
                <div className="flex-1 min-w-0">
                  <p className="text-xs font-bold text-gray-900 truncate">{hw.title}</p>
                  <div className="flex items-center gap-2 mt-1">
                    <span className="text-[11px] text-gray-400">{hw.subject}</span>
                    <span className="text-[11px] text-gray-300">·</span>
                    <span
                      className={`text-[11px] font-semibold ${
                        hw.status === "urgent"
                          ? "text-red-500"
                          : hw.status === "upcoming"
                            ? "text-amber-500"
                            : "text-gray-400"
                      }`}
                    >
                      {hw.due}
                    </span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </motion.div>

        {/* ── Upcoming Exams ── */}
        <motion.div variants={fadeUp} className="ap-card p-6">
          <h4 className="text-sm font-bold text-gray-900 mb-4 flex items-center gap-2">
            <FileBadge className="w-4 h-4 text-amber-500" />
            Upcoming Exams
          </h4>
          <div className="space-y-3">
            {upcomingExams.map((ex, i) => (
              <div
                key={i}
                className="flex items-start gap-3 p-2.5 rounded-xl bg-gray-50/80 hover:bg-gray-100/80 transition-colors"
              >
                <div className="w-10 h-10 rounded-xl bg-navy/10 flex items-center justify-center shrink-0">
                  <FileBadge className="w-4 h-4 text-navy" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-xs font-bold text-gray-900">{ex.subject}</p>
                  <div className="flex items-center gap-2 mt-1">
                    <span className="text-[11px] text-gray-400">{ex.date}</span>
                    <span className="text-[11px] text-gray-300">·</span>
                    <span className="text-[11px] text-gray-400">{ex.time}</span>
                  </div>
                  <span className="inline-block mt-1 text-[10px] font-semibold px-2 py-0.5 rounded-md bg-navy/10 text-navy">
                    {ex.type}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </motion.div>

        {/* ── Fee Collection ── */}
        <motion.div variants={fadeUp} className="ap-card p-6">
          <h4 className="text-sm font-bold text-gray-900 mb-4 flex items-center gap-2">
            <Wallet className="w-4 h-4 text-emerald-500" />
            Fee Collection
          </h4>
          <div className="mb-4">
            <div className="flex items-baseline justify-between mb-2">
              <span className="text-2xl font-extrabold text-gray-900">₹45.6L</span>
              <span className="text-xs text-gray-400 font-medium">of ₹50L target</span>
            </div>
            <div className="w-full h-2.5 bg-gray-100 rounded-full overflow-hidden">
              <motion.div
                initial={{ width: 0 }}
                whileInView={{ width: `${feePercent}%` }}
                viewport={{ once: true }}
                transition={{ delay: 0.3, duration: 0.8, ease: "easeOut" }}
                className="h-full rounded-full"
                style={{ background: "linear-gradient(90deg, #22C55E, #4ADE80)" }}
              />
            </div>
            <p className="text-[11px] text-gray-400 mt-1.5 font-medium">
              {feePercent}% of monthly target achieved
            </p>
          </div>
          <p className="text-xs font-bold text-gray-700 mb-2">Recent Payments</p>
          <div className="space-y-2">
            {recentPayments.map((p, i) => (
              <div
                key={i}
                className="flex items-center justify-between p-2 rounded-lg bg-gray-50/80"
              >
                <div>
                  <p className="text-xs font-semibold text-gray-900">{p.name}</p>
                  <p className="text-[11px] text-gray-400">{p.time}</p>
                </div>
                <span className="text-xs font-bold text-emerald-600">{p.amount}</span>
              </div>
            ))}
          </div>
        </motion.div>

        {/* ── Recent Admissions ── */}
        <motion.div variants={fadeUp} className="ap-card p-6">
          <h4 className="text-sm font-bold text-gray-900 mb-4 flex items-center gap-2">
            <UserPlus className="w-4 h-4 text-blue-500" />
            Recent Admissions
          </h4>
          <div className="space-y-3">
            {recentAdmissions.map((a, i) => (
              <div key={i} className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-full bg-gradient-to-br from-navy to-navy/80 flex items-center justify-center text-white text-[11px] font-bold shrink-0">
                  {a.name
                    .split(" ")
                    .map((n) => n[0])
                    .join("")}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-xs font-bold text-gray-900 truncate">{a.name}</p>
                  <p className="text-[11px] text-gray-400">
                    {a.course} · {a.date}
                  </p>
                </div>
                <span
                  className={`text-[10px] font-semibold px-2 py-0.5 rounded-md ${
                    a.status === "confirmed"
                      ? "bg-emerald-50 text-emerald-600"
                      : "bg-amber-50 text-amber-600"
                  }`}
                >
                  {a.status === "confirmed" ? "Confirmed" : "Pending"}
                </span>
              </div>
            ))}
          </div>
        </motion.div>

        {/* ── Latest Notice ── */}
        <motion.div variants={fadeUp} className="ap-card p-6">
          <h4 className="text-sm font-bold text-gray-900 mb-4 flex items-center gap-2">
            <Bell className="w-4 h-4 text-rose-500" />
            Latest Notice
          </h4>
          <div className="space-y-3">
            {latestNotices.map((n, i) => (
              <div
                key={i}
                className="p-3 rounded-xl bg-gray-50/80 hover:bg-gray-100/80 transition-colors"
              >
                <div className="flex items-center gap-2 mb-1">
                  <span className="text-[10px] font-semibold px-2 py-0.5 rounded-md bg-navy/10 text-navy">
                    {n.category}
                  </span>
                  <span className="text-[11px] text-gray-400">{n.date}</span>
                </div>
                <p className="text-xs font-semibold text-gray-900 leading-relaxed">{n.title}</p>
              </div>
            ))}
          </div>
        </motion.div>

        {/* ── Calendar / Events ── */}
        <motion.div variants={fadeUp} className="ap-card p-6">
          <h4 className="text-sm font-bold text-gray-900 mb-4 flex items-center gap-2">
            <Calendar className="w-4 h-4 text-navy" />
            Upcoming Events
          </h4>
          <div className="space-y-3">
            {calendarEvents.map((e, i) => (
              <div key={i} className="flex items-start gap-3">
                <div className="flex flex-col items-center shrink-0">
                  <div
                    className="w-10 h-10 rounded-xl flex items-center justify-center text-white text-[11px] font-bold"
                    style={{ background: e.color }}
                  >
                    {e.date.split(" ")[1]}
                  </div>
                  <span className="text-[10px] text-gray-400 font-medium mt-0.5">Dec</span>
                </div>
                <div className="pt-1">
                  <p className="text-xs font-bold text-gray-900">{e.title}</p>
                  <p className="text-[11px] text-gray-400 mt-0.5">{e.date}</p>
                </div>
              </div>
            ))}
          </div>
        </motion.div>

        {/* ── Quick Shortcuts ── */}
        <motion.div variants={fadeUp} className="ap-card p-6">
          <h4 className="text-sm font-bold text-gray-900 mb-4 flex items-center gap-2">
            <Zap className="w-4 h-4 text-amber-500" />
            Quick Shortcuts
          </h4>
          <div className="grid grid-cols-3 gap-3">
            {quickActions.map((a) => {
              const Icon = a.icon;
              return (
                <Link
                  key={a.label}
                  to={a.to}
                  className="flex flex-col items-center gap-2 p-3 rounded-2xl hover:bg-gray-50 transition-all duration-200 group"
                >
                  <div
                    className="w-11 h-11 rounded-2xl flex items-center justify-center text-white transition-transform group-hover:scale-110 group-hover:shadow-lg"
                    style={{ background: a.color }}
                  >
                    <Icon className="w-5 h-5" />
                  </div>
                  <span className="text-[11px] font-semibold text-gray-600 text-center leading-tight">
                    {a.label}
                  </span>
                </Link>
              );
            })}
          </div>
        </motion.div>
      </motion.div>

      {/* ═══════ 5. ACTIVITY TIMELINE ═══════ */}
      <motion.div
        variants={fadeUp}
        initial="hidden"
        whileInView="show"
        viewport={{ once: true }}
        className="ap-card p-6 md:p-8"
      >
        <div className="flex items-center justify-between mb-6">
          <div>
            <h3 className="text-lg font-bold text-gray-900">Recent Activity</h3>
            <p className="text-sm text-gray-400 mt-0.5">Latest actions across the system</p>
          </div>
          <button className="ap-btn-ghost text-xs">
            View All <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>
        <div className="relative">
          {/* timeline line */}
          <div className="absolute left-[15px] top-2 bottom-2 w-0.5 bg-gradient-to-b from-navy/30 via-navy/20 to-transparent" />
          <div className="space-y-5">
            {activityTimeline.map((a, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, x: -16 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.06, duration: 0.35 }}
                className="flex items-start gap-4 relative"
              >
                <div
                  className="w-[30px] h-[30px] rounded-full flex items-center justify-center shrink-0 z-10 ring-4 ring-white"
                  style={{ background: a.color }}
                >
                  <div className="w-2 h-2 rounded-full bg-white" />
                </div>
                <div className="flex-1 pt-0.5">
                  <p className="text-sm text-gray-700 font-medium leading-relaxed">{a.text}</p>
                  <p className="text-[11px] text-gray-400 mt-0.5">{a.time}</p>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </motion.div>

      {/* ═══════ 6. TOP COURSES ═══════ */}
      <motion.div
        variants={fadeUp}
        initial="hidden"
        whileInView="show"
        viewport={{ once: true }}
        className="ap-card p-6 md:p-8"
      >
        <div className="flex items-center justify-between mb-6">
          <div>
            <h3 className="text-lg font-bold text-gray-900">Top Performing Courses</h3>
            <p className="text-sm text-gray-400 mt-0.5">Ranked by total enrolled students</p>
          </div>
          <div className="flex items-center gap-1.5 text-amber-500">
            <Star className="w-5 h-5 fill-current" />
            <span className="text-sm font-bold">5 Active</span>
          </div>
        </div>
        <div className="flex flex-wrap gap-3">
          {topCourses.map((c, i) => (
            <motion.div
              key={c.name}
              initial={{ opacity: 0, scale: 0.9 }}
              whileInView={{ opacity: 1, scale: 1 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.08 }}
              whileHover={{ scale: 1.05, y: -2 }}
              className="flex items-center gap-3 px-5 py-3.5 rounded-2xl border-2 transition-colors cursor-pointer group"
              style={{
                borderColor: `${c.color}20`,
                background: `${c.color}08`,
              }}
            >
              <div
                className="w-10 h-10 rounded-xl flex items-center justify-center text-white font-bold text-sm"
                style={{ background: c.color }}
              >
                {i + 1}
              </div>
              <div>
                <p className="text-sm font-bold text-gray-900">{c.name}</p>
                <p className="text-xs text-gray-400">{c.count} students</p>
              </div>
              <div className="ml-4">
                <TrendingUp className="w-4 h-4 text-emerald-500 opacity-0 group-hover:opacity-100 transition-opacity" />
              </div>
            </motion.div>
          ))}
        </div>
      </motion.div>
    </div>
  );
}
