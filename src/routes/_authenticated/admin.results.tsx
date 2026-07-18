import {  } from "react-router-dom";
import { useState } from "react";
import {
  Trophy, TrendingUp, Award, Clock, Download, Search, Filter,
  Eye, Edit, Printer, Share2, FileText, BarChart3, Star,
  MoreVertical, ChevronRight, Medal,
} from "lucide-react";
import {
  BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid,
  LineChart, Line, RadarChart, Radar, PolarGrid, PolarAngleAxis, PolarRadiusAxis,
} from "recharts";
import { PageHeader } from "@/components/admin/AdminShell";
import { StatCard, Panel, Badge, DataTable, Toolbar, Tabs, Modal } from "@/components/admin/ui";

const RESULTS = [
  { id: "1", exam: "IOE Mock #13", course: "Nepal Police", date: "2024-09-25", appeared: 45, passed: 38, avgScore: 78, topper: "Aarav S.", topperScore: 96, status: "Published", merit: true },
  { id: "2", exam: "Bank Reasoning", course: "Bank PO", date: "2024-10-08", appeared: 30, passed: 28, avgScore: 82, topper: "Sita R.", topperScore: 91, status: "Published", merit: true },
  { id: "3", exam: "Loksewa Prelim", course: "Loksewa", date: "2024-09-28", appeared: 32, passed: 24, avgScore: 72, topper: "Anisha M.", topperScore: 89, status: "Published", merit: true },
  { id: "4", exam: "APF Fitness", course: "APF", date: "2024-10-05", appeared: 35, passed: 30, avgScore: 75, topper: "Krishna A.", topperScore: 88, status: "Published", merit: false },
  { id: "5", exam: "IOE Mock #14", course: "Nepal Police", date: "2024-10-10", appeared: 42, passed: 0, avgScore: 0, topper: "—", topperScore: 0, status: "Pending", merit: false },
  { id: "6", exam: "Army Written", course: "Nepal Army", date: "2024-10-12", appeared: 0, passed: 0, avgScore: 0, topper: "—", topperScore: 0, status: "Scheduled", merit: false },
];

const scoreTrend = [
  { exam: "Mock #10", avg: 68, pass: 72 },
  { exam: "Mock #11", avg: 71, pass: 76 },
  { exam: "Mock #12", avg: 74, pass: 80 },
  { exam: "Mock #13", avg: 78, pass: 84 },
];

const subjectPerformance = [
  { subject: "GK", score: 82 },
  { subject: "Math", score: 75 },
  { subject: "English", score: 88 },
  { subject: "Science", score: 70 },
  { subject: "Reasoning", score: 79 },
];

