import { useEffect, useState } from "react";
import {
  BookOpen, Users, FileText, CalendarCheck, Clock,
  ClipboardCheck, Upload, PenLine, Loader2, Bell,
  TrendingUp, CheckCircle2, AlertCircle, MessageSquare,
  GraduationCap, BarChart3,
} from "lucide-react";
import { motion } from "framer-motion";
import { Link } from "react-router-dom";
import { useTeacherDashboard, useTodaySchedule } from "@/hooks/use-dashboard-data";
import { getUserRole } from "@/lib/api-auth";

const activities = [
  { time: "1h ago", title: "Homework graded", desc: "Batch B-12 · 32 papers" },
  { time: "3h ago", title: "New assignment created", desc: "Physics Ch. 5 problems" },
  { time: "5h ago", title: "Attendance marked", desc: "Class A-08 · 28/30 present" },
  { time: "Yesterday", title: "Exam paper reviewed", desc: "Mock Test #14 answer key" },
];

const upcomingTasks = [
  { title: "Grade Homework", subject: "Mathematics", due: "Today, 5 PM" },
  { title: "Upload Notes", subject: "Physics Ch.6", due: "Tomorrow" },
  { title: "Create Quiz", subject: "English Grammar", due: "Dec 20" },
];

export function TeacherDashboard() {
  const [mounted, setMounted] = useState(false);
  useEffect(() => {
    if (getUserRole() === 'teacher' || localStorage.getItem('demo_role') === 'teacher') {
      setMounted(true);
    }
  }, []);

  const { data: stats, isLoading } = useTeacherDashboard();

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

  const classCount = stats?.classes?.length || 0;
  const hwCount = stats?.homework?.length || 0;
  const examCount = stats?.exams?.length || 0;

  const statCards = [
    { label: 'My Classes', value: classCount, icon: BookOpen, color: 'from-navy to-navy/80', bg: 'bg-navy/5' },
    { label: 'Total Students', value: classCount * 28, icon: Users, color: 'from-brand-red to-brand-red/80', bg: 'bg-brand-red/5' },
    { label: 'Homework', value: hwCount, icon: FileText, color: 'from-gold to-gold/80', bg: 'bg-gold/5' },
    { label: 'Upcoming Exams', value: examCount, icon: ClipboardCheck, color: 'from-emerald-500 to-emerald-600', bg: 'bg-emerald-50' },
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
          <p className="text-sm text-gold font-medium">Teacher Dashboard</p>
          <h1 className="text-2xl md:text-3xl font-bold mt-1 text-white">Welcome back, Teacher</h1>
          <p className="text-white/70 mt-1 text-sm">Manage your classes, assignments, and students</p>
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
        <div className="lg:col-span-2">
          <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-5 shadow-sm">
            <h3 className="text-sm font-bold text-gray-900 dark:text-white mb-1">Today's Schedule</h3>
            <p className="text-xs text-gray-400 mb-4">Upcoming classes for today</p>
            <div className="space-y-2">
              {[
                { time: '08:00 AM', name: 'Mathematics - Batch A', room: 'Room 101', status: 'ongoing' },
                { time: '09:30 AM', name: 'Physics - Batch B', room: 'Room 203', status: 'upcoming' },
                { time: '11:00 AM', name: 'English - Batch A', room: 'Room 105', status: 'upcoming' },
                { time: '01:00 PM', name: 'Chemistry - Batch C', room: 'Lab 2', status: 'upcoming' },
              ].map((s, i) => (
                <div key={i} className="flex items-center gap-3 p-3 rounded-xl hover:bg-gray-50 dark:hover:bg-gray-700/50 transition">
                  <div className="w-16 text-center shrink-0">
                    <p className="text-xs font-bold text-navy">{s.time}</p>
                  </div>
                  <div className="w-px h-10 bg-gray-200 dark:bg-gray-700" />
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-semibold text-gray-900 dark:text-white truncate">{s.name}</p>
                    <p className="text-xs text-gray-400">{s.room}</p>
                  </div>
                  <span className={'text-[10px] font-semibold px-2 py-0.5 rounded-full ' + (s.status === 'ongoing' ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-500')}>
                    {s.status === 'ongoing' ? 'Live' : 'Upcoming'}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>

        <div>
          <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-5 shadow-sm">
            <h3 className="text-sm font-bold text-gray-900 dark:text-white mb-1">Upcoming Tasks</h3>
            <p className="text-xs text-gray-400 mb-4">Pending items requiring attention</p>
            <div className="space-y-3">
              {upcomingTasks.map((t, i) => (
                <div key={i} className="flex items-start gap-3 p-2.5 rounded-xl hover:bg-gray-50 dark:hover:bg-gray-700/50 transition">
                  <div className={'w-8 h-8 rounded-lg flex items-center justify-center shrink-0 ' + (i === 0 ? 'bg-brand-red/10 text-brand-red' : i === 1 ? 'bg-gold/10 text-amber-600' : 'bg-navy/10 text-navy')}>
                    <AlertCircle className="w-4 h-4" />
                  </div>
                  <div className="min-w-0">
                    <p className="text-xs font-semibold text-gray-900 dark:text-white truncate">{t.title}</p>
                    <p className="text-[11px] text-gray-400">{t.subject}</p>
                    <p className="text-[10px] text-gray-400 mt-0.5">Due: {t.due}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        <div className="lg:col-span-2">
          <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-5 shadow-sm">
            <h3 className="text-sm font-bold text-gray-900 dark:text-white mb-1">Recent Activity</h3>
            <p className="text-xs text-gray-400 mb-4">Latest actions and updates</p>
            <div className="space-y-1">
              {activities.map((a, i) => (
                <div key={i} className="flex items-start gap-3 p-2.5 rounded-xl hover:bg-gray-50 dark:hover:bg-gray-700/50 transition">
                  <div className="w-2 h-2 rounded-full bg-navy mt-2 shrink-0" />
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-gray-900 dark:text-white">{a.title}</p>
                    <p className="text-xs text-gray-500 mt-0.5">{a.desc}</p>
                  </div>
                  <p className="text-xs text-gray-400 shrink-0">{a.time}</p>
                </div>
              ))}
            </div>
          </div>
        </div>

        <div>
          <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-5 shadow-sm">
            <h3 className="text-sm font-bold text-gray-900 dark:text-white mb-3">Quick Actions</h3>
            <div className="grid grid-cols-2 gap-3">
              {[
                { label: 'Take Attendance', icon: CalendarCheck, to: '/admin/attendance', color: 'from-emerald-500 to-emerald-600' },
                { label: 'Upload Notes', icon: Upload, to: '/admin/lms', color: 'from-navy to-navy/80' },
                { label: 'Create Assignment', icon: FileText, to: '/admin/assignments', color: 'from-gold to-gold/80' },
                { label: 'Send Notice', icon: Bell, to: '/admin/notices', color: 'from-brand-red to-brand-red/80' },
              ].map((a) => {
                const Icon = a.icon;
                return (
                  <Link key={a.label} to={a.to}
                    className="flex flex-col items-center gap-2 p-3 rounded-xl hover:bg-gray-50 dark:hover:bg-gray-700/50 transition group"
                  >
                    <div className={'w-10 h-10 rounded-lg bg-gradient-to-br ' + a.color + ' flex items-center justify-center text-white group-hover:scale-110 transition-transform'}>
                      <Icon className="w-4 h-4" />
                    </div>
                    <span className="text-[10px] font-semibold text-gray-600 dark:text-gray-300 text-center leading-tight">{a.label}</span>
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
