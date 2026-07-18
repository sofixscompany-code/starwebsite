import {  } from "react-router-dom";
import { useState, useMemo } from "react";
import {
  Wallet, CheckCircle2, AlertCircle, TrendingDown, Download, Search, Filter,
  Plus, Eye, Printer, CreditCard, TrendingUp, DollarSign, Receipt,
  PieChart as PieChartIcon, BarChart3, Calendar, ArrowUpRight, ArrowDownRight,
  Save, Loader2, X, FileText, Clock,
} from "lucide-react";
import {
  AreaChart, Area, BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer,
  CartesianGrid, PieChart, Pie, Cell, Legend,
} from "recharts";
import { PageHeader } from "@/components/admin/AdminShell";
import { StatCard, Panel, Badge, DataTable, Toolbar, Tabs, Modal, Skeleton } from "@/components/admin/ui";
import { useInvoices, usePayments, useFeeStructure, useFeeStats, type Invoice, type Payment } from "@/hooks/use-fees";
import { useCourses } from "@/hooks/use-lms";
import { toast } from "sonner";

export function AccountingPage() {
  const [q, setQ] = useState("");
  const [typeFilter, setTypeFilter] = useState("All");
  const [activeTab, setActiveTab] = useState("transactions");
  const { data: stats, isLoading: statsLoading } = useFeeStats();
  const { invoices, isLoading: invoicesLoading } = useInvoices();
  const { payments, isLoading: paymentsLoading } = usePayments();

  const allTransactions = useMemo(() => {
    const inv = invoices.map((i) => ({
      id: i.id, inv: i.invoiceNumber, name: i.studentName, desc: `${i.courseName} · Fee`,
      amount: i.totalAmount, method: "—", date: i.dueDate,
      status: i.status === "paid" ? "Paid" : i.status === "overdue" ? "Overdue" : i.status === "partial" ? "Partial" : "Pending",
      type: "Income" as const,
    }));
    const pay = payments.map((p) => ({
      id: p.id, inv: p.receiptNumber, name: p.studentName, desc: p.notes || "Payment received",
      amount: p.amount, method: p.method, date: p.paymentDate,
      status: "Paid" as const, type: "Payment" as const,
    }));
    return [...inv, ...pay].sort((a, b) => b.date?.localeCompare(a.date) ?? 0);
  }, [invoices, payments]);

  const filtered = useMemo(() => {
    return allTransactions.filter((t) => {
      const matchQ = !q || t.name.toLowerCase().includes(q.toLowerCase()) || t.inv?.toLowerCase().includes(q.toLowerCase());
      const matchType = typeFilter === "All" || t.type === typeFilter;
      return matchQ && matchType;
    });
  }, [allTransactions, q, typeFilter]);

  const revenueData = [
    { m: "Jan", income: 480000, expense: 180000 }, { m: "Feb", income: 520000, expense: 195000 },
    { m: "Mar", income: 610000, expense: 210000 }, { m: "Apr", income: 590000, expense: 205000 },
    { m: "May", income: 720000, expense: 240000 }, { m: "Jun", income: 810000, expense: 265000 },
    { m: "Jul", income: 890000, expense: 280000 }, { m: "Aug", income: 950000, expense: 310000 },
    { m: "Sep", income: 1020000, expense: 340000 },
  ];

  const categorySplit = [
    { name: "Tuition Fees", value: 62, color: "hsl(262 83% 58%)" },
    { name: "Admission", value: 15, color: "hsl(24 95% 58%)" },
    { name: "Hostel", value: 10, color: "hsl(210 92% 55%)" },
    { name: "Books", value: 8, color: "hsl(152 60% 42%)" },
    { name: "Other", value: 5, color: "hsl(355 82% 58%)" },
  ];

  return (
    <div>
      <PageHeader
        title="Accounting"
        subtitle="Fees, revenue, expenses & complete financial ledger."
        actions={
          <>
            <button className="ap-btn-ghost"><Download className="w-4 h-4" /> Export</button>
            <button className="ap-btn-ghost"><Printer className="w-4 h-4" /> Print Report</button>
          </>
        }
      />

      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
        {statsLoading ? (
          <>
            <Skeleton className="h-28" /><Skeleton className="h-28" /><Skeleton className="h-28" /><Skeleton className="h-28" />
          </>
        ) : (
          <>
            <StatCard label="Total Revenue" prefix="₹" value={stats?.totalRevenue ?? 0} delta={18} icon={Wallet} tone="success" />
            <StatCard label="Collected" prefix="₹" value={stats?.totalCollected ?? 0} icon={CheckCircle2} tone="info" />
            <StatCard label="Pending" prefix="₹" value={stats?.pendingAmount ?? 0} icon={AlertCircle} tone="danger" />
            <StatCard label="Collection Rate" value={`${stats?.collectionRate ?? 0}%`} delta={12} icon={TrendingUp} tone="success" />
          </>
        )}
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-3 gap-4 mb-6">
        <Panel title="Income vs Expenses" subtitle="Monthly comparison · in ₹" className="xl:col-span-2">
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={revenueData}>
                <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--ap-border))" />
                <XAxis dataKey="m" stroke="hsl(var(--ap-muted))" fontSize={11} />
                <YAxis stroke="hsl(var(--ap-muted))" fontSize={11} />
                <Tooltip contentStyle={{ background: "hsl(var(--ap-panel))", border: "1px solid hsl(var(--ap-border))", borderRadius: 12 }} />
                <Legend />
                <Bar dataKey="income" name="Income" radius={[6, 6, 0, 0]} fill="hsl(262 83% 58%)" />
                <Bar dataKey="expense" name="Expense" radius={[6, 6, 0, 0]} fill="hsl(24 95% 58%)" />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </Panel>
        <Panel title="Revenue by Category" subtitle="Income distribution">
          <div className="h-48">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie data={categorySplit} innerRadius={45} outerRadius={75} dataKey="value" paddingAngle={4}>
                  {categorySplit.map((c) => <Cell key={c.name} fill={c.color} />)}
                </Pie>
                <Tooltip contentStyle={{ background: "hsl(var(--ap-panel))", border: "1px solid hsl(var(--ap-border))", borderRadius: 12 }} />
              </PieChart>
            </ResponsiveContainer>
          </div>
          <div className="grid grid-cols-2 gap-1 mt-2">
            {categorySplit.map((c) => (
              <div key={c.name} className="flex items-center gap-2 text-xs">
                <span className="w-2 h-2 rounded-full" style={{ background: c.color }} />
                <span className="text-[hsl(var(--ap-muted))] truncate">{c.name}</span>
                <span className="ml-auto font-bold">{c.value}%</span>
              </div>
            ))}
          </div>
        </Panel>
      </div>

      <Tabs
        tabs={[
          { label: "Transactions", value: "transactions", badge: String(allTransactions.length) },
          { label: "Invoices", value: "invoices", badge: String(invoices.length) },
          { label: "Payments", value: "payments" },
          { label: "Fee Structure", value: "structure" },
          { label: "Reports", value: "reports" },
        ]}
        value={activeTab}
        onChange={setActiveTab}
      />

      <div className="mt-4">
        {activeTab === "transactions" && (
          <>
            <Toolbar>
              <div className="relative flex-1 max-w-xs">
                <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-[hsl(var(--ap-muted))]" />
                <input value={q} onChange={(e) => setQ(e.target.value)} placeholder="Search invoice, name..." className="ap-input pl-9" />
              </div>
              <div className="flex gap-1 p-1 bg-[hsl(var(--ap-border)/0.3)] rounded-xl">
                {["All", "Income", "Payment"].map((t) => (
                  <button key={t} onClick={() => setTypeFilter(t)} className={`px-3 py-1.5 rounded-lg text-xs font-bold transition ${typeFilter === t ? "ap-grad text-white" : "text-[hsl(var(--ap-muted))] hover:text-[hsl(var(--ap-ink))]"}`}>{t}</button>
                ))}
              </div>
            </Toolbar>
            {invoicesLoading || paymentsLoading ? (
              <div className="space-y-2">{[1, 2, 3, 4].map((i) => <Skeleton key={i} className="h-14" />)}</div>
            ) : (
              <DataTable
                rows={filtered}
                columns={[
                  { key: "inv", label: "Reference", render: (r) => <span className="font-mono font-bold text-[hsl(var(--ap-purple))]">{r.inv}</span> },
                  { key: "name", label: "Student", render: (r) => <span className="font-semibold">{r.name}</span> },
                  { key: "amount", label: "Amount", render: (r) => (
                    <span className={`font-bold ${r.type === "Income" ? "text-[hsl(var(--ap-success))]" : "text-[hsl(var(--ap-info))]"}`}>
                      ₹{r.amount?.toLocaleString()}
                    </span>
                  )},
                  { key: "method", label: "Method", render: (r) => <Badge tone="muted">{r.method}</Badge> },
                  { key: "date", label: "Date" },
                  { key: "status", label: "Status", render: (r) => <Badge tone={r.status === "Paid" ? "success" : r.status === "Pending" ? "warning" : "danger"}>{r.status}</Badge> },
                ]}
                actions={() => (
                  <div className="flex gap-1">
                    <button className="p-1.5 rounded-lg hover:bg-[hsl(var(--ap-border)/0.5)]"><Eye className="w-3.5 h-3.5" /></button>
                    <button className="p-1.5 rounded-lg hover:bg-[hsl(var(--ap-border)/0.5)]"><Printer className="w-3.5 h-3.5" /></button>
                  </div>
                )}
              />
            )}
          </>
        )}

        {activeTab === "invoices" && <InvoicesTab />}
        {activeTab === "payments" && <PaymentsTab />}
        {activeTab === "structure" && <FeeStructureTab />}
        {activeTab === "reports" && (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
            {[
              { icon: BarChart3, title: "Revenue Report", desc: "Monthly income analysis" },
              { icon: PieChartIcon, title: "Expense Breakdown", desc: "Category-wise spending" },
              { icon: DollarSign, title: "Profit & Loss", desc: "Net financial position" },
              { icon: Receipt, title: "Fee Collection", desc: "Student-wise fee status" },
              { icon: Calendar, title: "Annual Summary", desc: "Year-end financial report" },
              { icon: TrendingUp, title: "Growth Analysis", desc: "Revenue trends & forecast" },
            ].map((r) => {
              const Icon = r.icon;
              return (
                <div key={r.title} className="ap-card p-4 flex items-start gap-3 hover:shadow-lg transition cursor-pointer">
                  <div className="w-11 h-11 rounded-xl ap-grad flex items-center justify-center text-white">
                    <Icon className="w-5 h-5" />
                  </div>
                  <div>
                    <p className="font-bold">{r.title}</p>
                    <p className="text-xs text-[hsl(var(--ap-muted))] mt-0.5">{r.desc}</p>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}

/* ================================================================ */
/*  INVOICES TAB                                                    */
/* ================================================================ */
export function InvoicesTab() {
  const { invoices, isLoading, addInvoice, updateInvoice, deleteInvoice } = useInvoices();
  const { courses } = useCourses();
  const [modalOpen, setModalOpen] = useState(false);
  const [editing, setEditing] = useState<Partial<Invoice> | null>(null);
  const [saving, setSaving] = useState(false);

  const openAdd = () => {
    setEditing({ invoiceNumber: `INV-${Date.now()}`, studentId: "", studentName: "", studentEmail: "", courseId: "", courseName: "", amount: 0, discount: 0, tax: 0, totalAmount: 0, dueDate: "", status: "pending", items: [], notes: "" });
    setModalOpen(true);
  };

  const handleSave = async () => {
    if (!editing?.studentName) { toast.error("Student name is required"); return; }
    setSaving(true);
    try {
      const course = courses.find((c) => c.id === editing.courseId);
      const total = (editing.amount || 0) - (editing.discount || 0) + (editing.tax || 0);
      const data = { ...editing, courseName: course?.title || editing.courseName, totalAmount: total };
      if (editing.id) {
        await updateInvoice.mutateAsync(data as Invoice);
        toast.success("Invoice updated");
      } else {
        await addInvoice.mutateAsync(data as Omit<Invoice, "id">);
        toast.success("Invoice created");
      }
      setModalOpen(false); setEditing(null);
    } catch { toast.error("Failed"); } finally { setSaving(false); }
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Delete this invoice?")) return;
    await deleteInvoice.mutateAsync(id);
    toast.success("Invoice deleted");
  };

  return (
    <>
      <Toolbar>
        <button onClick={openAdd} className="ap-btn ml-auto"><Plus className="w-4 h-4" /> Create Invoice</button>
      </Toolbar>
      {isLoading ? (
        <div className="space-y-2">{[1, 2, 3].map((i) => <Skeleton key={i} className="h-14" />)}</div>
      ) : invoices.length === 0 ? (
        <Panel title="No invoices yet" subtitle="Create your first invoice to get started">
          <div className="text-center py-8"><FileText className="w-12 h-12 mx-auto text-[hsl(var(--ap-muted))] mb-3" /></div>
        </Panel>
      ) : (
        <DataTable
          rows={invoices}
          columns={[
            { key: "invoiceNumber", label: "Invoice #", render: (r) => <span className="font-mono font-bold text-[hsl(var(--ap-purple))]">{r.invoiceNumber}</span> },
            { key: "studentName", label: "Student", render: (r) => <span className="font-semibold">{r.studentName}</span> },
            { key: "courseName", label: "Course" },
            { key: "totalAmount", label: "Amount", render: (r) => <span className="font-bold">₹{r.totalAmount?.toLocaleString()}</span> },
            { key: "dueDate", label: "Due Date" },
            { key: "status", label: "Status", render: (r) => <Badge tone={r.status === "paid" ? "success" : r.status === "overdue" ? "danger" : r.status === "partial" ? "warning" : "info"}>{r.status}</Badge> },
          ]}
          actions={(r) => (
            <div className="flex gap-1">
              <button onClick={() => { setEditing(r); setModalOpen(true); }} className="p-1.5 rounded-lg hover:bg-[hsl(var(--ap-border)/0.5)]"><Eye className="w-3.5 h-3.5" /></button>
              <button onClick={() => handleDelete(r.id)} className="p-1.5 rounded-lg hover:bg-[hsl(var(--ap-danger)/0.1)]"><X className="w-3.5 h-3.5 text-[hsl(var(--ap-danger))]" /></button>
            </div>
          )}
        />
      )}

      <Modal open={modalOpen} onClose={() => { setModalOpen(false); setEditing(null); }} size="lg">
        <h2 className="text-lg font-bold mb-4">{editing?.id ? "Edit Invoice" : "Create Invoice"}</h2>
        {editing && (
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="text-sm font-medium mb-1 block">Student Name *</label>
                <input value={editing.studentName || ""} onChange={(e) => setEditing({ ...editing, studentName: e.target.value })} className="w-full px-3 py-2 rounded-xl border border-[hsl(var(--ap-border))] text-sm" />
              </div>
              <div>
                <label className="text-sm font-medium mb-1 block">Student Email</label>
                <input value={editing.studentEmail || ""} onChange={(e) => setEditing({ ...editing, studentEmail: e.target.value })} className="w-full px-3 py-2 rounded-xl border border-[hsl(var(--ap-border))] text-sm" />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="text-sm font-medium mb-1 block">Course</label>
                <select value={editing.courseId || ""} onChange={(e) => setEditing({ ...editing, courseId: e.target.value })} className="w-full px-3 py-2 rounded-xl border border-[hsl(var(--ap-border))] text-sm">
                  <option value="">Select course</option>
                  {courses.map((c) => <option key={c.id} value={c.id}>{c.title}</option>)}
                </select>
              </div>
              <div>
                <label className="text-sm font-medium mb-1 block">Due Date</label>
                <input type="date" value={editing.dueDate || ""} onChange={(e) => setEditing({ ...editing, dueDate: e.target.value })} className="w-full px-3 py-2 rounded-xl border border-[hsl(var(--ap-border))] text-sm" />
              </div>
            </div>
            <div className="grid grid-cols-3 gap-4">
              <div>
                <label className="text-sm font-medium mb-1 block">Amount (₹)</label>
                <input type="number" value={editing.amount || 0} onChange={(e) => setEditing({ ...editing, amount: Number(e.target.value) })} className="w-full px-3 py-2 rounded-xl border border-[hsl(var(--ap-border))] text-sm" />
              </div>
              <div>
                <label className="text-sm font-medium mb-1 block">Discount (₹)</label>
                <input type="number" value={editing.discount || 0} onChange={(e) => setEditing({ ...editing, discount: Number(e.target.value) })} className="w-full px-3 py-2 rounded-xl border border-[hsl(var(--ap-border))] text-sm" />
              </div>
              <div>
                <label className="text-sm font-medium mb-1 block">Tax (₹)</label>
                <input type="number" value={editing.tax || 0} onChange={(e) => setEditing({ ...editing, tax: Number(e.target.value) })} className="w-full px-3 py-2 rounded-xl border border-[hsl(var(--ap-border))] text-sm" />
              </div>
            </div>
            <div className="p-3 rounded-xl bg-[hsl(var(--ap-blue)/0.04)] border border-[hsl(var(--ap-blue)/0.1)]">
              <span className="text-sm font-bold">Total: ₹{((editing.amount || 0) - (editing.discount || 0) + (editing.tax || 0)).toLocaleString()}</span>
            </div>
            <div>
              <label className="text-sm font-medium mb-1 block">Notes</label>
              <textarea value={editing.notes || ""} onChange={(e) => setEditing({ ...editing, notes: e.target.value })} className="w-full px-3 py-2 rounded-xl border border-[hsl(var(--ap-border))] text-sm h-16 resize-none" />
            </div>
          </div>
        )}
        <div className="flex justify-end gap-3 mt-6">
          <button onClick={() => { setModalOpen(false); setEditing(null); }} className="ap-btn-ghost">Cancel</button>
          <button onClick={handleSave} disabled={saving} className="ap-btn">
            {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
            {editing?.id ? "Update" : "Create"} Invoice
          </button>
        </div>
      </Modal>
    </>
  );
}

/* ================================================================ */
/*  PAYMENTS TAB                                                    */
/* ================================================================ */
export function PaymentsTab() {
  const { payments, isLoading, addPayment } = usePayments();
  const { invoices } = useInvoices();
  const [modalOpen, setModalOpen] = useState(false);
  const [newPayment, setNewPayment] = useState({ invoiceId: "", studentId: "", studentName: "", amount: 0, method: "cash" as const, reference: "", notes: "" });
  const [saving, setSaving] = useState(false);

  const handleSave = async () => {
    if (!newPayment.studentName || !newPayment.amount) { toast.error("Student and amount required"); return; }
    setSaving(true);
    try {
      await addPayment.mutateAsync({
        ...newPayment,
        invoiceNumber: invoices.find((i) => i.id === newPayment.invoiceId)?.invoiceNumber || "",
        receivedBy: "Admin",
        paymentDate: new Date().toISOString().slice(0, 10),
        receiptNumber: `RCP-${Date.now()}`,
      });
      toast.success("Payment recorded");
      setModalOpen(false);
    } catch { toast.error("Failed"); } finally { setSaving(false); }
  };

  return (
    <>
      <Toolbar>
        <button onClick={() => setModalOpen(true)} className="ap-btn ml-auto"><Plus className="w-4 h-4" /> Record Payment</button>
      </Toolbar>
      {isLoading ? (
        <div className="space-y-2">{[1, 2, 3].map((i) => <Skeleton key={i} className="h-14" />)}</div>
      ) : payments.length === 0 ? (
        <Panel title="No payments yet" subtitle="Record your first payment">
          <div className="text-center py-8"><CreditCard className="w-12 h-12 mx-auto text-[hsl(var(--ap-muted))] mb-3" /></div>
        </Panel>
      ) : (
        <DataTable
          rows={payments}
          columns={[
            { key: "receiptNumber", label: "Receipt #", render: (r) => <span className="font-mono font-bold text-[hsl(var(--ap-success))]">{r.receiptNumber}</span> },
            { key: "studentName", label: "Student", render: (r) => <span className="font-semibold">{r.studentName}</span> },
            { key: "amount", label: "Amount", render: (r) => <span className="font-bold text-[hsl(var(--ap-success))]">₹{r.amount?.toLocaleString()}</span> },
            { key: "method", label: "Method", render: (r) => <Badge tone="purple">{r.method}</Badge> },
            { key: "paymentDate", label: "Date" },
            { key: "reference", label: "Reference" },
          ]}
          actions={() => (
            <button className="p-1.5 rounded-lg hover:bg-[hsl(var(--ap-border)/0.5)]"><Printer className="w-3.5 h-3.5" /></button>
          )}
        />
      )}

      <Modal open={modalOpen} onClose={() => setModalOpen(false)} size="md">
        <h2 className="text-lg font-bold mb-4">Record Payment</h2>
        <div className="space-y-4">
          <div>
            <label className="text-sm font-medium mb-1 block">Invoice</label>
            <select value={newPayment.invoiceId} onChange={(e) => {
              const inv = invoices.find((i) => i.id === e.target.value);
              setNewPayment({ ...newPayment, invoiceId: e.target.value, studentId: inv?.studentId || "", studentName: inv?.studentName || "", amount: inv?.totalAmount || 0 });
            }} className="w-full px-3 py-2 rounded-xl border border-[hsl(var(--ap-border))] text-sm">
              <option value="">Select invoice</option>
              {invoices.filter((i) => i.status !== "paid").map((i) => <option key={i.id} value={i.id}>{i.invoiceNumber} - {i.studentName} (₹{i.totalAmount})</option>)}
            </select>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="text-sm font-medium mb-1 block">Amount (₹)</label>
              <input type="number" value={newPayment.amount} onChange={(e) => setNewPayment({ ...newPayment, amount: Number(e.target.value) })} className="w-full px-3 py-2 rounded-xl border border-[hsl(var(--ap-border))] text-sm" />
            </div>
            <div>
              <label className="text-sm font-medium mb-1 block">Method</label>
              <select value={newPayment.method} onChange={(e) => setNewPayment({ ...newPayment, method: e.target.value as any })} className="w-full px-3 py-2 rounded-xl border border-[hsl(var(--ap-border))] text-sm">
                <option value="cash">Cash</option><option value="bank_transfer">Bank Transfer</option>
                <option value="esewa">eSewa</option><option value="khalti">Khalti</option>
                <option value="card">Card</option><option value="other">Other</option>
              </select>
            </div>
          </div>
          <div>
            <label className="text-sm font-medium mb-1 block">Reference</label>
            <input value={newPayment.reference} onChange={(e) => setNewPayment({ ...newPayment, reference: e.target.value })} className="w-full px-3 py-2 rounded-xl border border-[hsl(var(--ap-border))] text-sm" placeholder="Transaction ID" />
          </div>
        </div>
        <div className="flex justify-end gap-3 mt-6">
          <button onClick={() => setModalOpen(false)} className="ap-btn-ghost">Cancel</button>
          <button onClick={handleSave} disabled={saving} className="ap-btn">
            {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />} Record Payment
          </button>
        </div>
      </Modal>
    </>
  );
}

/* ================================================================ */
/*  FEE STRUCTURE TAB                                               */
/* ================================================================ */
export function FeeStructureTab() {
  const { fees, isLoading, addFee, updateFee, deleteFee } = useFeeStructure();
  const { courses } = useCourses();
  const [modalOpen, setModalOpen] = useState(false);
  const [editing, setEditing] = useState<any>(null);
  const [saving, setSaving] = useState(false);

  const openAdd = () => {
    setEditing({ courseId: "", courseName: "", feeType: "tuition", amount: 0, frequency: "monthly", isActive: true });
    setModalOpen(true);
  };

  const handleSave = async () => {
    if (!editing?.amount) { toast.error("Amount is required"); return; }
    setSaving(true);
    try {
      const course = courses.find((c) => c.id === editing.courseId);
      const data = { ...editing, courseName: course?.title || editing.courseName };
      if (editing.id) { await updateFee.mutateAsync(data); toast.success("Fee updated"); }
      else { await addFee.mutateAsync(data); toast.success("Fee created"); }
      setModalOpen(false); setEditing(null);
    } catch { toast.error("Failed"); } finally { setSaving(false); }
  };

  return (
    <>
      <Toolbar>
        <button onClick={openAdd} className="ap-btn ml-auto"><Plus className="w-4 h-4" /> Add Fee</button>
      </Toolbar>
      {isLoading ? (
        <div className="space-y-2">{[1, 2, 3].map((i) => <Skeleton key={i} className="h-14" />)}</div>
      ) : fees.length === 0 ? (
        <Panel title="No fee structures" subtitle="Define fee structures for your courses">
          <div className="text-center py-8"><DollarSign className="w-12 h-12 mx-auto text-[hsl(var(--ap-muted))] mb-3" /></div>
        </Panel>
      ) : (
        <DataTable
          rows={fees}
          columns={[
            { key: "courseName", label: "Course", render: (r) => <span className="font-semibold">{r.courseName}</span> },
            { key: "feeType", label: "Type", render: (r) => <Badge tone="purple">{r.feeType}</Badge> },
            { key: "amount", label: "Amount", render: (r) => <span className="font-bold">₹{r.amount?.toLocaleString()}</span> },
            { key: "frequency", label: "Frequency", render: (r) => <Badge tone="info">{r.frequency}</Badge> },
            { key: "isActive", label: "Status", render: (r) => <Badge tone={r.isActive ? "success" : "muted"}>{r.isActive ? "Active" : "Inactive"}</Badge> },
          ]}
          actions={(r) => (
            <div className="flex gap-1">
              <button onClick={() => { setEditing(r); setModalOpen(true); }} className="p-1.5 rounded-lg hover:bg-[hsl(var(--ap-border)/0.5)]"><Eye className="w-3.5 h-3.5" /></button>
              <button onClick={async () => { if (confirm("Delete?")) { await deleteFee.mutateAsync(r.id); toast.success("Deleted"); } }} className="p-1.5 rounded-lg hover:bg-[hsl(var(--ap-danger)/0.1)]"><X className="w-3.5 h-3.5 text-[hsl(var(--ap-danger))]" /></button>
            </div>
          )}
        />
      )}

      <Modal open={modalOpen} onClose={() => { setModalOpen(false); setEditing(null); }} size="md">
        <h2 className="text-lg font-bold mb-4">{editing?.id ? "Edit Fee" : "Add Fee"}</h2>
        {editing && (
          <div className="space-y-4">
            <div>
              <label className="text-sm font-medium mb-1 block">Course</label>
              <select value={editing.courseId || ""} onChange={(e) => setEditing({ ...editing, courseId: e.target.value })} className="w-full px-3 py-2 rounded-xl border border-[hsl(var(--ap-border))] text-sm">
                <option value="">Select course</option>
                {courses.map((c) => <option key={c.id} value={c.id}>{c.title}</option>)}
              </select>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="text-sm font-medium mb-1 block">Fee Type</label>
                <select value={editing.feeType || "tuition"} onChange={(e) => setEditing({ ...editing, feeType: e.target.value })} className="w-full px-3 py-2 rounded-xl border border-[hsl(var(--ap-border))] text-sm">
                  <option value="tuition">Tuition</option><option value="admission">Admission</option>
                  <option value="exam">Exam</option><option value="library">Library</option>
                  <option value="lab">Lab</option><option value="transport">Transport</option>
                  <option value="other">Other</option>
                </select>
              </div>
              <div>
                <label className="text-sm font-medium mb-1 block">Frequency</label>
                <select value={editing.frequency || "monthly"} onChange={(e) => setEditing({ ...editing, frequency: e.target.value })} className="w-full px-3 py-2 rounded-xl border border-[hsl(var(--ap-border))] text-sm">
                  <option value="one_time">One Time</option><option value="monthly">Monthly</option>
                  <option value="quarterly">Quarterly</option><option value="yearly">Yearly</option>
                </select>
              </div>
            </div>
            <div>
              <label className="text-sm font-medium mb-1 block">Amount (₹)</label>
              <input type="number" value={editing.amount || 0} onChange={(e) => setEditing({ ...editing, amount: Number(e.target.value) })} className="w-full px-3 py-2 rounded-xl border border-[hsl(var(--ap-border))] text-sm" />
            </div>
          </div>
        )}
        <div className="flex justify-end gap-3 mt-6">
          <button onClick={() => { setModalOpen(false); setEditing(null); }} className="ap-btn-ghost">Cancel</button>
          <button onClick={handleSave} disabled={saving} className="ap-btn">
            {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
            {editing?.id ? "Update" : "Create"}
          </button>
        </div>
      </Modal>
    </>
  );
}


