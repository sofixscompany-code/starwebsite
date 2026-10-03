/**
 * Universal Payment & Invoice system — shared finance logic.
 *
 * One central model used by the payments page, dashboards and reports:
 *
 *   Person → Role → Payment Type → Total → Paid → Pending → Transactions → Invoices
 *
 * Sources of truth:
 *  - `fee_invoices`  → student fee billing (Total for students)
 *  - `payables`      → explicitly defined payables (teacher/staff salary, manual fee)
 *  - `payments`      → every transaction (Paid), each with a unique
 *                      Transaction ID + Receipt No + recorded-by audit fields
 */

import type { ModuleRecord } from "@/hooks/use-module-data";

/* ───────────────────────── types ───────────────────────── */

export type PersonRole = "student" | "parent" | "teacher" | "staff";
export type LedgerStatus = "pending" | "partial" | "cleared";

export const PERSON_ROLES: PersonRole[] = ["student", "parent", "teacher", "staff"];

export const PAYMENT_TYPES = ["tuition", "admission", "salary", "staff", "other"] as const;

export const PAYMENT_METHODS = [
  "cash",
  "bank_transfer",
  "esewa",
  "khalti",
  "card",
  "other",
] as const;

/** Normalised transaction row derived from a `payments` doc (legacy docs included). */
export interface PaymentTxn {
  id: string;
  transactionId: string;
  receiptNumber: string;
  invoiceId: string;
  invoiceNumber: string;
  personId: string;
  personName: string;
  personRole: string;
  personEmail: string;
  paymentType: string;
  amount: number;
  method: string;
  reference: string;
  notes: string;
  /** epoch ms of the payment moment (falls back to createdAt/paymentDate). */
  date: number;
  recordedBy: string;
  recordedById: string;
  status: string;
  /** legacy fields kept for old dashboards */
  studentName: string;
  studentId: string;
}

/** One person's central-ledger row. */
export interface LedgerRow {
  key: string;
  personId: string;
  personName: string;
  personRole: string;
  paymentType: string;
  total: number;
  paid: number;
  pending: number;
  txnCount: number;
  lastDate: number;
  status: LedgerStatus;
}

/** Identifiers used to scope finance data to the signed-in user / their children. */
export interface FinanceScope {
  ids: string[];
  emails: string[];
  names: string[];
}

/* ───────────────────────── helpers ───────────────────────── */

const rand = (len: number) => {
  const chars = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789";
  let out = "";
  const buf = new Uint32Array(len);
  if (typeof crypto !== "undefined" && typeof crypto.getRandomValues === "function") {
    crypto.getRandomValues(buf);
  }
  for (let i = 0; i < len; i++) {
    const r = buf[i] ?? Math.floor(Math.random() * chars.length * 2);
    out += chars[r % chars.length];
  }
  return out;
};

const stamp = (d = new Date()) =>
  `${d.getFullYear()}${String(d.getMonth() + 1).padStart(2, "0")}${String(d.getDate()).padStart(2, "0")}`;

/** TXN-20261003-A1B2C — unique transaction ID for every payment. */
export const newTransactionId = () => `TXN-${stamp()}-${rand(5)}`;

/** RCP-20261003-X9Y8Z — unique receipt number for every payment. */
export const newReceiptNumber = () => `RCP-${stamp()}-${rand(5)}`;

const num = (v: unknown) => {
  const n = Number(v);
  return Number.isFinite(n) ? n : 0;
};

/** Epoch ms from Firestore Timestamp / ISO string / date string / number. */
export function toMs(v: unknown): number {
  if (!v) return 0;
  if (typeof v === "number") return v;
  if (typeof v === "string") {
    const parsed = Date.parse(v);
    return Number.isFinite(parsed) ? parsed : 0;
  }
  const t = v as { toMillis?: () => number; seconds?: number };
  if (typeof t.toMillis === "function") return t.toMillis();
  if (typeof t.seconds === "number") return t.seconds * 1000;
  return 0;
}

export const fmtRs = (n: number) => `Rs ${Math.round(num(n)).toLocaleString("en-IN")}`;

export const fmtDate = (ms: number) => (ms ? new Date(ms).toISOString().slice(0, 10) : "—");

export const fmtDateTime = (ms: number) => {
  if (!ms) return "—";
  const d = new Date(ms);
  const p = (x: number) => String(x).padStart(2, "0");
  return `${d.getFullYear()}-${p(d.getMonth() + 1)}-${p(d.getDate())} ${p(d.getHours())}:${p(d.getMinutes())}`;
};

