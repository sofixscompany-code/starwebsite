import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import {
  collection,
  query,
  getDocs,
  addDoc,
  updateDoc,
  doc,
  serverTimestamp,
  where,
} from "firebase/firestore";
import { db } from "@/integrations/firebase/config";

/* -------------------- TYPES -------------------- */
export interface Attendance {
  id: string;
  studentId: string;
  studentName: string;
  courseId: string;
  courseName: string;
  date: string;
  status: "present" | "absent" | "late" | "excused";
  markedBy: string;
  createdAt?: any;
}

export interface Grade {
  id: string;
  studentId: string;
  studentName: string;
  courseId: string;
  courseName: string;
  examName: string;
  marks: number;
  totalMarks: number;
  grade: string;
  remarks: string;
  date: string;
  createdAt?: any;
}

export interface Schedule {
  id: string;
  courseId: string;
  courseName: string;
  day: string;
  startTime: string;
  endTime: string;
  room: string;
  teacher: string;
  type: "lecture" | "lab" | "tutorial" | "exam";
  isActive: boolean;
  createdAt?: any;
}

export interface Assignment {
  id: string;
  courseId: string;
  courseName: string;
  title: string;
  description: string;
  dueDate: string;
  totalMarks: number;
  status: "pending" | "submitted" | "graded" | "late";
  submittedAt?: any;
  marks?: number;
  feedback?: string;
  attachments: string[];
  createdAt?: any;
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

/** Tolerant mapping — works for both `student_*` and admin/teacher (`attendance`, `results`, …) schemas. */
function mapAttendanceDoc(id: string, raw: any): Attendance {
  return {
    id,
    studentId: String(raw.studentId ?? raw.studentRoll ?? raw.rollNo ?? ""),
    studentName: raw.studentName ?? "",
    courseId: raw.courseId ?? "",
    courseName: raw.courseName ?? raw.subject ?? "",
    date: toDateStr(raw.date) || toDateStr(raw.createdAt),
    status: raw.status,
    markedBy: raw.markedBy ?? "",
    createdAt: raw.createdAt ?? null,
  } as Attendance;
}

function mapGradeDoc(id: string, raw: any): Grade {
  const marks = Number(raw.marks ?? raw.score) || 0;
  const totalMarks = Number(raw.totalMarks ?? raw.total) || 1;
  return {
    id,
    studentId: String(raw.studentId ?? raw.studentRoll ?? raw.rollNo ?? ""),
    studentName: raw.studentName ?? "",
    courseId: raw.courseId ?? "",
    courseName: raw.courseName ?? raw.subject ?? "",
    examName: raw.examName ?? raw.exam ?? raw.subject ?? "",
    marks,
    totalMarks,
    grade: raw.grade || letterGrade((marks / totalMarks) * 100),
    remarks: raw.remarks ?? "",
    date: toDateStr(raw.date) || toDateStr(raw.createdAt),
    createdAt: raw.createdAt ?? null,
  } as Grade;
}

/** Normalizes "Active"/"Overdue"/"Completed"/"pending"/… into the Assignment union. */
function normalizeAssignmentStatus(v: unknown): Assignment["status"] {
  const s = String(v ?? "")
    .toLowerCase()
    .trim();
  if (s === "submitted" || s === "completed") return "submitted";
  if (s === "graded") return "graded";
  if (s === "late" || s === "overdue") return "late";
  return "pending";
}

function mapAssignmentDoc(id: string, raw: any): Assignment {
  return {
    id,
    courseId: raw.courseId ?? "",
    courseName: raw.courseName ?? raw.subject ?? "",
    title: raw.title ?? raw.name ?? "",
    description: raw.description ?? "",
    dueDate: toDateStr(raw.dueDate),
    totalMarks: Number(raw.totalMarks) || 0,
    status: normalizeAssignmentStatus(raw.status),
    submittedAt: raw.submittedAt ?? undefined,
    marks: raw.marks != null ? Number(raw.marks) : undefined,
    feedback: raw.feedback ?? "",
    attachments: raw.attachments ?? [],
    createdAt: raw.createdAt ?? null,
  } as Assignment;
}

/** Which collection each merged assignment row came from (drives `submitAssignment`). */
type AssignmentSource = { collection: string; raw: any; classWide: boolean };
const assignmentSources = new Map<string, AssignmentSource>();

/* -------------------- ATTENDANCE HOOK -------------------- */
export function useStudentAttendance(studentId?: string) {
  const queryClient = useQueryClient();

  const { data: attendance = [], isLoading } = useQuery({
    queryKey: ["student", "attendance", studentId],
    queryFn: async () => {
      // Portals used to read `student_attendance` while admin/teacher write `attendance`.
      // Index-free: single equality `where` (no orderBy after where) — sorted client-side.
      const constraints: any[] = [];
      if (studentId) constraints.push(where("studentId", "==", studentId));
      const [portalSnap, adminSnap] = await Promise.all([
        getDocs(query(collection(db, "student_attendance"), ...constraints)),
        getDocs(query(collection(db, "attendance"), ...constraints)),
      ]);
      const merged = new Map<string, Attendance>();
      for (const d of portalSnap.docs) {
        const row = mapAttendanceDoc(d.id, d.data());
        merged.set(row.id, row);
      }
      for (const d of adminSnap.docs) {
        const row = mapAttendanceDoc(d.id, d.data());
        merged.set(row.id, row);
      }
      return [...merged.values()].sort(byDateDesc);
    },
  });

  const markAttendance = useMutation({
    mutationFn: async (record: Omit<Attendance, "id">) => {
      const docRef = await addDoc(collection(db, "student_attendance"), {
        ...record,
        createdAt: serverTimestamp(),
      });
      return docRef.id;
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["student", "attendance"] }),
  });

