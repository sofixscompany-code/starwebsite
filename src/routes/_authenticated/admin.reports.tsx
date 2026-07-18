import {  } from "react-router-dom";
import { useState, useMemo } from "react";
import { motion } from "framer-motion";
import {
  BarChart3, PieChart as PieChartIcon, TrendingUp, Download, Calendar, Users,
  GraduationCap, BookOpen, CreditCard, FileText, Award, ArrowUpRight, ArrowDownRight,
  RefreshCw, Filter, Eye, CalendarCheck, CheckCircle,
} from "lucide-react";
import {
  BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer,
  CartesianGrid, PieChart, Pie, Cell, Legend, AreaChart, Area, LineChart, Line,
} from "recharts";
import { PageHeader } from "@/components/admin/AdminShell";
import { StatCard, Panel, Badge, Tabs, Skeleton } from "@/components/admin/ui";
import { useLmsStats } from "@/hooks/use-lms";
import { useFeeStats } from "@/hooks/use-fees";

const COLORS = ["hsl(262 83% 58%)", "hsl(24 95% 58%)", "hsl(152 60% 42%)", "hsl(210 92% 55%)", "hsl(355 82% 58%)", "hsl(45 93% 47%)"];

const enrollmentData = [
  { m: "Jan", students: 120 }, { m: "Feb", students: 135 }, { m: "Mar", students: 148 },
  { m: "Apr", students: 162 }, { m: "May", students: 178 }, { m: "Jun", students: 195 },
  { m: "Jul", students: 210 }, { m: "Aug", students: 225 }, { m: "Sep", students: 240 },
];

const coursePopularity = [
  { name: "Nepal Police", students: 85, color: COLORS[0] },
  { name: "Loksewa", students: 72, color: COLORS[1] },
  { name: "Bank PO", students: 58, color: COLORS[2] },
  { name: "APF", students: 45, color: COLORS[3] },
  { name: "Nepal Army", students: 38, color: COLORS[4] },
];

const attendanceTrend = [
  { m: "Jan", rate: 82 }, { m: "Feb", rate: 85 }, { m: "Mar", rate: 83 },
  { m: "Apr", rate: 87 }, { m: "May", rate: 89 }, { m: "Jun", rate: 86 },
  { m: "Jul", rate: 91 }, { m: "Aug", rate: 88 }, { m: "Sep", rate: 92 },
];

const examResults = [
  { m: "Jan", avg: 68, pass: 72 }, { m: "Feb", avg: 71, pass: 75 },
  { m: "Mar", avg: 69, pass: 73 }, { m: "Apr", avg: 74, pass: 78 },
  { m: "May", avg: 72, pass: 76 }, { m: "Jun", avg: 76, pass: 80 },
  { m: "Jul", avg: 78, pass: 82 }, { m: "Aug", avg: 75, pass: 79 },
  { m: "Sep", avg: 80, pass: 85 },
];

const topPerformers = [
  { name: "Priya Karki", course: "Loksewa", marks: 92, attendance: 96 },
  { name: "Aarav Sharma", course: "Nepal Police", marks: 89, attendance: 94 },
  { name: "Sita Rana", course: "Bank PO", marks: 87, attendance: 91 },
  { name: "Bikash Gurung", course: "APF", marks: 85, attendance: 88 },
  { name: "Anisha Magar", course: "Nepal Army", marks: 83, attendance: 90 },
];

const revenueByMonth = [
  { m: "Jan", revenue: 480000 }, { m: "Feb", revenue: 520000 },
  { m: "Mar", revenue: 610000 }, { m: "Apr", revenue: 590000 },
  { m: "May", revenue: 720000 }, { m: "Jun", revenue: 810000 },
  { m: "Jul", revenue: 890000 }, { m: "Aug", revenue: 950000 },
  { m: "Sep", revenue: 1020000 },
];

