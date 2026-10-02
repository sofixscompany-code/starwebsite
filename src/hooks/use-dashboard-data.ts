import { useQuery } from "@tanstack/react-query";
import { collection, getDocs, limit, query } from "firebase/firestore";
import { db } from "@/integrations/firebase/config";

export interface DashRecord {
  id: string;
  [key: string]: unknown;
}

export function getStoredAuthUser(): {
  uid: string;
  email: string;
  role: string;
  name?: string;
} | null {
  try {
    const raw = localStorage.getItem("auth_user");
    if (!raw) return null;
    const parsed = JSON.parse(raw);
    if (parsed?.uid && parsed?.role) return parsed;
    return null;
  } catch {
    return null;
  }
}

function toMs(v: unknown): number {
  if (!v) return 0;
  if (typeof v === "string") return Date.parse(v) || 0;
  if (typeof v === "number") return v;
  if (v instanceof Date) return v.getTime();
  const obj = v as Record<string, unknown>;
  if (typeof obj.seconds === "number") return obj.seconds * 1000;
  if (typeof obj.toMillis === "function") return (v as { toMillis: () => number }).toMillis();
  return 0;
}

async function fetchAll(name: string, max = 200, errors?: Set<string>): Promise<DashRecord[]> {
  try {
    const snap = await getDocs(query(collection(db, name), limit(max)));
    return snap.docs.map((d) => ({ id: d.id, ...d.data() }));
  } catch {
    // Index-free reads should not fail, but record the failure so `hasData`
    // can stay false and dashboards can show an honest empty state.
    errors?.add(name);
    return [];
  }
}

const num = (v: unknown): number => {
  const n = Number(v);
  return Number.isFinite(n) ? n : 0;
};

function formatAgo(ms: number): string {
  if (!ms) return "";
  const diff = Date.now() - ms;
  const m = Math.round(diff / 60000);
  if (m < 1) return "just now";
  if (m < 60) return `${m}m ago`;
  const h = Math.round(m / 60);
  if (h < 24) return `${h}h ago`;
  const d = Math.round(h / 24);
  return `${d}d ago`;
}

function parseAgo(s: string): number {
  const m = s.match(/^(\d+)([mhd])/);
  if (!m) return 0;
  const v = Number(m[1]);
  if (m[2] === "m") return v;
  if (m[2] === "h") return v * 60;
  return v * 1440;
}

const MONTH_NAMES = [
  "Baisakh",
  "Jestha",
  "Ashadh",
  "Shrawan",
  "Bhadra",
  "Ashwin",
  "Kartik",
  "Mangsir",
  "Poush",
  "Magh",
  "Falgun",
  "Chaitra",
];

function getMonthLabel(ms: number): string {
  const d = new Date(ms);
  return `${MONTH_NAMES[d.getMonth()]}`;
}

function buildMonthlySeries(
  records: DashRecord[],
  field: string,
): { month: string; amount: number }[] {
  const map = new Map<string, number>();
  for (const r of records) {
    const ms = toMs(r[field] || r.createdAt);
    if (!ms) continue;
    const label = getMonthLabel(ms);
    map.set(label, (map.get(label) ?? 0) + num(r.amount));
  }
  const last6: { month: string; amount: number }[] = [];
  const now = new Date();
  for (let i = 5; i >= 0; i--) {
    const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
    const label = MONTH_NAMES[d.getMonth()];
    last6.push({ month: label, amount: map.get(label) ?? 0 });
  }
  return last6;
}

function buildIncomeBreakdown(payments: DashRecord[]): { name: string; value: number }[] {
  const map = new Map<string, number>();
  for (const p of payments) {
    const cat = String(p.category || p.feeType || p.type || p.method || "Other");
    map.set(cat, (map.get(cat) ?? 0) + num(p.amount));
  }
  return Array.from(map.entries())
    .map(([name, value]) => ({ name, value }))
    .sort((a, b) => b.value - a.value)
    .slice(0, 6);
}

