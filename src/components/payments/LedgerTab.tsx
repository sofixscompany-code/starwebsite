/**
 * Central Ledger tab — Person → Role → Payment Type → Total → Paid → Pending.
 * One row per person, merging fee invoices, defined payables and payments.
 */

import { useMemo, useRef, useState } from "react";
import { Download, Plus, Printer, Eye, FileText, Wallet, Clock, Users } from "lucide-react";
import { toast } from "sonner";
import { Badge, DataTable, EmptyState, Modal, StatCard, Toolbar } from "@/components/admin/ui";
import { useAdminT } from "@/lib/admin-i18n";
import {
  downloadCsv,
  fmtDateTime,
  fmtRs,
  invoicesForRow,
  ledgerStatusLabel,
  ledgerTone,
  paidAgainstInvoice,
  paymentTypeLabel,
  PERSON_ROLES,
  roleLabel,
  txnsForRow,
  type LedgerRow,
  type PaymentTxn,
} from "@/lib/finance";
import { printArea, ReceiptModal, InvoiceModal, type InvoiceDocData } from "./Printable";
import type { FinanceData } from "@/hooks/use-finance";
import type { PaymentPrefill } from "./modals";

export function LedgerTab({
  data,
  onRecord,
}: {
  data: FinanceData;
  onRecord: (prefill?: PaymentPrefill) => void;
}) {
  const { t } = useAdminT();
  const [q, setQ] = useState("");
  const [roleF, setRoleF] = useState("all");
  const [statusF, setStatusF] = useState("all");
  const [detail, setDetail] = useState<LedgerRow | null>(null);
  const [receipt, setReceipt] = useState<PaymentTxn | null>(null);
  const [invoiceDoc, setInvoiceDoc] = useState<InvoiceDocData | null>(null);
  const printRef = useRef<HTMLDivElement>(null);

  const rows = useMemo(
    () =>
      data.ledger.filter((r) => {
        const needle = q.trim().toLowerCase();
        const mq =
          !needle ||
          r.personName.toLowerCase().includes(needle) ||
          r.personId.toLowerCase() === needle;
        const mr = roleF === "all" || r.personRole === roleF;
        const ms = statusF === "all" || r.status === statusF;
        return mq && mr && ms;
      }),
    [data.ledger, q, roleF, statusF],
  );

  const exportCsv = () => {
    if (rows.length === 0) {
      toast.error(t("nothingToExport"));
      return;
    }
    downloadCsv(
      `central-ledger-${new Date().toISOString().slice(0, 10)}.csv`,
      [
        "Person",
        "Role",
        "Payment Type",
        "Total (Rs)",
        "Paid (Rs)",
        "Pending (Rs)",
        "Status",
        "Transactions",
        "Last Activity",
      ],
      rows.map((r) => [
        r.personName,
        roleLabel(r.personRole),
        paymentTypeLabel(r.paymentType),
        r.total,
        r.paid,
        r.pending,
        ledgerStatusLabel(r.status),
        r.txnCount,
        fmtDateTime(r.lastDate),
      ]),
    );
    toast.success(t("exportedMsg"));
  };

  const detailTxns = detail ? txnsForRow(data.txns, detail) : [];
  const detailInvoices = detail ? invoicesForRow(data.invoices, detail) : [];

  const showInvoice = (i: Record<string, unknown>) => {
    setInvoiceDoc({
      invoiceNumber: String(i.invoiceNumber || ""),
      studentName: String(i.studentName || ""),
      courseName: String(i.courseName || ""),
      totalAmount: Number(i.totalAmount || i.amount || 0),
      dueDate: String(i.dueDate || ""),
      status: String(i.status || "pending"),
      items: Array.isArray(i.items) ? (i.items as InvoiceDocData["items"]) : [],
      paid: paidAgainstInvoice(data.rawPayments, String(i.id || "")),
    });
  };

  if (data.loading) {
    return (
      <div className="space-y-3">
        {[1, 2, 3, 4].map((i) => (
          <div key={i} className="h-14 rounded-xl bg-gray-100 dark:bg-gray-700/50 animate-pulse" />
        ))}
      </div>
    );
  }

  if (data.error) {
    return (
      <EmptyState
        icon={FileText}
        title={t("errorLoad")}
        desc={t("ledgerErrorDesc")}
        action={{ label: t("tryAgain"), onClick: () => window.location.reload() }}
      />
    );
  }

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-2 xl:grid-cols-4 gap-4">
        <StatCard
          label={t("totalPayableLabel")}
          value={fmtRs(data.totals.total)}
          icon={FileText}
          tone="blue"
        />
        <StatCard
          label={t("totalCollectedLabel")}
          value={fmtRs(data.totals.paid)}
          icon={Wallet}
          tone="success"
        />
        <StatCard
          label={t("totalPendingLabel")}
          value={fmtRs(data.totals.pending)}
          icon={Clock}
          tone="danger"
        />
        <StatCard
          label={t("accountsLabel")}
          value={data.ledger.length}
          icon={Users}
          tone="purple"
        />
      </div>

      <Toolbar>
        <div className="w-64">
          <input
            value={q}
            onChange={(e) => setQ(e.target.value)}
            placeholder={t("searchPerson")}
            className="ap-input"
          />
        </div>
        <select value={roleF} onChange={(e) => setRoleF(e.target.value)} className="ap-input !w-40">
          <option value="all">{t("allRoles")}</option>
          {PERSON_ROLES.map((r) => (
            <option key={r} value={r}>
              {t(`role_${r}`)}
            </option>
          ))}
        </select>
        <select
          value={statusF}
          onChange={(e) => setStatusF(e.target.value)}
          className="ap-input !w-36"
        >
          <option value="all">{t("allStatuses")}</option>
          <option value="pending">{t("status_pending")}</option>
          <option value="partial">{t("status_partial")}</option>
          <option value="cleared">{t("status_cleared")}</option>
        </select>
        <div className="ml-auto flex flex-wrap gap-2">
          <button onClick={() => onRecord()} className="ap-btn">
            <Plus className="w-4 h-4" /> {t("recordPayment")}
          </button>
          <button onClick={exportCsv} className="ap-btn-secondary">
            <Download className="w-4 h-4" /> {t("exportCsvLabel")}
          </button>
          <button onClick={() => printArea(printRef.current)} className="ap-btn-ghost">
            <Printer className="w-4 h-4" /> {t("printLabel")}
          </button>
        </div>
      </Toolbar>

      <div ref={printRef}>
        <div className="hidden print:block text-center mb-3 font-bold text-lg">
          {t("ledgerTab")} — {new Date().toISOString().slice(0, 10)}
        </div>
        <DataTable
          rows={rows}
          columns={[
            {
              key: "personName",
              label: t("personLabel"),
              render: (r: LedgerRow) => (
                <div>
                  <p className="font-semibold text-gray-900 dark:text-white">{r.personName}</p>
                  {r.personId && (
                    <p className="text-[11px] text-gray-400 font-mono">{r.personId}</p>
                  )}
                </div>
              ),
            },
            {
              key: "personRole",
              label: t("roleLabel"),
              render: (r: LedgerRow) => (
                <Badge
                  tone={r.personRole === "teacher" || r.personRole === "staff" ? "purple" : "info"}
                >
                  {roleLabel(r.personRole) || "—"}
                </Badge>
              ),
            },
            {
              key: "paymentType",
              label: t("paymentTypeLabel"),
              render: (r: LedgerRow) => paymentTypeLabel(r.paymentType),
            },
            {
              key: "total",
              label: t("totalAmountLabel"),
              render: (r: LedgerRow) => <span className="font-semibold">{fmtRs(r.total)}</span>,
            },
            {
              key: "paid",
              label: t("paidLabel"),
              render: (r: LedgerRow) => (
                <span className="font-semibold text-emerald-600">{fmtRs(r.paid)}</span>
              ),
            },
            {
              key: "pending",
              label: t("pendingLabel"),
              render: (r: LedgerRow) => (
                <span
                  className={`font-semibold ${r.pending > 0 ? "text-brand-red" : "text-gray-400"}`}
                >
                  {fmtRs(r.pending)}
                </span>
              ),
            },
            {
              key: "status",
              label: t("statusLabel"),
              render: (r: LedgerRow) => (
                <Badge tone={ledgerTone(r.status)}>{ledgerStatusLabel(r.status)}</Badge>
              ),
            },
            {
              key: "txnCount",
              label: t("txnCountLabel"),
              render: (r: LedgerRow) => r.txnCount,
            },
          ]}
          actions={(r: LedgerRow) => (
            <button onClick={() => setDetail(r)} className="ap-btn-ghost whitespace-nowrap">
              <Eye className="w-4 h-4" /> {t("detailsLabel")}
            </button>
          )}
        />
      </div>

      {rows.length === 0 && (
        <EmptyState
          icon={FileText}
          title={t("noLedgerRows")}
          desc={t("noLedgerRowsDesc")}
          action={{ label: t("recordPayment"), onClick: () => onRecord() }}
        />
      )}

      {/* Person detail */}
      <Modal
        open={!!detail}
        onClose={() => setDetail(null)}
        size="xl"
        title={detail ? `${detail.personName} — ${roleLabel(detail.personRole)}` : ""}
      >
        {detail && (
          <div className="space-y-5">
            <div className="grid grid-cols-3 gap-3">
              <div className="p-3 rounded-xl bg-blue-50 dark:bg-blue-500/10 border border-blue-200/60">
                <p className="text-xs text-gray-500">{t("totalAmountLabel")}</p>
                <p className="text-lg font-bold text-navy">{fmtRs(detail.total)}</p>
              </div>
              <div className="p-3 rounded-xl bg-emerald-50 dark:bg-emerald-500/10 border border-emerald-200/60">
                <p className="text-xs text-gray-500">{t("paidLabel")}</p>
                <p className="text-lg font-bold text-emerald-600">{fmtRs(detail.paid)}</p>
              </div>
              <div className="p-3 rounded-xl bg-red-50 dark:bg-red-500/10 border border-red-200/60">
                <p className="text-xs text-gray-500">{t("pendingLabel")}</p>
                <p className="text-lg font-bold text-brand-red">{fmtRs(detail.pending)}</p>
              </div>
            </div>

            <div>
              <div className="flex items-center justify-between mb-2">
                <h4 className="text-sm font-bold text-gray-900 dark:text-white">
                  {t("transactionsTab")} ({detailTxns.length})
                </h4>
                <button
                  onClick={() =>
                    onRecord({
                      personRole: detail.personRole || "student",
                      personId: detail.personId,
                      personName: detail.personName,
                      paymentType: detail.paymentType || undefined,
                    })
                  }
                  className="ap-btn"
                >
                  <Plus className="w-4 h-4" /> {t("recordPayment")}
                </button>
              </div>
              {detailTxns.length === 0 ? (
                <p className="text-sm text-gray-400 py-3">{t("noPersonTxns")}</p>
              ) : (
                <div className="overflow-x-auto rounded-xl border border-gray-200 dark:border-gray-700">
                  <table className="w-full text-sm">
                    <thead>
                      <tr className="bg-gray-50 dark:bg-gray-750 text-[11px] uppercase tracking-wider text-gray-500">
                        <th className="text-left px-3 py-2">{t("txnIdLabel")}</th>
                        <th className="text-left px-3 py-2">{t("dateLabel")}</th>
                        <th className="text-right px-3 py-2">{t("amountLabel")}</th>
                        <th className="text-left px-3 py-2">{t("methodLabel")}</th>
                        <th className="text-left px-3 py-2">{t("receiptNoLabel")}</th>
                        <th className="px-3 py-2" />
                      </tr>
                    </thead>
                    <tbody>
                      {detailTxns.map((tx) => (
                        <tr
                          key={tx.id}
                          className="border-t border-gray-100 dark:border-gray-700/50"
                        >
                          <td className="px-3 py-2 font-mono text-xs">{tx.transactionId || "—"}</td>
                          <td className="px-3 py-2">{fmtDateTime(tx.date)}</td>
                          <td className="px-3 py-2 text-right font-semibold">{fmtRs(tx.amount)}</td>
                          <td className="px-3 py-2">{tx.method || "—"}</td>
                          <td className="px-3 py-2 font-mono text-xs">{tx.receiptNumber || "—"}</td>
                          <td className="px-3 py-2 text-right">
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

            <div>
              <h4 className="text-sm font-bold text-gray-900 dark:text-white mb-2">
                {t("invoicesTab")} ({detailInvoices.length})
              </h4>
              {detailInvoices.length === 0 ? (
                <p className="text-sm text-gray-400 py-3">{t("noPersonInvoices")}</p>
              ) : (
                <div className="space-y-2">
                  {detailInvoices.map((i) => (
                    <div
                      key={String(i.id)}
                      className="flex items-center justify-between gap-3 p-3 rounded-xl bg-gray-50 dark:bg-gray-700/30"
                    >
                      <div className="min-w-0">
                        <p className="text-sm font-semibold text-gray-900 dark:text-white font-mono">
                          {String(i.invoiceNumber || "—")}
                        </p>
                        <p className="text-xs text-gray-500">
                          {fmtRs(Number(i.totalAmount || i.amount || 0))} ·{" "}
                          {String(i.status || "pending")}
                        </p>
                      </div>
                      <button
                        onClick={() => showInvoice(i as Record<string, unknown>)}
                        className="ap-btn-ghost whitespace-nowrap"
                      >
                        <Printer className="w-4 h-4" /> {t("printInvoiceLabel")}
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        )}
      </Modal>

      <ReceiptModal txn={receipt} onClose={() => setReceipt(null)} />
      <InvoiceModal invoice={invoiceDoc} onClose={() => setInvoiceDoc(null)} />
    </div>
  );
}
