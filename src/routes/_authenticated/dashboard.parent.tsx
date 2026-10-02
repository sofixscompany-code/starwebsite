import { useEffect, useState } from "react";
import { CalendarCheck, Trophy, Wallet, Bell, Loader2, FileText } from "lucide-react";
import { motion } from "framer-motion";
import { Link } from "react-router-dom";
import { useParentDashboard, getStoredAuthUser } from "@/hooks/use-dashboard-data";
import { getUserRole } from "@/lib/api-auth";
import { auth } from "@/integrations/firebase/config";

export function ParentDashboard() {
  const [mounted, setMounted] = useState(false);
  useEffect(() => {
    if (getUserRole() === "parent") {
      setMounted(true);
    }
  }, []);

  const storedUser = getStoredAuthUser();
  const parentEmail = storedUser?.email || auth.currentUser?.email || undefined;
  const { data: stats, isLoading } = useParentDashboard(parentEmail);

  if (!mounted || isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="text-center">
          <Loader2 className="w-8 h-8 animate-spin mx-auto text-navy" />
          <p className="text-sm text-gray-400 mt-3">Loading dashboard...</p>
        </div>
      </div>
    );
  }

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
        <div className="relative">
          <p className="text-sm text-gold font-medium">Parent Dashboard</p>
          <h1 className="text-2xl md:text-3xl font-bold mt-1 text-white">Welcome, Parent</h1>
          <p className="text-white/70 mt-1 text-sm">
            Monitor your child's progress and school activities
          </p>
        </div>
      </motion.div>

      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        className="grid grid-cols-2 sm:grid-cols-4 gap-4"
      >
        {[
          {
            label: "Attendance",
            value: attPercent === null ? "No data yet" : attPercent + "%",
            icon: CalendarCheck,
            color: "from-emerald-500 to-emerald-600",
            bg: "bg-emerald-50",
          },
          {
            label: "Avg. Results",
            value: avgScore === null ? "No data yet" : avgScore + "%",
            icon: Trophy,
            color: "from-navy to-navy/80",
            bg: "bg-navy/5",
          },
          {
            label: "Homework Pend.",
            value: hasData ? String(pendingHw) : "No data yet",
            icon: FileText,
            color: "from-gold to-gold/80",
            bg: "bg-gold/5",
          },
          {
            label: "Notices",
            value: hasData ? String(stats?.notices?.length ?? 0) : "No data yet",
            icon: Bell,
            color: "from-brand-red to-brand-red/80",
            bg: "bg-brand-red/5",
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

      <div className="grid grid-cols-1 xl:grid-cols-3 gap-4">
        <div className="xl:col-span-2 space-y-4">
          <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-5 shadow-sm">
            <h3 className="text-sm font-bold text-gray-900 dark:text-white mb-1">
              Children Overview
            </h3>
            <p className="text-xs text-gray-400 mb-4">Academic status of your children</p>
            {childRows.length === 0 ? (
              <p className="text-sm text-gray-400 dark:text-gray-500 py-6 text-center">
                No children linked to this account yet
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
                        <p className="text-xs text-gray-400">Attendance</p>
                        <p className="text-lg font-bold text-emerald-600">{child.attendance}%</p>
                        <div className="w-full h-1 bg-gray-200 dark:bg-gray-600 rounded-full mt-1">
                          <div
                            className="h-full rounded-full bg-emerald-500"
                            style={{ width: child.attendance + "%" }}
                          />
                        </div>
                      </div>
                      <div>
                        <p className="text-xs text-gray-400">Avg. Score</p>
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
                          View Full Report →
                        </Link>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-5 shadow-sm">
            <h3 className="text-sm font-bold text-gray-900 dark:text-white mb-1">Recent Updates</h3>
            <p className="text-xs text-gray-400 mb-4">Your child's activity feed</p>
            {activityRows.length === 0 ? (
              <p className="text-sm text-gray-400 dark:text-gray-500 py-6 text-center">
                No activity yet
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
            <h3 className="text-sm font-bold text-gray-900 dark:text-white mb-3">Quick Actions</h3>
            <div className="grid grid-cols-2 gap-2">
              {[
                { label: "View Results", icon: Trophy, to: "/admin/results" },
                { label: "Notices", icon: Bell, to: "/admin/communication/notices" },
                { label: "Pay Fees", icon: Wallet, to: "/admin/payments" },
                { label: "Attendance", icon: CalendarCheck, to: "/admin/attendance" },
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
