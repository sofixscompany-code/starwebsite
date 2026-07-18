import { useState, useEffect } from 'react';
import { Outlet, useNavigate, useLocation } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { clearToken, getUserRole } from '@/lib/api-auth';
import { ROLE_LABELS } from '@/hooks/use-user-role';
import { toast } from 'sonner';
import { Sidebar } from './Sidebar';
import {
  Bell, Calendar, ChevronRight, Command, Menu, Moon, Search,
  Sparkles, Send, Sun, X, LogOut, User,
} from 'lucide-react';

export function AdminShell() {
  const [collapsed, setCollapsed] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const [rightOpen, setRightOpen] = useState(false);
  const [cmdOpen, setCmdOpen] = useState(false);
  const [chatOpen, setChatOpen] = useState(false);
  const [dark, setDark] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();
  const role = getUserRole();

  useEffect(() => {
    const saved = localStorage.getItem('admin-theme');
    if (saved === 'dark') setDark(true);
  }, []);

  useEffect(() => {
    localStorage.setItem('admin-theme', dark ? 'dark' : 'light');
  }, [dark]);

  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === 'k') {
        e.preventDefault();
        setCmdOpen(true);
      }
      if (e.key === 'Escape') setCmdOpen(false);
    };
    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, []);

  const signOut = () => {
    clearToken();
    navigate('/auth');
  };

  return (
    <div className={`admin-shell ${dark ? 'dark' : ''} font-sans`}>
      <div className="flex min-h-screen w-full">
        <Sidebar
          collapsed={collapsed}
          mobileOpen={mobileOpen}
          onCloseMobile={() => setMobileOpen(false)}
          onToggleCollapse={() => setCollapsed((v) => !v)}
        />

        <div className="flex-1 min-w-0 flex flex-col">
          <TopBar
            onMenu={() => setMobileOpen(true)}
            onOpenCmd={() => setCmdOpen(true)}
            onToggleRight={() => setRightOpen((v) => !v)}
            dark={dark}
            onToggleDark={() => setDark((v) => !v)}
            onSignOut={signOut}
            role={role || null}
          />
          <main className="flex-1 px-6 md:px-8 py-6 max-w-[1440px] w-full mx-auto">
            <Breadcrumbs />
            <Outlet />
          </main>
        </div>

        <AnimatePresence>
          {rightOpen && <RightPanel key="rp" onClose={() => setRightOpen(false)} />}
        </AnimatePresence>

        <FloatingAI open={chatOpen} onToggle={() => setChatOpen((v) => !v)} />

        <AnimatePresence>
          {cmdOpen && (
            <CommandPalette
              key="cmd"
              onClose={() => setCmdOpen(false)}
              onNavigate={(to) => { setCmdOpen(false); navigate(to); }}
            />
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}

function TopBar({
  onMenu, onOpenCmd, onToggleRight, dark, onToggleDark, onSignOut, role,
}: {
  onMenu: () => void; onOpenCmd: () => void; onToggleRight: () => void;
  dark: boolean; onToggleDark: () => void; onSignOut: () => void; role: string | null;
}) {
  const now = new Date();
  const hour = now.getHours();
  const greeting = hour < 12 ? 'Good morning' : hour < 17 ? 'Good afternoon' : 'Good evening';

  return (
    <header className="sticky top-0 z-30 bg-white dark:bg-gray-900 border-b border-gray-200 dark:border-gray-800">
      <div className="flex items-center justify-between px-6 md:px-8 py-3">
        <div className="flex items-center gap-4">
          <button onClick={onMenu} className="lg:hidden p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors">
            <Menu className="w-5 h-5 text-gray-700 dark:text-gray-300" />
          </button>
          <div>
            <h2 className="text-base font-bold text-gray-900 dark:text-white">{greeting}</h2>
            <p className="text-xs text-gray-500 dark:text-gray-400 capitalize">
              {role ? (ROLE_LABELS[role as keyof typeof ROLE_LABELS] || role) : 'Loading...'} Dashboard
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={onOpenCmd}
            className="hidden md:flex items-center gap-2 px-3 py-1.5 rounded-lg bg-gray-100 dark:bg-gray-800 text-xs text-gray-500 dark:text-gray-400 hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors"
          >
            <Search className="w-3.5 h-3.5" />
            <span>Search...</span>
            <kbd className="px-1.5 py-0.5 rounded bg-gray-200 dark:bg-gray-700 text-[10px] font-semibold text-gray-400">⌘K</kbd>
          </button>

          <button
            onClick={onToggleDark}
            className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors text-gray-500 dark:text-gray-400"
            aria-label="Toggle dark mode"
          >
            {dark ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />}
          </button>

          <button
            onClick={onToggleRight}
            className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors text-gray-500 dark:text-gray-400 relative"
            aria-label="Notifications"
          >
            <Bell className="w-4 h-4" />
            <span className="absolute top-1 right-1 w-2 h-2 bg-red-500 rounded-full" />
          </button>

          <button
            onClick={onSignOut}
            className="p-2 rounded-lg hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors text-red-500"
            aria-label="Sign out"
          >
            <LogOut className="w-4 h-4" />
          </button>
        </div>
      </div>
    </header>
  );
}

function RightPanel({ onClose }: { onClose: () => void }) {
  const notifications = [
    { title: 'New admission request', desc: 'John Doe applied for Class 10', time: '2m ago' },
    { title: 'Fee payment received', desc: '₹15,000 from Student #1234', time: '15m ago' },
    { title: 'Exam schedule updated', desc: 'Mid-term exams moved to next week', time: '1h ago' },
    { title: 'New inquiry', desc: 'Parent requested campus tour', time: '3h ago' },
    { title: 'Attendance report', desc: 'Class 12A has 92% attendance', time: '5h ago' },
  ];

  return (
    <motion.div
      initial={{ x: 320, opacity: 0 }}
      animate={{ x: 0, opacity: 1 }}
      exit={{ x: 320, opacity: 0 }}
      transition={{ type: 'spring', damping: 25, stiffness: 200 }}
      className="fixed right-0 top-0 bottom-0 w-80 bg-white dark:bg-gray-900 border-l border-gray-200 dark:border-gray-800 shadow-xl z-40"
    >
      <div className="flex items-center justify-between px-5 py-4 border-b border-gray-200 dark:border-gray-800">
        <h3 className="font-semibold text-gray-900 dark:text-white">Notifications</h3>
        <button onClick={onClose} className="p-1 rounded hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors text-gray-400">
          <X className="w-4 h-4" />
        </button>
      </div>
      <div className="overflow-y-auto h-[calc(100%-60px)]">
        {notifications.map((n, i) => (
          <div key={i} className="px-5 py-3.5 border-b border-gray-100 dark:border-gray-800 hover:bg-gray-50 dark:hover:bg-gray-800/50 transition-colors cursor-pointer">
            <p className="text-sm font-medium text-gray-900 dark:text-white">{n.title}</p>
            <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">{n.desc}</p>
            <p className="text-[11px] text-gray-400 dark:text-gray-500 mt-1.5">{n.time}</p>
          </div>
        ))}
      </div>
    </motion.div>
  );
}

function FloatingAI({ open, onToggle }: { open: boolean; onToggle: () => void }) {
  const [messages, setMessages] = useState<{ role: string; text: string }[]>([
    { role: 'ai', text: 'Hello! I\'m your Star AI assistant. How can I help you today?' },
  ]);
  const [input, setInput] = useState('');

  const handleSend = () => {
    if (!input.trim()) return;
    setMessages((prev) => [...prev, { role: 'user', text: input }]);
    setInput('');
    setTimeout(() => {
      setMessages((prev) => [...prev, { role: 'ai', text: 'I\'m processing your request. This is a demo response.' }]);
    }, 1000);
  };

  return (
    <>
      <button
        onClick={onToggle}
        className="fixed bottom-6 right-6 w-12 h-12 rounded-full bg-indigo-600 text-white shadow-lg flex items-center justify-center hover:bg-indigo-700 transition-colors z-30"
        aria-label="AI Assistant"
      >
        <Sparkles className="w-5 h-5" />
      </button>

      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            exit={{ y: 20, opacity: 0 }}
            className="fixed bottom-20 right-6 w-80 bg-white dark:bg-gray-900 rounded-2xl border border-gray-200 dark:border-gray-800 shadow-xl z-30 overflow-hidden"
          >
            <div className="flex items-center justify-between px-4 py-3 border-b border-gray-200 dark:border-gray-800">
              <div className="flex items-center gap-2">
                <Sparkles className="w-4 h-4 text-indigo-600" />
                <span className="text-sm font-semibold text-gray-900 dark:text-white">Star AI</span>
              </div>
              <button onClick={onToggle} className="p-1 rounded hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors text-gray-400">
                <X className="w-3.5 h-3.5" />
              </button>
            </div>
            <div className="h-64 overflow-y-auto p-4 space-y-3">
              {messages.map((m, i) => (
                <div key={i} className={`flex ${m.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                  <div className={`max-w-[85%] px-3.5 py-2.5 rounded-2xl text-sm leading-relaxed ${
                    m.role === 'user'
                      ? 'bg-indigo-600 text-white rounded-br-md'
                      : 'bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300 rounded-bl-md'
                  }`}>
                    {m.text}
                  </div>
                </div>
              ))}
            </div>
            <div className="flex items-center gap-2 px-4 py-3 border-t border-gray-200 dark:border-gray-800">
              <input
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && handleSend()}
                placeholder="Ask me anything..."
                className="flex-1 px-3.5 py-2 rounded-xl bg-gray-100 dark:bg-gray-800 border-none text-sm text-gray-700 dark:text-gray-300 placeholder:text-gray-400 outline-none focus:ring-2 focus:ring-indigo-500/20"
              />
              <button onClick={handleSend} className="p-2 rounded-xl bg-indigo-600 text-white hover:bg-indigo-700 transition-colors">
                <Send className="w-4 h-4" />
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}

function CommandPalette({ onClose, onNavigate }: { onClose: () => void; onNavigate: (to: string) => void }) {
  const [query, setQuery] = useState('');

  const items = [
    { title: 'Dashboard', path: '/admin' },
    { title: 'Students', path: '/admin/students' },
    { title: 'Teachers', path: '/admin/teachers' },
    { title: 'Admissions', path: '/admin/admissions' },
    { title: 'Payments', path: '/admin/payments' },
    { title: 'Reports', path: '/admin/reports' },
    { title: 'Settings', path: '/admin/settings' },
    { title: 'Courses', path: '/admin/courses' },
    { title: 'Attendance', path: '/admin/attendance' },
    { title: 'Library', path: '/admin/library' },
    { title: 'My Profile', path: '/admin/profile' },
  ].filter((i) => i.title.toLowerCase().includes(query.toLowerCase()));

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      onClick={onClose}
      className="fixed inset-0 bg-black/50 z-50 flex items-start justify-center pt-24"
    >
      <motion.div
        initial={{ y: -20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        exit={{ y: -20, opacity: 0 }}
        onClick={(e) => e.stopPropagation()}
        className="w-full max-w-lg bg-white dark:bg-gray-900 rounded-2xl border border-gray-200 dark:border-gray-800 shadow-xl overflow-hidden"
      >
        <div className="flex items-center gap-3 px-5 py-3.5 border-b border-gray-200 dark:border-gray-800">
          <Search className="w-4 h-4 text-gray-400" />
          <input
            autoFocus
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search pages, actions..."
            className="flex-1 bg-transparent text-sm text-gray-700 dark:text-gray-300 placeholder:text-gray-400 outline-none"
          />
          <kbd className="px-1.5 py-0.5 rounded bg-gray-100 dark:bg-gray-800 text-[10px] font-semibold text-gray-400">ESC</kbd>
        </div>
        <div className="max-h-64 overflow-y-auto">
          {items.length === 0 ? (
            <p className="px-5 py-6 text-sm text-gray-400 text-center">No results found</p>
          ) : (
            items.map((item) => (
              <button
                key={item.path}
                onClick={() => onNavigate(item.path)}
                className="w-full flex items-center gap-3 px-5 py-3 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors"
              >
                <ChevronRight className="w-4 h-4 text-gray-400" />
                {item.title}
              </button>
            ))
          )}
        </div>
      </motion.div>
    </motion.div>
  );
}

export const PageHeader = ({ title, subtitle, actions }: { title: string; subtitle?: string; actions?: React.ReactNode }) => (
  <div className="flex items-start justify-between mb-6">
    <div>
      <h1 className="text-xl font-bold text-gray-900 dark:text-white">{title}</h1>
      {subtitle && <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">{subtitle}</p>}
    </div>
    {actions && <div className="flex items-center gap-2 shrink-0">{actions}</div>}
  </div>
);

const BREADCRUMB_LABELS: Record<string, string> = {
  admin: 'Admin', notices: 'Notices & Events', crm: 'CRM', hr: 'HR',
  sms: 'SMS', leads: 'Leads', employees: 'Employees',
  payroll: 'Payroll', leaves: 'Leaves', departments: 'Departments',
  inquiries: 'Inquiries', visitors: 'Visitors', counselling: 'Counselling',
  marketing: 'Marketing', email: 'Email', whatsapp: 'WhatsApp', push: 'Push Notifications',
  support: 'Support', profile: 'Profile',
  users: 'User Management', roles: 'Roles', branches: 'Branches',
  settings: 'Settings', audit: 'Audit Logs', ai: 'AI Assistant',
  courses: 'Courses', lms: 'LMS', live: 'Live Classes',
  homework: 'Homework', assignments: 'Assignments',
  attendance: 'Attendance', exams: 'Examinations',
  results: 'Results', certificates: 'Certificates',
  'id-cards': 'ID Cards', library: 'Library', hostel: 'Hostel',
  transport: 'Transport', payments: 'Payments',
  accounting: 'Accounting', reports: 'Reports',
  analytics: 'Analytics', students: 'Students',
  teachers: 'Teachers', parents: 'Parents',
  admissions: 'Admissions', reception: 'Reception',
};

function Breadcrumbs() {
  const location = useLocation();
  const parts = location.pathname.split('/').filter(Boolean);

  if (parts.length < 2) return null;

  return (
    <nav className="flex items-center gap-1.5 text-xs text-gray-400 dark:text-gray-500 mb-4">
      {parts.map((part, i) => {
        const label = BREADCRUMB_LABELS[part] || part.charAt(0).toUpperCase() + part.slice(1).replace(/-/g, ' ');
        const href = '/' + parts.slice(0, i + 1).join('/');
        return (
          <span key={href} className="flex items-center gap-1.5">
            {i > 0 && <span className="text-gray-300 dark:text-gray-600">/</span>}
            {i < parts.length - 1 ? (
              <a href={href} className="hover:text-gray-700 dark:hover:text-gray-300 transition-colors">{label}</a>
            ) : (
              <span className="text-gray-600 dark:text-gray-300 font-medium">{label}</span>
            )}
          </span>
        );
      })}
    </nav>
  );
}

export const QUICK_ACTIONS = [
  { title: 'Add Student', icon: 'UserPlus', path: '/admin/students', color: 'bg-indigo-50 text-indigo-600' },
  { title: 'Collect Fee', icon: 'Wallet', path: '/admin/payments', color: 'bg-green-50 text-green-600' },
  { title: 'Create Notice', icon: 'Bell', path: '/admin/notices', color: 'bg-amber-50 text-amber-600' },
  { title: 'Schedule Exam', icon: 'Award', path: '/admin/exams', color: 'bg-purple-50 text-purple-600' },
];
