import {  } from "react-router-dom";
import { useState } from "react";
import {
  UserPlus, Phone, ClipboardList, Wallet, Download, Search, Filter,
  Eye, Edit, Printer, Receipt, Clock, CheckCircle2, XCircle,
  MoreVertical, CreditCard, FileText,
} from "lucide-react";
import {
  BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid,
  PieChart, Pie, Cell,
} from "recharts";
import { PageHeader } from "@/components/admin/AdminShell";
import { StatCard, Panel, Badge, DataTable, Toolbar, Tabs } from "@/components/admin/ui";

const VISITORS = [
  { id: "1", time: "09:12 AM", name: "Ram Prasad Bhattarai", purpose: "Course inquiry", contact: "9812345001", handled: "Reception A", status: "Completed", type: "Walk-in" },
  { id: "2", time: "09:45 AM", name: "Sunita Dahal", purpose: "Admission Nepal Police", contact: "9812345002", handled: "Reception B", status: "Completed", type: "Admission" },
  { id: "3", time: "10:20 AM", name: "Kiran Basnet", purpose: "Fee payment", contact: "9812345003", handled: "Reception A", status: "Completed", type: "Payment" },
  { id: "4", time: "10:55 AM", name: "Nabin Poudel", purpose: "Certificate collection", contact: "9812345004", handled: "Reception A", status: "Pending", type: "Certificate" },
  { id: "5", time: "11:40 AM", name: "Prem Rai", purpose: "Demo class", contact: "9812345005", handled: "Reception B", status: "Scheduled", type: "Demo" },
  { id: "6", time: "12:15 PM", name: "Sita Kumari", purpose: "Complaint", contact: "9812345006", handled: "Reception A", status: "Pending", type: "Complaint" },
  { id: "7", time: "01:00 PM", name: "Rajesh Hamal", purpose: "Admission inquiry", contact: "9812345007", handled: "Reception B", status: "Completed", type: "Walk-in" },
  { id: "8", time: "01:30 PM", name: "Anita Thapa", purpose: "Document submission", contact: "9812345008", handled: "Reception A", status: "Completed", type: "Admission" },
];

const purposeSplit = [
  { name: "Admission", value: 35, color: "hsl(262 83% 58%)" },
  { name: "Fee Payment", value: 25, color: "hsl(24 95% 58%)" },
  { name: "Inquiry", value: 20, color: "hsl(210 92% 55%)" },
  { name: "Certificate", value: 12, color: "hsl(152 60% 42%)" },
  { name: "Other", value: 8, color: "hsl(355 82% 58%)" },
];

const hourlyData = [
  { hour: "9 AM", visitors: 8 }, { hour: "10 AM", visitors: 12 }, { hour: "11 AM", visitors: 15 },
  { hour: "12 PM", visitors: 6 }, { hour: "1 PM", visitors: 10 }, { hour: "2 PM", visitors: 14 },
  { hour: "3 PM", visitors: 11 }, { hour: "4 PM", visitors: 5 },
];

