import { useState, useMemo } from "react";
import {
  CheckCircle2,
  Users,
  AlertCircle,
  Clock,
  Download,
  Search,
  Filter,
  Calendar,
  QrCode,
  Fingerprint,
  Plus,
  Edit,
  Trash2,
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
import { StatCard, Panel, Badge, DataTable, Toolbar, Tabs } from "@/components/admin/ui";
import { useModuleData } from "@/hooks/use-module-data";

const weekTrend = [
  { day: "Mon", pct: 92 },
  { day: "Tue", pct: 88 },
  { day: "Wed", pct: 94 },
  { day: "Thu", pct: 90 },
  { day: "Fri", pct: 87 },
  { day: "Sat", pct: 82 },
];

const monthData = [
  { week: "W1", pct: 91 },
  { week: "W2", pct: 89 },
  { week: "W3", pct: 93 },
  { week: "W4", pct: 92 },
];

export function AttendancePage() {
  const [q, setQ] = useState("");
  const [activeTab, setActiveTab] = useState("daily");
  const { rows, remove } = useModuleData("attendance");

  const stats = useMemo(() => {
    const today = new Date().toISOString().slice(0, 10);
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
  }, [rows]);

  const filtered = rows.filter(
    (r) =>
      !q ||
      (r.studentId as string)?.toLowerCase().includes(q.toLowerCase()) ||
      (r.markedBy as string)?.toLowerCase().includes(q.toLowerCase()),
  );

  return (
    <div>
      <PageHeader
        title="Attendance"
        subtitle="Daily, biometric & QR-scan attendance tracking across all batches."
        actions={
          <>
            <button className="ap-btn-ghost">
              <Download className="w-4 h-4" /> Export
            </button>
            <button className="ap-btn">
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
          { label: "QR Scan", value: "qr" },
          { label: "Biometric", value: "biometric" },
          { label: "Reports", value: "reports" },
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
              <button className="ap-btn-ghost">
                <Calendar className="w-4 h-4" /> Today
              </button>
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

        {activeTab === "trends" && (
          <div className="grid grid-cols-1 xl:grid-cols-2 gap-4">
            <Panel title="Weekly Attendance %" subtitle="All batches average">
              <div className="h-64">
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={weekTrend}>
                    <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--ap-border))" />
                    <XAxis dataKey="day" stroke="hsl(var(--ap-muted))" fontSize={11} />
                    <YAxis domain={[70, 100]} stroke="hsl(var(--ap-muted))" fontSize={11} />
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
            </Panel>
            <Panel title="Monthly Trend" subtitle="4-week average">
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
                    <YAxis domain={[80, 100]} stroke="hsl(var(--ap-muted))" fontSize={11} />
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
            </Panel>
          </div>
        )}

        {activeTab === "qr" && (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            <Panel title="QR Attendance Scanner">
              <div className="ap-card p-8 text-center border-2 border-dashed border-[hsl(var(--ap-purple)/0.3)]">
                <QrCode className="w-12 h-12 mx-auto text-[hsl(var(--ap-purple))] mb-3" />
                <p className="font-bold">Scan Student QR Code</p>
                <p className="text-sm text-[hsl(var(--ap-muted))] mt-1">
                  Point camera at student ID card QR
                </p>
                <button className="ap-btn mt-4">
                  <QrCode className="w-4 h-4" /> Open Scanner
                </button>
              </div>
            </Panel>
            <Panel title="Recent QR Scans">
              <div className="space-y-2">
                {rows
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
                  ))}
              </div>
            </Panel>
          </div>
        )}

        {activeTab === "biometric" && (
          <Panel title="Biometric Attendance">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {[
                { device: "Main Gate", status: "Online", scans: 142, last: "2 min ago" },
                { device: "Room 204", status: "Online", scans: 45, last: "5 min ago" },
                { device: "Room 302", status: "Offline", scans: 38, last: "1 hr ago" },
              ].map((d, i) => (
                <div key={i} className="ap-card p-4">
                  <div className="flex items-center justify-between mb-3">
                    <div className="flex items-center gap-2">
                      <Fingerprint className="w-5 h-5 text-[hsl(var(--ap-purple))]" />
                      <span className="font-bold">{d.device}</span>
                    </div>
                    <Badge tone={d.status === "Online" ? "success" : "danger"}>{d.status}</Badge>
                  </div>
                  <div className="space-y-1 text-sm">
                    <div className="flex justify-between">
                      <span className="text-[hsl(var(--ap-muted))]">Today's Scans</span>
                      <span className="font-bold">{d.scans}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-[hsl(var(--ap-muted))]">Last Scan</span>
                      <span className="font-bold">{d.last}</span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </Panel>
        )}

        {activeTab === "reports" && (
          <Panel title="Attendance Reports">
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
              {[
                { title: "Daily Report", desc: "Today's batch-wise attendance" },
                { title: "Weekly Summary", desc: "7-day attendance trend" },
                { title: "Monthly Report", desc: "Full month analysis" },
                { title: "Low Attendance", desc: "Students below 75%" },
                { title: "Perfect Attendance", desc: "100% attendance students" },
                { title: "Batch Comparison", desc: "Cross-batch analysis" },
              ].map((r) => (
                <div
                  key={r.title}
                  className="ap-card p-4 flex items-start gap-3 hover:shadow-lg transition cursor-pointer"
                >
                  <div className="w-11 h-11 rounded-xl ap-grad flex items-center justify-center text-white">
                    <Calendar className="w-5 h-5" />
                  </div>
                  <div>
                    <p className="font-bold">{r.title}</p>
                    <p className="text-xs text-[hsl(var(--ap-muted))] mt-0.5">{r.desc}</p>
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
