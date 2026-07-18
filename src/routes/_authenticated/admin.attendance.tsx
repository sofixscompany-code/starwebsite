import {  } from "react-router-dom";
import { useState } from "react";
import {
  CheckCircle2, Users, AlertCircle, Clock, Download, Search, Filter,
  Calendar, QrCode, Fingerprint, Plus, Eye, Edit,
} from "lucide-react";
import {
  BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid,
  LineChart, Line, AreaChart, Area,
} from "recharts";
import { PageHeader } from "@/components/admin/AdminShell";
import { StatCard, Panel, Badge, DataTable, Toolbar, Tabs } from "@/components/admin/ui";

const BATCH_ATTENDANCE = [
  { id: "1", batch: "B-12", course: "Nepal Police", present: 42, absent: 3, late: 1, pct: 93, mode: "Biometric", date: "2024-10-10" },
  { id: "2", batch: "L-04", course: "Loksewa", present: 38, absent: 2, late: 0, pct: 95, mode: "QR", date: "2024-10-10" },
  { id: "3", batch: "A-08", course: "APF", present: 30, absent: 5, late: 2, pct: 82, mode: "Manual", date: "2024-10-10" },
  { id: "4", batch: "BK-02", course: "Bank PO", present: 28, absent: 1, late: 1, pct: 93, mode: "Biometric", date: "2024-10-10" },
  { id: "5", batch: "N-05", course: "Nepal Army", present: 25, absent: 4, late: 0, pct: 86, mode: "Biometric", date: "2024-10-10" },
  { id: "6", batch: "B-13", course: "Nepal Police", present: 35, absent: 2, late: 1, pct: 92, mode: "QR", date: "2024-10-10" },
  { id: "7", batch: "L-05", course: "Loksewa SO", present: 22, absent: 1, late: 0, pct: 96, mode: "Biometric", date: "2024-10-10" },
  { id: "8", batch: "BK-03", course: "Bank Assistant", present: 20, absent: 2, late: 1, pct: 87, mode: "Manual", date: "2024-10-10" },
];

const weekTrend = [
  { day: "Mon", pct: 92, present: 240, absent: 20 },
  { day: "Tue", pct: 88, present: 228, absent: 32 },
  { day: "Wed", pct: 94, present: 244, absent: 16 },
  { day: "Thu", pct: 90, present: 234, absent: 26 },
  { day: "Fri", pct: 87, present: 226, absent: 34 },
  { day: "Sat", pct: 82, present: 213, absent: 47 },
];

const monthData = [
  { week: "W1", pct: 91 }, { week: "W2", pct: 89 }, { week: "W3", pct: 93 }, { week: "W4", pct: 92 },
];

