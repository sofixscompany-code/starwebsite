import { motion } from 'framer-motion';
import { GraduationCap, Users, Baby, Wallet, CalendarCheck, BookOpen, TrendingUp, BarChart3, Bell, User, ArrowUpRight, CheckCircle, XCircle, Star } from 'lucide-react';
import { Link } from 'react-router-dom';
import { AreaChart, Area, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid, PieChart, Pie, Cell } from 'recharts';

const revenueMonths = [
  { m: 'Jan', rev: 320000, fee: 220000, other: 100000 },
  { m: 'Feb', rev: 380000, fee: 260000, other: 120000 },
  { m: 'Mar', rev: 420000, fee: 290000, other: 130000 },
  { m: 'Apr', rev: 390000, fee: 270000, other: 120000 },
  { m: 'May', rev: 480000, fee: 340000, other: 140000 },
  { m: 'Jun', rev: 520000, fee: 370000, other: 150000 },
  { m: 'Jul', rev: 580000, fee: 410000, other: 170000 },
  { m: 'Aug', rev: 620000, fee: 440000, other: 180000 },
  { m: 'Sep', rev: 680000, fee: 480000, other: 200000 },
  { m: 'Oct', rev: 720000, fee: 510000, other: 210000 },
  { m: 'Nov', rev: 780000, fee: 550000, other: 230000 },
  { m: 'Dec', rev: 850000, fee: 600000, other: 250000 },
];

const incomeDistribution = [
  { name: 'Tuition Fees', value: 55, color: '#FBBF24' },
  { name: 'Hostel Fees', value: 18, color: '#EF4444' },
  { name: 'Exam Fees', value: 12, color: '#10b981' },
  { name: 'Transport', value: 8, color: '#1E3A8A' },
  { name: 'Other', value: 7, color: '#8b5cf6' },
];

const recentActivities = [
  { time: '2m ago', title: 'New admission approved', desc: 'Aarav Sharma · Nepal Police Preparation', user: 'Ramesh Thapa' },
  { time: '12m ago', title: 'Fee payment received', desc: 'Rs 18,500 from Priya Karki', user: 'Accountant' },
  { time: '25m ago', title: 'Exam paper published', desc: 'IOE Mock Test #14 · 100 questions', user: 'Exam Dept.' },
  { time: '1h ago', title: 'Low attendance alert', desc: 'Batch B-12 at 62% attendance this week', user: 'System' },
  { time: '2h ago', title: 'Notice published', desc: 'Scholarship deadline extended to Jan 31', user: 'Admin' },
  { time: '3h ago', title: 'New lead captured', desc: 'Website inquiry · Rohan Thapa', user: 'System' },
  { time: '4h ago', title: 'Teacher assigned', desc: 'Mr. Sharma to Mathematics Batch A-07', user: 'HR' },
  { time: '5h ago', title: 'Salary processed', desc: 'January payroll · Rs 3,42,000 total', user: 'Accountant' },
];

const pendingApprovals = [
  { name: 'Sita Kumari', course: 'Nepal Police', amount: 'Rs 25,000', date: '18 Jan' },
  { name: 'Ram Prasad', course: 'Loksewa Officer', amount: 'Rs 18,000', date: '17 Jan' },
  { name: 'Anita Thapa', course: 'APF Constable', amount: 'Rs 22,000', date: '16 Jan' },
  { name: 'Kiran Basnet', course: 'IOE Preparation', amount: 'Rs 15,000', date: '15 Jan' },
  { name: 'Nabin Poudel', course: 'Nepal Police', amount: 'Rs 20,000', date: '14 Jan' },
];

const now = new Date();
const hour = now.getHours();
const greeting = hour < 12 ? 'Good Morning' : hour < 17 ? 'Good Afternoon' : 'Good Evening';
const dateStr = now.toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric', year: 'numeric' });

const statCards = [
  { label: 'Total Students', value: 2540, icon: GraduationCap, color: 'from-navy to-navy/80', bg: 'bg-navy/5', accent: 'text-navy' },
  { label: 'Teachers', value: 128, icon: Users, color: 'from-brand-red to-brand-red/80', bg: 'bg-brand-red/5', accent: 'text-brand-red' },
  { label: 'Parents', value: 1890, icon: Baby, color: 'from-gold to-gold/80', bg: 'bg-gold/5', accent: 'text-amber-600' },
  { label: 'Revenue', value: 'Rs 45.6L', icon: Wallet, color: 'from-emerald-500 to-emerald-600', bg: 'bg-emerald-50', accent: 'text-emerald-600' },
  { label: 'Admissions', value: 892, icon: BookOpen, color: 'from-navy to-navy/80', bg: 'bg-navy/5', accent: 'text-navy' },
  { label: 'Active Users', value: 3412, icon: Users, color: 'from-brand-red to-brand-red/80', bg: 'bg-brand-red/5', accent: 'text-brand-red' },
];