const reportCards = [
  { icon: GraduationCap, title: "Student Report", desc: "Individual student performance analysis", color: "purple" },
  { icon: BookOpen, title: "Course Report", desc: "Course-wise enrollment & completion stats", color: "blue" },
  { icon: Users, title: "Attendance Report", desc: "Daily, weekly, monthly attendance summary", color: "green" },
  { icon: FileText, title: "Exam Report", desc: "Exam results & grade distribution", color: "orange" },
  { icon: CreditCard, title: "Fee Collection Report", desc: "Revenue, pending, overdue analysis", color: "purple" },
  { icon: TrendingUp, title: "Growth Report", desc: "Month-over-month growth metrics", color: "blue" },
  { icon: Award, title: "Performance Report", desc: "Top performers & improvement areas", color: "green" },
  { icon: BarChart3, title: "Analytics Dashboard", desc: "Comprehensive data visualizations", color: "orange" },
];

export function ReportsPage() {
  const [activeTab, setActiveTab] = useState("overview");
  const { data: lmsStats, isLoading: lmsLoading } = useLmsStats();
  const { data: feeStats, isLoading: feeLoading } = useFeeStats();

  const tabs = [
    { label: "Overview", value: "overview" },
    { label: "Enrollment", value: "enrollment" },
    { label: "Academic", value: "academic" },
    { label: "Financial", value: "financial" },
    { label: "Reports", value: "reports" },
  ];

  return (
    <div>
      <PageHeader
        title="Reports & Analytics"
        subtitle="Comprehensive insights across all modules."
        actions={
          <>
            <button className="ap-btn-ghost"><RefreshCw className="w-4 h-4" /> Refresh</button>
            <button className="ap-btn"><Download className="w-4 h-4" /> Export All</button>
          </>
        }
      />

      <Tabs tabs={tabs} value={activeTab} onChange={setActiveTab} />

      <div className="mt-4">
        {activeTab === "overview" && <OverviewTab lmsStats={lmsStats} feeStats={feeStats} lmsLoading={lmsLoading} feeLoading={feeLoading} />}
        {activeTab === "enrollment" && <EnrollmentTab />}
        {activeTab === "academic" && <AcademicTab />}
        {activeTab === "financial" && <FinancialTab />}
        {activeTab === "reports" && <ReportsTab />}
      </div>
    </div>
  );
}

