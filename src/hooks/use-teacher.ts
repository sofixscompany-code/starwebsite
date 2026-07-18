import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import {
  collection, query, orderBy, getDocs, addDoc, updateDoc, deleteDoc,
  doc, serverTimestamp, where,
} from "firebase/firestore";
import { db } from "@/integrations/firebase/config";

/* -------------------- TYPES -------------------- */
export interface TeacherClass {
  id: string;
  teacherId: string;
  courseId: string;
  courseName: string;
  day: string;
  startTime: string;
  endTime: string;
  room: string;
  studentCount: number;
  type: "lecture" | "lab" | "tutorial";
  isActive: boolean;
  createdAt?: any;
}

export interface StudentProgress {
  id: string;
  studentId: string;
  studentName: string;
  courseId: string;
  courseName: string;
  attendanceRate: number;
  avgMarks: number;
  assignmentsCompleted: number;
  assignmentsTotal: number;
  lastActive: string;
  status: "excellent" | "good" | "needs_improvement" | "at_risk";
}

export interface ContentItem {
  id: string;
  teacherId: string;
  courseId: string;
  courseName: string;
  title: string;
  type: "video" | "notes" | "assignment" | "quiz" | "announcement";
  description: string;
  fileUrl: string;
  isPublished: boolean;
  createdAt?: any;
  updatedAt?: any;
}

/* -------------------- CLASSES HOOK -------------------- */
export function useTeacherClasses(teacherId?: string) {
  const queryClient = useQueryClient();

  const { data: classes = [], isLoading } = useQuery({
    queryKey: ["teacher", "classes", teacherId],
    queryFn: async () => {
      let q: any = collection(db, "teacher_classes");
      if (teacherId) {
        q = query(q, where("teacherId", "==", teacherId), orderBy("day", "asc"));
      } else {
        q = query(q, orderBy("day", "asc"));
      }
      const snap = await getDocs(q);
      return snap.docs.map((d) => ({ id: d.id, ...(d.data() as any) })) as TeacherClass[];
    },
  });

  const addClass = useMutation({
    mutationFn: async (cls: Omit<TeacherClass, "id">) => {
      const docRef = await addDoc(collection(db, "teacher_classes"), { ...cls, createdAt: serverTimestamp() });
      return docRef.id;
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["teacher", "classes"] }),
  });

  const updateClass = useMutation({
    mutationFn: async ({ id, ...data }: Partial<TeacherClass> & { id: string }) => {
      await updateDoc(doc(db, "teacher_classes", id), { ...data, updatedAt: serverTimestamp() });
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["teacher", "classes"] }),
  });

  const deleteClass = useMutation({
    mutationFn: async (id: string) => { await deleteDoc(doc(db, "teacher_classes", id)); },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["teacher", "classes"] }),
  });

  const getTodayClasses = () => {
    const today = new Date().toLocaleDateString("en-US", { weekday: "long" });
    return classes.filter((c) => c.day === today && c.isActive);
  };

  return { classes, isLoading, addClass, updateClass, deleteClass, getTodayClasses };
}

/* -------------------- STUDENT PROGRESS HOOK -------------------- */
export function useTeacherStudentProgress(teacherId?: string, courseId?: string) {
  const { data: students = [], isLoading } = useQuery({
    queryKey: ["teacher", "student-progress", teacherId, courseId],
    queryFn: async () => {
      let q: any = collection(db, "teacher_student_progress");
      const constraints: any[] = [];
      if (teacherId) constraints.push(where("teacherId", "==", teacherId));
      if (courseId) constraints.push(where("courseId", "==", courseId));
      if (constraints.length > 0) {
        q = query(q, ...constraints);
      }
      const snap = await getDocs(q);
      return snap.docs.map((d) => ({ id: d.id, ...(d.data() as any) })) as StudentProgress[];
    },
  });

  return { students, isLoading };
}

/* -------------------- CONTENT HOOK -------------------- */
export function useTeacherContent(teacherId?: string) {
  const queryClient = useQueryClient();

  const { data: content = [], isLoading } = useQuery({
    queryKey: ["teacher", "content", teacherId],
    queryFn: async () => {
      let q: any = collection(db, "teacher_content");
      if (teacherId) {
        q = query(q, where("teacherId", "==", teacherId), orderBy("createdAt", "desc"));
      } else {
        q = query(q, orderBy("createdAt", "desc"));
      }
      const snap = await getDocs(q);
      return snap.docs.map((d) => ({ id: d.id, ...(d.data() as any) })) as ContentItem[];
    },
  });

  const addContent = useMutation({
    mutationFn: async (item: Omit<ContentItem, "id">) => {
      const docRef = await addDoc(collection(db, "teacher_content"), { ...item, createdAt: serverTimestamp(), updatedAt: serverTimestamp() });
      return docRef.id;
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["teacher", "content"] }),
  });

  const updateContent = useMutation({
    mutationFn: async ({ id, ...data }: Partial<ContentItem> & { id: string }) => {
      await updateDoc(doc(db, "teacher_content", id), { ...data, updatedAt: serverTimestamp() });
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["teacher", "content"] }),
  });

  const deleteContent = useMutation({
    mutationFn: async (id: string) => { await deleteDoc(doc(db, "teacher_content", id)); },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["teacher", "content"] }),
  });

  return { content, isLoading, addContent, updateContent, deleteContent };
}

/* -------------------- TEACHER STATS -------------------- */
export function useTeacherStats(teacherId: string) {
  return useQuery({
    queryKey: ["teacher", "stats", teacherId],
    queryFn: async () => {
      const [classesSnap, contentSnap] = await Promise.all([
        getDocs(query(collection(db, "teacher_classes"), where("teacherId", "==", teacherId))),
        getDocs(query(collection(db, "teacher_content"), where("teacherId", "==", teacherId))),
      ]);

      const classes = classesSnap.docs.map((d) => d.data());
      const totalStudents = classes.reduce((s, c) => s + (c.studentCount || 0), 0);

      return {
        totalClasses: classes.length,
        activeClasses: classes.filter((c) => c.isActive).length,
        totalStudents,
        totalContent: contentSnap.size,
        publishedContent: contentSnap.docs.filter((d) => d.data().isPublished).length,
      };
    },
  });
}



