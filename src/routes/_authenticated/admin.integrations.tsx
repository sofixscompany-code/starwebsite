import { ModulePage } from "@/components/admin/ModulePage";
import { PlugZap, CheckCircle2, AlertCircle, TrendingUp } from "lucide-react";

export function IntegrationsPage() {
  return (
    <ModulePage
      title="Integrations"
      subtitle="Manage third-party service connections and API integrations"
      stats={[
        { label: "Active Integrations", value: 9, icon: PlugZap, tone: "purple" },
        { label: "Connected", value: 7, icon: CheckCircle2, tone: "success" },
        { label: "Needs Attention", value: 1, icon: AlertCircle, tone: "warning" },
        { label: "API Calls Today", value: "2.1k", icon: TrendingUp, tone: "info" },
      ]}
      columns={[
        { key: "name", label: "Integration" },
        { key: "type", label: "Type" },
        { key: "status", label: "Status" },
        { key: "lastSync", label: "Last Sync" },
      ]}
      rows={[
        { name: "Firebase Auth", type: "Authentication", status: "Connected", lastSync: "Real-time" },
        { name: "Razorpay", type: "Payments", status: "Connected", lastSync: "2024-01-15" },
        { name: "Twilio SMS", type: "Messaging", status: "Connected", lastSync: "2024-01-15" },
        { name: "Google Calendar", type: "Calendar", status: "Error", lastSync: "2024-01-10" },
      ]}
    />
  );
}
