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
import { fmtDateTime, fmtRs, methodLabel, type PaymentTxn } from "@/lib/finance";
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

/* ───────────────────────── shared document chrome ───────────────────────── */

function DocHeader({ title, docNo }: { title: string; docNo: string }) {
  return (
    <div className="text-center border-b-2 border-gray-800 pb-3 mb-4">
      <h1 className="text-xl font-extrabold tracking-wide text-gray-900">{site.name}</h1>
      <p className="text-[11px] text-gray-600 mt-0.5">{site.location}</p>
      <p className="text-[11px] text-gray-600">
        Ph: {site.phones.join(", ")} · {site.email}
      </p>
      <p className="text-sm font-bold uppercase tracking-widest text-gray-900 mt-2">{title}</p>
      <p className="text-xs font-mono text-gray-700">{docNo}</p>
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

function DocFooter({ note }: { note: string }) {
  return (
    <div className="mt-8 flex justify-between items-end text-[11px] text-gray-600">
      <p className="max-w-[60%]">{note}</p>
      <div className="text-center">
        <div className="w-40 border-t border-gray-500 pt-1 font-semibold text-gray-800">
          Authorized Signature
        </div>
      </div>
    </div>
  );
}

/* ───────────────────────── receipt ───────────────────────── */

export function ReceiptDoc({ txn }: { txn: PaymentTxn }) {
  return (
    <div className="receipt-doc bg-white text-gray-900 p-6 rounded-xl border border-gray-200 max-w-lg mx-auto">
      <DocHeader title="Payment Receipt" docNo={`Receipt No: ${txn.receiptNumber || "—"}`} />
      <div className="mb-3">
        <FieldRow
          label="Transaction ID"
          value={<span className="font-mono">{txn.transactionId || "—"}</span>}
        />
        <FieldRow label="Received From" value={txn.personName || "—"} />
        <FieldRow label="Role" value={txn.personRole ? txn.personRole : "—"} />
        <FieldRow label="Payment Type" value={txn.paymentType || "—"} />
        <FieldRow
          label="Amount"
          value={<span className="text-base font-extrabold">{fmtRs(txn.amount)}</span>}
        />
        <FieldRow label="Method" value={methodLabel(txn.method)} />
        {txn.reference && <FieldRow label="Reference" value={txn.reference} />}
        {txn.invoiceNumber && <FieldRow label="Against Invoice" value={txn.invoiceNumber} />}
        <FieldRow label="Date & Time" value={fmtDateTime(txn.date)} />
        <FieldRow label="Recorded By" value={txn.recordedBy || "—"} />
        <FieldRow label="Status" value={(txn.status || "completed").toUpperCase()} />
      </div>
      <DocFooter note="This is a computer-generated receipt and is valid without a physical signature." />
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
  notes?: string;
  items: { description?: string; amount?: number }[];
  paid: number;
}

export function InvoiceDoc({ invoice }: { invoice: InvoiceDocData }) {
  const paid = invoice.paid ?? 0;
  const pending = Math.max(invoice.totalAmount - paid, 0);
  return (
    <div className="invoice-doc bg-white text-gray-900 p-6 rounded-xl border border-gray-200 max-w-lg mx-auto">
      <DocHeader title="Fee Invoice" docNo={`Invoice No: ${invoice.invoiceNumber || "—"}`} />
      <div className="mb-3">
        <FieldRow label="Billed To" value={invoice.studentName || "—"} />
        {invoice.courseName && <FieldRow label="Course / Batch" value={invoice.courseName} />}
        {invoice.dueDate && <FieldRow label="Due Date" value={invoice.dueDate} />}
        <FieldRow label="Status" value={(invoice.status || "pending").toUpperCase()} />
      </div>
      {invoice.items && invoice.items.length > 0 && (
        <table className="w-full text-[13px] mb-3 border border-gray-300">
          <thead>
            <tr className="bg-gray-100">
              <th className="text-left px-2 py-1.5 border-b border-gray-300">Description</th>
              <th className="text-right px-2 py-1.5 border-b border-gray-300 w-28">Amount</th>
            </tr>
          </thead>
          <tbody>
            {invoice.items.map((it, i) => (
              <tr key={i}>
                <td className="px-2 py-1.5 border-b border-gray-200">{it.description || "—"}</td>
                <td className="px-2 py-1.5 border-b border-gray-200 text-right">
                  {fmtRs(it.amount || 0)}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
      <div className="border-t-2 border-gray-800 pt-2 space-y-1">
        <div className="flex justify-between text-[13px]">
          <span className="font-medium text-gray-600">Total Fee</span>
          <span className="font-semibold">{fmtRs(invoice.totalAmount)}</span>
        </div>
        <div className="flex justify-between text-[13px]">
          <span className="font-medium text-gray-600">Paid</span>
          <span className="font-semibold">{fmtRs(paid)}</span>
        </div>
        <div className="flex justify-between text-sm">
          <span className="font-bold text-gray-900">Pending</span>
          <span className="font-extrabold">{fmtRs(pending)}</span>
        </div>
      </div>
      <DocFooter note="Payable at the institute office. Keep this invoice for your records." />
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
