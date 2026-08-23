import { FirestoreModulePage } from "@/components/admin/FirestoreModulePage";
import { KeyRound, CheckCircle2, XCircle, TrendingUp } from "lucide-react";

export function ApiKeysPage() {
  return (
    <FirestoreModulePage
      collectionName="api_keys"
      title="API Keys"
      subtitle="Manage API keys for external integrations"
      stats={[
        { label: "Active Keys", value: 12, icon: KeyRound, tone: "purple" },
        { label: "Verified", value: 10, icon: CheckCircle2, tone: "success" },
        { label: "Revoked", value: 2, icon: XCircle, tone: "danger" },
        { label: "Requests Today", value: "4.2k", icon: TrendingUp, tone: "info" },
      ]}
      columns={[
        { key: "name", label: "Key Name" },
        { key: "service", label: "Service" },
        { key: "status", label: "Status" },
        { key: "lastUsed", label: "Last Used" },
      ]}
      rows={[
        { name: "Firebase Web Key", service: "Firebase", status: "Active", lastUsed: "2024-01-15" },
        { name: "SMS Gateway", service: "Twilio", status: "Active", lastUsed: "2024-01-14" },
        { name: "Payment Gateway", service: "Razorpay", status: "Active", lastUsed: "2024-01-13" },
        { name: "Legacy Auth Key", service: "Custom", status: "Revoked", lastUsed: "2023-12-01" },
      ]}
    />
  );
}
