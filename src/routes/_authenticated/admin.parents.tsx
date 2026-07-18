import {  } from "react-router-dom";
import { useState, useMemo } from "react";
import {
  Baby, Users, CalendarCheck, TrendingUp, CreditCard, BookOpen, FileText,
  CheckCircle, XCircle, Clock, AlertCircle, Download, Eye, ChevronRight,
} from "lucide-react";
import { motion } from "framer-motion";
import { PageHeader } from "@/components/admin/AdminShell";
import { StatCard, Panel, Badge, DataTable, Tabs, ProgressBar, Skeleton } from "@/components/admin/ui";
import { useParentChildren, useChildAttendance, useChildGrades, useChildFees, useChildAssignments } from "@/hooks/use-parent";

const DEMO_PARENT_ID = "demo_parent_001";

export function ParentPortalPage() {
  const [activeTab, setActiveTab] = useState("overview");
  const { data: children, isLoading: childrenLoading } = useParentChildren(DEMO_PARENT_ID);
  const [selectedChild, setSelectedChild] = useState<string>("");

  const tabs = [
    { label: "Overview", value: "overview" },
    { label: "Attendance", value: "attendance" },
    { label: "Grades", value: "grades" },
    { label: "Assignments", value: "assignments" },
    { label: "Fees", value: "fees" },
  ];

  return (
    <div>
      <PageHeader
        title="Parent Portal"
        subtitle="Track your child's academic progress, attendance, and fees."
      />

      {/* Child Selector */}
      {childrenLoading ? (
        <Skeleton className="h-16 mb-6" />
      ) : children && children.length > 0 ? (
        <div className="flex gap-3 mb-6 overflow-x-auto pb-2">
          {children.map((child) => (
            <motion.button
              key={child.id}
              whileHover={{ y: -2 }}
              onClick={() => setSelectedChild(child.id)}
              className={`flex items-center gap-3 p-3 rounded-xl border transition min-w-fit ${
                selectedChild === child.id || (!selectedChild && child.id === children[0]?.id)
                  ? "border-[hsl(var(--ap-blue))] bg-[hsl(var(--ap-blue)/0.04)]"
                  : "border-[hsl(var(--ap-border))] hover:border-[hsl(var(--ap-blue)/0.3)]"
              }`}
            >
              <div className="w-10 h-10 rounded-full ap-grad flex items-center justify-center text-white font-bold text-sm">
                {child.name?.charAt(0)}
              </div>
              <div className="text-left">
                <p className="text-sm font-semibold">{child.name}</p>
                <p className="text-xs text-[hsl(var(--ap-muted))]">{child.course}</p>
              </div>
            </motion.button>
          ))}
        </div>
      ) : (
        <Panel title="No children linked" subtitle="Contact admin to link your child's account">
          <div className="text-center py-8"><Baby className="w-12 h-12 mx-auto text-[hsl(var(--ap-muted))] mb-3" /></div>
        </Panel>
      )}

      <Tabs tabs={tabs} value={activeTab} onChange={setActiveTab} />

      <div className="mt-4">
        {activeTab === "overview" && <OverviewTab childId={selectedChild || children?.[0]?.id} />}
        {activeTab === "attendance" && <AttendanceTab childId={selectedChild || children?.[0]?.id} />}
        {activeTab === "grades" && <GradesTab childId={selectedChild || children?.[0]?.id} />}
        {activeTab === "assignments" && <AssignmentsTab childId={selectedChild || children?.[0]?.id} />}
        {activeTab === "fees" && <FeesTab childId={selectedChild || children?.[0]?.id} />}
      </div>
    </div>
  );
}

