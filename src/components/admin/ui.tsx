import { motion } from "framer-motion";
import { useEffect, useState } from "react";
import { ArrowDownRight, ArrowUpRight } from "lucide-react";

export function StatCard({
  label, value, delta, icon: Icon, tone = "purple", prefix = "",
}: {
  label: string; value: number | string; delta?: number;
  icon: React.ComponentType<{ className?: string }>;
  tone?: "purple" | "orange" | "success" | "info" | "danger" | "warning";
  prefix?: string;
}) {
  const toneClass = {
    purple: "from-[hsl(var(--ap-purple)/0.15)] to-[hsl(var(--ap-purple)/0.05)] text-[hsl(var(--ap-purple))]",
    orange: "from-[hsl(var(--ap-orange)/0.15)] to-[hsl(var(--ap-orange)/0.05)] text-[hsl(var(--ap-orange))]",
    success: "from-[hsl(var(--ap-success)/0.15)] to-[hsl(var(--ap-success)/0.05)] text-[hsl(var(--ap-success))]",
    info: "from-[hsl(var(--ap-info)/0.15)] to-[hsl(var(--ap-info)/0.05)] text-[hsl(var(--ap-info))]",
    danger: "from-[hsl(var(--ap-danger)/0.15)] to-[hsl(var(--ap-danger)/0.05)] text-[hsl(var(--ap-danger))]",
    warning: "from-[hsl(var(--ap-warning)/0.15)] to-[hsl(var(--ap-warning)/0.05)] text-[hsl(var(--ap-warning))]",
  }[tone];
  const display = typeof value === "number" ? useCountUp(value) : value;
  const up = (delta ?? 0) >= 0;
  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}
      whileHover={{ y: -3 }}
      className="ap-card p-5 relative overflow-hidden group"
    >
      <div className={`absolute inset-0 bg-gradient-to-br ${toneClass} opacity-40 group-hover:opacity-60 transition`} />
      <div className="relative">
        <div className="flex items-start justify-between">
          <p className="text-xs uppercase font-bold tracking-widest text-[hsl(var(--ap-muted))]">{label}</p>
          <div className="w-10 h-10 rounded-xl bg-[hsl(var(--ap-panel))] border border-[hsl(var(--ap-border))] flex items-center justify-center">
            <Icon className="w-4 h-4" />
          </div>
        </div>
        <p className="text-3xl font-black mt-3">
          {prefix}
          {display}
        </p>
        {delta !== undefined && (
          <div className={`mt-2 inline-flex items-center gap-1 text-xs font-semibold ${up ? "text-[hsl(var(--ap-success))]" : "text-[hsl(var(--ap-danger))]"}`}>
            {up ? <ArrowUpRight className="w-3 h-3" /> : <ArrowDownRight className="w-3 h-3" />}
            {Math.abs(delta)}% vs last month
          </div>
        )}
      </div>
    </motion.div>
  );
}

function useCountUp(target: number, dur = 900) {
  const [n, setN] = useState(0);
  useEffect(() => {
    const start = performance.now();
    let raf = 0;
    const tick = (t: number) => {
      const p = Math.min(1, (t - start) / dur);
      setN(Math.round(target * (1 - Math.pow(1 - p, 3))));
      if (p < 1) raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, [target, dur]);
  return n.toLocaleString();
}

export function Panel({
  title, subtitle, actions, children, className = "",
}: {
  title?: string; subtitle?: string; actions?: React.ReactNode;
  children: React.ReactNode; className?: string;
}) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}
      className={`ap-card p-5 ${className}`}
    >
      {(title || actions) && (
        <div className="flex items-start justify-between gap-3 mb-4">
          <div>
            {title && <h3 className="font-bold text-[hsl(var(--ap-ink))]">{title}</h3>}
            {subtitle && <p className="text-xs text-[hsl(var(--ap-muted))] mt-0.5">{subtitle}</p>}
          </div>
          {actions}
        </div>
      )}
      {children}
    </motion.div>
  );
}