export function AttendancePage() {
  const [q, setQ] = useState("");
  const [activeTab, setActiveTab] = useState("daily");

  const totalPresent = BATCH_ATTENDANCE.reduce((s, b) => s + b.present, 0);
  const totalAbsent = BATCH_ATTENDANCE.reduce((s, b) => s + b.absent, 0);
  const totalLate = BATCH_ATTENDANCE.reduce((s, b) => s + b.late, 0);
  const avgPct = Math.round(BATCH_ATTENDANCE.reduce((s, b) => s + b.pct, 0) / BATCH_ATTENDANCE.length);

  const filtered = BATCH_ATTENDANCE.filter(
    (b) => !q || b.batch.toLowerCase().includes(q.toLowerCase()) || b.course.toLowerCase().includes(q.toLowerCase()),
  );

  return (
    <div>
      <PageHeader
        title="Attendance"
        subtitle="Daily, biometric & QR-scan attendance tracking across all batches."
        actions={
          <>
            <button className="ap-btn-ghost"><Download className="w-4 h-4" /> Export</button>
            <button className="ap-btn"><Plus className="w-4 h-4" /> Mark Attendance</button>
          </>
        }
      />
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
        <StatCard label="Today's %" value={`${avgPct}%`} icon={CheckCircle2} tone="success" />
        <StatCard label="Present" value={totalPresent} icon={Users} tone="success" />
        <StatCard label="Absent" value={totalAbsent} icon={AlertCircle} tone="danger" />
        <StatCard label="Late" value={totalLate} icon={Clock} tone="warning" />
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
                <input value={q} onChange={(e) => setQ(e.target.value)} placeholder="Search batch, course..." className="ap-input pl-9" />
              </div>
              <button className="ap-btn-ghost"><Calendar className="w-4 h-4" /> 2024-10-10</button>
              <button className="ap-btn-ghost"><Filter className="w-4 h-4" /> Filters</button>
              <select className="ap-input max-w-[160px]"><option>All modes</option><option>Biometric</option><option>QR</option><option>Manual</option></select>
            </Toolbar>

            <DataTable
              rows={filtered}
              columns={[
                { key: "batch", label: "Batch", render: (r) => <Badge tone="info">{r.batch}</Badge> },
                { key: "course", label: "Course" },
                { key: "present", label: "Present", render: (r) => <span className="font-bold text-[hsl(var(--ap-success))]">{r.present}</span> },
                { key: "absent", label: "Absent", render: (r) => <span className="font-bold text-[hsl(var(--ap-danger))]">{r.absent}</span> },
                { key: "late", label: "Late", render: (r) => <span className="font-bold text-[hsl(var(--ap-warning))]">{r.late}</span> },
                {
                  key: "pct", label: "%",
                  render: (r) => (
                    <div className="flex items-center gap-2">
                      <div className="w-20 h-1.5 rounded-full bg-[hsl(var(--ap-border))]">
                        <div className="h-1.5 rounded-full ap-grad" style={{ width: `${r.pct}%` }} />
                      </div>
                      <span className="text-xs font-bold">{r.pct}%</span>
                    </div>
                  ),
                },
                { key: "mode", label: "Mode", render: (r) => <Badge tone="muted">{r.mode}</Badge> },
              ]}
              actions={() => (
                <div className="flex gap-1">
                  <button className="p-1.5 rounded-lg hover:bg-[hsl(var(--ap-border)/0.5)]"><Eye className="w-3.5 h-3.5" /></button>
                  <button className="p-1.5 rounded-lg hover:bg-[hsl(var(--ap-border)/0.5)]"><Edit className="w-3.5 h-3.5" /></button>
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
                    <Tooltip contentStyle={{ background: "hsl(var(--ap-panel))", border: "1px solid hsl(var(--ap-border))", borderRadius: 12 }} />
                    <Line type="monotone" dataKey="pct" stroke="hsl(262 83% 58%)" strokeWidth={3} dot={{ r: 5 }} />
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
                    <Tooltip contentStyle={{ background: "hsl(var(--ap-panel))", border: "1px solid hsl(var(--ap-border))", borderRadius: 12 }} />
                    <Area type="monotone" dataKey="pct" stroke="hsl(24 95% 58%)" fill="url(#att)" strokeWidth={2} />
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
                <p className="text-sm text-[hsl(var(--ap-muted))] mt-1">Point camera at student ID card QR</p>
                <button className="ap-btn mt-4"><QrCode className="w-4 h-4" /> Open Scanner</button>
              </div>
            </Panel>
            <Panel title="Recent QR Scans">
              <div className="space-y-2">
                {[
                  { time: "09:02 AM", name: "Aarav Sharma", batch: "B-12", status: "On Time" },
                  { time: "09:05 AM", name: "Priya Karki", batch: "L-04", status: "On Time" },
                  { time: "09:15 AM", name: "Rohan Thapa", batch: "A-08", status: "Late" },
                  { time: "09:18 AM", name: "Sita Rana", batch: "BK-02", status: "On Time" },
                  { time: "09:22 AM", name: "Bikash Gurung", batch: "N-05", status: "On Time" },
                ].map((s, i) => (
                  <div key={i} className="flex items-center gap-3 p-2.5 rounded-xl hover:bg-[hsl(var(--ap-border)/0.3)]">
                    <div className="w-8 h-8 rounded-lg ap-grad flex items-center justify-center text-white">
                      <QrCode className="w-4 h-4" />
                    </div>
                    <div className="flex-1">
                      <p className="text-sm font-semibold">{s.name}</p>
                      <p className="text-xs text-[hsl(var(--ap-muted))]">{s.batch} · {s.time}</p>
                    </div>
                    <Badge tone={s.status === "On Time" ? "success" : "warning"}>{s.status}</Badge>
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
                    <div className="flex justify-between"><span className="text-[hsl(var(--ap-muted))]">Today's Scans</span><span className="font-bold">{d.scans}</span></div>
                    <div className="flex justify-between"><span className="text-[hsl(var(--ap-muted))]">Last Scan</span><span className="font-bold">{d.last}</span></div>
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
                <div key={r.title} className="ap-card p-4 flex items-start gap-3 hover:shadow-lg transition cursor-pointer">
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


