/**
 * Universal Payment & Invoice hooks.
 *
 *  - `useFinanceData()`    → full central ledger (finance roles: admin/accountant)
 *  - `useMyFinance()`      → data scoped to the signed-in student / parent / teacher
 *  - `useLedgerSnapshot()` → lightweight one-shot ledger for the accountant dashboard
 */

import { useMemo } from "react";
import { useQuery } from "@tanstack/react-query";
import { collection, getDocs } from "firebase/firestore";
import { db } from "@/integrations/firebase/config";
import { useModuleData, type ModuleRecord } from "@/hooks/use-module-data";
import { getStoredAuthUser } from "@/hooks/use-dashboard-data";
import { getUserRole } from "@/lib/api-auth";
import {
  buildLedger,
  invoiceInScope,
  normalizePayment,
  payableInScope,
  paymentInScope,
  sumLedger,
  type FinanceScope,
  type LedgerRow,
  type LedgerTotals,
  type PaymentTxn,
} from "@/lib/finance";

const byDateDesc = (a: PaymentTxn, b: PaymentTxn) => b.date - a.date;

/* ───────────────────────── full data (finance roles) ───────────────────────── */

export function useFinanceData() {
  const payments = useModuleData("payments");
  const invoices = useModuleData("fee_invoices");
  const payables = useModuleData("payables");
  const students = useModuleData("students");
  const expenses = useModuleData("expenses");

  const txns = useMemo(() => payments.rows.map(normalizePayment).sort(byDateDesc), [payments.rows]);
  const ledger = useMemo(
    () => buildLedger(invoices.rows, payables.rows, payments.rows),
    [invoices.rows, payables.rows, payments.rows],
  );
  const totals = useMemo(() => sumLedger(ledger), [ledger]);

  return {
    txns,
    rawPayments: payments.rows,
    invoices: invoices.rows,
    payables: payables.rows,
    students: students.rows,
    expenses: expenses.rows,
    ledger,
    totals,
    loading: payments.loading || invoices.loading || payables.loading,
    error: payments.error || invoices.error || payables.error,
    createPayment: payments.create,
    updatePayment: payments.update,
    removePayment: payments.remove,
    createPayable: payables.create,
    updatePayable: payables.update,
    removePayable: payables.remove,
    updateInvoice: invoices.update,
  };
}

export type FinanceData = ReturnType<typeof useFinanceData>;

/* ───────────────────────── scoped data (student / parent / teacher) ────────── */

export interface ChildSummary {
  id: string;
  name: string;
  total: number;
  paid: number;
  pending: number;
}