export function ReceptionPage() {
  const [q, setQ] = useState("");
  const [activeTab, setActiveTab] = useState("visitors");

  return (
    <div>
      <PageHeader
        title="Reception"
        subtitle="Walk-in visitors, inquiries, quick fee collection & certificate issuance."
        actions={
          <>
            <button className="ap-btn-ghost"><Download className="w-4 h-4" /> Export</button>
            <button className="ap-btn"><UserPlus className="w-4 h-4" /> New Visitor</button>
          </>
        }
      />
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
        <StatCard label="Visitors Today" value={32} icon={UserPlus} tone="purple" />
        <StatCard label="Inquiries" value={18} icon={Phone} tone="orange" />
        <StatCard label="Admissions Today" value={6} icon={ClipboardList} tone="success" />
        <StatCard label="Collected Today" prefix="₹" value={42500} icon={Wallet} tone="success" />
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 xl:grid-cols-3 gap-4 mb-6">
        <Panel title="Hourly Visitor Flow" subtitle="Today's walk-in pattern" className="xl:col-span-2">
          <div className="h-56">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={hourlyData}>
                <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--ap-border))" />
                <XAxis dataKey="hour" stroke="hsl(var(--ap-muted))" fontSize={11} />
                <YAxis stroke="hsl(var(--ap-muted))" fontSize={11} />
                <Tooltip contentStyle={{ background: "hsl(var(--ap-panel))", border: "1px solid hsl(var(--ap-border))", borderRadius: 12 }} />
                <Bar dataKey="visitors" radius={[6, 6, 0, 0]} fill="hsl(262 83% 58%)" />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </Panel>
        <Panel title="Visit Purpose" subtitle="Breakdown by type">
          <div className="h-48">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie data={purposeSplit} innerRadius={45} outerRadius={75} dataKey="value" paddingAngle={4}>
                  {purposeSplit.map((c) => <Cell key={c.name} fill={c.color} />)}
                </Pie>
                <Tooltip contentStyle={{ background: "hsl(var(--ap-panel))", border: "1px solid hsl(var(--ap-border))", borderRadius: 12 }} />
              </PieChart>
            </ResponsiveContainer>
          </div>
          <div className="grid grid-cols-2 gap-1 mt-2">
            {purposeSplit.map((p) => (
              <div key={p.name} className="flex items-center gap-2 text-xs">
                <span className="w-2 h-2 rounded-full" style={{ background: p.color }} />
                <span className="text-[hsl(var(--ap-muted))] truncate">{p.name}</span>
                <span className="ml-auto font-bold">{p.value}%</span>
              </div>
            ))}
          </div>
        </Panel>
      </div>

      <Tabs
        tabs={[
          { label: "Visitors", value: "visitors", badge: String(VISITORS.length) },
          { label: "Quick Fee", value: "fee" },
          { label: "Certificates", value: "certificates" },
          { label: "Student Search", value: "search" },
        ]}
        value={activeTab}
        onChange={setActiveTab}
      />

      <div className="mt-4">
        {activeTab === "visitors" && (
          <>
            <Toolbar>
              <div className="relative flex-1 max-w-xs">
                <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-[hsl(var(--ap-muted))]" />
                <input value={q} onChange={(e) => setQ(e.target.value)} placeholder="Search visitor, purpose..." className="ap-input pl-9" />
              </div>
              <button className="ap-btn-ghost"><Filter className="w-4 h-4" /> Filters</button>
              <select className="ap-input max-w-[160px]"><option>All types</option><option>Walk-in</option><option>Admission</option><option>Payment</option><option>Certificate</option><option>Demo</option></select>
              <select className="ap-input max-w-[160px]"><option>All status</option><option>Completed</option><option>Pending</option><option>Scheduled</option></select>
            </Toolbar>

            <DataTable
              rows={VISITORS.filter((v) => !q || v.name.toLowerCase().includes(q.toLowerCase()) || v.purpose.toLowerCase().includes(q.toLowerCase()))}
              columns={[
                { key: "time", label: "Time", render: (r) => <span className="font-mono font-bold text-[hsl(var(--ap-purple))]">{r.time}</span> },
                {
                  key: "name", label: "Visitor",
                  render: (r) => (
                    <div>
                      <p className="font-semibold">{r.name}</p>
                      <p className="text-xs text-[hsl(var(--ap-muted))]">{r.contact}</p>
                    </div>
                  ),
                },
                { key: "purpose", label: "Purpose" },
                { key: "type", label: "Type", render: (r) => <Badge tone="muted">{r.type}</Badge> },
                { key: "handled", label: "Handled By" },
                {
                  key: "status", label: "Status",
                  render: (r) => <Badge tone={r.status === "Completed" ? "success" : r.status === "Pending" ? "warning" : "info"}>{r.status}</Badge>,
                },
              ]}
              actions={(r) => (
                <div className="flex gap-1">
                  <button className="p-1.5 rounded-lg hover:bg-[hsl(var(--ap-border)/0.5)]"><Eye className="w-3.5 h-3.5" /></button>
                  {r.status === "Pending" && <button className="p-1.5 rounded-lg hover:bg-[hsl(var(--ap-success)/0.1)]"><CheckCircle2 className="w-3.5 h-3.5 text-[hsl(var(--ap-success))]" /></button>}
                </div>
              )}
            />
          </>
        )}

        {activeTab === "fee" && (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            <Panel title="Quick Fee Collection">
              <div className="space-y-4">
                <label className="block">
                  <span className="text-xs font-bold uppercase tracking-widest text-[hsl(var(--ap-muted))]">Student Roll / Name</span>
                  <input placeholder="Enter roll number or name" className="ap-input mt-1" />
                </label>
                <label className="block">
                  <span className="text-xs font-bold uppercase tracking-widest text-[hsl(var(--ap-muted))]">Fee Type</span>
                  <select className="ap-input mt-1"><option>Monthly Fee</option><option>Admission Fee</option><option>Exam Fee</option><option>Hostel Fee</option><option>Transport Fee</option></select>
                </label>
                <label className="block">
                  <span className="text-xs font-bold uppercase tracking-widest text-[hsl(var(--ap-muted))]">Amount</span>
                  <input placeholder="₹0.00" className="ap-input mt-1" />
                </label>
                <label className="block">
                  <span className="text-xs font-bold uppercase tracking-widest text-[hsl(var(--ap-muted))]">Payment Method</span>
                  <div className="grid grid-cols-3 gap-2 mt-1">
                    {["Cash", "eSewa", "Khalti", "Card", "Bank", "IME Pay"].map((m) => (
                      <button key={m} className="ap-btn-ghost text-center text-xs py-2">{m}</button>
                    ))}
                  </div>
                </label>
                <button className="ap-btn w-full justify-center"><Receipt className="w-4 h-4" /> Collect & Print Receipt</button>
              </div>
            </Panel>
            <Panel title="Recent Collections">
              <div className="space-y-2">
                {[
                  { name: "Priya K.", amount: "₹18,500", method: "eSewa", time: "10:20 AM" },
                  { name: "Aarav S.", amount: "₹25,000", method: "Khalti", time: "09:45 AM" },
                  { name: "Rohan T.", amount: "₹12,000", method: "Cash", time: "09:15 AM" },
                  { name: "Sita R.", amount: "₹8,500", method: "Card", time: "Yesterday" },
                ].map((c, i) => (
                  <div key={i} className="flex items-center justify-between p-2.5 rounded-xl hover:bg-[hsl(var(--ap-border)/0.3)] transition">
                    <div>
                      <p className="text-sm font-semibold">{c.name}</p>
                      <p className="text-xs text-[hsl(var(--ap-muted))]">{c.method} · {c.time}</p>
                    </div>
                    <span className="font-bold text-[hsl(var(--ap-success))]">{c.amount}</span>
                  </div>
                ))}
              </div>
            </Panel>
          </div>
        )}

        {activeTab === "certificates" && (
          <Panel title="Certificate Issuance">
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <label className="block">
                  <span className="text-xs font-bold uppercase tracking-widest text-[hsl(var(--ap-muted))]">Student Roll</span>
                  <input placeholder="SCI-2024-XXX" className="ap-input mt-1" />
                </label>
                <label className="block">
                  <span className="text-xs font-bold uppercase tracking-widest text-[hsl(var(--ap-muted))]">Certificate Type</span>
                  <select className="ap-input mt-1"><option>Completion</option><option>Merit</option><option>Attendance</option><option>Participation</option></select>
                </label>
              </div>
              <button className="ap-btn"><Printer className="w-4 h-4" /> Generate & Print</button>
              <div className="ap-card p-4 text-center">
                <FileText className="w-8 h-8 mx-auto text-[hsl(var(--ap-muted))] mb-2" />
                <p className="text-sm font-semibold">No certificates issued today</p>
                <p className="text-xs text-[hsl(var(--ap-muted))]">Select a student and certificate type to generate</p>
              </div>
            </div>
          </Panel>
        )}

        {activeTab === "search" && (
          <Panel title="Student Search">
            <div className="space-y-4">
              <div className="relative">
                <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-[hsl(var(--ap-muted))]" />
                <input placeholder="Search by name, roll, phone, or course..." className="ap-input pl-9" />
              </div>
              <div className="space-y-2">
                {[
                  { roll: "SCI-2024-001", name: "Aarav Sharma", course: "Nepal Police", phone: "9812345678" },
                  { roll: "SCI-2024-002", name: "Priya Karki", course: "Loksewa Officer", phone: "9803344556" },
                  { roll: "SCI-2024-003", name: "Rohan Thapa", course: "APF Constable", phone: "9861122334" },
                ].map((s, i) => (
                  <div key={i} className="ap-card p-3 flex items-center gap-3 hover:shadow-md transition cursor-pointer">
                    <div className="w-9 h-9 rounded-full ap-grad flex items-center justify-center text-white text-xs font-bold">
                      {s.name.split(" ").map((x) => x[0]).slice(0, 2).join("")}
                    </div>
                    <div className="flex-1">
                      <p className="text-sm font-semibold">{s.name}</p>
                      <p className="text-xs text-[hsl(var(--ap-muted))]">{s.roll} · {s.course}</p>
                    </div>
                    <span className="text-xs font-mono">{s.phone}</span>
                  </div>
                ))}
              </div>
            </div>
          </Panel>
        )}
      </div>
    </div>
  );
}


