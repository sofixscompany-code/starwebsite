import { useState, useMemo } from "react";
import {
  Trophy,
  TrendingUp,
  Award,
  Clock,
  Download,
  Search,
  Filter,
  Eye,
  Printer,
  Share2,
  FileText,
  Medal,
} from "lucide-react";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  CartesianGrid,
  RadarChart,
  Radar,
  PolarGrid,
  PolarAngleAxis,
  PolarRadiusAxis,
} from "recharts";
import { PageHeader } from "@/components/admin/AdminShell";
import { StatCard, Panel, Badge, DataTable, Toolbar, Tabs } from "@/components/admin/ui";
import { useModuleData } from "@/hooks/use-module-data";

const scoreTrend = [
  { exam: "Mock #10", avg: 68, pass: 72 },
  { exam: "Mock #11", avg: 71, pass: 76 },
  { exam: "Mock #12", avg: 74, pass: 80 },
  { exam: "Mock #13", avg: 78, pass: 84 },
];

export function ResultsPage() {
  const [q, setQ] = useState("");
  const [activeTab, setActiveTab] = useState("results");
  const { rows, remove } = useModuleData("results");

  const stats = useMemo(() => {
    const total = rows.length;
    const avgScore =
      total > 0 ? Math.round(rows.reduce((s, r) => s + ((r.score as number) || 0), 0) / total) : 0;
    const toppers = rows.filter(
      (r) => ((r.score as number) || 0) / ((r.total as number) || 1) >= 0.9,
    ).length;
    return { total, avgScore, toppers };
  }, [rows]);

  const subjectPerformance = useMemo(() => {
    const map = new Map<string, { total: number; count: number }>();
    rows.forEach((r) => {
      const subj = (r.subject as string) || "Unknown";
      const existing = map.get(subj) || { total: 0, count: 0 };
      const pct = (((r.score as number) || 0) / ((r.total as number) || 1)) * 100;
      existing.total += pct;
      existing.count += 1;
      map.set(subj, existing);
    });
    return Array.from(map.entries()).map(([subject, v]) => ({
      subject,
      score: Math.round(v.total / (v.count || 1)),
    }));
  }, [rows]);

  const filtered = rows.filter(
    (r) =>
      !q ||
      (r.exam as string)?.toLowerCase().includes(q.toLowerCase()) ||
      (r.subject as string)?.toLowerCase().includes(q.toLowerCase()) ||
      (r.studentId as string)?.toLowerCase().includes(q.toLowerCase()),
  );

  return (
    <div>
      <PageHeader
        title="Results"
        subtitle="Merit lists, rank analysis, and result publications."
        actions={
          <>
            <button className="ap-btn-ghost">
              <Download className="w-4 h-4" /> Export
            </button>
            <button className="ap-btn">
              <FileText className="w-4 h-4" /> Publish Results
            </button>
          </>
        }
      />
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
        <StatCard label="Total Results" value={stats.total} icon={Trophy} tone="purple" />
        <StatCard label="Avg Score" value={`${stats.avgScore}%`} icon={TrendingUp} tone="success" />
        <StatCard label="Toppers" value={stats.toppers} icon={Medal} tone="orange" />
        <StatCard label="Subjects" value={subjectPerformance.length} icon={Award} tone="info" />
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
                <input
                  value={q}
                  onChange={(e) => setQ(e.target.value)}
                  placeholder="Search results..."
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
                  key: "studentId",
                  label: "Student ID",
                  render: (r) => <span className="font-bold">{r.studentId as string}</span>,
                },
                { key: "subject", label: "Subject" },
                {
                  key: "exam",
                  label: "Exam",
                  render: (r) => <span className="font-semibold">{r.exam as string}</span>,
                },
                {
                  key: "score",
                  label: "Score",
                  render: (r) => (
                    <div className="flex items-center gap-2">
                      <div className="w-16 h-1.5 rounded-full bg-[hsl(var(--ap-border))]">
                        <div
                          className="h-1.5 rounded-full ap-grad"
                          style={{
                            width: `${(((r.score as number) || 0) / ((r.total as number) || 1)) * 100}%`,
                          }}
                        />
                      </div>
                      <span className="text-xs font-bold">
                        {r.score as number}/{r.total as number}
                      </span>
                    </div>
                  ),
                },
              ]}
              actions={(r) => (
                <div className="flex gap-1">
                  <button
                    className="p-1.5 rounded-lg hover:bg-[hsl(var(--ap-danger)/0.1)]"
                    onClick={() => remove(r.id)}
                  >
                    <Share2 className="w-3.5 h-3.5 text-[hsl(var(--ap-danger))]" />
                  </button>
                </div>
              )}
            />
          </>
        )}

        {activeTab === "merit" && (
          <Panel title="Merit List" subtitle="Students ranked by score across all exams">
            <div className="space-y-2">
              {rows
                .filter((r) => (r.score as number) > 0)
                .sort((a, b) => ((b.score as number) || 0) - ((a.score as number) || 0))
                .slice(0, 10)
                .map((m, i) => (
                  <div
                    key={m.id}
                    className="flex items-center gap-3 p-3 rounded-xl hover:bg-[hsl(var(--ap-border)/0.3)] transition"
                  >
                    <div
                      className={`w-10 h-10 rounded-full flex items-center justify-center text-white text-sm font-black ${i === 0 ? "ap-grad" : i === 1 ? "bg-[hsl(var(--ap-orange))]" : i === 2 ? "bg-[hsl(var(--ap-info))]" : "bg-[hsl(var(--ap-border))] text-[hsl(var(--ap-muted))]"}`}
                    >
                      {i < 3 ? <Medal className="w-4 h-4" /> : i + 1}
                    </div>
                    <div className="flex-1">
                      <p className="font-semibold">{m.studentId as string}</p>
                      <p className="text-xs text-[hsl(var(--ap-muted))]">{m.exam as string}</p>
                    </div>
                    <div className="text-right">
                      <p className="text-lg font-black text-[hsl(var(--ap-success))]">
                        {m.score as number}/{m.total as number}
                      </p>
                      <p className="text-xs text-[hsl(var(--ap-muted))]">{m.subject as string}</p>
                    </div>
                  </div>
                ))}
            </div>
          </Panel>
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
                    <Tooltip
                      contentStyle={{
                        background: "hsl(var(--ap-panel))",
                        border: "1px solid hsl(var(--ap-border))",
                        borderRadius: 12,
                      }}
                    />
                    <Line
                      type="monotone"
                      dataKey="avg"
                      name="Average"
                      stroke="hsl(262 83% 58%)"
                      strokeWidth={2}
                      dot={{ r: 4 }}
                    />
                    <Line
                      type="monotone"
                      dataKey="pass"
                      name="Pass %"
                      stroke="hsl(152 60% 42%)"
                      strokeWidth={2}
                      dot={{ r: 4 }}
                      strokeDasharray="5 5"
                    />
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
                    <Radar
                      name="Score"
                      dataKey="score"
                      stroke="hsl(262 83% 58%)"
                      fill="hsl(262 83% 58%)"
                      fillOpacity={0.3}
                    />
                    <Tooltip
                      contentStyle={{
                        background: "hsl(var(--ap-panel))",
                        border: "1px solid hsl(var(--ap-border))",
                        borderRadius: 12,
                      }}
                    />
                  </RadarChart>
                </ResponsiveContainer>
              </div>
            </Panel>
          </div>
        )}

        {activeTab === "certificates" && (
          <Panel title="Result Certificates" subtitle="Generated certificates for completed exams">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
              {[...new Map(rows.map((r) => [r.exam as string, r])).values()].map((r) => (
                <div key={r.id} className="ap-card p-4 hover:shadow-lg transition">
                  <div className="flex items-center gap-3 mb-3">
                    <div className="w-10 h-10 rounded-xl ap-grad flex items-center justify-center text-white">
                      <Award className="w-5 h-5" />
                    </div>
                    <div>
                      <p className="font-bold text-sm">{r.exam as string}</p>
                      <p className="text-xs text-[hsl(var(--ap-muted))]">{r.subject as string}</p>
                    </div>
                  </div>
                  <div className="space-y-1 text-xs">
                    <div className="flex justify-between">
                      <span className="text-[hsl(var(--ap-muted))]">Score</span>
                      <span className="font-bold">
                        {r.score as number}/{r.total as number}
                      </span>
                    </div>
                  </div>
                  <div className="flex gap-2 mt-3">
                    <button className="ap-btn-ghost flex-1 text-xs">
                      <Printer className="w-3.5 h-3.5" /> Print
                    </button>
                    <button className="ap-btn-ghost flex-1 text-xs">
                      <Share2 className="w-3.5 h-3.5" /> Share
                    </button>
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
