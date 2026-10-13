/**
 * Printable payment receipt + fee invoice for the universal Payment & Invoice
 * system, plus the isolated-print helper (`printArea`).
 *
 * Print contract (mirrors student-cards.css): mark the document with
 * `.pay-print`, set `body.pay-printing`, call `window.print()` — only the
 * marked document is printed; the admin chrome is hidden.
 */

import type { ReactNode } from "react";
import { useRef } from "react";
import { Printer, X } from "lucide-react";
import { Modal } from "@/components/admin/ui";
import { site } from "@/lib/site-config";
import { fmtDateTime, fmtRs, methodLabel, toMs, type PaymentTxn } from "@/lib/finance";
import { useAdminT } from "@/lib/admin-i18n";
import "./print.css";

/** Print only the given document: marks it with `.pay-print`, hides the rest. */
export function printArea(target?: HTMLElement | null) {
  const body = document.body;
  const node = target || document.querySelector<HTMLElement>(".pay-print");
  node?.classList.add("pay-print");
  body.classList.add("pay-printing");
  const cleanup = () => {
    body.classList.remove("pay-printing");
    node?.classList.remove("pay-print");
    window.removeEventListener("afterprint", cleanup);
  };
  window.addEventListener("afterprint", cleanup);
  window.print();
  window.setTimeout(cleanup, 800);
}

/* ───────────────────────── number → words ───────────────────────── */

const ONES = [
  "",
  "One",
  "Two",
  "Three",
  "Four",
  "Five",
  "Six",
  "Seven",
  "Eight",
  "Nine",
  "Ten",
  "Eleven",
  "Twelve",
  "Thirteen",
  "Fourteen",
  "Fifteen",
  "Sixteen",
  "Seventeen",
  "Eighteen",
  "Nineteen",
];
const TENS = ["", "", "Twenty", "Thirty", "Forty", "Fifty", "Sixty", "Seventy", "Eighty", "Ninety"];

function twoDigits(n: number): string {
  if (n < 20) return ONES[n];
  return TENS[Math.floor(n / 10)] + (n % 10 ? "-" + ONES[n % 10] : "");
}

function threeDigits(n: number): string {
  if (n >= 100)
    return ONES[Math.floor(n / 100)] + " Hundred" + (n % 100 ? " " + twoDigits(n % 100) : "");
  return twoDigits(n);
}

/** "Rupees Forty-Seven Thousand Five Hundred Only" (Nepali lakh/crore grouping). */
function amountInWords(n: number): string {
  const v = Math.round(Math.abs(n || 0));
  if (!v) return "Rupees Zero Only";
  const crore = Math.floor(v / 10000000);
  const lakh = Math.floor((v % 10000000) / 100000);
  const thousand = Math.floor((v % 100000) / 1000);
  const rest = v % 1000;
  const parts: string[] = [];
  if (crore) parts.push(threeDigits(crore) + " Crore");
  if (lakh) parts.push(twoDigits(lakh) + " Lakh");
  if (thousand) parts.push(twoDigits(thousand) + " Thousand");
  if (rest) parts.push(threeDigits(rest));
  return "Rupees " + parts.join(" ") + " Only";
}

/* ───────────────────────── shared document chrome ───────────────────────── */

const STATUS_TONE: Record<string, string> = {
  completed: "bg-emerald-100 text-emerald-800 border-emerald-300",
  paid: "bg-emerald-100 text-emerald-800 border-emerald-300",
  partial: "bg-amber-100 text-amber-800 border-amber-300",
  pending: "bg-gray-100 text-gray-700 border-gray-300",
  overdue: "bg-red-100 text-red-700 border-red-300",
  failed: "bg-red-100 text-red-700 border-red-300",
  cancelled: "bg-gray-200 text-gray-500 border-gray-300",
  refunded: "bg-blue-100 text-blue-800 border-blue-300",
};

