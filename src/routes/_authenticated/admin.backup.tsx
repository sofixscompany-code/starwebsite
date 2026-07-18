import { ModulePage } from "@/components/admin/ModulePage";
import { Database, Layers, Clock, ShieldCheck } from "lucide-react";

export function BackupPage() {
  return (
    <ModulePage
      title="Backup & Restore"
      subtitle="Manage database backups and restore points"
      stats={[
        { label: "Total Backups", value: 34, icon: Database, tone: "purple" },
        { label: "Storage Used", value: "2.8 GB", icon: Layers, tone: "info" },
        { label: "Last Backup", value: "2h ago", icon: Clock, tone: "success" },
        { label: "Integrity", value: "100%", icon: ShieldCheck, tone: "success" },
      ]}
      columns={[
        { key: "name", label: "Backup Name" },
        { key: "type", label: "Type" },
        { key: "size", label: "Size" },
        { key: "date", label: "Created" },
      ]}
      rows={[
        { name: "Full Backup – Jan 15", type: "Full", size: "285 MB", date: "2024-01-15 06:00" },
        { name: "Incremental – Jan 14", type: "Incremental", size: "42 MB", date: "2024-01-14 06:00" },
        { name: "Full Backup – Jan 13", type: "Full", size: "278 MB", date: "2024-01-13 06:00" },
        { name: "Emergency Snapshot", type: "Manual", size: "120 MB", date: "2024-01-12 14:30" },
      ]}
    />
  );
}
