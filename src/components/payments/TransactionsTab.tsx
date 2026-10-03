/**
 * Transactions tab — every payment with Transaction ID, Receipt No, invoice link,
 * date/time, payment method and recorded-by audit trail.
 */

import { useMemo, useRef, useState } from "react";
import { Download, Plus, Printer, Trash2, Receipt, FileText } from "lucide-react";
import { toast } from "sonner";
import { Badge, DataTable, EmptyState, StatCard, Toolbar } from "@/components/admin/ui";
import { useAdminT } from "@/lib/admin-i18n";
import {
  downloadCsv,
  fmtDate,
  fmtDateTime,
  fmtRs,
  methodLabel,
  PAYMENT_METHODS,
  PERSON_ROLES,
  paymentTypeLabel,
  roleLabel,
  type PaymentTxn,
} from "@/lib/finance";
import { printArea, ReceiptModal } from "./Printable";
import type { FinanceData } from "@/hooks/use-finance";
import type { PaymentPrefill } from "./modals";

export function TransactionsTab({
  data,
  onRecord,
}: {
  data: FinanceData;
  onRecord: (prefill?: PaymentPrefill) => void;
}) {
  const { t } = useAdminT();
  const [q, setQ] = useState("");
  const [roleF, setRoleF] = useState("all");
  const [methodF, setMethodF] = useState("all");
  const [from, setFrom] = useState("");
  const [to, setTo] = useState("");
  const [receipt, setReceipt] = useState<PaymentTxn | null>(null);
  const printRef = useRef<HTMLDivElement>(null);

  const rows = useMemo(() => {
    const needle = q.trim().toLowerCase();
    return data.txns.filter((tx) => {
      if (needle) {
        const hay = [
          tx.transactionId,
          tx.receiptNumber,
          tx.invoiceNumber,
          tx.personName,
          tx.studentName,
          tx.reference,
        ]
          .join(" ")
          .toLowerCase();
        if (!hay.includes(needle)) return false;
      }
      if (roleF !== "all" && tx.personRole !== roleF) return false;
      if (methodF !== "all" && tx.method !== methodF) return false;
      if (tx.date) {
        const day = fmtDate(tx.date);
        if (from && day < from) return false;
        if (to && day > to) return false;
      }
      return true;
    });
  }, [data.txns, q, roleF, methodF, from, to]);

  const collected = rows.reduce(
    (s, tx) =>
      ["failed", "refunded", "cancelled", "void"].includes(tx.status.toLowerCase())
        ? s
        : s + tx.amount,
    0,
  );

  const exportCsv = () => {
    if (rows.length === 0) {
      toast.error(t("nothingToExport"));
      return;
    }
    downloadCsv(
      `transactions-${new Date().toISOString().slice(0, 10)}.csv`,
      [
        "Transaction ID",
        "Receipt No",
        "Invoice No",
        "Person",
        "Role",
        "Payment Type",
        "Amount (Rs)",
        "Method",
        "Reference",
        "Date & Time",
        "Recorded By",
        "Status",
      ],
      rows.map((tx) => [
        tx.transactionId,
        tx.receiptNumber,
        tx.invoiceNumber,
        tx.personName,
        roleLabel(tx.personRole),
        paymentTypeLabel(tx.paymentType),
        tx.amount,
        methodLabel(tx.method),
        tx.reference,
        fmtDateTime(tx.date),
        tx.recordedBy,
        tx.status,
      ]),
    );
    toast.success(t("exportedMsg"));
  };

  const handleDelete = async (tx: PaymentTxn) => {
    if (!window.confirm(t("confirmDeletePayment"))) return;
    try {
      await data.removePayment(tx.id);
      toast.success(t("paymentDeletedMsg"));
    } catch {
      toast.error(t("paymentFailedMsg"));
    }
  };

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-2 xl:grid-cols-4 gap-4">
        <StatCard label={t("transactionsTab")} value={rows.length} icon={Receipt} tone="blue" />
        <StatCard
          label={t("totalCollectedLabel")}
          value={fmtRs(collected)}
          icon={Download}
          tone="success"
        />
        <StatCard
          label={t("invoicesTab")}
          value={new Set(rows.map((r) => r.invoiceNumber).filter(Boolean)).size}
          icon={FileText}
          tone="purple"
        />
        <StatCard
          label={t("uniqueTxnsLabel")}
          value={new Set(rows.map((r) => r.transactionId).filter(Boolean)).size}
          icon={Printer}
          tone="info"
        />
      </div>

      <Toolbar>
        <div className="w-72">
          <input
            value={q}
            onChange={(e) => setQ(e.target.value)}
            placeholder={t("searchTxn")}
            className="ap-input"
          />
        </div>
        <select value={roleF} onChange={(e) => setRoleF(e.target.value)} className="ap-input !w-36">
          <option value="all">{t("allRoles")}</option>
          {PERSON_ROLES.map((r) => (
            <option key={r} value={r}>
              {t(`role_${r}`)}
            </option>
          ))}
        </select>
        <select
          value={methodF}
          onChange={(e) => setMethodF(e.target.value)}
          className="ap-input !w-40"
        >
          <option value="all">{t("allMethods")}</option>
          {PAYMENT_METHODS.map((m) => (
            <option key={m} value={m}>
              {t(`method_${m}`)}
            </option>
          ))}
        </select>
        <input
          type="date"
          value={from}
          onChange={(e) => setFrom(e.target.value)}
          className="ap-input !w-40"
          aria-label={t("reportsFrom")}
        />
        <input
          type="date"
          value={to}
          onChange={(e) => setTo(e.target.value)}
          className="ap-input !w-40"
          aria-label={t("reportsTo")}
        />
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
          {t("transactionsTab")} — {new Date().toISOString().slice(0, 10)}
        </div>
        {rows.length === 0 ? (
          <EmptyState
            icon={Receipt}
            title={t("noPaymentsYet")}
            desc={t("noPaymentsYetDesc")}
            action={{ label: t("recordPayment"), onClick: () => onRecord() }}
          />
        ) : (
          <DataTable
            rows={rows}
            columns={[
              {
                key: "transactionId",
                label: t("txnIdLabel"),
                render: (tx: PaymentTxn) => (
                  <div>
                    <p className="font-mono text-xs font-bold text-navy">
                      {tx.transactionId || "—"}
                    </p>
                    <p className="font-mono text-[11px] text-gray-400">{tx.receiptNumber || "—"}</p>
                  </div>
                ),
              },
              {
                key: "date",
                label: t("dateLabel"),
                render: (tx: PaymentTxn) => fmtDateTime(tx.date),
              },
              {
                key: "personName",
                label: t("personLabel"),
                render: (tx: PaymentTxn) => (
                  <div>
                    <p className="font-semibold text-gray-900 dark:text-white">{tx.personName}</p>
                    <Badge tone="muted" className="mt-0.5">
                      {roleLabel(tx.personRole) || "—"}
                    </Badge>
                  </div>
                ),
              },
              {
                key: "paymentType",
                label: t("paymentTypeLabel"),
                render: (tx: PaymentTxn) => paymentTypeLabel(tx.paymentType),
              },
              {
                key: "amount",
                label: t("amountLabel"),
                render: (tx: PaymentTxn) => (
                  <span className="font-bold text-emerald-600">{fmtRs(tx.amount)}</span>
                ),
              },
              {
                key: "method",
                label: t("methodLabel"),
                render: (tx: PaymentTxn) => <Badge tone="purple">{methodLabel(tx.method)}</Badge>,
              },
              {
                key: "invoiceNumber",
                label: t("invoiceNoLabel"),
                render: (tx: PaymentTxn) => tx.invoiceNumber || "—",
              },
              {
                key: "recordedBy",
                label: t("recordedByLabel"),
                render: (tx: PaymentTxn) => tx.recordedBy || "—",
              },
            ]}
            actions={(tx: PaymentTxn) => (
              <div className="flex items-center gap-1 justify-end">
                <button onClick={() => setReceipt(tx)} className="ap-btn-ghost whitespace-nowrap">
                  <Printer className="w-4 h-4" /> {t("printReceiptLabel")}
                </button>
                <button
                  onClick={() => handleDelete(tx)}
                  className="ap-btn-danger whitespace-nowrap"
                >
                  <Trash2 className="w-4 h-4" /> {t("deleteLabel")}
                </button>
              </div>
            )}
          />
        )}
      </div>

      <ReceiptModal txn={receipt} onClose={() => setReceipt(null)} />
    </div>
  );
}
