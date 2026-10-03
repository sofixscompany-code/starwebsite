/**
 * Read-only "My Payments" view for student / parent / teacher roles.
 * Shows the scoped central-ledger summary, payment history with printable
 * receipts, and (for students/parents) their fee invoices.
 */

import { useState } from "react";
import { Link } from "react-router-dom";
import {
  Receipt,
  FileText,
  Wallet,
  Clock,
  Printer,
  Loader2,
  AlertCircle,
  CreditCard,
} from "lucide-react";
import { Badge, DataTable, EmptyState, StatCard } from "@/components/admin/ui";
import { useAdminT } from "@/lib/admin-i18n";
import { useMyFinance } from "@/hooks/use-finance";
import {
  fmtDateTime,
  fmtRs,
  invoiceStatusAfterPaid,
  ledgerStatusLabel,
  ledgerTone,
  methodLabel,
  roleLabel,
  type PaymentTxn,
} from "@/lib/finance";
import { printArea, ReceiptModal, InvoiceModal, type InvoiceDocData } from "./Printable";

type InvoiceRow = InvoiceDocData & { id: string };

const STATUS_TONE = (s: string): "success" | "warning" | "danger" | "info" | "muted" =>
  s === "paid"
    ? "success"
    : s === "partial"
      ? "warning"
      : s === "cancelled"
        ? "muted"
        : s === "overdue"
          ? "danger"
          : "info";