function StatusPill({ status }: { status: string }) {
  const tone = STATUS_TONE[status.toLowerCase()] ?? "bg-gray-100 text-gray-700 border-gray-300";
  return (
    <span
      className={
        "inline-block rounded-full border px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider " +
        tone
      }
    >
      {status}
    </span>
  );
}

function BrandHeader({
  title,
  docNo,
  right,
}: {
  title: string;
  docNo?: string;
  right?: ReactNode;
}) {
  return (
    <div className="flex items-center gap-4 pb-3 border-b-2 border-gray-900">
      <img
        src="/favicon-180x180.jpg?v=2"
        alt=""
        className="w-16 h-16 rounded-full object-cover border border-gray-300 shrink-0"
      />
      <div className="flex-1 min-w-0">
        <h1 className="text-[17px] font-extrabold text-gray-900 leading-tight">{site.legalName}</h1>
        <p className="text-[11px] text-gray-600 leading-snug">{site.location}</p>
        <p className="text-[11px] text-gray-600 leading-snug">
          Ph: {site.phones.join(", ")} · {site.email}
        </p>
      </div>
      <div className="text-right shrink-0">
        <p className="text-sm font-black uppercase tracking-[0.18em] text-gray-900 border-2 border-gray-900 rounded px-2.5 py-1 inline-block">
          {title}
        </p>
        {docNo && <p className="text-[11px] font-mono text-gray-700 mt-1.5">{docNo}</p>}
        {right && <div className="mt-1.5">{right}</div>}
      </div>
    </div>
  );
}

function MetaGrid({ rows }: { rows: [string, ReactNode][] }) {
  return (
    <div className="grid grid-cols-2 gap-x-6 mt-4">
      {rows.map(([label, value]) => (
        <div
          key={label}
          className="flex justify-between gap-3 py-1.5 border-b border-dashed border-gray-300 text-[12px]"
        >
          <span className="text-gray-500 font-medium shrink-0">{label}</span>
          <span className="font-semibold text-gray-900 text-right min-w-0">{value}</span>
        </div>
      ))}
    </div>
  );
}

function FieldRow({ label, value }: { label: string; value: ReactNode }) {
  return (
    <div className="flex justify-between gap-4 py-1.5 border-b border-dashed border-gray-300 text-[13px]">
      <span className="text-gray-500 font-medium">{label}</span>
      <span className="font-semibold text-gray-900 text-right">{value}</span>
    </div>
  );
}

function InWords({ amount }: { amount: number }) {
  return (
    <div className="mt-3 border border-gray-300 rounded px-3 py-2 text-[12px] bg-gray-50">
      <span className="font-semibold text-gray-600">In Words: </span>
      <span className="font-medium text-gray-900">{amountInWords(amount)}</span>
    </div>
  );
}

function DocFooter({ note }: { note: string }) {
  return (
    <div className="mt-8 flex justify-between items-end text-[11px] text-gray-600">
      <p className="max-w-[58%] leading-relaxed">{note}</p>
      <div className="text-center">
        <div className="w-44 border-t border-gray-500 pt-1 font-semibold text-gray-800">
          Authorised Signatory
        </div>
        <p className="text-[10px] text-gray-500 mt-0.5">For {site.legalName}</p>
      </div>
    </div>
  );
}

/* ───────────────────────── receipt ───────────────────────── */

