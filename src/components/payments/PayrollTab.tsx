/**
 * Teacher & Staff Pay tab — define payable (salary) amounts, record payments,
 * and show total / paid / remaining with a full payment history.
 */

import { useMemo, useRef, useState } from "react";
import { Download, Plus, Printer, Pencil, Trash2, Wallet, Users, Clock } from "lucide-react";
import { toast } from "sonner";
import { Badge, DataTable, EmptyState, Modal, StatCard, Toolbar } from "@/components/admin/ui";
import { useAdminT } from "@/lib/admin-i18n";
import {
  downloadCsv,
  fmtDateTime,
  fmtRs,
  ledgerStatusLabel,
  ledgerTone,
  paymentTypeLabel,
  txnsForRow,
  type LedgerRow,
  type PaymentTxn,
} from "@/lib/finance";
import { printArea, ReceiptModal } from "./Printable";
import type { FinanceData } from "@/hooks/use-finance";
import type { PaymentPrefill } from "./modals";
import type { ModuleRecord } from "@/hooks/use-module-data";

export function PayrollTab({
  data,
  onRecord,
  onAddPayable,
  onEditPayable,
}: {
  data: FinanceData;
  onRecord: (prefill?: PaymentPrefill) => void;
  onAddPayable: () => void;
  onEditPayable: (doc: ModuleRecord) => void;
}) {
  const { t } = useAdminT();
  const [q, setQ] = useState("");
  const [roleF, setRoleF] = useState("all");
  const [detail, setDetail] = useState<LedgerRow | null>(null);
  const [receipt, setReceipt] = useState<PaymentTxn | null>(null);
  const printRef = useRef<HTMLDivElement>(null);

  const rows = useMemo(() => {
    const needle = q.trim().toLowerCase();
    return data.ledger.filter((r) => {
      const isStaffRow = r.personRole === "teacher" || r.personRole === "staff";
      const hasPayable = data.payables.some(
        (p) =>
          String(p.personRole || "") === r.personRole &&
          String(p.personName || "") === r.personName,
      );
      if (!isStaffRow && !hasPayable) return false;
      if (roleF !== "all" && r.personRole !== roleF) return false;
      if (needle && !r.personName.toLowerCase().includes(needle)) return false;
      return true;
    });
  }, [data.ledger, data.payables, q, roleF]);

  const totals = rows.reduce(
    (acc, r) => ({
      total: acc.total + r.total,
      paid: acc.paid + r.paid,
      pending: acc.pending + r.pending,
    }),
    { total: 0, paid: 0, pending: 0 },
  );

  const payablesFor = (row: LedgerRow) =>
    data.payables.filter(
      (p) =>
        String(p.personName || "") === row.personName &&
        (!row.personRole || String(p.personRole || "") === row.personRole),
    );

  const exportCsv = () => {
    if (rows.length === 0) {
      toast.error(t("nothingToExport"));
      return;
    }
    downloadCsv(
      `teacher-staff-pay-${new Date().toISOString().slice(0, 10)}.csv`,
      [
        "Person",
        "Role",
        "Payment Type",
        "Payable (Rs)",
        "Paid (Rs)",
        "Remaining (Rs)",
        "Status",
        "Transactions",
      ],
      rows.map((r) => [
        r.personName,
        r.personRole,
        paymentTypeLabel(r.paymentType),
        r.total,
        r.paid,
        r.pending,
        ledgerStatusLabel(r.status),
        r.txnCount,
      ]),
    );
    toast.success(t("exportedMsg"));
  };

  const handleDeletePayable = async (row: LedgerRow) => {
    const docs = payablesFor(row);
    if (docs.length === 0) return;
    if (!window.confirm(t("confirmDeletePayable"))) return;
    try {
      for (const d of docs) await data.removePayable(d.id);
      toast.success(t("payableDeletedMsg"));
    } catch {
      toast.error(t("paymentFailedMsg"));
    }
  };

  const detailPayables = detail ? payablesFor(detail) : [];
  const detailTxns = detail ? txnsForRow(data.txns, detail) : [];

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-2 xl:grid-cols-4 gap-4">
        <StatCard
          label={t("totalPayableLabel")}
          value={fmtRs(totals.total)}
          icon={Wallet}
          tone="blue"
        />
        <StatCard label={t("paidLabel")} value={fmtRs(totals.paid)} icon={Users} tone="success" />
        <StatCard
          label={t("remainingLabel")}
          value={fmtRs(totals.pending)}
          icon={Clock}
          tone="danger"
        />
        <StatCard label={t("accountsLabel")} value={rows.length} icon={Users} tone="purple" />
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
          <option value="teacher">{t("role_teacher")}</option>
          <option value="staff">{t("role_staff")}</option>
        </select>
        <div className="ml-auto flex flex-wrap gap-2">
          <button onClick={onAddPayable} className="ap-btn">
            <Plus className="w-4 h-4" /> {t("definePayable")}
          </button>
          <button
            onClick={() => onRecord({ personRole: "teacher", paymentType: "salary" })}
            className="ap-btn-secondary"
          >
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
          {t("payrollTab")} — {new Date().toISOString().slice(0, 10)}
        </div>
        {rows.length === 0 ? (
          <EmptyState
            icon={Wallet}
            title={t("noPayrollRows")}
            desc={t("noPayrollRowsDesc")}
            action={{ label: t("definePayable"), onClick: onAddPayable }}
          />
        ) : (
          <DataTable
            rows={rows}
            columns={[
              {
                key: "personName",
                label: t("personLabel"),
                render: (r: LedgerRow) => <span className="font-semibold">{r.personName}</span>,
              },
              {
                key: "personRole",
                label: t("roleLabel"),
                render: (r: LedgerRow) => <Badge tone="purple">{t(`role_${r.personRole}`)}</Badge>,
              },
              {
                key: "paymentType",
                label: t("paymentTypeLabel"),
                render: (r: LedgerRow) => paymentTypeLabel(r.paymentType),
              },
              {
                key: "total",
                label: t("payableLabel"),
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
                label: t("remainingLabel"),
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
            ]}
            actions={(r: LedgerRow) => (
              <div className="flex items-center gap-1 justify-end">
                <button
                  onClick={() =>
                    onRecord({
                      personRole: r.personRole || "teacher",
                      personId: r.personId,
                      personName: r.personName,
                      paymentType: r.paymentType || "salary",
                    })
                  }
                  className="ap-btn-ghost whitespace-nowrap"
                >
                  <Plus className="w-4 h-4" /> {t("recordPayment")}
                </button>
                <button onClick={() => setDetail(r)} className="ap-btn-ghost whitespace-nowrap">
                  <Printer className="w-4 h-4" /> {t("historyLabel")}
                </button>
                {payablesFor(r).length > 0 && (
                  <>
                    <button
                      onClick={() => onEditPayable(payablesFor(r)[0])}
                      className="ap-btn-ghost whitespace-nowrap"
                    >
                      <Pencil className="w-4 h-4" /> {t("editLabel")}
                    </button>
                    <button
                      onClick={() => handleDeletePayable(r)}
                      className="ap-btn-danger whitespace-nowrap"
                    >
                      <Trash2 className="w-4 h-4" /> {t("deleteLabel")}
                    </button>
                  </>
                )}
              </div>
            )}
          />
        )}
      </div>

      {/* Payable definition + payment history */}
      <Modal
        open={!!detail}
        onClose={() => setDetail(null)}
        size="lg"
        title={detail ? `${detail.personName} — ${t("salaryHistoryLabel")}` : ""}
      >
        {detail && (
          <div className="space-y-4">
            <div className="grid grid-cols-3 gap-3">
              <div className="p-3 rounded-xl bg-blue-50 dark:bg-blue-500/10 border border-blue-200/60">
                <p className="text-xs text-gray-500">{t("payableLabel")}</p>
                <p className="text-lg font-bold text-navy">{fmtRs(detail.total)}</p>
              </div>
              <div className="p-3 rounded-xl bg-emerald-50 dark:bg-emerald-500/10 border border-emerald-200/60">
                <p className="text-xs text-gray-500">{t("paidLabel")}</p>
                <p className="text-lg font-bold text-emerald-600">{fmtRs(detail.paid)}</p>
              </div>
              <div className="p-3 rounded-xl bg-red-50 dark:bg-red-500/10 border border-red-200/60">
                <p className="text-xs text-gray-500">{t("remainingLabel")}</p>
                <p className="text-lg font-bold text-brand-red">{fmtRs(detail.pending)}</p>
              </div>
            </div>

            {detailPayables.map((p) => (
              <div
                key={String(p.id)}
                className="p-3 rounded-xl bg-gray-50 dark:bg-gray-700/30 text-sm text-gray-600 dark:text-gray-300"
              >
                <span className="font-semibold">{t("payableLabel")}:</span>{" "}
                {fmtRs(Number(p.totalAmount || 0))}
                {p.period ? ` · ${String(p.period)}` : ""}
                {p.notes ? ` · ${String(p.notes)}` : ""}
              </div>
            ))}

            <div>
              <div className="flex items-center justify-between mb-2">
                <h4 className="text-sm font-bold text-gray-900 dark:text-white">
                  {t("transactionsTab")} ({detailTxns.length})
                </h4>
                <button
                  onClick={() =>
                    onRecord({
                      personRole: detail.personRole || "teacher",
                      personId: detail.personId,
                      personName: detail.personName,
                      paymentType: detail.paymentType || "salary",
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
                <div className="space-y-2">
                  {detailTxns.map((tx) => (
                    <div
                      key={tx.id}
                      className="flex items-center justify-between gap-3 p-3 rounded-xl bg-gray-50 dark:bg-gray-700/30"
                    >
                      <div className="min-w-0">
                        <p className="text-sm font-semibold text-gray-900 dark:text-white">
                          {fmtRs(tx.amount)} · {tx.method || "—"}
                        </p>
                        <p className="text-[11px] text-gray-500 font-mono">
                          {tx.transactionId || "—"} · {tx.receiptNumber || "—"} ·{" "}
                          {fmtDateTime(tx.date)}
                        </p>
                      </div>
                      <button
                        onClick={() => setReceipt(tx)}
                        className="ap-btn-ghost whitespace-nowrap"
                      >
                        <Printer className="w-4 h-4" /> {t("printReceiptLabel")}
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
    </div>
  );
}
