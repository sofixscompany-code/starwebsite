import {  } from "react-router-dom";
import { useState } from "react";
import {
  PieChart as PieChartIcon, BarChart3, TrendingUp, Users, GraduationCap,
  Wallet, Target, Eye, Download, Search, Filter,
} from "lucide-react";
import {
  BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid,
  AreaChart, Area, PieChart, Pie, Cell, LineChart, Line, RadarChart,
  Radar, PolarGrid, PolarAngleAxis, PolarRadiusAxis, Legend,
} from "recharts";
import { PageHeader } from "@/components/admin/AdminShell";
import { StatCard, Panel, Badge, Tabs, ProgressBar } from "@/components/admin/ui";

const growthData = [
  { m: "Jan", students: 850, revenue: 480000 },
  { m: "Feb", students: 920, revenue: 520000 },
  { m: "Mar", students: 980, revenue: 610000 },
  { m: "Apr", students: 1020, revenue: 590000 },
  { m: "May", students: 1080, revenue: 720000 },
  { m: "Jun", students: 1140, revenue: 810000 },
  { m: "Jul", students: 1190, revenue: 890000 },
  { m: "Aug", students: 1230, revenue: 950000 },
  { m: "Sep", students: 1284, revenue: 1020000 },
];

const retentionData = [
  { month: "Jan", retention: 94 }, { month: "Feb", retention: 92 },
  { month: "Mar", retention: 95 }, { month: "Apr", retention: 93 },
  { month: "May", retention: 96 }, { month: "Jun", retention: 94 },
  { month: "Jul", retention: 97 }, { month: "Aug", retention: 95 },
  { month: "Sep", retention: 96 },
];

const teacherAnalytics = [
  { name: "Teaching Quality", score: 92 },
  { name: "Punctuality", score: 88 },
  { name: "Student Rating", score: 95 },
  { name: "Material Quality", score: 85 },
  { name: "Engagement", score: 90 },
  { name: "Results", score: 87 },
];

const parentEngagement = [
  { metric: "Portal Active", value: 83, total: 100 },
  { metric: "Meeting Attendance", value: 68, total: 100 },
  { metric: "Fee On-time", value: 78, total: 100 },
  { metric: "Communication", value: 72, total: 100 },
  { metric: "Complaints Resolved", value: 95, total: 100 },
];

