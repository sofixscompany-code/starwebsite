import { motion, AnimatePresence } from 'framer-motion';
import React from 'react';

type Tone = 'blue' | 'green' | 'purple' | 'orange' | 'red' | 'yellow' | 'muted' | 'success' | 'warning' | 'danger' | 'info';

const toneMap: Record<Tone, { bg: string; text: string; ring: string; solid: string }> = {
  blue:    { bg: 'bg-blue-500/10',    text: 'text-blue-600',    ring: 'ring-blue-500/20',    solid: 'bg-blue-500' },
  green:   { bg: 'bg-green-500/10',   text: 'text-green-600',   ring: 'ring-green-500/20',   solid: 'bg-green-500' },
  purple:  { bg: 'bg-purple-500/10',  text: 'text-purple-600',  ring: 'ring-purple-500/20',  solid: 'bg-purple-500' },
  orange:  { bg: 'bg-orange-500/10',  text: 'text-orange-600',  ring: 'ring-orange-500/20',  solid: 'bg-orange-500' },
  red:     { bg: 'bg-red-500/10',     text: 'text-red-600',     ring: 'ring-red-500/20',     solid: 'bg-red-500' },
  yellow:  { bg: 'bg-yellow-500/10',  text: 'text-yellow-600',  ring: 'ring-yellow-500/20',  solid: 'bg-yellow-500' },
  muted:   { bg: 'bg-gray-500/10',    text: 'text-gray-600',    ring: 'ring-gray-500/20',    solid: 'bg-gray-500' },
  success: { bg: 'bg-green-500/10',   text: 'text-green-600',   ring: 'ring-green-500/20',   solid: 'bg-green-500' },
  warning: { bg: 'bg-amber-500/10',   text: 'text-amber-600',   ring: 'ring-amber-500/20',   solid: 'bg-amber-500' },
  danger:  { bg: 'bg-red-500/10',     text: 'text-red-600',     ring: 'ring-red-500/20',     solid: 'bg-red-500' },
  info:    { bg: 'bg-blue-500/10',    text: 'text-blue-600',    ring: 'ring-blue-500/20',    solid: 'bg-blue-500' },
};

/* -------------------- STAT CARD -------------------- */
export function StatCard({
  label,
  value,
  icon: Icon,
  tone = 'blue',
  prefix = '',
  suffix = '',
  trend,
  delta,
}: {
  label: string;
  value: string | number;
  icon: React.ComponentType<{ className?: string }>;
  tone?: Tone;
  prefix?: string;
  suffix?: string;
  trend?: { value: number; positive: boolean };
  delta?: number;
}) {
  const t = toneMap[tone];
  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      className="bg-white dark:bg-gray-800 rounded-2xl border border-gray-200 dark:border-gray-700 p-5 shadow-sm hover:shadow-md transition-all duration-200 group"
    >
      <div className="flex items-start justify-between">
        <div className="min-w-0">
          <p className="text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">{label}</p>
          <p className="text-2xl font-bold text-gray-900 dark:text-white mt-1.5 tabular-nums">
            {prefix}{typeof value === 'number' ? value.toLocaleString() : value}{suffix}
          </p>
          {trend && (
            <div className="flex items-center gap-1.5 mt-2">
              <span className={`inline-flex items-center text-xs font-semibold px-1.5 py-0.5 rounded-full ${trend.positive ? 'bg-green-500/10 text-green-600' : 'bg-red-500/10 text-red-600'}`}>
                {trend.positive ? '↑' : '↓'} {Math.abs(trend.value)}%
              </span>
              <span className="text-[11px] text-gray-400 dark:text-gray-500">vs last month</span>
            </div>
          )}
          {delta !== undefined && delta !== 0 && (
            <p className={`text-xs font-medium mt-2 ${delta > 0 ? 'text-green-600' : 'text-red-600'}`}>
              {delta > 0 ? '+' : ''}{delta} from yesterday
            </p>
          )}
        </div>
        <div className={`w-12 h-12 rounded-xl flex items-center justify-center ${t.bg} ring-1 ${t.ring} group-hover:scale-105 transition-all duration-200`}>
          <Icon className={`w-5 h-5 ${t.text}`} />
        </div>
      </div>
    </motion.div>
  );
}