export function ReceiptDoc({ txn }: { txn: PaymentTxn }) {
  return (
    <div className="receipt-doc bg-white text-gray-900 p-6 rounded-xl border border-gray-200 max-w-lg mx-auto">
      <BrandHeader title="Payment Receipt" docNo={`No: ${txn.receiptNumber || "—"}`} />
      <div className="mt-4 rounded-lg border-2 border-gray-900 bg-gray-50 px-4 py-3 text-center">
        <p className="text-[10px] uppercase tracking-[0.2em] text-gray-500">Amount Received</p>
        <p className="text-2xl font-black text-gray-900 mt-0.5">{fmtRs(txn.amount)}</p>
        <p className="text-[12px] text-gray-700 mt-1 italic">{amountInWords(txn.amount)}</p>
      </div>
      <MetaGrid
        rows={[
          ["Received From", txn.personName || txn.studentName || "—"],
          ["Role", txn.personRole ? txn.personRole : "—"],
          ["Payment Type", txn.paymentType || "—"],
          ["Method", methodLabel(txn.method)],
          ["Date & Time", fmtDateTime(txn.date)],
          ["Status", <StatusPill key="s" status={txn.status || "completed"} />],
          ["Transaction ID", <span className="font-mono">{txn.transactionId || "—"}</span>],
          ["Recorded By", txn.recordedBy || "—"],
        ]}
      />
      {txn.reference && <FieldRow label="Reference" value={txn.reference} />}
      {txn.invoiceNumber && <FieldRow label="Against Invoice" value={txn.invoiceNumber} />}
      {txn.notes && <FieldRow label="Notes" value={txn.notes} />}
      <DocFooter note="Computer-generated receipt — valid without a physical signature. Payments accepted at the institute office (Cash / eSewa / Khalti)." />
    </div>
  );
}

export function ReceiptModal({ txn, onClose }: { txn: PaymentTxn | null; onClose: () => void }) {
  const { t } = useAdminT();
  const docRef = useRef<HTMLDivElement>(null);
  return (
    <Modal open={!!txn} onClose={onClose} size="md" title={t("receiptTitle")}>
      {txn && (
        <>
          <div ref={docRef}>
            <ReceiptDoc txn={txn} />
          </div>
          <div className="flex justify-end gap-3 mt-5 no-print">
            <button onClick={onClose} className="ap-btn-ghost">
              <X className="w-4 h-4" /> {t("closeLabel")}
            </button>
            <button onClick={() => printArea(docRef.current)} className="ap-btn">
              <Printer className="w-4 h-4" /> {t("printLabel")}
            </button>
          </div>
        </>
      )}
    </Modal>
  );
}

/* ───────────────────────── invoice ───────────────────────── */

export interface InvoiceDocData {
  id?: string;
  invoiceNumber: string;
  studentName: string;
  courseName: string;
  totalAmount: number;
  amount?: number;
  discount?: number;
  tax?: number;
  dueDate: string;
  status: string;
  createdAt?: unknown;
  createdAtMs?: number;
  notes?: string;
  items: { description?: string; amount?: number }[];
  paid: number;
}