function buildFeeBreakdown(
  fees: DashRecord[],
  invoices: DashRecord[],
): {
  label: string;
  collected: number;
  total: number;
}[] {
  const map = new Map<string, { collected: number; total: number }>();
  const add = (label: string, total: number, collected: number) => {
    const entry = map.get(label) ?? { collected: 0, total: 0 };
    entry.total += total;
    entry.collected += collected;
    map.set(label, entry);
  };
  for (const f of fees) {
    const label = String(f.category || f.feeType || "Tuition");
    const total = num(f.amount);
    add(label, total, f.status === "paid" ? total : 0);
  }
  // Real invoices (fee_invoices) written by the Fees module, grouped by course.
  for (const inv of invoices) {
    const label = String(inv.courseName || inv.feeType || "Course");
    const total = num(inv.totalAmount) || num(inv.amount);
    const collected =
      inv.status === "paid"
        ? total
        : inv.status === "partial"
          ? Math.min(num(inv.amount), total)
          : 0;
    add(label, total, collected);
  }
  if (map.size === 0) return [];
  return Array.from(map.entries())
    .map(([label, v]) => ({ label, collected: v.collected, total: v.total }))
    .sort((a, b) => b.total - a.total)
    .slice(0, 6);
}

/** Class startTime may be a full datetime, free text, or a bare "HH:MM" daily slot → epoch ms. */
export function classStartMs(v: unknown): number {
  const s = String(v ?? "").trim();
  if (!s) return 0;
  const parsed = Date.parse(s);
  if (Number.isFinite(parsed)) return parsed;
  // Bare clock time ("09:00", "9:30 PM") → today at that time.
  const bare = /^(\d{1,2}):(\d{2})(?:\s*([ap]m))?$/i.exec(s);
  if (bare) {
    let h = Number(bare[1]);
    const meridiem = (bare[3] || "").toLowerCase();
    if (meridiem === "pm" && h < 12) h += 12;
    if (meridiem === "am" && h === 12) h = 0;
    const d = new Date();
    d.setHours(h, Number(bare[2]), 0, 0);
    return d.getTime();
  }
  // Time embedded in other text ("Mon 09:00") — take the first HH:MM.
  const embedded = /(\d{1,2}):(\d{2})/.exec(s);
  if (embedded) {
    const d = new Date();
    d.setHours(Number(embedded[1]), Number(embedded[2]), 0, 0);
    return d.getTime();
  }
  return 0;
}

/** Display time for class slots ("HH:MM" or datetime → "09:00 AM"). */
export function fmtClassTime(v: unknown): string {
  const s = String(v ?? "").trim();
  if (/^\d{1,2}:\d{2}(?:\s*[ap]m)?$/i.test(s)) {
    const ms = classStartMs(s);
    return ms
      ? new Date(ms).toLocaleTimeString("en-US", { hour: "2-digit", minute: "2-digit" })
      : s;
  }
  const ms = Date.parse(s);
  if (!Number.isFinite(ms)) return s;
  return new Date(ms).toLocaleTimeString("en-US", { hour: "2-digit", minute: "2-digit" });
}

/** Short "Oct 5" date for any date-ish value (Firestore Timestamp safe); "" when unknown. */
export function fmtShortDate(v: unknown): string {
  const ms = toMs(v);
  if (!ms) return "";
  return new Date(ms).toLocaleDateString("en-US", { month: "short", day: "numeric" });
}

/** True when a class runs today — handles bare "HH:MM" slots, weekday `day`, and datetimes. */
export function isClassToday(c: DashRecord): boolean {
  const start = classStartMs(c.startTime);
  if (!start) return false;
  const now = new Date();
  const d = new Date(start);
  if (
    d.getDate() !== now.getDate() ||
    d.getMonth() !== now.getMonth() ||
    d.getFullYear() !== now.getFullYear()
  ) {
    return false;
  }
  const day = String(c.day || "")
    .trim()
    .slice(0, 3)
    .toLowerCase();
  if (!day) return true;
  return now.toLocaleDateString("en-US", { weekday: "short" }).toLowerCase() === day;
}

