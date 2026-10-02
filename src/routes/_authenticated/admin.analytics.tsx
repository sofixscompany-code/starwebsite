import { useState } from "react";
import {
  Users,
  GraduationCap,
  Wallet,
  TrendingUp,
  Target,
  ClipboardList,
  BarChart3,
  Receipt,
  Bell,
} from "lucide-react";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  CartesianGrid,
  AreaChart,
  Area,
  PieChart,
  Pie,
  Cell,
  LineChart,
  Line,
} from "recharts";
import { PageHeader } from "@/components/admin/AdminShell";
import { StatCard, Panel, Tabs, ProgressBar } from "@/components/admin/ui";
import { useSuperAdminStats } from "@/hooks/use-dashboard-data";
import { useModuleData } from "@/hooks/use-module-data";

const fmt = (n: number) => (n >= 1000 ? `${(n / 1000).toFixed(1)}k` : String(n));

/** Empty-state placeholder for charts that have no real data yet. */
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

const COLORS = [
  "hsl(262 83% 58%)",
  "hsl(24 95% 58%)",
  "hsl(210 92% 55%)",
  "hsl(152 60% 42%)",
  "hsl(355 82% 58%)",
  "hsl(38 92% 55%)",
];

export function AnalyticsPage() {
  const [activeTab, setActiveTab] = useState("overview");
  const { data } = useSuperAdminStats();
  const stats = data ?? {
    totalStudents: 0,
    totalTeachers: 0,
    totalParents: 0,
    revenue: 0,
    admissionsCount: 0,
    activeUsers: 0,
    recentActivities: [],
    pendingApprovals: [],
    revenueByMonth: [],
    expenseByMonth: [],
    incomeBreakdown: [],
    passRate: 0,
    retention: 0,
    hasData: false,
  };

  const revenueByMonth = stats.revenueByMonth.map((r) => ({ m: r.month, revenue: r.amount }));
  const expenseByMonth = stats.expenseByMonth.map((r) => ({ m: r.month, expenses: r.amount }));
  const trendData = revenueByMonth.map((r, i) => ({
    m: r.m,
    revenue: r.revenue,
    expenses: expenseByMonth[i]?.expenses ?? 0,
  }));
  const incomeBreakdown = stats.incomeBreakdown.map((r) => ({ name: r.name, value: r.value }));

  // Live collections used for honest KPIs (the dashboard hook falls back to
  // placeholder pass/retention rates when there is no data — we don't show those).
  const { rows: results } = useModuleData("results");
  const { rows: admissions } = useModuleData("admissions");
  const { rows: payments } = useModuleData("payments");
  const { rows: notices } = useModuleData("notices");

  const passRate = results.length
    ? Math.round(
        (results.filter((r) => Number(r.marks ?? r.score ?? 0) >= 40).length / results.length) *
          100,
      )
    : null;
  const dropped = admissions.filter((a) => String(a.status) === "dropped").length;
  const retention =
    stats.totalStudents > 0
      ? Math.max(0, Math.round(((stats.totalStudents - dropped) / stats.totalStudents) * 100))
      : null;

  const hasRevenueSeries = revenueByMonth.some((r) => r.revenue > 0);
  const hasExpenseSeries = expenseByMonth.some((r) => r.expenses > 0);
  const hasIncomeBreakdown = incomeBreakdown.length > 0;

  return (
    <div>
      <PageHeader title="Analytics" subtitle="Live metrics and trends from your institute data." />

      <Tabs
        tabs={[
          { label: "Overview", value: "overview" },
          { label: "Revenue", value: "revenue" },
          { label: "Academic", value: "academic" },
        ]}
        value={activeTab}
        onChange={setActiveTab}
      />

      <div className="mt-4">
        {activeTab === "overview" && (
          <>
            <div className="grid grid-cols-2 md:grid-cols-3 xl:grid-cols-4 gap-4 mb-6">
              <StatCard
                label="Students"
                value={stats.totalStudents}
                icon={GraduationCap}
                tone="purple"
              />
              <StatCard label="Teachers" value={stats.totalTeachers} icon={Users} tone="info" />
              <StatCard
                label="Total Revenue"
                prefix="Rs "
                value={stats.revenue}
                icon={Wallet}
                tone="success"
              />
              <StatCard
                label="Admissions"
                value={stats.admissionsCount}
                icon={ClipboardList}
                tone="orange"
              />
              <StatCard
                label="Pass Rate"
                value={passRate === null ? "—" : `${passRate}%`}
                icon={Target}
                tone="success"
              />
              <StatCard
                label="Retention"
                value={retention === null ? "—" : `${retention}%`}
                icon={TrendingUp}
                tone="purple"
              />
              <StatCard
                label="Payments Recorded"
                value={payments.length}
                icon={Receipt}
                tone="info"
              />
              <StatCard
                label="Notices Published"
                value={notices.length}
                icon={Bell}
                tone="orange"
              />
            </div>

            <div className="grid grid-cols-1 xl:grid-cols-2 gap-4">
              <Panel title="Revenue Trend" subtitle="Last 6 months · collected payments">
                {hasRevenueSeries ? (
                  <div className="h-64">
                    <ResponsiveContainer width="100%" height="100%">
                      <AreaChart data={revenueByMonth}>
                        <defs>
                          <linearGradient id="stud" x1="0" x2="0" y1="0" y2="1">
                            <stop offset="0%" stopColor="hsl(262 83% 58%)" stopOpacity={0.4} />
                            <stop offset="100%" stopColor="hsl(262 83% 58%)" stopOpacity={0} />
                          </linearGradient>
                        </defs>
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
                          dataKey="revenue"
                          stroke="hsl(262 83% 58%)"
                          fill="url(#stud)"
                          strokeWidth={2}
                        />
                      </AreaChart>
                    </ResponsiveContainer>
                  </div>
                ) : (
                  <NoData />
                )}
              </Panel>
              <Panel title="Revenue vs Expenses" subtitle="Last 6 months">
                {hasRevenueSeries || hasExpenseSeries ? (
                  <div className="h-64">
                    <ResponsiveContainer width="100%" height="100%">
                      <LineChart data={trendData}>
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
                        <Line
                          type="monotone"
                          dataKey="revenue"
                          stroke="hsl(152 60% 42%)"
                          strokeWidth={3}
                          dot={{ r: 4 }}
                        />
                        {hasExpenseSeries ? (
                          <Line
                            type="monotone"
                            dataKey="expenses"
                            stroke="hsl(355 82% 58%)"
                            strokeWidth={3}
                            dot={{ r: 4 }}
                          />
                        ) : null}
                      </LineChart>
                    </ResponsiveContainer>
                  </div>
                ) : (
                  <NoData />
                )}
              </Panel>
            </div>

            <div className="grid grid-cols-1 xl:grid-cols-3 gap-4 mt-4">
              <Panel title="Income Breakdown" subtitle="By payment category / method">
                {hasIncomeBreakdown ? (
                  <>
                    <div className="h-56">
                      <ResponsiveContainer width="100%" height="100%">
                        <PieChart>
                          <Pie
                            data={incomeBreakdown}
                            innerRadius={50}
                            outerRadius={85}
                            dataKey="value"
                            paddingAngle={4}
                          >
                            {incomeBreakdown.map((_, i) => (
                              <Cell key={i} fill={COLORS[i % COLORS.length]} />
                            ))}
                          </Pie>
                          <Tooltip
                            contentStyle={{
                              background: "hsl(var(--ap-panel))",
                              border: "1px solid hsl(var(--ap-border))",
                              borderRadius: 12,
                            }}
                          />
                        </PieChart>
                      </ResponsiveContainer>
                    </div>
                    <div className="flex flex-wrap gap-2 text-xs text-muted-foreground mt-2">
                      {incomeBreakdown.map((c, i) => (
                        <span key={c.name} className="inline-flex items-center gap-1.5">
                          <span
                            className="w-2 h-2 rounded-full"
                            style={{ background: COLORS[i % COLORS.length] }}
                          />
                          {c.name}
                        </span>
                      ))}
                    </div>
                  </>
                ) : (
                  <div className="h-56">
                    <NoData height="h-full" />
                  </div>
                )}
              </Panel>
              <Panel title="Academic Health">
                <div className="space-y-3">
                  <ProgressBar
                    value={retention ?? 0}
                    tone="success"
                    label={
                      retention === null
                        ? "Retention · no students yet"
                        : `Retention · ${retention}%`
                    }
                  />
                  <ProgressBar
                    value={passRate ?? 0}
                    tone="purple"
                    label={
                      passRate === null ? "Pass Rate · no results yet" : `Pass Rate · ${passRate}%`
                    }
                  />
                  <ProgressBar
                    value={stats.totalStudents ? 100 : 0}
                    tone="orange"
                    label={`Students ${stats.totalStudents}`}
                  />
                  <ProgressBar
                    value={stats.totalTeachers ? 100 : 0}
                    tone="info"
                    label={`Teachers ${stats.totalTeachers}`}
                  />
                </div>
              </Panel>
              <Panel title="Pending Approvals" subtitle="Admissions awaiting action">
                <div className="space-y-2">
                  {stats.pendingApprovals.length === 0 ? (
                    <p className="text-sm text-muted-foreground">
                      All caught up — no pending approvals.
                    </p>
                  ) : (
                    stats.pendingApprovals.map((a) => (
                      <div
                        key={a.id}
                        className="flex items-center justify-between text-sm rounded-lg border border-border px-3 py-2"
                      >
                        <span className="font-semibold truncate">
                          {String(a.studentName || a.fullName || a.name || "Applicant")}
                        </span>
                        <span className="text-xs text-muted-foreground">
                          {String(a.course || "")}
                        </span>
                      </div>
                    ))
                  )}
                </div>
              </Panel>
            </div>
          </>
        )}

        {activeTab === "revenue" && (
          <div className="space-y-4">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <StatCard
                label="Total Revenue"
                prefix="Rs "
                value={stats.revenue}
                icon={Wallet}
                tone="success"
              />
              <StatCard
                label="Monthly Avg"
                prefix="Rs "
                value={
                  revenueByMonth.length
                    ? Math.round(
                        revenueByMonth.reduce((s, r) => s + r.revenue, 0) / revenueByMonth.length,
                      )
                    : 0
                }
                icon={TrendingUp}
                tone="purple"
              />
              <StatCard
                label="Monthly Avg Expense"
                prefix="Rs "
                value={
                  expenseByMonth.length
                    ? Math.round(
                        expenseByMonth.reduce((s, r) => s + r.expenses, 0) / expenseByMonth.length,
                      )
                    : 0
                }
                icon={BarChart3}
                tone="orange"
              />
              <StatCard
                label="Income Sources"
                value={incomeBreakdown.length}
                icon={TrendingUp}
                tone="info"
              />
            </div>
            <Panel title="Revenue Trend" subtitle="Last 6 months">
              {hasRevenueSeries ? (
                <div className="h-72">
                  <ResponsiveContainer width="100%" height="100%">
                    <AreaChart data={revenueByMonth}>
                      <defs>
                        <linearGradient id="rev3" x1="0" x2="0" y1="0" y2="1">
                          <stop offset="0%" stopColor="hsl(262 83% 58%)" stopOpacity={0.5} />
                          <stop offset="100%" stopColor="hsl(262 83% 58%)" stopOpacity={0} />
                        </linearGradient>
                      </defs>
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
                        dataKey="revenue"
                        stroke="hsl(262 83% 58%)"
                        fill="url(#rev3)"
                        strokeWidth={2}
                      />
                    </AreaChart>
                  </ResponsiveContainer>
                </div>
              ) : (
                <NoData height="h-72" />
              )}
            </Panel>
          </div>
        )}

        {activeTab === "academic" && (
          <div className="grid grid-cols-1 xl:grid-cols-2 gap-4">
            <Panel title="Income by Category">
              {hasIncomeBreakdown ? (
                <div className="h-72">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={incomeBreakdown}>
                      <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--ap-border))" />
                      <XAxis dataKey="name" stroke="hsl(var(--ap-muted))" fontSize={11} />
                      <YAxis stroke="hsl(var(--ap-muted))" fontSize={11} />
                      <Tooltip
                        contentStyle={{
                          background: "hsl(var(--ap-panel))",
                          border: "1px solid hsl(var(--ap-border))",
                          borderRadius: 12,
                        }}
                      />
                      <Bar dataKey="value" radius={[6, 6, 0, 0]}>
                        {incomeBreakdown.map((_, i) => (
                          <Cell key={i} fill={COLORS[i % COLORS.length]} />
                        ))}
                      </Bar>
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              ) : (
                <NoData height="h-72" />
              )}
            </Panel>
            <Panel title="Institute Health">
              <div className="space-y-3">
                <ProgressBar
                  value={retention ?? 0}
                  tone="success"
                  label={
                    retention === null
                      ? "Student Retention · no students yet"
                      : `Student Retention · ${retention}%`
                  }
                />
                <ProgressBar
                  value={passRate ?? 0}
                  tone="purple"
                  label={
                    passRate === null
                      ? "Exam Pass Rate · no results yet"
                      : `Exam Pass Rate · ${passRate}%`
                  }
                />
                <div className="grid grid-cols-2 gap-3 pt-2">
                  <div className="ap-card p-4 text-center">
                    <p className="text-3xl font-black text-[hsl(var(--ap-purple))]">
                      {fmt(stats.totalStudents)}
                    </p>
                    <p className="text-xs uppercase font-bold text-muted-foreground">Students</p>
                  </div>
                  <div className="ap-card p-4 text-center">
                    <p className="text-3xl font-black text-[hsl(var(--ap-success))]">
                      {fmt(stats.totalTeachers)}
                    </p>
                    <p className="text-xs uppercase font-bold text-muted-foreground">Teachers</p>
                  </div>
                  <div className="ap-card p-4 text-center">
                    <p className="text-3xl font-black text-[hsl(var(--ap-info))]">
                      {fmt(stats.totalParents)}
                    </p>
                    <p className="text-xs uppercase font-bold text-muted-foreground">Parents</p>
                  </div>
                  <div className="ap-card p-4 text-center">
                    <p className="text-3xl font-black text-[hsl(var(--ap-orange))]">
                      {fmt(stats.admissionsCount)}
                    </p>
                    <p className="text-xs uppercase font-bold text-muted-foreground">Admissions</p>
                  </div>
                </div>
              </div>
            </Panel>
          </div>
        )}
      </div>
    </div>
  );
}
