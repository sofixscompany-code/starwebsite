import { useQuery } from "@tanstack/react-query";
import { collection, query, getDocs, where } from "firebase/firestore";
import { db } from "@/integrations/firebase/config";

export interface Child {
  id: string;
  name: string;
  email: string;
  course: string;
  grade: string;
  age: number;
}

export interface ChildAttendance {
  id: string;
  date: string;
  status: "present" | "absent" | "late" | "excused";
  courseName: string;
}

export interface ChildGrade {
  id: string;
  examName: string;
  courseName: string;
  marks: number;
  totalMarks: number;
  grade: string;
  date: string;
}

export interface ChildFee {
  id: string;
  invoiceNumber: string;
  amount: number;
  status: "paid" | "pending" | "overdue";
  dueDate: string;
  paidDate?: string;
}

export interface ChildAssignment {
  id: string;
  title: string;
  courseName: string;
  dueDate: string;
  status: "pending" | "submitted" | "graded";
  marks?: number;
  totalMarks?: number;
}

/* -------------------- HELPERS (index-free queries) -------------------- */
/** Normalize Firestore Timestamps / ISO strings / numbers to epoch ms. */
const toMs = (v: unknown): number => {
  if (!v) return 0;
  if (typeof v === "number") return v;
  if (typeof v === "string") return Date.parse(v) || 0;
  const t = v as { toMillis?: () => number; seconds?: number };
  if (typeof t.toMillis === "function") return t.toMillis();
  if (typeof t.seconds === "number") return t.seconds * 1000;
  return 0;
};

/** Best-effort "YYYY-MM-DD" from date-only strings, ISO strings or Firestore Timestamps. */
const toDateStr = (v: unknown): string => {
  if (v == null || v === "") return "";
  if (typeof v === "string") return v.slice(0, 10);
  const ms = toMs(v);
  return ms ? new Date(ms).toISOString().slice(0, 10) : "";
};

/** Letter grade from a percentage — used when `results` docs carry no letter grade. */
const letterGrade = (pct: number): string => {
  if (pct >= 90) return "A+";
  if (pct >= 80) return "A";
  if (pct >= 70) return "B+";
  if (pct >= 60) return "B";
  if (pct >= 50) return "C+";
  if (pct >= 40) return "C";
  if (pct >= 35) return "D";
  return "F";
};

/** Newest date first (client-side replacement for `orderBy("date", "desc")`). */
const byDateDesc = (a: { date?: string; createdAt?: any }, b: { date?: string; createdAt?: any }) =>
  String(b.date ?? "").localeCompare(String(a.date ?? "")) || toMs(b.createdAt) - toMs(a.createdAt);

/** Does this doc belong to the given child? (class-wide docs have no student id field) */
const matchesChild = (raw: any, childId?: string): boolean => {
  if (!childId) return true;
  const sid = raw.studentId ?? raw.studentRoll ?? raw.rollNo;
  return sid == null || String(sid) === childId;
};

/* -------------------- CHILDREN HOOK -------------------- */
export function useParentChildren(parentId?: string) {
  return useQuery({
    queryKey: ["parent", "children", parentId],
    queryFn: async () => {
      let q: any = collection(db, "parent_children");
      if (parentId) q = query(q, where("parentId", "==", parentId));
      const snap = await getDocs(q);
      return snap.docs.map((d) => ({ id: d.id, ...(d.data() as any) })) as Child[];
    },
  });
}

/* Resolve a parent's children from the `students` collection by matching parentEmail. */
export function useParentChildrenByEmail(parentEmail?: string) {
  return useQuery({
    queryKey: ["parent", "children-by-email", parentEmail],
    queryFn: async () => {
      const snap = await getDocs(collection(db, "students"));
      const email = parentEmail?.trim().toLowerCase();
      return snap.docs
        .filter((d) => {
          const s = d.data() as any;
          return (
            email &&
            (String(s.parentEmail || "")
              .trim()
              .toLowerCase() === email ||
              String(s.email || "")
                .trim()
                .toLowerCase() === email)
          );
        })
        .map((d) => {
          const s = d.data() as any;
          return {
            id: s.studentId || d.id,
            name: s.name || "Student",
            email: s.email || "",
            course: s.courseName || s.className || "General",
            grade: s.grade || "",
            age: typeof s.age === "number" ? s.age : 0,
          } as Child;
        });
    },
    enabled: Boolean(parentEmail),
  });
}

/* -------------------- CHILD ATTENDANCE HOOK -------------------- */
export function useChildAttendance(childId?: string) {
  return useQuery({
    queryKey: ["parent", "attendance", childId],
    queryFn: async () => {
      // Portals read `student_attendance` but admin/teacher write `attendance` —
      // read BOTH and merge (dedupe by doc id). Index-free: single equality
      // `where` (no orderBy after where), sorted client-side.
      const constraints: any[] = [];
      if (childId) constraints.push(where("studentId", "==", childId));
      const [portalSnap, adminSnap] = await Promise.all([
        getDocs(query(collection(db, "student_attendance"), ...constraints)),
        getDocs(query(collection(db, "attendance"), ...constraints)),
      ]);
      const merged = new Map<string, ChildAttendance>();
      for (const snap of [portalSnap, adminSnap]) {
        for (const d of snap.docs) {
          const raw = d.data() as any;
          merged.set(d.id, {
            id: d.id,
            date: toDateStr(raw.date) || toDateStr(raw.createdAt),
            status: raw.status,
            courseName: raw.courseName ?? raw.subject ?? "",
          } as ChildAttendance);
        }
      }
      return [...merged.values()].sort(byDateDesc);
    },
  });
}

