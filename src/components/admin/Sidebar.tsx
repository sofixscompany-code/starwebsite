import { useState, useEffect, useMemo } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
  LayoutDashboard, ChevronLeft, ChevronRight, LogOut, X, Moon, Sun,
  Search as SearchIcon, ChevronDown,
} from 'lucide-react';
import { StarLogo } from '@/components/site/StarLogo';
import { getUserRole, clearAuthData } from '@/lib/api-auth';
import { getNavSectionsForRole, type NavItem, type NavSection } from './nav';

interface SidebarProps {
  collapsed?: boolean;
  onToggleCollapse?: () => void;
  mobileOpen?: boolean;
  onCloseMobile?: () => void;
}

export function Sidebar({ collapsed = false, onToggleCollapse, mobileOpen = false, onCloseMobile }: SidebarProps) {
  const location = useLocation();
  const navigate = useNavigate();
  const userRole = getUserRole() as string | null;
  const [dark, setDark] = useState(() => localStorage.getItem('admin-theme') === 'dark');
  const [searchQuery, setSearchQuery] = useState('');
  const [expandedSections, setExpandedSections] = useState<Record<string, boolean>>({});

  const navSections = useMemo(() => {
    if (!userRole) return [];
    return getNavSectionsForRole(userRole);
  }, [userRole]);

  const filteredSections = useMemo(() => {
    if (!searchQuery.trim()) return navSections;
    const q = searchQuery.toLowerCase();
    return navSections
      .map((section) => ({
        ...section,
        items: section.items.filter((item) => item.label.toLowerCase().includes(q)),
      }))
      .filter((section) => section.items.length > 0);
  }, [searchQuery, navSections]);

  useEffect(() => {
    localStorage.setItem('admin-theme', dark ? 'dark' : 'light');
  }, [dark]);

  // Auto-expand section containing active route
  useEffect(() => {
    const newExpanded: Record<string, boolean> = {};
    filteredSections.forEach((section) => {
      const hasActive = section.items.some((item) => isActive(item.to || ''));
      if (hasActive) {
        newExpanded[section.header] = true;
      }
    });
    setExpandedSections((prev) => ({ ...prev, ...newExpanded }));
  }, [location.pathname, filteredSections]);

  const handleSignOut = () => {
    clearAuthData();
    navigate('/auth', { replace: true });
  };

  const isActive = (path: string) => {
    return location.pathname === path || location.pathname.startsWith(`${path}/`);
  };

  const toggleSection = (header: string) => {
    setExpandedSections((prev) => ({ ...prev, [header]: !prev[header] }));
  };

  const renderItem = (item: NavItem) => {
    const Icon = item.icon || LayoutDashboard;
    const active = isActive(item.to || '');
    return (
      <Link
        key={item.to || item.label}
        to={item.to || '#'}
        onClick={() => { onCloseMobile?.(); setSearchQuery(''); }}
        className={`flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium transition-all duration-150 ${
          active
            ? 'bg-navy text-white shadow-sm'
            : 'text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-800 hover:text-gray-900 dark:hover:text-white'
        }`}
      >
        <Icon className={`w-4 h-4 shrink-0 ${active ? 'text-white' : ''}`} />
        <span className="flex-1 truncate">{item.label}</span>
        {item.badge && (
          <span className={`px-1.5 py-0.5 text-[10px] font-semibold rounded-full whitespace-nowrap ${
            active ? 'bg-white/20 text-white' : 'bg-navy/10 dark:bg-navy/30 text-navy dark:text-indigo-400'
          }`}>
            {item.badge}
          </span>
        )}
      </Link>
    );
  };

  const renderSection = (section: NavSection) => {
    const isExpanded = expandedSections[section.header] ?? (section.items.length <= 5);

    return (
      <div key={section.header} className="mb-1">
        <button
          onClick={() => toggleSection(section.header)}
          className="flex items-center gap-2 w-full px-3 py-1.5 text-[10px] font-bold uppercase tracking-widest text-gray-400 dark:text-gray-500 hover:text-gray-600 dark:hover:text-gray-400 transition-colors"
        >
          <ChevronDown className={`w-3 h-3 transition-transform duration-200 ${isExpanded ? 'rotate-0' : '-rotate-90'}`} />
          {!collapsed && <span>{section.header}</span>}
        </button>
        <AnimatePresence initial={false}>
          {isExpanded && (
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: 'auto', opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              transition={{ duration: 0.2 }}
              className="overflow-hidden"
            >
              <div className="space-y-0.5 py-1">
                {section.items.map(renderItem)}
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    );
  };

  return (
    <>
      <AnimatePresence>
        {mobileOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onCloseMobile}
            className="fixed inset-0 bg-black/50 z-40 lg:hidden"
          />
        )}
      </AnimatePresence>

      <motion.aside
        className={`fixed lg:static inset-y-0 left-0 z-50 flex flex-col bg-white dark:bg-gray-900 border-r border-gray-200 dark:border-gray-800 transition-all duration-300 ${
          collapsed ? 'w-[72px]' : 'w-64'
        } ${mobileOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'}`}
      >
        {/* Header */}
        <div className="flex items-center justify-between h-16 px-4 border-b border-gray-200 dark:border-gray-800 shrink-0">
          {!collapsed ? (
            <Link to="/" className="flex items-center gap-3">
              <StarLogo size="sm" />
              <span className="font-bold text-base text-gray-900 dark:text-white">Star ERP</span>
            </Link>
          ) : (
            <StarLogo size="sm" />
          )}
          <button onClick={onCloseMobile} className="lg:hidden p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 text-gray-400">
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Search */}
        {!collapsed && (
          <div className="px-3 pt-3 pb-1 shrink-0">
            <div className="relative">
              <SearchIcon className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-gray-400" />
              <input
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search pages..."
                className="w-full pl-9 pr-3 py-2 rounded-lg bg-gray-100 dark:bg-gray-800 text-sm text-gray-700 dark:text-gray-300 placeholder:text-gray-400 outline-none focus:ring-2 focus:ring-navy/20 transition-all"
              />
            </div>
          </div>
        )}

        {/* Navigation */}
        <nav className="flex-1 overflow-y-auto py-2 px-2 min-h-0 ap-scroll">
          {collapsed ? (
            <div className="flex flex-col items-center gap-1 px-1">
              {navSections.flatMap((s) => s.items).map((item) => {
                const Icon = item.icon || LayoutDashboard;
                const active = isActive(item.to || '');
                return (
                  <Link
                    key={item.to || item.label}
                    to={item.to || '#'}
                    onClick={() => onCloseMobile?.()}
                    className={`w-10 h-10 flex items-center justify-center rounded-lg transition-all ${
                      active ? 'bg-navy text-white shadow-sm' : 'text-gray-500 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-800'
                    }`}
                    title={item.label}
                  >
                    <Icon className="w-5 h-5" />
                  </Link>
                );
              })}
            </div>
          ) : (
            <div>
              {filteredSections.length === 0 ? (
                <p className="text-xs text-gray-400 text-center py-8">No results match</p>
              ) : (
                filteredSections.map(renderSection)
              )}
            </div>
          )}
        </nav>

        {/* Footer */}
        <div className="border-t border-gray-200 dark:border-gray-800 p-3 space-y-1 shrink-0">
          <button
            onClick={() => setDark(!dark)}
            className="flex items-center gap-3 w-full px-3 py-2 rounded-lg text-sm font-medium text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
          >
            {dark ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />}
            {!collapsed && <span>{dark ? 'Light mode' : 'Dark mode'}</span>}
          </button>
          {!collapsed && onToggleCollapse && (
            <button
              onClick={onToggleCollapse}
              className="hidden lg:flex items-center gap-3 w-full px-3 py-2 rounded-lg text-sm font-medium text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
            >
              <ChevronLeft className="w-4 h-4" />
              <span>Collapse sidebar</span>
            </button>
          )}
          <button
            onClick={handleSignOut}
            className="flex items-center gap-3 w-full px-3 py-2 rounded-lg text-sm font-medium text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors"
          >
            <LogOut className="w-4 h-4" />
            {!collapsed && <span>Sign out</span>}
          </button>
        </div>
      </motion.aside>
    </>
  );
}