export function MyPayments() {
  const { t } = useAdminT();
  const fin = useMyFinance();
  const [receipt, setReceipt] = useState<PaymentTxn | null>(null);
  const [invoiceDoc, setInvoiceDoc] = useState<InvoiceDocData | null>(null);

  const isTeacher = fin.role === "teacher";

  const invoiceRows: InvoiceRow[] = fin.invoices.map((i) => {
    const total = Number(i.totalAmount || i.amount || 0);
    return {
      id: String(i.id),
      invoiceNumber: String(i.invoiceNumber || "—"),
      studentName: String(i.studentName || ""),
      courseName: String(i.courseName || ""),
      totalAmount: total,
      dueDate: String(i.dueDate || ""),
      status: String(i.status || "pending"),
      items: Array.isArray(i.items) ? (i.items as InvoiceDocData["items"]) : [],
      paid: 0,
    } as InvoiceRow;
  });

  // Paid per invoice comes from this user's scoped payments.
  const paidByInvoice = new Map<string, number>();
  fin.transactions.forEach((tx) => {
    if (!tx.invoiceId) return;
    paidByInvoice.set(tx.invoiceId, (paidByInvoice.get(tx.invoiceId) || 0) + tx.amount);
  });
  invoiceRows.forEach((r) => {
    r.paid = paidByInvoice.get(r.id) ?? r.paid;
    r.status = invoiceStatusAfterPaid(r.totalAmount, r.paid, r.dueDate, r.status);
  });

  if (fin.loading) {
    return (
      <div className="flex items-center justify-center min-h-[50vh]">
        <div className="text-center">
          <Loader2 className="w-8 h-8 animate-spin mx-auto text-navy" />
          <p className="text-sm text-gray-400 mt-3">{t("loading")}</p>
        </div>
      </div>
    );
  }

  if (fin.error) {
    return (
      <EmptyState
        icon={AlertCircle}
        title={t("errorLoad")}
        desc={t("paymentsErrorDesc")}
        action={{ label: t("tryAgain"), onClick: () => window.location.reload() }}
      />
    );
  }

  const summaryCards = isTeacher
    ? [
        {
          label: t("payableLabel"),
          value: fmtRs(fin.summary.total),
          icon: Wallet,
          tone: "blue" as const,
        },
        {
          label: t("paidLabel"),
          value: fmtRs(fin.summary.paid),
          icon: Receipt,
          tone: "success" as const,
        },
        {
          label: t("remainingLabel"),
          value: fmtRs(fin.summary.pending),
          icon: Clock,
          tone: "danger" as const,
        },
        {
          label: t("transactionsTab"),
          value: fin.summary.txnCount,
          icon: CreditCard,
          tone: "purple" as const,
        },
      ]
    : [
        {
          label: t("totalFeeLabel"),
          value: fmtRs(fin.summary.total),
          icon: Wallet,
          tone: "blue" as const,
        },
        {
          label: t("feePaidLabel"),
          value: fmtRs(fin.summary.paid),
          icon: Receipt,
          tone: "success" as const,
        },
        {
          label: t("feePendingLabel"),
          value: fmtRs(fin.summary.pending),
          icon: Clock,
          tone: "danger" as const,
        },
        {
          label: t("invoicesTab"),
          value: fin.summary.invoiceCount,
          icon: FileText,
          tone: "purple" as const,
        },
      ];

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-2 xl:grid-cols-4 gap-4">
        {summaryCards.map((c) => (
          <StatCard key={c.label} label={c.label} value={c.value} icon={c.icon} tone={c.tone} />
        ))}
      </div>

      {/* Parent: per-child fee summary */}
      {fin.role === "parent" && (
        <div className="bg-white dark:bg-gray-800 rounded-2xl border border-gray-200 dark:border-gray-700 p-5">
          <h3 className="text-sm font-bold text-gray-900 dark:text-white mb-1">
            {t("childrenOverview")}
          </h3>
          <p className="text-xs text-gray-400 mb-4">{t("childFeeSummarySub")}</p>
          {fin.children.length === 0 ? (
            <p className="text-sm text-gray-400 py-4 text-center">{t("noChildrenLinked")}</p>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {fin.children.map((c) => (
                <div
                  key={c.id}
                  className="p-4 rounded-xl bg-gray-50 dark:bg-gray-700/30 flex items-center justify-between gap-3"
                >
                  <div className="min-w-0">
                    <p className="text-sm font-bold text-gray-900 dark:text-white truncate">
                      {c.name}
                    </p>
                    <p className="text-xs text-gray-500">
                      {t("totalFeeLabel")}: {fmtRs(c.total)} · {t("feePaidLabel")}: {fmtRs(c.paid)}
                    </p>
                  </div>
                  <span
                    className={`text-sm font-bold shrink-0 ${c.pending > 0 ? "text-brand-red" : "text-emerald-600"}`}
                  >
                    {c.pending > 0 ? fmtRs(c.pending) : t("status_cleared")}
                  </span>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Payment history */}
      <div className="bg-white dark:bg-gray-800 rounded-2xl border border-gray-200 dark:border-gray-700 overflow-hidden">
        <div className="px-5 py-3.5 border-b border-gray-200 dark:border-gray-700 flex items-center justify-between">
          <div>
            <h3 className="text-sm font-bold text-gray-900 dark:text-white uppercase tracking-wide">
              {t("paymentHistory")}
            </h3>
            <p className="text-xs text-gray-400 mt-0.5">{t("paymentHistorySub")}</p>
          </div>
          <Link to="/admin/payments" className="ap-btn-ghost hidden sm:inline-flex">
            {t("viewAllPayments")}
          </Link>
        </div>
        {fin.transactions.length === 0 ? (
          <div className="py-10">
            <EmptyState
              icon={Receipt}
              title={t("noPaymentHistory")}
              desc={t("noPaymentHistoryDesc")}
            />
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="bg-gray-50 dark:bg-gray-750 text-[11px] uppercase tracking-wider text-gray-500">
                  <th className="text-left px-5 py-3">{t("txnIdLabel")}</th>
                  <th className="text-left px-5 py-3">{t("dateLabel")}</th>
                  <th className="text-right px-5 py-3">{t("amountLabel")}</th>
                  <th className="text-left px-5 py-3">{t("methodLabel")}</th>
                  <th className="text-left px-5 py-3">{t("receiptNoLabel")}</th>
                  <th className="px-5 py-3" />
                </tr>
              </thead>
              <tbody>
                {fin.transactions.slice(0, 12).map((tx) => (
                  <tr
                    key={tx.id}
                    className="border-t border-gray-100 dark:border-gray-700/50 hover:bg-gray-50 dark:hover:bg-gray-700/40"
                  >
                    <td className="px-5 py-3 font-mono text-xs font-bold text-navy">
                      {tx.transactionId || "—"}
                    </td>
                    <td className="px-5 py-3 text-gray-600 dark:text-gray-300">
                      {fmtDateTime(tx.date)}
                    </td>
                    <td className="px-5 py-3 text-right font-bold text-emerald-600">
                      {fmtRs(tx.amount)}
                    </td>
                    <td className="px-5 py-3">
                      <Badge tone="purple">{methodLabel(tx.method)}</Badge>
                    </td>
                    <td className="px-5 py-3 font-mono text-xs text-gray-500">
                      {tx.receiptNumber || "—"}
                    </td>
                    <td className="px-5 py-3 text-right">
                      <button
                        onClick={() => setReceipt(tx)}
                        className="ap-btn-ghost whitespace-nowrap"
                      >
                        <Printer className="w-4 h-4" /> {t("printReceiptLabel")}
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Invoices (students / parents) */}
      {!isTeacher && (
        <div className="bg-white dark:bg-gray-800 rounded-2xl border border-gray-200 dark:border-gray-700 overflow-hidden">
          <div className="px-5 py-3.5 border-b border-gray-200 dark:border-gray-700">
            <h3 className="text-sm font-bold text-gray-900 dark:text-white uppercase tracking-wide">
              {t("invoicesTab")}
            </h3>
            <p className="text-xs text-gray-400 mt-0.5">{t("invoicesMineSub")}</p>
          </div>
          {invoiceRows.length === 0 ? (
            <div className="py-10">
              <EmptyState
                icon={FileText}
                title={t("noInvoicesYet")}
                desc={t("noInvoicesYetDesc")}
              />
            </div>
          ) : (
            <DataTable
              rows={invoiceRows}
              columns={[
                {
                  key: "invoiceNumber",
                  label: t("invoiceNoLabel"),
                  render: (r: InvoiceRow) => (
                    <span className="font-mono font-bold text-navy">{r.invoiceNumber}</span>
                  ),
                },
                {
                  key: "totalAmount",
                  label: t("totalAmountLabel"),
                  render: (r: InvoiceRow) => fmtRs(r.totalAmount),
                },
                {
                  key: "paid",
                  label: t("paidLabel"),
                  render: (r: InvoiceRow) => (
                    <span className="text-emerald-600 font-semibold">{fmtRs(r.paid)}</span>
                  ),
                },
                {
                  key: "pending",
                  label: t("pendingLabel"),
                  render: (r: InvoiceRow) => (
                    <span
                      className={`font-semibold ${r.totalAmount - r.paid > 0 ? "text-brand-red" : "text-gray-400"}`}
                    >
                      {fmtRs(Math.max(r.totalAmount - r.paid, 0))}
                    </span>
                  ),
                },
                {
                  key: "status",
                  label: t("statusLabel"),
                  render: (r: InvoiceRow) => (
                    <Badge tone={STATUS_TONE(r.status)}>{t(`status_${r.status}`)}</Badge>
                  ),
                },
              ]}
              actions={(r: InvoiceRow) => (
                <button onClick={() => setInvoiceDoc(r)} className="ap-btn-ghost whitespace-nowrap">
                  <Printer className="w-4 h-4" /> {t("printInvoiceLabel")}
                </button>
              )}
            />
          )}
        </div>
      )}

      {/* Ledger row for this person */}
      {fin.ledger.length > 0 && (
        <div className="bg-white dark:bg-gray-800 rounded-2xl border border-gray-200 dark:border-gray-700 p-5">
          <h3 className="text-sm font-bold text-gray-900 dark:text-white mb-3">{t("ledgerTab")}</h3>
          <div className="space-y-2">
            {fin.ledger.map((r) => (
              <div
                key={r.key}
                className="flex flex-wrap items-center justify-between gap-3 p-3 rounded-xl bg-gray-50 dark:bg-gray-700/30"
              >
                <div>
                  <p className="text-sm font-semibold text-gray-900 dark:text-white">
                    {r.personName}{" "}
                    <span className="text-xs font-normal text-gray-400">
                      · {roleLabel(r.personRole)}
                    </span>
                  </p>
                  <p className="text-xs text-gray-500">
                    {t("totalAmountLabel")}: {fmtRs(r.total)} · {t("paidLabel")}: {fmtRs(r.paid)} ·{" "}
                    {t("pendingLabel")}: {fmtRs(r.pending)}
                  </p>
                </div>
                <Badge tone={ledgerTone(r.status)}>{ledgerStatusLabel(r.status)}</Badge>
              </div>
            ))}
          </div>
        </div>
      )}

      {!fin.hasData && (
        <EmptyState icon={Wallet} title={t("noPaymentsYet")} desc={t("noScopedPaymentsDesc")} />
      )}

      <ReceiptModal txn={receipt} onClose={() => setReceipt(null)} />
      <InvoiceModal invoice={invoiceDoc} onClose={() => setInvoiceDoc(null)} />
    </div>
  );
}
