import { useState } from "react";
import {
  Users,
  GraduationCap,
  Wallet,
  TrendingUp,
  Target,
  ClipboardList,
  BarChart3,
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

const fmt = (n: number) => (n >= 1000 ? `${(n / 1000).toFixed(1)}k` : String(n));

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
            <div className="grid grid-cols-2 md:grid-cols-3 xl:grid-cols-6 gap-4 mb-6">
              <StatCard
                label="Students"
                value={stats.totalStudents}
                delta={0}
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
                value={`${stats.passRate}%`}
                icon={Target}
                tone="success"
              />
              <StatCard
                label="Retention"
                value={`${stats.retention}%`}
                icon={TrendingUp}
                tone="purple"
              />
            </div>

            <div className="grid grid-cols-1 xl:grid-cols-2 gap-4">
              <Panel title="Revenue Trend" subtitle="Last 6 months · collected payments">
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
              </Panel>
              <Panel title="Revenue vs Expenses" subtitle="Last 6 months">
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
                      {expenseByMonth.length ? (
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
              </Panel>
            </div>

            <div className="grid grid-cols-1 xl:grid-cols-3 gap-4 mt-4">
              <Panel title="Income Breakdown" subtitle="By payment category / method">
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
                  {incomeBreakdown.length === 0 && <span>No payments recorded yet.</span>}
                </div>
              </Panel>
              <Panel title="Academic Health">
                <div className="space-y-3">
                  <ProgressBar
                    value={stats.retention}
                    tone="success"
                    label={`Retention · ${stats.retention}%`}
                  />
                  <ProgressBar
                    value={stats.passRate}
                    tone="purple"
                    label={`Pass Rate · ${stats.passRate}%`}
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
                        <span className="font-semibold truncate">{String(a.name || "")}</span>
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
            </Panel>
          </div>
        )}

        {activeTab === "academic" && (
          <div className="grid grid-cols-1 xl:grid-cols-2 gap-4">
            <Panel title="Income by Category">
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
            </Panel>
            <Panel title="Institute Health">
              <div className="space-y-3">
                <ProgressBar
                  value={stats.retention}
                  tone="success"
                  label={`Student Retention · ${stats.retention}%`}
                />
                <ProgressBar
                  value={stats.passRate}
                  tone="purple"
                  label={`Exam Pass Rate · ${stats.passRate}%`}
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