/* ================================================================ */
/*  OVERVIEW TAB                                                    */
/* ================================================================ */
export function OverviewTab({ lmsStats, feeStats, lmsLoading, feeLoading }: any) {
  return (
    <div className="space-y-6">
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {lmsLoading || feeLoading ? (
          <>
            <Skeleton className="h-28" /><Skeleton className="h-28" /><Skeleton className="h-28" /><Skeleton className="h-28" />
          </>
        ) : (
          <>
            <StatCard label="Total Students" value={240} delta={15} icon={Users} tone="purple" />
            <StatCard label="Active Courses" value={lmsStats?.totalCourses ?? 0} icon={BookOpen} tone="info" />
            <StatCard label="Revenue" prefix="₹" value={feeStats?.totalCollected ?? 0} delta={18} icon={CreditCard} tone="success" />
            <StatCard label="Attendance Rate" value="89%" delta={5} icon={GraduationCap} tone="success" />
          </>
        )}
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-2 gap-4">
        <Panel title="Student Enrollment Trend" subtitle="Monthly enrollment growth">
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={enrollmentData}>
                <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--ap-border))" />
                <XAxis dataKey="m" stroke="hsl(var(--ap-muted))" fontSize={11} />
                <YAxis stroke="hsl(var(--ap-muted))" fontSize={11} />
                <Tooltip contentStyle={{ background: "hsl(var(--ap-panel))", border: "1px solid hsl(var(--ap-border))", borderRadius: 12 }} />
                <Area type="monotone" dataKey="students" stroke="hsl(262 83% 58%)" fill="hsl(262 83% 58%)" fillOpacity={0.15} />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </Panel>

        <Panel title="Course Popularity" subtitle="Students per course">
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie data={coursePopularity} innerRadius={50} outerRadius={85} dataKey="students" paddingAngle={4}>
                  {coursePopularity.map((c) => <Cell key={c.name} fill={c.color} />)}
                </Pie>
                <Tooltip contentStyle={{ background: "hsl(var(--ap-panel))", border: "1px solid hsl(var(--ap-border))", borderRadius: 12 }} />
                <Legend />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </Panel>

        <Panel title="Attendance Trend" subtitle="Monthly attendance rate %">
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={attendanceTrend}>
                <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--ap-border))" />
                <XAxis dataKey="m" stroke="hsl(var(--ap-muted))" fontSize={11} />
                <YAxis stroke="hsl(var(--ap-muted))" fontSize={11} domain={[70, 100]} />
                <Tooltip contentStyle={{ background: "hsl(var(--ap-panel))", border: "1px solid hsl(var(--ap-border))", borderRadius: 12 }} />
                <Line type="monotone" dataKey="rate" stroke="hsl(152 60% 42%)" strokeWidth={2} dot={{ fill: "hsl(152 60% 42%)" }} />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </Panel>

        <Panel title="Exam Results" subtitle="Average marks & pass rate">
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={examResults}>
                <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--ap-border))" />
                <XAxis dataKey="m" stroke="hsl(var(--ap-muted))" fontSize={11} />
                <YAxis stroke="hsl(var(--ap-muted))" fontSize={11} />
                <Tooltip contentStyle={{ background: "hsl(var(--ap-panel))", border: "1px solid hsl(var(--ap-border))", borderRadius: 12 }} />
                <Legend />
                <Bar dataKey="avg" name="Avg Marks" radius={[6, 6, 0, 0]} fill="hsl(262 83% 58%)" />
                <Bar dataKey="pass" name="Pass Rate" radius={[6, 6, 0, 0]} fill="hsl(152 60% 42%)" />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </Panel>
      </div>

      <Panel title="Top Performers" subtitle="Students with highest marks">
        <div className="space-y-2">
          {topPerformers.map((p, i) => (
            <div key={p.name} className="flex items-center gap-4 p-3 rounded-xl hover:bg-[hsl(var(--ap-border)/0.2)]">
              <span className="text-lg font-black text-[hsl(var(--ap-muted))] w-8">{i + 1}</span>
              <div className="w-10 h-10 rounded-full ap-grad flex items-center justify-center text-white font-bold text-sm">
                {p.name.charAt(0)}
              </div>
              <div className="flex-1">
                <p className="font-semibold">{p.name}</p>
                <p className="text-xs text-[hsl(var(--ap-muted))]">{p.course}</p>
              </div>
              <div className="text-right">
                <p className="font-bold">{p.marks}%</p>
                <p className="text-xs text-[hsl(var(--ap-muted))]">{p.attendance}% attendance</p>
              </div>
              <Badge tone={p.marks >= 90 ? "success" : p.marks >= 80 ? "info" : "warning"}>
                {p.marks >= 90 ? "Excellent" : p.marks >= 80 ? "Good" : "Average"}
              </Badge>
            </div>
          ))}
        </div>
      </Panel>
    </div>
  );
}

/* ================================================================ */
/*  ENROLLMENT TAB                                                  */
/* ================================================================ */
export function EnrollmentTab() {
  return (
    <div className="space-y-4">
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <StatCard label="Total Enrolled" value={240} icon={Users} tone="purple" />
        <StatCard label="Active" value={210} icon={GraduationCap} tone="success" />
        <StatCard label="Completed" value={18} icon={Award} tone="info" />
        <StatCard label="Dropped" value={12} icon={ArrowDownRight} tone="danger" />
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-2 gap-4">
        <Panel title="Monthly Enrollment" subtitle="New student enrollments per month">
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={enrollmentData}>
                <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--ap-border))" />
                <XAxis dataKey="m" stroke="hsl(var(--ap-muted))" fontSize={11} />
                <YAxis stroke="hsl(var(--ap-muted))" fontSize={11} />
                <Tooltip contentStyle={{ background: "hsl(var(--ap-panel))", border: "1px solid hsl(var(--ap-border))", borderRadius: 12 }} />
                <Bar dataKey="students" name="Students" radius={[6, 6, 0, 0]} fill="hsl(262 83% 58%)" />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </Panel>

        <Panel title="Enrollment by Course" subtitle="Course-wise distribution">
          <div className="space-y-3">
            {coursePopularity.map((c) => (
              <div key={c.name} className="flex items-center gap-3">
                <div className="w-3 h-3 rounded-full" style={{ background: c.color }} />
                <span className="text-sm flex-1">{c.name}</span>
                <div className="w-32 h-2 rounded-full bg-[hsl(var(--ap-border))] overflow-hidden">
                  <div className="h-2 rounded-full" style={{ background: c.color, width: `${(c.students / 85) * 100}%` }} />
                </div>
                <span className="text-sm font-bold w-8 text-right">{c.students}</span>
              </div>
            ))}
          </div>
        </Panel>
      </div>
    </div>
  );
}

