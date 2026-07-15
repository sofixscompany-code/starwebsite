import { createFileRoute } from "@tanstack/react-router";
import { ModulePage } from "@/components/admin/ModulePage";
import { Sparkles, BarChart3, TrendingUp, CheckCircle2 } from "lucide-react";

export const Route = createFileRoute("/_authenticated/admin/ai")({
  component: () => (
    <ModulePage
      title="AI Assistant"
      subtitle="Insights, predictions & automation."
      addLabel="Add"
      stats={[
    {label:"Queries 24h", value:"1,412", icon:Sparkles},
    {label:"Reports generated", value:82, icon:BarChart3, tone:"success"},
    {label:"Predictions", value:24, icon:TrendingUp, tone:"info"},
    {label:"Accuracy", value:"94%", icon:CheckCircle2, tone:"success"}
      ]}
      columns={[
    { key: "name", label: "Insight" },
    { key: "type", label: "Type" },
    { key: "subject", label: "Subject" },
    { key: "conf", label: "Confidence" },
    { key: "date", label: "Generated" },
    { key: "status", label: "Status" }
      ]}
      rows={[
    {"id":"1","name":"Batch B-12 dropping attendance","type":"Alert","subject":"Attendance","conf":"92%","date":"2h ago","status":"Active"},
    {"id":"2","name":"Loksewa demand spike +38%","type":"Trend","subject":"Admissions","conf":"88%","date":"4h ago","status":"Active"},
    {"id":"3","name":"Fee collection ETA Oct 15","type":"Forecast","subject":"Finance","conf":"91%","date":"1d ago","status":"Active"},
    {"id":"4","name":"Top 12 at-risk students","type":"Insight","subject":"Academic","conf":"89%","date":"1d ago","status":"Active"}
      ]}
    />
  ),
});
