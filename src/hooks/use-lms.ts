import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import {
  collection, query, orderBy, getDocs, addDoc, updateDoc, deleteDoc,
  doc, writeBatch, serverTimestamp, where, limit,
} from "firebase/firestore";
import { db } from "@/integrations/firebase/config";

/* -------------------- TYPES -------------------- */
export interface Course {
  id: string;
  title: string;
  slug: string;
  description: string;
  shortDescription: string;
  imageUrl: string;
  category: string;
  level: "beginner" | "intermediate" | "advanced";
  duration: string;
  price: number;
  discountPrice: number;
  totalLessons: number;
  totalStudents: number;
  rating: number;
  instructor: string;
  instructorAvatar: string;
  tags: string[];
  isPublished: boolean;
  isActive: boolean;
  order: number;
  createdAt?: any;
  updatedAt?: any;
}

export interface Lesson {
  id: string;
  courseId: string;
  title: string;
  description: string;
  videoUrl: string;
  documentUrl: string;
  duration: string;
  order: number;
  isPublished: boolean;
  isFree: boolean;
  createdAt?: any;
  updatedAt?: any;
}

export interface Quiz {
  id: string;
  courseId: string;
  title: string;
  description: string;
  timeLimit: number;
  passingScore: number;
  totalQuestions: number;
  questions: QuizQuestion[];
  isPublished: boolean;
  createdAt?: any;
  updatedAt?: any;
}

export interface QuizQuestion {
  id: string;
  question: string;
  type: "mcq" | "true_false" | "fill_blank";
  options: string[];
  correctAnswer: string;
  points: number;
}

export interface Enrollment {
  id: string;
  studentId: string;
  studentName: string;
  studentEmail: string;
  courseId: string;
  courseName: string;
  progress: number;
  completedLessons: string[];
  enrolledAt: any;
  completedAt?: any;
  status: "active" | "completed" | "dropped";
}

export interface QuizAttempt {
  id: string;
  studentId: string;
  studentName: string;
  quizId: string;
  quizTitle: string;
  courseId: string;
  score: number;
  totalPoints: number;
  answers: Record<string, string>;
  startedAt: any;
  completedAt: any;
}

/* -------------------- COURSES HOOK -------------------- */
export function useCourses() {
  const queryClient = useQueryClient();

  const { data: courses = [], isLoading } = useQuery({
    queryKey: ["lms", "courses"],
    queryFn: async () => {
      const snap = await getDocs(
        query(collection(db, "lms_courses"), orderBy("order", "asc"))
      );
      return snap.docs.map((d) => ({ id: d.id, ...(d.data() as any) })) as Course[];
    },
  });

  const addCourse = useMutation({
    mutationFn: async (course: Omit<Course, "id">) => {
      const docRef = await addDoc(collection(db, "lms_courses"), {
        ...course,
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp(),
      });
      return docRef.id;
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["lms", "courses"] }),
  });

  const updateCourse = useMutation({
    mutationFn: async ({ id, ...data }: Partial<Course> & { id: string }) => {
      await updateDoc(doc(db, "lms_courses", id), {
        ...data,
        updatedAt: serverTimestamp(),
      });
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["lms", "courses"] }),
  });

  const deleteCourse = useMutation({
    mutationFn: async (id: string) => {
      await deleteDoc(doc(db, "lms_courses", id));
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["lms", "courses"] }),
  });

  return { courses, isLoading, addCourse, updateCourse, deleteCourse };
}

/* -------------------- LESSONS HOOK -------------------- */
export function useLessons(courseId?: string) {
  const queryClient = useQueryClient();

  const { data: lessons = [], isLoading } = useQuery({
    queryKey: ["lms", "lessons", courseId],
    queryFn: async () => {
      let q = query(collection(db, "lms_lessons"), orderBy("order", "asc"));
      if (courseId) {
        q = query(collection(db, "lms_lessons"), where("courseId", "==", courseId), orderBy("order", "asc"));
      }
      const snap = await getDocs(q);
      return snap.docs.map((d) => ({ id: d.id, ...(d.data() as any) })) as Lesson[];
    },
  });

  const addLesson = useMutation({
    mutationFn: async (lesson: Omit<Lesson, "id">) => {
      const docRef = await addDoc(collection(db, "lms_lessons"), {
        ...lesson,
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp(),
      });
      return docRef.id;
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["lms", "lessons"] }),
  });

  const updateLesson = useMutation({
    mutationFn: async ({ id, ...data }: Partial<Lesson> & { id: string }) => {
      await updateDoc(doc(db, "lms_lessons", id), {
        ...data,
        updatedAt: serverTimestamp(),
      });
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["lms", "lessons"] }),
  });

  const deleteLesson = useMutation({
    mutationFn: async (id: string) => {
      await deleteDoc(doc(db, "lms_lessons", id));
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["lms", "lessons"] }),
  });

  return { lessons, isLoading, addLesson, updateLesson, deleteLesson };
}

