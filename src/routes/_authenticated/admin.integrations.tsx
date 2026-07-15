import { createFileRoute } from "@tanstack/react-router";
import { ModulePage } from "@/components/admin/ModulePage";
import { PlugZap, CheckCircle2, AlertCircle, TrendingUp } from "lucide-react";

export const Route = createFileRoute("/_authenticated/admin/integrations")({
  component: () => (
    <ModulePage
      title="Integrations"
      subtitle="Third-party services & webhooks."
      addLabel="Add"
      stats={[
    { label: "Connected", value: 12, icon: PlugZap },
    { label: "Healthy", value: 11, icon: CheckCircle2, tone: "success" },
    { label: "Issues", value: 1, icon: AlertCircle, tone: "warning" },
    { label: "Events 24h", value: "4,812", icon: TrendingUp }
      ]}
      columns={[
    { key: "name", label: "Service" },
    { key: "type", label: "Type" },
    { key: "account", label: "Account" },
    { key: "events", label: "Events 24h" },
    { key: "last", label: "Last event" },
    { key: "status", label: "Status" }
      ]}
      rows={[
    {"id":"1","name":"Twilio SMS","type":"Messaging","account":"+977-98…","events":"1,412","last":"5m ago","status":"Active"},
    {"id":"2","name":"Zoom","type":"Video","account":"star@…","events":"82","last":"10m ago","status":"Active"},
    {"id":"3","name":"eSewa","type":"Payment","account":"merch_star","events":"342","last":"2m ago","status":"Active"},
    {"id":"4","name":"Khalti","type":"Payment","account":"merch_star","events":"286","last":"4m ago","status":"Active"},
    {"id":"5","name":"Firebase","type":"Push","account":"star-app","events":"2,412","last":"1m ago","status":"Active"},
    {"id":"6","name":"Google Maps","type":"Maps","account":"key_G…","events":"124","last":"1h ago","status":"Active"}
      ]}
    />
  ),
});
