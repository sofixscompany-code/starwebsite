import { useEffect, useState } from "react";
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  CartesianGrid,
} from "recharts";
import {
  Wallet,
  Clock,
  TrendingUp,
  TrendingDown,
  CreditCard,
  DollarSign,
  BarChart3,
  FileText,
  RefreshCw,
} from "lucide-react";
import { motion } from "framer-motion";
import { Link } from "react-router-dom";
import { useAccountantDashboard } from "@/hooks/use-dashboard-data";
import { useAdminT, formatClock } from "@/lib/admin-i18n";
import { useLedgerSnapshot } from "@/hooks/use-finance";
import { roleLabel } from "@/lib/finance";

/** Loading placeholder block. */
function Skel({ className = "" }: { className?: string }) {
  return <div className={"animate-pulse rounded-xl bg-gray-200 dark:bg-gray-800 " + className} />;
}

export function AccountantDashboard() {
  const { data: fin, isLoading, isFetching, refetch, dataUpdatedAt } = useAccountantDashboard();
  const { data: ledgerSnap, isLoading: ledgerLoading, isError: ledgerError } = useLedgerSnapshot();
  const { t, lang } = useAdminT();
  // Live day/date string — refreshes with the minute, never hardcoded.
  const [now, setNow] = useState(() => new Date());
  useEffect(() => {
    const id = window.setInterval(() => setNow(new Date()), 30000);
    return () => window.clearInterval(id);
  }, []);
  const { full: dateStr } = formatClock(now, lang);
  const hasData = !!fin?.hasData;

  const fmt = (n: number) =>
    n >= 100000 ? "Rs " + (n / 100000).toFixed(2) + "L" : "Rs " + n.toLocaleString();

  const updatedStr = dataUpdatedAt
    ? new Date(dataUpdatedAt).toLocaleTimeString("en-US", { hour: "2-digit", minute: "2-digit" })
    : "—";

  const statCards = [
    {
      label: t("todaysCollection"),
      value: hasData && fin ? fmt(fin.todayCollection) : "Rs 0",
      icon: Wallet,
      color: "from-emerald-500 to-emerald-600",
      bg: "bg-emerald-50",
    },
    {
      label: t("pendingDuesLabel"),
      value: hasData && fin ? fmt(fin.pendingDues) : "Rs 0",
      icon: Clock,
      color: "from-brand-red to-brand-red/80",
      bg: "bg-brand-red/5",
    },
    {
      label: t("monthlyRev"),
      value: hasData && fin ? fmt(fin.monthRevenue) : "Rs 0",
      icon: TrendingUp,
      color: "from-navy to-navy/80",
      bg: "bg-navy/5",
    },
    {
      label: t("monthlyExp"),
      value: hasData && fin ? fmt(fin.monthExpense) : "Rs 0",
      icon: TrendingDown,
      color: "from-gold to-gold/80",
      bg: "bg-gold/5",
    },
  ];

  const txnRows = fin?.recentTxns ?? [];
  const chartRows =
    hasData && fin?.incomeByMonth && fin.incomeByMonth.length > 0
      ? fin.incomeByMonth.map((row, i) => ({
          m: row.month,
          income: row.amount,
          expense: fin.expenseByMonth?.[i]?.amount ?? 0,
        }))
      : [];
  const feeRows =
    hasData && fin?.feeBreakdown
      ? fin.feeBreakdown
          .filter((f) => f.total > 0)
          .map((f) => ({
            label: f.label,
            collected: f.collected,
            target: f.total,
            amount: f.total,
          }))
      : [];
  const netBalance = hasData && fin ? fin.monthRevenue - fin.monthExpense : null;

  return (
    <div className="space-y-6">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="relative overflow-hidden rounded-2xl bg-navy p-6 md:p-8 text-white"
      >
        <div className="absolute -right-20 -top-20 w-72 h-72 rounded-full bg-gold/10 blur-3xl" />
        <div className="absolute -left-10 -bottom-10 w-48 h-48 rounded-full bg-brand-red/10 blur-2xl" />
        <div className="relative flex flex-wrap items-start justify-between gap-4">
          <div>
            <p className="text-sm text-gold font-medium">{dateStr}</p>
            <p className="text-xs text-white/60 mt-0.5">{t("accountantDashboard")}</p>
            <h1 className="text-2xl md:text-3xl font-bold mt-1 text-white">
              {t("financialOverview")}
            </h1>
            <p className="text-white/70 mt-1 text-sm">{t("accountantIntro")}</p>
          </div>
          <div className="flex flex-col items-end gap-2">
            <button
              onClick={() => void refetch()}
              disabled={isFetching}
              className="inline-flex items-center gap-1.5 px-3 py-2 bg-white/10 hover:bg-white/20 rounded-lg text-xs font-medium transition backdrop-blur-sm text-white disabled:opacity-60"
            >
              <RefreshCw className={"w-3.5 h-3.5 " + (isFetching ? "animate-spin" : "")} />
              {t("refreshLabel")}
            </button>
            <p className="text-[11px] text-white/60">
              {t("updatedLabel")}: {updatedStr}
            </p>
          </div>
        </div>
      </motion.div>

      {isLoading ? (
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
          {Array.from({ length: 4 }).map((_, i) => (
            <Skel key={i} className="h-28" />
          ))}
        </div>
      ) : (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="grid grid-cols-2 sm:grid-cols-4 gap-4"
        >
          {statCards.map((s) => {
            const Icon = s.icon;
            return (
              <motion.div
                key={s.label}
                whileHover={{ y: -4 }}
                className={s.bg + " rounded-xl p-4 border border-gray-200/60 shadow-sm"}
              >
                <div
                  className={
                    "w-10 h-10 rounded-xl bg-gradient-to-br " +
                    s.color +
                    " flex items-center justify-center shadow-md mb-3"
                  }
                >
                  <Icon className="w-5 h-5 text-white" />
                </div>
                <p className="text-xs text-gray-500 font-medium">{s.label}</p>
                <p className="text-xl font-bold text-gray-900 mt-0.5">{s.value}</p>
              </motion.div>
            );
          })}
        </motion.div>
      )}

      <div className="grid grid-cols-1 xl:grid-cols-3 gap-4">
        <div className="xl:col-span-2">
          <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-5 shadow-sm">
            <div className="flex items-center justify-between mb-4">
              <div>
                <h3 className="text-sm font-bold text-gray-900 dark:text-white">
                  {t("incomeVsExpense")}
                </h3>
                <p className="text-xs text-gray-400 mt-0.5">{t("monthlyComparison")}</p>
              </div>
              {netBalance !== null && (
                <span className="text-xs font-semibold text-emerald-600 bg-emerald-50 px-2.5 py-1 rounded-full flex items-center gap-1">
                  <TrendingUp className="w-3 h-3" /> {t("net")}: {fmt(netBalance)}
                </span>
              )}
            </div>
            <div className="h-64">
              {isLoading ? (
                <Skel className="h-64" />
              ) : chartRows.length === 0 ? (
                <div className="h-full flex items-center justify-center">
                  <p className="text-sm text-gray-400 dark:text-gray-500">{t("noData")}</p>
                </div>
              ) : (
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={chartRows}>
                    <defs>
                      <linearGradient id="inG" x1="0" x2="0" y1="0" y2="1">
                        <stop offset="0%" stopColor="#10b981" stopOpacity={0.35} />
                        <stop offset="100%" stopColor="#10b981" stopOpacity={0} />
                      </linearGradient>
                      <linearGradient id="exG" x1="0" x2="0" y1="0" y2="1">
                        <stop offset="0%" stopColor="#EF4444" stopOpacity={0.35} />
                        <stop offset="100%" stopColor="#EF4444" stopOpacity={0} />
                      </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                    <XAxis dataKey="m" stroke="#9ca3af" fontSize={11} />
                    <YAxis stroke="#9ca3af" fontSize={11} />
                    <Tooltip contentStyle={{ background: "#fff", border: "1px solid #e5e7eb" }} />
                    <Area
                      type="monotone"
                      dataKey="income"
                      stroke="#10b981"
                      fill="url(#inG)"
                      strokeWidth={2}
                      name="Income"
                    />
                    <Area
                      type="monotone"
                      dataKey="expense"
                      stroke="#EF4444"
                      fill="url(#exG)"
                      strokeWidth={2}
                      name="Expense"
                    />
                  </AreaChart>
                </ResponsiveContainer>
              )}
            </div>
          </div>
        </div>

        <div>
          <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-5 shadow-sm">
            <h3 className="text-sm font-bold text-gray-900 dark:text-white mb-1">
              {t("recentTxns")}
            </h3>
            <p className="text-xs text-gray-400 mb-4">{t("recentTxnsSub")}</p>
            {isLoading ? (
              <div className="space-y-2">
                {[1, 2, 3, 4].map((i) => (
                  <Skel key={i} className="h-12" />
                ))}
              </div>
            ) : txnRows.length === 0 ? (
              <p className="text-sm text-gray-400 dark:text-gray-500 py-6 text-center">
                {t("noTxns")}
              </p>
            ) : (
              <div className="space-y-1">
                {txnRows.map((txn, i) => (
                  <div
                    key={i}
                    className="flex items-start gap-3 p-2 rounded-xl hover:bg-gray-50 dark:hover:bg-gray-700/50 transition"
                  >
                    <div className="w-2 h-2 rounded-full bg-navy mt-2 shrink-0" />
                    <div className="flex-1 min-w-0">
                      <p className="text-xs font-semibold text-gray-900 dark:text-white">
                        {txn.title}
                      </p>
                      <p className="text-[11px] text-gray-500">{txn.desc}</p>
                    </div>
                    <p className="text-[11px] text-gray-400 shrink-0">{txn.date}</p>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-5 gap-4">
        <div className="xl:col-span-3">
          <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-5 shadow-sm">
            <h3 className="text-sm font-bold text-gray-900 dark:text-white mb-4">
              {t("feeCollectionStatus")}
            </h3>
            {feeRows.length === 0 ? (
              <p className="text-sm text-gray-400 dark:text-gray-500 py-6 text-center">
                {t("noFeeData")}
              </p>
            ) : (
              <div className="space-y-4">
                {feeRows.map((f) => {
                  const percent = Math.round((f.collected / f.target) * 100);
                  return (
                    <div key={f.label}>
                      <div className="flex items-center justify-between mb-1">
                        <p className="text-xs font-semibold text-gray-800 dark:text-gray-200">
                          {f.label}
                        </p>
                        <p className="text-xs text-gray-400">
                          {f.collected}/{f.target} {t("paidSuffix")}
                        </p>
                      </div>
                      <div className="w-full h-2 bg-gray-100 dark:bg-gray-700 rounded-full overflow-hidden">
                        <div
                          className="h-full rounded-full bg-gradient-to-r from-navy to-navy/80"
                          style={{ width: percent + "%" }}
                        />
                      </div>
                      <p className="text-[11px] text-gray-400 mt-1">
                        Rs {f.amount.toLocaleString()} {t("targetSuffix")}
                      </p>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>

        <div className="xl:col-span-2">
          <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-5 shadow-sm">
            <h3 className="text-sm font-bold text-gray-900 dark:text-white mb-3">
              {t("quickActions")}
            </h3>
            <div className="grid grid-cols-2 gap-3">
              {[
                { label: t("recordPayment"), icon: CreditCard, to: "/admin/payments" },
                { label: t("invoice"), icon: FileText, to: "/admin/accounting" },
                { label: t("addExpense"), icon: DollarSign, to: "/admin/accounting" },
                { label: t("Reports"), icon: BarChart3, to: "/admin/reports" },
              ].map((a) => {
                const Icon = a.icon;
                return (
                  <Link
                    key={a.label}
                    to={a.to}
                    className="flex flex-col items-center gap-2 p-3 rounded-xl hover:bg-gray-50 dark:hover:bg-gray-700/50 transition group"
                  >
                    <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-navy to-navy/80 flex items-center justify-center text-white group-hover:scale-110 transition-transform">
                      <Icon className="w-4 h-4" />
                    </div>
                    <span className="text-[10px] font-semibold text-gray-600 dark:text-gray-300 text-center">
                      {a.label}
                    </span>
                  </Link>
                );
              })}
            </div>
          </div>
        </div>
      </div>

      {/* Central ledger + teacher/staff payroll snapshot */}
      <motion.div
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-5 shadow-sm"
      >
        <div className="flex flex-wrap items-center justify-between gap-3 mb-1">
          <div>
            <h3 className="text-sm font-bold text-gray-900 dark:text-white">{t("ledgerTab")}</h3>
            <p className="text-xs text-gray-400 mt-0.5">{t("paymentsInvoicesSub")}</p>
          </div>
          <Link to="/admin/payments" className="ap-btn">
            {t("viewAllPayments")}
          </Link>
        </div>

        {ledgerLoading || !ledgerSnap ? (
          ledgerError ? (
            <p className="text-sm text-brand-red mt-4">{t("errorLoad")}</p>
          ) : (
            <div className="space-y-2 mt-4">
              {[1, 2, 3].map((i) => (
                <div
                  key={i}
                  className="h-10 rounded-xl bg-gray-100 dark:bg-gray-700/50 animate-pulse"
                />
              ))}
            </div>
          )
        ) : (
          <>
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 mt-4">
              <div className="p-3 rounded-xl bg-blue-50 dark:bg-blue-500/10 border border-blue-200/60">
                <p className="text-[11px] text-gray-500">{t("totalPayableLabel")}</p>
                <p className="text-lg font-bold text-navy">{fmt(ledgerSnap.totals.total)}</p>
              </div>
              <div className="p-3 rounded-xl bg-emerald-50 dark:bg-emerald-500/10 border border-emerald-200/60">
                <p className="text-[11px] text-gray-500">{t("totalCollectedLabel")}</p>
                <p className="text-lg font-bold text-emerald-600">{fmt(ledgerSnap.totals.paid)}</p>
              </div>
              <div className="p-3 rounded-xl bg-red-50 dark:bg-red-500/10 border border-red-200/60">
                <p className="text-[11px] text-gray-500">{t("totalPendingLabel")}</p>
                <p className="text-lg font-bold text-brand-red">{fmt(ledgerSnap.totals.pending)}</p>
              </div>
              <div className="p-3 rounded-xl bg-gray-50 dark:bg-gray-700/30 border border-gray-200/60">
                <p className="text-[11px] text-gray-500">{t("payrollTab")}</p>
                <p className="text-lg font-bold text-gray-900 dark:text-white">
                  {fmt(ledgerSnap.payroll.paid)}
                  <span className="text-xs font-semibold text-gray-400">
                    {" "}
                    / {fmt(ledgerSnap.payroll.total)}
                  </span>
                </p>
              </div>
            </div>

            {!ledgerSnap.hasData ? (
              <p className="text-sm text-gray-400 dark:text-gray-500 py-6 text-center">
                {t("noLedgerRowsDesc")}
              </p>
            ) : (
              <div className="mt-4 space-y-1">
                <p className="text-xs font-bold text-gray-500 uppercase tracking-wide">
                  {t("pendingLabel")}
                </p>
                {ledgerSnap.topPending.length === 0 ? (
                  <p className="text-sm text-gray-400 py-3 text-center">{t("status_cleared")}</p>
                ) : (
                  ledgerSnap.topPending.map((r) => (
                    <div
                      key={r.key}
                      className="flex items-center justify-between gap-3 p-2.5 rounded-xl hover:bg-gray-50 dark:hover:bg-gray-700/50 transition"
                    >
                      <div className="min-w-0">
                        <p className="text-sm font-semibold text-gray-900 dark:text-white truncate">
                          {r.personName}
                          <span className="text-[11px] font-normal text-gray-400">
                            {" "}
                            · {roleLabel(r.personRole)}
                          </span>
                        </p>
                        <p className="text-[11px] text-gray-500">
                          {t("totalAmountLabel")}: {fmt(r.total)} · {t("paidLabel")}: {fmt(r.paid)}
                        </p>
                      </div>
                      <span className="text-sm font-bold text-brand-red shrink-0">
                        {fmt(r.pending)}
                      </span>
                    </div>
                  ))
                )}
              </div>
            )}
          </>
        )}
      </motion.div>
    </div>
  );
}
