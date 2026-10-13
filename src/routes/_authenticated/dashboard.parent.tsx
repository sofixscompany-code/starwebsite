import { useEffect, useState } from "react";
import {
  CalendarCheck,
  Trophy,
  Wallet,
  Bell,
  Loader2,
  FileText,
  Clock,
  RefreshCw,
} from "lucide-react";
import { motion } from "framer-motion";
import { Link } from "react-router-dom";
import { useParentDashboard, getStoredAuthUser } from "@/hooks/use-dashboard-data";
import { getUserRole } from "@/lib/api-auth";
import { auth } from "@/integrations/firebase/config";
import { useAdminT, formatClock } from "@/lib/admin-i18n";
import { useMyFinance } from "@/hooks/use-finance";
import { fmtDateTime, fmtRs, methodLabel } from "@/lib/finance";

/** Loading placeholder block. */
function Skel({ className = "" }: { className?: string }) {
  return <div className={"animate-pulse rounded-xl bg-gray-200 dark:bg-gray-800 " + className} />;
}

export function ParentDashboard() {
  const [mounted, setMounted] = useState(false);
  const { t, lang } = useAdminT();
  // Live day/date string — refreshes with the minute, never hardcoded.
  const [now, setNow] = useState(() => new Date());
  useEffect(() => {
    const id = window.setInterval(() => setNow(new Date()), 30000);
    return () => window.clearInterval(id);
  }, []);
  const { full: dateStr } = formatClock(now, lang);
  useEffect(() => {
    if (getUserRole() === "parent") {
      setMounted(true);
    }
  }, []);

  const storedUser = getStoredAuthUser();
  const parentEmail = storedUser?.email || auth.currentUser?.email || undefined;
  const {
    data: stats,
    isLoading,
    isFetching,
    refetch,
    dataUpdatedAt,
  } = useParentDashboard(parentEmail);
  const fin = useMyFinance();

  if (!mounted) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="text-center">
          <Loader2 className="w-8 h-8 animate-spin mx-auto text-navy" />
          <p className="text-sm text-gray-400 mt-3">{t("loadingDashboard")}</p>
        </div>
      </div>
    );
  }

  const updatedStr = dataUpdatedAt
    ? new Date(dataUpdatedAt).toLocaleTimeString("en-US", { hour: "2-digit", minute: "2-digit" })
    : "—";

  const hasData = !!stats?.hasData;
  const childRows = (stats?.children || []).map((c) => {
    const score = Number(c.avgScore);
    const hasScore = Number.isFinite(score);
    return {
      name: String(c.fullName || c.name || c.firstName || "Student"),
      class: String(c.course || c.batch || ""),
      grade: !hasScore ? "—" : score >= 90 ? "A+" : score >= 75 ? "A" : "B",
      hasScore,
      attendance: Number.isFinite(Number(c.attendancePercent)) ? Number(c.attendancePercent) : 0,
      avgScore: hasScore ? score : 0,
    };
  });
  const attPercent = hasData ? (stats?.avgAttendance ?? 0) : null;
  const avgScore = hasData ? (stats?.avgScore ?? 0) : null;
  const pendingHw = stats?.pendingHw ?? 0;
  const activityRows = stats?.activities ?? [];

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
            <p className="text-xs text-white/60 mt-0.5">{t("parentDashboard")}</p>
            <h1 className="text-2xl md:text-3xl font-bold mt-1 text-white">{t("welcomeParent")}</h1>
            <p className="text-white/70 mt-1 text-sm">{t("parentIntro")}</p>
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
        <div className="grid grid-cols-2 sm:grid-cols-3 xl:grid-cols-6 gap-4">
          {Array.from({ length: 6 }).map((_, i) => (
            <Skel key={i} className="h-28" />
          ))}
        </div>
      ) : (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="grid grid-cols-2 sm:grid-cols-3 xl:grid-cols-6 gap-4"
        >
          {[
            {
              label: t("attendanceLabel"),
              value: attPercent === null ? "0%" : attPercent + "%",
              icon: CalendarCheck,
              color: "from-emerald-500 to-emerald-600",
              bg: "bg-emerald-50",
            },
            {
              label: t("myResults"),
              value: avgScore === null ? "0%" : avgScore + "%",
              icon: Trophy,
              color: "from-navy to-navy/80",
              bg: "bg-navy/5",
            },
            {
              label: t("homeworkPend"),
              value: hasData ? String(pendingHw) : "0",
              icon: FileText,
              color: "from-gold to-gold/80",
              bg: "bg-gold/5",
            },
            {
              label: t("notices"),
              value: hasData ? String(stats?.notices?.length ?? 0) : "0",
              icon: Bell,
              color: "from-brand-red to-brand-red/80",
              bg: "bg-brand-red/5",
            },
            {
              label: t("feePaidLabel"),
              value: fin.loading ? "—" : fmtRs(fin.summary.paid),
              icon: Wallet,
              color: "from-emerald-500 to-emerald-600",
              bg: "bg-emerald-50",
            },
            {
              label: t("feePendingLabel"),
              value: fin.loading ? "—" : fmtRs(fin.summary.pending),
              icon: Clock,
              color: "from-navy to-navy/80",
              bg: "bg-navy/5",
            },
          ].map((s) => {
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
        <div className="xl:col-span-2 space-y-4">
          <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-5 shadow-sm">
            <h3 className="text-sm font-bold text-gray-900 dark:text-white mb-1">
              {t("childrenOverview")}
            </h3>
            <p className="text-xs text-gray-400 mb-4">{t("childrenOverviewSub")}</p>
            {isLoading ? (
              <div className="space-y-4">
                {[1, 2].map((i) => (
                  <Skel key={i} className="h-36" />
                ))}
              </div>
            ) : childRows.length === 0 ? (
              <p className="text-sm text-gray-400 dark:text-gray-500 py-6 text-center">
                {t("noChildrenLinked")}
              </p>
            ) : (
              <div className="space-y-4">
                {childRows.map((child, i) => (
                  <div key={i} className="p-4 rounded-xl bg-gray-50 dark:bg-gray-700/30">
                    <div className="flex items-center justify-between mb-3">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-full bg-gradient-to-br from-navy to-navy/80 flex items-center justify-center text-white font-bold text-sm">
                          {child.name
                            .split(" ")
                            .map((n) => n[0])
                            .join("")}
                        </div>
                        <div>
                          <p className="text-sm font-bold text-gray-900 dark:text-white">
                            {child.name}
                          </p>
                          <p className="text-xs text-gray-400">{child.class}</p>
                        </div>
                        <span
                          className={
                            "px-2 py-0.5 rounded text-xs font-bold ml-2 " +
                            (child.hasScore
                              ? "bg-emerald-100 text-emerald-700"
                              : "bg-gray-100 text-gray-400 dark:bg-gray-600 dark:text-gray-300")
                          }
                        >
                          {child.grade}
                        </span>
                      </div>
                    </div>
                    <div className="grid grid-cols-3 gap-4">
                      <div>
                        <p className="text-xs text-gray-400">{t("attendanceLabel")}</p>
                        <p className="text-lg font-bold text-emerald-600">{child.attendance}%</p>
                        <div className="w-full h-1 bg-gray-200 dark:bg-gray-600 rounded-full mt-1">
                          <div
                            className="h-full rounded-full bg-emerald-500"
                            style={{ width: child.attendance + "%" }}
                          />
                        </div>
                      </div>
                      <div>
                        <p className="text-xs text-gray-400">{t("avgScoreLabel")}</p>
                        <p className="text-lg font-bold text-navy">{child.avgScore}%</p>
                        <div className="w-full h-1 bg-gray-200 dark:bg-gray-600 rounded-full mt-1">
                          <div
                            className="h-full rounded-full bg-navy"
                            style={{ width: child.avgScore + "%" }}
                          />
                        </div>
                      </div>
                      <div className="flex items-center justify-end">
                        <Link
                          to="/admin/results"
                          className="text-xs font-semibold text-navy hover:text-navy/80 transition"
                        >
                          {t("viewFullReport")}
                        </Link>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Fees & Payments — linked children's fee info */}
          <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-5 shadow-sm">
            <div className="flex items-center justify-between mb-1">
              <h3 className="text-sm font-bold text-gray-900 dark:text-white">
                {t("myPaymentsTitle")}
              </h3>
              <Link
                to="/admin/payments"
                className="text-xs font-semibold text-navy hover:underline"
              >
                {t("viewAllPayments")}
              </Link>
            </div>
            <p className="text-xs text-gray-400 mb-4">{t("childFeeSummarySub")}</p>
            {fin.loading ? (
              <div className="space-y-2">
                {[1, 2, 3].map((i) => (
                  <div
                    key={i}
                    className="h-10 rounded-xl bg-gray-100 dark:bg-gray-700/50 animate-pulse"
                  />
                ))}
              </div>
            ) : (
              <>
                <div className="grid grid-cols-3 gap-2 mb-4">
                  <div className="p-3 rounded-xl bg-blue-50 dark:bg-blue-500/10 border border-blue-200/60 text-center">
                    <p className="text-[11px] text-gray-500">{t("totalFeeLabel")}</p>
                    <p className="text-sm font-bold text-navy">{fmtRs(fin.summary.total)}</p>
                  </div>
                  <div className="p-3 rounded-xl bg-emerald-50 dark:bg-emerald-500/10 border border-emerald-200/60 text-center">
                    <p className="text-[11px] text-gray-500">{t("feePaidLabel")}</p>
                    <p className="text-sm font-bold text-emerald-600">{fmtRs(fin.summary.paid)}</p>
                  </div>
                  <div className="p-3 rounded-xl bg-red-50 dark:bg-red-500/10 border border-red-200/60 text-center">
                    <p className="text-[11px] text-gray-500">{t("feePendingLabel")}</p>
                    <p className="text-sm font-bold text-brand-red">{fmtRs(fin.summary.pending)}</p>
                  </div>
                </div>

                {fin.children.length > 0 && (
                  <div className="space-y-2 mb-4">
                    {fin.children.map((c) => (
                      <div
                        key={c.id}
                        className="flex items-center justify-between gap-3 p-3 rounded-xl bg-gray-50 dark:bg-gray-700/30"
                      >
                        <div className="min-w-0">
                          <p className="text-sm font-semibold text-gray-900 dark:text-white truncate">
                            {c.name}
                          </p>
                          <p className="text-[11px] text-gray-400">
                            {t("totalFeeLabel")}: {fmtRs(c.total)} · {t("feePaidLabel")}:{" "}
                            {fmtRs(c.paid)}
                          </p>
                        </div>
                        <span
                          className={`text-sm font-bold shrink-0 ${
                            c.pending > 0 ? "text-brand-red" : "text-emerald-600"
                          }`}
                        >
                          {c.pending > 0 ? fmtRs(c.pending) : t("status_cleared")}
                        </span>
                      </div>
                    ))}
                  </div>
                )}

                {fin.transactions.length === 0 ? (
                  <p className="text-sm text-gray-400 dark:text-gray-500 py-4 text-center">
                    {t("noPaymentHistoryDesc")}
                  </p>
                ) : (
                  <div className="space-y-2">
                    <p className="text-xs font-bold text-gray-500 uppercase tracking-wide">
                      {t("paymentHistory")}
                    </p>
                    {fin.transactions.slice(0, 5).map((tx) => (
                      <div
                        key={tx.id}
                        className="flex items-center justify-between gap-3 p-3 rounded-xl hover:bg-gray-50 dark:hover:bg-gray-700/50 transition"
                      >
                        <div className="min-w-0">
                          <p className="text-sm font-semibold text-gray-900 dark:text-white">
                            {fmtRs(tx.amount)} · {methodLabel(tx.method)}
                          </p>
                          <p className="text-[11px] text-gray-400 font-mono truncate">
                            {tx.transactionId || tx.receiptNumber || "—"} · {fmtDateTime(tx.date)}
                          </p>
                        </div>
                        <span className="text-xs font-bold text-emerald-600 shrink-0">
                          {t("paidLabel")}
                        </span>
                      </div>
                    ))}
                  </div>
                )}
              </>
            )}
          </div>

          <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-5 shadow-sm">
            <h3 className="text-sm font-bold text-gray-900 dark:text-white mb-1">
              {t("recentUpdates")}
            </h3>
            <p className="text-xs text-gray-400 mb-4">{t("recentUpdatesSub")}</p>
            {activityRows.length === 0 ? (
              <p className="text-sm text-gray-400 dark:text-gray-500 py-6 text-center">
                {t("noActivity")}
              </p>
            ) : (
              <div className="space-y-1">
                {activityRows.map((u, i) => (
                  <div
                    key={i}
                    className="flex items-start gap-3 p-2.5 rounded-xl hover:bg-gray-50 dark:hover:bg-gray-700/50 transition"
                  >
                    <div className="w-2 h-2 rounded-full bg-navy mt-2 shrink-0" />
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-gray-900 dark:text-white">{u.title}</p>
                      <p className="text-xs text-gray-500 mt-0.5">{u.desc}</p>
                    </div>
                    <p className="text-xs text-gray-400 shrink-0">{u.time}</p>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        <div className="space-y-4">
          <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-5 shadow-sm">
            <h3 className="text-sm font-bold text-gray-900 dark:text-white mb-3">
              {t("quickActions")}
            </h3>
            <div className="grid grid-cols-2 gap-2">
              {[
                { label: t("viewResults"), icon: Trophy, to: "/admin/results" },
                { label: t("notices"), icon: Bell, to: "/admin/communication/notices" },
                { label: t("payFees"), icon: Wallet, to: "/admin/payments" },
                { label: t("Attendance"), icon: CalendarCheck, to: "/admin/attendance" },
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
    </div>
  );
}
