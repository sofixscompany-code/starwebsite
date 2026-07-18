import {  } from "react-router-dom";
import { useState } from "react";
import {
  Send, Sparkles, CheckCircle2, Eye, Download, Search, Filter, Plus,
  MessageCircle, Users, Clock, BarChart3, Smartphone, FileText,
  EyeOff, Trash2, Copy, ExternalLink,
} from "lucide-react";
import {
  BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid,
  PieChart, Pie, Cell, LineChart, Line,
} from "recharts";
import { PageHeader } from "@/components/admin/AdminShell";
import { StatCard, Panel, Badge, DataTable, Toolbar, Tabs, Modal, ProgressBar } from "@/components/admin/ui";

const CAMPAIGNS = [
  { id: "1", name: "Admission Confirmation", template: "tpl_admission_ok", audience: "New admissions", sent: 86, read: 82, replied: 12, status: "Completed", date: "2024-10-08" },
  { id: "2", name: "Exam Reminder", template: "tpl_exam_remind", audience: "Batch B-12", sent: 45, read: 42, replied: 8, status: "Completed", date: "2024-10-07" },
  { id: "3", name: "Result Published", template: "tpl_result_out", audience: "Loksewa batch", sent: 32, read: 28, replied: 5, status: "Completed", date: "2024-10-05" },
  { id: "4", name: "Fee Reminder - October", template: "tpl_fee_remind", audience: "Pending students", sent: 0, read: 0, replied: 0, status: "Draft", date: "—" },
  { id: "5", name: "New Batch Announcement", template: "tpl_new_batch", audience: "All leads", sent: 0, read: 0, replied: 0, status: "Scheduled", date: "2024-10-15" },
];

const TEMPLATES = [
  { id: "1", name: "Admission Confirmation", category: "Admission", body: "Dear {{name}}, your admission #{{admNo}} for {{course}} is confirmed. Please visit with documents.", status: "Approved" },
  { id: "2", name: "Exam Reminder", category: "Exam", body: "Reminder: {{exam}} is scheduled on {{date}} at {{time}}. Bring your admit card.", status: "Approved" },
  { id: "3", name: "Fee Reminder", category: "Fee", body: "Dear {{name}}, your fee of ₹{{amount}} for {{month}} is pending. Pay via eSewa/Khalti.", status: "Approved" },
  { id: "4", name: "Result Published", category: "Result", body: "Results for {{exam}} are out! Check your dashboard. Rank: {{rank}}/{{total}}.", status: "Approved" },
  { id: "5", name: "New Batch", category: "Marketing", body: "New {{course}} batch starting {{date}}. Limited seats! Call {{phone}} to enroll.", status: "Pending" },
  { id: "6", name: "Welcome Message", category: "General", body: "Welcome to Star Coaching Institute! Your journey to success starts here. ", status: "Approved" },
];

const deliveryData = [
  { day: "Mon", sent: 45, read: 38 },
  { day: "Tue", sent: 62, read: 54 },
  { day: "Wed", sent: 38, read: 32 },
  { day: "Thu", sent: 75, read: 68 },
  { day: "Fri", sent: 52, read: 46 },
  { day: "Sat", sent: 28, read: 22 },
  { day: "Sun", sent: 15, read: 12 },
];

const audienceSplit = [
  { name: "Students", value: 45, color: "hsl(262 83% 58%)" },
  { name: "Parents", value: 25, color: "hsl(24 95% 58%)" },
  { name: "Leads", value: 18, color: "hsl(210 92% 55%)" },
  { name: "Teachers", value: 12, color: "hsl(152 60% 42%)" },
];

