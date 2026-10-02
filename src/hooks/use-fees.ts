import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import {
  collection,
  query,
  getDocs,
  addDoc,
  updateDoc,
  deleteDoc,
  doc,
  serverTimestamp,
  where,
} from "firebase/firestore";
import { db } from "@/integrations/firebase/config";

/** Normalize Firestore Timestamps / ISO strings / numbers to epoch ms (client-side sorting). */
const toMs = (v: unknown): number => {
  if (!v) return 0;
  if (typeof v === "number") return v;
  if (typeof v === "string") return Date.parse(v) || 0;
  const t = v as { toMillis?: () => number; seconds?: number };
  if (typeof t.toMillis === "function") return t.toMillis();
  if (typeof t.seconds === "number") return t.seconds * 1000;
  return 0;
};

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
      // Index-free: at most one equality `where`, no orderBy after where — sorted client-side.
      const constraints: any[] = [];
      if (studentId) constraints.push(where("studentId", "==", studentId));
      const snap = await getDocs(query(collection(db, "fee_invoices"), ...constraints));
      return snap.docs
        .map((d) => ({ id: d.id, ...(d.data() as any) }) as Invoice)
        .sort((a, b) => toMs(b.createdAt) - toMs(a.createdAt));
    },
  });

  const addInvoice = useMutation({
    mutationFn: async (invoice: Omit<Invoice, "id">) => {
      const docRef = await addDoc(collection(db, "fee_invoices"), {
        ...invoice,
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp(),
      });
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
    mutationFn: async (id: string) => {
      await deleteDoc(doc(db, "fee_invoices", id));
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["fees", "invoices"] }),
  });

  const getTotalPending = () =>
    invoices
      .filter((i) => i.status === "pending" || i.status === "overdue")
      .reduce((s, i) => s + i.totalAmount, 0);
  const getTotalPaid = () =>
    invoices.filter((i) => i.status === "paid").reduce((s, i) => s + i.totalAmount, 0);

  return {
    invoices,
    isLoading,
    addInvoice,
    updateInvoice,
    deleteInvoice,
    getTotalPending,
    getTotalPaid,
  };
}

/* -------------------- PAYMENTS HOOK -------------------- */
export function usePayments(invoiceId?: string) {
  const queryClient = useQueryClient();

  const { data: payments = [], isLoading } = useQuery({
    queryKey: ["fees", "payments", invoiceId],
    queryFn: async () => {
      // Canonical money-in collection is `payments` (written by admin/payments pages).
      // Index-free: single equality `where`, no orderBy after where — sorted client-side.
      const constraints: any[] = [];
      if (invoiceId) constraints.push(where("invoiceId", "==", invoiceId));
      const snap = await getDocs(query(collection(db, "payments"), ...constraints));
      return snap.docs
        .map((d) => {
          const data = d.data() as any;
          const createdAt = data.createdAt ?? null;
          const createdDate = toMs(createdAt)
            ? new Date(toMs(createdAt)).toISOString().slice(0, 10)
            : "";
          const paymentDate =
            String(data.paymentDate ?? data.date ?? "").slice(0, 10) || createdDate;
          return {
            id: d.id,
            invoiceId: data.invoiceId ?? "",
            invoiceNumber: data.invoiceNumber ?? "",
            studentId: data.studentId ?? "",
            studentName: data.studentName ?? data.name ?? "",
            amount: Number(data.amount) || 0,
            method: (data.method ?? "cash") as Payment["method"],
            reference: data.reference ?? "",
            receivedBy: data.receivedBy ?? "",
            notes: data.notes ?? "",
            paymentDate,
            receiptNumber: data.receiptNumber ?? data.receiptNo ?? d.id,
            createdAt,
          } as Payment;
        })
        .sort((a, b) => toMs(b.createdAt) - toMs(a.createdAt));
    },
  });

  const addPayment = useMutation({
    mutationFn: async (payment: Omit<Payment, "id">) => {
      const docRef = await addDoc(collection(db, "payments"), {
        ...payment,
        status: "completed",
        createdAt: new Date().toISOString(),
      });
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
      // Index-free: no orderBy in the query (fee_structure docs are written with
      // `planName`, legacy docs with `courseName`) — sorted client-side by name.
      const snap = await getDocs(collection(db, "fee_structure"));
      return snap.docs
        .map((d) => {
          const data = d.data() as any;
          const name = data.planName ?? data.courseName ?? data.program ?? "";
          const status = String(data.status ?? "").toLowerCase();
          return {
            ...data,
            id: d.id,
            courseName: name,
            amount: Number(data.amount ?? data.monthlyFee ?? data.totalAmount) || 0,
            feeType: data.feeType ?? "tuition",
            frequency: data.frequency ?? "monthly",
            isActive: typeof data.isActive === "boolean" ? data.isActive : status !== "inactive",
          } as FeeStructure;
        })
        .sort((a, b) => String(a.courseName ?? "").localeCompare(String(b.courseName ?? "")));
    },
  });

  const addFee = useMutation({
    mutationFn: async (fee: Omit<FeeStructure, "id">) => {
      const docRef = await addDoc(collection(db, "fee_structure"), {
        ...fee,
        createdAt: serverTimestamp(),
      });
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
    mutationFn: async (id: string) => {
      await deleteDoc(doc(db, "fee_structure", id));
    },
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
        getDocs(collection(db, "payments")),
      ]);

      const invoices = invoicesSnap.docs.map((d) => d.data());
      const payments = paymentsSnap.docs.map((d) => d.data());

      const totalRevenue = invoices.reduce((s, i) => s + (i.totalAmount || 0), 0);
      const totalCollected = payments.reduce((s, p) => s + (p.amount || 0), 0);
      const pendingAmount = invoices
        .filter((i) => i.status === "pending" || i.status === "overdue")
        .reduce((s, i) => s + (i.totalAmount || 0), 0);
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