  return { attendance, isLoading, markAttendance };
}

/* -------------------- GRADES HOOK -------------------- */
export function useStudentGrades(studentId?: string) {
  const { data: grades = [], isLoading } = useQuery({
    queryKey: ["student", "grades", studentId],
    queryFn: async () => {
      // Portals used to read `student_grades` while admin/teacher write `results`.
      // Index-free: single equality `where` (no orderBy after where) — sorted client-side.
      const constraints: any[] = [];
      if (studentId) constraints.push(where("studentId", "==", studentId));
      const [portalSnap, resultsSnap] = await Promise.all([
        getDocs(query(collection(db, "student_grades"), ...constraints)),
        getDocs(query(collection(db, "results"), ...constraints)),
      ]);
      const merged = new Map<string, Grade>();
      for (const d of portalSnap.docs) {
        const row = mapGradeDoc(d.id, d.data());
        merged.set(row.id, row);
      }
      for (const d of resultsSnap.docs) {
        const row = mapGradeDoc(d.id, d.data());
        merged.set(row.id, row);
      }
      return [...merged.values()].sort(byDateDesc);
    },
  });

  const getGPA = () => {
    if (grades.length === 0) return 0;
    const gradePoints: Record<string, number> = {
      "A+": 4.0,
      A: 3.7,
      "B+": 3.3,
      B: 3.0,
      "C+": 2.7,
      C: 2.0,
      D: 1.0,
      F: 0,
    };
    const total = grades.reduce((sum, g) => sum + (gradePoints[g.grade] ?? 0), 0);
    return Math.round((total / grades.length) * 100) / 100;
  };

  return { grades, isLoading, getGPA };
}

/* -------------------- SCHEDULE HOOK -------------------- */
export function useStudentSchedule(courseIds?: string[]) {
  const { data: schedule = [], isLoading } = useQuery({
    queryKey: ["student", "schedule", courseIds],
    queryFn: async () => {
      // Index-free: at most one equality `where` (no orderBy after where).
      const constraints: any[] = [];
      if (courseIds && courseIds.length > 0) constraints.push(where("courseId", "in", courseIds));
      const snap = await getDocs(query(collection(db, "student_schedule"), ...constraints));
      return snap.docs
        .map((d) => ({ id: d.id, ...(d.data() as any) }) as Schedule)
        .sort((a, b) => String(a.day ?? "").localeCompare(String(b.day ?? "")));
    },
  });

  const getTodaySchedule = () => {
    const today = new Date().toLocaleDateString("en-US", { weekday: "long" });
    return schedule.filter((s) => s.day === today && s.isActive);
  };

  return { schedule, isLoading, getTodaySchedule };
}

