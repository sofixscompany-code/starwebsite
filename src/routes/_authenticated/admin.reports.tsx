import { createFileRoute } from "@tanstack/react-router";
import { ModulePage } from "@/components/admin/ModulePage";
import { BarChart3, Download, Clock, Database } from "lucide-react";

export const Route = createFileRoute("/_authenticated/admin/reports")({
  component: () => (
    <ModulePage
      title="Reports"
      subtitle="Downloadable reports (PDF · Excel)."
      addLabel="Add"
      stats={[
    { label: "Templates", value: 24, icon: BarChart3 },
    { label: "Generated", value: 482, icon: Download },
    { label: "Scheduled", value: 6, icon: Clock },
    { label: "Storage", value: "1.2 GB", icon: Database }
      ]}
      columns={[
    { key: "name", label: "Report" },
    { key: "type", label: "Type" },
    { key: "period", label: "Period" },
    { key: "author", label: "Requested by" },
    { key: "size", label: "Size" },
    { key: "status", label: "Status" }
      ]}
      rows={[
    {"id":"1","name":"Admissions summary","type":"Admission","period":"Sept 2024","author":"Admin","size":"842 KB","status":"Completed"},
    {"id":"2","name":"Revenue detailed","type":"Finance","period":"Q3 2024","author":"Anita R.","size":"1.2 MB","status":"Completed"},
    {"id":"3","name":"Attendance monthly","type":"Academic","period":"Sept 2024","author":"Ram B.","size":"480 KB","status":"Completed"},
    {"id":"4","name":"Teacher payroll","type":"HR","period":"Sept 2024","author":"Anita R.","size":"220 KB","status":"Completed"}
      ]}
    />
  ),
});