export function ResultsPage() {
  const [q, setQ] = useState("");
  const [activeTab, setActiveTab] = useState("results");
  const [meritOpen, setMeritOpen] = useState(false);

  const filtered = RESULTS.filter(
    (r) => !q || r.exam.toLowerCase().includes(q.toLowerCase()) || r.course.toLowerCase().includes(q.toLowerCase()),
  );

  return (
    <div>
      <PageHeader
        title="Results"
        subtitle="Merit lists, rank analysis, and result publications."
        actions={
          <>
            <button className="ap-btn-ghost"><Download className="w-4 h-4" /> Export</button>
            <button className="ap-btn"><FileText className="w-4 h-4" /> Publish Results</button>
          </>
        }
      />
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
        <StatCard label="Published" value={24} icon={Trophy} tone="purple" />
        <StatCard label="Avg Score" value="72%" icon={TrendingUp} tone="success" />
        <StatCard label="Toppers" value={18} icon={Medal} tone="orange" />
        <StatCard label="Pending" value={6} icon={Clock} tone="warning" />
      </div>

      <Tabs
        tabs={[
          { label: "Results", value: "results" },
          { label: "Merit Lists", value: "merit" },
          { label: "Analytics", value: "analytics" },
          { label: "Certificates", value: "certificates" },
        ]}
        value={activeTab}
        onChange={setActiveTab}
      />

      <div className="mt-4">
        {activeTab === "results" && (
          <>
            <Toolbar>
              <div className="relative flex-1 max-w-xs">
                <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-[hsl(var(--ap-muted))]" />
                <input value={q} onChange={(e) => setQ(e.target.value)} placeholder="Search results..." className="ap-input pl-9" />
              </div>
              <button className="ap-btn-ghost"><Filter className="w-4 h-4" /> Filters</button>
              <select className="ap-input max-w-[160px]"><option>All courses</option><option>Nepal Police</option><option>Loksewa</option><option>Bank PO</option></select>
              <select className="ap-input max-w-[160px]"><option>All status</option><option>Published</option><option>Pending</option><option>Scheduled</option></select>
            </Toolbar>

            <DataTable
              rows={filtered}
              columns={[
                { key: "exam", label: "Exam", render: (r) => <span className="font-bold">{r.exam}</span> },
                { key: "course", label: "Course" },
                { key: "date", label: "Date" },
                { key: "appeared", label: "Appeared" },
                { key: "passed", label: "Passed", render: (r) => r.passed > 0 ? <span className="font-bold text-[hsl(var(--ap-success))]">{r.passed}</span> : "—" },
                {
                  key: "avgScore", label: "Avg Score",
                  render: (r) => r.avgScore > 0 ? (
                    <div className="flex items-center gap-2">
                      <div className="w-16 h-1.5 rounded-full bg-[hsl(var(--ap-border))]">
                        <div className="h-1.5 rounded-full ap-grad" style={{ width: `${r.avgScore}%` }} />
                      </div>
                      <span className="text-xs font-bold">{r.avgScore}%</span>
                    </div>
                  ) : "—",
                },
                {
                  key: "topper", label: "Topper",
                  render: (r) => r.topper !== "—" ? (
                    <div>
                      <p className="font-semibold">{r.topper}</p>
                      <p className="text-xs text-[hsl(var(--ap-success))]">{r.topperScore}/100</p>
                    </div>
                  ) : "—",
                },
                {
                  key: "status", label: "Status",
                  render: (r) => <Badge tone={r.status === "Published" ? "success" : r.status === "Pending" ? "warning" : "muted"}>{r.status}</Badge>,
                },
              ]}
              actions={() => (
                <div className="flex gap-1">
                  <button className="p-1.5 rounded-lg hover:bg-[hsl(var(--ap-border)/0.5)]"><Eye className="w-3.5 h-3.5" /></button>
                  <button className="p-1.5 rounded-lg hover:bg-[hsl(var(--ap-border)/0.5)]"><Printer className="w-3.5 h-3.5" /></button>
                  <button className="p-1.5 rounded-lg hover:bg-[hsl(var(--ap-border)/0.5)]"><Share2 className="w-3.5 h-3.5" /></button>
                </div>
              )}
            />
          </>
        )}

        {activeTab === "merit" && (
          <>
            <Panel title="Merit List — IOE Mock #13" subtitle="Nepal Police · 45 appeared · 38 passed">
              <div className="space-y-2">
                {[
                  { rank: 1, name: "Aarav Sharma", score: 96, course: "Nepal Police", batch: "B-12" },
                  { rank: 2, name: "Anisha Magar", score: 94, course: "Nepal Police", batch: "B-12" },
                  { rank: 3, name: "Krishna Adhikari", score: 91, course: "Nepal Police", batch: "B-12" },
                  { rank: 4, name: "Priya Karki", score: 88, course: "Nepal Police", batch: "B-12" },
                  { rank: 5, name: "Nisha Basnet", score: 85, course: "Nepal Police", batch: "B-12" },
                  { rank: 6, name: "Rohan Thapa", score: 82, course: "Nepal Police", batch: "B-12" },
                  { rank: 7, name: "Bikash Gurung", score: 79, course: "Nepal Police", batch: "B-12" },
                  { rank: 8, name: "Manisha Shrestha", score: 76, course: "Nepal Police", batch: "B-12" },
                  { rank: 9, name: "Suman Poudel", score: 73, course: "Nepal Police", batch: "B-12" },
                  { rank: 10, name: "Rajesh Hamal", score: 70, course: "Nepal Police", batch: "B-12" },
                ].map((m) => (
                  <div key={m.rank} className="flex items-center gap-3 p-3 rounded-xl hover:bg-[hsl(var(--ap-border)/0.3)] transition">
                    <div className={`w-10 h-10 rounded-full flex items-center justify-center text-white text-sm font-black ${m.rank === 1 ? "ap-grad" : m.rank === 2 ? "bg-[hsl(var(--ap-orange))]" : m.rank === 3 ? "bg-[hsl(var(--ap-info))]" : "bg-[hsl(var(--ap-border))] text-[hsl(var(--ap-muted))]"}`}>
                      {m.rank <= 3 ? <Medal className="w-4 h-4" /> : m.rank}
                    </div>
                    <div className="flex-1">
                      <p className="font-semibold">{m.name}</p>
                      <p className="text-xs text-[hsl(var(--ap-muted))]">{m.batch}</p>
                    </div>
                    <div className="text-right">
                      <p className="text-lg font-black text-[hsl(var(--ap-success))]">{m.score}/100</p>
                      <p className="text-xs text-[hsl(var(--ap-muted))]">{m.course}</p>
                    </div>
                  </div>
                ))}
              </div>
            </Panel>
          </>
        )}

        {activeTab === "analytics" && (
          <div className="grid grid-cols-1 xl:grid-cols-2 gap-4">
            <Panel title="Score Trend" subtitle="Average scores across mock tests">
              <div className="h-64">
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={scoreTrend}>
                    <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--ap-border))" />
                    <XAxis dataKey="exam" stroke="hsl(var(--ap-muted))" fontSize={11} />
                    <YAxis domain={[60, 100]} stroke="hsl(var(--ap-muted))" fontSize={11} />
                    <Tooltip contentStyle={{ background: "hsl(var(--ap-panel))", border: "1px solid hsl(var(--ap-border))", borderRadius: 12 }} />
                    <Line type="monotone" dataKey="avg" name="Average" stroke="hsl(262 83% 58%)" strokeWidth={2} dot={{ r: 4 }} />
                    <Line type="monotone" dataKey="pass" name="Pass %" stroke="hsl(152 60% 42%)" strokeWidth={2} dot={{ r: 4 }} strokeDasharray="5 5" />
                  </LineChart>
                </ResponsiveContainer>
              </div>
            </Panel>
            <Panel title="Subject Performance" subtitle="Average scores by subject">
              <div className="h-64">
                <ResponsiveContainer width="100%" height="100%">
                  <RadarChart data={subjectPerformance}>
                    <PolarGrid stroke="hsl(var(--ap-border))" />
                    <PolarAngleAxis dataKey="subject" tick={{ fontSize: 11 }} />
                    <PolarRadiusAxis domain={[0, 100]} tick={{ fontSize: 9 }} />
                    <Radar name="Score" dataKey="score" stroke="hsl(262 83% 58%)" fill="hsl(262 83% 58%)" fillOpacity={0.3} />
                    <Tooltip contentStyle={{ background: "hsl(var(--ap-panel))", border: "1px solid hsl(var(--ap-border))", borderRadius: 12 }} />
                  </RadarChart>
                </ResponsiveContainer>
              </div>
            </Panel>
          </div>
        )}

        {activeTab === "certificates" && (
          <Panel title="Result Certificates" subtitle="Generated certificates for completed exams">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
              {RESULTS.filter((r) => r.status === "Published").map((r) => (
                <div key={r.id} className="ap-card p-4 hover:shadow-lg transition">
                  <div className="flex items-center gap-3 mb-3">
                    <div className="w-10 h-10 rounded-xl ap-grad flex items-center justify-center text-white">
                      <Award className="w-5 h-5" />
                    </div>
                    <div>
                      <p className="font-bold text-sm">{r.exam}</p>
                      <p className="text-xs text-[hsl(var(--ap-muted))]">{r.course}</p>
                    </div>
                  </div>
                  <div className="space-y-1 text-xs">
                    <div className="flex justify-between"><span className="text-[hsl(var(--ap-muted))]">Appeared</span><span className="font-bold">{r.appeared}</span></div>
                    <div className="flex justify-between"><span className="text-[hsl(var(--ap-muted))]">Passed</span><span className="font-bold text-[hsl(var(--ap-success))]">{r.passed}</span></div>
                    <div className="flex justify-between"><span className="text-[hsl(var(--ap-muted))]">Topper</span><span className="font-bold">{r.topper} ({r.topperScore})</span></div>
                  </div>
                  <div className="flex gap-2 mt-3">
                    <button className="ap-btn-ghost flex-1 text-xs"><Printer className="w-3.5 h-3.5" /> Print</button>
                    <button className="ap-btn-ghost flex-1 text-xs"><Share2 className="w-3.5 h-3.5" /> Share</button>
                  </div>
                </div>
              ))}
            </div>
          </Panel>
        )}
      </div>
    </div>
  );
}


