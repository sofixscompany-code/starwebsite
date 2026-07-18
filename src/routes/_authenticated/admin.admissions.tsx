import { Link, useNavigate } from "react-router-dom";
import { useState } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import {
  ClipboardList, CheckCircle2, XCircle, Clock, Download, Filter, Search,
  Eye, Edit, Trash2, QrCode, FileText, UserPlus, CreditCard, Printer,
  MoreVertical, ChevronDown, Upload, MessageCircle, Shield, LayoutDashboard,
  ArrowRight, Phone, Mail, MapPin, ExternalLink,
} from "lucide-react";
import { motion } from "framer-motion";
import {
  AreaChart, Area, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid,
  BarChart, Bar, PieChart, Pie, Cell,
} from "recharts";
import { collection, query, orderBy, getDocs, updateDoc, doc, deleteDoc, serverTimestamp, where } from "firebase/firestore";
import { db } from "@/integrations/firebase/config";
import { PageHeader } from "@/components/admin/AdminShell";
import { StatCard, Panel, Badge, DataTable, Toolbar, Modal, Tabs, Steps, ProgressBar, Drawer } from "@/components/admin/ui";

const WHATSAPP_NUMBER = "977984XXXXXXX";

const DEMO_ADMISSIONS = [
  { id: "demo-1", admissionNumber: "SCI-2024-1001", fullName: "Aarav Sharma", phone: "9812345678", email: "aarav@email.com", address: "Kathmandu-12", dateOfBirth: "2002-03-15", gender: "male", parentName: "Suresh Sharma", parentPhone: "9812345679", courseTitle: "Nepal Police", courseCategory: "Public Service", status: "pending", notes: "Interested in morning batch", createdAt: { toDate: () => new Date("2024-09-28") } },
  { id: "demo-2", admissionNumber: "SCI-2024-1002", fullName: "Priya Karki", phone: "9803344556", email: "priya@email.com", address: "Lalitpur-8", dateOfBirth: "2001-07-22", gender: "female", parentName: "Bina Karki", parentPhone: "9803344557", courseTitle: "Loksewa Officer", courseCategory: "Public Service", status: "pending", notes: "", createdAt: { toDate: () => new Date("2024-09-29") } },
  { id: "demo-3", admissionNumber: "SCI-2024-1003", fullName: "Rohan Thapa", phone: "9861122334", email: "rohan@email.com", address: "Bhaktapur-4", dateOfBirth: "2003-01-10", gender: "male", parentName: "Dhan Thapa", parentPhone: "9861122335", courseTitle: "APF Constable", courseCategory: "Armed Police", status: "approved", notes: "Referred by alumni", createdAt: { toDate: () => new Date("2024-09-30") } },
  { id: "demo-4", admissionNumber: "SCI-2024-1004", fullName: "Sita Rana", phone: "9840001111", email: "sita@email.com", address: "Pokhara-5", dateOfBirth: "2000-11-05", gender: "female", parentName: "Radha Rana", parentPhone: "9840001112", courseTitle: "Bank PO", courseCategory: "Banking", status: "pending", notes: "Needs scholarship info", createdAt: { toDate: () => new Date("2024-10-01") } },
  { id: "demo-5", admissionNumber: "SCI-2024-1005", fullName: "Bikash Gurung", phone: "9855667788", email: "bikash@email.com", address: "Kathmandu-22", dateOfBirth: "2002-06-18", gender: "male", parentName: "Mohan Gurung", parentPhone: "9855667789", courseTitle: "Nepal Army", courseCategory: "Army", status: "approved", notes: "", createdAt: { toDate: () => new Date("2024-10-02") } },
  { id: "demo-6", admissionNumber: "SCI-2024-1006", fullName: "Anisha Magar", phone: "9800112233", email: "anisha@email.com", address: "Janakpur-3", dateOfBirth: "2001-09-25", gender: "female", parentName: "Ram Magar", parentPhone: "9800112234", courseTitle: "Loksewa Section Officer", courseCategory: "Public Service", status: "pending", notes: "Already attended demo class", createdAt: { toDate: () => new Date("2024-10-03") } },
  { id: "demo-7", admissionNumber: "SCI-2024-1007", fullName: "Suman Poudel", phone: "9866778899", email: "suman@email.com", address: "Chitwan-7", dateOfBirth: "2003-04-12", gender: "male", parentName: "Hari Poudel", parentPhone: "9866778800", courseTitle: "Nepal Police", courseCategory: "Public Service", status: "rejected", notes: "Incomplete documents", createdAt: { toDate: () => new Date("2024-10-04") } },
  { id: "demo-8", admissionNumber: "SCI-2024-1008", fullName: "Nisha Basnet", phone: "9877665544", email: "nisha@email.com", address: "Butwal-2", dateOfBirth: "2002-08-30", gender: "female", parentName: "Gita Basnet", parentPhone: "9877665545", courseTitle: "Bank Assistant", courseCategory: "Banking", status: "approved", notes: "", createdAt: { toDate: () => new Date("2024-10-05") } },
];

