import { useState, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import {
  BarChart3,
  TrendingUp,
  Download,
  Users,
  GraduationCap,
  BookOpen,
  CreditCard,
  FileText,
  Award,
  ArrowUpRight,
  ArrowDownRight,
  CalendarCheck,
  CheckCircle,
  ArrowRight,
} from "lucide-react";
import type { LucideIcon } from "lucide-react";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  CartesianGrid,
  PieChart,
  Pie,
  Cell,
  Legend,
  AreaChart,
  Area,
  LineChart,
  Line,
} from "recharts";
import { PageHeader } from "@/components/admin/AdminShell";
import { StatCard, Panel, Badge, Tabs, Skeleton } from "@/components/admin/ui";
import { useLmsStats, useCourses } from "@/hooks/use-lms";
import { useFeeStats, usePayments, useInvoices } from "@/hooks/use-fees";
import { useModuleData } from "@/hooks/use-module-data";
import { toast } from "sonner";

const COLORS = [
  "hsl(262 83% 58%)",
  "hsl(24 95% 58%)",
  "hsl(152 60% 42%)",
  "hsl(210 92% 55%)",
  "hsl(355 82% 58%)",
  "hsl(45 93% 47%)",
];

const MONTH_NAMES = [
  "Jan",
  "Feb",
  "Mar",
  "Apr",
  "May",
  "Jun",
  "Jul",
  "Aug",
  "Sep",
  "Oct",
  "Nov",
  "Dec",
];

/* ---------- honest-data helpers ---------- */
const str = (v: unknown) => (v == null ? "" : String(v));
const num = (v: unknown) => Number(v ?? 0) || 0;

const yearMonth = (v: unknown): { y: number; m: number } | null => {
  if (v == null || v === "") return null;
  const d = new Date(str(v));
  if (isNaN(d.getTime())) return null;
  return { y: d.getFullYear(), m: d.getMonth() };
};

/** Placeholder for charts with no real records behind them yet. */
function NoData({ height = "h-64" }: { height?: string }) {
  return (
    <div
      className={`${height} flex flex-col items-center justify-center text-center text-sm text-[hsl(var(--ap-muted))]`}
    >
      <BarChart3 className="w-8 h-8 mb-2 opacity-30" />
      <p className="font-semibold">Not enough data yet</p>
      <p className="text-xs mt-0.5">This chart fills in once real records exist.</p>
    </div>
  );
}

type ReportCard = { icon: LucideIcon; title: string; desc: string; to: string };

const reportCards: ReportCard[] = [
  {
    icon: GraduationCap,
    title: "Student Report",
    desc: "Individual student performance analysis",
    to: "/admin/students",
  },
  {
    icon: BookOpen,
    title: "Course Report",
    desc: "Course-wise enrollment & completion stats",
    to: "/admin/courses",
  },
  {
    icon: Users,
    title: "Attendance Report",
    desc: "Daily, weekly, monthly attendance summary",
    to: "/admin/attendance",
  },
  {
    icon: FileText,
    title: "Exam Report",
    desc: "Exam results & grade distribution",
    to: "/admin/exams",
  },
  {
    icon: CreditCard,
    title: "Fee Collection Report",
    desc: "Revenue, pending, overdue analysis",
    to: "/admin/payments",
  },
  {
    icon: TrendingUp,
    title: "Growth Report",
    desc: "Month-over-month growth metrics",
    to: "/admin/analytics",
  },
  {
    icon: Award,
    title: "Performance Report",
    desc: "Top performers & improvement areas",
    to: "/admin/results",
  },
  {
    icon: BarChart3,
    title: "Analytics Dashboard",
    desc: "Comprehensive data visualizations",
    to: "/admin/analytics",
  },
];

