import { useQuery } from "@tanstack/react-query";
import { collection, query, orderBy, getDocs, where } from "firebase/firestore";
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

/* -------------------- CHILD ATTENDANCE HOOK -------------------- */
export function useChildAttendance(childId?: string) {
  return useQuery({
    queryKey: ["parent", "attendance", childId],
    queryFn: async () => {
      let q: any = collection(db, "student_attendance");
      if (childId) q = query(q, where("studentId", "==", childId), orderBy("date", "desc"));
      else q = query(q, orderBy("date", "desc"));
      const snap = await getDocs(q);
      return snap.docs.map((d) => ({ id: d.id, ...(d.data() as any) })) as ChildAttendance[];
    },
  });
}

/* -------------------- CHILD GRADES HOOK -------------------- */
export function useChildGrades(childId?: string) {
  return useQuery({
    queryKey: ["parent", "grades", childId],
    queryFn: async () => {
      let q: any = collection(db, "student_grades");
      if (childId) q = query(q, where("studentId", "==", childId), orderBy("date", "desc"));
      else q = query(q, orderBy("date", "desc"));
      const snap = await getDocs(q);
      return snap.docs.map((d) => ({ id: d.id, ...(d.data() as any) })) as ChildGrade[];
    },
  });
}

/* -------------------- CHILD FEES HOOK -------------------- */
export function useChildFees(childId?: string) {
  return useQuery({
    queryKey: ["parent", "fees", childId],
    queryFn: async () => {
      let q: any = collection(db, "fee_invoices");
      if (childId) q = query(q, where("studentId", "==", childId), orderBy("createdAt", "desc"));
      else q = query(q, orderBy("createdAt", "desc"));
      const snap = await getDocs(q);
      return snap.docs.map((d) => {
        const data = d.data() as any;
        return { id: d.id, invoiceNumber: data.invoiceNumber, amount: data.totalAmount, status: data.status, dueDate: data.dueDate, paidDate: data.paidDate };
      }) as ChildFee[];
    },
  });
}

/* -------------------- CHILD ASSIGNMENTS HOOK -------------------- */
export function useChildAssignments(childId?: string) {
  return useQuery({
    queryKey: ["parent", "assignments", childId],
    queryFn: async () => {
      let q: any = collection(db, "student_assignments");
      if (childId) q = query(q, where("studentId", "==", childId), orderBy("dueDate", "asc"));
      else q = query(q, orderBy("dueDate", "asc"));
      const snap = await getDocs(q);
      return snap.docs.map((d) => {
        const data = d.data() as any;
        return { id: d.id, title: data.title, courseName: data.courseName, dueDate: data.dueDate, status: data.status, marks: data.marks, totalMarks: data.totalMarks };
      }) as ChildAssignment[];
    },
  });
}



