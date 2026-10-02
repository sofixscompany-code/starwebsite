import { useState, useMemo } from "react";
import {
  Radio,
  Download,
  Search,
  Plus,
  Edit,
  Trash2,
  Calendar,
  Clock,
  Award,
  Save,
  Loader2,
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
import { StatCard, Panel, DataTable, Toolbar, Tabs, Modal } from "@/components/admin/ui";
import { useModuleData } from "@/hooks/use-module-data";
import { toast } from "sonner";

type ExamForm = {
  title: string;
  subject: string;
  scheduledAt: string;
  durationMin: string;
  totalMarks: string;
};

const DISTRIBUTION = [
  { range: "90-100%", color: "hsl(152 60% 42%)" },
  { range: "80-89%", color: "hsl(262 83% 58%)" },
  { range: "70-79%", color: "hsl(210 92% 55%)" },
  { range: "60-69%", color: "hsl(24 95% 58%)" },
  { range: "Below 60%", color: "hsl(355 82% 58%)" },
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

export function ExamsPage() {
  const [q, setQ] = useState("");
  const [activeTab, setActiveTab] = useState("exams");
  const { rows, create, update, remove } = useModuleData("exams");
  const { rows: results } = useModuleData("results");

  /* ---- Create / edit form ---- */
  const emptyForm: ExamForm = {
    title: "",
    subject: "",
    scheduledAt: "",
    durationMin: "",
    totalMarks: "",
  };
  const [formOpen, setFormOpen] = useState(false);
  const [form, setForm] = useState<ExamForm>(emptyForm);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);

  const openCreate = () => {
    setForm(emptyForm);
    setEditingId(null);
    setFormOpen(true);
  };

  const openEdit = (row: Record<string, unknown>) => {
    setForm({
      title: String(row.title ?? ""),
      subject: String(row.subject ?? ""),
      scheduledAt: String(row.scheduledAt ?? ""),
      durationMin: row.durationMin != null ? String(row.durationMin) : "",
      totalMarks: row.totalMarks != null ? String(row.totalMarks) : "",
    });
    setEditingId(String(row.id));
    setFormOpen(true);
  };

  const handleSubmit = async () => {
    if (!form.title.trim()) return toast.error("Exam title is required");
    setSaving(true);
    try {
      const payload = {
        title: form.title.trim(),
        subject: form.subject.trim(),
        scheduledAt: form.scheduledAt.trim(),
        durationMin: form.durationMin ? Number(form.durationMin) : "",
        totalMarks: form.totalMarks ? Number(form.totalMarks) : "",
      };
      if (editingId) {
        await update(editingId, payload);
        toast.success("Exam updated");
      } else {
        await create(payload);
        toast.success("Exam created");
      }
      setFormOpen(false);
      setEditingId(null);
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Failed to save exam");
    } finally {
      setSaving(false);
    }
  };

  const filtered = useMemo(
    () =>
      rows.filter(
        (e) =>
          !q ||
          (e.title as string)?.toLowerCase().includes(q.toLowerCase()) ||
          (e.subject as string)?.toLowerCase().includes(q.toLowerCase()),
      ),
    [rows, q],
  );

  const now = Date.now();
  const upcoming = rows.filter((e) => new Date(String(e.scheduledAt ?? "")).getTime() > now).length;
  const subjects = new Set(rows.map((e) => String(e.subject || "")).filter(Boolean)).size;
  const avgDuration = rows.length
    ? Math.round(rows.reduce((s, e) => s + (Number(e.durationMin) || 0), 0) / rows.length)
    : 0;

  /* ---- Live results analytics (shared `results` collection) ---- */
  const resultDistribution = useMemo(() => {
    const counts = [0, 0, 0, 0, 0];
    results.forEach((r) => {
      const score = Number(r.score) || 0;
      const pct = (score / (Number(r.total) || 100)) * 100;
      const idx = pct >= 90 ? 0 : pct >= 80 ? 1 : pct >= 70 ? 2 : pct >= 60 ? 3 : 4;
      counts[idx] += 1;
    });
    return DISTRIBUTION.map((d, i) => ({ ...d, count: counts[i] }));
  }, [results]);

  const topPerformers = useMemo(
    () =>
      results
        .map((r) => ({
          id: r.id,
          studentId: String(r.studentId ?? "Unknown"),
          exam: String(r.exam ?? ""),
          subject: String(r.subject ?? ""),
          score: Number(r.score) || 0,
          total: Number(r.total) || 0,
          pct: (Number(r.score) || 0) / (Number(r.total) || 100),
        }))
        .sort((a, b) => b.pct - a.pct)
        .slice(0, 5),
    [results],
  );

  const columns = [
    { key: "title", label: "Exam" },
    { key: "subject", label: "Subject" },
    { key: "scheduledAt", label: "Scheduled" },
    { key: "durationMin", label: "Duration" },
    { key: "totalMarks", label: "Marks" },
  ];

  return (
    <div>
      <PageHeader
        title="Examinations"
        subtitle="Create, schedule, and manage exams."
        actions={
          <>
            <button
              className="ap-btn-ghost"
              onClick={() => exportCsv(filtered, columns, "exams-export.csv")}
            >
              <Download className="w-4 h-4" /> Export
            </button>
            <button className="ap-btn" onClick={openCreate}>
              <Plus className="w-4 h-4" /> Create Exam
            </button>
          </>
        }
      />
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
        <StatCard label="Upcoming" value={upcoming} icon={Calendar} tone="purple" />
        <StatCard label="Total Exams" value={rows.length} icon={Radio} tone="warning" />
        <StatCard label="Subjects" value={subjects} icon={Award} tone="info" />
        <StatCard label="Avg Duration" value={`${avgDuration} min`} icon={Clock} tone="success" />
      </div>

      <Tabs
        tabs={[
          { label: "Exams", value: "exams" },
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
                  render: (r) => <span>{(r.durationMin as number) ?? "—"} min</span>,
                },
                { key: "totalMarks", label: "Marks" },
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
                    onClick={() => remove(r.id)}
                    title="Delete"
                  >
                    <Trash2 className="w-3.5 h-3.5 text-[hsl(var(--ap-danger))]" />
                  </button>
                </div>
              )}
            />
          </>
        )}

        {activeTab === "results" && (
          <div className="grid grid-cols-1 xl:grid-cols-2 gap-4">
            <Panel title="Score Distribution" subtitle="All recorded results">
              {results.length === 0 ? (
                <p className="h-64 flex items-center justify-center text-sm text-[hsl(var(--ap-muted))]">
                  No results recorded yet.
                </p>
              ) : (
                <>
                  <div className="h-64">
                    <ResponsiveContainer width="100%" height="100%">
                      <PieChart>
                        <Pie
                          data={resultDistribution.filter((c) => c.count > 0)}
                          innerRadius={50}
                          outerRadius={85}
                          dataKey="count"
                          paddingAngle={4}
                        >
                          {resultDistribution
                            .filter((c) => c.count > 0)
                            .map((c) => (
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
                        <span
                          className="w-2.5 h-2.5 rounded-full"
                          style={{ background: r.color }}
                        />
                        <span className="text-[hsl(var(--ap-muted))]">{r.range}</span>
                        <span className="ml-auto font-bold">{r.count} results</span>
                      </div>
                    ))}
                  </div>
                </>
              )}
            </Panel>
            <Panel title="Top Performers" subtitle="Highest scoring results">
              <div className="space-y-2">
                {topPerformers.length === 0 ? (
                  <p className="text-sm text-[hsl(var(--ap-muted))] text-center py-6">
                    No results recorded yet.
                  </p>
                ) : (
                  topPerformers.map((t, i) => (
                    <div
                      key={t.id}
                      className="flex items-center gap-3 p-2.5 rounded-xl hover:bg-[hsl(var(--ap-border)/0.3)]"
                    >
                      <div
                        className={`w-8 h-8 rounded-full flex items-center justify-center text-white text-xs font-black ${i === 0 ? "ap-grad" : i === 1 ? "bg-[hsl(var(--ap-orange))]" : i === 2 ? "bg-[hsl(var(--ap-info))]" : "bg-[hsl(var(--ap-border))]"}`}
                      >
                        {i < 3 ? <Award className="w-4 h-4" /> : i + 1}
                      </div>
                      <div className="flex-1">
                        <p className="text-sm font-semibold">{t.studentId as string}</p>
                        <p className="text-xs text-[hsl(var(--ap-muted))]">
                          {(t.exam as string) || "—"} · {(t.subject as string) || "—"}
                        </p>
                      </div>
                      <span className="font-bold text-[hsl(var(--ap-success))]">
                        {t.score as number}/{t.total as number}
                      </span>
                    </div>
                  ))
                )}
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
            </div>
          </Panel>
        )}
      </div>

      {/* Create / edit exam */}
      <Modal open={formOpen} onClose={() => setFormOpen(false)} size="md">
        <h2 className="text-lg font-bold mb-4">{editingId ? "Edit Exam" : "Create Exam"}</h2>
        <div className="space-y-4">
          <label className="block">
            <span className="text-xs font-bold uppercase tracking-widest text-[hsl(var(--ap-muted))]">
              Title *
            </span>
            <input
              value={form.title}
              onChange={(e) => setForm({ ...form, title: e.target.value })}
              placeholder="Math Unit Test Ch.4-6"
              className="ap-input mt-1"
            />
          </label>
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
              Scheduled At
            </span>
            <input
              value={form.scheduledAt}
              onChange={(e) => setForm({ ...form, scheduledAt: e.target.value })}
              placeholder="2024-03-08 09:00"
              className="ap-input mt-1"
            />
          </label>
          <div className="grid grid-cols-2 gap-4">
            <label className="block">
              <span className="text-xs font-bold uppercase tracking-widest text-[hsl(var(--ap-muted))]">
                Duration (min)
              </span>
              <input
                type="number"
                value={form.durationMin}
                onChange={(e) => setForm({ ...form, durationMin: e.target.value })}
                placeholder="90"
                className="ap-input mt-1"
              />
            </label>
            <label className="block">
              <span className="text-xs font-bold uppercase tracking-widest text-[hsl(var(--ap-muted))]">
                Total Marks
              </span>
              <input
                type="number"
                value={form.totalMarks}
                onChange={(e) => setForm({ ...form, totalMarks: e.target.value })}
                placeholder="75"
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
            {editingId ? "Update" : "Create"} Exam
          </button>
        </div>
      </Modal>
    </div>
  );
}