/* -------------------- ASSIGNMENTS HOOK -------------------- */
export function useStudentAssignments(studentId?: string, courseId?: string) {
  const queryClient = useQueryClient();

  const { data: assignments = [], isLoading } = useQuery({
    queryKey: ["student", "assignments", studentId, courseId],
    queryFn: async () => {
      // Portals used to read `student_assignments` while admin writes `assignments`
      // and teachers write `homework`. Read all three and merge (dedupe by doc id).
      // Index-free: no `where` here — identity + class-wide filtering is client-side
      // (class-wide docs have NO studentId field, so they can't be matched with `where`).
      const [legacySnap, adminSnap, homeworkSnap] = await Promise.all([
        getDocs(collection(db, "student_assignments")),
        getDocs(collection(db, "assignments")),
        getDocs(collection(db, "homework")),
      ]);

      const matches = (raw: any) => {
        if (!studentId) return true;
        const sid = raw.studentId ?? raw.studentRoll ?? raw.rollNo;
        // class-wide (no student id field) OR assigned to this student
        return sid == null || String(sid) === studentId;
      };

      const merged = new Map<string, Assignment>();
      assignmentSources.clear();

      // Pass 1: admin `assignments` + teacher `homework` (base rows, often class-wide).
      for (const [col, snap] of [
        ["assignments", adminSnap],
        ["homework", homeworkSnap],
      ] as const) {
        for (const d of snap.docs) {
          const raw = d.data() as any;
          if (!matches(raw)) continue;
          const row = mapAssignmentDoc(d.id, raw);
          if (courseId && row.courseId !== courseId) continue;
          const sid = raw.studentId ?? raw.studentRoll ?? raw.rollNo;
          merged.set(row.id, row);
          assignmentSources.set(row.id, { collection: col, raw, classWide: sid == null });
        }
      }

      // Pass 2: `student_assignments` — a per-student submission referencing a class-wide
      // doc (via `assignmentId`) replaces that doc's row so its status shows correctly.
      for (const d of legacySnap.docs) {
        const raw = d.data() as any;
        if (!matches(raw)) continue;
        const row = mapAssignmentDoc(d.id, raw);
        if (courseId && row.courseId !== courseId) continue;
        const key = raw.assignmentId ? String(raw.assignmentId) : row.id;
        merged.set(key, row);
        assignmentSources.set(key, {
          collection: "student_assignments",
          raw,
          classWide: false,
        });
      }

      return [...merged.values()].sort((a, b) =>
        String(a.dueDate ?? "").localeCompare(String(b.dueDate ?? "")),
      );
    },
  });

  const submitAssignment = useMutation({
    mutationFn: async ({ id, ...data }: { id: string; submittedAt: any; status: string }) => {
      const src = assignmentSources.get(id);
      if (src && src.classWide && studentId) {
        // Class-wide assignment: record this student's submission as its own doc
        // instead of mutating the shared assignment for every student.
        await addDoc(collection(db, "student_assignments"), {
          assignmentId: id,
          studentId,
          courseId: src.raw.courseId ?? "",
          courseName: src.raw.courseName ?? src.raw.subject ?? "",
          title: src.raw.title ?? src.raw.name ?? "",
          description: src.raw.description ?? "",
          dueDate: src.raw.dueDate ?? "",
          totalMarks: src.raw.totalMarks ?? 0,
          ...data,
          createdAt: new Date().toISOString(),
        });
      } else {
        await updateDoc(doc(db, src?.collection ?? "student_assignments", id), {
          ...data,
          updatedAt: serverTimestamp(),
        });
      }
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["student", "assignments"] }),
  });

  const getPendingCount = () => assignments.filter((a) => a.status === "pending").length;
  const getOverdueCount = () =>
    assignments.filter((a) => a.status === "pending" && new Date(a.dueDate) < new Date()).length;

  return { assignments, isLoading, submitAssignment, getPendingCount, getOverdueCount };
}

