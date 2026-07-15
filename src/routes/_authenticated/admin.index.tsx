import { createFileRoute } from "@tanstack/react-router";
import { motion } from "framer-motion";
import {
  AreaChart, Area, BarChart, Bar, PieChart, Pie, Cell, XAxis, YAxis, Tooltip,
  ResponsiveContainer, CartesianGrid, LineChart, Line, Legend,
} from "recharts";
import {
  GraduationCap, Users, Baby, BookOpen, Wallet, AlertCircle, CalendarCheck,
  Presentation, ClipboardList, UserPlus, Target, Sun, TrendingUp,
} from "lucide-react";
import { PageHeader, QUICK_ACTIONS } from "@/components/admin/AdminShell";
import { StatCard, Panel, Badge } from "@/components/admin/ui";
import { Link } from "@tanstack/react-router";

export const Route = createFileRoute("/_authenticated/admin/")({
  component: Dashboard,
});

const revenueData = [
  { m: "Jan", rev: 480000, fee: 320000 },
  { m: "Feb", rev: 520000, fee: 360000 },
  { m: "Mar", rev: 610000, fee: 410000 },
  { m: "Apr", rev: 590000, fee: 400000 },
  { m: "May", rev: 720000, fee: 500000 },
  { m: "Jun", rev: 810000, fee: 560000 },
  { m: "Jul", rev: 890000, fee: 620000 },
  { m: "Aug", rev: 950000, fee: 700000 },
  { m: "Sep", rev: 1020000, fee: 760000 },
];
const admissionsData = [
  { m: "Jan", n: 34 }, { m: "Feb", n: 42 }, { m: "Mar", n: 55 },
  { m: "Apr", n: 48 }, { m: "May", n: 62 }, { m: "Jun", n: 74 },
  { m: "Jul", n: 88 }, { m: "Aug", n: 95 }, { m: "Sep", n: 112 },
];
const courseSplit = [
  { name: "Nepal Police", value: 320, color: "hsl(262 83% 58%)" },
  { name: "APF", value: 245, color: "hsl(24 95% 58%)" },
  { name: "Nepal Army", value: 190, color: "hsl(210 92% 55%)" },
  { name: "Loksewa", value: 175, color: "hsl(152 60% 42%)" },
  { name: "Bank", value: 110, color: "hsl(355 82% 58%)" },
];
const attendanceWeek = [
  { d: "Mon", pct: 92 }, { d: "Tue", pct: 88 }, { d: "Wed", pct: 94 },
  { d: "Thu", pct: 90 }, { d: "Fri", pct: 87 }, { d: "Sat", pct: 82 },
];