/* -------------------- PANEL -------------------- */
export function Panel({
  title,
  subtitle,
  children,
  actions,
  className = '',
}: {
  title: string;
  subtitle?: string;
  children: React.ReactNode;
  actions?: React.ReactNode;
  className?: string;
}) {
  return (
    <div className={`bg-white dark:bg-gray-800 rounded-2xl border border-gray-200 dark:border-gray-700 shadow-sm ${className}`}>
      <div className="flex items-center justify-between px-5 py-3.5 border-b border-gray-200 dark:border-gray-700">
        <div>
          <h3 className="text-sm font-semibold text-gray-900 dark:text-white uppercase tracking-wide">{title}</h3>
          {subtitle && <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">{subtitle}</p>}
        </div>
        {actions && <div className="flex items-center gap-2">{actions}</div>}
      </div>
      <div className="p-5">{children}</div>
    </div>
  );
}

/* -------------------- BADGE -------------------- */
export function Badge({
  children,
  tone = 'muted',
  className = '',
}: {
  children: React.ReactNode;
  tone?: Tone;
  className?: string;
}) {
  const t = toneMap[tone];
  return (
    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold ${t.bg} ${t.text} ${className}`}>
      {children}
    </span>
  );
}

/* -------------------- TABS -------------------- */
export function Tabs({
  tabs,
  activeTab,
  value,
  onChange,
}: {
  tabs: { label: string; value: string; badge?: string | number }[];
  activeTab?: string;
  value?: string;
  onChange: (value: string) => void;
}) {
  const current = value || activeTab || '';
  return (
    <div className="flex gap-1 p-1 bg-gray-100 dark:bg-gray-700/50 rounded-xl">
      {tabs.map((tab) => (
        <button
          key={tab.value}
          onClick={() => onChange(tab.value)}
          className={`relative px-4 py-2 rounded-lg text-sm font-medium transition-all duration-200 ${
            current === tab.value
              ? 'bg-white dark:bg-gray-800 text-gray-900 dark:text-white shadow-sm'
              : 'text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300'
          }`}
        >
          {tab.label}
          {tab.badge !== undefined && (
            <span className="ml-1.5 inline-flex items-center justify-center min-w-[18px] h-[18px] px-1 rounded-full text-[10px] font-bold bg-gray-200 dark:bg-gray-600 text-gray-600 dark:text-gray-300">
              {tab.badge}
            </span>
          )}
        </button>
      ))}
    </div>
  );
}

/* -------------------- MODAL -------------------- */
export function Modal({
  open,
  onClose,
  children,
  size = 'md',
  title,
}: {
  open: boolean;
  onClose: () => void;
  children: React.ReactNode;
  size?: 'sm' | 'md' | 'lg' | 'xl';
  title?: string;
}) {
  const sizes = { sm: 'max-w-sm', md: 'max-w-md', lg: 'max-w-lg', xl: 'max-w-xl' };

  return (
    <AnimatePresence>
      {open && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.15 }}
          className="fixed inset-0 z-50 flex items-center justify-center p-4"
        >
          <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" onClick={onClose} />
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 8 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 8 }}
            transition={{ duration: 0.2, ease: 'easeOut' }}
            onClick={(e) => e.stopPropagation()}
            className={`relative w-full ${sizes[size]} bg-white dark:bg-gray-800 rounded-2xl border border-gray-200 dark:border-gray-700 shadow-xl max-h-[90vh] overflow-y-auto`}
          >
            {title && (
              <div className="flex items-center justify-between px-6 py-4 border-b border-gray-200 dark:border-gray-700">
                <h2 className="text-base font-semibold text-gray-900 dark:text-white">{title}</h2>
                <button onClick={onClose} className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 transition-colors duration-200">
                  <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
                </button>
              </div>
            )}
            <div className="p-6">{children}</div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}

/* -------------------- PROGRESS BAR -------------------- */
export function ProgressBar({
  value,
  max = 100,
  tone = 'blue',
  label,
  showValue = false,
}: {
  value: number;
  max?: number;
  tone?: Tone;
  label?: string;
  showValue?: boolean;
}) {
  const pct = Math.min((value / max) * 100, 100);
  const t = toneMap[tone];
  return (
    <div className="w-full">
      {(label || showValue) && (
        <div className="flex items-center justify-between mb-1.5">
          {label && <span className="text-xs font-medium text-gray-600 dark:text-gray-400">{label}</span>}
          {showValue && <span className="text-xs font-semibold text-gray-500 dark:text-gray-400 tabular-nums">{Math.round(pct)}%</span>}
        </div>
      )}
      <div className="w-full h-2 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden">
        <motion.div
          initial={{ width: 0 }}
          animate={{ width: `${pct}%` }}
          transition={{ duration: 0.6, ease: 'easeOut' }}
          className={`h-full ${t.solid} rounded-full`}
        />
      </div>
    </div>
  );
}

/* -------------------- TIMELINE -------------------- */
export function Timeline({
  items,
}: {
  items: { title: string; desc: string; time?: string; date?: string; tone?: Tone }[];
}) {
  return (
    <div className="relative space-y-0">
      {items.map((item, i) => {
        const t = toneMap[item.tone || 'blue'];
        return (
          <div key={i} className="relative flex gap-4 pb-6 last:pb-0">
            <div className="flex flex-col items-center">
              <div className={`w-3 h-3 rounded-full ${t.solid} ring-4 ring-white dark:ring-gray-800 z-10`} />
              {i < items.length - 1 && (
                <div className="w-px flex-1 bg-gray-200 dark:bg-gray-700 mt-1" />
              )}
            </div>
            <div className="flex-1 min-w-0 pt-0.5">
              <p className="text-sm font-semibold text-gray-900 dark:text-white">{item.title}</p>
              <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">{item.desc}</p>
              {(item.time || item.date) && (
                <p className="text-[11px] text-gray-400 dark:text-gray-500 mt-1.5 font-medium">{item.time || item.date}</p>
              )}
            </div>
          </div>
        );
      })}
    </div>
  );
}

/* -------------------- SKELETON -------------------- */
export function Skeleton({ className = '' }: { className?: string }) {
  return <div className={`animate-pulse bg-gray-200 dark:bg-gray-700 rounded-xl ${className}`} />;
}

export function SkeletonCard() {
  return (
    <div className="bg-white dark:bg-gray-800 rounded-2xl border border-gray-200 dark:border-gray-700 p-5 space-y-3 shadow-sm">
      <div className="flex items-center justify-between">
        <Skeleton className="h-4 w-28" />
        <Skeleton className="h-11 w-11 rounded-xl" />
      </div>
      <Skeleton className="h-8 w-20" />
      <Skeleton className="h-3 w-36" />
    </div>
  );
}

export function SkeletonTable({ rows = 5 }: { rows?: number }) {
  return (
    <div className="bg-white dark:bg-gray-800 rounded-2xl border border-gray-200 dark:border-gray-700 overflow-hidden shadow-sm">
      <div className="px-5 py-3 border-b border-gray-200 dark:border-gray-700 flex gap-4">
        <Skeleton className="h-3 w-16" />
        <Skeleton className="h-3 flex-1" />
        <Skeleton className="h-3 w-20" />
        <Skeleton className="h-3 w-16" />
      </div>
      {Array.from({ length: rows }).map((_, i) => (
        <div key={i} className={`flex items-center gap-4 px-5 py-3 ${i < rows - 1 ? 'border-b border-gray-100 dark:border-gray-700/50' : ''}`}>
          <Skeleton className="h-3.5 w-8" />
          <Skeleton className="h-3.5 flex-1" />
          <Skeleton className="h-3.5 w-24" />
          <Skeleton className="h-3.5 w-16" />
        </div>
      ))}
    </div>
  );
}

/* -------------------- EMPTY STATE -------------------- */
export function EmptyState({
  icon: Icon,
  title,
  desc,
  action,
}: {
  icon: React.ComponentType<{ className?: string }>;
  title: string;
  desc: string;
  action?: { label: string; onClick: () => void };
}) {
  return (
    <div className="flex flex-col items-center justify-center py-16 text-center">
      <div className="w-16 h-16 rounded-2xl bg-gray-100 dark:bg-gray-700/50 flex items-center justify-center mb-4">
        <Icon className="w-7 h-7 text-gray-400 dark:text-gray-500" />
      </div>
      <h3 className="text-base font-semibold text-gray-900 dark:text-white">{title}</h3>
      <p className="text-sm text-gray-500 dark:text-gray-400 mt-1.5 max-w-sm leading-relaxed">{desc}</p>
      {action && (
        <button
          onClick={action.onClick}
          className="mt-5 px-5 py-2.5 rounded-xl bg-indigo-600 text-white text-sm font-semibold hover:bg-indigo-700 shadow-sm hover:shadow-md transition-all duration-200"
        >
          {action.label}
        </button>
      )}
    </div>
  );
}

/* -------------------- TOOLBAR -------------------- */
export function Toolbar({
  children,
  className = '',
}: {
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <div className={`flex flex-wrap items-center gap-2 ${className}`}>
      {children}
    </div>
  );
}

/* -------------------- STEPS -------------------- */
export function Steps({
  current,
  steps,
}: {
  current: number;
  steps: string[];
}) {
  return (
    <div className="flex items-center">
      {steps.map((step, i) => {
        const done = i < current;
        const active = i === current;
        return (
          <React.Fragment key={step}>
            <div className="flex items-center gap-2.5">
              <div
                className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold transition-all duration-200 ${
                  done
                    ? 'bg-indigo-600 text-white shadow-sm'
                    : active
                      ? 'bg-indigo-600/10 text-indigo-600 ring-2 ring-indigo-600/30'
                      : 'bg-gray-100 dark:bg-gray-700 text-gray-400 dark:text-gray-500'
                }`}
              >
                {done ? (
                  <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M5 13l4 4L19 7" /></svg>
                ) : (
                  i + 1
                )}
              </div>
              <span className={`text-sm font-medium whitespace-nowrap ${i <= current ? 'text-gray-900 dark:text-white' : 'text-gray-400 dark:text-gray-500'}`}>
                {step}
              </span>
            </div>
            {i < steps.length - 1 && (
              <div className={`flex-1 h-0.5 mx-3 rounded-full transition-all duration-300 ${i < current ? 'bg-indigo-600' : 'bg-gray-200 dark:bg-gray-700'}`} />
            )}
          </React.Fragment>
        );
      })}
    </div>
  );
}