export function Badge({
  children, tone = "purple",
}: { children: React.ReactNode; tone?: "purple" | "orange" | "success" | "info" | "danger" | "warning" | "muted" }) {
  const cls = {
    purple: "bg-[hsl(var(--ap-purple)/0.12)] text-[hsl(var(--ap-purple))]",
    orange: "bg-[hsl(var(--ap-orange)/0.12)] text-[hsl(var(--ap-orange))]",
    success: "bg-[hsl(var(--ap-success)/0.12)] text-[hsl(var(--ap-success))]",
    info: "bg-[hsl(var(--ap-info)/0.12)] text-[hsl(var(--ap-info))]",
    danger: "bg-[hsl(var(--ap-danger)/0.12)] text-[hsl(var(--ap-danger))]",
    warning: "bg-[hsl(var(--ap-warning)/0.15)] text-[hsl(var(--ap-warning))]",
    muted: "bg-[hsl(var(--ap-border)/0.6)] text-[hsl(var(--ap-muted))]",
  }[tone];
  return (
    <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider ${cls}`}>
      {children}
    </span>
  );
}

export function DataTable<T extends { id: string | number }>({
  rows, columns, actions,
}: {
  rows: T[];
  columns: { key: keyof T | string; label: string; render?: (r: T) => React.ReactNode; className?: string }[];
  actions?: (r: T) => React.ReactNode;
}) {
  return (
    <div className="ap-card overflow-hidden">
      <div className="overflow-x-auto ap-scroll">
        <table className="w-full text-sm">
          <thead className="bg-[hsl(var(--ap-border)/0.35)] sticky top-0 z-10">
            <tr className="text-left">
              {columns.map((c) => (
                <th key={String(c.key)} className={`px-4 py-3 text-[10px] uppercase font-bold tracking-widest text-[hsl(var(--ap-muted))] ${c.className || ""}`}>
                  {c.label}
                </th>
              ))}
              {actions && <th className="px-4 py-3 w-1" />}
            </tr>
          </thead>
          <tbody>
            {rows.map((r) => (
              <tr key={r.id} className="border-t border-[hsl(var(--ap-border))] hover:bg-[hsl(var(--ap-purple)/0.04)] transition">
                {columns.map((c) => (
                  <td key={String(c.key)} className={`px-4 py-3 ${c.className || ""}`}>
                    {c.render ? c.render(r) : String((r as Record<string, unknown>)[c.key as string] ?? "—")}
                  </td>
                ))}
                {actions && <td className="px-4 py-3 text-right">{actions(r)}</td>}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <div className="flex items-center justify-between px-4 py-3 border-t border-[hsl(var(--ap-border))] text-xs text-[hsl(var(--ap-muted))]">
        <span>Showing {rows.length} of {rows.length}</span>
        <div className="flex gap-1">
          <button className="ap-btn-ghost !py-1 !px-2">Prev</button>
          <button className="ap-btn-ghost !py-1 !px-2">1</button>
          <button className="ap-btn-ghost !py-1 !px-2">2</button>
          <button className="ap-btn-ghost !py-1 !px-2">3</button>
          <button className="ap-btn-ghost !py-1 !px-2">Next</button>
        </div>
      </div>
    </div>
  );
}

export function Toolbar({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex flex-wrap items-center gap-2 mb-4">{children}</div>
  );
}

export function EmptyState({ title, hint, icon: Icon }: { title: string; hint?: string; icon: React.ComponentType<{ className?: string }> }) {
  return (
    <div className="ap-card p-12 text-center">
      <div className="w-14 h-14 rounded-2xl ap-grad mx-auto flex items-center justify-center text-white mb-3">
        <Icon className="w-6 h-6" />
      </div>
      <p className="font-bold">{title}</p>
      {hint && <p className="text-sm text-[hsl(var(--ap-muted))] mt-1">{hint}</p>}
    </div>
  );
}