export function methodLabel(m: string): string {
  const map: Record<string, string> = {
    cash: "Cash",
    bank_transfer: "Bank Transfer",
    esewa: "eSewa",
    khalti: "Khalti",
    card: "Card",
    other: "Other",
  };
  return map[String(m || "").toLowerCase()] || m || "—";
}

export function roleLabel(r: string): string {
  const map: Record<string, string> = {
    student: "Student",
    parent: "Parent",
    teacher: "Teacher",
    staff: "Staff",
  };
  return map[String(r || "").toLowerCase()] || r || "—";
}

export function paymentTypeLabel(t: string): string {
  const map: Record<string, string> = {
    tuition: "Tuition Fee",
    admission: "Admission Fee",
    salary: "Salary",
    staff: "Staff Payment",
    other: "Other",
  };
  return map[String(t || "").toLowerCase()] || t || "—";
}

export function ledgerStatusLabel(s: LedgerStatus): string {
  return s === "cleared" ? "Cleared" : s === "partial" ? "Partial" : "Pending";
}

export function ledgerTone(s: LedgerStatus): "success" | "warning" | "danger" | "info" {
  return s === "cleared" ? "success" : s === "partial" ? "warning" : "danger";
}

/* ───────────────────────── normalisation ───────────────────────── */

/** Normalise any `payments` doc (old accounting payments included) to a PaymentTxn. */
export function normalizePayment(raw: ModuleRecord): PaymentTxn {
  const studentName = String(raw.studentName || "");
  const personName = String(raw.personName || studentName || "—");
  return {
    id: String(raw.id || ""),
    transactionId: String(raw.transactionId || ""),
    receiptNumber: String(raw.receiptNumber || ""),
    invoiceId: String(raw.invoiceId || ""),
    invoiceNumber: String(raw.invoiceNumber || ""),
    personId: String(raw.personId || raw.studentId || ""),
    personName,
    personRole: String(raw.personRole || (studentName ? "student" : "")),
    personEmail: String(raw.personEmail || ""),
    paymentType: String(raw.paymentType || raw.type || ""),
    amount: num(raw.amount),
    method: String(raw.method || ""),
    reference: String(raw.reference || ""),
    notes: String(raw.notes || ""),
    date: toMs(raw.date) || toMs(raw.createdAt) || toMs(raw.paymentDate),
    recordedBy: String(raw.recordedBy || raw.receivedBy || ""),
    recordedById: String(raw.recordedById || ""),
    status: String(raw.status || "completed"),
    studentName,
    studentId: String(raw.studentId || ""),
  };
}

const isFailedStatus = (s: string) => ["failed", "refunded", "cancelled", "void"].includes(s);

const isInvoiceCounted = (s: string) => s !== "cancelled";

/* ───────────────────────── scope matching ───────────────────────── */

const normName = (n: unknown) =>
  String(n || "")
    .trim()
    .toLowerCase();

export function scopeMatches(
  scope: FinanceScope,
  rec: { personId?: string; personEmail?: string; personName?: string },
): boolean {
  const ids = new Set(scope.ids.filter(Boolean));
  const emails = new Set(scope.emails.map((e) => e.toLowerCase()).filter(Boolean));
  const names = new Set(scope.names.map(normName).filter(Boolean));
  if (rec.personId && ids.has(rec.personId)) return true;
  if (rec.personEmail && emails.has(rec.personEmail.toLowerCase())) return true;
  if (rec.personName && names.has(normName(rec.personName))) return true;
  return false;
}

export function paymentInScope(txn: PaymentTxn, scope: FinanceScope): boolean {
  return (
    scopeMatches(scope, {
      personId: txn.personId || txn.studentId,
      personEmail: txn.personEmail,
      personName: txn.personName || txn.studentName,
    }) || scopeMatches(scope, { personId: txn.studentId, personName: txn.studentName })
  );
}

export function invoiceInScope(raw: ModuleRecord, scope: FinanceScope): boolean {
  return scopeMatches(scope, {
    personId: String(raw.studentId || ""),
    personEmail: String(raw.studentEmail || ""),
    personName: String(raw.studentName || ""),
  });
}

export function payableInScope(raw: ModuleRecord, scope: FinanceScope): boolean {
  return scopeMatches(scope, {
    personId: String(raw.personId || ""),
    personEmail: String(raw.personEmail || ""),
    personName: String(raw.personName || ""),
  });
}

/* ───────────────────────── ledger builder ───────────────────────── */

type Contribution =
  | { kind: "payable"; doc: ModuleRecord }
  | { kind: "invoice"; doc: ModuleRecord }
  | { kind: "payment"; doc: ModuleRecord };

