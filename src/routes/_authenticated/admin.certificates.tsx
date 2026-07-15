import { createFileRoute } from "@tanstack/react-router";
import { ModulePage } from "@/components/admin/ModulePage";
import { Award, CheckCircle2, ShieldCheck, Download } from "lucide-react";

export const Route = createFileRoute("/_authenticated/admin/certificates")({
  component: () => (
    <ModulePage
      title="Certificates"
      subtitle="Design templates, generate & verify."
      addLabel="Add"
      stats={[
    { label: "Templates", value: 12, icon: Award },
    { label: "Issued MTD", value: 186, icon: CheckCircle2 },
    { label: "Verified", value: "1,412", icon: ShieldCheck },
    { label: "Downloads", value: "8,241", icon: Download }
      ]}
      columns={[
    { key: "name", label: "Recipient" },
    { key: "course", label: "Course" },
    { key: "type", label: "Type" },
    { key: "issued", label: "Issued" },
    { key: "ref", label: "Verification ID" },
    { key: "status", label: "Status" }
      ]}
      rows={[
    {"id":"1","name":"Aarav Sharma","course":"Nepal Police","type":"Completion","issued":"2024-09-30","ref":"VC-8241-A","status":"Active"},
    {"id":"2","name":"Priya Karki","course":"Loksewa","type":"Merit","issued":"2024-09-28","ref":"VC-8242-B","status":"Active"},
    {"id":"3","name":"Bikash Gurung","course":"Nepal Army","type":"Participation","issued":"2024-09-25","ref":"VC-8243-C","status":"Active"}
      ]}
    />
  ),
});
