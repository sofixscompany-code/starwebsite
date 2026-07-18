import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import {
  collection, query, orderBy, getDocs, addDoc, updateDoc, deleteDoc,
  doc, serverTimestamp, where,
} from "firebase/firestore";
import { db } from "@/integrations/firebase/config";

/* -------------------- TYPES -------------------- */
export interface Invoice {
  id: string;
  invoiceNumber: string;
  studentId: string;
  studentName: string;
  studentEmail: string;
  courseId: string;
  courseName: string;
  amount: number;
  discount: number;
  tax: number;
  totalAmount: number;
  dueDate: string;
  status: "pending" | "paid" | "partial" | "overdue" | "cancelled";
  items: InvoiceItem[];
  notes: string;
  createdAt?: any;
  updatedAt?: any;
}

export interface InvoiceItem {
  id: string;
  description: string;
  amount: number;
}

export interface Payment {
  id: string;
  invoiceId: string;
  invoiceNumber: string;
  studentId: string;
  studentName: string;
  amount: number;
  method: "cash" | "bank_transfer" | "esewa" | "khalti" | "card" | "other";
  reference: string;
  receivedBy: string;
  notes: string;
  paymentDate: string;
  receiptNumber: string;
  createdAt?: any;
}

export interface FeeStructure {
  id: string;
  courseId: string;
  courseName: string;
  feeType: "tuition" | "admission" | "exam" | "library" | "lab" | "transport" | "other";
  amount: number;
  frequency: "one_time" | "monthly" | "quarterly" | "yearly";
  isActive: boolean;
  createdAt?: any;
}

/* -------------------- INVOICES HOOK -------------------- */
export function useInvoices(studentId?: string) {
  const queryClient = useQueryClient();

  const { data: invoices = [], isLoading } = useQuery({
    queryKey: ["fees", "invoices", studentId],
    queryFn: async () => {
      let q: any = collection(db, "fee_invoices");
      if (studentId) {
        q = query(q, where("studentId", "==", studentId), orderBy("createdAt", "desc"));
      } else {
        q = query(q, orderBy("createdAt", "desc"));
      }
      const snap = await getDocs(q);
      return snap.docs.map((d) => ({ id: d.id, ...(d.data() as any) })) as Invoice[];
    },
  });

  const addInvoice = useMutation({
    mutationFn: async (invoice: Omit<Invoice, "id">) => {
      const docRef = await addDoc(collection(db, "fee_invoices"), { ...invoice, createdAt: serverTimestamp(), updatedAt: serverTimestamp() });
      return docRef.id;
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["fees", "invoices"] }),
  });

  const updateInvoice = useMutation({
    mutationFn: async ({ id, ...data }: Partial<Invoice> & { id: string }) => {
      await updateDoc(doc(db, "fee_invoices", id), { ...data, updatedAt: serverTimestamp() });
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["fees", "invoices"] }),
  });

  const deleteInvoice = useMutation({
    mutationFn: async (id: string) => { await deleteDoc(doc(db, "fee_invoices", id)); },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["fees", "invoices"] }),
  });

  const getTotalPending = () => invoices.filter((i) => i.status === "pending" || i.status === "overdue").reduce((s, i) => s + i.totalAmount, 0);
  const getTotalPaid = () => invoices.filter((i) => i.status === "paid").reduce((s, i) => s + i.totalAmount, 0);

  return { invoices, isLoading, addInvoice, updateInvoice, deleteInvoice, getTotalPending, getTotalPaid };
}

/* -------------------- PAYMENTS HOOK -------------------- */
export function usePayments(invoiceId?: string) {
  const queryClient = useQueryClient();

  const { data: payments = [], isLoading } = useQuery({
    queryKey: ["fees", "payments", invoiceId],
    queryFn: async () => {
      let q: any = collection(db, "fee_payments");
      if (invoiceId) {
        q = query(q, where("invoiceId", "==", invoiceId), orderBy("createdAt", "desc"));
      } else {
        q = query(q, orderBy("createdAt", "desc"));
      }
      const snap = await getDocs(q);
      return snap.docs.map((d) => ({ id: d.id, ...(d.data() as any) })) as Payment[];
    },
  });

  const addPayment = useMutation({
    mutationFn: async (payment: Omit<Payment, "id">) => {
      const docRef = await addDoc(collection(db, "fee_payments"), { ...payment, createdAt: serverTimestamp() });
      return docRef.id;
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["fees", "payments"] }),
  });

  const getTotalCollected = () => payments.reduce((s, p) => s + p.amount, 0);

  return { payments, isLoading, addPayment, getTotalCollected };
}

/* -------------------- FEE STRUCTURE HOOK -------------------- */
export function useFeeStructure() {
  const queryClient = useQueryClient();

  const { data: fees = [], isLoading } = useQuery({
    queryKey: ["fees", "structure"],
    queryFn: async () => {
      const q = query(collection(db, "fee_structure"), orderBy("courseName", "asc"));
      const snap = await getDocs(q);
      return snap.docs.map((d) => ({ id: d.id, ...(d.data() as any) })) as FeeStructure[];
    },
  });

  const addFee = useMutation({
    mutationFn: async (fee: Omit<FeeStructure, "id">) => {
      const docRef = await addDoc(collection(db, "fee_structure"), { ...fee, createdAt: serverTimestamp() });
      return docRef.id;
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["fees", "structure"] }),
  });

  const updateFee = useMutation({
    mutationFn: async ({ id, ...data }: Partial<FeeStructure> & { id: string }) => {
      await updateDoc(doc(db, "fee_structure", id), data);
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["fees", "structure"] }),
  });

  const deleteFee = useMutation({
    mutationFn: async (id: string) => { await deleteDoc(doc(db, "fee_structure", id)); },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["fees", "structure"] }),
  });

  return { fees, isLoading, addFee, updateFee, deleteFee };
}

/* -------------------- FEE STATS -------------------- */
export function useFeeStats() {
  return useQuery({
    queryKey: ["fees", "stats"],
    queryFn: async () => {
      const [invoicesSnap, paymentsSnap] = await Promise.all([
        getDocs(collection(db, "fee_invoices")),
        getDocs(collection(db, "fee_payments")),
      ]);

      const invoices = invoicesSnap.docs.map((d) => d.data());
      const payments = paymentsSnap.docs.map((d) => d.data());

      const totalRevenue = invoices.reduce((s, i) => s + (i.totalAmount || 0), 0);
      const totalCollected = payments.reduce((s, p) => s + (p.amount || 0), 0);
      const pendingAmount = invoices.filter((i) => i.status === "pending" || i.status === "overdue").reduce((s, i) => s + (i.totalAmount || 0), 0);
      const overdueCount = invoices.filter((i) => i.status === "overdue").length;

      return {
        totalInvoices: invoices.length,
        totalPayments: payments.length,
        totalRevenue,
        totalCollected,
        pendingAmount,
        overdueCount,
        collectionRate: totalRevenue ? Math.round((totalCollected / totalRevenue) * 100) : 0,
      };
    },
  });
}