/**
 * Build the central ledger: one row per person with Total / Paid / Pending / Status.
 *
 * Records are merged by personId first, then by person name (legacy payments and
 * invoices only carry `studentName`), so old and new records land on one row.
 */
export function buildLedger(
  invoices: ModuleRecord[],
  payables: ModuleRecord[],
  payments: ModuleRecord[],
): LedgerRow[] {
  const rows = new Map<string, LedgerRow>();
  const idAlias = new Map<string, string>();
  const nameAlias = new Map<string, string>();

  const ensure = (personId: string, personName: string): LedgerRow => {
    const idKey = personId ? `id:${personId}` : "";
    const nameKey = personName ? `name:${normName(personName)}` : "";
    let key = (idKey && idAlias.get(idKey)) || (nameKey && nameAlias.get(nameKey)) || "";
    let row = key ? rows.get(key) : undefined;
    if (!row) {
      key = idKey || nameKey || `anon:${rows.size + 1}`;
      row = {
        key,
        personId,
        personName,
        personRole: "",
        paymentType: "",
        total: 0,
        paid: 0,
        pending: 0,
        txnCount: 0,
        lastDate: 0,
        status: "pending",
      };
      rows.set(key, row);
    }
    if (idKey && !idAlias.has(idKey)) idAlias.set(idKey, key);
    if (nameKey && !nameAlias.has(nameKey)) nameAlias.set(nameKey, key);
    if (!row.personId && personId) row.personId = personId;
    if ((!row.personName || row.personName === "—") && personName) row.personName = personName;
    return row;
  };

  const apply = (c: Contribution) => {
    if (c.kind === "payable") {
      const d = c.doc;
      const name = String(d.personName || "");
      const row = ensure(String(d.personId || ""), name);
      row.total += num(d.totalAmount);
      if (d.personRole) row.personRole = String(d.personRole);
      if (d.paymentType && !row.paymentType) row.paymentType = String(d.paymentType);
    } else if (c.kind === "invoice") {
      const d = c.doc;
      if (!isInvoiceCounted(String(d.status || ""))) return;
      const name = String(d.studentName || "");
      const row = ensure(String(d.studentId || ""), name);
      row.total += num(d.totalAmount) || num(d.amount);
      if (!row.personRole) row.personRole = "student";
      if (!row.paymentType) row.paymentType = "tuition";
    } else {
      const d = c.doc;
      const status = String(d.status || "completed").toLowerCase();
      if (isFailedStatus(status)) return;
      const name = String(d.personName || d.studentName || "");
      const personId = String(d.personId || "");
      const row = ensure(personId, name);
      row.paid += num(d.amount);
      row.txnCount += 1;
      const when = toMs(d.date) || toMs(d.createdAt) || toMs(d.paymentDate);
      if (when > row.lastDate) row.lastDate = when;
      const explicitRole = String(d.personRole || "");
      if (explicitRole) row.personRole = explicitRole;
      else if (!row.personRole) row.personRole = d.studentName ? "student" : "";
      const explicitType = String(d.paymentType || "");
      if (explicitType && !row.paymentType) row.paymentType = explicitType;
      else if (!row.paymentType && d.invoiceNumber) row.paymentType = "tuition";
    }
  };

  payables.forEach((doc) => apply({ kind: "payable", doc }));
  invoices.forEach((doc) => apply({ kind: "invoice", doc }));
  payments.forEach((doc) => apply({ kind: "payment", doc }));

  const out = [...rows.values()].filter((r) => r.personName || r.personId);
  out.forEach((r) => {
    // A person can never owe less than what they already paid (rows without a
    // billed amount still display sensibly instead of a negative pending).
    r.total = Math.max(r.total, r.paid);
    r.pending = Math.max(r.total - r.paid, 0);
    r.status =
      r.paid <= 0 ? (r.total > 0 ? "pending" : "cleared") : r.pending > 0 ? "partial" : "cleared";
  });
  out.sort(
    (a, b) => b.pending - a.pending || b.paid - a.paid || a.personName.localeCompare(b.personName),
  );
  return out;
}

export interface LedgerTotals {
  total: number;
  paid: number;
  pending: number;
}

/** All transactions belonging to one ledger row (by personId, then by name). */
export function txnsForRow(txns: PaymentTxn[], row: LedgerRow): PaymentTxn[] {
  const n = normName(row.personName);
  return txns.filter((t) => {
    if (row.personId && (t.personId === row.personId || t.studentId === row.personId)) return true;
    return normName(t.personName || t.studentName) === n;
  });
}

