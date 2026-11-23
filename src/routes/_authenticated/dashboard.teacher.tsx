import { useEffect, useState } from "react";
import {
  BookOpen,
  Users,
  FileText,
  CalendarCheck,
  ClipboardCheck,
  Upload,
  Loader2,
  Bell,
  AlertCircle,
  Wallet,
  Clock,
  RefreshCw,
} from "lucide-react";
import { motion } from "framer-motion";
import { Link } from "react-router-dom";
import {
  useTeacherDashboard,
  getStoredAuthUser,
  classStartMs,
  fmtClassTime,
  fmtShortDate,
  isClassToday,
} from "@/hooks/use-dashboard-data";
import { getUserRole } from "@/lib/api-auth";
import { auth } from "@/integrations/aws/config";
import { useAdminT, formatClock } from "@/lib/admin-i18n";
import { useMyFinance } from "@/hooks/use-finance";
import { fmtDateTime, fmtRs, methodLabel } from "@/lib/finance";

/** Loading placeholder block. */
function Skel({ className = "" }: { className?: string }) {
  return <div className={"animate-pulse rounded-xl bg-gray-200 dark:bg-gray-800 " + className} />;
}

export function TeacherDashboard() {
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
    if (getUserRole() === "teacher") {
      setMounted(true);
    }
  }, []);

  const storedUser = getStoredAuthUser();
  const uid = storedUser?.uid || auth.currentUser?.uid || undefined;
  const { data: stats, isLoading, isFetching, refetch, dataUpdatedAt } = useTeacherDashboard(uid);
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

  const classCount = stats?.classes?.length || 0;
  const hwCount = stats?.homework?.length || 0;
  const examCount = stats?.exams?.length || 0;
  const hasData = !!stats?.hasData;
  const activityRows = stats?.activities ?? [];
  const totalStudents = stats?.totalStudents ?? 0;

  const todayClasses = (stats?.classes || [])
    .filter((c) => isClassToday(c))
    .sort((a, b) => classStartMs(a.startTime) - classStartMs(b.startTime))
    .slice(0, 6)
    .map((c) => {
      const start = classStartMs(c.startTime);
      const end = c.endTime ? classStartMs(c.endTime) : 0;
      const finish = end > start ? end : start + 3600000;
      const nowMs = Date.now();
      return {
        time: fmtClassTime(c.startTime),
        name: String(c.name || c.subject || "Class"),
        room: String(c.room || ""),
        status: nowMs > finish ? "ended" : nowMs >= start ? "ongoing" : "upcoming",
      };
    });

  const dbTasks = [
    ...(stats?.homework || []).map((h) => ({
      title: t("gradeHomework"),
      subject: String(h.title || h.subject || ""),
      due: fmtShortDate(h.dueDate),
    })),
    ...(stats?.exams || []).map((e) => ({
      title: t("prepareExamPaper"),
      subject: String(e.title || e.subject || ""),
      due: fmtShortDate(e.scheduledAt),
    })),
  ].filter((task) => task.subject);
  const taskRows = dbTasks.slice(0, 5);

  const statCards = [
    {
      label: t("My Classes"),
      value: hasData ? classCount : "0",
      icon: BookOpen,
      color: "from-navy to-navy/80",
      bg: "bg-navy/5",
    },
    {
      label: t("totalStudents"),
      value: hasData ? totalStudents.toLocaleString() : "0",
      icon: Users,
      color: "from-brand-red to-brand-red/80",
      bg: "bg-brand-red/5",
    },
    {
      label: t("Homework"),
      value: hasData ? hwCount : "0",
      icon: FileText,
      color: "from-gold to-gold/80",
      bg: "bg-gold/5",
    },
    {
      label: t("upcomingExams"),
      value: hasData ? examCount : "0",
      icon: ClipboardCheck,
      color: "from-emerald-500 to-emerald-600",
      bg: "bg-emerald-50",
    },
    {
      label: t("salaryPaidLabel"),
      value: fin.loading ? "—" : fmtRs(fin.summary.paid),
      icon: Wallet,
      color: "from-emerald-500 to-emerald-600",
      bg: "bg-emerald-50",
    },
    {
      label: t("salaryDueLabel"),
      value: fin.loading ? "—" : fmtRs(fin.summary.pending),
      icon: Clock,
      color: "from-brand-red to-brand-red/80",
      bg: "bg-brand-red/5",
    },
  ];

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
            <p className="text-xs text-white/60 mt-0.5">{t("teacherDashboard")}</p>
            <h1 className="text-2xl md:text-3xl font-bold mt-1 text-white">
              {t("welcomeBackTeacher")}
            </h1>
            <p className="text-white/70 mt-1 text-sm">{t("teacherIntro")}</p>
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

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        <div className="lg:col-span-2">
          <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-5 shadow-sm">
            <h3 className="text-sm font-bold text-gray-900 dark:text-white mb-1">
              {t("todaySchedule")}
            </h3>
            <p className="text-xs text-gray-400 mb-4">{t("todayScheduleSub")}</p>
            {isLoading ? (
              <div className="space-y-2">
                {[1, 2, 3].map((i) => (
                  <Skel key={i} className="h-16" />
                ))}
              </div>
            ) : todayClasses.length === 0 ? (
              <p className="text-sm text-gray-400 dark:text-gray-500 py-6 text-center">
                {t("noClassesToday")}
              </p>
            ) : (
              <div className="space-y-2">
                {todayClasses.map((s, i) => (
                  <div
                    key={i}
                    className="flex items-center gap-3 p-3 rounded-xl hover:bg-gray-50 dark:hover:bg-gray-700/50 transition"
                  >
                    <div className="w-16 text-center shrink-0">
                      <p className="text-xs font-bold text-navy">{s.time}</p>
                    </div>
                    <div className="w-px h-10 bg-gray-200 dark:bg-gray-700" />
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-semibold text-gray-900 dark:text-white truncate">
                        {s.name}
                      </p>
                      <p className="text-xs text-gray-400">{s.room}</p>
                    </div>
                    <span
                      className={
                        "text-[10px] font-semibold px-2 py-0.5 rounded-full " +
                        (s.status === "ongoing"
                          ? "bg-green-100 text-green-700"
                          : s.status === "upcoming"
                            ? "bg-navy/10 text-navy"
                            : "bg-gray-100 text-gray-500")
                      }
                    >
                      {s.status === "ongoing"
                        ? t("statusLive")
                        : s.status === "upcoming"
                          ? t("statusUpcoming")
                          : t("statusEnded")}
                    </span>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Salary & Payments — this teacher's own payroll */}
          <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-5 shadow-sm mt-4">
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
            <p className="text-xs text-gray-400 mb-4">{t("paymentHistorySub")}</p>
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
                    <p className="text-[11px] text-gray-500">{t("payableLabel")}</p>
                    <p className="text-sm font-bold text-navy">{fmtRs(fin.summary.total)}</p>
                  </div>
                  <div className="p-3 rounded-xl bg-emerald-50 dark:bg-emerald-500/10 border border-emerald-200/60 text-center">
                    <p className="text-[11px] text-gray-500">{t("paidLabel")}</p>
                    <p className="text-sm font-bold text-emerald-600">{fmtRs(fin.summary.paid)}</p>
                  </div>
                  <div className="p-3 rounded-xl bg-red-50 dark:bg-red-500/10 border border-red-200/60 text-center">
                    <p className="text-[11px] text-gray-500">{t("remainingLabel")}</p>
                    <p className="text-sm font-bold text-brand-red">{fmtRs(fin.summary.pending)}</p>
                  </div>
                </div>
                {fin.transactions.length === 0 ? (
                  <p className="text-sm text-gray-400 dark:text-gray-500 py-4 text-center">
                    {t("noPaymentHistoryDesc")}
                  </p>
                ) : (
                  <div className="space-y-2">
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
                    <div className="flex justify-end pt-1">
                      <Link
                        to="/admin/payments"
                        className="text-xs font-semibold text-navy hover:underline"
                      >
                        {t("viewAllPayments")}
                      </Link>
                    </div>
                  </div>
                )}
              </>
            )}
          </div>
        </div>

        <div>
          <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-5 shadow-sm">
            <h3 className="text-sm font-bold text-gray-900 dark:text-white mb-1">
              {t("upcomingTasks")}
            </h3>
            <p className="text-xs text-gray-400 mb-4">{t("tasksSub")}</p>
            {isLoading ? (
              <div className="space-y-3">
                {[1, 2, 3].map((i) => (
                  <Skel key={i} className="h-14" />
                ))}
              </div>
            ) : taskRows.length === 0 ? (
              <p className="text-sm text-gray-400 dark:text-gray-500 py-6 text-center">
                {t("noPendingTasks")}
              </p>
            ) : (
              <div className="space-y-3">
                {taskRows.map((task, i) => (
                  <div
                    key={i}
                    className="flex items-start gap-3 p-2.5 rounded-xl hover:bg-gray-50 dark:hover:bg-gray-700/50 transition"
                  >
                    <div
                      className={
                        "w-8 h-8 rounded-lg flex items-center justify-center shrink-0 " +
                        (i === 0
                          ? "bg-brand-red/10 text-brand-red"
                          : i === 1
                            ? "bg-gold/10 text-amber-600"
                            : "bg-navy/10 text-navy")
                      }
                    >
                      <AlertCircle className="w-4 h-4" />
                    </div>
                    <div className="min-w-0">
                      <p className="text-xs font-semibold text-gray-900 dark:text-white truncate">
                        {task.title}
                      </p>
                      <p className="text-[11px] text-gray-400">{task.subject}</p>
                      {task.due && (
                        <p className="text-[10px] text-gray-400 mt-0.5">
                          {t("due")}: {task.due}
                        </p>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        <div className="lg:col-span-2">
          <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-5 shadow-sm">
            <h3 className="text-sm font-bold text-gray-900 dark:text-white mb-1">
              {t("recentActivity")}
            </h3>
            <p className="text-xs text-gray-400 mb-4">{t("recentActivitySub")}</p>
            {activityRows.length === 0 ? (
              <p className="text-sm text-gray-400 dark:text-gray-500 py-6 text-center">
                {t("noActivity")}
              </p>
            ) : (
              <div className="space-y-1">
                {activityRows.map((a, i) => (
                  <div
                    key={i}
                    className="flex items-start gap-3 p-2.5 rounded-xl hover:bg-gray-50 dark:hover:bg-gray-700/50 transition"
                  >
                    <div className="w-2 h-2 rounded-full bg-navy mt-2 shrink-0" />
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-gray-900 dark:text-white">{a.title}</p>
                      <p className="text-xs text-gray-500 mt-0.5">{a.desc}</p>
                    </div>
                    <p className="text-xs text-gray-400 shrink-0">{a.time}</p>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        <div>
          <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-5 shadow-sm">
            <h3 className="text-sm font-bold text-gray-900 dark:text-white mb-3">
              {t("quickActions")}
            </h3>
            <div className="grid grid-cols-2 gap-3">
              {[
                {
                  label: t("takeAttendance"),
                  icon: CalendarCheck,
                  to: "/admin/teacher/attendance",
                  color: "from-emerald-500 to-emerald-600",
                },
                {
                  label: t("uploadNotes"),
                  icon: Upload,
                  to: "/admin/teacher/resources",
                  color: "from-navy to-navy/80",
                },
                {
                  label: t("createAssignment"),
                  icon: FileText,
                  to: "/admin/teacher/assignments",
                  color: "from-gold to-gold/80",
                },
                {
                  label: t("sendNotice"),
                  icon: Bell,
                  to: "/admin/communication/notices",
                  color: "from-brand-red to-brand-red/80",
                },
              ].map((a) => {
                const Icon = a.icon;
                return (
                  <Link
                    key={a.label}
                    to={a.to}
                    className="flex flex-col items-center gap-2 p-3 rounded-xl hover:bg-gray-50 dark:hover:bg-gray-700/50 transition group"
                  >
                    <div
                      className={
                        "w-10 h-10 rounded-lg bg-gradient-to-br " +
                        a.color +
                        " flex items-center justify-center text-white group-hover:scale-110 transition-transform"
                      }
                    >
                      <Icon className="w-4 h-4" />
                    </div>
                    <span className="text-[10px] font-semibold text-gray-600 dark:text-gray-300 text-center leading-tight">
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