/* -------------------- CHILD GRADES HOOK -------------------- */
export function useChildGrades(childId?: string) {
  return useQuery({
    queryKey: ["parent", "grades", childId],
    queryFn: async () => {
      // Portals read `student_grades` but admin/teacher write `results` —
      // read BOTH and merge (dedupe by doc id). Index-free: single equality
      // `where` (no orderBy after where), sorted client-side.
      const constraints: any[] = [];
      if (childId) constraints.push(where("studentId", "==", childId));
      const [portalSnap, resultsSnap] = await Promise.all([
        getDocs(query(collection(db, "student_grades"), ...constraints)),
        getDocs(query(collection(db, "results"), ...constraints)),
      ]);
      const merged = new Map<string, ChildGrade>();
      for (const snap of [portalSnap, resultsSnap]) {
        for (const d of snap.docs) {
          const raw = d.data() as any;
          const marks = Number(raw.marks ?? raw.score) || 0;
          const totalMarks = Number(raw.totalMarks ?? raw.total) || 1;
          merged.set(d.id, {
            id: d.id,
            examName: raw.examName ?? raw.exam ?? raw.subject ?? "",
            courseName: raw.courseName ?? raw.subject ?? "",
            marks,
            totalMarks,
            grade: raw.grade || letterGrade((marks / totalMarks) * 100),
            date: toDateStr(raw.date) || toDateStr(raw.createdAt),
          } as ChildGrade);
        }
      }
      return [...merged.values()].sort(byDateDesc);
    },
  });
}

/* -------------------- CHILD FEES HOOK -------------------- */
export function useChildFees(childId?: string) {
  return useQuery({
    queryKey: ["parent", "fees", childId],
    queryFn: async () => {
      // Index-free: single equality `where` (no orderBy after where),
      // sorted client-side by createdAt (newest first).
      const constraints: any[] = [];
      if (childId) constraints.push(where("studentId", "==", childId));
      const snap = await getDocs(query(collection(db, "fee_invoices"), ...constraints));
      return snap.docs
        .map((d) => {
          const data = d.data() as any;
          return {
            id: d.id,
            invoiceNumber: data.invoiceNumber,
            amount: data.totalAmount,
            status: data.status,
            dueDate: data.dueDate,
            paidDate: data.paidDate,
            createdAt: data.createdAt ?? null,
          };
        })
        .sort((a, b) => toMs(b.createdAt) - toMs(a.createdAt)) as ChildFee[];
    },
  });
}

/* -------------------- CHILD ASSIGNMENTS HOOK -------------------- */
export function useChildAssignments(childId?: string) {
  return useQuery({
    queryKey: ["parent", "assignments", childId],
    queryFn: async () => {
      // Portals read `student_assignments` but admin writes `assignments` and
      // teachers write `homework` — read all three and merge (dedupe by doc id).
      // Index-free: no `where` — class-wide docs have NO student id field, so
      // identity filtering happens client-side (class-wide OR matches the child).
      const [legacySnap, adminSnap, homeworkSnap] = await Promise.all([
        getDocs(collection(db, "student_assignments")),
        getDocs(collection(db, "assignments")),
        getDocs(collection(db, "homework")),
      ]);

      const mapRow = (id: string, raw: any): ChildAssignment => {
        const s = String(raw.status ?? "")
          .toLowerCase()
          .trim();
        const status: ChildAssignment["status"] =
          s === "submitted" || s === "completed"
            ? "submitted"
            : s === "graded"
              ? "graded"
              : "pending";
        return {
          id,
          title: raw.title ?? raw.name ?? "",
          courseName: raw.courseName ?? raw.subject ?? "",
          dueDate: toDateStr(raw.dueDate),
          status,
          marks: raw.marks != null ? Number(raw.marks) : undefined,
          totalMarks: raw.totalMarks != null ? Number(raw.totalMarks) : undefined,
        } as ChildAssignment;
      };

      // Base rows first (admin/teacher), then per-student records: a submission
      // referencing a class-wide doc (via `assignmentId`) replaces that row.
      const merged = new Map<string, ChildAssignment>();
      for (const snap of [adminSnap, homeworkSnap]) {
        for (const d of snap.docs) {
          const raw = d.data() as any;
          if (!matchesChild(raw, childId)) continue;
          const row = mapRow(d.id, raw);
          merged.set(row.id, row);
        }
      }
      for (const d of legacySnap.docs) {
        const raw = d.data() as any;
        if (!matchesChild(raw, childId)) continue;
        const row = mapRow(d.id, raw);
        const key = raw.assignmentId ? String(raw.assignmentId) : row.id;
        merged.set(key, row);
      }

      return [...merged.values()].sort((a, b) =>
        String(a.dueDate ?? "").localeCompare(String(b.dueDate ?? "")),
      );
    },
  });
}
