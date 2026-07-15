import { useEffect, useMemo, useState } from "react";
import { Link, Outlet, useNavigate, useRouterState } from "@tanstack/react-router";
import { motion, AnimatePresence } from "framer-motion";
import {
  Bell, Calendar, ChevronLeft, ChevronRight, Command, Globe2, Menu, Moon,
  MessageSquare, Plus, Search, Sun, Sparkles, X, Send, CheckCircle2, LogOut,
} from "lucide-react";
import { NAV, QUICK_ACTIONS } from "./nav";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

export function AdminShell() {
  const [collapsed, setCollapsed] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const [rightOpen, setRightOpen] = useState(false);
  const [cmdOpen, setCmdOpen] = useState(false);
  const [chatOpen, setChatOpen] = useState(false);
  const [dark, setDark] = useState(false);
  const navigate = useNavigate();
  const pathname = useRouterState({ select: (s) => s.location.pathname });

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

  const signOut = async () => {
    await supabase.auth.signOut();
    toast.success("Signed out");
    navigate({ to: "/auth" });
  };

  return (
    <div className={`admin-shell ${dark ? "dark" : ""} font-sans`}>
      <div className="flex min-h-screen w-full">
        {/* Sidebar */}
        <Sidebar
          collapsed={collapsed}
          mobileOpen={mobileOpen}
          onClose={() => setMobileOpen(false)}
          onToggleCollapse={() => setCollapsed((v) => !v)}
          pathname={pathname}
        />

        {/* Main column */}
        <div className="flex-1 min-w-0 flex flex-col">
          <TopBar
            onMenu={() => setMobileOpen(true)}
            onOpenCmd={() => setCmdOpen(true)}
            onToggleRight={() => setRightOpen((v) => !v)}
            dark={dark}
            onToggleDark={() => setDark((v) => !v)}
            onSignOut={signOut}
          />
          <main className="flex-1 px-4 md:px-8 py-6 max-w-[1600px] w-full mx-auto">
            <Outlet />
          </main>
        </div>

        {/* Right panel */}
        <AnimatePresence>
          {rightOpen && (
            <RightPanel key="rp" onClose={() => setRightOpen(false)} />
          )}
        </AnimatePresence>

        {/* Floating chat */}
        <FloatingAI open={chatOpen} onToggle={() => setChatOpen((v) => !v)} />

        {/* Cmd palette */}
        <AnimatePresence>
          {cmdOpen && (
            <CommandPalette
              key="cmd"
              onClose={() => setCmdOpen(false)}
              onNavigate={(to) => {
                setCmdOpen(false);
                navigate({ to });
              }}
            />
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}

/* -------------------- SIDEBAR -------------------- */
function Sidebar({
  collapsed, mobileOpen, onClose, onToggleCollapse, pathname,
}: {
  collapsed: boolean; mobileOpen: boolean;
  onClose: () => void; onToggleCollapse: () => void; pathname: string;
}) {
  const [q, setQ] = useState("");
  const filtered = useMemo(() => {
    if (!q.trim()) return NAV;
    const t = q.toLowerCase();
    return NAV
      .map((s) => ({ ...s, items: s.items.filter((i) => i.label.toLowerCase().includes(t)) }))
      .filter((s) => s.items.length);
  }, [q]);

  const width = collapsed ? "w-[76px]" : "w-[262px]";

  return (
    <>
      {/* Mobile overlay */}
      {mobileOpen && (
        <div
          className="fixed inset-0 bg-black/50 backdrop-blur-sm z-40 lg:hidden"
          onClick={onClose}
        />
      )}
      <aside
        className={`
          ${width} shrink-0 z-50
          fixed lg:sticky top-0 h-screen
          ${mobileOpen ? "translate-x-0" : "-translate-x-full"} lg:translate-x-0
          transition-all duration-300 ease-out
          border-r border-[hsl(var(--ap-border))]
          bg-[hsl(var(--ap-panel)/0.7)] backdrop-blur-xl
        `}
      >
        <div className="h-16 flex items-center gap-3 px-4 border-b border-[hsl(var(--ap-border))]">
          <div className="w-10 h-10 rounded-2xl ap-grad flex items-center justify-center text-white font-black shadow-lg shrink-0">
            S
          </div>
          {!collapsed && (
            <div className="min-w-0">
              <p className="font-bold text-sm truncate ap-grad-text">Star Coaching</p>
              <p className="text-[10px] uppercase tracking-widest text-[hsl(var(--ap-muted))]">
                Kathmandu Branch
              </p>
            </div>
          )}
          <button
            onClick={onClose}
            className="lg:hidden ml-auto p-1 rounded hover:bg-[hsl(var(--ap-border)/0.5)]"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {!collapsed && (
          <div className="p-3">
            <div className="relative">
              <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-[hsl(var(--ap-muted))]" />
              <input
                value={q}
                onChange={(e) => setQ(e.target.value)}
                placeholder="Quick search..."
                className="ap-input pl-9"
              />
            </div>
          </div>
        )}

        <nav className="ap-scroll overflow-y-auto px-2 pb-24 h-[calc(100vh-8.5rem)]">
          {filtered.map((section) => (
            <div key={section.title} className="mt-3">
              {!collapsed && (
                <p className="px-3 text-[10px] uppercase font-bold tracking-widest text-[hsl(var(--ap-muted))] mb-1">
                  {section.title}
                </p>
              )}
              <ul className="space-y-0.5">
                {section.items.map((item) => {
                  const active = item.to === pathname ||
                    (item.to !== "/admin" && item.to && pathname.startsWith(item.to));
                  const Icon = item.icon;
                  return (
                    <li key={item.label}>
                      <Link
                        to={item.to || "/admin"}
                        onClick={onClose}
                        className={`
                          group relative flex items-center gap-3 px-3 py-2 rounded-xl
                          text-sm font-medium transition-all
                          ${active
                            ? "bg-gradient-to-r from-[hsl(var(--ap-purple)/0.14)] to-[hsl(var(--ap-orange)/0.10)] text-[hsl(var(--ap-purple))]"
                            : "text-[hsl(var(--ap-ink))] hover:bg-[hsl(var(--ap-border)/0.4)]"}
                        `}
                      >
                        {active && (
                          <motion.span
                            layoutId="side-active"
                            className="absolute left-0 top-1/2 -translate-y-1/2 w-1 h-6 rounded-r-full ap-grad"
                          />
                        )}
                        <Icon className="w-4 h-4 shrink-0" />
                        {!collapsed && (
                          <>
                            <span className="truncate">{item.label}</span>
                            {item.badge && (
                              <span className="ml-auto text-[10px] font-bold px-1.5 py-0.5 rounded-md ap-grad text-white">
                                {item.badge}
                              </span>
                            )}
                          </>
                        )}
                      </Link>
                    </li>
                  );
                })}
              </ul>
            </div>
          ))}
        </nav>

        <div className="absolute bottom-0 left-0 right-0 p-3 border-t border-[hsl(var(--ap-border))] bg-[hsl(var(--ap-panel))]">
          <button
            onClick={onToggleCollapse}
            className="hidden lg:flex items-center gap-2 w-full ap-btn-ghost"
          >
            {collapsed ? <ChevronRight className="w-4 h-4" /> : <ChevronLeft className="w-4 h-4" />}
            {!collapsed && <span>Collapse</span>}
          </button>
        </div>
      </aside>
    </>
  );
}

/* -------------------- TOP BAR -------------------- */
function TopBar({
  onMenu, onOpenCmd, onToggleRight, dark, onToggleDark, onSignOut,
}: {
  onMenu: () => void; onOpenCmd: () => void; onToggleRight: () => void;
  dark: boolean; onToggleDark: () => void; onSignOut: () => void;
}) {
  return (
    <header className="sticky top-0 z-30 h-16 border-b border-[hsl(var(--ap-border))] bg-[hsl(var(--ap-panel)/0.75)] backdrop-blur-xl">
      <div className="h-full px-4 md:px-8 flex items-center gap-3">
        <button onClick={onMenu} className="lg:hidden p-2 rounded-lg hover:bg-[hsl(var(--ap-border)/0.5)]">
          <Menu className="w-5 h-5" />
        </button>

        <button
          onClick={onOpenCmd}
          className="flex-1 max-w-md h-10 flex items-center gap-2 px-3 rounded-xl border border-[hsl(var(--ap-border))] bg-[hsl(var(--ap-panel))] text-[hsl(var(--ap-muted))] text-sm hover:border-[hsl(var(--ap-purple)/0.4)] transition"
        >
          <Search className="w-4 h-4" />
          <span className="hidden sm:inline">Search students, courses, invoices...</span>
          <span className="sm:hidden">Search</span>
          <span className="ml-auto hidden md:inline-flex items-center gap-1 text-[10px] font-mono px-1.5 py-0.5 rounded border border-[hsl(var(--ap-border))]">
            <Command className="w-3 h-3" /> K
          </span>
        </button>

        <div className="hidden xl:flex items-center gap-2 ml-2">
          <TopChip label="Branch" value="Kathmandu" />
          <TopChip label="Year" value="2082/83" />
        </div>

        <div className="ml-auto flex items-center gap-1">
          <IconBtn title="Quick add"><Plus className="w-4 h-4" /></IconBtn>
          <IconBtn title="Calendar"><Calendar className="w-4 h-4" /></IconBtn>
          <IconBtn title="Messages" badge={3}><MessageSquare className="w-4 h-4" /></IconBtn>
          <IconBtn title="Notifications" badge={7} onClick={onToggleRight}>
            <Bell className="w-4 h-4" />
          </IconBtn>
          <IconBtn title="Language"><Globe2 className="w-4 h-4" /></IconBtn>
          <IconBtn title="Theme" onClick={onToggleDark}>
            {dark ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />}
          </IconBtn>
          <ProfileMenu onSignOut={onSignOut} />
        </div>
      </div>
    </header>
  );
}

function TopChip({ label, value }: { label: string; value: string }) {
  return (
    <div className="ap-chip">
      <span className="text-[hsl(var(--ap-muted))]">{label}:</span>
      <span className="font-bold text-[hsl(var(--ap-ink))]">{value}</span>
    </div>
  );
}

function IconBtn({
  children, badge, onClick, title,
}: { children: React.ReactNode; badge?: number; onClick?: () => void; title?: string }) {
  return (
    <button
      title={title}
      onClick={onClick}
      className="relative w-10 h-10 rounded-xl flex items-center justify-center text-[hsl(var(--ap-ink))] hover:bg-[hsl(var(--ap-border)/0.5)] transition"
    >
      {children}
      {badge ? (
        <span className="absolute top-1.5 right-1.5 min-w-[16px] h-4 px-1 rounded-full text-[9px] font-bold text-white flex items-center justify-center ap-grad">
          {badge}
        </span>
      ) : null}
    </button>
  );
}

function ProfileMenu({ onSignOut }: { onSignOut: () => void }) {
  const [open, setOpen] = useState(false);
  return (
    <div className="relative">
      <button
        onClick={() => setOpen((v) => !v)}
        className="flex items-center gap-2 pl-1 pr-2 h-10 rounded-xl hover:bg-[hsl(var(--ap-border)/0.5)]"
      >
        <div className="w-8 h-8 rounded-full ap-grad flex items-center justify-center text-white text-xs font-bold">
          SA
        </div>
        <div className="hidden md:block text-left leading-tight">
          <p className="text-xs font-bold">Super Admin</p>
          <p className="text-[10px] text-[hsl(var(--ap-muted))]">info.starcoaching</p>
        </div>
      </button>
      {open && (
        <>
          <div className="fixed inset-0 z-30" onClick={() => setOpen(false)} />
          <div className="absolute right-0 top-12 w-64 ap-glass p-2 z-40">
            {["My Profile", "Account Settings", "Billing", "Keyboard Shortcuts"].map((x) => (
              <button key={x} className="w-full text-left px-3 py-2 rounded-lg text-sm hover:bg-[hsl(var(--ap-border)/0.5)]">
                {x}
              </button>
            ))}
            <div className="my-1 h-px bg-[hsl(var(--ap-border))]" />
            <button
              onClick={onSignOut}
              className="w-full text-left px-3 py-2 rounded-lg text-sm text-[hsl(var(--ap-danger))] hover:bg-[hsl(var(--ap-danger)/0.08)] flex items-center gap-2"
            >
              <LogOut className="w-4 h-4" /> Sign out
            </button>
          </div>
        </>
      )}
    </div>
  );
}

/* -------------------- RIGHT PANEL -------------------- */
function RightPanel({ onClose }: { onClose: () => void }) {
  const notifications = [
    { icon: "🎓", title: "New admission approved", meta: "Aarav Sharma · 2m ago", tone: "success" },
    { icon: "💰", title: "Fee payment received", meta: "₹18,500 from Priya K. · 12m ago", tone: "info" },
    { icon: "📝", title: "Exam paper ready", meta: "IOE Mock #14 · 25m ago", tone: "warning" },
    { icon: "⚠️", title: "Low attendance alert", meta: "Batch B-12 at 62% · 1h ago", tone: "danger" },
    { icon: "📣", title: "New notice published", meta: "Scholarship extended · 2h ago", tone: "info" },
  ];
  const tasks = [
    { label: "Approve 12 pending admissions", done: false },
    { label: "Review Q3 revenue report", done: false },
    { label: "Publish October results", done: true },
    { label: "Renew Zoom license", done: false },
  ];
  return (
    <motion.aside
      initial={{ x: 360, opacity: 0 }}
      animate={{ x: 0, opacity: 1 }}
      exit={{ x: 360, opacity: 0 }}
      transition={{ type: "spring", stiffness: 260, damping: 28 }}
      className="fixed right-0 top-0 h-screen w-[360px] max-w-[92vw] z-40 border-l border-[hsl(var(--ap-border))] bg-[hsl(var(--ap-panel)/0.9)] backdrop-blur-xl p-4 overflow-y-auto ap-scroll"
    >
      <div className="flex items-center justify-between mb-4">
        <h3 className="font-bold ap-grad-text">Notifications</h3>
        <button onClick={onClose} className="p-1 rounded-lg hover:bg-[hsl(var(--ap-border)/0.5)]">
          <X className="w-4 h-4" />
        </button>
      </div>
      <div className="space-y-2">
        {notifications.map((n, i) => (
          <div key={i} className="ap-card p-3 flex gap-3 hover:shadow-md transition">
            <div className="w-9 h-9 rounded-xl flex items-center justify-center text-lg bg-[hsl(var(--ap-border)/0.4)]">
              {n.icon}
            </div>
            <div className="min-w-0">
              <p className="text-sm font-semibold truncate">{n.title}</p>
              <p className="text-xs text-[hsl(var(--ap-muted))]">{n.meta}</p>
            </div>
          </div>
        ))}
      </div>
      <h4 className="font-bold mt-5 mb-2 text-sm">Today's Tasks</h4>
      <div className="ap-card p-3 space-y-2">
        {tasks.map((t, i) => (
          <label key={i} className="flex items-center gap-3 text-sm cursor-pointer">
            <input type="checkbox" defaultChecked={t.done} className="w-4 h-4 accent-[hsl(var(--ap-purple))]" />
            <span className={t.done ? "line-through text-[hsl(var(--ap-muted))]" : ""}>{t.label}</span>
          </label>
        ))}
      </div>
      <h4 className="font-bold mt-5 mb-2 text-sm">Upcoming meetings</h4>
      <div className="space-y-2">
        {[
          { t: "Faculty stand-up", when: "Today · 4:00 PM" },
          { t: "Parent-teacher meet", when: "Tomorrow · 10:00 AM" },
          { t: "Board review", when: "Fri · 2:30 PM" },
        ].map((m, i) => (
          <div key={i} className="ap-card p-3 flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl ap-grad flex items-center justify-center text-white">
              <Calendar className="w-4 h-4" />
            </div>
            <div>
              <p className="text-sm font-semibold">{m.t}</p>
              <p className="text-xs text-[hsl(var(--ap-muted))]">{m.when}</p>
            </div>
          </div>
        ))}
      </div>
    </motion.aside>
  );
}

/* -------------------- FLOATING AI -------------------- */
function FloatingAI({ open, onToggle }: { open: boolean; onToggle: () => void }) {
  const [msg, setMsg] = useState("");
  const [log, setLog] = useState<{ role: "user" | "ai"; text: string }[]>([
    { role: "ai", text: "Hi! I'm Star AI. Ask me to draft a notice, generate a report, or find a student." },
  ]);
  const send = () => {
    if (!msg.trim()) return;
    setLog((l) => [...l, { role: "user", text: msg }, { role: "ai", text: "Working on it… (demo)" }]);
    setMsg("");
  };
  return (
    <div className="fixed bottom-5 right-5 z-40">
      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0, y: 20, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 20, scale: 0.95 }}
            className="mb-3 w-[340px] max-w-[92vw] h-[420px] ap-glass p-3 flex flex-col"
          >
            <div className="flex items-center gap-2 pb-2 border-b border-[hsl(var(--ap-border))]">
              <div className="w-8 h-8 rounded-xl ap-grad flex items-center justify-center">
                <Sparkles className="w-4 h-4 text-white" />
              </div>
              <div>
                <p className="text-sm font-bold">Star AI Assistant</p>
                <p className="text-[10px] text-[hsl(var(--ap-muted))]">Online · GPT-powered demo</p>
              </div>
            </div>
            <div className="flex-1 overflow-y-auto ap-scroll py-2 space-y-2">
              {log.map((m, i) => (
                <div key={i} className={`flex ${m.role === "user" ? "justify-end" : ""}`}>
                  <div
                    className={`px-3 py-2 rounded-2xl max-w-[85%] text-sm ${
                      m.role === "user"
                        ? "ap-grad text-white"
                        : "bg-[hsl(var(--ap-border)/0.5)]"
                    }`}
                  >
                    {m.text}
                  </div>
                </div>
              ))}
            </div>
            <div className="flex gap-2 pt-2 border-t border-[hsl(var(--ap-border))]">
              <input
                value={msg}
                onChange={(e) => setMsg(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && send()}
                placeholder="Ask anything…"
                className="ap-input"
              />
              <button onClick={send} className="ap-btn"><Send className="w-4 h-4" /></button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
      <motion.button
        whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}
        onClick={onToggle}
        className="w-14 h-14 rounded-full ap-grad shadow-2xl flex items-center justify-center text-white"
      >
        {open ? <X className="w-5 h-5" /> : <Sparkles className="w-6 h-6" />}
      </motion.button>
    </div>
  );
}

/* -------------------- COMMAND PALETTE -------------------- */
function CommandPalette({
  onClose, onNavigate,
}: { onClose: () => void; onNavigate: (to: string) => void }) {
  const [q, setQ] = useState("");
  const items = NAV.flatMap((s) => s.items.map((i) => ({ ...i, section: s.title })));
  const filtered = items.filter((i) => i.label.toLowerCase().includes(q.toLowerCase()));
  return (
    <motion.div
      initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
      className="fixed inset-0 z-[60] bg-black/50 backdrop-blur-md flex items-start justify-center pt-24 px-4"
      onClick={onClose}
    >
      <motion.div
        initial={{ y: -20, opacity: 0 }} animate={{ y: 0, opacity: 1 }}
        onClick={(e) => e.stopPropagation()}
        className="w-full max-w-xl ap-glass p-2"
      >
        <div className="flex items-center gap-2 px-3 py-2 border-b border-[hsl(var(--ap-border))]">
          <Search className="w-4 h-4 text-[hsl(var(--ap-muted))]" />
          <input
            autoFocus value={q} onChange={(e) => setQ(e.target.value)}
            placeholder="Type a command or search…"
            className="flex-1 bg-transparent outline-none text-sm"
          />
          <kbd className="text-[10px] px-1.5 py-0.5 rounded border border-[hsl(var(--ap-border))]">ESC</kbd>
        </div>
        <div className="max-h-[50vh] overflow-y-auto ap-scroll py-2">
          {filtered.slice(0, 24).map((i) => {
            const Icon = i.icon;
            return (
              <button
                key={i.label}
                onClick={() => i.to && onNavigate(i.to)}
                className="w-full flex items-center gap-3 px-3 py-2 rounded-xl hover:bg-[hsl(var(--ap-border)/0.5)] text-sm"
              >
                <Icon className="w-4 h-4 text-[hsl(var(--ap-purple))]" />
                <span className="font-medium">{i.label}</span>
                <span className="ml-auto text-[10px] text-[hsl(var(--ap-muted))]">{i.section}</span>
              </button>
            );
          })}
          {filtered.length === 0 && (
            <div className="p-8 text-center text-sm text-[hsl(var(--ap-muted))]">
              <CheckCircle2 className="w-6 h-6 mx-auto mb-2 opacity-40" />
              No matches
            </div>
          )}
        </div>
        <div className="border-t border-[hsl(var(--ap-border))] px-3 py-2 text-[10px] text-[hsl(var(--ap-muted))] flex gap-3">
          <span>↑↓ Navigate</span><span>↵ Open</span><span>Esc Close</span>
        </div>
      </motion.div>
    </motion.div>
  );
}

/* -------------------- HELPERS EXPORTED FOR PAGES -------------------- */
export function PageHeader({
  title, subtitle, actions,
}: { title: string; subtitle?: string; actions?: React.ReactNode }) {
  return (
    <div className="flex flex-wrap items-end justify-between gap-3 mb-6">
      <div>
        <h1 className="text-2xl md:text-3xl font-black tracking-tight">
          <span className="ap-grad-text">{title}</span>
        </h1>
        {subtitle && <p className="text-sm text-[hsl(var(--ap-muted))] mt-1">{subtitle}</p>}
      </div>
      {actions && <div className="flex gap-2 flex-wrap">{actions}</div>}
    </div>
  );
}

export { QUICK_ACTIONS };