function Dashboard() {
  const now = new Date();
  const time = now.toLocaleTimeString("en-US", { hour: "numeric", minute: "2-digit" });
  const date = now.toLocaleDateString("en-US", { weekday: "long", month: "long", day: "numeric", year: "numeric" });

  return (
    <div className="space-y-6">
      {/* Welcome */}
      <motion.div
        initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }}
        className="ap-glass p-6 md:p-8 relative overflow-hidden"
      >
        <div className="absolute -right-10 -top-10 w-64 h-64 rounded-full ap-grad opacity-20 blur-3xl" />
        <div className="relative flex flex-wrap items-center justify-between gap-4">
          <div>
            <p className="text-xs uppercase tracking-widest text-[hsl(var(--ap-muted))] font-bold">
              {date} · {time}
            </p>
            <h1 className="text-3xl md:text-4xl font-black mt-1">
              Good morning, <span className="ap-grad-text">Admin</span> ✨
            </h1>
            <p className="text-sm text-[hsl(var(--ap-muted))] mt-1">
              You have <b className="text-[hsl(var(--ap-purple))]">24 pending admissions</b>,{" "}
              <b className="text-[hsl(var(--ap-orange))]">3 exams to review</b>, and{" "}
              <b className="text-[hsl(var(--ap-success))]">₹86,500 collected</b> today.
            </p>
          </div>
          <div className="flex items-center gap-4">
            <div className="ap-card p-4 min-w-[180px]">
              <div className="flex items-center gap-2 text-[hsl(var(--ap-warning))]">
                <Sun className="w-5 h-5" />
                <span className="text-2xl font-black">28°C</span>
              </div>
              <p className="text-xs text-[hsl(var(--ap-muted))]">Kathmandu · Sunny</p>
            </div>
          </div>
        </div>

        {/* Quick actions */}
        <div className="relative mt-6 grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-8 gap-2">
          {QUICK_ACTIONS.map((q) => {
            const Icon = q.icon;
            return (
              <Link
                key={q.label}
                to={q.to}
                className="ap-card p-3 flex flex-col items-center gap-1 hover:shadow-lg hover:-translate-y-0.5 transition text-center"
              >
                <div className="w-9 h-9 rounded-xl ap-grad flex items-center justify-center text-white">
                  <Icon className="w-4 h-4" />
                </div>
                <span className="text-[11px] font-semibold">{q.label}</span>
              </Link>
            );
          })}
        </div>
      </motion.div>

      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-3 xl:grid-cols-6 gap-4">
        <StatCard label="Students" value={1284} delta={12} icon={GraduationCap} tone="purple" />
        <StatCard label="Teachers" value={68} delta={4} icon={Users} tone="orange" />
        <StatCard label="Parents" value={942} delta={8} icon={Baby} tone="info" />
        <StatCard label="Courses" value={24} delta={2} icon={BookOpen} tone="success" />
        <StatCard label="Revenue" prefix="₹" value={9820000} delta={18} icon={Wallet} tone="success" />
        <StatCard label="Pending Fees" prefix="₹" value={412500} delta={-6} icon={AlertCircle} tone="danger" />
      </div>
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <StatCard label="Today Attendance" value="92%" icon={CalendarCheck} tone="success" />
        <StatCard label="Today Classes" value={38} icon={Presentation} tone="purple" />
        <StatCard label="New Admissions" value={24} delta={22} icon={ClipboardList} tone="orange" />
        <StatCard label="New Leads" value={142} delta={35} icon={Target} tone="info" />
      </div>

      {/* Charts row */}
      <div className="grid grid-cols-1 xl:grid-cols-3 gap-4">
        <Panel
          title="Revenue vs Fee Collection"
          subtitle="Last 9 months · in ₹"
          className="xl:col-span-2"
          actions={<Badge tone="success"><TrendingUp className="w-3 h-3" /> +23%</Badge>}
        >
          <div className="h-72">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={revenueData}>
                <defs>
                  <linearGradient id="rev" x1="0" x2="0" y1="0" y2="1">
                    <stop offset="0%" stopColor="hsl(262 83% 58%)" stopOpacity={0.5} />
                    <stop offset="100%" stopColor="hsl(262 83% 58%)" stopOpacity={0} />
                  </linearGradient>
                  <linearGradient id="fee" x1="0" x2="0" y1="0" y2="1">
                    <stop offset="0%" stopColor="hsl(24 95% 58%)" stopOpacity={0.5} />
                    <stop offset="100%" stopColor="hsl(24 95% 58%)" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--ap-border))" />
                <XAxis dataKey="m" stroke="hsl(var(--ap-muted))" fontSize={11} />
                <YAxis stroke="hsl(var(--ap-muted))" fontSize={11} />
                <Tooltip contentStyle={{ background: "hsl(var(--ap-panel))", border: "1px solid hsl(var(--ap-border))", borderRadius: 12 }} />
                <Legend />
                <Area type="monotone" dataKey="rev" stroke="hsl(262 83% 58%)" fill="url(#rev)" strokeWidth={2} />
                <Area type="monotone" dataKey="fee" stroke="hsl(24 95% 58%)" fill="url(#fee)" strokeWidth={2} />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </Panel>

        <Panel title="Course-wise Students" subtitle="Active enrolments">
          <div className="h-72">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie data={courseSplit} innerRadius={55} outerRadius={90} dataKey="value" paddingAngle={4}>
                  {courseSplit.map((c) => <Cell key={c.name} fill={c.color} />)}
                </Pie>
                <Tooltip contentStyle={{ background: "hsl(var(--ap-panel))", border: "1px solid hsl(var(--ap-border))", borderRadius: 12 }} />
              </PieChart>
            </ResponsiveContainer>
          </div>
          <div className="grid grid-cols-2 gap-2 mt-2">
            {courseSplit.map((c) => (
              <div key={c.name} className="flex items-center gap-2 text-xs">
                <span className="w-2.5 h-2.5 rounded-full" style={{ background: c.color }} />
                <span className="text-[hsl(var(--ap-muted))]">{c.name}</span>
                <span className="ml-auto font-bold">{c.value}</span>
              </div>
            ))}
          </div>
        </Panel>
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-3 gap-4">
        <Panel title="Admissions trend" subtitle="Monthly new admissions">
          <div className="h-56">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={admissionsData}>
                <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--ap-border))" />
                <XAxis dataKey="m" stroke="hsl(var(--ap-muted))" fontSize={11} />
                <YAxis stroke="hsl(var(--ap-muted))" fontSize={11} />
                <Tooltip contentStyle={{ background: "hsl(var(--ap-panel))", border: "1px solid hsl(var(--ap-border))", borderRadius: 12 }} />
                <Bar dataKey="n" radius={[8, 8, 0, 0]} fill="hsl(262 83% 58%)" />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </Panel>
        <Panel title="Weekly Attendance %" subtitle="All batches">
          <div className="h-56">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={attendanceWeek}>
                <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--ap-border))" />
                <XAxis dataKey="d" stroke="hsl(var(--ap-muted))" fontSize={11} />
                <YAxis domain={[70, 100]} stroke="hsl(var(--ap-muted))" fontSize={11} />
                <Tooltip contentStyle={{ background: "hsl(var(--ap-panel))", border: "1px solid hsl(var(--ap-border))", borderRadius: 12 }} />
                <Line type="monotone" dataKey="pct" stroke="hsl(24 95% 58%)" strokeWidth={3} dot={{ r: 4 }} />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </Panel>
        <Panel title="Latest Notices">
          <ul className="space-y-2">
            {[
              { t: "Scholarship deadline extended", tag: "Scholarship", tone: "warning" as const },
              { t: "IOE Mock Test #14 published", tag: "Exam", tone: "purple" as const },
              { t: "Parent-teacher meet on Fri", tag: "Meeting", tone: "info" as const },
              { t: "New batch A-22 opens Nov 5", tag: "Batch", tone: "success" as const },
              { t: "Fee reminder for Sept dues", tag: "Fee", tone: "danger" as const },
            ].map((n, i) => (
              <li key={i} className="flex items-start gap-3">
                <Badge tone={n.tone}>{n.tag}</Badge>
                <span className="text-sm">{n.t}</span>
              </li>
            ))}
          </ul>
        </Panel>
      </div>

      {/* Recent tables */}
      <div className="grid grid-cols-1 xl:grid-cols-2 gap-4">
        <Panel title="Recent Admissions" actions={<Link to="/admin/admissions" className="text-xs font-bold text-[hsl(var(--ap-purple))]">View all →</Link>}>
          <div className="space-y-2">
            {[
              { n: "Aarav Sharma", c: "Nepal Police", s: "approved" },
              { n: "Priya Karki", c: "Loksewa Officer", s: "pending" },
              { n: "Rohan Thapa", c: "APF Constable", s: "approved" },
              { n: "Sita Rana", c: "Bank PO", s: "pending" },
              { n: "Bikash Gurung", c: "Nepal Army", s: "rejected" },
            ].map((r, i) => (
              <div key={i} className="flex items-center gap-3 p-2 rounded-xl hover:bg-[hsl(var(--ap-border)/0.4)]">
                <div className="w-9 h-9 rounded-full ap-grad flex items-center justify-center text-white text-xs font-bold">
                  {r.n.split(" ").map((x) => x[0]).slice(0, 2).join("")}
                </div>
                <div className="min-w-0">
                  <p className="text-sm font-semibold truncate">{r.n}</p>
                  <p className="text-xs text-[hsl(var(--ap-muted))]">{r.c}</p>
                </div>
                <div className="ml-auto">
                  <Badge tone={r.s === "approved" ? "success" : r.s === "pending" ? "warning" : "danger"}>{r.s}</Badge>
                </div>
              </div>
            ))}
          </div>
        </Panel>

        <Panel title="Recent Payments" actions={<Link to="/admin/accounting" className="text-xs font-bold text-[hsl(var(--ap-purple))]">Ledger →</Link>}>
          <div className="space-y-2">
            {[
              { n: "Priya Karki", a: 18500, k: "Fee · Sept", m: "eSewa" },
              { n: "Aarav Sharma", a: 25000, k: "Admission fee", m: "Khalti" },
              { n: "Rohan Thapa", a: 12000, k: "Hostel · Oct", m: "Cash" },
              { n: "Sita Rana", a: 8500, k: "Books & material", m: "Card" },
              { n: "Bikash Gurung", a: 30000, k: "Full package", m: "Bank" },
            ].map((r, i) => (
              <div key={i} className="flex items-center gap-3 p-2 rounded-xl hover:bg-[hsl(var(--ap-border)/0.4)]">
                <div className="w-9 h-9 rounded-xl bg-[hsl(var(--ap-success)/0.15)] text-[hsl(var(--ap-success))] flex items-center justify-center">
                  <Wallet className="w-4 h-4" />
                </div>
                <div className="min-w-0">
                  <p className="text-sm font-semibold truncate">{r.n}</p>
                  <p className="text-xs text-[hsl(var(--ap-muted))]">{r.k} · {r.m}</p>
                </div>
                <p className="ml-auto text-sm font-black text-[hsl(var(--ap-success))]">+₹{r.a.toLocaleString()}</p>
              </div>
            ))}
          </div>
        </Panel>
      </div>

      <PageHeader title="&nbsp;" />
    </div>
  );
}
