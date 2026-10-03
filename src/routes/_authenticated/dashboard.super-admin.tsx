import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { GraduationCap, Users, Baby, Wallet, BookOpen, BarChart3, Bell, User } from "lucide-react";
import { Link } from "react-router-dom";
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  CartesianGrid,
  PieChart,
  Pie,
  Cell,
} from "recharts";
import { useSuperAdminStats, fmtShortDate } from "@/hooks/use-dashboard-data";
import { useAdminT, formatClock } from "@/lib/admin-i18n";

const PIE_COLORS = ["#FBBF24", "#EF4444", "#10b981", "#1E3A8A", "#8b5cf6", "#f97316"];

export function SuperAdminDashboard() {
  const { data: live } = useSuperAdminStats();
  const { t, lang } = useAdminT();
  const hasData = !!live?.hasData;

  // Live day/date string — refreshes with the minute, never hardcoded.
  const [now, setNow] = useState(() => new Date());
  useEffect(() => {
    const id = window.setInterval(() => setNow(new Date()), 30000);
    return () => window.clearInterval(id);
  }, []);
  const { full: dateStr } = formatClock(now, lang);
  const hour = now.getHours();
  const greeting = hour < 12 ? t("goodMorning") : hour < 17 ? t("goodAfternoon") : t("goodEvening");

  const fmtCompact = (n: number) =>
    n >= 100000 ? "Rs " + (n / 100000).toFixed(1) + "L" : "Rs " + n.toLocaleString();

  const activityRows = live?.recentActivities ?? [];

  const approvalRows = (live?.pendingApprovals ?? []).map((a) => ({
    name: String(a.studentName || a.fullName || a.name || "Applicant"),
    course: String(a.courseName || a.course || ""),
    amount: a.amount ? "Rs " + Number(a.amount).toLocaleString() : "",
    date: fmtShortDate(a.createdAt),
  }));

  const revMonths =
    hasData && (live?.revenue ?? 0) > 0 && live?.revenueByMonth?.length
      ? live.revenueByMonth.map((r) => ({
          m: String(r.month),
          rev: r.amount,
        }))
      : [];

  const incomeDist =
    live?.incomeBreakdown && live.incomeBreakdown.length
      ? live.incomeBreakdown.map((b, i) => ({
          name: String(b.name),
          value: live.revenue ? Math.round(((b.value as number) / live.revenue) * 100) : 0,
          color: PIE_COLORS[i % PIE_COLORS.length],
        }))
      : [];

  const statCards = [
    {
      label: t("totalStudents"),
      value: hasData && live ? live.totalStudents.toLocaleString() : "0",
      icon: GraduationCap,
      color: "from-navy to-navy/80",
      bg: "bg-navy/5",
      accent: "text-navy",
    },
    {
      label: t("totalTeachers"),
      value: hasData && live ? live.totalTeachers.toLocaleString() : "0",
      icon: Users,
      color: "from-brand-red to-brand-red/80",
      bg: "bg-brand-red/5",
      accent: "text-brand-red",
    },
    {
      label: t("totalParents"),
      value: hasData && live ? live.totalParents.toLocaleString() : "0",
      icon: Baby,
      color: "from-gold to-gold/80",
      bg: "bg-gold/5",
      accent: "text-amber-600",
    },
    {
      label: t("revenue"),
      value: hasData && live ? fmtCompact(live.revenue) : "Rs 0",
      icon: Wallet,
      color: "from-emerald-500 to-emerald-600",
      bg: "bg-emerald-50",
      accent: "text-emerald-600",
    },
    {
      label: t("admissions"),
      value: hasData && live ? live.admissionsCount.toLocaleString() : "0",
      icon: BookOpen,
      color: "from-navy to-navy/80",
      bg: "bg-navy/5",
      accent: "text-navy",
    },
    {
      label: t("activeUsers"),
      value: hasData && live ? live.activeUsers.toLocaleString() : "0",
      icon: Users,
      color: "from-brand-red to-brand-red/80",
      bg: "bg-brand-red/5",
      accent: "text-brand-red",
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
          <p className="text-sm text-gold font-medium">{dateStr}</p>
          <h1 className="text-2xl md:text-3xl font-bold mt-1 text-white">
            {greeting}, {t("adminDashboard")}
          </h1>
          <p className="text-white/70 mt-1 text-sm">{t("hereToday")}</p>
          <div className="flex flex-wrap gap-3 mt-4">
            <Link
              to="/admin/students"
              className="inline-flex items-center gap-1.5 px-4 py-2 bg-white/10 hover:bg-white/20 rounded-lg text-sm font-medium transition backdrop-blur-sm text-white"
            >
              <User className="w-4 h-4" /> {t("manageStudents")}
            </Link>
            <Link
              to="/admin/payments"
              className="inline-flex items-center gap-1.5 px-4 py-2 bg-white/10 hover:bg-white/20 rounded-lg text-sm font-medium transition backdrop-blur-sm text-white"
            >
              <Wallet className="w-4 h-4" /> {t("viewCollections")}
            </Link>
            <Link
              to="/admin/reports"
              className="inline-flex items-center gap-1.5 px-4 py-2 bg-gold/20 hover:bg-gold/30 rounded-lg text-sm font-medium transition backdrop-blur-sm text-gold"
            >
              <BarChart3 className="w-4 h-4" /> {t("Reports")}
            </Link>
          </div>
        </div>
      </motion.div>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.05 }}
        className="grid grid-cols-2 md:grid-cols-3 xl:grid-cols-6 gap-4"
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

      <div className="grid grid-cols-1 xl:grid-cols-3 gap-4">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="xl:col-span-2"
        >
          <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-5 shadow-sm">
            <div className="flex items-center justify-between mb-4">
              <div>
                <h3 className="text-sm font-bold text-gray-900 dark:text-white">
                  {t("revenueTrend")}
                </h3>
                <p className="text-xs text-gray-400 mt-0.5">{t("revenueTrendSub")}</p>
              </div>
            </div>
            <div className="h-72">
              {revMonths.length === 0 ? (
                <div className="h-full flex items-center justify-center">
                  <p className="text-sm text-gray-400 dark:text-gray-500">{t("noData")}</p>
                </div>
              ) : (
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={revMonths}>
                    <defs>
                      <linearGradient id="revG" x1="0" x2="0" y1="0" y2="1">
                        <stop offset="0%" stopColor="#1E3A8A" stopOpacity={0.3} />
                        <stop offset="100%" stopColor="#1E3A8A" stopOpacity={0} />
                      </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                    <XAxis dataKey="m" stroke="#9ca3af" fontSize={11} />
                    <YAxis
                      stroke="#9ca3af"
                      fontSize={11}
                      tickFormatter={(v) => "Rs " + v / 1000 + "k"}
                    />
                    <Tooltip
                      contentStyle={{
                        background: "#fff",
                        border: "1px solid #e5e7eb",
                        borderRadius: 12,
                      }}
                      formatter={(v: number) => ["Rs " + v.toLocaleString(), undefined]}
                    />
                    <Area
                      type="monotone"
                      dataKey="rev"
                      stroke="#1E3A8A"
                      fill="url(#revG)"
                      strokeWidth={2}
                      name="Total Revenue"
                    />
                  </AreaChart>
                </ResponsiveContainer>
              )}
            </div>
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.15 }}
        >
          <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-5 shadow-sm">
            <div className="mb-3">
              <h3 className="text-sm font-bold text-gray-900 dark:text-white">
                {t("incomeDistribution")}
              </h3>
              <p className="text-xs text-gray-400 mt-0.5">{t("incomeDistributionSub")}</p>
            </div>
            <div className="h-56">
              {incomeDist.length === 0 ? (
                <div className="h-full flex items-center justify-center">
                  <p className="text-sm text-gray-400 dark:text-gray-500">{t("noData")}</p>
                </div>
              ) : (
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={incomeDist}
                      innerRadius={50}
                      outerRadius={80}
                      dataKey="value"
                      paddingAngle={3}
                    >
                      {incomeDist.map((e) => (
                        <Cell key={e.name} fill={e.color} />
                      ))}
                    </Pie>
                    <Tooltip
                      contentStyle={{
                        background: "#fff",
                        border: "1px solid #e5e7eb",
                        borderRadius: 12,
                      }}
                      formatter={(v: number) => [v + "%", undefined]}
                    />
                  </PieChart>
                </ResponsiveContainer>
              )}
            </div>
            {incomeDist.length > 0 && (
              <div className="grid grid-cols-2 gap-2 mt-2">
                {incomeDist.map((item) => (
                  <div key={item.name} className="flex items-center gap-2 text-xs">
                    <span
                      className="w-2.5 h-2.5 rounded-full shrink-0"
                      style={{ background: item.color }}
                    />
                    <span className="text-gray-500 dark:text-gray-400 truncate">{item.name}</span>
                    <span className="ml-auto font-semibold text-gray-700 dark:text-gray-200">
                      {item.value}%
                    </span>
                  </div>
                ))}
              </div>
            )}
          </div>
        </motion.div>
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-3 gap-4">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="xl:col-span-2"
        >
          <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-5 shadow-sm">
            <h3 className="text-sm font-bold text-gray-900 dark:text-white mb-1">
              {t("recentActivities")}
            </h3>
            <p className="text-xs text-gray-400 mb-4">{t("recentActivitiesSub")}</p>
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
                    <div className="text-right shrink-0">
                      <p className="text-xs text-gray-400">{a.time}</p>
                      <p className="text-[10px] text-gray-400 mt-0.5">{a.user}</p>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.25 }}
          className="space-y-4"
        >
          <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-5 shadow-sm">
            <div className="flex items-center justify-between mb-1 gap-2">
              <h3 className="text-sm font-bold text-gray-900 dark:text-white">
                {t("pendingApprovals")}
              </h3>
              <Link
                to="/admin/admissions"
                className="text-xs font-semibold text-navy hover:text-navy/80 transition shrink-0"
              >
                {t("reviewInAdmissions")}
              </Link>
            </div>
            <p className="text-xs text-gray-400 mb-3">
              {approvalRows.length} {t("pendingApprovalsSub")}
            </p>
            {approvalRows.length === 0 ? (
              <p className="text-sm text-gray-400 dark:text-gray-500 py-4 text-center">
                {t("nothingToShow")}
              </p>
            ) : (
              <div className="space-y-2">
                {approvalRows.map((a, i) => (
                  <div
                    key={i}
                    className="flex items-center justify-between p-2.5 rounded-xl hover:bg-gray-50 dark:hover:bg-gray-700/50 transition"
                  >
                    <div className="min-w-0 flex-1">
                      <p className="text-sm font-medium text-gray-900 dark:text-white truncate">
                        {a.name}
                      </p>
                      <p className="text-xs text-gray-500">
                        {[a.course, a.amount].filter(Boolean).join(" · ")}
                      </p>
                    </div>
                    <p className="text-xs text-gray-400 ml-2 shrink-0">{a.date}</p>
                  </div>
                ))}
              </div>
            )}
          </div>

          <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-5 shadow-sm">
            <h3 className="text-sm font-bold text-gray-900 dark:text-white mb-3">
              {t("quickManagement")}
            </h3>
            <div className="grid grid-cols-2 gap-2">
              {[
                { label: t("addStudent"), icon: GraduationCap, to: "/admin/students" },
                { label: t("addTeacher"), icon: Users, to: "/admin/teachers" },
                { label: t("collectFee"), icon: Wallet, to: "/admin/payments" },
                { label: t("createNotice"), icon: Bell, to: "/admin/communication/notices" },
                { label: t("scheduleExam"), icon: BookOpen, to: "/admin/exams" },
                { label: t("viewReports"), icon: BarChart3, to: "/admin/reports" },
              ].map((s) => {
                const Icon = s.icon;
                return (
                  <Link
                    key={s.label}
                    to={s.to}
                    className="flex items-center gap-2.5 p-3 rounded-xl hover:bg-gray-50 dark:hover:bg-gray-700/50 transition group"
                  >
                    <div className="w-9 h-9 rounded-lg flex items-center justify-center bg-navy/10 text-navy group-hover:bg-navy/20 transition">
                      <Icon className="w-4 h-4" />
                    </div>
                    <span className="text-xs font-medium text-gray-700 dark:text-gray-300">
                      {s.label}
                    </span>
                  </Link>
                );
              })}
            </div>
          </div>
        </motion.div>
      </div>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3 }}
        className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4"
      >
        {[
          {
            label: t("passPercentage"),
            value: hasData && live?.passRate != null ? `${live.passRate}%` : "0%",
            width: hasData && live?.passRate != null ? `${live.passRate}%` : "0%",
            color: "navy",
          },
          {
            label: t("activeStudents"),
            value: hasData && live?.retention != null ? `${live.retention}%` : "0%",
            width: hasData && live?.retention != null ? `${live.retention}%` : "0%",
            color: "brand-red",
          },
          {
            label: t("feeCollection"),
            value: hasData && live?.collectedPct != null ? `${live.collectedPct}%` : "0%",
            width: hasData && live?.collectedPct != null ? `${live.collectedPct}%` : "0%",
            color: "emerald",
          },
          {
            label: t("pendingDues"),
            value: hasData && live ? fmtCompact(live.pendingDues) : "Rs 0",
            width:
              hasData && live && live.invoicedTotal > 0
                ? `${Math.min(100, Math.round((live.pendingDues / live.invoicedTotal) * 100))}%`
                : "0%",
            color: "gold",
          },
        ].map((item) => {
          const barColor =
            item.color === "navy"
              ? "from-navy to-navy/80"
              : item.color === "brand-red"
                ? "from-brand-red to-brand-red/80"
                : item.color === "gold"
                  ? "from-gold to-gold/80"
                  : "from-emerald-400 to-emerald-600";
          return (
            <div
              key={item.label}
              className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-4 shadow-sm"
            >
              <p className="text-xs font-medium text-gray-500 uppercase tracking-wider">
                {item.label}
              </p>
              <p className="text-2xl font-bold text-gray-900 dark:text-white mt-1">{item.value}</p>
              <div className="w-full h-1.5 bg-gray-100 dark:bg-gray-700 rounded-full overflow-hidden mt-2">
                <div
                  className={"h-full rounded-full bg-gradient-to-r " + barColor}
                  style={{ width: item.width }}
                />
              </div>
            </div>
          );
        })}
      </motion.div>
    </div>
  );
}
