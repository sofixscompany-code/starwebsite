import { useState, useEffect, useMemo } from "react";
import { Outlet, useNavigate, useLocation, Link } from "react-router-dom";
import { HeroSlider } from "@/components/site/HeroSlider";
import { motion, AnimatePresence } from "framer-motion";
import { handleSignOut, getUserRole } from "@/lib/api-auth";
import { ROLE_LABELS } from "@/hooks/use-user-role";
import { Sidebar } from "./Sidebar";
import { NAV_ITEMS, getNavItemsForRole } from "./nav";
import { LiveClock, LangSwitcher } from "./TopBarWidgets";
import { StarLogo } from "@/components/site/StarLogo";
import { useAdminT, shortDate } from "@/lib/admin-i18n";
import { collection, getDocs } from "firebase/firestore";
import { db } from "@/integrations/firebase/config";
import {
  Bell,
  Calendar,
  ChevronRight,
  Menu,
  Moon,
  Search,
  Sparkles,
  Send,
  Sun,
  X,
  LogOut,
  User,
} from "lucide-react";

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

  // Route-level role enforcement: every role other than super_admin may only
  // open paths listed in its sidebar (nav.ts is the single source of truth),
  // plus its own dashboard and profile. Blocks URL-bypass into admin pages.
  const allowedPaths = useMemo(() => {
    if (role === "super_admin") return null; // unrestricted
    const base = new Set<string>(["/admin", "/admin/profile"]);
    if (role) getNavItemsForRole(role).forEach((i) => i.to && base.add(i.to));
    return base;
  }, [role]);
  const currentPath = location.pathname.replace(/\/+$/, "") || "/admin";
  const denied =
    !!allowedPaths && currentPath.startsWith("/admin") && !allowedPaths.has(currentPath);

  const { t } = useAdminT();
  const pageName = pageNameFor(currentPath);

  useEffect(() => {
    const saved = localStorage.getItem("admin-theme");
    if (saved === "dark") setDark(true);
  }, []);

  useEffect(() => {
    localStorage.setItem("admin-theme", dark ? "dark" : "light");
  }, [dark]);

  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === "k") {
        e.preventDefault();
        setCmdOpen(true);
      }
      if (e.key === "Escape") setCmdOpen(false);
    };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, []);

  const signOut = () => {
    void handleSignOut(navigate);
  };

  return (
    <div className={`admin-shell ${dark ? "dark" : ""} font-sans`}>
      {/* Fixed Header */}
      <header className="sticky top-0 z-30 bg-white dark:bg-gray-900 border-b border-gray-200 dark:border-gray-800">
        <div className="flex items-center justify-between px-4 sm:px-6 md:px-8 py-3 gap-3">
          <div className="flex items-center gap-3 min-w-0">
            <button
              onClick={() => setMobileOpen(true)}
              className="lg:hidden p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
              aria-label={t("menu")}
            >
              <Menu className="w-5 h-5 text-gray-700 dark:text-gray-300" />
            </button>
            <StarLogo size="sm" className="h-8 w-8 shrink-0" />
            <div className="min-w-0">
              <h2 className="text-base font-bold text-gray-900 dark:text-white truncate">
                {pageName}
              </h2>
              <p className="text-xs text-gray-500 dark:text-gray-400 truncate">
                {t(role ? ROLE_LABELS[role as keyof typeof ROLE_LABELS] || role : t("loading"))} ·
                Star Coaching Centre
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <LiveClock />
            <LangSwitcher />

            <button
              onClick={() => setCmdOpen(true)}
              className="hidden md:flex items-center gap-2 px-3 py-1.5 rounded-lg bg-gray-100 dark:bg-gray-800 text-xs text-gray-500 dark:text-gray-400 hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors"
            >
              <Search className="w-3.5 h-3.5" />
              <span>{t("search")}</span>
              <kbd className="px-1.5 py-0.5 rounded bg-gray-200 dark:bg-gray-700 text-[10px] font-semibold text-gray-400">
                K
              </kbd>
            </button>

            <button
              onClick={() => setDark((v) => !v)}
              className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors text-gray-500 dark:text-gray-400"
              aria-label="Toggle dark mode"
            >
              {dark ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />}
            </button>

            <button
              onClick={() => setRightOpen((v) => !v)}
              className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors text-gray-500 dark:text-gray-400"
              aria-label={t("notifications")}
              title={t("notifications")}
            >
              <Bell className="w-4 h-4" />
            </button>

            <button
              onClick={() => navigate("/admin/profile")}
              className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors text-gray-500 dark:text-gray-400"
              aria-label={t("profile")}
              title={t("profile")}
            >
              <User className="w-4 h-4" />
            </button>

            <button
              onClick={signOut}
              className="p-2 rounded-lg hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors text-red-500"
              aria-label={t("signOut")}
              title={t("signOut")}
            >
              <LogOut className="w-4 h-4" />
            </button>
          </div>
        </div>
      </header>

      {/* Sidebar + Content Layout */}
      <div className="flex w-full">
        <Sidebar
          collapsed={collapsed}
          mobileOpen={mobileOpen}
          onCloseMobile={() => setMobileOpen(false)}
          onToggleCollapse={() => setCollapsed((v) => !v)}
        />

        <main
          className="flex-1 min-w-0 px-6 md:px-8 py-6 max-w-[1440px] w-full mx-auto overflow-y-auto"
          style={{ height: "calc(100vh - 57px)" }}
        >
          <HeroSlider compact />
          {denied ? (
            <div className="rounded-xl border border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900 p-8 text-center">
              <p className="text-lg font-semibold text-gray-900 dark:text-white">
                {t("accessDenied")}
              </p>
              <p className="text-sm text-gray-500 dark:text-gray-400 mt-2">
                {t("accessDeniedBody")}
              </p>
              <button
                onClick={() => navigate("/admin")}
                className="mt-5 px-4 py-2 rounded-lg bg-indigo-600 text-white text-sm font-medium hover:bg-indigo-700 transition-colors"
              >
                {t("backToDashboard")}
              </button>
            </div>
          ) : (
            <>
              <Breadcrumbs />
              <Outlet />
            </>
          )}
        </main>

        <AnimatePresence>
          {rightOpen && <RightPanel key="rp" onClose={() => setRightOpen(false)} />}
        </AnimatePresence>

        <FloatingAI open={chatOpen} onToggle={() => setChatOpen((v) => !v)} />

        <AnimatePresence>
          {cmdOpen && (
            <CommandPalette
              key="cmd"
              onClose={() => setCmdOpen(false)}
              onNavigate={(to) => {
                setCmdOpen(false);
                navigate(to);
              }}
            />
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}

function RightPanel({ onClose }: { onClose: () => void }) {
  const { t } = useAdminT();
  const [items, setItems] = useState<{ title: string; desc: string; time: string }[]>([]);
  const [pendingAdmissions, setPendingAdmissions] = useState(0);
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      // Latest public-form inquiries (readable by super admin only — other
      // roles simply see an empty panel).
      try {
        const snap = await getDocs(collection(db, "inquiries"));
        if (cancelled) return;
        const list = snap.docs
          .map((d) => d.data() as Record<string, unknown>)
          .sort((a, b) => String(b.createdAt || "").localeCompare(String(a.createdAt || "")))
          .slice(0, 5)
          .map((q) => ({
            title: `${t("Inquiries")}: ${String(q.name || q.fullName || "—")}`,
            desc: String(q.message || q.email || q.phone || "").slice(0, 120),
            time: shortDate(q.createdAt as string | number | undefined),
          }));
        setItems(list);
      } catch {
        // No access — leave empty.
      }
      try {
        const snap = await getDocs(collection(db, "admissions"));
        if (cancelled) return;
        setPendingAdmissions(
          snap.docs.filter(
            (d) =>
              String((d.data() as Record<string, unknown>).status || "pending").toLowerCase() ===
              "pending",
          ).length,
        );
      } catch {
        // No access — leave 0.
      }
      if (!cancelled) setLoaded(true);
    })();
    return () => {
      cancelled = true;
    };
  }, []);

  const notifications = [
    ...(pendingAdmissions > 0
      ? [
          {
            title: `${pendingAdmissions} pending admission${pendingAdmissions > 1 ? "s" : ""}`,
            desc: "Open Admissions to review and update statuses.",
            time: "",
          },
        ]
      : []),
    ...items,
  ];

  return (
    <motion.div
      initial={{ x: 320, opacity: 0 }}
      animate={{ x: 0, opacity: 1 }}
      exit={{ x: 320, opacity: 0 }}
      transition={{ type: "spring", damping: 25, stiffness: 200 }}
      className="fixed right-0 top-0 bottom-0 w-80 bg-white dark:bg-gray-900 border-l border-gray-200 dark:border-gray-800 shadow-xl z-40"
    >
      <div className="flex items-center justify-between px-5 py-4 border-b border-gray-200 dark:border-gray-800">
        <h3 className="font-semibold text-gray-900 dark:text-white">{t("notifications")}</h3>
        <button
          onClick={onClose}
          className="p-1 rounded hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors text-gray-400"
        >
          <X className="w-4 h-4" />
        </button>
      </div>
      <div className="overflow-y-auto h-[calc(100%-60px)]">
        {!loaded ? (
          <p className="px-5 py-6 text-sm text-gray-400 text-center">{t("loading")}</p>
        ) : notifications.length === 0 ? (
          <p className="px-5 py-6 text-sm text-gray-400 text-center">{t("caughtUp")}</p>
        ) : (
          notifications.map((n, i) => (
            <div
              key={i}
              className="px-5 py-3.5 border-b border-gray-100 dark:border-gray-800 hover:bg-gray-50 dark:hover:bg-gray-800/50 transition-colors"
            >
              <p className="text-sm font-medium text-gray-900 dark:text-white">{n.title}</p>
              <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">{n.desc}</p>
              {n.time && (
                <p className="text-[11px] text-gray-400 dark:text-gray-500 mt-1.5">{n.time}</p>
              )}
            </div>
          ))
        )}
      </div>
    </motion.div>
  );
}

