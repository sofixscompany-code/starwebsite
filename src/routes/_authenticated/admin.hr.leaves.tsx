import { createFileRoute } from "@tanstack/react-router";
import { ModulePage } from "@/components/admin/ModulePage";
import { CalendarOff, CheckCircle2, Clock, XCircle } from "lucide-react";

export const Route = createFileRoute("/_authenticated/admin/hr/leaves")({
  component: () => (
    <ModulePage
      title="Leaves"
      subtitle="Requests · approvals · balance."
      addLabel="Add"
      stats={[
    { label: "Requests", value: 24, icon: CalendarOff },
    { label: "Approved", value: 18, icon: CheckCircle2, tone: "success" },
    { label: "Pending", value: 4, icon: Clock, tone: "warning" },
    { label: "Rejected", value: 2, icon: XCircle, tone: "danger" }
      ]}
      columns={[
    { key: "emp", label: "Employee" },
    { key: "type", label: "Type" },
    { key: "from", label: "From" },
    { key: "to", label: "To" },
    { key: "days", label: "Days" },
    { key: "status", label: "Status" }
      ]}
      rows={[
    {"id":"1","emp":"Anita Rai","type":"Sick","from":"2024-10-05","to":"2024-10-07","days":"3","status":"Approved"},
    {"id":"2","emp":"Suman Poudel","type":"Casual","from":"2024-10-10","to":"2024-10-10","days":"1","status":"Pending"},
    {"id":"3","emp":"Ram B. K.C.","type":"Annual","from":"2024-10-15","to":"2024-10-20","days":"5","status":"Approved"}
      ]}
    />
  ),
});