/* -------------------- STUDENT DASHBOARD STATS -------------------- */
export function useStudentStats(studentId: string) {
  return useQuery({
    queryKey: ["student", "stats", studentId],
    queryFn: async () => {
      // Same merged sources as the hooks above; identity stays a server-side
      // equality `where` (no orderBy after where), aggregation happens client-side.
      const [
        portalAttSnap,
        adminAttSnap,
        portalGradesSnap,
        resultsSnap,
        legacyAssignSnap,
        adminAssignSnap,
        homeworkSnap,
      ] = await Promise.all([
        getDocs(query(collection(db, "student_attendance"), where("studentId", "==", studentId))),
        getDocs(query(collection(db, "attendance"), where("studentId", "==", studentId))),
        getDocs(query(collection(db, "student_grades"), where("studentId", "==", studentId))),
        getDocs(query(collection(db, "results"), where("studentId", "==", studentId))),
        getDocs(query(collection(db, "student_assignments"), where("studentId", "==", studentId))),
        getDocs(collection(db, "assignments")),
        getDocs(collection(db, "homework")),
      ]);

      // Attendance (dedupe by doc id across both collections).
      const attIds = new Set<string>();
      const attRows: any[] = [];
      for (const snap of [portalAttSnap, adminAttSnap]) {
        for (const d of snap.docs) {
          if (attIds.has(d.id)) continue;
          attIds.add(d.id);
          attRows.push(d.data());
        }
      }
      const present = attRows.filter((a) => a.status === "present").length;
      const total = attRows.length || 1;

      // Grades/results merged — percentages computed over the merged data.
      const gradeIds = new Set<string>();
      const gradeRows: Grade[] = [];
      for (const snap of [portalGradesSnap, resultsSnap]) {
        for (const d of snap.docs) {
          if (gradeIds.has(d.id)) continue;
          gradeIds.add(d.id);
          gradeRows.push(mapGradeDoc(d.id, d.data()));
        }
      }
      const avgMarks =
        gradeRows.length > 0
          ? gradeRows.reduce((s, g) => s + (g.marks / g.totalMarks) * 100, 0) / gradeRows.length
          : 0;

      // Assignments: class-wide docs (no studentId) + this student's own docs.
      // A per-student submission referencing a class-wide doc (via `assignmentId`)
      // replaces it, mirroring `useStudentAssignments`.
      const matches = (raw: any) => {
        const sid = raw.studentId ?? raw.studentRoll ?? raw.rollNo;
        return sid == null || String(sid) === studentId;
      };
      const assignRows = new Map<string, Assignment>();
      for (const snap of [adminAssignSnap, homeworkSnap]) {
        for (const d of snap.docs) {
          const raw = d.data() as any;
          if (!matches(raw)) continue;
          const row = mapAssignmentDoc(d.id, raw);
          assignRows.set(row.id, row);
        }
      }
      for (const d of legacyAssignSnap.docs) {
        const raw = d.data() as any;
        if (!matches(raw)) continue;
        const row = mapAssignmentDoc(d.id, raw);
        const key = raw.assignmentId ? String(raw.assignmentId) : row.id;
        assignRows.set(key, row);
      }
      const assignments = [...assignRows.values()];

      return {
        attendanceRate: Math.round((present / total) * 100),
        totalClasses: attRows.length,
        avgMarks: Math.round(avgMarks),
        totalGrades: gradeRows.length,
        pendingAssignments: assignments.filter((a) => a.status === "pending").length,
        completedAssignments: assignments.filter(
          (a) => a.status === "submitted" || a.status === "graded",
        ).length,
      };
    },
  });
}
