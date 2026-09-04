import { useState } from "react";
import {
  Radio,
  Database,
  Sparkles,
  Download,
  Search,
  Filter,
  Plus,
  Edit,
  Trash2,
  Calendar,
} from "lucide-react";
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
} from "recharts";
import { PageHeader } from "@/components/admin/AdminShell";
import { StatCard, Panel, Badge, DataTable, Toolbar, Tabs } from "@/components/admin/ui";
import { useModuleData } from "@/hooks/use-module-data";

const questionBank = [
  { category: "General Knowledge", count: 2450 },
  { category: "Mathematics", count: 1820 },
  { category: "English", count: 1560 },
  { category: "Reasoning", count: 1280 },
  { category: "Science", count: 680 },
  { category: "Constitution", count: 451 },
];

const resultDistribution = [
  { range: "90-100%", count: 12, color: "hsl(152 60% 42%)" },
  { range: "80-89%", count: 28, color: "hsl(262 83% 58%)" },
  { range: "70-79%", count: 45, color: "hsl(210 92% 55%)" },
  { range: "60-69%", count: 38, color: "hsl(24 95% 58%)" },
  { range: "Below 60%", count: 18, color: "hsl(355 82% 58%)" },
];

export function ExamsPage() {
  const [q, setQ] = useState("");
  const [activeTab, setActiveTab] = useState("exams");
  const { rows, remove } = useModuleData("exams");

  const filtered = rows.filter(
    (e) =>
      !q ||
      (e.title as string)?.toLowerCase().includes(q.toLowerCase()) ||
      (e.subject as string)?.toLowerCase().includes(q.toLowerCase()),
  );

  const upcoming = rows.filter((e) => new Date(e.scheduledAt as string) > new Date()).length;

  return (
    <div>
      <PageHeader
        title="Examinations"
        subtitle="Create, schedule, and manage exams with question bank integration."
        actions={
          <>
            <button className="ap-btn-ghost">
              <Download className="w-4 h-4" /> Export
            </button>
            <button className="ap-btn">
              <Plus className="w-4 h-4" /> Create Exam
            </button>
          </>
        }
      />
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
        <StatCard label="Upcoming" value={upcoming} icon={Calendar} tone="purple" />
        <StatCard label="Total Exams" value={rows.length} icon={Radio} tone="warning" />
        <StatCard label="Question Bank" value={8241} icon={Database} tone="info" />
        <StatCard label="Auto-Graded" value="94%" icon={Sparkles} tone="success" />
      </div>

      <Tabs
        tabs={[
          { label: "Exams", value: "exams" },
          { label: "Question Bank", value: "bank" },
          { label: "Results", value: "results" },
          { label: "Live Proctoring", value: "live" },
        ]}
        value={activeTab}
        onChange={setActiveTab}
      />

      <div className="mt-4">
        {activeTab === "exams" && (
          <>
            <Toolbar>
              <div className="relative flex-1 max-w-xs">
                <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-[hsl(var(--ap-muted))]" />
                <input
                  value={q}
                  onChange={(e) => setQ(e.target.value)}
                  placeholder="Search exams..."
                  className="ap-input pl-9"
                />
              </div>
              <button className="ap-btn-ghost">
                <Filter className="w-4 h-4" /> Filters
              </button>
            </Toolbar>

            <DataTable
              rows={filtered}
              columns={[
                {
                  key: "title",
                  label: "Exam",
                  render: (r) => <span className="font-bold">{r.title as string}</span>,
                },
                { key: "subject", label: "Subject" },
                {
                  key: "scheduledAt",
                  label: "Scheduled",
                  render: (r) => (
                    <span>
                      {r.scheduledAt ? new Date(r.scheduledAt as string).toLocaleDateString() : "—"}
                    </span>
                  ),
                },
                {
                  key: "durationMin",
                  label: "Duration",
                  render: (r) => <span>{r.durationMin as number} min</span>,
                },
                { key: "totalMarks", label: "Marks" },
              ]}
              actions={(r) => (
                <div className="flex gap-1">
                  <button
                    className="p-1.5 rounded-lg hover:bg-[hsl(var(--ap-danger)/0.1)]"
                    onClick={() => remove(r.id)}
                  >
                    <Trash2 className="w-3.5 h-3.5 text-[hsl(var(--ap-danger))]" />
                  </button>
                </div>
              )}
            />
          </>
        )}

        {activeTab === "bank" && (
          <div className="grid grid-cols-1 xl:grid-cols-2 gap-4">
            <Panel
              title="Question Bank by Category"
              subtitle={`${questionBank.reduce((s, q) => s + q.count, 0).toLocaleString()} total questions`}
            >
              <div className="h-64">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={questionBank} layout="vertical">
                    <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--ap-border))" />
                    <XAxis type="number" stroke="hsl(var(--ap-muted))" fontSize={11} />
                    <YAxis
                      type="category"
                      dataKey="category"
                      stroke="hsl(var(--ap-muted))"
                      fontSize={11}
                      width={100}
                    />
                    <Tooltip
                      contentStyle={{
                        background: "hsl(var(--ap-panel))",
                        border: "1px solid hsl(var(--ap-border))",
                        borderRadius: 12,
                      }}
                    />
                    <Bar dataKey="count" radius={[0, 6, 6, 0]} fill="hsl(262 83% 58%)" />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </Panel>
            <Panel title="Quick Actions">
              <div className="grid grid-cols-2 gap-3">
                {[
                  { icon: Plus, label: "Add Question", desc: "Create new question" },
                  { icon: Database, label: "Import Questions", desc: "Bulk upload via CSV" },
                  { icon: Sparkles, label: "AI Generate", desc: "Auto-generate questions" },
                  { icon: Filter, label: "Filter by Tags", desc: "Organize by difficulty" },
                ].map((a) => {
                  const Icon = a.icon;
                  return (
                    <div
                      key={a.label}
                      className="ap-card p-4 flex items-start gap-3 hover:shadow-lg transition cursor-pointer"
                    >
                      <div className="w-10 h-10 rounded-xl ap-grad flex items-center justify-center text-white">
                        <Icon className="w-4 h-4" />
                      </div>
                      <div>
                        <p className="font-bold text-sm">{a.label}</p>
                        <p className="text-xs text-[hsl(var(--ap-muted))]">{a.desc}</p>
                      </div>
                    </div>
                  );
                })}
              </div>
            </Panel>
          </div>
        )}

        {activeTab === "results" && (
          <div className="grid grid-cols-1 xl:grid-cols-2 gap-4">
            <Panel title="Score Distribution" subtitle="Last completed exam">
              <div className="h-64">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={resultDistribution}
                      innerRadius={50}
                      outerRadius={85}
                      dataKey="count"
                      paddingAngle={4}
                    >
                      {resultDistribution.map((c) => (
                        <Cell key={c.range} fill={c.color} />
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
              <div className="grid grid-cols-2 gap-2 mt-2">
                {resultDistribution.map((r) => (
                  <div key={r.range} className="flex items-center gap-2 text-xs">
                    <span className="w-2.5 h-2.5 rounded-full" style={{ background: r.color }} />
                    <span className="text-[hsl(var(--ap-muted))]">{r.range}</span>
                    <span className="ml-auto font-bold">{r.count} students</span>
                  </div>
                ))}
              </div>
            </Panel>
            <Panel title="Top Performers" subtitle="Highest scorers">
              <div className="space-y-2">
                {[
                  { rank: 1, name: "Aarav Sharma", score: "96/100", course: "Nepal Police" },
                  { rank: 2, name: "Anisha Magar", score: "94/100", course: "Loksewa SO" },
                  { rank: 3, name: "Krishna Adhikari", score: "91/100", course: "APF" },
                  { rank: 4, name: "Priya Karki", score: "88/100", course: "Loksewa" },
                  { rank: 5, name: "Nisha Basnet", score: "85/100", course: "Bank PO" },
                ].map((t) => (
                  <div
                    key={t.rank}
                    className="flex items-center gap-3 p-2.5 rounded-xl hover:bg-[hsl(var(--ap-border)/0.3)]"
                  >
                    <div
                      className={`w-8 h-8 rounded-full flex items-center justify-center text-white text-xs font-black ${t.rank === 1 ? "ap-grad" : t.rank === 2 ? "bg-[hsl(var(--ap-orange))]" : t.rank === 3 ? "bg-[hsl(var(--ap-info))]" : "bg-[hsl(var(--ap-border))]"}`}
                    >
                      {t.rank}
                    </div>
                    <div className="flex-1">
                      <p className="text-sm font-semibold">{t.name}</p>
                      <p className="text-xs text-[hsl(var(--ap-muted))]">{t.course}</p>
                    </div>
                    <span className="font-bold text-[hsl(var(--ap-success))]">{t.score}</span>
                  </div>
                ))}
              </div>
            </Panel>
          </div>
        )}

        {activeTab === "live" && (
          <Panel title="Live Exam Proctoring" subtitle="Currently active exams">
            <div className="ap-card p-8 text-center">
              <Radio className="w-12 h-12 mx-auto text-[hsl(var(--ap-warning))] mb-3" />
              <p className="font-bold">No live exams right now</p>
              <p className="text-sm text-[hsl(var(--ap-muted))] mt-1">
                Scheduled exams will appear here when they start
              </p>
              <button className="ap-btn mt-4">
                <Radio className="w-4 h-4" /> Start Exam
              </button>
            </div>
          </Panel>
        )}
      </div>
    </div>
  );
}
