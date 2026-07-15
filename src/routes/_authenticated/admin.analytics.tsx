import { createFileRoute } from "@tanstack/react-router";
import { ModulePage } from "@/components/admin/ModulePage";
import { Eye, Users, TrendingDown, TrendingUp } from "lucide-react";

export const Route = createFileRoute("/_authenticated/admin/analytics")({
  component: () => (
    <ModulePage
      title="Analytics"
      subtitle="Interactive dashboards & AI insights."
      addLabel="Add"
      stats={[
    { label: "Sessions", value: "48K", icon: Eye },
    { label: "Users", value: "28K", icon: Users },
    { label: "Bounce", value: "32%", icon: TrendingDown, tone: "warning" },
    { label: "Retention", value: "72%", icon: TrendingUp, tone: "success" }
      ]}
      columns={[
    { key: "metric", label: "Metric" },
    { key: "value", label: "Value" },
    { key: "change", label: "Change" },
    { key: "period", label: "Period" },
    { key: "insight", label: "AI Insight" },
    { key: "status", label: "Status" }
      ]}
      rows={[
    {"id":"1","metric":"Admission conversion","value":"28%","change":"+6%","period":"Sept","insight":"Fb ads → +18%","status":"Active"},
    {"id":"2","metric":"Fee collection speed","value":"12 days","change":"-2d","period":"Sept","insight":"eSewa fastest","status":"Active"},
    {"id":"3","metric":"Class attendance","value":"92%","change":"+3%","period":"Sept","insight":"B-12 lowest","status":"Active"}
      ]}
    />
  ),
});