export function ReportsPage() {
  const [activeTab, setActiveTab] = useState("overview");
  const { data: lmsStats, isLoading: lmsLoading } = useLmsStats();
  const { data: feeStats, isLoading: feeLoading } = useFeeStats();
  const { courses } = useCourses();
  const { rows: expenses } = useModuleData("expenses");
  const { rows: students } = useModuleData("students");
  const { rows: attendance } = useModuleData("attendance");
  const { rows: results } = useModuleData("results");
  const { payments } = usePayments();

  const thisYear = new Date().getFullYear();

  const coursePopularity = useMemo(() => {
    return courses
      .slice(0, 6)
      .map((c, i) => ({
        name: c.title.length > 16 ? c.title.slice(0, 16) + "…" : c.title,
        students: c.totalStudents || 0,
        color: COLORS[i % COLORS.length],
      }))
      .filter((c) => c.students > 0);
  }, [courses]);

  /* Monthly new-student enrollments — from real students.createdAt (no random fill) */
  const enrollmentData = useMemo(() => {
    const map: Record<number, number> = {};
    students.forEach((s) => {
      const ym = yearMonth(s.createdAt);
      if (ym && ym.y === thisYear) map[ym.m] = (map[ym.m] || 0) + 1;
    });
    return MONTH_NAMES.slice(0, 9).map((m, i) => ({ m, students: map[i] || 0 }));
  }, [students, thisYear]);

  /* Monthly revenue — from real payments.createdAt */
  const revenueByMonth = useMemo(() => {
    const map: Record<number, number> = {};
    payments.forEach((p) => {
      const ym = yearMonth(p.createdAt ?? p.paymentDate);
      if (ym && ym.y === thisYear) map[ym.m] = (map[ym.m] || 0) + num(p.amount);
    });
    return MONTH_NAMES.slice(0, 9).map((m, i) => ({ m, revenue: map[i] || 0 }));
  }, [payments, thisYear]);

  /* Monthly attendance rate — from real attendance records */
  const attendanceTrend = useMemo(() => {
    const map: Record<number, { present: number; total: number }> = {};
    attendance.forEach((a) => {
      const ym = yearMonth(a.createdAt ?? a.date);
      if (!ym) return;
      const bucket = (map[ym.m] ||= { present: 0, total: 0 });
      bucket.total += 1;
      if (str(a.status).toLowerCase() === "present") bucket.present += 1;
    });
    return Object.keys(map)
      .map((k) => Number(k))
      .sort((a, b) => a - b)
      .map((m) => ({
        m: MONTH_NAMES[m],
        rate: map[m].total ? Math.round((map[m].present / map[m].total) * 100) : 0,
      }));
  }, [attendance]);

  /* Monthly exam performance — from real results */
  const examResults = useMemo(() => {
    const map: Record<number, { sum: number; pass: number; total: number }> = {};
    results.forEach((r) => {
      const ym = yearMonth(r.createdAt ?? r.date);
      if (!ym) return;
      const marks = num(r.marks ?? r.score);
      const bucket = (map[ym.m] ||= { sum: 0, pass: 0, total: 0 });
      bucket.total += 1;
      bucket.sum += marks;
      if (marks >= 40) bucket.pass += 1;
    });
    return Object.keys(map)
      .map((k) => Number(k))
      .sort((a, b) => a - b)
      .map((m) => ({
        m: MONTH_NAMES[m],
        avg: Math.round(map[m].sum / map[m].total),
        pass: Math.round((map[m].pass / map[m].total) * 100),
      }));
  }, [results]);

  const attendanceRate = attendance.length
    ? Math.round(
        (attendance.filter((a) => str(a.status).toLowerCase() === "present").length /
          attendance.length) *
          100,
      )
    : null;

  const avgMarks = results.length
    ? Math.round(results.reduce((s, r) => s + num(r.marks ?? r.score), 0) / results.length)
    : null;

  const passRate = results.length
    ? Math.round(
        (results.filter((r) => num(r.marks ?? r.score) >= 40).length / results.length) * 100,
      )
    : null;

  const topScore = results.length ? Math.max(...results.map((r) => num(r.marks ?? r.score))) : null;

  const topPerformers = useMemo(
    () =>
      results
        .map((r) => ({
          name: str(r.studentName) || str(r.name) || str(r.student),
          course: str(r.course) || str(r.subject) || str(r.courseName),
          marks: num(r.marks ?? r.score),
        }))
        .filter((p) => p.name)
        .sort((a, b) => b.marks - a.marks)
        .slice(0, 5),
    [results],
  );

  const coursePerformance = useMemo(() => {
    const map: Record<string, { sum: number; pass: number; total: number }> = {};
    results.forEach((r) => {
      const key = str(r.course) || str(r.subject) || str(r.courseName);
      if (!key) return;
      const marks = num(r.marks ?? r.score);
      const bucket = (map[key] ||= { sum: 0, pass: 0, total: 0 });
      bucket.total += 1;
      bucket.sum += marks;
      if (marks >= 40) bucket.pass += 1;
    });
    return Object.entries(map)
      .map(([name, v]) => ({
        name,
        avg: Math.round(v.sum / v.total),
        pass: Math.round((v.pass / v.total) * 100),
      }))
      .sort((a, b) => b.avg - a.avg);
  }, [results]);

  const totalStudentsCount =
    students.length || courses.reduce((s, c) => s + (c.totalStudents || 0), 0);
  const activeCoursesCount = courses.filter((c) => (c.totalStudents || 0) > 0).length;
  const enrolledThisYear = enrollmentData.reduce((s, d) => s + d.students, 0);

  const hasEnrollment = enrollmentData.some((d) => d.students > 0);
  const hasRevenue = revenueByMonth.some((r) => r.revenue > 0);

  /* Real client-side CSV export (payments + expenses) */
  const handleExport = () => {
    const rows: string[][] = [];
    payments.forEach((p) =>
      rows.push([
        "Payment",
        str(p.receiptNumber),
        str(p.studentName),
        String(num(p.amount)),
        str(p.method),
        str(p.paymentDate),
      ]),
    );
    expenses.forEach((e) =>
      rows.push([
        "Expense",
        "",
        str(e.title),
        String(num(e.amount)),
        str(e.category),
        str(e.createdAt).slice(0, 10),
      ]),
    );
    if (rows.length === 0) return toast.error("No report data to export yet");
    const csv = [
      ["Type", "Reference", "Name / Title", "Amount (NPR)", "Method / Category", "Date"],
      ...rows,
    ]
      .map((r) => r.map((c) => `"${c.replace(/"/g, '""')}"`).join(","))
      .join("\n");
    const blob = new Blob([csv], { type: "text/csv;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `reports-export-${new Date().toISOString().slice(0, 10)}.csv`;
    a.click();
    URL.revokeObjectURL(url);
    toast.success(`Exported ${rows.length} rows to CSV`);
  };

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
        subtitle="Insights computed from your live Firestore records — empty charts mean no data yet."
        actions={
          <button className="ap-btn" onClick={handleExport}>
            <Download className="w-4 h-4" /> Export CSV
          </button>
        }
      />

      <Tabs tabs={tabs} value={activeTab} onChange={setActiveTab} />

      <div className="mt-4">
        {activeTab === "overview" && (
          <OverviewTab
            lmsStats={lmsStats}
            feeStats={feeStats}
            lmsLoading={lmsLoading}
            feeLoading={feeLoading}
            coursePopularity={coursePopularity}
            enrollmentData={enrollmentData}
            revenueByMonth={revenueByMonth}
            totalStudents={totalStudentsCount}
            attendanceTrend={attendanceTrend}
            examResults={examResults}
            topPerformers={topPerformers}
            attendanceRate={attendanceRate}
            hasEnrollment={hasEnrollment}
            hasRevenue={hasRevenue}
          />
        )}
        {activeTab === "enrollment" && (
          <EnrollmentTab
            coursePopularity={coursePopularity}
            enrollmentData={enrollmentData}
            studentsCount={totalStudentsCount}
            coursesCount={courses.length}
            activeCoursesCount={activeCoursesCount}
            enrolledThisYear={enrolledThisYear}
            hasEnrollment={hasEnrollment}
          />
        )}
        {activeTab === "academic" && (
          <AcademicTab
            attendanceTrend={attendanceTrend}
            examResults={examResults}
            coursePerformance={coursePerformance}
            attendanceRate={attendanceRate}
            avgMarks={avgMarks}
            passRate={passRate}
            topScore={topScore}
          />
        )}
        {activeTab === "financial" && (
          <FinancialTab
            feeStats={feeStats}
            coursePopularity={coursePopularity}
            revenueByMonth={revenueByMonth}
            hasRevenue={hasRevenue}
          />
        )}
        {activeTab === "reports" && <ReportsTab />}
      </div>
    </div>
  );
}

/* ================================================================ */
/*  OVERVIEW TAB                                                    */
/* ================================================================ */
export function OverviewTab({
  lmsStats,
  feeStats,
  lmsLoading,
  feeLoading,
  coursePopularity,
  enrollmentData,
  totalStudents,
  attendanceTrend,
  examResults,
  topPerformers,
  attendanceRate,
  hasEnrollment,
}: any) {
  return (
    <div className="space-y-6">
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {lmsLoading || feeLoading ? (
          <>
            <Skeleton className="h-28" />
            <Skeleton className="h-28" />
            <Skeleton className="h-28" />
            <Skeleton className="h-28" />
          </>
        ) : (
          <>
            <StatCard
              label="Total Students"
              value={totalStudents || 0}
              icon={Users}
              tone="purple"
            />
            <StatCard
              label="Active Courses"
              value={lmsStats?.totalCourses ?? 0}
              icon={BookOpen}
              tone="info"
            />
            <StatCard
              label="Revenue"
              prefix="Rs"
              value={feeStats?.totalCollected ?? 0}
              icon={CreditCard}
              tone="success"
            />
            <StatCard
              label="Attendance Rate"
              value={attendanceRate === null ? "—" : `${attendanceRate}%`}
              icon={GraduationCap}
              tone="success"
            />
          </>
        )}
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-2 gap-4">
        <Panel title="Student Enrollment Trend" subtitle="New students added per month (this year)">
          {hasEnrollment ? (
            <div className="h-64">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={enrollmentData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--ap-border))" />
                  <XAxis dataKey="m" stroke="hsl(var(--ap-muted))" fontSize={11} />
                  <YAxis stroke="hsl(var(--ap-muted))" fontSize={11} />
                  <Tooltip
                    contentStyle={{
                      background: "hsl(var(--ap-panel))",
                      border: "1px solid hsl(var(--ap-border))",
                      borderRadius: 12,
                    }}
                  />
                  <Area
                    type="monotone"
                    dataKey="students"
                    stroke="hsl(262 83% 58%)"
                    fill="hsl(262 83% 58%)"
                    fillOpacity={0.15}
                  />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          ) : (
            <NoData />
          )}
        </Panel>

        <Panel title="Course Popularity" subtitle="Students per course">
          <div className="h-64">
            {coursePopularity.length > 0 ? (
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={coursePopularity}
                    innerRadius={50}
                    outerRadius={85}
                    dataKey="students"
                    paddingAngle={4}
                  >
                    {coursePopularity.map((c: any) => (
                      <Cell key={c.name} fill={c.color} />
                    ))}
                  </Pie>
                  <Tooltip
                    contentStyle={{
                      background: "hsl(var(--ap-panel))",
                      border: "1px solid hsl(var(--ap-border))",
                      borderRadius: 12,
                    }}
                  />
                  <Legend />
                </PieChart>
              </ResponsiveContainer>
            ) : (
              <div className="h-full flex items-center justify-center text-[hsl(var(--ap-muted))] text-sm">
                No course data yet
              </div>
            )}
          </div>
        </Panel>

        <Panel title="Attendance Trend" subtitle="Attendance rate % by month (from records)">
          {attendanceTrend.length > 0 ? (
            <div className="h-64">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={attendanceTrend}>
                  <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--ap-border))" />
                  <XAxis dataKey="m" stroke="hsl(var(--ap-muted))" fontSize={11} />
                  <YAxis stroke="hsl(var(--ap-muted))" fontSize={11} domain={[0, 100]} />
                  <Tooltip
                    contentStyle={{
                      background: "hsl(var(--ap-panel))",
                      border: "1px solid hsl(var(--ap-border))",
                      borderRadius: 12,
                    }}
                  />
                  <Line
                    type="monotone"
                    dataKey="rate"
                    stroke="hsl(152 60% 42%)"
                    strokeWidth={2}
                    dot={{ fill: "hsl(152 60% 42%)" }}
                  />
                </LineChart>
              </ResponsiveContainer>
            </div>
          ) : (
            <NoData />
          )}
        </Panel>

        <Panel title="Exam Results" subtitle="Average marks & pass rate by month (from results)">
          {examResults.length > 0 ? (
            <div className="h-64">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={examResults}>
                  <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--ap-border))" />
                  <XAxis dataKey="m" stroke="hsl(var(--ap-muted))" fontSize={11} />
                  <YAxis stroke="hsl(var(--ap-muted))" fontSize={11} />
                  <Tooltip
                    contentStyle={{
                      background: "hsl(var(--ap-panel))",
                      border: "1px solid hsl(var(--ap-border))",
                      borderRadius: 12,
                    }}
                  />
                  <Legend />
                  <Bar
                    dataKey="avg"
                    name="Avg Marks"
                    radius={[6, 6, 0, 0]}
                    fill="hsl(262 83% 58%)"
                  />
                  <Bar
                    dataKey="pass"
                    name="Pass Rate"
                    radius={[6, 6, 0, 0]}
                    fill="hsl(152 60% 42%)"
                  />
                </BarChart>
              </ResponsiveContainer>
            </div>
          ) : (
            <NoData />
          )}
        </Panel>
      </div>

      <Panel title="Top Performers" subtitle="Highest marks from recorded results">
        {topPerformers.length === 0 ? (
          <p className="text-sm text-[hsl(var(--ap-muted))] py-4 text-center">
            Not enough data yet — no results recorded.
          </p>
        ) : (
          <div className="space-y-2">
            {topPerformers.map((p: any, i: number) => (
              <div
                key={`${p.name}-${i}`}
                className="flex items-center gap-4 p-3 rounded-xl hover:bg-[hsl(var(--ap-border)/0.2)]"
              >
                <span className="text-lg font-black text-[hsl(var(--ap-muted))] w-8">{i + 1}</span>
                <div className="w-10 h-10 rounded-full ap-grad flex items-center justify-center text-white font-bold text-sm">
                  {p.name.charAt(0)}
                </div>
                <div className="flex-1">
                  <p className="font-semibold">{p.name}</p>
                  <p className="text-xs text-[hsl(var(--ap-muted))]">{p.course || "—"}</p>
                </div>
                <div className="text-right">
                  <p className="font-bold">{p.marks}%</p>
                </div>
                <Badge tone={p.marks >= 90 ? "success" : p.marks >= 80 ? "info" : "warning"}>
                  {p.marks >= 90 ? "Excellent" : p.marks >= 80 ? "Good" : "Average"}
                </Badge>
              </div>
            ))}
          </div>
        )}
      </Panel>
    </div>
  );
}

