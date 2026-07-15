import { motion } from "framer-motion";
import { PageHeader } from "@/components/admin/AdminShell";
import { StatCard, Panel, Badge, DataTable, Toolbar } from "@/components/admin/ui";
import { Search, Filter, Download, Plus, MoreVertical } from "lucide-react";
import type { LucideIcon } from "lucide-react";

export type ModuleConfig = {
  title: string;
  subtitle?: string;
  stats: { label: string; value: number | string; delta?: number; icon: LucideIcon; tone?: "purple" | "orange" | "success" | "info" | "danger" | "warning" }[];
  columns: { key: string; label: string }[];
  rows: Record<string, string | number>[];
  addLabel?: string;
  extra?: React.ReactNode;
};

export function ModulePage({ title, subtitle, stats, columns, rows, addLabel = "Add", extra }: ModuleConfig) {
  return (
    <div>
      <PageHeader
        title={title}
        subtitle={subtitle}
        actions={
          <>
            <button className="ap-btn-ghost"><Download className="w-4 h-4" /> Export</button>
            <button className="ap-btn"><Plus className="w-4 h-4" /> {addLabel}</button>
          </>
        }
      />
      <div className={`grid grid-cols-2 md:grid-cols-${Math.min(stats.length, 4)} gap-4 mb-6`}>
        {stats.map((s, i) => (
          <StatCard key={i} label={s.label} value={s.value} delta={s.delta} icon={s.icon} tone={s.tone ?? "purple"} />
        ))}
      </div>

      <Toolbar>
        <div className="relative flex-1 max-w-xs">
          <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-[hsl(var(--ap-muted))]" />
          <input placeholder="Search…" className="ap-input pl-9" />
        </div>
        <button className="ap-btn-ghost"><Filter className="w-4 h-4" /> Filters</button>
        <select className="ap-input max-w-[160px]"><option>All</option></select>
      </Toolbar>

      {extra && <div className="mb-4">{extra}</div>}

      <DataTable
        rows={rows.map((r, i) => ({ id: r.id ?? i, ...r }))}
        columns={columns.map((c) => ({
          key: c.key, label: c.label,
          render: (r: Record<string, unknown>) => {
            const v = r[c.key];
            if (typeof v === "string" && (v === "Active" || v === "Paid" || v === "Approved" || v === "Success" || v === "Completed"))
              return <Badge tone="success">{v}</Badge>;
            if (typeof v === "string" && (v === "Pending" || v === "Partial" || v === "Scheduled"))
              return <Badge tone="warning">{v}</Badge>;
            if (typeof v === "string" && (v === "Failed" || v === "Rejected" || v === "Inactive" || v === "Overdue"))
              return <Badge tone="danger">{v}</Badge>;
            return <span>{String(v ?? "—")}</span>;
          },
        }))}
        actions={() => (
          <button className="p-1.5 rounded-lg hover:bg-[hsl(var(--ap-border)/0.5)]"><MoreVertical className="w-4 h-4" /></button>
        )}
      />
    </div>
  );
}

export function SectionGrid({ items }: { items: { title: string; hint: string; icon: LucideIcon; tone?: string }[] }) {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
      {items.map((it, i) => {
        const Icon = it.icon;
        return (
          <motion.div
            key={i}
            whileHover={{ y: -3 }}
            className="ap-card p-4 flex items-start gap-3 hover:shadow-lg transition"
          >
            <div className="w-11 h-11 rounded-xl ap-grad flex items-center justify-center text-white">
              <Icon className="w-5 h-5" />
            </div>
            <div>
              <p className="font-bold">{it.title}</p>
              <p className="text-xs text-[hsl(var(--ap-muted))] mt-0.5">{it.hint}</p>
            </div>
          </motion.div>
        );
      })}
    </div>
  );
}

export { Panel, Badge };