/* -------------------- QUIZZES HOOK -------------------- */
export function useQuizzes(courseId?: string) {
  const queryClient = useQueryClient();

  const { data: quizzes = [], isLoading } = useQuery({
    queryKey: ["lms", "quizzes", courseId],
    queryFn: async () => {
      let q = query(collection(db, "lms_quizzes"), orderBy("createdAt", "desc"));
      if (courseId) {
        q = query(collection(db, "lms_quizzes"), where("courseId", "==", courseId), orderBy("createdAt", "desc"));
      }
      const snap = await getDocs(q);
      return snap.docs.map((d) => ({ id: d.id, ...(d.data() as any) })) as Quiz[];
    },
  });

  const addQuiz = useMutation({
    mutationFn: async (quiz: Omit<Quiz, "id">) => {
      const docRef = await addDoc(collection(db, "lms_quizzes"), {
        ...quiz,
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp(),
      });
      return docRef.id;
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["lms", "quizzes"] }),
  });

  const updateQuiz = useMutation({
    mutationFn: async ({ id, ...data }: Partial<Quiz> & { id: string }) => {
      await updateDoc(doc(db, "lms_quizzes", id), {
        ...data,
        updatedAt: serverTimestamp(),
      });
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["lms", "quizzes"] }),
  });

  const deleteQuiz = useMutation({
    mutationFn: async (id: string) => {
      await deleteDoc(doc(db, "lms_quizzes", id));
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["lms", "quizzes"] }),
  });

  return { quizzes, isLoading, addQuiz, updateQuiz, deleteQuiz };
}

/* -------------------- ENROLLMENTS HOOK -------------------- */
export function useEnrollments(studentId?: string, courseId?: string) {
  const queryClient = useQueryClient();

  const { data: enrollments = [], isLoading } = useQuery({
    queryKey: ["lms", "enrollments", studentId, courseId],
    queryFn: async () => {
      let q: any = collection(db, "lms_enrollments");
      const constraints: any[] = [];
      if (studentId) constraints.push(where("studentId", "==", studentId));
      if (courseId) constraints.push(where("courseId", "==", courseId));
      if (constraints.length > 0) {
        q = query(q, ...constraints, orderBy("enrolledAt", "desc"));
      } else {
        q = query(q, orderBy("enrolledAt", "desc"));
      }
      const snap = await getDocs(q);
      return snap.docs.map((d) => ({ id: d.id, ...(d.data() as any) })) as Enrollment[];
    },
  });

  const enrollStudent = useMutation({
    mutationFn: async (enrollment: Omit<Enrollment, "id">) => {
      const docRef = await addDoc(collection(db, "lms_enrollments"), {
        ...enrollment,
        enrolledAt: serverTimestamp(),
      });
      return docRef.id;
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["lms", "enrollments"] }),
  });

  const updateEnrollment = useMutation({
    mutationFn: async ({ id, ...data }: Partial<Enrollment> & { id: string }) => {
      await updateDoc(doc(db, "lms_enrollments", id), {
        ...data,
        updatedAt: serverTimestamp(),
      });
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["lms", "enrollments"] }),
  });

  return { enrollments, isLoading, enrollStudent, updateEnrollment };
}

/* -------------------- QUIZ ATTEMPTS HOOK -------------------- */
export function useQuizAttempts(quizId?: string, studentId?: string) {
  const queryClient = useQueryClient();

  const { data: attempts = [], isLoading } = useQuery({
    queryKey: ["lms", "quiz-attempts", quizId, studentId],
    queryFn: async () => {
      let q: any = collection(db, "lms_quiz_attempts");
      const constraints: any[] = [];
      if (quizId) constraints.push(where("quizId", "==", quizId));
      if (studentId) constraints.push(where("studentId", "==", studentId));
      if (constraints.length > 0) {
        q = query(q, ...constraints, orderBy("completedAt", "desc"));
      } else {
        q = query(q, orderBy("completedAt", "desc"));
      }
      const snap = await getDocs(q);
      return snap.docs.map((d) => ({ id: d.id, ...(d.data() as any) })) as QuizAttempt[];
    },
  });

  const submitAttempt = useMutation({
    mutationFn: async (attempt: Omit<QuizAttempt, "id">) => {
      const docRef = await addDoc(collection(db, "lms_quiz_attempts"), {
        ...attempt,
        completedAt: serverTimestamp(),
      });
      return docRef.id;
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["lms", "quiz-attempts"] }),
  });

  return { attempts, isLoading, submitAttempt };
}

/* -------------------- LMS STATS HOOK -------------------- */
export function useLmsStats() {
  return useQuery({
    queryKey: ["lms", "stats"],
    queryFn: async () => {
      const [coursesSnap, enrollmentsSnap, lessonsSnap, quizzesSnap] = await Promise.all([
        getDocs(collection(db, "lms_courses")),
        getDocs(collection(db, "lms_enrollments")),
        getDocs(collection(db, "lms_lessons")),
        getDocs(collection(db, "lms_quizzes")),
      ]);
      return {
        totalCourses: coursesSnap.size,
        totalEnrollments: enrollmentsSnap.size,
        totalLessons: lessonsSnap.size,
        totalQuizzes: quizzesSnap.size,
        activeEnrollments: enrollmentsSnap.docs.filter((d) => d.data().status === "active").length,
        completedEnrollments: enrollmentsSnap.docs.filter((d) => d.data().status === "completed").length,
      };
    },
  });
}



