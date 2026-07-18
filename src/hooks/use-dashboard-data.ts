import { useQuery } from "@tanstack/react-query";
import { collection, query, where, orderBy, limit, getDocs, Timestamp } from "firebase/firestore";
import { db } from "@/integrations/firebase/config";

export function useDashboardStats() {
  return useQuery({
    queryKey: ["dashboard-stats"],
    queryFn: async () => {
      const [studentsSnap, teachersSnap, coursesSnap, admissionsSnap, noticesSnap] = await Promise.all([
        getDocs(collection(db, "students")),
        getDocs(collection(db, "teachers")),
        getDocs(query(collection(db, "courses"), where("isActive", "==", true))),
        getDocs(query(collection(db, "admissions"), orderBy("createdAt", "desc"), limit(5))),
        getDocs(query(collection(db, "notices"), where("isPublished", "==", true), orderBy("publishedAt", "desc"), limit(5))),
      ]);

      const admissions = admissionsSnap.docs.map((d) => ({ id: d.id, ...d.data() }));
      const notices = noticesSnap.docs.map((d) => ({ id: d.id, ...d.data() }));

      return {
        totalStudents: studentsSnap.size,
        totalTeachers: teachersSnap.size,
        activeCourses: coursesSnap.size,
        recentAdmissions: admissions,
        latestNotices: notices,
      };
    },
  });
}

export function useRecentAdmissions(limitCount = 5) {
  return useQuery({
    queryKey: ["recent-admissions", limitCount],
    queryFn: async () => {
      const snap = await getDocs(query(collection(db, "admissions"), orderBy("createdAt", "desc"), limit(limitCount)));
      return snap.docs.map((d) => ({ id: d.id, ...d.data() }));
    },
  });
}

export function useLatestNotices(limitCount = 5) {
  return useQuery({
    queryKey: ["latest-notices", limitCount],
    queryFn: async () => {
      const snap = await getDocs(
        query(collection(db, "notices"), where("isPublished", "==", true), orderBy("publishedAt", "desc"), limit(limitCount))
      );
      return snap.docs.map((d) => ({ id: d.id, ...d.data() }));
    },
  });
}

export function useUpcomingExams(limitCount = 5) {
  return useQuery({
    queryKey: ["upcoming-exams", limitCount],
    queryFn: async () => {
      const now = Timestamp.now();
      const snap = await getDocs(
        query(collection(db, "exams"), where("scheduledAt", ">=", now), orderBy("scheduledAt", "asc"), limit(limitCount))
      );
      return snap.docs.map((d) => ({ id: d.id, ...d.data() }));
    },
  });
}

export function useTeacherDashboard(teacherId?: string) {
  return useQuery({
    queryKey: ["teacher-dashboard", teacherId],
    queryFn: async () => {
      if (!teacherId) {
        return { classes: [], homework: [], exams: [], notices: [] };
      }
      const [classesSnap, homeworkSnap, examsSnap, noticesSnap] = await Promise.all([
        getDocs(query(collection(db, "classes"), where("teacherId", "==", teacherId), orderBy("startTime", "asc"))),
        getDocs(query(collection(db, "homework"), where("teacherId", "==", teacherId), orderBy("createdAt", "desc"), limit(5))),
        getDocs(query(collection(db, "exams"), where("teacherId", "==", teacherId), orderBy("scheduledAt", "asc"), limit(5))),
        getDocs(query(collection(db, "notices"), where("isPublished", "==", true), orderBy("publishedAt", "desc"), limit(3))),
      ]);

      return {
        classes: classesSnap.docs.map((d) => ({ id: d.id, ...d.data() })),
        homework: homeworkSnap.docs.map((d) => ({ id: d.id, ...d.data() })),
        exams: examsSnap.docs.map((d) => ({ id: d.id, ...d.data() })),
        notices: noticesSnap.docs.map((d) => ({ id: d.id, ...d.data() })),
      };
    },
    enabled: !!teacherId,
    initialData: { classes: [], homework: [], exams: [], notices: [] },
  });
}

export function useStudentDashboard(studentId?: string) {
  return useQuery({
    queryKey: ["student-dashboard", studentId],
    queryFn: async () => {
      if (!studentId) {
        return {
          enrollments: [],
          homework: [],
          results: [],
          notices: [],
          attendancePercent: 0,
        };
      }
      const [enrollmentsSnap, homeworkSnap, resultsSnap, noticesSnap, attendanceSnap] = await Promise.all([
        getDocs(query(collection(db, "enrollments"), where("studentId", "==", studentId))),
        getDocs(query(collection(db, "homework"), where("studentId", "==", studentId), orderBy("dueDate", "asc"), limit(5))),
        getDocs(query(collection(db, "results"), where("studentId", "==", studentId), orderBy("createdAt", "desc"), limit(5))),
        getDocs(query(collection(db, "notices"), where("isPublished", "==", true), orderBy("publishedAt", "desc"), limit(3))),
        getDocs(query(collection(db, "attendance"), where("studentId", "==", studentId))),
      ]);

      const attendance = attendanceSnap.docs.map((d) => d.data());
      const present = attendance.filter((a: any) => a.status === "present").length;
      const total = attendance.length || 1;

      return {
        enrollments: enrollmentsSnap.docs.map((d) => ({ id: d.id, ...d.data() })),
        homework: homeworkSnap.docs.map((d) => ({ id: d.id, ...d.data() })),
        results: resultsSnap.docs.map((d) => ({ id: d.id, ...d.data() })),
        notices: noticesSnap.docs.map((d) => ({ id: d.id, ...d.data() })),
        attendancePercent: Math.round((present / total) * 100),
      };
    },
    enabled: !!studentId,
    initialData: {
      enrollments: [],
      homework: [],
      results: [],
      notices: [],
      attendancePercent: 0,
    },
  });
}

export function useAccountantDashboard() {
  return useQuery({
    queryKey: ["accountant-dashboard"],
    queryFn: async () => {
      const [paymentsSnap, pendingSnap, expensesSnap] = await Promise.all([
        getDocs(query(collection(db, "payments"), orderBy("createdAt", "desc"), limit(5))),
        getDocs(query(collection(db, "fees"), where("status", "==", "pending"), orderBy("dueDate", "asc"), limit(5))),
        getDocs(query(collection(db, "expenses"), orderBy("createdAt", "desc"), limit(5))),
      ]);

      return {
        payments: paymentsSnap.docs.map((d) => ({ id: d.id, ...d.data() })),
        pendingFees: pendingSnap.docs.map((d) => ({ id: d.id, ...d.data() })),
        expenses: expensesSnap.docs.map((d) => ({ id: d.id, ...d.data() })),
      };
    },
  });
}

export function useTodaySchedule() {
  return useQuery({
    queryKey: ["today-schedule"],
    queryFn: async () => {
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      const tomorrow = new Date(today);
      tomorrow.setDate(today.getDate() + 1);

      const snap = await getDocs(
        query(
          collection(db, "classes"),
          where("startTime", ">=", Timestamp.fromDate(today)),
          where("startTime", "<", Timestamp.fromDate(tomorrow)),
          orderBy("startTime", "asc")
        )
      );
      return snap.docs.map((d) => ({ id: d.id, ...d.data() }));
    },
  });
}