const admissionTrend = [
  { m: "Jan", n: 34, approved: 28 }, { m: "Feb", n: 42, approved: 36 }, { m: "Mar", n: 55, approved: 48 },
  { m: "Apr", n: 48, approved: 40 }, { m: "May", n: 62, approved: 54 }, { m: "Jun", n: 74, approved: 65 },
  { m: "Jul", n: 88, approved: 78 }, { m: "Aug", n: 95, approved: 84 }, { m: "Sep", n: 112, approved: 98 },
];

const sourceSplit = [
  { name: "Website", value: 38, color: "hsl(262 83% 58%)" },
  { name: "Walk-in", value: 28, color: "hsl(24 95% 58%)" },
  { name: "Facebook", value: 18, color: "hsl(210 92% 55%)" },
  { name: "Referral", value: 12, color: "hsl(152 60% 42%)" },
  { name: "Google Ads", value: 4, color: "hsl(355 82% 58%)" },
];

export function AdmissionsPage() {
  const qc = useQueryClient();
  const navigate = useNavigate();
  const [q, setQ] = useState("");
  const [statusFilter, setStatusFilter] = useState("All");
  const [modalOpen, setModalOpen] = useState(false);
  const [step, setStep] = useState(0);
  const [selectedAdmission, setSelectedAdmission] = useState<any>(null);
  const [drawerOpen, setDrawerOpen] = useState(false);

  // Fetch from Firestore
  const { data: firestoreData = [] } = useQuery({
    queryKey: ["admin-admissions-firestore"],
    queryFn: async () => {
      const q = query(collection(db, "admissions"), orderBy("createdAt", "desc"));
      const snap = await getDocs(q);
      return snap.docs.map((d) => ({ id: d.id, ...d.data() }));
    },
  });

  // Combine Firestore data with demo data
  const allAdmissions = firestoreData.length > 0
    ? firestoreData.map((a: any) => ({
        id: a.id,
        admNo: a.admissionNumber,
        name: a.fullName,
        phone: a.phone,
        email: a.email,
        address: a.address,
        course: a.courseTitle,
        category: a.courseCategory,
        parentName: a.parentName,
        parentPhone: a.parentPhone,
        notes: a.notes,
        date: a.createdAt?.toDate?.()?.toLocaleDateString("en-GB") || "—",
        status: a.status,
        source: "Online",
        gender: a.gender,
        dob: a.dateOfBirth,
      }))
    : DEMO_ADMISSIONS.map((a) => ({
        ...a,
        admNo: a.admissionNumber,
        name: a.fullName,
        course: a.courseTitle,
        category: a.courseCategory,
        date: a.createdAt.toDate().toLocaleDateString("en-GB"),
      }));

  const stats = {
    total: allAdmissions.length,
    pending: allAdmissions.filter((a) => a.status === "pending").length,
    approved: allAdmissions.filter((a) => a.status === "approved").length,
    rejected: allAdmissions.filter((a) => a.status === "rejected").length,
  };

  const filtered = allAdmissions.filter((a) => {
    const matchQ = !q || a.name.toLowerCase().includes(q.toLowerCase()) || a.admNo.toLowerCase().includes(q.toLowerCase()) || a.phone.includes(q);
    const matchStatus = statusFilter === "All" || a.status === statusFilter;
    return matchQ && matchStatus;
  });

  const updateStatus = async (id: string, status: string) => {
    try {
      await updateDoc(doc(db, "admissions", id), { status, updatedAt: serverTimestamp() });
      qc.invalidateQueries({ queryKey: ["admin-admissions-firestore"] });
    } catch {
      // Demo mode - update locally
    }
  };

  const sendWhatsApp = (admission: any) => {
    const msg = encodeURIComponent(
      ` *Star Coaching Institute*\n\n` +
      `Dear ${admission.name},\n` +
      `Your admission (#${admission.admNo}) for *${admission.course}* has been *${admission.status.toUpperCase()}*.\n\n` +
      `Please visit our office with original documents for verification.\n\n` +
      ` ${"977-41-520XXX"}\n` +
      ` Janakpurdham-5, Dhanusha`
    );
    window.open(`https://wa.me/977${admission.phone}?text=${msg}`, "_blank");
  };

  return (
    <div>
      {/* Role-based demo bar */}
      <div className="bg-gradient-to-r from-purple-600 to-orange-500 text-white py-2 -mx-4 -mt-6 mb-6 px-4">
        <div className="flex items-center justify-center gap-3 text-sm">
          <span className="font-semibold">Demo:</span>
          <button onClick={() => navigate("/admin")} className="flex items-center gap-1.5 bg-white/20 hover:bg-white/30 px-3 py-1 rounded-full transition">
            <LayoutDashboard className="w-3.5 h-3.5" /> Dashboard
          </button>
          <button onClick={() => navigate("/admin/students")} className="flex items-center gap-1.5 bg-white/20 hover:bg-white/30 px-3 py-1 rounded-full transition">
            <Shield className="w-3.5 h-3.5" /> Students
          </button>
          <a href="/admission" target="_blank" className="flex items-center gap-1.5 bg-white/20 hover:bg-white/30 px-3 py-1 rounded-full transition">
            <UserPlus className="w-3.5 h-3.5" /> Admission Form <ArrowRight className="w-3 h-3" />
          </a>
        </div>
      </div>

      <PageHeader
        title="Admissions"
        subtitle="Review, approve, and manage all applications from every source."
        actions={
          <>
            <button className="ap-btn-ghost"><Download className="w-4 h-4" /> Export</button>
            <button className="ap-btn-ghost"><FileText className="w-4 h-4" /> Bulk Import</button>
            <button className="ap-btn" onClick={() => { setStep(0); setModalOpen(true); }}><UserPlus className="w-4 h-4" /> New Admission</button>
          </>
        }
      />

      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
        <StatCard label="Total Applications" value={stats.total} icon={ClipboardList} tone="purple" />
        <StatCard label="Pending Review" value={stats.pending} icon={Clock} tone="warning" />
        <StatCard label="Approved" value={stats.approved} icon={CheckCircle2} tone="success" />
        <StatCard label="Rejected" value={stats.rejected} icon={XCircle} tone="danger" />
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 xl:grid-cols-3 gap-4 mb-6">
        <Panel title="Admission Trend" subtitle="Monthly applications vs approvals" className="xl:col-span-2">
          <div className="h-56">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={admissionTrend}>
                <defs>
                  <linearGradient id="adm" x1="0" x2="0" y1="0" y2="1">
                    <stop offset="0%" stopColor="hsl(262 83% 58%)" stopOpacity={0.4} />
                    <stop offset="100%" stopColor="hsl(262 83% 58%)" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--ap-border))" />
                <XAxis dataKey="m" stroke="hsl(var(--ap-muted))" fontSize={11} />
                <YAxis stroke="hsl(var(--ap-muted))" fontSize={11} />
                <Tooltip contentStyle={{ background: "hsl(var(--ap-panel))", border: "1px solid hsl(var(--ap-border))", borderRadius: 12 }} />
                <Area type="monotone" dataKey="n" name="Applications" stroke="hsl(262 83% 58%)" fill="url(#adm)" strokeWidth={2} />
                <Area type="monotone" dataKey="approved" name="Approved" stroke="hsl(152 60% 42%)" fill="none" strokeWidth={2} strokeDasharray="5 5" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </Panel>
        <Panel title="Lead Sources" subtitle="Where applications come from">
          <div className="h-48">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie data={sourceSplit} innerRadius={45} outerRadius={75} dataKey="value" paddingAngle={4}>
                  {sourceSplit.map((c) => <Cell key={c.name} fill={c.color} />)}
                </Pie>
                <Tooltip contentStyle={{ background: "hsl(var(--ap-panel))", border: "1px solid hsl(var(--ap-border))", borderRadius: 12 }} />
              </PieChart>
            </ResponsiveContainer>
          </div>
          <div className="grid grid-cols-2 gap-1 mt-2">
            {sourceSplit.map((s) => (
              <div key={s.name} className="flex items-center gap-2 text-xs">
                <span className="w-2 h-2 rounded-full" style={{ background: s.color }} />
                <span className="text-[hsl(var(--ap-muted))] truncate">{s.name}</span>
                <span className="ml-auto font-bold">{s.value}%</span>
              </div>
            ))}
          </div>
        </Panel>
      </div>

      <Toolbar>
        <div className="relative flex-1 max-w-xs">
          <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-[hsl(var(--ap-muted))]" />
          <input value={q} onChange={(e) => setQ(e.target.value)} placeholder="Search name, admission #, phone..." className="ap-input pl-9" />
        </div>
        <div className="flex gap-1 p-1 bg-[hsl(var(--ap-border)/0.3)] rounded-xl">
          {["All", "Pending", "Approved", "Rejected"].map((s) => (
            <button key={s} onClick={() => setStatusFilter(s)} className={`px-3 py-1.5 rounded-lg text-xs font-bold transition ${statusFilter === s ? "ap-grad text-white" : "text-[hsl(var(--ap-muted))] hover:text-[hsl(var(--ap-ink))]"}`}>{s}</button>
          ))}
        </div>
        <button className="ap-btn-ghost"><Filter className="w-4 h-4" /> Filters</button>
        <select className="ap-input max-w-[160px]"><option>All courses</option><option>Nepal Police</option><option>Loksewa</option><option>APF</option></select>
      </Toolbar>

      <DataTable
        rows={filtered}
        columns={[
          { key: "admNo", label: "Admission #", render: (r) => <span className="font-mono font-bold text-[hsl(var(--ap-purple))]">{r.admNo}</span> },
          {
            key: "name", label: "Applicant",
            render: (r) => (
              <button onClick={() => { setSelectedAdmission(r); setDrawerOpen(true); }} className="flex items-center gap-3 text-left">
                <div className="w-9 h-9 rounded-full ap-grad flex items-center justify-center text-white text-xs font-bold">
                  {r.name.split(" ").map((x: string) => x[0]).slice(0, 2).join("")}
                </div>
                <div>
                  <p className="font-semibold">{r.name}</p>
                  <p className="text-xs text-[hsl(var(--ap-muted))]">{r.phone}</p>
                </div>
              </button>
            ),
          },
          { key: "course", label: "Course" },
          { key: "date", label: "Date" },
          {
            key: "status", label: "Status",
            render: (r) => <Badge tone={r.status === "approved" ? "success" : r.status === "rejected" ? "danger" : "warning"}>{r.status}</Badge>,
          },
        ]}
        actions={(r) => (
          <div className="flex gap-1">
            {r.status === "pending" && (
              <>
                <button onClick={() => updateStatus(r.id, "approved")} className="p-1.5 rounded-lg hover:bg-[hsl(var(--ap-success)/0.1)]" title="Approve"><CheckCircle2 className="w-3.5 h-3.5 text-[hsl(var(--ap-success))]" /></button>
                <button onClick={() => updateStatus(r.id, "rejected")} className="p-1.5 rounded-lg hover:bg-[hsl(var(--ap-danger)/0.1)]" title="Reject"><XCircle className="w-3.5 h-3.5 text-[hsl(var(--ap-danger))]" /></button>
              </>
            )}
            <button onClick={() => sendWhatsApp(r)} className="p-1.5 rounded-lg hover:bg-[hsl(var(--ap-success)/0.1)]" title="WhatsApp"><MessageCircle className="w-3.5 h-3.5 text-green-600" /></button>
            <button onClick={() => { setSelectedAdmission(r); setDrawerOpen(true); }} className="p-1.5 rounded-lg hover:bg-[hsl(var(--ap-border)/0.5)]" title="View"><Eye className="w-3.5 h-3.5" /></button>
            <button className="p-1.5 rounded-lg hover:bg-[hsl(var(--ap-border)/0.5)]" title="Print"><Printer className="w-3.5 h-3.5" /></button>
          </div>
        )}
      />

      {/* Admission Detail Drawer */}
      <Drawer open={drawerOpen} onClose={() => setDrawerOpen(false)} width="w-[480px]">
        {selectedAdmission && <AdmissionDetail admission={selectedAdmission} onWhatsApp={() => sendWhatsApp(selectedAdmission)} onStatusChange={(s) => updateStatus(selectedAdmission.id, s)} />}
      </Drawer>

      {/* New Admission Modal */}
      <Modal open={modalOpen} onClose={() => setModalOpen(false)} size="lg">
        <h2 className="text-xl font-black mb-1">New Admission</h2>
        <p className="text-sm text-[hsl(var(--ap-muted))] mb-6">Complete the steps to enroll a new student.</p>
        <Steps steps={["Personal Info", "Course Selection", "Documents", "Payment", "Confirm"]} current={step} />
        <div className="mt-6 ap-card p-4 min-h-[200px]">
          {step === 0 && (
            <div className="grid grid-cols-2 gap-4">
              {[["Full Name", "text", "Enter full name"], ["Email", "email", "student@email.com"], ["Phone", "tel", "98XXXXXXXX"], ["Date of Birth", "date", ""], ["Address", "text", "City, Ward"], ["Guardian Name", "text", "Parent/Guardian"]].map(([label, type, ph]) => (
                <label key={label} className="block">
                  <span className="text-xs font-bold uppercase tracking-widest text-[hsl(var(--ap-muted))]">{label}</span>
                  <input type={type} placeholder={ph} className="ap-input mt-1" />
                </label>
              ))}
            </div>
          )}
          {step === 1 && (
            <div className="space-y-4">
              <label className="block">
                <span className="text-xs font-bold uppercase tracking-widest text-[hsl(var(--ap-muted))]">Course</span>
                <select className="ap-input mt-1"><option>Nepal Police Preparation</option><option>Loksewa Officer</option><option>APF Constable</option><option>Bank PO</option><option>Nepal Army</option></select>
              </label>
              <label className="block">
                <span className="text-xs font-bold uppercase tracking-widest text-[hsl(var(--ap-muted))]">Batch</span>
                <select className="ap-input mt-1"><option>B-12 (Morning)</option><option>B-13 (Evening)</option><option>L-04 (Weekend)</option></select>
              </label>
              <label className="block">
                <span className="text-xs font-bold uppercase tracking-widest text-[hsl(var(--ap-muted))]">Branch</span>
                <select className="ap-input mt-1"><option>Kathmandu</option><option>Janakpur</option><option>Pokhara</option></select>
              </label>
            </div>
          )}
          {step === 2 && (
            <div className="space-y-4">
              <div className="border-2 border-dashed border-[hsl(var(--ap-border))] rounded-xl p-8 text-center">
                <Upload className="w-8 h-8 mx-auto text-[hsl(var(--ap-muted))] mb-2" />
                <p className="text-sm font-semibold">Upload Documents</p>
                <p className="text-xs text-[hsl(var(--ap-muted))] mt-1">Photo, ID proof, certificates (PDF, JPG, PNG)</p>
                <button className="ap-btn mt-3"><Upload className="w-4 h-4" /> Browse Files</button>
              </div>
            </div>
          )}
          {step === 3 && (
            <div className="space-y-4">
              <div className="ap-card p-4 bg-[hsl(var(--ap-success)/0.05)] border-[hsl(var(--ap-success)/0.2)]">
                <p className="text-xs font-bold uppercase text-[hsl(var(--ap-muted))]">Fee Amount</p>
                <p className="text-3xl font-black text-[hsl(var(--ap-success))]">₹25,000</p>
              </div>
              <div className="grid grid-cols-3 gap-2">
                {["eSewa", "Khalti", "Cash", "Card", "Bank", "IME Pay"].map((m) => (
                  <button key={m} className="ap-btn-ghost text-center text-xs py-2">{m}</button>
                ))}
              </div>
            </div>
          )}
          {step === 4 && (
            <div className="text-center py-8">
              <div className="w-16 h-16 rounded-full bg-[hsl(var(--ap-success)/0.15)] mx-auto flex items-center justify-center mb-4">
                <CheckCircle2 className="w-8 h-8 text-[hsl(var(--ap-success))]" />
              </div>
              <h3 className="text-lg font-bold">Admission Complete!</h3>
              <p className="text-sm text-[hsl(var(--ap-muted))] mt-1">Admission #SCI-2024-1009 has been created.</p>
              <div className="flex gap-3 justify-center mt-4">
                <button className="ap-btn-ghost"><Printer className="w-4 h-4" /> Print Form</button>
                <button className="ap-btn"><MessageCircle className="w-4 h-4" /> Send WhatsApp</button>
              </div>
            </div>
          )}
        </div>
        <div className="flex justify-between mt-6">
          <button onClick={() => setModalOpen(false)} className="ap-btn-ghost">Cancel</button>
          <div className="flex gap-2">
            {step > 0 && <button onClick={() => setStep((s) => s - 1)} className="ap-btn-ghost">Back</button>}
            {step < 4 && <button onClick={() => setStep((s) => s + 1)} className="ap-btn">Next Step</button>}
            {step === 4 && <button onClick={() => setModalOpen(false)} className="ap-btn">Done</button>}
          </div>
        </div>
      </Modal>
    </div>
  );
}

