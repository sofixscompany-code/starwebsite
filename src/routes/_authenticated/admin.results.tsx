import { useState, useMemo } from "react";
import {
  Trophy,
  TrendingUp,
  Award,
  Download,
  Search,
  FileText,
  Medal,
  Edit,
  Trash2,
  Save,
  Loader2,
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
import { StatCard, Panel, DataTable, Toolbar, Tabs, Modal } from "@/components/admin/ui";
import { useModuleData } from "@/hooks/use-module-data";
import { toast } from "sonner";

type ResultForm = {
  studentId: string;
  subject: string;
  exam: string;
  score: string;
  total: string;
};

/**
 * `results` is written by `/admin/results`, the teacher gradebook and the
 * teacher results page — keep this column/field set in sync with
 * `admin.teacher.gradebook.tsx` and `admin.teacher.results.tsx`.
 */
const COLUMNS = [
  { key: "studentId", label: "Student ID" },
  { key: "subject", label: "Subject" },
  { key: "exam", label: "Exam" },
  { key: "score", label: "Score" },
  { key: "total", label: "Total" },
];

function exportCsv(
  rows: Record<string, unknown>[],
  keys: { key: string; label: string }[],
  file: string,
) {
  if (!rows.length) return toast.error("No data to export");
  const esc = (v: unknown) => `"${String(v ?? "").replace(/"/g, '""')}"`;
  const csv = [
    keys.map((k) => k.label).join(","),
    ...rows.map((r) => keys.map((k) => esc(r[k.key])).join(",")),
  ].join("\n");
  const url = URL.createObjectURL(new Blob([csv], { type: "text/csv" }));
  const a = document.createElement("a");
  a.href = url;
  a.download = file;
  a.click();
  URL.revokeObjectURL(url);
  toast.success("Exported successfully");
}

export function ResultsPage() {
  const [q, setQ] = useState("");
  const [activeTab, setActiveTab] = useState("results");
  const { rows, create, update, remove } = useModuleData("results");

  /* ---- Create / edit form ---- */
  const emptyForm: ResultForm = { studentId: "", subject: "", exam: "", score: "", total: "" };
  const [formOpen, setFormOpen] = useState(false);
  const [form, setForm] = useState<ResultForm>(emptyForm);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);

  const openCreate = () => {
    setForm(emptyForm);
    setEditingId(null);
    setFormOpen(true);
  };

  const openEdit = (row: Record<string, unknown>) => {
    setForm({
      studentId: String(row.studentId ?? ""),
      subject: String(row.subject ?? ""),
      exam: String(row.exam ?? ""),
      score: row.score != null ? String(row.score) : "",
      total: row.total != null ? String(row.total) : "",
    });
    setEditingId(String(row.id));
    setFormOpen(true);
  };

  const handleSubmit = async () => {
    if (!form.studentId.trim() || !form.exam.trim()) {
      toast.error("Student ID and exam are required");
      return;
    }
    setSaving(true);
    try {
      const payload = {
        studentId: form.studentId.trim(),
        subject: form.subject.trim(),
        exam: form.exam.trim(),
        score: form.score === "" ? "" : Number(form.score),
        total: form.total === "" ? "" : Number(form.total),
      };
      if (editingId) {
        await update(editingId, payload);
        toast.success("Result updated");
      } else {
        await create(payload);
        toast.success("Result published");
      }
      setFormOpen(false);
      setEditingId(null);
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Failed to save result");
    } finally {
      setSaving(false);
    }
  };

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

  /* ---- Score trend derived from live results, grouped by exam ---- */
  const scoreTrend = useMemo(() => {
    const order: string[] = [];
    const map = new Map<string, { sum: number; passed: number; count: number }>();
    rows.forEach((r) => {
      const exam = (r.exam as string) || "Unknown";
      if (!map.has(exam)) {
        map.set(exam, { sum: 0, passed: 0, count: 0 });
        order.push(exam);
      }
      const e = map.get(exam)!;
      const pct = ((r.score as number) || 0) / ((r.total as number) || 100);
      e.sum += pct * 100;
      if (pct >= 0.4) e.passed += 1;
      e.count += 1;
    });
    return order.slice(-6).map((exam) => {
      const e = map.get(exam)!;
      return {
        exam,
        avg: Math.round(e.sum / e.count),
        pass: Math.round((e.passed / e.count) * 100),
      };
    });
  }, [rows]);

  const filtered = useMemo(
    () =>
      rows.filter(
        (r) =>
          !q ||
          (r.exam as string)?.toLowerCase().includes(q.toLowerCase()) ||
          (r.subject as string)?.toLowerCase().includes(q.toLowerCase()) ||
          (r.studentId as string)?.toLowerCase().includes(q.toLowerCase()),
      ),
    [rows, q],
  );

  return (
    <div>
      <PageHeader
        title="Results"
        subtitle="Merit lists, rank analysis, and result publications."
        actions={
          <>
            <button
              className="ap-btn-ghost"
              onClick={() => exportCsv(filtered, COLUMNS, "results-export.csv")}
            >
              <Download className="w-4 h-4" /> Export
            </button>
            <button className="ap-btn" onClick={openCreate}>
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
                            width: `${Math.min(100, (((r.score as number) || 0) / ((r.total as number) || 1)) * 100)}%`,
                          }}
                        />
                      </div>
                      <span className="text-xs font-bold">{(r.score as number) ?? "—"}</span>
                    </div>
                  ),
                },
                { key: "total", label: "Total" },
              ]}
              actions={(r) => (
                <div className="flex gap-1">
                  <button
                    className="p-1.5 rounded-lg hover:bg-[hsl(var(--ap-border)/0.5)]"
                    onClick={() => openEdit(r)}
                    title="Edit"
                  >
                    <Edit className="w-3.5 h-3.5" />
                  </button>
                  <button
                    className="p-1.5 rounded-lg hover:bg-[hsl(var(--ap-danger)/0.1)]"
                    onClick={() => {
                      if (!confirm("Delete this result?")) return;
                      remove(r.id);
                      toast.success("Result deleted");
                    }}
                    title="Delete"
                  >
                    <Trash2 className="w-3.5 h-3.5 text-[hsl(var(--ap-danger))]" />
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
            <Panel title="Score Trend" subtitle="Average scores per exam (latest 6)">
              {scoreTrend.length === 0 ? (
                <p className="h-64 flex items-center justify-center text-sm text-[hsl(var(--ap-muted))]">
                  No results recorded yet.
                </p>
              ) : (
                <div className="h-64">
                  <ResponsiveContainer width="100%" height="100%">
                    <LineChart data={scoreTrend}>
                      <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--ap-border))" />
                      <XAxis dataKey="exam" stroke="hsl(var(--ap-muted))" fontSize={11} />
                      <YAxis domain={[0, 100]} stroke="hsl(var(--ap-muted))" fontSize={11} />
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
              )}
            </Panel>
            <Panel title="Subject Performance" subtitle="Average scores by subject">
              {subjectPerformance.length === 0 ? (
                <p className="h-64 flex items-center justify-center text-sm text-[hsl(var(--ap-muted))]">
                  No results recorded yet.
                </p>
              ) : (
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
              )}
            </Panel>
          </div>
        )}
      </div>

      {/* Create / edit result */}
      <Modal open={formOpen} onClose={() => setFormOpen(false)} size="md">
        <h2 className="text-lg font-bold mb-4">{editingId ? "Edit Result" : "Publish Results"}</h2>
        <div className="space-y-4">
          <label className="block">
            <span className="text-xs font-bold uppercase tracking-widest text-[hsl(var(--ap-muted))]">
              Student ID *
            </span>
            <input
              value={form.studentId}
              onChange={(e) => setForm({ ...form, studentId: e.target.value })}
              placeholder="Student uid"
              className="ap-input mt-1"
            />
          </label>
          <div className="grid grid-cols-2 gap-4">
            <label className="block">
              <span className="text-xs font-bold uppercase tracking-widest text-[hsl(var(--ap-muted))]">
                Subject
              </span>
              <input
                value={form.subject}
                onChange={(e) => setForm({ ...form, subject: e.target.value })}
                placeholder="Mathematics"
                className="ap-input mt-1"
              />
            </label>
            <label className="block">
              <span className="text-xs font-bold uppercase tracking-widest text-[hsl(var(--ap-muted))]">
                Exam *
              </span>
              <input
                value={form.exam}
                onChange={(e) => setForm({ ...form, exam: e.target.value })}
                placeholder="Unit Test 4"
                className="ap-input mt-1"
              />
            </label>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <label className="block">
              <span className="text-xs font-bold uppercase tracking-widest text-[hsl(var(--ap-muted))]">
                Score
              </span>
              <input
                type="number"
                value={form.score}
                onChange={(e) => setForm({ ...form, score: e.target.value })}
                placeholder="85"
                className="ap-input mt-1"
              />
            </label>
            <label className="block">
              <span className="text-xs font-bold uppercase tracking-widest text-[hsl(var(--ap-muted))]">
                Total
              </span>
              <input
                type="number"
                value={form.total}
                onChange={(e) => setForm({ ...form, total: e.target.value })}
                placeholder="100"
                className="ap-input mt-1"
              />
            </label>
          </div>
        </div>
        <div className="flex justify-end gap-3 mt-6">
          <button onClick={() => setFormOpen(false)} className="ap-btn-ghost">
            Cancel
          </button>
          <button onClick={handleSubmit} disabled={saving} className="ap-btn">
            {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
            {editingId ? "Update" : "Publish"}
          </button>
        </div>
      </Modal>
    </div>
  );
}
