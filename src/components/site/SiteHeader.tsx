import { useState, useEffect, useCallback } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Menu, Phone, X, LogOut, LayoutDashboard, Shield, User, Bell, Search, Sun, Moon, Maximize, Minimize } from "lucide-react";
import { StarLogo, StarWordmark } from "./StarLogo";
import { Button } from "@/components/ui/button";
import { site } from "@/lib/site-config";
import { getUserRole, isAuthenticated, handleSignOut } from "@/lib/api-auth";
import { ROLE_DASHBOARD_ROUTES } from "@/hooks/use-user-role";
import { useLanguage } from "@/hooks/use-language";
import { LanguageSwitcher } from "./LanguageSwitcher";
import { cn } from "@/lib/utils";

const NAV_ITEMS_PUBLIC = [
  { to: "/", label: "Home" },
  { to: "/about", label: "About" },
  { to: "/courses", label: "Courses" },
  { to: "/faculty", label: "Faculty" },
  { to: "/results", label: "Results" },
  { to: "/gallery", label: "Gallery" },
  { to: "/contact", label: "Contact" },
];

export function SiteHeader() {
  const [open, setOpen] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);
  const [profileOpen, setProfileOpen] = useState(false);
  const [dark, setDark] = useState(() => localStorage.getItem("site-theme") === "dark");
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [notifCount] = useState(3);
  const navigate = useNavigate();
  const { t } = useLanguage();

  const signedIn = isAuthenticated();
  const role = getUserRole();
  const isAdminRole = role === "super_admin";
  const homeTarget = role ? ROLE_DASHBOARD_ROUTES[role] || "/auth" : "/auth";
  const userName = signedIn ? (role ? role.replace("_", " ").replace(/\b\w/g, (c) => c.toUpperCase()) : "User") : "";

  useEffect(() => {
    document.documentElement.classList.toggle("dark", dark);
    localStorage.setItem("site-theme", dark ? "dark" : "light");
  }, [dark]);

  useEffect(() => {
    const handler = () => setIsFullscreen(!!document.fullscreenElement);
    document.addEventListener("fullscreenchange", handler);
    return () => document.removeEventListener("fullscreenchange", handler);
  }, []);

  const toggleFullscreen = useCallback(() => {
    if (!document.fullscreenElement) {
      document.documentElement.requestFullscreen().catch(() => {});
    } else {
      document.exitFullscreen().catch(() => {});
    }
  }, []);

  return (
    <>
      {/* Top contact strip */}
      <div className="bg-navy text-navy-foreground text-xs">
        <div className="max-w-6xl mx-auto px-4 py-2 flex justify-between items-center">
          <div className="flex items-center gap-3">
            <a href={`tel:${site.phones[0]}`} className="flex items-center gap-1.5 hover:text-gold transition">
              <Phone className="w-3 h-3 text-brand-red" />
              <span className="font-semibold">{site.phones[0]}</span>
            </a>
            <span className="hidden sm:inline text-white/40">|</span>
            <a href={`tel:${site.phones[1]}`} className="hidden sm:inline hover:text-gold transition">
              {site.phones[1]}
            </a>
          </div>
          <div className="flex items-center gap-3">
            <LanguageSwitcher />
            <span className="hidden md:inline text-white/60">{site.location}</span>
            {signedIn ? (
              <div className="flex items-center gap-2">
                <Link to={homeTarget} className="flex items-center gap-1 font-semibold hover:text-gold transition">
                  {isAdminRole ? (
                    <><Shield className="w-3 h-3" /> {t("Dashboard")}</>
                  ) : (
                    <><LayoutDashboard className="w-3 h-3" /> {t("Dashboard")}</>
                  )}
                </Link>
                <button onClick={() => handleSignOut(navigate)} className="flex items-center gap-1 font-semibold hover:text-gold transition">
                  <LogOut className="w-3 h-3" /> {t("Sign out")}
                </button>
              </div>
            ) : (
              <Link
                to="/auth"
                className="bg-brand-red text-brand-red-foreground font-bold px-3 py-1 rounded-full hover:brightness-110 transition"
              >
                {t("Student Login")}
              </Link>
            )}
          </div>
        </div>
      </div>

      <header className="sticky top-0 z-40 bg-white/95 backdrop-blur border-b border-border shadow-sm dark:bg-slate-900/95 dark:border-slate-700">
        <div className="max-w-6xl mx-auto px-4 py-3 flex items-center justify-between gap-4">
          <Link to="/" className="flex items-center gap-3 shrink-0">
            <StarLogo size="sm" />
            <StarWordmark />
          </Link>

          <nav className="hidden lg:flex items-center gap-1">
            {NAV_ITEMS_PUBLIC.map((n) => (
              <NavLink key={n.to} to={n.to} label={t(n.label)} />
            ))}
          </nav>

          <div className="hidden lg:flex items-center gap-2">
            {signedIn && (
              <div className="relative">
                <button
                  onClick={() => setProfileOpen(!profileOpen)}
                  className="p-2 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 transition relative"
                  aria-label="Profile menu"
                >
                  <User className="w-4 h-4 text-navy dark:text-slate-300" />
                </button>
                {profileOpen && (
                  <>
                    <div className="fixed inset-0 z-40" onClick={() => setProfileOpen(false)} />
                    <div className="absolute right-0 top-full mt-1 z-50 bg-white dark:bg-slate-800 rounded-lg shadow-lg border border-slate-200 dark:border-slate-700 py-1 min-w-[160px]">
                      <div className="px-3 py-2 border-b border-slate-100 dark:border-slate-700">
                        <p className="text-xs font-bold text-navy dark:text-slate-200">{userName}</p>
                        <p className="text-[10px] text-slate-400">{role}</p>
                      </div>
                      <Link to="/profile" onClick={() => setProfileOpen(false)} className="block px-3 py-1.5 text-xs font-semibold text-navy dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-700">
                        My Profile
                      </Link>
                      <Link to={homeTarget} onClick={() => setProfileOpen(false)} className="block px-3 py-1.5 text-xs font-semibold text-navy dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-700">
                        Dashboard
                      </Link>
                      <button onClick={() => { setProfileOpen(false); handleSignOut(navigate); }} className="w-full text-left px-3 py-1.5 text-xs font-semibold text-red-600 hover:bg-slate-50 dark:hover:bg-slate-700">
                        Sign Out
                      </button>
                    </div>
                  </>
                )}
              </div>
            )}

            {/* Notification Bell */}
            <button
              onClick={() => navigate("/notifications")}
              className="p-2 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 transition relative"
              aria-label="Notifications"
            >
              <Bell className="w-4 h-4 text-navy dark:text-slate-300" />
              {notifCount > 0 && (
                <span className="absolute -top-0.5 -right-0.5 flex items-center justify-center min-w-[16px] h-4 px-1 text-[10px] font-bold text-white bg-brand-red rounded-full shadow-sm">
                  {notifCount}
                </span>
              )}
            </button>

            {/* Search */}
            <button
              onClick={() => setSearchOpen(!searchOpen)}
              className="p-2 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 transition"
              aria-label="Search"
            >
              <Search className="w-4 h-4 text-navy dark:text-slate-300" />
            </button>

            {/* Dark Mode Toggle */}
            <button
              onClick={() => setDark((v) => !v)}
              className="p-2 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 transition"
              aria-label={dark ? "Switch to light mode" : "Switch to dark mode"}
            >
              {dark ? (
                <Sun className="w-4 h-4 text-amber-400" />
              ) : (
                <Moon className="w-4 h-4 text-navy" />
              )}
            </button>

            {/* Fullscreen Toggle */}
            <button
              onClick={toggleFullscreen}
              className="p-2 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 transition"
              aria-label={isFullscreen ? "Exit fullscreen" : "Enter fullscreen"}
            >
              {isFullscreen ? (
                <Minimize className="w-4 h-4 text-navy dark:text-slate-300" />
              ) : (
                <Maximize className="w-4 h-4 text-navy dark:text-slate-300" />
              )}
            </button>

            <Button asChild variant="outline" className="border-navy text-navy font-bold dark:border-slate-400 dark:text-slate-300">
              <Link to="/admission">{t("Apply Now")}</Link>
            </Button>
          </div>

          <button
            className="lg:hidden p-2 text-navy dark:text-slate-300"
            onClick={() => setOpen((v) => !v)}
            aria-label="Toggle menu"
          >
            {open ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
          </button>
        </div>

        {/* Mobile menu */}
        {open && (
          <div className="lg:hidden border-t border-border dark:border-slate-700 bg-white dark:bg-slate-900">
            <nav className="max-w-6xl mx-auto px-4 py-3 flex flex-col gap-1">
              {NAV_ITEMS_PUBLIC.map((n) => (
                <Link
                  key={n.to}
                  to={n.to}
                  onClick={() => setOpen(false)}
                  className="py-2.5 px-3 rounded-lg font-semibold text-navy dark:text-slate-300 hover:bg-secondary dark:hover:bg-slate-800"
                >
                  {t(n.label)}
                </Link>
              ))}
              {signedIn && (
                <Link
                  to={homeTarget}
                  onClick={() => setOpen(false)}
                  className="py-2.5 px-3 rounded-lg font-semibold text-navy dark:text-slate-300 hover:bg-secondary dark:hover:bg-slate-800"
                >
                  {t("Dashboard")}
                </Link>
              )}
              <div className="flex gap-2 mt-2">
                <button
                  onClick={() => setDark((v) => !v)}
                  className="flex-1 py-2.5 px-3 rounded-lg font-semibold text-navy dark:text-slate-300 border border-border dark:border-slate-700 flex items-center justify-center gap-2"
                >
                  {dark ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />}
                  {dark ? "Light" : "Dark"}
                </button>
                <button
                  onClick={toggleFullscreen}
                  className="flex-1 py-2.5 px-3 rounded-lg font-semibold text-navy dark:text-slate-300 border border-border dark:border-slate-700 flex items-center justify-center gap-2"
                >
                  {isFullscreen ? <Minimize className="w-4 h-4" /> : <Maximize className="w-4 h-4" />}
                  {isFullscreen ? "Exit Full" : "Fullscreen"}
                </button>
              </div>
              <Link
                to="/admission"
                onClick={() => setOpen(false)}
                className="mt-2 py-3 px-3 rounded-lg bg-brand-red text-brand-red-foreground font-bold text-center"
              >
                {t("Apply Now")}
              </Link>
            </nav>
          </div>
        )}

        {/* Search overlay */}
        {searchOpen && (
          <div className="border-t border-border dark:border-slate-700 bg-white dark:bg-slate-900">
            <div className="max-w-6xl mx-auto px-4 py-4">
              <div className="relative">
                <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                <input
                  autoFocus
                  type="text"
                  placeholder="Search courses, pages..."
                  className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-border dark:border-slate-700 dark:bg-slate-800 dark:text-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-brand-red/20"
                  onKeyDown={(e) => {
                    if (e.key === "Escape") setSearchOpen(false);
                  }}
                />
              </div>
              <div className="mt-3 flex gap-2 text-xs text-slate-400">
                <span>Popular:</span>
                <button className="hover:text-navy dark:hover:text-white" onClick={() => { navigate("/courses"); setSearchOpen(false); }}>Courses</button>
                <button className="hover:text-navy dark:hover:text-white" onClick={() => { navigate("/admission"); setSearchOpen(false); }}>Admission</button>
                <button className="hover:text-navy dark:hover:text-white" onClick={() => { navigate("/results"); setSearchOpen(false); }}>Results</button>
              </div>
            </div>
          </div>
        )}
      </header>
    </>
  );
}

function NavLink({ to, label }: { to: string; label: string }) {
  return (
    <Link
      to={to}
      className="px-3 py-2 text-sm font-semibold text-foreground/80 hover:text-navy dark:hover:text-white rounded-md transition"
    >
      {label}
    </Link>
  );
}