/* ================================================================ */
/*  ACADEMIC TAB                                                    */
/* ================================================================ */
export function AcademicTab() {
  return (
    <div className="space-y-4">
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <StatCard label="Avg Attendance" value="89%" icon={CalendarCheck} tone="success" />
        <StatCard label="Avg Marks" value="76%" icon={BarChart3} tone="info" />
        <StatCard label="Pass Rate" value="82%" icon={CheckCircle} tone="success" />
        <StatCard label="Top Score" value="96%" icon={Award} tone="purple" />
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-2 gap-4">
        <Panel title="Attendance Trend" subtitle="Monthly attendance rate">
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={attendanceTrend}>
                <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--ap-border))" />
                <XAxis dataKey="m" stroke="hsl(var(--ap-muted))" fontSize={11} />
                <YAxis stroke="hsl(var(--ap-muted))" fontSize={11} domain={[70, 100]} />
                <Tooltip contentStyle={{ background: "hsl(var(--ap-panel))", border: "1px solid hsl(var(--ap-border))", borderRadius: 12 }} />
                <Area type="monotone" dataKey="rate" stroke="hsl(152 60% 42%)" fill="hsl(152 60% 42%)" fillOpacity={0.15} />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </Panel>

        <Panel title="Exam Performance" subtitle="Average marks vs pass rate">
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={examResults}>
                <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--ap-border))" />
                <XAxis dataKey="m" stroke="hsl(var(--ap-muted))" fontSize={11} />
                <YAxis stroke="hsl(var(--ap-muted))" fontSize={11} />
                <Tooltip contentStyle={{ background: "hsl(var(--ap-panel))", border: "1px solid hsl(var(--ap-border))", borderRadius: 12 }} />
                <Legend />
                <Line type="monotone" dataKey="avg" name="Avg Marks" stroke="hsl(262 83% 58%)" strokeWidth={2} />
                <Line type="monotone" dataKey="pass" name="Pass Rate" stroke="hsl(152 60% 42%)" strokeWidth={2} />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </Panel>
      </div>

      <Panel title="Course Performance" subtitle="Average marks by course">
        <div className="space-y-3">
          {[
            { name: "Nepal Police", avg: 78, pass: 85 },
            { name: "Loksewa", avg: 74, pass: 80 },
            { name: "Bank PO", avg: 72, pass: 78 },
            { name: "APF", avg: 69, pass: 75 },
            { name: "Nepal Army", avg: 66, pass: 72 },
          ].map((c) => (
            <div key={c.name} className="flex items-center gap-4">
              <span className="text-sm flex-1">{c.name}</span>
              <div className="flex items-center gap-2">
                <div className="w-24 h-2 rounded-full bg-[hsl(var(--ap-border))] overflow-hidden">
                  <div className="h-2 rounded-full bg-[hsl(var(--ap-blue))]" style={{ width: `${c.avg}%` }} />
                </div>
                <span className="text-xs font-bold w-8">{c.avg}%</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-24 h-2 rounded-full bg-[hsl(var(--ap-border))] overflow-hidden">
                  <div className="h-2 rounded-full bg-[hsl(var(--ap-success))]" style={{ width: `${c.pass}%` }} />
                </div>
                <span className="text-xs font-bold w-8">{c.pass}%</span>
              </div>
            </div>
          ))}
        </div>
      </Panel>
    </div>
  );
}