/* ================================================================ */
/*  ENROLLMENT TAB                                                  */
/* ================================================================ */
export function EnrollmentTab({
  coursePopularity,
  enrollmentData,
  studentsCount,
  coursesCount,
  activeCoursesCount,
  enrolledThisYear,
  hasEnrollment,
}: any) {
  return (
    <div className="space-y-4">
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <StatCard
          label="Students on Record"
          value={studentsCount || 0}
          icon={Users}
          tone="purple"
        />
        <StatCard label="Courses" value={coursesCount || 0} icon={BookOpen} tone="info" />
        <StatCard
          label="Courses with Students"
          value={activeCoursesCount || 0}
          icon={GraduationCap}
          tone="success"
        />
        <StatCard
          label="Enrolled This Year"
          value={enrolledThisYear || 0}
          icon={Award}
          tone="orange"
        />
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-2 gap-4">
        <Panel title="Monthly Enrollment" subtitle="New student records created per month">
          {hasEnrollment ? (
            <div className="h-64">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={enrollmentData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--ap-border))" />
                  <XAxis dataKey="m" stroke="hsl(var(--ap-muted))" fontSize={11} />
                  <YAxis stroke="hsl(var(--ap-muted))" fontSize={11} />
                  <Tooltip
                    contentStyle={{
                      background: "hsl(var(--ap-panel))",
                      border: "1px solid hsl(var(--ap-border))",
                      borderRadius: 12,
                    }}
                  />
                  <Bar
                    dataKey="students"
                    name="Students"
                    radius={[6, 6, 0, 0]}
                    fill="hsl(262 83% 58%)"
                  />
                </BarChart>
              </ResponsiveContainer>
            </div>
          ) : (
            <NoData />
          )}
        </Panel>

        <Panel title="Enrollment by Course" subtitle="Course-wise distribution">
          {coursePopularity.length > 0 ? (
            <div className="space-y-3">
              {coursePopularity.map((c: any) => {
                const maxStudents = Math.max(...coursePopularity.map((x: any) => x.students), 1);
                return (
                  <div key={c.name} className="flex items-center gap-3">
                    <div className="w-3 h-3 rounded-full" style={{ background: c.color }} />
                    <span className="text-sm flex-1">{c.name}</span>
                    <div className="w-32 h-2 rounded-full bg-[hsl(var(--ap-border))] overflow-hidden">
                      <div
                        className="h-2 rounded-full"
                        style={{
                          background: c.color,
                          width: `${(c.students / maxStudents) * 100}%`,
                        }}
                      />
                    </div>
                    <span className="text-sm font-bold w-8 text-right">{c.students}</span>
                  </div>
                );
              })}
            </div>
          ) : (
            <p className="text-sm text-[hsl(var(--ap-muted))] py-6 text-center">
              Not enough data yet — no course enrollments.
            </p>
          )}
        </Panel>
      </div>
    </div>
  );
}

