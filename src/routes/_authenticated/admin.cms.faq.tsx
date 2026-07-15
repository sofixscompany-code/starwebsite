import { createFileRoute } from "@tanstack/react-router";
import { ModulePage } from "@/components/admin/ModulePage";
import { HelpCircle, Layers, Eye, ThumbsUp } from "lucide-react";

export const Route = createFileRoute("/_authenticated/admin/cms/faq")({
  component: () => (
    <ModulePage
      title="FAQ"
      subtitle="Frequently asked questions."
      addLabel="Add"
      stats={[
    { label: "Total", value: 48, icon: HelpCircle },
    { label: "Categories", value: 6, icon: Layers },
    { label: "Views", value: "12K", icon: Eye },
    { label: "Helpful %", value: "86%", icon: ThumbsUp, tone: "success" }
      ]}
      columns={[
    { key: "q", label: "Question" },
    { key: "cat", label: "Category" },
    { key: "views", label: "Views" },
    { key: "helpful", label: "Helpful" },
    { key: "updated", label: "Updated" },
    { key: "status", label: "Status" }
      ]}
      rows={[
    {"id":"1","q":"How do I apply for admission?","cat":"Admission","views":"4,120","helpful":"92%","updated":"2024-09-01","status":"Active"},
    {"id":"2","q":"Do you offer scholarships?","cat":"Fees","views":"2,412","helpful":"88%","updated":"2024-09-05","status":"Active"},
    {"id":"3","q":"Are classes recorded?","cat":"LMS","views":"1,812","helpful":"84%","updated":"2024-09-10","status":"Active"}
      ]}
    />
  ),
});