export function AdmissionDetail({ admission, onWhatsApp, onStatusChange }: { admission: any; onWhatsApp: () => void; onStatusChange: (s: string) => void }) {
  return (
    <div className="pt-8">
      <div className="flex items-center gap-4 mb-6">
        <div className="w-16 h-16 rounded-2xl ap-grad flex items-center justify-center text-white text-xl font-black">
          {admission.name.split(" ").map((x: string) => x[0]).slice(0, 2).join("")}
        </div>
        <div>
          <h2 className="text-xl font-black">{admission.name}</h2>
          <p className="text-sm text-[hsl(var(--ap-muted))] font-mono">{admission.admNo}</p>
          <div className="flex gap-2 mt-1">
            <Badge tone={admission.status === "approved" ? "success" : admission.status === "rejected" ? "danger" : "warning"}>{admission.status}</Badge>
            <Badge tone="purple">{admission.course}</Badge>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-2 mb-6 text-xs">
        <div className="flex items-center gap-2"><Phone className="w-3.5 h-3.5 text-[hsl(var(--ap-purple))]" /> {admission.phone}</div>
        <div className="flex items-center gap-2"><Mail className="w-3.5 h-3.5 text-[hsl(var(--ap-purple))]" /> {admission.email || "—"}</div>
        <div className="flex items-center gap-2"><MapPin className="w-3.5 h-3.5 text-[hsl(var(--ap-purple))]" /> {admission.address || "—"}</div>
        <div className="flex items-center gap-2"><UserPlus className="w-3.5 h-3.5 text-[hsl(var(--ap-purple))]" /> {admission.parentName}</div>
      </div>

      <div className="ap-card p-4 mb-4">
        <h4 className="font-bold text-sm mb-2">Guardian Details</h4>
        <div className="space-y-1 text-sm">
          <div className="flex justify-between"><span className="text-[hsl(var(--ap-muted))]">Name</span><span className="font-semibold">{admission.parentName}</span></div>
          <div className="flex justify-between"><span className="text-[hsl(var(--ap-muted))]">Phone</span><span className="font-semibold">{admission.parentPhone}</span></div>
        </div>
      </div>

      {admission.notes && (
        <div className="ap-card p-4 mb-4">
          <h4 className="font-bold text-sm mb-2">Notes</h4>
          <p className="text-sm text-[hsl(var(--ap-muted))]">{admission.notes}</p>
        </div>
      )}

      <div className="flex gap-2">
        {admission.status === "pending" && (
          <>
            <button onClick={() => onStatusChange("approved")} className="ap-btn flex-1 justify-center bg-green-600"><CheckCircle2 className="w-4 h-4" /> Approve</button>
            <button onClick={() => onStatusChange("rejected")} className="ap-btn flex-1 justify-center" style={{ background: "hsl(var(--ap-danger))" }}><XCircle className="w-4 h-4" /> Reject</button>
          </>
        )}
        <button onClick={onWhatsApp} className="ap-btn flex-1 justify-center bg-green-500"><MessageCircle className="w-4 h-4" /> WhatsApp</button>
      </div>
    </div>
  );
}



