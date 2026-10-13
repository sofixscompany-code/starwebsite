import { Wallet, TrendingDown, PiggyBank } from "lucide-react";
import { useAdminT } from "@/lib/admin-i18n";

/**
 * Daily Budget — shared card for the super-admin & accountant dashboards.
 * Shows today's income, today's expenses, and the net (income − expense)
 * with a spent-vs-earned progress bar.
 */
export function DailyBudget({
  income,
  expense,
  loading,
}: {
  income: number;
  expense: number;
  loading: boolean;
}) {
  const { t } = useAdminT();
  const net = income - expense;
  const overBudget = expense > income;
  const fmt = (n: number) => "Rs " + Math.abs(Math.round(n)).toLocaleString("en-IN");
  const spentPct = income > 0 ? Math.min(100, Math.round((expense / income) * 100)) : 0;

  if (loading) {
    return <div className="animate-pulse rounded-xl bg-gray-200 dark:bg-gray-800 h-48" />;
  }

  return (
    <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-5 shadow-sm">
      <div className="flex flex-wrap items-center justify-between gap-2 mb-4">
        <div>
          <h3 className="text-sm font-bold text-gray-900 dark:text-white">{t("dailyBudget")}</h3>
          <p className="text-xs text-gray-400 mt-0.5">{t("dailyBudgetSub")}</p>
        </div>
        <span
          className={
            "text-[11px] font-bold px-2.5 py-1 rounded-full " +
            (overBudget
              ? "bg-red-100 text-red-700 dark:bg-red-500/10 dark:text-red-400"
              : "bg-emerald-100 text-emerald-700 dark:bg-emerald-500/10 dark:text-emerald-400")
          }
        >
          {overBudget ? t("budgetOver") : t("budgetOk")}
        </span>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
        <div className="rounded-xl bg-emerald-50 dark:bg-emerald-500/10 border border-emerald-200/60 p-4">
          <div className="flex items-center gap-1.5 text-emerald-600">
            <Wallet className="w-4 h-4" />
            <p className="text-[11px] font-semibold">{t("todayCollection")}</p>
          </div>
          <p className="text-xl font-bold text-emerald-700 dark:text-emerald-400 mt-1">
            {fmt(income)}
          </p>
        </div>
        <div className="rounded-xl bg-red-50 dark:bg-red-500/10 border border-red-200/60 p-4">
          <div className="flex items-center gap-1.5 text-red-500">
            <TrendingDown className="w-4 h-4" />
            <p className="text-[11px] font-semibold">{t("todayExpense")}</p>
          </div>
          <p className="text-xl font-bold text-red-600 dark:text-red-400 mt-1">{fmt(expense)}</p>
        </div>
        <div
          className={
            "rounded-xl border p-4 " +
            (net >= 0
              ? "bg-navy/5 border-navy/20"
              : "bg-red-50 dark:bg-red-500/10 border-red-200/60")
          }
        >
          <div className={"flex items-center gap-1.5 " + (net >= 0 ? "text-navy" : "text-red-500")}>
            <PiggyBank className="w-4 h-4" />
            <p className="text-[11px] font-semibold">{t("todayNet")}</p>
          </div>
          <p
            className={
              "text-xl font-extrabold mt-1 " +
              (net >= 0 ? "text-navy dark:text-white" : "text-red-600 dark:text-red-400")
            }
          >
            {net < 0 ? "− " : ""}
            {fmt(net)}
          </p>
        </div>
      </div>

      <div className="mt-4">
        <div className="flex justify-between text-[11px] text-gray-500 dark:text-gray-400 mb-1">
          <span>{t("budgetSpentLabel")}</span>
          <span className="font-semibold">{spentPct}%</span>
        </div>
        <div className="w-full h-2.5 bg-gray-100 dark:bg-gray-700 rounded-full overflow-hidden">
          <div
            className={
              "h-full rounded-full " +
              (overBudget ? "bg-red-500" : "bg-gradient-to-r from-emerald-400 to-emerald-600")
            }
            style={{ width: spentPct + "%" }}
          />
        </div>
        <p className="text-[11px] text-gray-400 mt-1.5">
          {overBudget ? t("budgetOverNote") : t("remainingLabel")}: {fmt(net)}
        </p>
      </div>
    </div>
  );
}