/* ================================================================ */
/*  OVERVIEW TAB                                                    */
/* ================================================================ */
export function OverviewTab({ childId }: { childId?: string }) {
  const { data: attendance } = useChildAttendance(childId);
  const { data: grades } = useChildGrades(childId);
  const { data: fees } = useChildFees(childId);
  const { data: assignments } = useChildAssignments(childId);

  const attendanceRate = useMemo(() => {
    if (!attendance || attendance.length === 0) return 0;
    const present = attendance.filter((a) => a.status === "present").length;
    return Math.round((present / attendance.length) * 100);
  }, [attendance]);

  const avgMarks = useMemo(() => {
    if (!grades || grades.length === 0) return 0;
    return Math.round(grades.reduce((s, g) => s + (g.marks / g.totalMarks) * 100, 0) / grades.length);
  }, [grades]);

  const pendingFees = (fees || []).filter((f) => f.status === "pending" || f.status === "overdue").reduce((s, f) => s + f.amount, 0);
  const pendingAssignments = (assignments || []).filter((a) => a.status === "pending").length;

  return (
    <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-4">
      <StatCard label="Attendance" value={`${attendanceRate}%`} icon={CalendarCheck} tone={attendanceRate >= 80 ? "success" : "warning"} />
      <StatCard label="Avg Marks" value={`${avgMarks}%`} icon={TrendingUp} tone={avgMarks >= 70 ? "success" : "info"} />
      <StatCard label="Pending Fees" prefix="₹" value={pendingFees} icon={CreditCard} tone={pendingFees > 0 ? "danger" : "success"} />
      <StatCard label="Pending Tasks" value={pendingAssignments} icon={FileText} tone={pendingAssignments > 0 ? "orange" : "success"} />
    </div>
  );
}

/* ================================================================ */
/*  ATTENDANCE TAB                                                  */
/* ================================================================ */
export function AttendanceTab({ childId }: { childId?: string }) {
  const { data: attendance, isLoading } = useChildAttendance(childId);
  const [month, setMonth] = useState(new Date().toISOString().slice(0, 7));

  const filtered = useMemo(() => (attendance || []).filter((a) => a.date?.startsWith(month)), [attendance, month]);
  const stats = useMemo(() => {
    const total = filtered.length || 1;
    const present = filtered.filter((a) => a.status === "present").length;
    return { total: filtered.length, present, absent: filtered.filter((a) => a.status === "absent").length, late: filtered.filter((a) => a.status === "late").length, rate: Math.round((present / total) * 100) };
  }, [filtered]);

  return (
    <>
      <div className="flex items-center gap-4 mb-4">
        <input type="month" value={month} onChange={(e) => setMonth(e.target.value)} className="ap-input max-w-[180px]" />
        <div className="ml-auto flex items-center gap-4 text-sm">
          <span className="flex items-center gap-1"><CheckCircle className="w-3.5 h-3.5 text-[hsl(var(--ap-success))]" /> {stats.present} present</span>
          <span className="flex items-center gap-1"><XCircle className="w-3.5 h-3.5 text-[hsl(var(--ap-danger))]" /> {stats.absent} absent</span>
          <span className="font-bold">{stats.rate}%</span>
        </div>
      </div>
      {isLoading ? (
        <div className="space-y-2">{[1, 2, 3].map((i) => <Skeleton key={i} className="h-12" />)}</div>
      ) : (
        <DataTable
          rows={filtered}
          columns={[
            { key: "date", label: "Date", render: (r) => <span className="font-mono text-sm">{r.date}</span> },
            { key: "courseName", label: "Course" },
            { key: "status", label: "Status", render: (r) => (
              <Badge tone={r.status === "present" ? "success" : r.status === "absent" ? "danger" : r.status === "late" ? "warning" : "info"}>{r.status}</Badge>
            )},
          ]}
        />
      )}
    </>
  );
}

/* ================================================================ */
/*  GRADES TAB                                                      */
/* ================================================================ */
export function GradesTab({ childId }: { childId?: string }) {
  const { data: grades, isLoading } = useChildGrades(childId);
  const avgMarks = useMemo(() => {
    if (!grades || grades.length === 0) return 0;
    return Math.round(grades.reduce((s, g) => s + (g.marks / g.totalMarks) * 100, 0) / grades.length);
  }, [grades]);

  return (
    <>
      <div className="mb-4 flex items-center gap-4">
        <span className="text-sm">Average: <strong className="text-lg">{avgMarks}%</strong></span>
        <Badge tone={avgMarks >= 70 ? "success" : avgMarks >= 50 ? "warning" : "danger"}>
          {avgMarks >= 70 ? "Good Standing" : avgMarks >= 50 ? "Needs Improvement" : "At Risk"}
        </Badge>
      </div>
      {isLoading ? (
        <div className="space-y-2">{[1, 2, 3].map((i) => <Skeleton key={i} className="h-14" />)}</div>
      ) : (
        <DataTable
          rows={grades || []}
          columns={[
            { key: "examName", label: "Exam", render: (r) => <span className="font-bold">{r.examName}</span> },
            { key: "courseName", label: "Course" },
            { key: "marks", label: "Score", render: (r) => <span className="font-bold">{r.marks}/{r.totalMarks} ({Math.round((r.marks / r.totalMarks) * 100)}%)</span> },
            { key: "grade", label: "Grade", render: (r) => <Badge tone={["A+", "A", "B+", "B"].includes(r.grade) ? "success" : "warning"}>{r.grade}</Badge> },
            { key: "date", label: "Date" },
          ]}
        />
      )}
    </>
  );
}

