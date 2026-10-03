import { useEffect, useState } from "react";
import {
  GraduationCap,
  FileText,
  CalendarCheck,
  Download,
  Upload,
  CreditCard,
  Loader2,
  Trophy,
  BookOpen,
} from "lucide-react";
import { motion } from "framer-motion";
import { Link } from "react-router-dom";
import {
  useStudentDashboard,
  getStoredAuthUser,
  fmtClassTime,
  fmtShortDate,
} from "@/hooks/use-dashboard-data";
import { getUserRole } from "@/lib/api-auth";
import { auth } from "@/integrations/firebase/config";
import { useAdminT } from "@/lib/admin-i18n";

export function StudentDashboard() {
  const [mounted, setMounted] = useState(false);
  const { t } = useAdminT();
  useEffect(() => {
    if (getUserRole() === "student") {
      setMounted(true);
    }
  }, []);

  const storedUser = getStoredAuthUser();
  const uid = storedUser?.uid || auth.currentUser?.uid || undefined;
  const { data: stats, isLoading } = useStudentDashboard(uid);

  if (!mounted || isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="text-center">
          <Loader2 className="w-8 h-8 animate-spin mx-auto text-navy" />
          <p className="text-sm text-gray-400 mt-3">{t("loadingDashboard")}</p>
        </div>
      </div>
    );
  }

  const hasData = !!stats?.hasData;
  const classRows = (stats?.upcomingClasses || []).map((c) => ({
    time: fmtClassTime(c.startTime) || "—",
    name: String(c.name || "Class"),
    room: String(c.room || "TBA"),
    teacher: String(c.teacherName || ""),
  }));

  const scoreRows = (stats?.results || []).map((r) => ({
    subject: String(r.subject || "Exam"),
    score: Number(r.marks || r.score || 0),
    total: Number(r.total) > 0 ? Number(r.total) : 100,
  }));

  const examRows = (stats?.exams || []).slice(0, 3).map((e) => ({
    subject: String(e.title || e.subject || "Exam"),
    date: fmtShortDate(e.scheduledAt) || "TBA",
    type: String(e.subject || "Written"),
  }));

  const attPercent =
    hasData && typeof stats?.attendancePercent === "number" ? stats.attendancePercent : null;
  const attColor =
    attPercent !== null && attPercent < 80
      ? "from-gold to-gold/80"
      : "from-emerald-500 to-emerald-600";
  const attBg = attPercent !== null && attPercent < 80 ? "bg-gold/5" : "bg-emerald-50";

  const statCards = [
    {
      label: t("enrolledCourses"),
      value: hasData ? String(stats?.enrollments?.length ?? 0) : "0",
      icon: GraduationCap,
      color: "from-navy to-navy/80",
      bg: "bg-navy/5",
    },
    {
      label: t("Attendance"),
      value: attPercent === null ? "0%" : attPercent + "%",
      icon: CalendarCheck,
      color: attColor,
      bg: attBg,
    },
    {
      label: t("Homework"),
      value: hasData ? String(stats?.homework?.length ?? 0) : "0",
      icon: FileText,
      color: "from-brand-red to-brand-red/80",
      bg: "bg-brand-red/5",
    },
    {
      label: t("Results"),
      value: hasData ? String(stats?.results?.length ?? 0) : "0",
      icon: Trophy,
      color: "from-gold to-gold/80",
      bg: "bg-gold/5",
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
        <div className="relative">
          <p className="text-sm text-gold font-medium">{t("studentDashboard")}</p>
          <h1 className="text-2xl md:text-3xl font-bold mt-1 text-white">
            {t("welcomeBackStudent")}
          </h1>
          <p className="text-white/70 mt-1 text-sm">{t("studentIntro")}</p>
        </div>
      </motion.div>

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

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        <div className="lg:col-span-2 space-y-4">
          <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-5 shadow-sm">
            <h3 className="text-sm font-bold text-gray-900 dark:text-white mb-1">
              {t("todaysClasses")}
            </h3>
            <p className="text-xs text-gray-400 mb-4">{t("todaysClassesSub")}</p>
            {classRows.length === 0 ? (
              <p className="text-sm text-gray-400 dark:text-gray-500 py-6 text-center">
                {t("noUpcomingClasses")}
              </p>
            ) : (
              <div className="space-y-2">
                {classRows.map((c, i) => (
                  <div
                    key={i}
                    className="flex items-center gap-3 p-3 rounded-xl hover:bg-gray-50 dark:hover:bg-gray-700/50 transition"
                  >
                    <div className="w-16 text-center shrink-0">
                      <p className="text-xs font-bold text-navy">{c.time}</p>
                    </div>
                    <div className="w-px h-10 bg-gray-200 dark:bg-gray-700" />
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-semibold text-gray-900 dark:text-white">
                        {c.name}
                      </p>
                      <p className="text-xs text-gray-400">
                        {c.room} · {c.teacher}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-5 shadow-sm">
            <h3 className="text-sm font-bold text-gray-900 dark:text-white mb-1">
              {t("recentScores")}
            </h3>
            <p className="text-xs text-gray-400 mb-4">{t("recentScoresSub")}</p>
            {scoreRows.length === 0 ? (
              <p className="text-sm text-gray-400 dark:text-gray-500 py-6 text-center">
                {t("noResultsYet")}
              </p>
            ) : (
              <div className="space-y-3">
                {scoreRows.map((r, i) => {
                  const pct = Math.round((r.score / r.total) * 100);
                  return (
                    <div key={i} className="flex items-center gap-4">
                      <p className="text-xs font-semibold text-gray-700 dark:text-gray-300 w-24 shrink-0">
                        {r.subject}
                      </p>
                      <div className="flex-1 h-2 bg-gray-100 dark:bg-gray-700 rounded-full overflow-hidden">
                        <div
                          className={
                            "h-full rounded-full " +
                            (pct >= 80 ? "bg-emerald-500" : pct >= 60 ? "bg-gold" : "bg-brand-red")
                          }
                          style={{ width: pct + "%" }}
                        />
                      </div>
                      <p className="text-xs font-bold text-gray-900 dark:text-white w-16 text-right">
                        {r.score}/{r.total}
                      </p>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>

        <div className="space-y-4">
          <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-5 shadow-sm">
            <h3 className="text-sm font-bold text-gray-900 dark:text-white mb-3">
              {t("quickAccess")}
            </h3>
            <div className="space-y-2">
              {[
                {
                  label: t("studyMaterials"),
                  icon: Download,
                  to: "/admin/courses",
                  desc: t("studyMaterialsDesc"),
                },
                {
                  label: t("Homework"),
                  icon: Upload,
                  to: "/admin/homework",
                  desc: t("homeworkPendingDesc"),
                },
                {
                  label: t("viewResults"),
                  icon: Trophy,
                  to: "/admin/results",
                  desc: t("examScores"),
                },
                {
                  label: t("payFees"),
                  icon: CreditCard,
                  to: "/admin/payments",
                  desc: t("payFeesDesc"),
                },
              ].map((a) => {
                const Icon = a.icon;
                return (
                  <Link
                    key={a.label}
                    to={a.to}
                    className="flex items-center gap-3 p-3 rounded-xl hover:bg-gray-50 dark:hover:bg-gray-700/50 transition group"
                  >
                    <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-navy to-navy/80 flex items-center justify-center text-white shrink-0 group-hover:scale-110 transition-transform">
                      <Icon className="w-4 h-4" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-bold text-gray-900 dark:text-white truncate">
                        {a.label}
                      </p>
                      <p className="text-xs text-gray-400">{a.desc}</p>
                    </div>
                  </Link>
                );
              })}
            </div>
          </div>

          <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-5 shadow-sm">
            <h3 className="text-sm font-bold text-gray-900 dark:text-white mb-1">
              {t("upcomingExams")}
            </h3>
            <p className="text-xs text-gray-400 mb-3">{t("nextTests")}</p>
            {examRows.length === 0 ? (
              <p className="text-sm text-gray-400 dark:text-gray-500 py-6 text-center">
                {t("nothingToShow")}
              </p>
            ) : (
              <div className="space-y-3">
                {examRows.map((ex, i) => (
                  <div key={i} className="flex items-start gap-3">
                    <div className="w-9 h-9 rounded-lg bg-navy/10 flex items-center justify-center shrink-0">
                      <BookOpen className="w-4 h-4 text-navy" />
                    </div>
                    <div className="min-w-0">
                      <p className="text-xs font-semibold text-gray-900 dark:text-white">
                        {ex.subject}
                      </p>
                      <p className="text-[11px] text-gray-400">
                        {ex.date} · {ex.type}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