/* -------------------- DRAWER -------------------- */
export function Drawer({
  open,
  onClose,
  children,
  width = 'max-w-md',
  title,
}: {
  open: boolean;
  onClose: () => void;
  children: React.ReactNode;
  width?: string;
  title?: string;
}) {
  return (
    <AnimatePresence>
      {open && (
        <div className="fixed inset-0 z-50 flex justify-end">
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.15 }}
            className="absolute inset-0 bg-black/50 backdrop-blur-sm"
            onClick={onClose}
          />
          <motion.div
            initial={{ x: '100%' }}
            animate={{ x: 0 }}
            exit={{ x: '100%' }}
            transition={{ duration: 0.25, ease: 'easeOut' }}
            onClick={(e) => e.stopPropagation()}
            className={`relative w-full ${width} bg-white dark:bg-gray-800 h-full shadow-2xl overflow-y-auto`}
          >
            {title && (
              <div className="flex items-center justify-between px-6 py-4 border-b border-gray-200 dark:border-gray-700 sticky top-0 bg-white dark:bg-gray-800 z-10">
                <h2 className="text-base font-semibold text-gray-900 dark:text-white">{title}</h2>
                <button onClick={onClose} className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 transition-colors duration-200">
                  <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
                </button>
              </div>
            )}
            <div className="p-6">{children}</div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}

/* -------------------- DATA TABLE -------------------- */
export function DataTable({
  rows,
  columns,
  actions,
}: {
  rows: Record<string, unknown>[];
  columns: {
    key: string;
    label: string;
    render?: (row: Record<string, unknown>) => React.ReactNode;
    className?: string;
  }[];
  actions?: (row: Record<string, unknown>) => React.ReactNode;
}) {
  return (
    <div className="bg-white dark:bg-gray-800 rounded-2xl border border-gray-200 dark:border-gray-700 shadow-sm overflow-hidden">
      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-750">
              {columns.map((col) => (
                <th
                  key={col.key}
                  className={`text-left px-5 py-3 text-[11px] font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider ${col.className || ''}`}
                >
                  {col.label}
                </th>
              ))}
              {actions && <th className="px-5 py-3" />}
            </tr>
          </thead>
          <tbody>
            {rows.map((row, i) => (
              <tr
                key={i}
                className={`transition-colors duration-150 hover:bg-gray-50 dark:hover:bg-gray-700/50 ${
                  i % 2 === 1 ? 'bg-gray-50/50 dark:bg-gray-700/20' : ''
                } ${i < rows.length - 1 ? 'border-b border-gray-100 dark:border-gray-700/50' : ''}`}
              >
                {columns.map((col) => (
                  <td key={col.key} className={`px-5 py-3 text-gray-700 dark:text-gray-300 ${col.className || ''}`}>
                    {col.render ? col.render(row) : (row[col.key] as React.ReactNode) ?? '—'}
                  </td>
                ))}
                {actions && <td className="px-5 py-3">{actions(row)}</td>}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      {rows.length === 0 && (
        <div className="px-5 py-10 text-center text-sm text-gray-400 dark:text-gray-500">No data available</div>
      )}
    </div>
  );
}
