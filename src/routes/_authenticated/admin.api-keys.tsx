import { createFileRoute } from "@tanstack/react-router";
import { ModulePage } from "@/components/admin/ModulePage";
import { KeyRound, CheckCircle2, XCircle, TrendingUp } from "lucide-react";

export const Route = createFileRoute("/_authenticated/admin/api-keys")({
  component: () => (
    <ModulePage
      title="API Keys"
      subtitle="Manage integration credentials."
      addLabel="Add"
      stats={[
    { label: "Keys", value: 8, icon: KeyRound },
    { label: "Active", value: 6, icon: CheckCircle2, tone: "success" },
    { label: "Revoked", value: 2, icon: XCircle, tone: "danger" },
    { label: "Requests 24h", value: "4,120", icon: TrendingUp }
      ]}
      columns={[
    { key: "name", label: "Name" },
    { key: "prefix", label: "Prefix" },
    { key: "scopes", label: "Scopes" },
    { key: "created", label: "Created" },
    { key: "last", label: "Last used" },
    { key: "status", label: "Status" }
      ]}
      rows={[
    {"id":"1","name":"Zapier webhook","prefix":"sk_live_abc…","scopes":"read","created":"2024-06-01","last":"1h ago","status":"Active"},
    {"id":"2","name":"Mobile app","prefix":"sk_live_def…","scopes":"read,write","created":"2024-07-15","last":"5m ago","status":"Active"},
    {"id":"3","name":"Old export","prefix":"sk_live_xyz…","scopes":"read","created":"2023-11-01","last":"never","status":"Inactive"}
      ]}
    />
  ),
});