function FloatingAI({ open, onToggle }: { open: boolean; onToggle: () => void }) {
  const [messages, setMessages] = useState<{ role: string; text: string }[]>([
    { role: "ai", text: "Hello! I'm your Star AI assistant. How can I help you today?" },
  ]);
  const [input, setInput] = useState("");

  const handleSend = () => {
    if (!input.trim()) return;
    setMessages((prev) => [...prev, { role: "user", text: input }]);
    setInput("");
    setMessages((prev) => [
      ...prev,
      {
        role: "ai",
        text: "I'm not connected to a live AI model yet, so I can't answer questions. Use the search (⌘K / Ctrl+K) to jump to any page, or ask your administrator.",
      },
    ]);
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
              <button
                onClick={onToggle}
                className="p-1 rounded hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors text-gray-400"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            </div>
            <div className="h-64 overflow-y-auto p-4 space-y-3">
              {messages.map((m, i) => (
                <div
                  key={i}
                  className={`flex ${m.role === "user" ? "justify-end" : "justify-start"}`}
                >
                  <div
                    className={`max-w-[85%] px-3.5 py-2.5 rounded-2xl text-sm leading-relaxed ${
                      m.role === "user"
                        ? "bg-indigo-600 text-white rounded-br-md"
                        : "bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300 rounded-bl-md"
                    }`}
                  >
                    {m.text}
                  </div>
                </div>
              ))}
            </div>
            <div className="flex items-center gap-2 px-4 py-3 border-t border-gray-200 dark:border-gray-800">
              <input
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && handleSend()}
                placeholder="Ask me anything..."
                className="flex-1 px-3.5 py-2 rounded-xl bg-gray-100 dark:bg-gray-800 border-none text-sm text-gray-700 dark:text-gray-300 placeholder:text-gray-400 outline-none focus:ring-2 focus:ring-indigo-500/20"
              />
              <button
                onClick={handleSend}
                className="p-2 rounded-xl bg-indigo-600 text-white hover:bg-indigo-700 transition-colors"
              >
                <Send className="w-4 h-4" />
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}

