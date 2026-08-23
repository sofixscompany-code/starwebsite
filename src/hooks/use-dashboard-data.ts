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

async function fetchAll(name: string, max = 200): Promise<DashRecord[]> {
  try {
    const snap = await getDocs(query(collection(db, name), limit(max)));
    return snap.docs.map((d) => ({ id: d.id, ...d.data() }));
  } catch {
    return [];
  }
}

const num = (v: unknown): number => {
  const n = Number(v);
  return Number.isFinite(n) ? n : 0;
};

export function useSuperAdminStats() {
  return useQuery({
    queryKey: ["super-admin-stats"],
    queryFn: async () => {
      const [students, teachers, users, admissions, payments, notices] = await Promise.all([
        fetchAll("students"),
        fetchAll("teachers"),
        fetchAll("users", 500),
        fetchAll("admissions"),
        fetchAll("payments"),
        fetchAll("notices"),
      ]);

      const revenue = payments.reduce((s, p) => s + num(p.amount), 0);
      const parents = users.filter((u) => u.role === "parent").length;
      const pendingAdmissions = admissions.filter((a) => a.status === "pending");

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
      for (const a of admissions.filter((x) => x.status !== "approved").slice(0, 2)) {
        activities.push({
          time: formatAgo(toMs(a.createdAt)),
          title: "New admission request",
          desc: `${a.name} · ${a.course}`,
          user: "System",
        });
      }
      activities.sort((x, y) => parseAgo(x.time) - parseAgo(y.time));

      return {
        totalStudents: students.length,
        totalTeachers: teachers.length,
        totalParents: parents,
        revenue,
        admissionsCount: admissions.length,
        activeUsers: users.length,
        recentActivities: activities.slice(0, 8),
        pendingApprovals: pendingAdmissions.slice(0, 5),
        hasData: students.length > 0,
      };
    },
  });
}

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

export function useTeacherDashboard(teacherId?: string) {
  return useQuery({
    queryKey: ["teacher-dashboard", teacherId],
    queryFn: async () => {
      const [classes, homework, exams] = await Promise.all([
        fetchAll("classes"),
        fetchAll("homework"),
        fetchAll("exams"),
      ]);
      const myClasses = teacherId
        ? classes
            .filter((c) => c.teacherId === teacherId)
            .sort((a, b) => toMs(a.startTime) - toMs(b.startTime))
        : classes.sort((a, b) => toMs(a.startTime) - toMs(b.startTime));
      const myHomework = homework
        .filter((h) => !teacherId || h.teacherId === teacherId)
        .sort((a, b) => toMs(a.dueDate) - toMs(b.dueDate))
        .slice(0, 5);
      const myExams = exams
        .filter((e) => !teacherId || e.teacherId === teacherId)
        .sort((a, b) => toMs(a.scheduledAt) - toMs(b.scheduledAt))
        .slice(0, 5);
      return {
        classes: myClasses,
        homework: myHomework,
        exams: myExams,
        hasData: classes.length > 0,
      };
    },
    initialData: { classes: [], homework: [], exams: [], hasData: false },
  });
}

export function useStudentDashboard(studentId?: string) {
  return useQuery({
    queryKey: ["student-dashboard", studentId],
    queryFn: async () => {
      const [enrollments, homework, results, attendance, classes] = await Promise.all([
        fetchAll("enrollments"),
        fetchAll("homework"),
        fetchAll("results"),
        fetchAll("attendance", 500),
        fetchAll("classes"),
      ]);
      const mine = <T extends DashRecord>(arr: T[]) =>
        arr.filter((r) => !studentId || r.studentId === studentId);

      const att = mine(attendance);
      const present = att.filter((a) => a.status === "present" || a.status === "late").length;
      const attendancePercent = att.length ? Math.round((present / att.length) * 100) : 0;

      return {
        enrollments: mine(enrollments),
        homework: mine(homework)
          .sort((a, b) => toMs(a.dueDate) - toMs(b.dueDate))
          .slice(0, 5),
        results: mine(results).slice(0, 5),
        attendancePercent,
        upcomingClasses: classes
          .filter((c) => toMs(c.startTime) > Date.now())
          .sort((a, b) => toMs(a.startTime) - toMs(b.startTime))
          .slice(0, 3),
        hasData: enrollments.length > 0 || results.length > 0,
      };
    },
    initialData: {
      enrollments: [],
      homework: [],
      results: [],
      attendancePercent: 0,
      upcomingClasses: [],
      hasData: false,
    },
  });
}

export function useParentDashboard(parentEmail?: string) {
  return useQuery({
    queryKey: ["parent-dashboard", parentEmail],
    queryFn: async () => {
      const [students, notices] = await Promise.all([fetchAll("students"), fetchAll("notices")]);
      const children = parentEmail
        ? students.filter(
            (s) =>
              s.parentEmail === parentEmail ||
              String(s.email || "").toLowerCase() === String(parentEmail).toLowerCase(),
          )
        : [];
      const avgAtt = children.length
        ? Math.round(
            children.reduce((s, c) => s + Number(c.attendancePercent || 0), 0) / children.length,
          )
        : 0;
      const avgScore = children.length
        ? Math.round(children.reduce((s, c) => s + Number(c.avgScore || 0), 0) / children.length)
        : 0;
      return {
        children,
        avgAttendance: avgAtt,
        avgScore,
        notices: notices
          .filter((n) => n.isPublished !== false)
          .sort((a, b) => toMs(b.publishedAt) - toMs(a.publishedAt))
          .slice(0, 5),
        hasData: children.length > 0,
      };
    },
    initialData: { children: [], avgAttendance: 0, avgScore: 0, notices: [], hasData: false },
  });
}

export function useAccountantDashboard() {
  return useQuery({
    queryKey: ["accountant-dashboard"],
    queryFn: async () => {
      const [payments, fees, expenses] = await Promise.all([
        fetchAll("payments"),
        fetchAll("fees"),
        fetchAll("expenses"),
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
      const pendingDues = fees
        .filter((f) => f.status === "pending")
        .reduce((s, f) => s + num(f.amount), 0);

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
          desc: `${e.title} · Rs ${num(e.amount).toLocaleString()}`,
        });
      }

      return {
        todayCollection,
        pendingDues,
        monthRevenue,
        monthExpense,
        recentTxns: txns.slice(0, 6),
        hasData: payments.length > 0,
      };
    },
    initialData: {
      todayCollection: 0,
      pendingDues: 0,
      monthRevenue: 0,
      monthExpense: 0,
      recentTxns: [],
      hasData: false,
    },
  });
}
