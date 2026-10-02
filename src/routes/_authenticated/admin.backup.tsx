import { useState } from "react";
import { ModulePage } from "@/components/admin/ModulePage";
import { useModuleData } from "@/hooks/use-module-data";
import { collection, getDocs } from "firebase/firestore";
import { db } from "@/integrations/firebase/config";
import { toast } from "sonner";
import { Database, Clock, Plus, Loader2 } from "lucide-react";

const COUNTED_COLLECTIONS = ["students", "payments", "notices", "users", "courses"];

export function BackupPage() {
  const { rows, create, remove, bulkDelete } = useModuleData("backups");
  const [generating, setGenerating] = useState(false);

  const total = rows.length;

  let lastTimestamp = 0;
  rows.forEach((r) => {
    const t = new Date(String(r.date ?? r.createdAt ?? "")).getTime();
    if (Number.isFinite(t) && t > lastTimestamp) lastTimestamp = t;
  });
  const lastBackup = lastTimestamp ? new Date(lastTimestamp).toLocaleString() : "—";

  /** Counts the key collections and records an honest backup entry in Firestore. */
  const handleGenerate = async () => {
    setGenerating(true);
    try {
      const snapshots = await Promise.all(
        COUNTED_COLLECTIONS.map((name) => getDocs(collection(db, name))),
      );
      const counts: Record<string, number> = {};
      COUNTED_COLLECTIONS.forEach((name, i) => {
        counts[name] = snapshots[i].size;
      });
      const now = new Date();
      // `create` writes to the "backups" collection and stamps createdAt.
      await create({
        name: `Manual Backup – ${now.toLocaleString()}`,
        type: "Manual",
        size: "—",
        date: now.toISOString(),
        counts,
      });
      toast.success("Backup recorded", {
        description: COUNTED_COLLECTIONS.map((name) => `${name}: ${counts[name]}`).join(", "),
      });
    } catch (err: any) {
      toast.error(err?.message || "Backup failed");
    } finally {
      setGenerating(false);
    }
  };

  return (
    <ModulePage
      title="Backup & Restore"
      subtitle="Manage database backups and restore points"
      stats={[
        { label: "Total Backups", value: total, icon: Database, tone: "purple" },
        { label: "Last Backup", value: lastBackup, icon: Clock, tone: "success" },
      ]}
      actions={
        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={handleGenerate}
            disabled={generating}
            className="ap-btn"
            title="Counts key collections and records a backup entry"
          >
            {generating ? (
              <Loader2 className="w-4 h-4 animate-spin" />
            ) : (
              <Plus className="w-4 h-4" />
            )}
            Generate Backup
          </button>
          <span className="hidden md:inline text-xs text-gray-400 dark:text-gray-500">
            Restore is performed from the Firebase console.
          </span>
        </div>
      }
      columns={[
        { key: "name", label: "Backup Name" },
        { key: "type", label: "Type" },
        { key: "size", label: "Size" },
        {
          key: "counts",
          label: "Records",
          sortable: false,
          render: (row: any) => {
            const counts = row.counts;
            if (!counts || typeof counts !== "object")
              return <span className="text-gray-400">—</span>;
            return (
              <span className="text-xs text-gray-600 dark:text-gray-300">
                {Object.entries(counts as Record<string, unknown>)
                  .map(([name, value]) => `${name}: ${String(value)}`)
                  .join(" · ")}
              </span>
            );
          },
        },
        {
          key: "date",
          label: "Created",
          render: (row: any) => {
            const d = new Date(String(row.date ?? row.createdAt ?? ""));
            if (isNaN(d.getTime())) return <span className="text-gray-400">—</span>;
            return <span>{d.toLocaleString()}</span>;
          },
        },
      ]}
      rows={rows}
      onDelete={remove}
      onBulkDelete={bulkDelete}
    />
  );
}
