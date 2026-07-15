import { createFileRoute } from "@tanstack/react-router";
import { ModulePage } from "@/components/admin/ModulePage";
import { Bell, CheckCircle2, MousePointer, Smartphone } from "lucide-react";

export const Route = createFileRoute("/_authenticated/admin/marketing/push")({
  component: () => (
    <ModulePage
      title="Push Notifications"
      subtitle="Web & mobile push via Firebase."
      addLabel="Add"
      stats={[
    { label: "Sent", value: "12,412", icon: Bell },
    { label: "Delivered", value: "94%", icon: CheckCircle2, tone: "success" },
    { label: "CTR", value: "18%", icon: MousePointer, tone: "info" },
    { label: "Active devices", value: "8,241", icon: Smartphone }
      ]}
      columns={[
    { key: "title", label: "Title" },
    { key: "audience", label: "Audience" },
    { key: "sent", label: "Sent" },
    { key: "opens", label: "Opens" },
    { key: "ctr", label: "CTR" },
    { key: "status", label: "Status" }
      ]}
      rows={[
    {"id":"1","title":"New notice: Scholarship","audience":"Students","sent":"1,284","opens":"382","ctr":"30%","status":"Completed"},
    {"id":"2","title":"Class reminder","audience":"Batch B-12","sent":"45","opens":"41","ctr":"91%","status":"Completed"}
      ]}
    />
  ),
});