function CommandPalette({
  onClose,
  onNavigate,
}: {
  onClose: () => void;
  onNavigate: (to: string) => void;
}) {
  const [query, setQuery] = useState("");
  const role = getUserRole();
  const { t } = useAdminT();

  const items = useMemo(() => {
    const seen = new Set<string>();
    const base: { title: string; key: string; path: string }[] = [
      { title: t("Dashboard"), key: "Dashboard", path: "/admin" },
    ];
    if (role) {
      getNavItemsForRole(role).forEach((item) => {
        if (item.to && !seen.has(item.to)) {
          seen.add(item.to);
          base.push({ title: t(item.label), key: item.label, path: item.to });
        }
      });
    }
    const q = query.toLowerCase().trim();
    return base.filter(
      (i) =>
        !q ||
        i.title.toLowerCase().includes(q) ||
        i.key.toLowerCase().includes(q) ||
        i.path.includes(q),
    );
  }, [role, query, t]);

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
            placeholder={t("commandSearch")}
            className="flex-1 bg-transparent text-sm text-gray-700 dark:text-gray-300 placeholder:text-gray-400 outline-none"
          />
          <kbd className="px-1.5 py-0.5 rounded bg-gray-100 dark:bg-gray-800 text-[10px] font-semibold text-gray-400">
            ESC
          </kbd>
        </div>
        <div className="max-h-64 overflow-y-auto">
          {items.length === 0 ? (
            <p className="px-5 py-6 text-sm text-gray-400 text-center">{t("noResultsFound")}</p>
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

export const PageHeader = ({
  title,
  subtitle,
  actions,
}: {
  title: string;
  subtitle?: string;
  actions?: React.ReactNode;
}) => (
  <div className="flex items-start justify-between mb-6">
    <div>
      <h1 className="text-xl font-bold text-gray-900 dark:text-white">{title}</h1>
      {subtitle && <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">{subtitle}</p>}
    </div>
    {actions && <div className="flex items-center gap-2 shrink-0">{actions}</div>}
  </div>
);

const BREADCRUMB_LABELS: Record<string, string> = {
  admin: "Admin",
  notices: "Notices & Events",
  sms: "SMS",
  inquiries: "Inquiries",
  marketing: "Marketing",
  email: "Email",
  whatsapp: "WhatsApp",
  push: "Push Notifications",
  support: "Support",
  profile: "Profile",
  users: "User Management",
  roles: "Roles",
  branches: "Branches",
  settings: "Settings",
  audit: "Audit Logs",
  ai: "AI Assistant",
  courses: "Courses",
  lms: "LMS",
  live: "Live Classes",
  homework: "Homework",
  assignments: "Assignments",
  attendance: "Attendance",
  exams: "Examinations",
  results: "Results",
  "student-cards": "Student Cards",
  hostel: "Hostel",
  payments: "Payments",
  accounting: "Accounting",
  reports: "Reports",
  analytics: "Analytics",
  students: "Students",
  teachers: "Teachers",
  parents: "Parents",
  admissions: "Admissions",
};

/** Human page name for the top bar (derived from the last URL segment). */
function pageNameFor(path: string): string {
  const parts = path.split("/").filter(Boolean);
  if (parts.length < 2) return "Dashboard";
  const last = parts[parts.length - 1];
  return BREADCRUMB_LABELS[last] || last.charAt(0).toUpperCase() + last.slice(1).replace(/-/g, " ");
}

function Breadcrumbs() {
  const location = useLocation();
  const { t } = useAdminT();
  const parts = location.pathname.split("/").filter(Boolean);

  if (parts.length < 2) return null;

  // Only crumb targets that are real pages (dashboard index, the role's nav
  // entries, or profile) become links; intermediate path segments like
  // "/admin/teacher" or "/admin/crm" have no route of their own, so they are
  // rendered as plain text instead of a link that would bounce to the homepage.
  const linkable = new Set<string>(["/admin", "/admin/profile"]);
  NAV_ITEMS.forEach((i) => i.to && linkable.add(i.to));

  return (
    <nav className="flex items-center gap-1.5 text-xs text-gray-400 dark:text-gray-500 mb-4">
      {parts.map((part, i) => {
        const label = t(
          BREADCRUMB_LABELS[part] ||
            part.charAt(0).toUpperCase() + part.slice(1).replace(/-/g, " "),
        );
        const href = "/" + parts.slice(0, i + 1).join("/");
        const isLast = i === parts.length - 1;
        return (
          <span key={href} className="flex items-center gap-1.5">
            {i > 0 && <span className="text-gray-300 dark:text-gray-600">/</span>}
            {!isLast && linkable.has(href) ? (
              <Link
                to={href}
                className="hover:text-gray-700 dark:hover:text-gray-300 transition-colors"
              >
                {label}
              </Link>
            ) : (
              <span
                className={
                  isLast
                    ? "text-gray-600 dark:text-gray-300 font-medium"
                    : "text-gray-400 dark:text-gray-500"
                }
              >
                {label}
              </span>
            )}
          </span>
        );
      })}
    </nav>
  );
}

export const QUICK_ACTIONS = [
  {
    title: "Add Student",
    icon: "UserPlus",
    path: "/admin/students",
    color: "bg-indigo-50 text-indigo-600",
  },
  {
    title: "Collect Fee",
    icon: "Wallet",
    path: "/admin/payments",
    color: "bg-green-50 text-green-600",
  },
  {
    title: "Create Notice",
    icon: "Bell",
    path: "/admin/notices",
    color: "bg-amber-50 text-amber-600",
  },
  {
    title: "Schedule Exam",
    icon: "Award",
    path: "/admin/exams",
    color: "bg-purple-50 text-purple-600",
  },
];
