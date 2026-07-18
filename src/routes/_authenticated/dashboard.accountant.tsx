import { AreaChart, Area, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid } from "recharts";
import { Wallet, Clock, TrendingUp, TrendingDown, CreditCard, DollarSign, BarChart3, FileText, PieChart } from "lucide-react";
import { motion } from "framer-motion";
import { Link } from "react-router-dom";

const incomeData = [
  { m: "Jan", income: 480000, expense: 280000 },
  { m: "Feb", income: 520000, expense: 295000 },
  { m: "Mar", income: 610000, expense: 310000 },
  { m: "Apr", income: 590000, expense: 305000 },
  { m: "May", income: 720000, expense: 340000 },
  { m: "Jun", income: 810000, expense: 365000 },
  { m: "Jul", income: 865000, expense: 375000 },
  { m: "Aug", income: 940000, expense: 390000 },
  { m: "Sep", income: 1020000, expense: 415000 },
];

const recentTxns = [
  { date: "10m ago", title: "Fee received", desc: "Priya K. · Rs 18,500 · eSewa" },
  { date: "25m ago", title: "Expense logged", desc: "Stationery purchase · Rs 3,200" },
  { date: "1h ago", title: "Hostel fee paid", desc: "Rohan T. · Rs 12,000" },
  { date: "2h ago", title: "Salary processed", desc: "Staff payroll · Rs 2,45,000" },
  { date: "4h ago", title: "Online payment", desc: "Anita S. · Rs 9,500 · Khalti" },
];

const feeBreakdown = [
  { label: "Tuition Fee", collected: 74, target: 85, amount: 650000 },
  { label: "Hostel Fee", collected: 28, target: 35, amount: 320000 },
  { label: "Exam Fee", collected: 42, target: 50, amount: 185000 },
  { label: "Transport Fee", collected: 15, target: 20, amount: 115000 },
];

export function AccountantDashboard() {
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
          <p className="text-sm text-gold font-medium">Accountant Dashboard</p>
          <h1 className="text-2xl md:text-3xl font-bold mt-1 text-white">Financial Overview</h1>
          <p className="text-white/70 mt-1 text-sm">Track income, expenses, and fee collections</p>
        </div>
      </motion.div>

      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        className="grid grid-cols-2 sm:grid-cols-4 gap-4"
      >
        {[
          { label: "Today's Collection", value: "Rs 42,500", icon: Wallet, color: "from-emerald-500 to-emerald-600", bg: "bg-emerald-50" },
          { label: "Pending Dues", value: "Rs 2,85,000", icon: Clock, color: "from-brand-red to-brand-red/80", bg: "bg-brand-red/5" },
          { label: "Monthly Rev.", value: "Rs 10.20L", icon: TrendingUp, color: "from-navy to-navy/80", bg: "bg-navy/5" },
          { label: "Monthly Exp.", value: "Rs 4.15L", icon: TrendingDown, color: "from-gold to-gold/80", bg: "bg-gold/5" },
        ].map((s) => {
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

      <div className="grid grid-cols-1 xl:grid-cols-3 gap-4">
        <div className="xl:col-span-2">
          <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-5 shadow-sm">
            <div className="flex items-center justify-between mb-4">
              <div>
                <h3 className="text-sm font-bold text-gray-900 dark:text-white">Income vs Expense</h3>
                <p className="text-xs text-gray-400 mt-0.5">Monthly comparison</p>
              </div>
              <span className="text-xs font-semibold text-emerald-600 bg-emerald-50 px-2.5 py-1 rounded-full flex items-center gap-1">
                <TrendingUp className="w-3 h-3" /> Net: Rs 6.25L
              </span>
            </div>
            <div className="h-64">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={incomeData}>
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
                  <Tooltip contentStyle={{ background: '#fff', border: '1px solid #e5e7eb' }} />
                  <Area type="monotone" dataKey="income" stroke="#10b981" fill="url(#inG)" strokeWidth={2} name="Income" />
                  <Area type="monotone" dataKey="expense" stroke="#EF4444" fill="url(#exG)" strokeWidth={2} name="Expense" />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </div>
        </div>

        <div>
          <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-5 shadow-sm">
            <h3 className="text-sm font-bold text-gray-900 dark:text-white mb-1">Recent Transactions</h3>
            <p className="text-xs text-gray-400 mb-4">Latest financial activities</p>
            <div className="space-y-1">
              {recentTxns.map((t, i) => (
                <div key={i} className="flex items-start gap-3 p-2 rounded-xl hover:bg-gray-50 dark:hover:bg-gray-700/50 transition">
                  <div className="w-2 h-2 rounded-full bg-navy mt-2 shrink-0" />
                  <div className="flex-1 min-w-0">
                    <p className="text-xs font-semibold text-gray-900 dark:text-white">{t.title}</p>
                    <p className="text-[11px] text-gray-500">{t.desc}</p>
                  </div>
                  <p className="text-[11px] text-gray-400 shrink-0">{t.date}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-5 gap-4">
        <div className="xl:col-span-3">
          <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-5 shadow-sm">
            <h3 className="text-sm font-bold text-gray-900 dark:text-white mb-4">Fee Collection Status</h3>
            <div className="space-y-4">
              {feeBreakdown.map((f) => {
                const percent = Math.round((f.collected / f.target) * 100);
                return (
                  <div key={f.label}>
                    <div className="flex items-center justify-between mb-1">
                      <p className="text-xs font-semibold text-gray-800 dark:text-gray-200">{f.label}</p>
                      <p className="text-xs text-gray-400">{f.collected}/{f.target} paid</p>
                    </div>
                    <div className="w-full h-2 bg-gray-100 dark:bg-gray-700 rounded-full overflow-hidden">
                      <div
                        className="h-full rounded-full bg-gradient-to-r from-navy to-navy/80"
                        style={{ width: percent + '%' }}
                      />
                    </div>
                    <p className="text-[11px] text-gray-400 mt-1">Rs {f.amount.toLocaleString()} target</p>
                  </div>
                );
              })}
            </div>
          </div>
        </div>

        <div className="xl:col-span-2">
          <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-5 shadow-sm">
            <h3 className="text-sm font-bold text-gray-900 dark:text-white mb-3">Quick Actions</h3>
            <div className="grid grid-cols-2 gap-3">
              {[
                { label: 'Record Payment', icon: CreditCard, to: '/admin/payments' },
                { label: 'Invoice', icon: FileText, to: '/admin/accounting' },
                { label: 'Add Expense', icon: DollarSign, to: '/admin/accounting' },
                { label: 'Reports', icon: BarChart3, to: '/admin/reports' },
              ].map((a) => {
                const Icon = a.icon;
                return (
                  <Link key={a.label} to={a.to}
                    className="flex flex-col items-center gap-2 p-3 rounded-xl hover:bg-gray-50 dark:hover:bg-gray-700/50 transition group"
                  >
                    <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-navy to-navy/80 flex items-center justify-center text-white group-hover:scale-110 transition-transform">
                      <Icon className="w-4 h-4" />
                    </div>
                    <span className="text-[10px] font-semibold text-gray-600 dark:text-gray-300 text-center">{a.label}</span>
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
