import { useState, useMemo } from "react";
import {
  CheckCircle2,
  Users,
  AlertCircle,
  Clock,
  Download,
  Search,
  Calendar,
  QrCode,
  Plus,
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
  AreaChart,
  Area,
} from "recharts";
import { PageHeader } from "@/components/admin/AdminShell";
import { StatCard, Panel, Badge, DataTable, Toolbar, Tabs, Modal } from "@/components/admin/ui";
import { useModuleData } from "@/hooks/use-module-data";
import { toast } from "sonner";

const DAY_LABELS = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];
const WEEK_LABELS = ["3w ago", "2w ago", "1w ago", "This week"];

type AttendanceForm = { studentId: string; date: string; status: string; markedBy: string };

function currentUser() {
  try {
    const u = JSON.parse(localStorage.getItem("auth_user") || "null");
    return u?.name || u?.email || "";
  } catch {
    return "";
  }
}

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

export function AttendancePage() {
  const [q, setQ] = useState("");
  const [activeTab, setActiveTab] = useState("daily");
  const [todayOnly, setTodayOnly] = useState(false);
  const [quickMarkId, setQuickMarkId] = useState("");
  const { rows, create, update, remove } = useModuleData("attendance");

  /* ---- Create / edit form ---- */
  const today = new Date().toISOString().slice(0, 10);
  const emptyForm: AttendanceForm = {
    studentId: "",
    date: today,
    status: "present",
    markedBy: currentUser(),
  };
  const [formOpen, setFormOpen] = useState(false);
  const [form, setForm] = useState<AttendanceForm>(emptyForm);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);

  const openCreate = () => {
    setForm({ ...emptyForm, date: new Date().toISOString().slice(0, 10) });
    setEditingId(null);
    setFormOpen(true);
  };

  const openEdit = (row: Record<string, unknown>) => {
    setForm({
      studentId: String(row.studentId ?? ""),
      date: String(row.date ?? "").slice(0, 10),
      status: String(row.status ?? "present"),
      markedBy: String(row.markedBy ?? ""),
    });
    setEditingId(String(row.id));
    setFormOpen(true);
  };

  const handleSubmit = async () => {
    if (!form.studentId.trim() || !form.date) {
      toast.error("Student ID and date are required");
      return;
    }
    setSaving(true);
    try {
      if (editingId) {
        await update(editingId, { ...form });
        toast.success("Attendance updated");
      } else {
        await create({ ...form });
        toast.success("Attendance marked");
      }
      setFormOpen(false);
      setEditingId(null);
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Failed to save attendance");
    } finally {
      setSaving(false);
    }
  };

  const quickMark = async () => {
    const id = quickMarkId.trim();
    if (!id) return toast.error("Enter a student ID");
    try {
      await create({
        studentId: id,
        date: today,
        status: "present",
        markedBy: currentUser(),
      });
      setQuickMarkId("");
      toast.success(`${id} marked present`);
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Failed to mark attendance");
    }
  };

  const stats = useMemo(() => {
    const todayRows = rows.filter((r) => (r.date as string)?.slice(0, 10) === today);
    const present = todayRows.filter((r) => r.status === "present").length;
    const absent = todayRows.filter((r) => r.status === "absent").length;
    const late = todayRows.filter((r) => r.status === "late").length;
    const total = todayRows.length || 1;
    return {
      present,
      absent,
      late,
      avgPct: Math.round(((present + late) / total) * 100),
    };
  }, [rows, today]);

  const filtered = useMemo(() => {
    return rows.filter((r) => {
      const matchQ =
        !q ||
        (r.studentId as string)?.toLowerCase().includes(q.toLowerCase()) ||
        (r.markedBy as string)?.toLowerCase().includes(q.toLowerCase());
      const matchDay = !todayOnly || (r.date as string)?.slice(0, 10) === today;
      return matchQ && matchDay;
    });
  }, [rows, q, todayOnly, today]);

  /* ---- Live trends derived from the same attendance rows ---- */
  const weekTrend = useMemo(() => {
    const buckets = DAY_LABELS.map((day) => ({ day, present: 0, total: 0 }));
    rows.forEach((r) => {
      const d = new Date(String(r.date ?? ""));
      if (isNaN(d.getTime())) return;
      const b = buckets[(d.getDay() + 6) % 7];
      b.total += 1;
      if (r.status === "present" || r.status === "late") b.present += 1;
    });
    return buckets.map((b) => ({
      day: b.day,
      pct: b.total ? Math.round((b.present / b.total) * 100) : 0,
      hasData: b.total > 0,
    }));
  }, [rows]);

  const monthData = useMemo(() => {
    const now = Date.now();
    const weekMs = 7 * 24 * 60 * 60 * 1000;
    const buckets = WEEK_LABELS.map((week) => ({ week, present: 0, total: 0 }));
    rows.forEach((r) => {
      const d = new Date(String(r.date ?? ""));
      if (isNaN(d.getTime())) return;
      const weeksAgo = Math.floor((now - d.getTime()) / weekMs);
      if (weeksAgo < 0 || weeksAgo > 3) return;
      const b = buckets[3 - weeksAgo];
      b.total += 1;
      if (r.status === "present" || r.status === "late") b.present += 1;
    });
    return buckets.map((b) => ({
      week: b.week,
      pct: b.total ? Math.round((b.present / b.total) * 100) : 0,
    }));
  }, [rows]);

  const hasTrendData = weekTrend.some((d) => d.hasData);

  const columns = [
    { key: "studentId", label: "Student ID" },
    { key: "date", label: "Date" },
    { key: "status", label: "Status" },
    { key: "markedBy", label: "Marked By" },
  ];

  return (
    <div>
      <PageHeader
        title="Attendance"
        subtitle="Daily and quick-mark attendance tracking across all batches."
        actions={
          <>
            <button
              className="ap-btn-ghost"
              onClick={() => exportCsv(filtered, columns, "attendance-export.csv")}
            >
              <Download className="w-4 h-4" /> Export
            </button>
            <button className="ap-btn" onClick={openCreate}>
              <Plus className="w-4 h-4" /> Mark Attendance
            </button>
          </>
        }
      />
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
        <StatCard label="Today's %" value={`${stats.avgPct}%`} icon={CheckCircle2} tone="success" />
        <StatCard label="Present" value={stats.present} icon={Users} tone="success" />
        <StatCard label="Absent" value={stats.absent} icon={AlertCircle} tone="danger" />
        <StatCard label="Late" value={stats.late} icon={Clock} tone="warning" />
      </div>

      <Tabs
        tabs={[
          { label: "Daily", value: "daily" },
          { label: "Trends", value: "trends" },
          { label: "Quick Mark", value: "qr" },
        ]}
        value={activeTab}
        onChange={setActiveTab}
      />

      <div className="mt-4">
        {activeTab === "daily" && (
          <>
            <Toolbar>
              <div className="relative flex-1 max-w-xs">
                <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-[hsl(var(--ap-muted))]" />
                <input
                  value={q}
                  onChange={(e) => setQ(e.target.value)}
                  placeholder="Search student, marked by..."
                  className="ap-input pl-9"
                />
              </div>
              <button
                onClick={() => setTodayOnly((v) => !v)}
                className={`ap-btn-ghost ${todayOnly ? "!bg-[hsl(var(--ap-info)/0.15)] !text-[hsl(var(--ap-info))]" : ""}`}
              >
                <Calendar className="w-4 h-4" /> Today
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
                {
                  key: "date",
                  label: "Date",
                  render: (r) => (
                    <span>{r.date ? new Date(r.date as string).toLocaleDateString() : "—"}</span>
                  ),
                },
                {
                  key: "status",
                  label: "Status",
                  render: (r) => (
                    <Badge
                      tone={
                        r.status === "present"
                          ? "success"
                          : r.status === "absent"
                            ? "danger"
                            : r.status === "late"
                              ? "warning"
                              : "info"
                      }
                    >
                      {(r.status as string) || "—"}
                    </Badge>
                  ),
                },
                { key: "markedBy", label: "Marked By" },
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

        {activeTab === "trends" && (
          <div className="grid grid-cols-1 xl:grid-cols-2 gap-4">
            <Panel
              title="Weekly Attendance %"
              subtitle="Average attendance by weekday (all records)"
            >
              {hasTrendData ? (
                <div className="h-64">
                  <ResponsiveContainer width="100%" height="100%">
                    <LineChart data={weekTrend}>
                      <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--ap-border))" />
                      <XAxis dataKey="day" stroke="hsl(var(--ap-muted))" fontSize={11} />
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
                        dataKey="pct"
                        stroke="hsl(262 83% 58%)"
                        strokeWidth={3}
                        dot={{ r: 5 }}
                      />
                    </LineChart>
                  </ResponsiveContainer>
                </div>
              ) : (
                <p className="h-64 flex items-center justify-center text-sm text-[hsl(var(--ap-muted))]">
                  No attendance records yet — trends appear once attendance is marked.
                </p>
              )}
            </Panel>
            <Panel title="Monthly Trend" subtitle="Last 4 weeks average">
              {hasTrendData ? (
                <div className="h-64">
                  <ResponsiveContainer width="100%" height="100%">
                    <AreaChart data={monthData}>
                      <defs>
                        <linearGradient id="att" x1="0" x2="0" y1="0" y2="1">
                          <stop offset="0%" stopColor="hsl(24 95% 58%)" stopOpacity={0.4} />
                          <stop offset="100%" stopColor="hsl(24 95% 58%)" stopOpacity={0} />
                        </linearGradient>
                      </defs>
                      <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--ap-border))" />
                      <XAxis dataKey="week" stroke="hsl(var(--ap-muted))" fontSize={11} />
                      <YAxis domain={[0, 100]} stroke="hsl(var(--ap-muted))" fontSize={11} />
                      <Tooltip
                        contentStyle={{
                          background: "hsl(var(--ap-panel))",
                          border: "1px solid hsl(var(--ap-border))",
                          borderRadius: 12,
                        }}
                      />
                      <Area
                        type="monotone"
                        dataKey="pct"
                        stroke="hsl(24 95% 58%)"
                        fill="url(#att)"
                        strokeWidth={2}
                      />
                    </AreaChart>
                  </ResponsiveContainer>
                </div>
              ) : (
                <p className="h-64 flex items-center justify-center text-sm text-[hsl(var(--ap-muted))]">
                  No attendance records yet — trends appear once attendance is marked.
                </p>
              )}
            </Panel>
          </div>
        )}

        {activeTab === "qr" && (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            <Panel title="Quick Mark" subtitle="Mark a student present for today">
              <div className="ap-card p-8 text-center border-2 border-dashed border-[hsl(var(--ap-purple)/0.3)]">
                <QrCode className="w-12 h-12 mx-auto text-[hsl(var(--ap-purple))] mb-3" />
                <p className="font-bold">Enter Student ID</p>
                <p className="text-sm text-[hsl(var(--ap-muted))] mt-1">
                  Type or paste the ID from the student's card, then mark them present.
                </p>
                <div className="flex gap-2 mt-4 max-w-sm mx-auto">
                  <input
                    value={quickMarkId}
                    onChange={(e) => setQuickMarkId(e.target.value)}
                    onKeyDown={(e) => e.key === "Enter" && quickMark()}
                    placeholder="Student uid"
                    className="ap-input flex-1"
                  />
                  <button className="ap-btn" onClick={quickMark}>
                    <CheckCircle2 className="w-4 h-4" /> Mark Present
                  </button>
                </div>
              </div>
            </Panel>
            <Panel title="Recent Marks" subtitle="Latest present / late records">
              <div className="space-y-2">
                {rows.filter((r) => r.status === "present" || r.status === "late").length === 0 ? (
                  <p className="text-sm text-[hsl(var(--ap-muted))] text-center py-6">
                    No marks recorded yet.
                  </p>
                ) : (
                  rows
                    .filter((r) => r.status === "present" || r.status === "late")
                    .slice(0, 5)
                    .map((s) => (
                      <div
                        key={s.id}
                        className="flex items-center gap-3 p-2.5 rounded-xl hover:bg-[hsl(var(--ap-border)/0.3)]"
                      >
                        <div className="w-8 h-8 rounded-lg ap-grad flex items-center justify-center text-white">
                          <QrCode className="w-4 h-4" />
                        </div>
                        <div className="flex-1">
                          <p className="text-sm font-semibold">{s.studentId as string}</p>
                          <p className="text-xs text-[hsl(var(--ap-muted))]">
                            {s.date ? new Date(s.date as string).toLocaleDateString() : ""}
                          </p>
                        </div>
                        <Badge tone={s.status === "late" ? "warning" : "success"}>
                          {s.status === "late" ? "Late" : "On Time"}
                        </Badge>
                      </div>
                    ))
                )}
              </div>
            </Panel>
          </div>
        )}
      </div>

      {/* Create / edit attendance */}
      <Modal open={formOpen} onClose={() => setFormOpen(false)} size="md">
        <h2 className="text-lg font-bold mb-4">
          {editingId ? "Edit Attendance" : "Mark Attendance"}
        </h2>
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
          <label className="block">
            <span className="text-xs font-bold uppercase tracking-widest text-[hsl(var(--ap-muted))]">
              Date *
            </span>
            <input
              type="date"
              value={form.date}
              onChange={(e) => setForm({ ...form, date: e.target.value })}
              className="ap-input mt-1"
            />
          </label>
          <label className="block">
            <span className="text-xs font-bold uppercase tracking-widest text-[hsl(var(--ap-muted))]">
              Status
            </span>
            <select
              value={form.status}
              onChange={(e) => setForm({ ...form, status: e.target.value })}
              className="ap-input mt-1"
            >
              <option value="present">Present</option>
              <option value="absent">Absent</option>
              <option value="late">Late</option>
            </select>
          </label>
          <label className="block">
            <span className="text-xs font-bold uppercase tracking-widest text-[hsl(var(--ap-muted))]">
              Marked By
            </span>
            <input
              value={form.markedBy}
              onChange={(e) => setForm({ ...form, markedBy: e.target.value })}
              placeholder="Teacher uid / name"
              className="ap-input mt-1"
            />
          </label>
        </div>
        <div className="flex justify-end gap-3 mt-6">
          <button onClick={() => setFormOpen(false)} className="ap-btn-ghost">
            Cancel
          </button>
          <button onClick={handleSubmit} disabled={saving} className="ap-btn">
            {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
            {editingId ? "Update" : "Mark Attendance"}
          </button>
        </div>
      </Modal>
    </div>
  );
}