/* ================================================================ */
/*  FINANCIAL TAB                                                   */
/* ================================================================ */
export function FinancialTab() {
  const { data: feeStats, isLoading } = useFeeStats();

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {isLoading ? (
          <>
            <Skeleton className="h-28" /><Skeleton className="h-28" /><Skeleton className="h-28" /><Skeleton className="h-28" />
          </>
        ) : (
          <>
            <StatCard label="Total Revenue" prefix="₹" value={feeStats?.totalRevenue ?? 0} icon={CreditCard} tone="success" />
            <StatCard label="Collected" prefix="₹" value={feeStats?.totalCollected ?? 0} icon={ArrowUpRight} tone="info" />
            <StatCard label="Pending" prefix="₹" value={feeStats?.pendingAmount ?? 0} icon={ArrowDownRight} tone="danger" />
            <StatCard label="Collection Rate" value={`${feeStats?.collectionRate ?? 0}%`} icon={TrendingUp} tone="success" />
          </>
        )}
      </div>

      <Panel title="Revenue Trend" subtitle="Monthly revenue collection">
        <div className="h-64">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={revenueByMonth}>
              <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--ap-border))" />
              <XAxis dataKey="m" stroke="hsl(var(--ap-muted))" fontSize={11} />
              <YAxis stroke="hsl(var(--ap-muted))" fontSize={11} />
              <Tooltip contentStyle={{ background: "hsl(var(--ap-panel))", border: "1px solid hsl(var(--ap-border))", borderRadius: 12 }} formatter={(v: number) => `₹${v.toLocaleString()}`} />
              <Area type="monotone" dataKey="revenue" stroke="hsl(262 83% 58%)" fill="hsl(262 83% 58%)" fillOpacity={0.15} />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </Panel>

      <div className="grid grid-cols-1 xl:grid-cols-2 gap-4">
        <Panel title="Fee Collection by Course" subtitle="Revenue per course">
          <div className="h-48">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie data={coursePopularity.map((c) => ({ name: c.name, value: c.students * 15000 }))} innerRadius={40} outerRadius={70} dataKey="value" paddingAngle={4}>
                  {coursePopularity.map((c) => <Cell key={c.name} fill={c.color} />)}
                </Pie>
                <Tooltip contentStyle={{ background: "hsl(var(--ap-panel))", border: "1px solid hsl(var(--ap-border))", borderRadius: 12 }} formatter={(v: number) => `₹${v.toLocaleString()}`} />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </Panel>

        <Panel title="Payment Methods" subtitle="Transactions by payment method">
          <div className="space-y-3">
            {[
              { method: "eSewa", count: 45, amount: 675000, pct: 35 },
              { method: "Khalti", count: 32, amount: 480000, pct: 25 },
              { method: "Bank Transfer", count: 28, amount: 420000, pct: 22 },
              { method: "Cash", count: 15, amount: 225000, pct: 13 },
              { method: "Card", count: 6, amount: 90000, pct: 5 },
            ].map((p) => (
              <div key={p.method} className="flex items-center gap-3">
                <span className="text-sm flex-1">{p.method}</span>
                <div className="w-32 h-2 rounded-full bg-[hsl(var(--ap-border))] overflow-hidden">
                  <div className="h-2 rounded-full bg-[hsl(var(--ap-blue))]" style={{ width: `${p.pct}%` }} />
                </div>
                <span className="text-xs font-bold w-8">{p.pct}%</span>
              </div>
            ))}
          </div>
        </Panel>
      </div>
    </div>
  );
}

/* ================================================================ */
/*  REPORTS TAB                                                     */
/* ================================================================ */
export function ReportsTab() {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
      {reportCards.map((r) => {
        const Icon = r.icon;
        return (
          <motion.div key={r.title} whileHover={{ y: -4 }} className="ap-card p-5 cursor-pointer">
            <div className="flex items-start gap-4">
              <div className="w-12 h-12 rounded-xl ap-grad flex items-center justify-center text-white flex-shrink-0">
                <Icon className="w-5 h-5" />
              </div>
              <div>
                <h3 className="font-bold">{r.title}</h3>
                <p className="text-sm text-[hsl(var(--ap-muted))] mt-1">{r.desc}</p>
                <div className="flex items-center gap-2 mt-3">
                  <button className="text-xs ap-btn-ghost !py-1"><Eye className="w-3 h-3" /> View</button>
                  <button className="text-xs ap-btn-ghost !py-1"><Download className="w-3 h-3" /> Export</button>
                </div>
              </div>
            </div>
          </motion.div>
        );
      })}
    </div>
  );
}


