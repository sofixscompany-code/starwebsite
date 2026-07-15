import { createFileRoute } from "@tanstack/react-router";
import { ModulePage } from "@/components/admin/ModulePage";
import { History, Users, ShieldCheck, CheckCircle2 } from "lucide-react";

export const Route = createFileRoute("/_authenticated/admin/audit")({
  component: () => (
    <ModulePage
      title="Audit Logs"
      subtitle="Every admin action, tracked."
      addLabel="Add"
      stats={[
    { label: "Events 24h", value: "1,412", icon: History },
    { label: "Users", value: 24, icon: Users },
    { label: "Sensitive", value: 18, icon: ShieldCheck, tone: "warning" },
    { label: "Anomalies", value: 0, icon: CheckCircle2, tone: "success" }
      ]}
      columns={[
    { key: "when", label: "When" },
    { key: "who", label: "Who" },
    { key: "action", label: "Action" },
    { key: "target", label: "Target" },
    { key: "ip", label: "IP" },
    { key: "status", label: "Status" }
      ]}
      rows={[
    {"id":"1","when":"2 min ago","who":"admin@star","action":"admission.approve","target":"APP-1041","ip":"103.5.12.4","status":"Success"},
    {"id":"2","when":"15 min ago","who":"suman@star","action":"fee.collect","target":"INV-1043","ip":"103.5.12.5","status":"Success"},
    {"id":"3","when":"1h ago","who":"anita@star","action":"payroll.run","target":"Oct-2024","ip":"103.5.12.6","status":"Success"}
      ]}
    />
  ),
});
