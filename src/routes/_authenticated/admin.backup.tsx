import { createFileRoute } from "@tanstack/react-router";
import { ModulePage } from "@/components/admin/ModulePage";
import { Database, Layers, Clock, ShieldCheck } from "lucide-react";

export const Route = createFileRoute("/_authenticated/admin/backup")({
  component: () => (
    <ModulePage
      title="Backup"
      subtitle="Automated snapshots & restore."
      addLabel="Add"
      stats={[
    { label: "Latest", value: "2h ago", icon: Database, tone: "success" },
    { label: "Storage", value: "4.8 GB", icon: Layers },
    { label: "Retained", value: "30 days", icon: Clock },
    { label: "Encrypted", value: "AES-256", icon: ShieldCheck, tone: "success" }
      ]}
      columns={[
    { key: "name", label: "Snapshot" },
    { key: "when", label: "When" },
    { key: "size", label: "Size" },
    { key: "type", label: "Type" },
    { key: "by", label: "By" },
    { key: "status", label: "Status" }
      ]}
      rows={[
    {"id":"1","name":"auto-snap-1041","when":"2h ago","size":"482 MB","type":"Auto","by":"System","status":"Completed"},
    {"id":"2","name":"manual-migration","when":"1d ago","size":"512 MB","type":"Manual","by":"Admin","status":"Completed"},
    {"id":"3","name":"auto-snap-1040","when":"1d ago","size":"478 MB","type":"Auto","by":"System","status":"Completed"}
      ]}
    />
  ),
});