export function useMyFinance() {
  const role = getUserRole();
  const user = getStoredAuthUser();
  const uid = user?.uid || "";
  const email = user?.email || "";

  const students = useModuleData("students");
  const payments = useModuleData("payments");
  const invoices = useModuleData("fee_invoices");
  const payables = useModuleData("payables");

  const { scope, children } = useMemo(() => {
    const emailLc = email.toLowerCase();
    const all = students.rows;
    if (role === "parent") {
      const kids = all.filter((s) => String(s.parentEmail || "").toLowerCase() === emailLc);
      const childScopes = kids.map((c) => ({
        id: c.id,
        name: String(c.fullName || c.name || "Student"),
        scope: {
          ids: [c.id, String(c.studentId || "")].filter(Boolean),
          emails: [String(c.email || "")].filter(Boolean),
          names: [String(c.fullName || c.name || "")].filter(Boolean),
        } as FinanceScope,
      }));
      return {
        children: childScopes,
        scope: {
          ids: [...new Set(childScopes.flatMap((c) => c.scope.ids))],
          emails: [email],
          names: [...new Set(childScopes.flatMap((c) => c.scope.names))],
        } as FinanceScope,
      };
    }
    if (role === "teacher") {
      return {
        children: [],
        scope: {
          ids: [uid].filter(Boolean),
          emails: [email].filter(Boolean),
          names: [String(user?.name || "")].filter(Boolean),
        } as FinanceScope,
      };
    }
    // Student (default): match the students doc by login UID or email so we
    // also inherit its name/doc-id for legacy records that only store names.
    const me =
      all.find((s) => String(s.studentId || "") === uid) ||
      all.find((s) => String(s.email || "").toLowerCase() === emailLc);
    const myName = String(me?.fullName || me?.name || user?.name || "");
    return {
      children: [],
      scope: {
        ids: [uid, me?.id].filter(Boolean) as string[],
        emails: [email].filter(Boolean),
        names: [myName].filter(Boolean),
      } as FinanceScope,
    };
  }, [role, uid, email, students.rows, user?.name]);

  const txnsRaw = useMemo(
    () => payments.rows.filter((r) => paymentInScope(normalizePayment(r), scope)),
    [payments.rows, scope],
  );
  const invoicesRaw = useMemo(
    () => invoices.rows.filter((r) => invoiceInScope(r, scope)),
    [invoices.rows, scope],
  );
  const payablesRaw = useMemo(
    () => payables.rows.filter((r) => payableInScope(r, scope)),
    [payables.rows, scope],
  );

  const transactions = useMemo(() => txnsRaw.map(normalizePayment).sort(byDateDesc), [txnsRaw]);
  const ledger = useMemo(
    () => buildLedger(invoicesRaw, payablesRaw, txnsRaw),
    [invoicesRaw, payablesRaw, txnsRaw],
  );
  const summary = useMemo(() => {
    const sums = sumLedger(ledger);
    return {
      ...sums,
      txnCount: transactions.length,
      invoiceCount: invoicesRaw.length,
    };
  }, [ledger, transactions.length, invoicesRaw.length]);

  const childSummaries = useMemo<ChildSummary[]>(() => {
    if (role !== "parent") return [];
    return children.map((c) => {
      const inv = invoices.rows.filter((r) => invoiceInScope(r, c.scope));
      const pay = payments.rows.filter((r) => paymentInScope(normalizePayment(r), c.scope));
      const row = buildLedger(inv, [], pay)[0];
      return {
        id: c.id,
        name: c.name,
        total: row?.total ?? 0,
        paid: row?.paid ?? 0,
        pending: row?.pending ?? 0,
      };
    });
  }, [role, children, invoices.rows, payments.rows]);

  const loading = students.loading || payments.loading || invoices.loading || payables.loading;
  const error = students.error || payments.error || invoices.error;

  return {
    role,
    scope,
    transactions,
    invoices: invoicesRaw,
    ledger,
    summary,
    children: childSummaries,
    loading,
    error,
    hasData: transactions.length > 0 || invoicesRaw.length > 0 || payablesRaw.length > 0,
  };
}

export type MyFinance = ReturnType<typeof useMyFinance>;

/* ───────────────────────── accountant dashboard snapshot ───────────────────── */

async function safeRows(path: string): Promise<ModuleRecord[]> {
  try {
    const snap = await getDocs(collection(db, path));
    return snap.docs.map((d) => ({ id: d.id, ...d.data() }) as ModuleRecord);
  } catch {
    // Missing permission or collection not created yet — report honest zeros.
    return [];
  }
}

export interface LedgerSnapshot {
  totals: LedgerTotals;
  payroll: LedgerTotals & { accounts: number };
  topPending: LedgerRow[];
  txnCount: number;
  hasData: boolean;
}

export function useLedgerSnapshot() {
  return useQuery({
    queryKey: ["ledger-snapshot"],
    queryFn: async (): Promise<LedgerSnapshot> => {
      const [invoices, payables, payments] = await Promise.all([
        safeRows("fee_invoices"),
        safeRows("payables"),
        safeRows("payments"),
      ]);
      const ledger = buildLedger(invoices, payables, payments);
      const payrollRows = ledger.filter(
        (r) => r.personRole === "teacher" || r.personRole === "staff",
      );
      const payrollSums = sumLedger(payrollRows);
      return {
        totals: sumLedger(ledger),
        payroll: { ...payrollSums, accounts: payrollRows.length },
        topPending: ledger.filter((r) => r.pending > 0).slice(0, 5),
        txnCount: payments.length,
        hasData: ledger.length > 0,
      };
    },
    // No `initialData`: a pending query shows the dashboard's loading skeleton
    // instead of sitting on honest-but-empty zeros for a whole staleTime window.
    staleTime: 30_000,
    refetchOnWindowFocus: false,
  });
}
