import { FirestoreModulePage } from "@/components/admin/FirestoreModulePage";
import { useModuleData } from "@/hooks/use-module-data";
import { PlugZap, CheckCircle2, AlertCircle } from "lucide-react";

export function IntegrationsPage() {
  const { rows } = useModuleData("integrations");

  const total = rows.length;
  const connected = rows.filter((r) => {
    const s = String(r.status ?? "");
    return s === "Connected" || s === "Active";
  }).length;
  const needsAttention = rows.filter((r) => String(r.status ?? "") === "Error").length;

  return (
    <FirestoreModulePage
      collectionName="integrations"
      title="Integrations"
      subtitle="Manage third-party service connections and API integrations"
      stats={[
        { label: "Total Integrations", value: total, icon: PlugZap, tone: "purple" },
        { label: "Connected", value: connected, icon: CheckCircle2, tone: "success" },
        { label: "Needs Attention", value: needsAttention, icon: AlertCircle, tone: "warning" },
      ]}
      columns={[
        { key: "name", label: "Integration" },
        { key: "type", label: "Type" },
        { key: "status", label: "Status" },
        { key: "lastSync", label: "Last Sync" },
      ]}
      rows={[
        {
          name: "Firebase Auth",
          type: "Authentication",
          status: "Connected",
          lastSync: "Real-time",
        },
        { name: "Razorpay", type: "Payments", status: "Connected", lastSync: "2024-01-15" },
        { name: "Twilio SMS", type: "Messaging", status: "Connected", lastSync: "2024-01-15" },
        { name: "Google Calendar", type: "Calendar", status: "Error", lastSync: "2024-01-10" },
      ]}
    />
  );
}
