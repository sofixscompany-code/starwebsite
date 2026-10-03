/**
 * Reports tab — daily / monthly / yearly summaries, payment-method-wise
 * breakdown, role-wise collection, with CSV export and print/PDF.
 */

import { useMemo, useRef, useState } from "react";
import { Download, Printer, Wallet, Receipt, TrendingDown, TrendingUp } from "lucide-react";
import { toast } from "sonner";
import { ProgressBar, DataTable, EmptyState, StatCard, Toolbar } from "@/components/admin/ui";
import { useAdminT } from "@/lib/admin-i18n";
import {
  buildReport,
  downloadCsv,
  fmtRs,
  methodBreakdown,
  methodLabel,
  roleLabel,
  type ReportGroup,
} from "@/lib/finance";
import { printArea } from "./Printable";
import type { FinanceData } from "@/hooks/use-finance";

export function ReportsTab({ data }: { data: FinanceData }) {
  const { t } = useAdminT();
  const [from, setFrom] = useState("");
  const [to, setTo] = useState("");
  const [group, setGroup] = useState<ReportGroup>("monthly");
  const printRef = useRef<HTMLDivElement>(null);

  const report = useMemo(
    () => buildReport(data.txns, data.expenses, group, from || undefined, to || undefined),
    [data.txns, data.expenses, group, from, to],
  );

  const methods = useMemo(
    () => methodBreakdown(data.txns, from || undefined, to || undefined),
    [data.txns, from, to],
  );

  const totals = useMemo(() => {
    const collected = data.txns
      .filter((tx) => {
        if (["failed", "refunded", "cancelled", "void"].includes(tx.status.toLowerCase()))
          return false;
        if (!tx.date) return true;
        const day = new Date(tx.date).toISOString().slice(0, 10);
        if (from && day < from) return false;
        if (to && day > to) return false;
        return true;
      })
      .reduce((s, tx) => s + tx.amount, 0);
    const expenses = data.expenses
      .filter((e) => {
        const ms = Number(e.createdAt) || 0;
        if (!ms) return true;
        const day = new Date(ms).toISOString().slice(0, 10);
        if (from && day < from) return false;
        if (to && day > to) return false;
        return true;
      })
      .reduce((s, e) => s + Number(e.amount || 0), 0);
    const txnCount = data.txns.filter((tx) => {
      if (["failed", "refunded", "cancelled", "void"].includes(tx.status.toLowerCase()))
        return false;
      if (!tx.date) return true;
      const day = new Date(tx.date).toISOString().slice(0, 10);
      return (!from || day >= from) && (!to || day <= to);
    }).length;
    return { collected, expenses, net: collected - expenses, txnCount };
  }, [data.txns, data.expenses, from, to]);

  const roleRows = useMemo(() => {
    const map = new Map<string, { role: string; count: number; amount: number }>();
    data.txns.forEach((tx) => {
      if (["failed", "refunded", "cancelled", "void"].includes(tx.status.toLowerCase())) return;
      if (tx.date) {
        const day = new Date(tx.date).toISOString().slice(0, 10);
        if (from && day < from) return;
        if (to && day > to) return;
      }
      const key = tx.personRole || "other";
      let row = map.get(key);
      if (!row) {
        row = { role: key, count: 0, amount: 0 };
        map.set(key, row);
      }
      row.count += 1;
      row.amount += tx.amount;
    });
    return [...map.values()].sort((a, b) => b.amount - a.amount);
  }, [data.txns, from, to]);

  const methodTotal = methods.reduce((s, m) => s + m.amount, 0) || 1;

  const exportCsv = () => {
    if (report.length === 0) {
      toast.error(t("nothingToExport"));
      return;
    }
    downloadCsv(
      `finance-report-${group}-${new Date().toISOString().slice(0, 10)}.csv`,
      ["Period", "Transactions", "Collected (Rs)", "Expenses (Rs)", "Net (Rs)"],
      report.map((r) => [r.period, r.count, r.collected, r.expenses, r.net]),
    );
    toast.success(t("exportedMsg"));
  };

  const hasAny = data.txns.length > 0 || data.expenses.length > 0;

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-2 xl:grid-cols-4 gap-4">
        <StatCard
          label={t("collectedLabel")}
          value={fmtRs(totals.collected)}
          icon={Wallet}
          tone="success"
        />
        <StatCard label={t("transactionsTab")} value={totals.txnCount} icon={Receipt} tone="blue" />
        <StatCard
          label={t("expensesLabel")}
          value={fmtRs(totals.expenses)}
          icon={TrendingDown}
          tone="warning"
        />
        <StatCard label={t("netLabel")} value={fmtRs(totals.net)} icon={TrendingUp} tone="purple" />
      </div>

      <Toolbar>
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
        <select
          value={group}
          onChange={(e) => setGroup(e.target.value as ReportGroup)}
          className="ap-input !w-36"
        >
          <option value="daily">{t("daily")}</option>
          <option value="monthly">{t("monthly")}</option>
          <option value="yearly">{t("yearly")}</option>
        </select>
        <div className="ml-auto flex flex-wrap gap-2">
          <button onClick={exportCsv} className="ap-btn-secondary">
            <Download className="w-4 h-4" /> {t("exportCsvLabel")}
          </button>
          <button onClick={() => printArea(printRef.current)} className="ap-btn">
            <Printer className="w-4 h-4" /> {t("printLabel")}
          </button>
        </div>
      </Toolbar>

      <div ref={printRef} className="space-y-4">
        <div className="hidden print:block text-center mb-3 font-bold text-lg">
          {t("reportsTab")} — {new Date().toISOString().slice(0, 10)}
        </div>

        {!hasAny ? (
          <EmptyState icon={Wallet} title={t("noReportData")} desc={t("noReportDataDesc")} />
        ) : (
          <>
            <div>
              <h4 className="text-sm font-bold text-gray-900 dark:text-white mb-2">
                {t("periodSummary")} ·{" "}
                {t(group === "daily" ? "daily" : group === "monthly" ? "monthly" : "yearly")}
              </h4>
              <DataTable
                rows={report}
                columns={[
                  { key: "period", label: t("periodLabel") },
                  { key: "count", label: t("countLabel") },
                  {
                    key: "collected",
                    label: t("collectedLabel"),
                    render: (r: { collected: number }) => (
                      <span className="font-semibold text-emerald-600">{fmtRs(r.collected)}</span>
                    ),
                  },
                  {
                    key: "expenses",
                    label: t("expensesLabel"),
                    render: (r: { expenses: number }) => (
                      <span className="font-semibold text-brand-red">{fmtRs(r.expenses)}</span>
                    ),
                  },
                  {
                    key: "net",
                    label: t("netLabel"),
                    render: (r: { net: number }) => (
                      <span className="font-bold">{fmtRs(r.net)}</span>
                    ),
                  },
                ]}
              />
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
              <div className="bg-white dark:bg-gray-800 rounded-2xl border border-gray-200 dark:border-gray-700 p-5">
                <h4 className="text-sm font-bold text-gray-900 dark:text-white mb-1">
                  {t("methodWise")}
                </h4>
                <p className="text-xs text-gray-400 mb-4">{t("methodWiseSub")}</p>
                {methods.length === 0 ? (
                  <p className="text-sm text-gray-400 py-4 text-center">{t("noPaymentsYet")}</p>
                ) : (
                  <div className="space-y-3">
                    {methods.map((m) => (
                      <div key={m.method}>
                        <div className="flex items-center justify-between text-sm mb-1">
                          <span className="font-medium text-gray-700 dark:text-gray-300">
                            {methodLabel(m.method)}{" "}
                            <span className="text-xs text-gray-400">({m.count})</span>
                          </span>
                          <span className="font-semibold">{fmtRs(m.amount)}</span>
                        </div>
                        <ProgressBar
                          value={Math.round((m.amount / methodTotal) * 100)}
                          tone="blue"
                        />
                      </div>
                    ))}
                  </div>
                )}
              </div>

              <div className="bg-white dark:bg-gray-800 rounded-2xl border border-gray-200 dark:border-gray-700 p-5">
                <h4 className="text-sm font-bold text-gray-900 dark:text-white mb-1">
                  {t("roleWise")}
                </h4>
                <p className="text-xs text-gray-400 mb-4">{t("roleWiseSub")}</p>
                {roleRows.length === 0 ? (
                  <p className="text-sm text-gray-400 py-4 text-center">{t("noPaymentsYet")}</p>
                ) : (
                  <DataTable
                    rows={roleRows}
                    columns={[
                      {
                        key: "role",
                        label: t("roleLabel"),
                        render: (r: { role: string }) => roleLabel(r.role),
                      },
                      { key: "count", label: t("countLabel") },
                      {
                        key: "amount",
                        label: t("collectedLabel"),
                        render: (r: { amount: number }) => (
                          <span className="font-semibold">{fmtRs(r.amount)}</span>
                        ),
                      },
                    ]}
                  />
                )}
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
