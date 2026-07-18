import { useEffect, useState } from "react";
import {
  GraduationCap, FileText, CalendarCheck, Wallet, Download,
  Video, Upload, CreditCard, Loader2, Trophy, BookOpen,
  Clock, CheckCircle2, AlertCircle, BarChart3, PlayCircle,
} from "lucide-react";
import { motion } from "framer-motion";
import { Link } from "react-router-dom";
import { useStudentDashboard } from "@/hooks/use-dashboard-data";
import { getUserRole } from "@/lib/api-auth";

const upcomingClasses = [
  { time: '08:00 AM', name: 'Mathematics', room: 'Room 101', teacher: 'Mr. Sharma' },
  { time: '09:30 AM', name: 'Physics', room: 'Room 203', teacher: 'Mrs. Thapa' },
  { time: '11:00 AM', name: 'English', room: 'Room 105', teacher: 'Mr. Adhikari' },
];

const recentScores = [
  { subject: 'Mathematics', score: 85, total: 100 },
  { subject: 'Physics', score: 72, total: 100 },
  { subject: 'English', score: 91, total: 100 },
];

export function StudentDashboard() {
  const [mounted, setMounted] = useState(false);
  useEffect(() => {
    if (getUserRole() === 'student' || localStorage.getItem('demo_role') === 'student') {
      setMounted(true);
    }
  }, []);

  const { data: stats, isLoading } = useStudentDashboard();

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

  const attPercent = stats?.attendancePercent || 85;
  const attColor = attPercent >= 80 ? 'from-emerald-500 to-emerald-600' : 'from-gold to-gold/80';
  const attBg = attPercent >= 80 ? 'bg-emerald-50' : 'bg-gold/5';

  const statCards = [
    { label: 'Enrolled Courses', value: stats?.enrollments?.length || 4, icon: GraduationCap, color: 'from-navy to-navy/80', bg: 'bg-navy/5' },
    { label: 'Attendance', value: attPercent + '%', icon: CalendarCheck, color: attColor, bg: attBg },
    { label: 'Homework', value: stats?.homework?.length || 6, icon: FileText, color: 'from-brand-red to-brand-red/80', bg: 'bg-brand-red/5' },
    { label: 'Results', value: stats?.results?.length || 3, icon: Trophy, color: 'from-gold to-gold/80', bg: 'bg-gold/5' },
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
          <p className="text-sm text-gold font-medium">Student Dashboard</p>
          <h1 className="text-2xl md:text-3xl font-bold mt-1 text-white">Welcome back, Student</h1>
          <p className="text-white/70 mt-1 text-sm">Track your courses, attendance, and progress</p>
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
              className={s.bg + ' rounded-xl p-4 border border-gray-200/60 shadow-sm'}
            >
              <div className={'w-10 h-10 rounded-xl bg-gradient-to-br ' + s.color + ' flex items-center justify-center shadow-md mb-3'}>
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
            <h3 className="text-sm font-bold text-gray-900 dark:text-white mb-1">Today's Classes</h3>
            <p className="text-xs text-gray-400 mb-4">Your schedule for today</p>
            <div className="space-y-2">
              {upcomingClasses.map((c, i) => (
                <div key={i} className="flex items-center gap-3 p-3 rounded-xl hover:bg-gray-50 dark:hover:bg-gray-700/50 transition">
                  <div className="w-16 text-center shrink-0">
                    <p className="text-xs font-bold text-navy">{c.time}</p>
                  </div>
                  <div className="w-px h-10 bg-gray-200 dark:bg-gray-700" />
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-semibold text-gray-900 dark:text-white">{c.name}</p>
                    <p className="text-xs text-gray-400">{c.room} · {c.teacher}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-5 shadow-sm">
            <h3 className="text-sm font-bold text-gray-900 dark:text-white mb-1">Recent Scores</h3>
            <p className="text-xs text-gray-400 mb-4">Your latest exam results</p>
            <div className="space-y-3">
              {recentScores.map((r, i) => {
                const pct = Math.round((r.score / r.total) * 100);
                return (
                  <div key={i} className="flex items-center gap-4">
                    <p className="text-xs font-semibold text-gray-700 dark:text-gray-300 w-24 shrink-0">{r.subject}</p>
                    <div className="flex-1 h-2 bg-gray-100 dark:bg-gray-700 rounded-full overflow-hidden">
                      <div
                        className={'h-full rounded-full ' + (pct >= 80 ? 'bg-emerald-500' : pct >= 60 ? 'bg-gold' : 'bg-brand-red')}
                        style={{ width: pct + '%' }}
                      />
                    </div>
                    <p className="text-xs font-bold text-gray-900 dark:text-white w-16 text-right">{r.score}/{r.total}</p>
                  </div>
                );
              })}
            </div>
          </div>
        </div>

        <div className="space-y-4">
          <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-5 shadow-sm">
            <h3 className="text-sm font-bold text-gray-900 dark:text-white mb-3">Quick Access</h3>
            <div className="space-y-2">
              {[
                { label: 'Study Materials', icon: Download, to: '/admin/lms', desc: 'Notes & videos' },
                { label: 'Homework', icon: Upload, to: '/admin/homework', desc: 'Pending submissions' },
                { label: 'View Results', icon: Trophy, to: '/admin/results', desc: 'Exam scores' },
                { label: 'Pay Fees', icon: CreditCard, to: '/admin/payments', desc: 'Online payment' },
                { label: 'Live Classes', icon: PlayCircle, to: '/admin/live', desc: 'Join now' },
              ].map((a) => {
                const Icon = a.icon;
                return (
                  <Link key={a.label} to={a.to}
                    className="flex items-center gap-3 p-3 rounded-xl hover:bg-gray-50 dark:hover:bg-gray-700/50 transition group"
                  >
                    <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-navy to-navy/80 flex items-center justify-center text-white shrink-0 group-hover:scale-110 transition-transform">
                      <Icon className="w-4 h-4" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-bold text-gray-900 dark:text-white truncate">{a.label}</p>
                      <p className="text-xs text-gray-400">{a.desc}</p>
                    </div>
                  </Link>
                );
              })}
            </div>
          </div>

          <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-5 shadow-sm">
            <h3 className="text-sm font-bold text-gray-900 dark:text-white mb-1">Upcoming Exams</h3>
            <p className="text-xs text-gray-400 mb-3">Next tests scheduled</p>
            <div className="space-y-3">
              {[
                { subject: 'Mathematics', date: 'Dec 18', type: 'Unit Test' },
                { subject: 'Physics', date: 'Dec 20', type: 'Mid Term' },
                { subject: 'English', date: 'Dec 23', type: 'Assignment' },
              ].map((ex, i) => (
                <div key={i} className="flex items-start gap-3">
                  <div className="w-9 h-9 rounded-lg bg-navy/10 flex items-center justify-center shrink-0">
                    <BookOpen className="w-4 h-4 text-navy" />
                  </div>
                  <div className="min-w-0">
                    <p className="text-xs font-semibold text-gray-900 dark:text-white">{ex.subject}</p>
                    <p className="text-[11px] text-gray-400">{ex.date} · {ex.type}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