/* ================================================================ */
/*  ACADEMIC TAB                                                    */
/* ================================================================ */
export function AcademicTab({
  attendanceTrend,
  examResults,
  coursePerformance,
  attendanceRate,
  avgMarks,
  passRate,
  topScore,
}: any) {
  const pct = (v: any) => (v === null || v === undefined ? "—" : `${v}%`);

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <StatCard
          label="Avg Attendance"
          value={pct(attendanceRate)}
          icon={CalendarCheck}
          tone="success"
        />
        <StatCard label="Avg Marks" value={pct(avgMarks)} icon={BarChart3} tone="info" />
        <StatCard label="Pass Rate" value={pct(passRate)} icon={CheckCircle} tone="success" />
        <StatCard label="Top Score" value={pct(topScore)} icon={Award} tone="purple" />
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-2 gap-4">
        <Panel title="Attendance Trend" subtitle="Monthly attendance rate (from records)">
          {attendanceTrend.length > 0 ? (
            <div className="h-64">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={attendanceTrend}>
                  <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--ap-border))" />
                  <XAxis dataKey="m" stroke="hsl(var(--ap-muted))" fontSize={11} />
                  <YAxis stroke="hsl(var(--ap-muted))" fontSize={11} domain={[0, 100]} />
                  <Tooltip
                    contentStyle={{
                      background: "hsl(var(--ap-panel))",
                      border: "1px solid hsl(var(--ap-border))",
                      borderRadius: 12,
                    }}
                  />
                  <Area
                    type="monotone"
                    dataKey="rate"
                    stroke="hsl(152 60% 42%)"
                    fill="hsl(152 60% 42%)"
                    fillOpacity={0.15}
                  />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          ) : (
            <NoData />
          )}
        </Panel>

        <Panel title="Exam Performance" subtitle="Average marks vs pass rate (from results)">
          {examResults.length > 0 ? (
            <div className="h-64">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={examResults}>
                  <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--ap-border))" />
                  <XAxis dataKey="m" stroke="hsl(var(--ap-muted))" fontSize={11} />
                  <YAxis stroke="hsl(var(--ap-muted))" fontSize={11} />
                  <Tooltip
                    contentStyle={{
                      background: "hsl(var(--ap-panel))",
                      border: "1px solid hsl(var(--ap-border))",
                      borderRadius: 12,
                    }}
                  />
                  <Legend />
                  <Line
                    type="monotone"
                    dataKey="avg"
                    name="Avg Marks"
                    stroke="hsl(262 83% 58%)"
                    strokeWidth={2}
                  />
                  <Line
                    type="monotone"
                    dataKey="pass"
                    name="Pass Rate"
                    stroke="hsl(152 60% 42%)"
                    strokeWidth={2}
                  />
                </LineChart>
              </ResponsiveContainer>
            </div>
          ) : (
            <NoData />
          )}
        </Panel>
      </div>

      <Panel title="Course Performance" subtitle="Average marks by course (from results)">
        {coursePerformance.length === 0 ? (
          <p className="text-sm text-[hsl(var(--ap-muted))] py-4 text-center">
            Not enough data yet — no results recorded.
          </p>
        ) : (
          <div className="space-y-3">
            {coursePerformance.map((c: any) => (
              <div key={c.name} className="flex items-center gap-4">
                <span className="text-sm flex-1">{c.name}</span>
                <div className="flex items-center gap-2">
                  <div className="w-24 h-2 rounded-full bg-[hsl(var(--ap-border))] overflow-hidden">
                    <div
                      className="h-2 rounded-full bg-[hsl(var(--ap-blue))]"
                      style={{ width: `${Math.min(100, c.avg)}%` }}
                    />
                  </div>
                  <span className="text-xs font-bold w-8">{c.avg}%</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-24 h-2 rounded-full bg-[hsl(var(--ap-border))] overflow-hidden">
                    <div
                      className="h-2 rounded-full bg-[hsl(var(--ap-success))]"
                      style={{ width: `${Math.min(100, c.pass)}%` }}
                    />
                  </div>
                  <span className="text-xs font-bold w-8">{c.pass}%</span>
                </div>
              </div>
            ))}
          </div>
        )}
      </Panel>
    </div>
  );
}