// ─── Super Admin ──────────────────────────────────────────────
export function useSuperAdminStats() {
  return useQuery({
    queryKey: ["super-admin-stats"],
    queryFn: async () => {
      const errs = new Set<string>();
      const [
        students,
        teachers,
        users,
        admissions,
        payments,
        notices,
        expenses,
        results,
        attendance,
        invoices,
        fees,
      ] = await Promise.all([
        fetchAll("students", 200, errs),
        fetchAll("teachers", 200, errs),
        fetchAll("users", 500, errs),
        fetchAll("admissions", 200, errs),
        fetchAll("payments", 500, errs),
        fetchAll("notices", 200, errs),
        fetchAll("expenses", 500, errs),
        fetchAll("results", 200, errs),
        // Auxiliary reads (no errs): a missing permission must not blank the dashboard.
        fetchAll("attendance", 500),
        fetchAll("fee_invoices", 300),
        fetchAll("fees", 300),
      ]);

      const revenue = payments.reduce((s, p) => s + num(p.amount), 0);
      const parents = users.filter((u) => u.role === "parent").length;
      // Real admission workflow statuses (Draft/Submitted/pending).
      const PENDING_ADMISSION = new Set(["pending", "submitted", "draft"]);
      const pendingAdmissions = admissions.filter((a) =>
        PENDING_ADMISSION.has(String(a.status || "").toLowerCase()),
      );

      // Activities
      const activities: { time: string; title: string; desc: string; user: string }[] = [];
      for (const p of payments.slice(0, 3)) {
        activities.push({
          time: formatAgo(toMs(p.createdAt)),
          title: "Fee payment received",
          desc: `Rs ${num(p.amount).toLocaleString()} from ${p.studentName || "student"}`,
          user: "Accountant",
        });
      }
      for (const n of notices.slice(0, 3)) {
        activities.push({
          time: formatAgo(toMs(n.publishedAt) || toMs(n.createdAt)),
          title: "Notice published",
          desc: String(n.title || ""),
          user: "Admin",
        });
      }
      for (const a of admissions
        .filter((x) => !["approved", "rejected"].includes(String(x.status || "").toLowerCase()))
        .slice(0, 2)) {
        activities.push({
          time: formatAgo(toMs(a.createdAt)),
          title: "New admission request",
          desc: `${String(a.studentName || a.fullName || a.name || "Applicant")}${
            a.courseName || a.course ? ` · ${String(a.courseName || a.course)}` : ""
          }`,
          user: "System",
        });
      }
      activities.sort((x, y) => parseAgo(x.time) - parseAgo(y.time));

      // Charts
      const revenueByMonth = buildMonthlySeries(payments, "createdAt");
      const incomeBreakdown = buildIncomeBreakdown(payments);

      // KPIs — real measurements only; null → dashboard shows "No data yet".
      const passRate = results.length
        ? Math.round(
            (results.filter((r) => num(r.marks || r.score) >= 40).length / results.length) * 100,
          )
        : null;
      const activeIds = new Set(
        [...attendance, ...results].map((r) => String(r.studentId || "")).filter(Boolean),
      );
      const isActive = (s: DashRecord) =>
        activeIds.has(s.id) || activeIds.has(String(s.studentId || ""));
      const retention =
        students.length && activeIds.size
          ? Math.round((students.filter(isActive).length / students.length) * 100)
          : null;
      const invoicedTotal = invoices.reduce((s, i) => s + (num(i.totalAmount) || num(i.amount)), 0);
      const pendingDues =
        fees.filter((f) => f.status === "pending").reduce((s, f) => s + num(f.amount), 0) +
        invoices
          .filter((i) => i.status === "pending" || i.status === "overdue")
          .reduce((s, i) => s + (num(i.totalAmount) || num(i.amount)), 0);
      const collectedPct =
        invoicedTotal > 0 ? Math.min(100, Math.round((revenue / invoicedTotal) * 100)) : null;

      return {
        totalStudents: students.length,
        totalTeachers: teachers.length,
        totalParents: parents,
        revenue,
        admissionsCount: admissions.length,
        activeUsers: users.length,
        recentActivities: activities.slice(0, 8),
        pendingApprovals: pendingAdmissions.slice(0, 5),
        revenueByMonth,
        incomeBreakdown,
        expenseByMonth: buildMonthlySeries(expenses, "createdAt"),
        passRate,
        retention,
        invoicedTotal,
        pendingDues,
        collectedPct,
        hasData: errs.size === 0 && students.length > 0,
        error: errs.size > 0,
      };
    },
  });
}