/* ================================================================ */
/*  ASSIGNMENTS TAB                                                 */
/* ================================================================ */
export function AssignmentsTab({ childId }: { childId?: string }) {
  const { data: assignments, isLoading } = useChildAssignments(childId);

  return (
    <>
      {isLoading ? (
        <div className="space-y-2">{[1, 2, 3].map((i) => <Skeleton key={i} className="h-16" />)}</div>
      ) : (assignments || []).length === 0 ? (
        <Panel title="No assignments"><p className="text-sm text-[hsl(var(--ap-muted))] text-center py-4">No assignments found</p></Panel>
      ) : (
        <div className="space-y-2">
          {(assignments || []).map((a) => (
            <motion.div key={a.id} whileHover={{ x: 4 }} className="ap-card p-4 flex items-center gap-4">
              <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${a.status === "graded" ? "bg-[hsl(var(--ap-success)/0.1)]" : "bg-[hsl(var(--ap-orange)/0.1)]"}`}>
                {a.status === "graded" ? <CheckCircle className="w-4 h-4 text-[hsl(var(--ap-success))]" /> : <Clock className="w-4 h-4 text-[hsl(var(--ap-orange))]" />}
              </div>
              <div className="flex-1">
                <p className="font-semibold">{a.title}</p>
                <p className="text-xs text-[hsl(var(--ap-muted))]">{a.courseName} · Due: {a.dueDate}</p>
              </div>
              {a.status === "graded" && a.marks != null ? (
                <span className="font-bold text-[hsl(var(--ap-success))]">{a.marks}/{a.totalMarks}</span>
              ) : (
                <Badge tone={a.status === "pending" ? "warning" : "info"}>{a.status}</Badge>
              )}
            </motion.div>
          ))}
        </div>
      )}
    </>
  );
}

/* ================================================================ */
/*  FEES TAB                                                        */
/* ================================================================ */
export function FeesTab({ childId }: { childId?: string }) {
  const { data: fees, isLoading } = useChildFees(childId);
  const totalPending = (fees || []).filter((f) => f.status === "pending" || f.status === "overdue").reduce((s, f) => s + f.amount, 0);
  const totalPaid = (fees || []).filter((f) => f.status === "paid").reduce((s, f) => s + f.amount, 0);

  return (
    <>
      <div className="flex items-center gap-6 mb-4 text-sm">
        <span>Pending: <strong className="text-[hsl(var(--ap-danger))]">₹{totalPending.toLocaleString()}</strong></span>
        <span>Paid: <strong className="text-[hsl(var(--ap-success))]">₹{totalPaid.toLocaleString()}</strong></span>
      </div>
      {isLoading ? (
        <div className="space-y-2">{[1, 2, 3].map((i) => <Skeleton key={i} className="h-14" />)}</div>
      ) : (
        <DataTable
          rows={fees || []}
          columns={[
            { key: "invoiceNumber", label: "Invoice #", render: (r) => <span className="font-mono font-bold">{r.invoiceNumber}</span> },
            { key: "amount", label: "Amount", render: (r) => <span className="font-bold">₹{r.amount?.toLocaleString()}</span> },
            { key: "dueDate", label: "Due Date" },
            { key: "status", label: "Status", render: (r) => (
              <Badge tone={r.status === "paid" ? "success" : r.status === "overdue" ? "danger" : "warning"}>{r.status}</Badge>
            )},
          ]}
        />
      )}
    </>
  );
}


