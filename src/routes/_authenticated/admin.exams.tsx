import {  } from "react-router-dom";
import { useState } from "react";
import {
  FileBadge, Radio, Database, Sparkles, Download, Search, Filter, Plus,
  Eye, Edit, Trash2, Clock, CheckCircle2, AlertCircle, Play, Calendar,
  MoreVertical, Award, TrendingUp,
} from "lucide-react";
import {
  BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid,
  PieChart, Pie, Cell,
} from "recharts";
import { PageHeader } from "@/components/admin/AdminShell";
import { StatCard, Panel, Badge, DataTable, Toolbar, Tabs, Kanban } from "@/components/admin/ui";

const EXAMS = [
  { id: "1", name: "IOE Mock #14", course: "Nepal Police", date: "2024-10-10", questions: 100, marks: 100, duration: "2 hrs", attempts: 42, type: "MCQ", status: "Scheduled", negative: true },
  { id: "2", name: "Loksewa Prelim", course: "Loksewa", date: "2024-10-12", questions: 150, marks: 150, duration: "3 hrs", attempts: 28, type: "MCQ", status: "Scheduled", negative: true },
  { id: "3", name: "Bank Reasoning", course: "Bank PO", date: "2024-10-08", questions: 60, marks: 60, duration: "1 hr", attempts: 30, type: "MCQ", status: "Completed", negative: false },
  { id: "4", name: "APF Fitness Theory", course: "APF", date: "2024-10-15", questions: 80, marks: 80, duration: "1.5 hrs", attempts: 0, type: "Mixed", status: "Scheduled", negative: false },
  { id: "5", name: "Army Written Test", course: "Nepal Army", date: "2024-10-05", questions: 120, marks: 120, duration: "2.5 hrs", attempts: 35, type: "MCQ", status: "Completed", negative: true },
  { id: "6", name: "English Grammar", course: "Loksewa SO", date: "2024-10-18", questions: 50, marks: 50, duration: "45 min", attempts: 0, type: "MCQ", status: "Draft", negative: false },
  { id: "7", name: "Quantitative Aptitude", course: "Bank PO", date: "2024-10-20", questions: 40, marks: 80, duration: "1 hr", attempts: 0, type: "Mixed", status: "Draft", negative: true },
  { id: "8", name: "General Science", course: "Nepal Police", date: "2024-10-03", questions: 75, marks: 75, duration: "1.5 hrs", attempts: 44, type: "MCQ", status: "Completed", negative: false },
];

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

  const filtered = EXAMS.filter(
    (e) => !q || e.name.toLowerCase().includes(q.toLowerCase()) || e.course.toLowerCase().includes(q.toLowerCase()),
  );

  return (
    <div>
      <PageHeader
        title="Examinations"
        subtitle="Create, schedule, and manage exams with question bank integration."
        actions={
          <>
            <button className="ap-btn-ghost"><Download className="w-4 h-4" /> Export</button>
            <button className="ap-btn"><Plus className="w-4 h-4" /> Create Exam</button>
          </>
        }
      />
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
        <StatCard label="Upcoming" value={4} icon={Calendar} tone="purple" />
        <StatCard label="Live Now" value={1} icon={Radio} tone="warning" />
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
                <input value={q} onChange={(e) => setQ(e.target.value)} placeholder="Search exams..." className="ap-input pl-9" />
              </div>
              <button className="ap-btn-ghost"><Filter className="w-4 h-4" /> Filters</button>
              <select className="ap-input max-w-[160px]"><option>All types</option><option>MCQ</option><option>Theory</option><option>Mixed</option><option>OMR</option></select>
              <select className="ap-input max-w-[160px]"><option>All status</option><option>Draft</option><option>Scheduled</option><option>Live</option><option>Completed</option></select>
            </Toolbar>

            <DataTable
              rows={filtered}
              columns={[
                { key: "name", label: "Exam", render: (r) => <span className="font-bold">{r.name}</span> },
                { key: "course", label: "Course" },
                { key: "date", label: "Date" },
                { key: "questions", label: "Qs" },
                { key: "marks", label: "Marks" },
                { key: "duration", label: "Duration" },
                { key: "type", label: "Type", render: (r) => <Badge tone="muted">{r.type}</Badge> },
                { key: "attempts", label: "Attempts" },
                {
                  key: "status", label: "Status",
                  render: (r) => <Badge tone={r.status === "Completed" ? "success" : r.status === "Scheduled" ? "info" : r.status === "Live" ? "warning" : "muted"}>{r.status}</Badge>,
                },
              ]}
              actions={() => (
                <div className="flex gap-1">
                  <button className="p-1.5 rounded-lg hover:bg-[hsl(var(--ap-border)/0.5)]"><Eye className="w-3.5 h-3.5" /></button>
                  <button className="p-1.5 rounded-lg hover:bg-[hsl(var(--ap-border)/0.5)]"><Edit className="w-3.5 h-3.5" /></button>
                  <button className="p-1.5 rounded-lg hover:bg-[hsl(var(--ap-danger)/0.1)]"><Trash2 className="w-3.5 h-3.5 text-[hsl(var(--ap-danger))]" /></button>
                </div>
              )}
            />
          </>
        )}

        {activeTab === "bank" && (
          <div className="grid grid-cols-1 xl:grid-cols-2 gap-4">
            <Panel title="Question Bank by Category" subtitle={`${questionBank.reduce((s, q) => s + q.count, 0).toLocaleString()} total questions`}>
              <div className="h-64">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={questionBank} layout="vertical">
                    <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--ap-border))" />
                    <XAxis type="number" stroke="hsl(var(--ap-muted))" fontSize={11} />
                    <YAxis type="category" dataKey="category" stroke="hsl(var(--ap-muted))" fontSize={11} width={100} />
                    <Tooltip contentStyle={{ background: "hsl(var(--ap-panel))", border: "1px solid hsl(var(--ap-border))", borderRadius: 12 }} />
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
                    <div key={a.label} className="ap-card p-4 flex items-start gap-3 hover:shadow-lg transition cursor-pointer">
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
                    <Pie data={resultDistribution} innerRadius={50} outerRadius={85} dataKey="count" paddingAngle={4}>
                      {resultDistribution.map((c) => <Cell key={c.range} fill={c.color} />)}
                    </Pie>
                    <Tooltip contentStyle={{ background: "hsl(var(--ap-panel))", border: "1px solid hsl(var(--ap-border))", borderRadius: 12 }} />
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
                  <div key={t.rank} className="flex items-center gap-3 p-2.5 rounded-xl hover:bg-[hsl(var(--ap-border)/0.3)]">
                    <div className={`w-8 h-8 rounded-full flex items-center justify-center text-white text-xs font-black ${t.rank === 1 ? "ap-grad" : t.rank === 2 ? "bg-[hsl(var(--ap-orange))]" : t.rank === 3 ? "bg-[hsl(var(--ap-info))]" : "bg-[hsl(var(--ap-border))]"}`}>
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
              <p className="text-sm text-[hsl(var(--ap-muted))] mt-1">Scheduled exams will appear here when they start</p>
              <button className="ap-btn mt-4"><Play className="w-4 h-4" /> Start Exam</button>
            </div>
          </Panel>
        )}
      </div>
    </div>
  );
}