// ─── Teacher ──────────────────────────────────────────────────
export function useTeacherDashboard(teacherId?: string) {
  return useQuery({
    queryKey: ["teacher-dashboard", teacherId],
    queryFn: async () => {
      const errs = new Set<string>();
      const [classes, teacherClasses, homework, exams, students, notices] = await Promise.all([
        fetchAll("classes", 200, errs),
        // Recurring schedule from the My Classes tab (day + "HH:MM") — auxiliary read.
        fetchAll("teacher_classes", 200),
        fetchAll("homework", 200, errs),
        fetchAll("exams", 200, errs),
        fetchAll("students", 200, errs),
        fetchAll("notices", 200, errs),
      ]);
      // Own classes plus ones not yet assigned to a specific teacher.
      const owned = (r: DashRecord) => !teacherId || r.teacherId === teacherId || !r.teacherId;
      const myClasses = [...classes, ...teacherClasses]
        .filter(owned)
        .sort((a, b) => classStartMs(a.startTime) - classStartMs(b.startTime));
      const myHomework = homework
        .filter(owned)
        .sort((a, b) => toMs(a.dueDate) - toMs(b.dueDate))
        .slice(0, 5);
      const myExams = exams
        .filter(owned)
        .sort((a, b) => toMs(a.scheduledAt) - toMs(b.scheduledAt))
        .slice(0, 5);

      const activities: { time: string; title: string; desc: string }[] = [];
      for (const h of myHomework.slice(0, 2)) {
        activities.push({
          time: formatAgo(toMs(h.createdAt)),
          title: "Homework assigned",
          desc: String(h.title || h.subject || "New assignment"),
        });
      }
      for (const e of myExams.slice(0, 2)) {
        activities.push({
          time: formatAgo(toMs(e.createdAt) || toMs(e.scheduledAt)),
          title: "Exam scheduled",
          desc: String(e.title || e.subject || "Upcoming exam"),
        });
      }
      for (const n of notices.slice(0, 2)) {
        activities.push({
          time: formatAgo(toMs(n.publishedAt) || toMs(n.createdAt)),
          title: "Notice: " + String(n.title || ""),
          desc: String(n.body || "").slice(0, 60),
        });
      }
      activities.sort((x, y) => parseAgo(x.time) - parseAgo(y.time));

      return {
        classes: myClasses,
        homework: myHomework,
        exams: myExams,
        totalStudents: students.length,
        activities: activities.slice(0, 6),
        hasData: errs.size === 0 && (classes.length > 0 || teacherClasses.length > 0),
        error: errs.size > 0,
      };
    },
    initialData: {
      classes: [],
      homework: [],
      exams: [],
      totalStudents: 0,
      activities: [],
      hasData: false,
      error: false,
    },
  });
}

// ─── Student ──────────────────────────────────────────────────
export function useStudentDashboard(studentId?: string) {
  return useQuery({
    queryKey: ["student-dashboard", studentId],
    queryFn: async () => {
      const errs = new Set<string>();
      const [enrollments, homework, results, attendance, classes, students, exams] =
        await Promise.all([
          fetchAll("enrollments", 200, errs),
          fetchAll("homework", 200, errs),
          fetchAll("results", 200, errs),
          fetchAll("attendance", 500, errs),
          fetchAll("classes", 200, errs),
          // Auxiliary reads (no errs): a missing permission must not blank the dashboard.
          fetchAll("students", 200),
          fetchAll("exams", 100),
        ]);
      const mine = <T extends DashRecord>(arr: T[]) =>
        arr.filter((r) => !studentId || r.studentId === studentId);

      const att = mine(attendance);
      const present = att.filter((a) => a.status === "present" || a.status === "late").length;
      const attendancePercent = att.length ? Math.round((present / att.length) * 100) : null;

      // Batch-level homework has no per-student id — match the student's batch too.
      const myBatches = new Set(
        students
          .filter((s) => s.id === studentId)
          .map((s) => String(s.batch || "").trim())
          .filter(Boolean),
      );
      const myHomework = homework.filter(
        (h) =>
          !studentId ||
          h.studentId === studentId ||
          (h.batch != null && myBatches.has(String(h.batch).trim())),
      );

      const startOfToday = new Date();
      startOfToday.setHours(0, 0, 0, 0);

      return {
        enrollments: mine(enrollments),
        homework: myHomework.sort((a, b) => toMs(a.dueDate) - toMs(b.dueDate)).slice(0, 5),
        results: mine(results).slice(0, 5),
        attendancePercent,
        upcomingClasses: classes
          .filter((c) => {
            const ms = classStartMs(c.startTime);
            return ms >= startOfToday.getTime() && ms < startOfToday.getTime() + 86400000;
          })
          .sort((a, b) => classStartMs(a.startTime) - classStartMs(b.startTime))
          .slice(0, 4),
        exams: exams
          .filter((e) => toMs(e.scheduledAt) >= startOfToday.getTime())
          .sort((a, b) => toMs(a.scheduledAt) - toMs(b.scheduledAt))
          .slice(0, 3),
        hasData: errs.size === 0 && (enrollments.length > 0 || results.length > 0),
        error: errs.size > 0,
      };
    },
    initialData: {
      enrollments: [],
      homework: [],
      results: [],
      attendancePercent: null,
      upcomingClasses: [],
      exams: [],
      hasData: false,
      error: false,
    },
  });
}