export function SuperAdminDashboard() {
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
          <h1 className="text-2xl md:text-3xl font-bold mt-1 text-white">{greeting}, Super Admin</h1>
          <p className="text-white/70 mt-1 text-sm">Here is what is happening at Star Coaching Institute today.</p>
          <div className="flex flex-wrap gap-3 mt-4">
            <Link to="/admin/students" className="inline-flex items-center gap-1.5 px-4 py-2 bg-white/10 hover:bg-white/20 rounded-lg text-sm font-medium transition backdrop-blur-sm text-white">
              <User className="w-4 h-4" /> Manage Students
            </Link>
            <Link to="/admin/payments" className="inline-flex items-center gap-1.5 px-4 py-2 bg-white/10 hover:bg-white/20 rounded-lg text-sm font-medium transition backdrop-blur-sm text-white">
              <Wallet className="w-4 h-4" /> View Collections
            </Link>
            <Link to="/admin/reports" className="inline-flex items-center gap-1.5 px-4 py-2 bg-gold/20 hover:bg-gold/30 rounded-lg text-sm font-medium transition backdrop-blur-sm text-gold">
              <BarChart3 className="w-4 h-4" /> Reports
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
              className={s.bg + ' rounded-xl p-4 border border-gray-200/60 shadow-sm'}
            >
              <div className={'w-10 h-10 rounded-xl bg-gradient-to-br ' + s.color + ' flex items-center justify-center shadow-md mb-3'}>
                <Icon className="w-5 h-5 text-white" />
              </div>
              <p className="text-xs text-gray-500 font-medium">{s.label}</p>
              <p className="text-xl font-bold text-gray-900 mt-0.5">{s.value}</p>
              <span className="text-xs font-semibold text-emerald-600 bg-emerald-100 px-2 py-0.5 rounded-lg flex items-center gap-0.5 mt-2">
                <TrendingUp className="w-3 h-3" /> +12%
              </span>
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
                <h3 className="text-sm font-bold text-gray-900 dark:text-white">Revenue Trend</h3>
                <p className="text-xs text-gray-400 mt-0.5">Monthly revenue over 12 months</p>
              </div>
              <span className="text-xs font-semibold text-emerald-600 bg-emerald-50 px-2.5 py-1 rounded-lg flex items-center gap-1">
                <TrendingUp className="w-3 h-3" /> +23% YoY
              </span>
            </div>
            <div className="h-72">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={revenueMonths}>
                  <defs>
                    <linearGradient id="revG" x1="0" x2="0" y1="0" y2="1">
                      <stop offset="0%" stopColor="#1E3A8A" stopOpacity={0.3} />
                      <stop offset="100%" stopColor="#1E3A8A" stopOpacity={0} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                  <XAxis dataKey="m" stroke="#9ca3af" fontSize={11} />
                  <YAxis stroke="#9ca3af" fontSize={11} tickFormatter={(v) => 'Rs ' + (v / 1000) + 'k'} />
                  <Tooltip contentStyle={{ background: '#fff', border: '1px solid #e5e7eb', borderRadius: 12 }} formatter={(v: number) => ['Rs ' + v.toLocaleString(), undefined]} />
                  <Area type="monotone" dataKey="rev" stroke="#1E3A8A" fill="url(#revG)" strokeWidth={2} name="Total Revenue" />
                </AreaChart>
              </ResponsiveContainer>
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
              <h3 className="text-sm font-bold text-gray-900 dark:text-white">Income Distribution</h3>
              <p className="text-xs text-gray-400 mt-0.5">Revenue by source</p>
            </div>
            <div className="h-56">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie data={incomeDistribution} innerRadius={50} outerRadius={80} dataKey="value" paddingAngle={3}>
                    {incomeDistribution.map((e) => (
                      <Cell key={e.name} fill={e.color} />
                    ))}
                  </Pie>
                  <Tooltip contentStyle={{ background: '#fff', border: '1px solid #e5e7eb', borderRadius: 12 }} formatter={(v: number) => [v + '%', undefined]} />
                </PieChart>
              </ResponsiveContainer>
            </div>
            <div className="grid grid-cols-2 gap-2 mt-2">
              {incomeDistribution.map((item) => (
                <div key={item.name} className="flex items-center gap-2 text-xs">
                  <span className="w-2.5 h-2.5 rounded-full shrink-0" style={{ background: item.color }} />
                  <span className="text-gray-500 dark:text-gray-400 truncate">{item.name}</span>
                  <span className="ml-auto font-semibold text-gray-700 dark:text-gray-200">{item.value}%</span>
                </div>
              ))}
            </div>
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
            <h3 className="text-sm font-bold text-gray-900 dark:text-white mb-1">Recent Activities</h3>
            <p className="text-xs text-gray-400 mb-4">Latest actions across the institute</p>
            <div className="space-y-1">
              {recentActivities.map((a, i) => (
                <div key={i} className="flex items-start gap-3 p-2.5 rounded-xl hover:bg-gray-50 dark:hover:bg-gray-700/50 transition">
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
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.25 }}
          className="space-y-4"
        >
          <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-5 shadow-sm">
            <h3 className="text-sm font-bold text-gray-900 dark:text-white mb-1">Pending Approvals</h3>
            <p className="text-xs text-gray-400 mb-3">{pendingApprovals.length} items awaiting review</p>
            <div className="space-y-2">
              {pendingApprovals.map((a, i) => (
                <div key={i} className="flex items-center justify-between p-2.5 rounded-xl hover:bg-gray-50 dark:hover:bg-gray-700/50 transition">
                  <div className="min-w-0 flex-1">
                    <p className="text-sm font-medium text-gray-900 dark:text-white truncate">{a.name}</p>
                    <p className="text-xs text-gray-500">{a.course} · {a.amount}</p>
                  </div>
                  <div className="flex items-center gap-1 ml-2 shrink-0">
                    <button className="p-1.5 rounded-lg hover:bg-green-50 dark:hover:bg-green-900/20 text-green-600 transition">
                      <CheckCircle className="w-4 h-4" />
                    </button>
                    <button className="p-1.5 rounded-lg hover:bg-red-50 dark:hover:bg-red-900/20 text-red-500 transition">
                      <XCircle className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-5 shadow-sm">
            <h3 className="text-sm font-bold text-gray-900 dark:text-white mb-3">Quick Management</h3>
            <div className="grid grid-cols-2 gap-2">
              {[
                { label: 'Add Student', icon: GraduationCap, to: '/admin/students' },
                { label: 'Add Teacher', icon: Users, to: '/admin/teachers' },
                { label: 'Collect Fee', icon: Wallet, to: '/admin/payments' },
                { label: 'Create Notice', icon: Bell, to: '/admin/notices' },
                { label: 'Schedule Exam', icon: BookOpen, to: '/admin/exams' },
                { label: 'View Reports', icon: BarChart3, to: '/admin/reports' },
              ].map((s) => {
                const Icon = s.icon;
                return (
                  <Link key={s.label} to={s.to} className="flex items-center gap-2.5 p-3 rounded-xl hover:bg-gray-50 dark:hover:bg-gray-700/50 transition group">
                    <div className="w-9 h-9 rounded-lg flex items-center justify-center bg-navy/10 text-navy group-hover:bg-navy/20 transition">
                      <Icon className="w-4 h-4" />
                    </div>
                    <span className="text-xs font-medium text-gray-700 dark:text-gray-300">{s.label}</span>
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
          { label: 'Institution Rating', value: '4.8/5', sub: '96%', trend: '+12%', color: 'gold' },
          { label: 'Pass Percentage', value: '87.3%', sub: '87.3%', trend: '+5%', color: 'navy' },
          { label: 'Student Retention', value: '94.2%', sub: '94.2%', trend: '+2%', color: 'brand-red' },
          { label: 'Staff Satisfaction', value: '4.5/5', sub: '90%', trend: 'Stable', color: 'emerald' },
        ].map((item) => {
          const barColor = item.color === 'gold' ? 'from-gold to-amber-500' : item.color === 'navy' ? 'from-navy to-navy/80' : item.color === 'brand-red' ? 'from-brand-red to-brand-red/80' : 'from-emerald-400 to-emerald-600';
          return (
            <div key={item.label} className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-4 shadow-sm">
              <p className="text-xs font-medium text-gray-500 uppercase tracking-wider">{item.label}</p>
              <p className="text-2xl font-bold text-gray-900 dark:text-white mt-1">{item.value}</p>
              <div className="w-full h-1.5 bg-gray-100 dark:bg-gray-700 rounded-full overflow-hidden mt-2">
                <div className={'h-full rounded-full bg-gradient-to-r ' + barColor} style={{ width: item.sub }} />
              </div>
              <p className="text-xs text-emerald-600 mt-1">&uarr; {item.trend}</p>
            </div>
          );
        })}
      </motion.div>
    </div>
  );
}