export function AnalyticsPage() {
  const [activeTab, setActiveTab] = useState("overview");

  return (
    <div>
      <PageHeader
        title="Analytics"
        subtitle="Interactive charts, growth metrics, and predictive insights."
        actions={
          <>
            <button className="ap-btn-ghost"><Download className="w-4 h-4" /> Export</button>
            <button className="ap-btn"><Eye className="w-4 h-4" /> Live Dashboard</button>
          </>
        }
      />

      <Tabs
        tabs={[
          { label: "Overview", value: "overview" },
          { label: "Revenue Growth", value: "revenue" },
          { label: "Admissions", value: "admissions" },
          { label: "Retention", value: "retention" },
          { label: "Teachers", value: "teachers" },
          { label: "Parents", value: "parents" },
        ]}
        value={activeTab}
        onChange={setActiveTab}
      />

      <div className="mt-4">
        {activeTab === "overview" && (
          <>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
              <StatCard label="Total Students" value={1284} delta={12} icon={GraduationCap} tone="purple" />
              <StatCard label="Monthly Revenue" prefix="₹" value={1020000} delta={18} icon={Wallet} tone="success" />
              <StatCard label="Retention Rate" value="96%" delta={2} icon={TrendingUp} tone="success" />
              <StatCard label="Conversion Rate" value="34%" delta={5} icon={Target} tone="orange" />
            </div>

            <div className="grid grid-cols-1 xl:grid-cols-2 gap-4">
              <Panel title="Student Growth" subtitle="Monthly enrollment trend">
                <div className="h-64">
                  <ResponsiveContainer width="100%" height="100%">
                    <AreaChart data={growthData}>
                      <defs>
                        <linearGradient id="stud" x1="0" x2="0" y1="0" y2="1">
                          <stop offset="0%" stopColor="hsl(262 83% 58%)" stopOpacity={0.4} />
                          <stop offset="100%" stopColor="hsl(262 83% 58%)" stopOpacity={0} />
                        </linearGradient>
                      </defs>
                      <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--ap-border))" />
                      <XAxis dataKey="m" stroke="hsl(var(--ap-muted))" fontSize={11} />
                      <YAxis stroke="hsl(var(--ap-muted))" fontSize={11} />
                      <Tooltip contentStyle={{ background: "hsl(var(--ap-panel))", border: "1px solid hsl(var(--ap-border))", borderRadius: 12 }} />
                      <Area type="monotone" dataKey="students" stroke="hsl(262 83% 58%)" fill="url(#stud)" strokeWidth={2} />
                    </AreaChart>
                  </ResponsiveContainer>
                </div>
              </Panel>
              <Panel title="Revenue Growth" subtitle="Monthly revenue trend">
                <div className="h-64">
                  <ResponsiveContainer width="100%" height="100%">
                    <LineChart data={growthData}>
                      <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--ap-border))" />
                      <XAxis dataKey="m" stroke="hsl(var(--ap-muted))" fontSize={11} />
                      <YAxis stroke="hsl(var(--ap-muted))" fontSize={11} />
                      <Tooltip contentStyle={{ background: "hsl(var(--ap-panel))", border: "1px solid hsl(var(--ap-border))", borderRadius: 12 }} />
                      <Line type="monotone" dataKey="revenue" stroke="hsl(24 95% 58%)" strokeWidth={3} dot={{ r: 4 }} />
                    </LineChart>
                  </ResponsiveContainer>
                </div>
              </Panel>
            </div>

            <div className="grid grid-cols-1 xl:grid-cols-3 gap-4 mt-4">
              <Panel title="Student Retention" subtitle="Monthly retention rate">
                <div className="h-56">
                  <ResponsiveContainer width="100%" height="100%">
                    <LineChart data={retentionData}>
                      <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--ap-border))" />
                      <XAxis dataKey="month" stroke="hsl(var(--ap-muted))" fontSize={11} />
                      <YAxis domain={[85, 100]} stroke="hsl(var(--ap-muted))" fontSize={11} />
                      <Tooltip contentStyle={{ background: "hsl(var(--ap-panel))", border: "1px solid hsl(var(--ap-border))", borderRadius: 12 }} />
                      <Line type="monotone" dataKey="retention" stroke="hsl(152 60% 42%)" strokeWidth={3} dot={{ r: 4 }} />
                    </LineChart>
                  </ResponsiveContainer>
                </div>
              </Panel>
              <Panel title="Teacher Performance Radar">
                <div className="h-56">
                  <ResponsiveContainer width="100%" height="100%">
                    <RadarChart data={teacherAnalytics}>
                      <PolarGrid stroke="hsl(var(--ap-border))" />
                      <PolarAngleAxis dataKey="name" tick={{ fontSize: 9 }} />
                      <PolarRadiusAxis domain={[0, 100]} tick={{ fontSize: 9 }} />
                      <Radar name="Score" dataKey="score" stroke="hsl(262 83% 58%)" fill="hsl(262 83% 58%)" fillOpacity={0.3} />
                      <Tooltip contentStyle={{ background: "hsl(var(--ap-panel))", border: "1px solid hsl(var(--ap-border))", borderRadius: 12 }} />
                    </RadarChart>
                  </ResponsiveContainer>
                </div>
              </Panel>
              <Panel title="Key Metrics">
                <div className="space-y-3">
                  <ProgressBar value={96} tone="success" label="Student Retention" />
                  <ProgressBar value={92} tone="purple" label="Attendance Rate" />
                  <ProgressBar value={85} tone="orange" label="Fee Collection" />
                  <ProgressBar value={78} tone="info" label="Parent Engagement" />
                  <ProgressBar value={94} tone="success" label="Teacher Satisfaction" />
                  <ProgressBar value={63} tone="warning" label="Lead Conversion" />
                </div>
              </Panel>
            </div>
          </>
        )}

        {activeTab === "revenue" && (
          <div className="space-y-4">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <StatCard label="Total Revenue" prefix="₹" value={6580000} delta={18} icon={Wallet} tone="success" />
              <StatCard label="Avg per Student" prefix="₹" value={5125} delta={8} icon={GraduationCap} tone="purple" />
              <StatCard label="Growth Rate" value="23%" delta={5} icon={TrendingUp} tone="success" />
              <StatCard label="Profit Margin" value="63%" delta={3} icon={BarChart3} tone="orange" />
            </div>
            <Panel title="Revenue Trend" subtitle="9-month revenue analysis">
              <div className="h-72">
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={growthData}>
                    <defs>
                      <linearGradient id="rev3" x1="0" x2="0" y1="0" y2="1">
                        <stop offset="0%" stopColor="hsl(262 83% 58%)" stopOpacity={0.5} />
                        <stop offset="100%" stopColor="hsl(262 83% 58%)" stopOpacity={0} />
                      </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--ap-border))" />
                    <XAxis dataKey="m" stroke="hsl(var(--ap-muted))" fontSize={11} />
                    <YAxis stroke="hsl(var(--ap-muted))" fontSize={11} />
                    <Tooltip contentStyle={{ background: "hsl(var(--ap-panel))", border: "1px solid hsl(var(--ap-border))", borderRadius: 12 }} />
                    <Area type="monotone" dataKey="revenue" stroke="hsl(262 83% 58%)" fill="url(#rev3)" strokeWidth={2} />
                  </AreaChart>
                </ResponsiveContainer>
              </div>
            </Panel>
          </div>
        )}

        {activeTab === "admissions" && (
          <Panel title="Admission Analytics" subtitle="Conversion funnel analysis">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-3">
                {[
                  { stage: "Website Visitors", count: 12450, pct: 100 },
                  { stage: "Inquiries", count: 3240, pct: 26 },
                  { stage: "Applications", count: 1820, pct: 15 },
                  { stage: "Admissions", count: 1120, pct: 9 },
                  { stage: "Enrolled", count: 986, pct: 8 },
                ].map((s) => (
                  <div key={s.stage} className="ap-card p-3">
                    <div className="flex justify-between text-sm mb-1">
                      <span className="font-semibold">{s.stage}</span>
                      <span className="font-bold">{s.count.toLocaleString()}</span>
                    </div>
                    <ProgressBar value={s.pct} tone={s.pct > 50 ? "success" : s.pct > 20 ? "warning" : "danger"} label={`${s.pct}%`} />
                  </div>
                ))}
              </div>
              <Panel title="Source Distribution">
                <div className="h-56">
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie data={[
                        { name: "Website", value: 38, color: "hsl(262 83% 58%)" },
                        { name: "Walk-in", value: 28, color: "hsl(24 95% 58%)" },
                        { name: "Facebook", value: 18, color: "hsl(210 92% 55%)" },
                        { name: "Referral", value: 12, color: "hsl(152 60% 42%)" },
                        { name: "Google", value: 4, color: "hsl(355 82% 58%)" },
                      ]} innerRadius={50} outerRadius={85} dataKey="value" paddingAngle={4}>
                        {[
                          { name: "Website", value: 38, color: "hsl(262 83% 58%)" },
                          { name: "Walk-in", value: 28, color: "hsl(24 95% 58%)" },
                          { name: "Facebook", value: 18, color: "hsl(210 92% 55%)" },
                          { name: "Referral", value: 12, color: "hsl(152 60% 42%)" },
                          { name: "Google", value: 4, color: "hsl(355 82% 58%)" },
                        ].map((c) => <Cell key={c.name} fill={c.color} />)}
                      </Pie>
                      <Tooltip contentStyle={{ background: "hsl(var(--ap-panel))", border: "1px solid hsl(var(--ap-border))", borderRadius: 12 }} />
                    </PieChart>
                  </ResponsiveContainer>
                </div>
              </Panel>
            </div>
          </Panel>
        )}

        {activeTab === "retention" && (
          <Panel title="Student Retention Analysis" subtitle="Monthly retention rates">
            <div className="h-72">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={retentionData}>
                  <defs>
                    <linearGradient id="ret" x1="0" x2="0" y1="0" y2="1">
                      <stop offset="0%" stopColor="hsl(152 60% 42%)" stopOpacity={0.4} />
                      <stop offset="100%" stopColor="hsl(152 60% 42%)" stopOpacity={0} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--ap-border))" />
                  <XAxis dataKey="month" stroke="hsl(var(--ap-muted))" fontSize={11} />
                  <YAxis domain={[85, 100]} stroke="hsl(var(--ap-muted))" fontSize={11} />
                  <Tooltip contentStyle={{ background: "hsl(var(--ap-panel))", border: "1px solid hsl(var(--ap-border))", borderRadius: 12 }} />
                  <Area type="monotone" dataKey="retention" stroke="hsl(152 60% 42%)" fill="url(#ret)" strokeWidth={2} />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </Panel>
        )}

        {activeTab === "teachers" && (
          <div className="grid grid-cols-1 xl:grid-cols-2 gap-4">
            <Panel title="Teacher Performance Radar">
              <div className="h-72">
                <ResponsiveContainer width="100%" height="100%">
                  <RadarChart data={teacherAnalytics}>
                    <PolarGrid stroke="hsl(var(--ap-border))" />
                    <PolarAngleAxis dataKey="name" tick={{ fontSize: 11 }} />
                    <PolarRadiusAxis domain={[0, 100]} tick={{ fontSize: 9 }} />
                    <Radar name="Score" dataKey="score" stroke="hsl(262 83% 58%)" fill="hsl(262 83% 58%)" fillOpacity={0.3} />
                    <Tooltip contentStyle={{ background: "hsl(var(--ap-panel))", border: "1px solid hsl(var(--ap-border))", borderRadius: 12 }} />
                  </RadarChart>
                </ResponsiveContainer>
              </div>
            </Panel>
            <Panel title="Teacher Metrics">
              <div className="space-y-3">
                {teacherAnalytics.map((t) => (
                  <ProgressBar key={t.name} value={t.score} tone={t.score > 90 ? "success" : t.score > 80 ? "purple" : "warning"} label={`${t.name} · ${t.score}%`} />
                ))}
              </div>
            </Panel>
          </div>
        )}

        {activeTab === "parents" && (
          <Panel title="Parent Engagement Analytics" subtitle="Portal usage & interaction metrics">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-3">
                {parentEngagement.map((p) => (
                  <ProgressBar key={p.metric} value={p.value} tone={p.value > 80 ? "success" : p.value > 60 ? "warning" : "danger"} label={`${p.metric} · ${p.value}%`} />
                ))}
              </div>
              <div className="space-y-3">
                <div className="grid grid-cols-2 gap-3">
                  <div className="ap-card p-4 text-center">
                    <p className="text-3xl font-black text-[hsl(var(--ap-purple))]">83%</p>
                    <p className="text-xs text-[hsl(var(--ap-muted))] uppercase font-bold">Portal Active</p>
                  </div>
                  <div className="ap-card p-4 text-center">
                    <p className="text-3xl font-black text-[hsl(var(--ap-success))]">95%</p>
                    <p className="text-xs text-[hsl(var(--ap-muted))] uppercase font-bold">Complaints Resolved</p>
                  </div>
                  <div className="ap-card p-4 text-center">
                    <p className="text-3xl font-black text-[hsl(var(--ap-orange))]">68%</p>
                    <p className="text-xs text-[hsl(var(--ap-muted))] uppercase font-bold">Meeting Attendance</p>
                  </div>
                  <div className="ap-card p-4 text-center">
                    <p className="text-3xl font-black text-[hsl(var(--ap-info))]">78%</p>
                    <p className="text-xs text-[hsl(var(--ap-muted))] uppercase font-bold">Fee On-time</p>
                  </div>
                </div>
              </div>
            </div>
          </Panel>
        )}
      </div>
    </div>
  );
}