// ─── Parent ───────────────────────────────────────────────────
export function useParentDashboard(parentEmail?: string) {
  return useQuery({
    queryKey: ["parent-dashboard", parentEmail],
    queryFn: async () => {
      const errs = new Set<string>();
      const [students, notices, homework] = await Promise.all([
        fetchAll("students", 200, errs),
        fetchAll("notices", 200, errs),
        fetchAll("homework", 200, errs),
      ]);
      const emailKey = String(parentEmail || "").toLowerCase();
      const matched = emailKey
        ? students.filter(
            (s) =>
              String(s.parentEmail || "").toLowerCase() === emailKey ||
              String(s.email || "").toLowerCase() === emailKey,
          )
        : [];
      // De-duplicate duplicate student documents (same child entered twice).
      const seenChildren = new Set<string>();
      const children = matched.filter((s) => {
        const key =
          `${String(s.fullName || s.name || "")
            .toLowerCase()
            .trim()}|` +
          `${String(s.course || "")
            .toLowerCase()
            .trim()}|` +
          `${String(s.parentEmail || "")
            .toLowerCase()
            .trim()}`;
        if (seenChildren.has(key)) return false;
        seenChildren.add(key);
        return true;
      });
      const childName = (c: DashRecord) =>
        String(c.fullName || c.name || c.firstName || "Your child");
      const avgAtt = children.length
        ? Math.round(
            children.reduce((s, c) => s + Number(c.attendancePercent || 0), 0) / children.length,
          )
        : 0;
      const avgScore = children.length
        ? Math.round(children.reduce((s, c) => s + Number(c.avgScore || 0), 0) / children.length)
        : 0;

      const childIds = new Set(
        children.flatMap((c) => [c.id, String(c.studentId || "")]).filter(Boolean),
      );
      const childNames = new Set(children.map((c) => childName(c).toLowerCase()));
      const childBatches = new Set(
        children.map((c) => String(c.batch || "").trim()).filter(Boolean),
      );
      const pendingHw = homework.filter(
        (h) =>
          !["completed", "graded"].includes(String(h.status || "").toLowerCase()) &&
          (childIds.has(String(h.studentId || "")) ||
            (h.studentName != null && childNames.has(String(h.studentName).toLowerCase())) ||
            (h.batch != null && childBatches.has(String(h.batch).trim()))),
      ).length;

      const activities: { time: string; title: string; desc: string }[] = [];
      for (const c of children.slice(0, 2)) {
        activities.push({
          time: formatAgo(toMs(c.updatedAt) || toMs(c.createdAt)),
          title: `${childName(c)} — attendance updated`,
          desc: `${num(c.attendancePercent)}% attendance`,
        });
      }
      for (const n of notices.slice(0, 3)) {
        activities.push({
          time: formatAgo(toMs(n.publishedAt) || toMs(n.createdAt)),
          title: String(n.title || "Notice"),
          desc: String(n.body || "").slice(0, 60),
        });
      }
      activities.sort((x, y) => parseAgo(x.time) - parseAgo(y.time));

      return {
        children,
        avgAttendance: avgAtt,
        avgScore,
        pendingHw,
        notices: notices
          .filter((n) => n.isPublished !== false)
          .sort((a, b) => toMs(b.publishedAt) - toMs(a.publishedAt))
          .slice(0, 5),
        activities: activities.slice(0, 6),
        hasData: errs.size === 0 && children.length > 0,
        error: errs.size > 0,
      };
    },
    initialData: {
      children: [],
      avgAttendance: 0,
      avgScore: 0,
      pendingHw: 0,
      notices: [],
      activities: [],
      hasData: false,
      error: false,
    },
  });
}