export function InvoiceDoc({ invoice }: { invoice: InvoiceDocData }) {
  const paid = invoice.paid ?? 0;
  const pending = Math.max(invoice.totalAmount - paid, 0);
  const items = invoice.items ?? [];
  const issuedMs = invoice.createdAtMs || toMs(invoice.createdAt);
  const status = invoice.status || "pending";
  return (
    <div className="invoice-doc bg-white text-gray-900 p-6 rounded-xl border border-gray-200 max-w-lg mx-auto">
      <BrandHeader
        title="Fee Invoice"
        docNo={`No: ${invoice.invoiceNumber || "—"}`}
        right={<StatusPill status={status} />}
      />
      <MetaGrid
        rows={[
          ["Billed To", <span className="font-bold">{invoice.studentName || "—"}</span>],
          ["Course / Batch", invoice.courseName || "—"],
          ["Issued", issuedMs ? fmtDateTime(issuedMs) : "—"],
          ["Due Date", invoice.dueDate || "—"],
        ]}
      />
      <table className="w-full text-[13px] mt-4 border border-gray-300">
        <thead>
          <tr className="bg-gray-100">
            <th className="text-left px-2 py-1.5 border-b border-gray-300 w-10">S.N.</th>
            <th className="text-left px-2 py-1.5 border-b border-gray-300">Particulars</th>
            <th className="text-right px-2 py-1.5 border-b border-gray-300 w-28">Amount</th>
          </tr>
        </thead>
        <tbody>
          {items.length > 0 ? (
            items.map((it, i) => (
              <tr key={i}>
                <td className="px-2 py-1.5 border-b border-gray-200 text-gray-500">{i + 1}</td>
                <td className="px-2 py-1.5 border-b border-gray-200 font-medium">
                  {it.description || "—"}
                </td>
                <td className="px-2 py-1.5 border-b border-gray-200 text-right">
                  {fmtRs(it.amount || 0)}
                </td>
              </tr>
            ))
          ) : (
            <tr>
              <td className="px-2 py-1.5 border-b border-gray-200 text-gray-500">1</td>
              <td className="px-2 py-1.5 border-b border-gray-200 font-medium">
                Course Fee{invoice.courseName ? ` — ${invoice.courseName}` : ""}
              </td>
              <td className="px-2 py-1.5 border-b border-gray-200 text-right">
                {fmtRs(invoice.totalAmount)}
              </td>
            </tr>
          )}
        </tbody>
      </table>
      <div className="mt-3 ml-auto w-64 space-y-1">
        <div className="flex justify-between text-[13px]">
          <span className="font-medium text-gray-600">Total Fee</span>
          <span className="font-semibold">{fmtRs(invoice.totalAmount)}</span>
        </div>
        {!!invoice.discount && invoice.discount > 0 && (
          <div className="flex justify-between text-[13px]">
            <span className="font-medium text-gray-600">Discount</span>
            <span className="font-semibold text-emerald-700">− {fmtRs(invoice.discount)}</span>
          </div>
        )}
        {!!invoice.tax && invoice.tax > 0 && (
          <div className="flex justify-between text-[13px]">
            <span className="font-medium text-gray-600">Tax (included)</span>
            <span className="font-semibold">{fmtRs(invoice.tax)}</span>
          </div>
        )}
        <div className="flex justify-between text-[14px] border-t-2 border-gray-900 pt-1">
          <span className="font-bold text-gray-900">Grand Total</span>
          <span className="font-extrabold text-gray-900">{fmtRs(invoice.totalAmount)}</span>
        </div>
        <div className="flex justify-between text-[13px]">
          <span className="font-medium text-gray-600">Paid</span>
          <span className="font-semibold text-emerald-700">{fmtRs(paid)}</span>
        </div>
      </div>
      {pending > 0 ? (
        <div className="mt-2 rounded-lg border-2 border-red-500 bg-red-50 px-3 py-2 flex justify-between items-center">
          <span className="text-sm font-bold uppercase tracking-wide text-red-700">
            Balance Due
          </span>
          <span className="text-xl font-black text-red-700">{fmtRs(pending)}</span>
        </div>
      ) : (
        <div className="mt-2 rounded-lg border-2 border-emerald-500 bg-emerald-50 px-3 py-2 text-center text-sm font-black uppercase tracking-widest text-emerald-700">
          Paid in Full
        </div>
      )}
      <InWords amount={invoice.totalAmount} />
      {invoice.notes && (
        <div className="mt-3">
          <FieldRow label="Notes" value={invoice.notes} />
        </div>
      )}
      <DocFooter note="Payable at the institute office — Cash / eSewa / Khalti accepted. Please quote the invoice number while paying." />
    </div>
  );
}

export function InvoiceModal({
  invoice,
  onClose,
}: {
  invoice: InvoiceDocData | null;
  onClose: () => void;
}) {
  const { t } = useAdminT();
  const docRef = useRef<HTMLDivElement>(null);
  return (
    <Modal open={!!invoice} onClose={onClose} size="md" title={t("invoiceTitle")}>
      {invoice && (
        <>
          <div ref={docRef}>
            <InvoiceDoc invoice={invoice} />
          </div>
          <div className="flex justify-end gap-3 mt-5 no-print">
            <button onClick={onClose} className="ap-btn-ghost">
              <X className="w-4 h-4" /> {t("closeLabel")}
            </button>
            <button onClick={() => printArea(docRef.current)} className="ap-btn">
              <Printer className="w-4 h-4" /> {t("printLabel")}
            </button>
          </div>
        </>
      )}
    </Modal>
  );
}
