import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import {
  collection, query, orderBy, getDocs, addDoc, updateDoc, deleteDoc,
  doc, serverTimestamp, where,
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

/* -------------------- ATTENDANCE HOOK -------------------- */
export function useStudentAttendance(studentId?: string) {
  const queryClient = useQueryClient();

  const { data: attendance = [], isLoading } = useQuery({
    queryKey: ["student", "attendance", studentId],
    queryFn: async () => {
      let q: any = collection(db, "student_attendance");
      if (studentId) {
        q = query(q, where("studentId", "==", studentId), orderBy("date", "desc"));
      } else {
        q = query(q, orderBy("date", "desc"));
      }
      const snap = await getDocs(q);
      return snap.docs.map((d) => ({ id: d.id, ...(d.data() as any) })) as Attendance[];
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
      let q: any = collection(db, "student_grades");
      if (studentId) {
        q = query(q, where("studentId", "==", studentId), orderBy("date", "desc"));
      } else {
        q = query(q, orderBy("date", "desc"));
      }
      const snap = await getDocs(q);
      return snap.docs.map((d) => ({ id: d.id, ...(d.data() as any) })) as Grade[];
    },
  });

  const getGPA = () => {
    if (grades.length === 0) return 0;
    const gradePoints: Record<string, number> = { "A+": 4.0, "A": 3.7, "B+": 3.3, "B": 3.0, "C+": 2.7, "C": 2.0, "D": 1.0, "F": 0 };
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
      let q: any = collection(db, "student_schedule");
      if (courseIds && courseIds.length > 0) {
        q = query(q, where("courseId", "in", courseIds), orderBy("day", "asc"));
      } else {
        q = query(q, orderBy("day", "asc"));
      }
      const snap = await getDocs(q);
      return snap.docs.map((d) => ({ id: d.id, ...(d.data() as any) })) as Schedule[];
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
      let q: any = collection(db, "student_assignments");
      const constraints: any[] = [];
      if (courseId) constraints.push(where("courseId", "==", courseId));
      if (constraints.length > 0) {
        q = query(q, ...constraints, orderBy("dueDate", "asc"));
      } else {
        q = query(q, orderBy("dueDate", "asc"));
      }
      const snap = await getDocs(q);
      return snap.docs.map((d) => ({ id: d.id, ...(d.data() as any) })) as Assignment[];
    },
  });

  const submitAssignment = useMutation({
    mutationFn: async ({ id, ...data }: { id: string; submittedAt: any; status: string }) => {
      await updateDoc(doc(db, "student_assignments", id), {
        ...data,
        updatedAt: serverTimestamp(),
      });
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["student", "assignments"] }),
  });

  const getPendingCount = () => assignments.filter((a) => a.status === "pending").length;
  const getOverdueCount = () => assignments.filter((a) => a.status === "pending" && new Date(a.dueDate) < new Date()).length;

  return { assignments, isLoading, submitAssignment, getPendingCount, getOverdueCount };
}

/* -------------------- STUDENT DASHBOARD STATS -------------------- */
export function useStudentStats(studentId: string) {
  return useQuery({
    queryKey: ["student", "stats", studentId],
    queryFn: async () => {
      const [attendanceSnap, gradesSnap, assignmentsSnap] = await Promise.all([
        getDocs(query(collection(db, "student_attendance"), where("studentId", "==", studentId))),
        getDocs(query(collection(db, "student_grades"), where("studentId", "==", studentId))),
        getDocs(query(collection(db, "student_assignments"))),
      ]);

      const attendance = attendanceSnap.docs.map((d) => d.data());
      const grades = gradesSnap.docs.map((d) => d.data());
      const assignments = assignmentsSnap.docs.map((d) => d.data());

      const present = attendance.filter((a) => a.status === "present").length;
      const total = attendance.length || 1;
      const avgMarks = grades.length > 0 ? grades.reduce((s, g) => s + (g.marks / g.totalMarks) * 100, 0) / grades.length : 0;

      return {
        attendanceRate: Math.round((present / total) * 100),
        totalClasses: attendance.length,
        avgMarks: Math.round(avgMarks),
        totalGrades: grades.length,
        pendingAssignments: assignments.filter((a) => a.status === "pending").length,
        completedAssignments: assignments.filter((a) => a.status === "submitted" || a.status === "graded").length,
      };
    },
  });
}