// ─── Accountant ───────────────────────────────────────────────
export function useAccountantDashboard() {
  return useQuery({
    queryKey: ["accountant-dashboard"],
    queryFn: async () => {
      const errs = new Set<string>();
      const [payments, fees, expenses, invoices] = await Promise.all([
        fetchAll("payments", 500, errs),
        fetchAll("fees", 500, errs),
        fetchAll("expenses", 500, errs),
        // Auxiliary read (no errs): a missing permission must not blank the dashboard.
        fetchAll("fee_invoices", 500),
      ]);

      const byCreated = (a: DashRecord, b: DashRecord) => toMs(b.createdAt) - toMs(a.createdAt);
      const sortedPayments = [...payments].sort(byCreated);
      const sortedExpenses = [...expenses].sort(byCreated);

      const startOfDay = new Date();
      startOfDay.setHours(0, 0, 0, 0);
      const startOfMonth = new Date();
      startOfMonth.setDate(1);
      startOfMonth.setHours(0, 0, 0, 0);

      const todayCollection = sortedPayments
        .filter((p) => toMs(p.createdAt) >= startOfDay.getTime())
        .reduce((s, p) => s + num(p.amount), 0);
      const monthRevenue = sortedPayments
        .filter((p) => toMs(p.createdAt) >= startOfMonth.getTime())
        .reduce((s, p) => s + num(p.amount), 0);
      const monthExpense = sortedExpenses
        .filter((e) => toMs(e.createdAt) >= startOfMonth.getTime())
        .reduce((s, e) => s + num(e.amount), 0);
      const pendingDues =
        fees.filter((f) => f.status === "pending").reduce((s, f) => s + num(f.amount), 0) +
        invoices
          .filter((i) => i.status === "pending" || i.status === "overdue")
          .reduce((s, i) => s + (num(i.totalAmount) || num(i.amount)), 0);

      const txns: { date: string; title: string; desc: string }[] = [];
      for (const p of sortedPayments.slice(0, 4)) {
        txns.push({
          date: formatAgo(toMs(p.createdAt)),
          title: "Fee received",
          desc: `${p.studentName || "Student"} · Rs ${num(p.amount).toLocaleString()} · ${p.method || "Cash"}`,
        });
      }
      for (const e of sortedExpenses.slice(0, 3)) {
        txns.push({
          date: formatAgo(toMs(e.createdAt)),
          title: "Expense logged",
          desc: `${e.title || "Expense"} · Rs ${num(e.amount).toLocaleString()}`,
        });
      }

      const incomeByMonth = buildMonthlySeries(payments, "createdAt");
      const expenseByMonthChart = buildMonthlySeries(expenses, "createdAt");
      const feeBreakdown = buildFeeBreakdown(fees, invoices);

      return {
        todayCollection,
        pendingDues,
        monthRevenue,
        monthExpense,
        recentTxns: txns.slice(0, 6),
        incomeByMonth,
        expenseByMonth: expenseByMonthChart,
        feeBreakdown,
        hasData:
          errs.size === 0 && (payments.length > 0 || invoices.length > 0 || expenses.length > 0),
        error: errs.size > 0,
      };
    },
    initialData: {
      todayCollection: 0,
      pendingDues: 0,
      monthRevenue: 0,
      monthExpense: 0,
      recentTxns: [],
      incomeByMonth: [],
      expenseByMonth: [],
      feeBreakdown: [],
      hasData: false,
      error: false,
    },
  });
}