/* ================================================================ */
/*  FINANCIAL TAB                                                   */
/* ================================================================ */
export function FinancialTab({ feeStats, revenueByMonth, hasRevenue }: any) {
  const { isLoading } = useFeeStats();
  const { invoices } = useInvoices();

  /* Real invoiced amount per course (payments don't carry a course field) */
  const feeByCourse = useMemo(() => {
    const map: Record<string, number> = {};
    invoices.forEach((i) => {
      const key = str(i.courseName) || "Unassigned";
      map[key] = (map[key] || 0) + num(i.totalAmount);
    });
    return Object.entries(map)
      .map(([name, value]) => ({ name, value }))
      .sort((a, b) => b.value - a.value)
      .slice(0, 6);
  }, [invoices]);

  /* Real share of collected amount per payment method is rendered by PaymentMethodsList */

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {isLoading ? (
          <>
            <Skeleton className="h-28" />
            <Skeleton className="h-28" />
            <Skeleton className="h-28" />
            <Skeleton className="h-28" />
          </>
        ) : (
          <>
            <StatCard
              label="Total Revenue"
              prefix="Rs"
              value={feeStats?.totalRevenue ?? 0}
              icon={CreditCard}
              tone="success"
            />
            <StatCard
              label="Collected"
              prefix="Rs"
              value={feeStats?.totalCollected ?? 0}
              icon={ArrowUpRight}
              tone="info"
            />
            <StatCard
              label="Pending"
              prefix="Rs"
              value={feeStats?.pendingAmount ?? 0}
              icon={ArrowDownRight}
              tone="danger"
            />
            <StatCard
              label="Collection Rate"
              value={`${feeStats?.collectionRate ?? 0}%`}
              icon={TrendingUp}
              tone="success"
            />
          </>
        )}
      </div>

      <Panel title="Revenue Trend" subtitle="Monthly payment collection (from payments)">
        {hasRevenue ? (
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={revenueByMonth}>
                <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--ap-border))" />
                <XAxis dataKey="m" stroke="hsl(var(--ap-muted))" fontSize={11} />
                <YAxis stroke="hsl(var(--ap-muted))" fontSize={11} />
                <Tooltip
                  contentStyle={{
                    background: "hsl(var(--ap-panel))",
                    border: "1px solid hsl(var(--ap-border))",
                    borderRadius: 12,
                  }}
                  formatter={(v: number) => `Rs ${v.toLocaleString()}`}
                />
                <Area
                  type="monotone"
                  dataKey="revenue"
                  stroke="hsl(262 83% 58%)"
                  fill="hsl(262 83% 58%)"
                  fillOpacity={0.15}
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        ) : (
          <NoData />
        )}
      </Panel>

      <div className="grid grid-cols-1 xl:grid-cols-2 gap-4">
        <Panel title="Invoiced Amount by Course" subtitle="Sum of invoice totals per course">
          <div className="h-48">
            {feeByCourse.length > 0 ? (
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={feeByCourse}
                    innerRadius={40}
                    outerRadius={70}
                    dataKey="value"
                    paddingAngle={4}
                  >
                    {feeByCourse.map((c, i) => (
                      <Cell key={c.name} fill={COLORS[i % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip
                    contentStyle={{
                      background: "hsl(var(--ap-panel))",
                      border: "1px solid hsl(var(--ap-border))",
                      borderRadius: 12,
                    }}
                    formatter={(v: number) => `Rs ${v.toLocaleString()}`}
                  />
                </PieChart>
              </ResponsiveContainer>
            ) : (
              <div className="h-full">
                <NoData height="h-full" />
              </div>
            )}
          </div>
        </Panel>

        <Panel title="Payment Methods" subtitle="Share of collected amount by method">
          <PaymentMethodsList />
        </Panel>
      </div>
    </div>
  );
}

function PaymentMethodsList() {
  const { payments } = usePayments();

  const methods = useMemo(() => {
    const map: Record<string, number> = {};
    payments.forEach((p) => {
      const key = str(p.method) || "other";
      map[key] = (map[key] || 0) + num(p.amount);
    });
    const total = Object.values(map).reduce((s, v) => s + v, 0) || 1;
    return Object.entries(map)
      .map(([method, amount]) => ({ method, amount, pct: Math.round((amount / total) * 100) }))
      .sort((a, b) => b.amount - a.amount);
  }, [payments]);

  if (methods.length === 0) {
    return (
      <p className="text-sm text-[hsl(var(--ap-muted))] py-6 text-center">
        Not enough data yet — no payments recorded.
      </p>
    );
  }

  return (
    <div className="space-y-3">
      {methods.map((p) => (
        <div key={p.method} className="flex items-center gap-3">
          <span className="text-sm flex-1 capitalize">{p.method.replace(/_/g, " ")}</span>
          <div className="w-32 h-2 rounded-full bg-[hsl(var(--ap-border))] overflow-hidden">
            <div
              className="h-2 rounded-full bg-[hsl(var(--ap-blue))]"
              style={{ width: `${p.pct}%` }}
            />
          </div>
          <span className="text-xs font-bold w-8 text-right">{p.pct}%</span>
        </div>
      ))}
    </div>
  );
}

/* ================================================================ */
/*  REPORTS TAB                                                     */
/* ================================================================ */
export function ReportsTab() {
  const navigate = useNavigate();
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
      {reportCards.map((r) => {
        const Icon = r.icon;
        return (
          <motion.div
            key={r.title}
            whileHover={{ y: -4 }}
            onClick={() => navigate(r.to)}
            className="ap-card p-5 cursor-pointer"
            role="button"
            tabIndex={0}
            onKeyDown={(e) => {
              if (e.key === "Enter") navigate(r.to);
            }}
          >
            <div className="flex items-start gap-4">
              <div className="w-12 h-12 rounded-xl ap-grad flex items-center justify-center text-white flex-shrink-0">
                <Icon className="w-5 h-5" />
              </div>
              <div>
                <h3 className="font-bold">{r.title}</h3>
                <p className="text-sm text-[hsl(var(--ap-muted))] mt-1">{r.desc}</p>
                <span className="inline-flex items-center gap-1.5 text-xs font-semibold text-[hsl(var(--ap-blue))] mt-3">
                  Open module <ArrowRight className="w-3.5 h-3.5" />
                </span>
              </div>
            </div>
          </motion.div>
        );
      })}
    </div>
  );
}