export function WhatsAppPage() {
  const [activeTab, setActiveTab] = useState("campaigns");
  const [modalOpen, setModalOpen] = useState(false);
  const [templateModal, setTemplateModal] = useState(false);
  const [broadcastOpen, setBroadcastOpen] = useState(false);

  return (
    <div>
      <PageHeader
        title="WhatsApp Marketing"
        subtitle="Templates, campaigns, click-to-chat & broadcast automation."
        actions={
          <>
            <button className="ap-btn-ghost"><Download className="w-4 h-4" /> Export</button>
            <button className="ap-btn-ghost" onClick={() => setTemplateModal(true)}><FileText className="w-4 h-4" /> Templates</button>
            <button className="ap-btn" onClick={() => setBroadcastOpen(true)}><MessageCircle className="w-4 h-4" /> Broadcast</button>
          </>
        }
      />

      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
        <StatCard label="Messages Today" value={124} icon={Send} tone="success" />
        <StatCard label="Active Campaigns" value={6} icon={Sparkles} tone="purple" />
        <StatCard label="Delivery Rate" value="98%" icon={CheckCircle2} tone="success" />
        <StatCard label="Read Rate" value="72%" icon={Eye} tone="info" />
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 xl:grid-cols-3 gap-4 mb-6">
        <Panel title="Weekly Delivery" subtitle="Messages sent vs read" className="xl:col-span-2">
          <div className="h-56">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={deliveryData}>
                <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--ap-border))" />
                <XAxis dataKey="day" stroke="hsl(var(--ap-muted))" fontSize={11} />
                <YAxis stroke="hsl(var(--ap-muted))" fontSize={11} />
                <Tooltip contentStyle={{ background: "hsl(var(--ap-panel))", border: "1px solid hsl(var(--ap-border))", borderRadius: 12 }} />
                <Bar dataKey="sent" name="Sent" radius={[4, 4, 0, 0]} fill="hsl(262 83% 58%)" />
                <Bar dataKey="read" name="Read" radius={[4, 4, 0, 0]} fill="hsl(152 60% 42%)" />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </Panel>
        <Panel title="Audience Split" subtitle="Who receives messages">
          <div className="h-48">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie data={audienceSplit} innerRadius={45} outerRadius={75} dataKey="value" paddingAngle={4}>
                  {audienceSplit.map((c) => <Cell key={c.name} fill={c.color} />)}
                </Pie>
                <Tooltip contentStyle={{ background: "hsl(var(--ap-panel))", border: "1px solid hsl(var(--ap-border))", borderRadius: 12 }} />
              </PieChart>
            </ResponsiveContainer>
          </div>
          <div className="grid grid-cols-2 gap-1 mt-2">
            {audienceSplit.map((a) => (
              <div key={a.name} className="flex items-center gap-2 text-xs">
                <span className="w-2 h-2 rounded-full" style={{ background: a.color }} />
                <span className="text-[hsl(var(--ap-muted))] truncate">{a.name}</span>
                <span className="ml-auto font-bold">{a.value}%</span>
              </div>
            ))}
          </div>
        </Panel>
      </div>

      <Tabs
        tabs={[
          { label: "Campaigns", value: "campaigns", badge: String(CAMPAIGNS.length) },
          { label: "Templates", value: "templates" },
          { label: "Click-to-Chat", value: "click" },
          { label: "Analytics", value: "analytics" },
        ]}
        value={activeTab}
        onChange={setActiveTab}
      />

      <div className="mt-4">
        {activeTab === "campaigns" && (
          <>
            <Toolbar>
              <div className="relative flex-1 max-w-xs">
                <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-[hsl(var(--ap-muted))]" />
                <input placeholder="Search campaigns..." className="ap-input pl-9" />
              </div>
              <button className="ap-btn-ghost"><Filter className="w-4 h-4" /> Filters</button>
              <button className="ap-btn" onClick={() => setModalOpen(true)}><Plus className="w-4 h-4" /> New Campaign</button>
            </Toolbar>

            <DataTable
              rows={CAMPAIGNS}
              columns={[
                { key: "name", label: "Campaign", render: (r) => <span className="font-bold">{r.name}</span> },
                { key: "audience", label: "Audience" },
                { key: "sent", label: "Sent" },
                { key: "read", label: "Read", render: (r) => r.sent > 0 ? `${Math.round((r.read / r.sent) * 100)}%` : "—" },
                { key: "date", label: "Date" },
                { key: "status", label: "Status", render: (r) => <Badge tone={r.status === "Completed" ? "success" : r.status === "Scheduled" ? "info" : "muted"}>{r.status}</Badge> },
              ]}
              actions={() => (
                <div className="flex gap-1">
                  <button className="p-1.5 rounded-lg hover:bg-[hsl(var(--ap-border)/0.5)]"><Eye className="w-3.5 h-3.5" /></button>
                  <button className="p-1.5 rounded-lg hover:bg-[hsl(var(--ap-border)/0.5)]"><Copy className="w-3.5 h-3.5" /></button>
                </div>
              )}
            />
          </>
        )}

        {activeTab === "templates" && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {TEMPLATES.map((t) => (
              <div key={t.id} className="ap-card p-5 hover:shadow-lg transition">
                <div className="flex items-center justify-between mb-3">
                  <Badge tone={t.status === "Approved" ? "success" : "warning"}>{t.status}</Badge>
                  <Badge tone="muted">{t.category}</Badge>
                </div>
                <h3 className="font-bold text-sm mb-2">{t.name}</h3>
                <div className="bg-green-50 rounded-xl p-3 mb-3">
                  <div className="flex items-start gap-2">
                    <div className="w-6 h-6 rounded-full bg-green-500 flex items-center justify-center shrink-0 mt-0.5">
                      <MessageCircle className="w-3 h-3 text-white" />
                    </div>
                    <p className="text-xs text-green-900">{t.body}</p>
                  </div>
                </div>
                <div className="flex gap-2">
                  <button className="ap-btn-ghost flex-1 text-xs justify-center"><Copy className="w-3.5 h-3.5" /> Copy</button>
                  <button className="ap-btn-ghost flex-1 text-xs justify-center"><ExternalLink className="w-3.5 h-3.5" /> Preview</button>
                </div>
              </div>
            ))}
          </div>
        )}

        {activeTab === "click" && (
          <Panel title="Click-to-Chat Links" subtitle="Direct WhatsApp links for quick contact">
            <div className="space-y-3">
              {[
                { label: "General Inquiry", number: "977984XXXXXXX", msg: "Hi, I want to know about courses at Star Coaching Institute." },
                { label: "Admission Help", number: "977984XXXXXXX", msg: "Hi, I need help with the admission process." },
                { label: "Fee Payment", number: "977984XXXXXXX", msg: "Hi, I want to pay my fee." },
                { label: "Demo Class", number: "977984XXXXXXX", msg: "Hi, I want to attend a demo class." },
              ].map((link, i) => {
                const waUrl = `https://wa.me/${link.number}?text=${encodeURIComponent(link.msg)}`;
                return (
                  <div key={i} className="ap-card p-4 flex items-center justify-between">
                    <div>
                      <p className="font-bold text-sm">{link.label}</p>
                      <p className="text-xs text-[hsl(var(--ap-muted))] font-mono">{link.number}</p>
                    </div>
                    <div className="flex gap-2">
                      <button onClick={() => { navigator.clipboard.writeText(waUrl); }} className="ap-btn-ghost text-xs"><Copy className="w-3.5 h-3.5" /> Copy Link</button>
                      <a href={waUrl} target="_blank" rel="noopener noreferrer" className="ap-btn text-xs"><MessageCircle className="w-3.5 h-3.5" /> Open</a>
                    </div>
                  </div>
                );
              })}
            </div>
          </Panel>
        )}

        {activeTab === "analytics" && (
          <div className="grid grid-cols-1 xl:grid-cols-2 gap-4">
            <Panel title="Message Performance" subtitle="Last 7 days">
              <div className="h-64">
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={deliveryData}>
                    <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--ap-border))" />
                    <XAxis dataKey="day" stroke="hsl(var(--ap-muted))" fontSize={11} />
                    <YAxis stroke="hsl(var(--ap-muted))" fontSize={11} />
                    <Tooltip contentStyle={{ background: "hsl(var(--ap-panel))", border: "1px solid hsl(var(--ap-border))", borderRadius: 12 }} />
                    <Line type="monotone" dataKey="sent" name="Sent" stroke="hsl(262 83% 58%)" strokeWidth={2} dot={{ r: 4 }} />
                    <Line type="monotone" dataKey="read" name="Read" stroke="hsl(152 60% 42%)" strokeWidth={2} dot={{ r: 4 }} />
                  </LineChart>
                </ResponsiveContainer>
              </div>
            </Panel>
            <Panel title="Key Metrics">
              <div className="space-y-4">
                <ProgressBar value={98} tone="success" label="Delivery Rate" />
                <ProgressBar value={72} tone="purple" label="Read Rate" />
                <ProgressBar value={18} tone="orange" label="Reply Rate" />
                <ProgressBar value={5} tone="info" label="Conversion Rate" />
              </div>
              <div className="grid grid-cols-2 gap-3 mt-4">
                <div className="ap-card p-3 text-center">
                  <p className="text-2xl font-black text-[hsl(var(--ap-success))]">315</p>
                  <p className="text-[10px] text-[hsl(var(--ap-muted))] uppercase font-bold">Total Sent</p>
                </div>
                <div className="ap-card p-3 text-center">
                  <p className="text-2xl font-black text-[hsl(var(--ap-purple))]">226</p>
                  <p className="text-[10px] text-[hsl(var(--ap-muted))] uppercase font-bold">Total Read</p>
                </div>
              </div>
            </Panel>
          </div>
        )}
      </div>

      {/* New Campaign Modal */}
      <Modal open={modalOpen} onClose={() => setModalOpen(false)} size="lg">
        <h2 className="text-xl font-black mb-1">New WhatsApp Campaign</h2>
        <p className="text-sm text-[hsl(var(--ap-muted))] mb-6">Create and schedule a WhatsApp broadcast.</p>
        <div className="space-y-4">
          <label className="block">
            <span className="text-xs font-bold uppercase tracking-widest text-[hsl(var(--ap-muted))]">Campaign Name</span>
            <input placeholder="e.g., Fee Reminder October" className="ap-input mt-1" />
          </label>
          <label className="block">
            <span className="text-xs font-bold uppercase tracking-widest text-[hsl(var(--ap-muted))]">Template</span>
            <select className="ap-input mt-1">
              {TEMPLATES.map((t) => <option key={t.id}>{t.name}</option>)}
            </select>
          </label>
          <label className="block">
            <span className="text-xs font-bold uppercase tracking-widest text-[hsl(var(--ap-muted))]">Audience</span>
            <select className="ap-input mt-1">
              <option>All Students</option><option>Pending Fee Students</option><option>New Leads</option><option>Parents</option><option>Teachers</option>
            </select>
          </label>
          <label className="block">
            <span className="text-xs font-bold uppercase tracking-widest text-[hsl(var(--ap-muted))]">Message Preview</span>
            <div className="ap-card p-3 bg-green-50 mt-1">
              <p className="text-sm text-green-900">{'Dear {{name}}, your fee of ₹{{amount}} for {{month}} is pending. Pay via eSewa/Khalti.'}</p>
            </div>
          </label>
          <label className="block">
            <span className="text-xs font-bold uppercase tracking-widest text-[hsl(var(--ap-muted))]">Schedule</span>
            <div className="flex gap-2 mt-1">
              <input type="date" className="ap-input" />
              <input type="time" className="ap-input" />
            </div>
          </label>
        </div>
        <div className="flex justify-end gap-3 mt-6">
          <button onClick={() => setModalOpen(false)} className="ap-btn-ghost">Cancel</button>
          <button className="ap-btn-ghost">Save Draft</button>
          <button className="ap-btn"><Send className="w-4 h-4" /> Schedule</button>
        </div>
      </Modal>

      {/* Template Modal */}
      <Modal open={templateModal} onClose={() => setTemplateModal(false)} size="lg">
        <h2 className="text-xl font-black mb-1">Template Builder</h2>
        <p className="text-sm text-[hsl(var(--ap-muted))] mb-6">Create reusable WhatsApp message templates.</p>
        <div className="space-y-4">
          <label className="block">
            <span className="text-xs font-bold uppercase tracking-widest text-[hsl(var(--ap-muted))]">Template Name</span>
            <input placeholder="e.g., Fee Reminder" className="ap-input mt-1" />
          </label>
          <label className="block">
            <span className="text-xs font-bold uppercase tracking-widest text-[hsl(var(--ap-muted))]">Category</span>
            <select className="ap-input mt-1">
              <option>Admission</option><option>Exam</option><option>Fee</option><option>Result</option><option>Marketing</option><option>General</option>
            </select>
          </label>
          <label className="block">
            <span className="text-xs font-bold uppercase tracking-widest text-[hsl(var(--ap-muted))]">Message Body</span>
            <textarea rows={4} placeholder="Use {{variable}} for dynamic content..." className="ap-input mt-1" defaultValue="Dear {{name}}, your admission #{{admNo}} for {{course}} is confirmed. Please visit with documents." />
          </label>
          <div className="bg-blue-50 rounded-xl p-3">
            <p className="text-xs font-bold text-blue-800 mb-1">Available Variables</p>
            <div className="flex flex-wrap gap-1">
              {["{{name}}", "{{admNo}}", "{{course}}", "{{phone}}", "{{date}}", "{{amount}}", "{{exam}}", "{{rank}}"].map((v) => (
                <span key={v} className="px-2 py-0.5 rounded-md bg-blue-100 text-blue-800 text-xs font-mono cursor-pointer hover:bg-blue-200">{v}</span>
              ))}
            </div>
          </div>
        </div>
        <div className="flex justify-end gap-3 mt-6">
          <button onClick={() => setTemplateModal(false)} className="ap-btn-ghost">Cancel</button>
          <button className="ap-btn"><Plus className="w-4 h-4" /> Create Template</button>
        </div>
      </Modal>

      {/* Broadcast Modal */}
      <Modal open={broadcastOpen} onClose={() => setBroadcastOpen(false)} size="lg">
        <h2 className="text-xl font-black mb-1">Quick Broadcast</h2>
        <p className="text-sm text-[hsl(var(--ap-muted))] mb-6">Send a WhatsApp message to a group instantly.</p>
        <div className="space-y-4">
          <label className="block">
            <span className="text-xs font-bold uppercase tracking-widest text-[hsl(var(--ap-muted))]">Recipient Group</span>
            <select className="ap-input mt-1">
              <option>All Pending Admissions (24)</option><option>All Students (1,284)</option><option>Parents (942)</option><option>Leads (142)</option><option>Teachers (68)</option>
            </select>
          </label>
          <label className="block">
            <span className="text-xs font-bold uppercase tracking-widest text-[hsl(var(--ap-muted))]">Message</span>
            <textarea rows={4} placeholder="Type your message..." className="ap-input mt-1" />
          </label>
          <div className="ap-card p-3 bg-green-50">
            <div className="flex items-start gap-2">
              <Smartphone className="w-4 h-4 text-green-600 mt-0.5" />
              <div>
                <p className="text-xs font-bold text-green-800">Preview</p>
                <p className="text-sm text-green-900 mt-1">Your message will appear here...</p>
              </div>
            </div>
          </div>
          <div className="flex items-center gap-2 text-xs text-[hsl(var(--ap-muted))]">
            <span> Estimated recipients: <b className="text-[hsl(var(--ap-ink))]">24</b></span>
            <span>â±ï¸ Estimated time: <b className="text-[hsl(var(--ap-ink))]">~2 min</b></span>
          </div>
        </div>
        <div className="flex justify-end gap-3 mt-6">
          <button onClick={() => setBroadcastOpen(false)} className="ap-btn-ghost">Cancel</button>
          <button className="ap-btn"><Send className="w-4 h-4" /> Send Broadcast</button>
        </div>
      </Modal>
    </div>
  );
}