/** Total paid against one invoice from all counted payments. */
export function paidAgainstInvoice(payments: ModuleRecord[], invoiceId: string): number {
  return payments
    .filter(
      (p) =>
        String(p.invoiceId || "") === invoiceId &&
        !isFailedStatus(String(p.status || "completed").toLowerCase()),
    )
    .reduce((s, p) => s + num(p.amount), 0);
}

/** All invoices belonging to one ledger row (by studentId, then by name). */
export function invoicesForRow(invoices: ModuleRecord[], row: LedgerRow): ModuleRecord[] {
  const n = normName(row.personName);
  return invoices.filter((i) => {
    if (row.personId && String(i.studentId || "") === row.personId) return true;
    return normName(i.studentName) === n;
  });
}

export function sumLedger(rows: LedgerRow[]): LedgerTotals {
  return rows.reduce(
    (acc, r) => ({
      total: acc.total + r.total,
      paid: acc.paid + r.paid,
      pending: acc.pending + r.pending,
    }),
    { total: 0, paid: 0, pending: 0 },
  );
}

/** Status of a single invoice against its payments. */
export function invoiceStatusAfterPaid(
  totalAmount: number,
  paid: number,
  dueDate: string,
  current: string,
): string {
  if (current === "cancelled") return "cancelled";
  if (paid >= totalAmount && totalAmount > 0) return "paid";
  if (paid > 0) return "partial";
  return dueDate && dueDate < new Date().toISOString().slice(0, 10) ? "overdue" : "pending";
}

/* ───────────────────────── CSV export ───────────────────────── */

export function downloadCsv(filename: string, headers: string[], rows: (string | number)[][]) {
  const esc = (v: unknown) => `"${String(v ?? "").replace(/"/g, '""')}"`;
  const lines = [headers.map(esc).join(","), ...rows.map((r) => r.map(esc).join(","))];
  const blob = new Blob(["\ufeff" + lines.join("\n")], { type: "text/csv;charset=utf-8" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}

/* ───────────────────────── reporting ───────────────────────── */

export type ReportGroup = "daily" | "monthly" | "yearly";

export interface ReportRow {
  period: string;
  count: number;
  collected: number;
  expenses: number;
  net: number;
}

const p2 = (x: number) => String(x).padStart(2, "0");

export function periodKey(ms: number, group: ReportGroup): string {
  const d = new Date(ms);
  if (group === "yearly") return String(d.getFullYear());
  if (group === "monthly") return `${d.getFullYear()}-${p2(d.getMonth() + 1)}`;
  return `${d.getFullYear()}-${p2(d.getMonth() + 1)}-${p2(d.getDate())}`;
}

/** Group payments (in) and expenses (out) into daily / monthly / yearly rows. */
export function buildReport(
  payments: PaymentTxn[],
  expenses: ModuleRecord[],
  group: ReportGroup,
  from?: string,
  to?: string,
): ReportRow[] {
  const inRange = (ms: number) => {
    if (!ms) return false;
    const day = new Date(ms).toISOString().slice(0, 10);
    if (from && day < from) return false;
    if (to && day > to) return false;
    return true;
  };
  const map = new Map<string, ReportRow>();
  const bucket = (ms: number, count: number, collected: number, expense: number) => {
    if (!inRange(ms)) return;
    const key = periodKey(ms, group);
    let row = map.get(key);
    if (!row) {
      row = { period: key, count: 0, collected: 0, expenses: 0, net: 0 };
      map.set(key, row);
    }
    row.count += count;
    row.collected += collected;
    row.expenses += expense;
    row.net = row.collected - row.expenses;
  };
  payments.forEach((p) => {
    if (isFailedStatus(p.status.toLowerCase())) return;
    bucket(p.date, 1, p.amount, 0);
  });
  expenses.forEach((e) => bucket(toMs(e.date) || toMs(e.createdAt), 0, 0, num(e.amount)));
  return [...map.values()].sort((a, b) => b.period.localeCompare(a.period));
}

export interface MethodRow {
  method: string;
  count: number;
  amount: number;
}

export function methodBreakdown(payments: PaymentTxn[], from?: string, to?: string): MethodRow[] {
  const map = new Map<string, MethodRow>();
  payments.forEach((p) => {
    if (isFailedStatus(p.status.toLowerCase())) return;
    if (p.date) {
      const day = new Date(p.date).toISOString().slice(0, 10);
      if (from && day < from) return;
      if (to && day > to) return;
    }
    const key = p.method || "other";
    let row = map.get(key);
    if (!row) {
      row = { method: key, count: 0, amount: 0 };
      map.set(key, row);
    }
    row.count += 1;
    row.amount += p.amount;
  });
  return [...map.values()].sort((a, b) => b.amount - a.amount);
}
