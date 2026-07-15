import { createFileRoute } from "@tanstack/react-router";
import { ModulePage } from "@/components/admin/ModulePage";
import { Baby, CheckCircle2, Calendar, AlertCircle } from "lucide-react";

export const Route = createFileRoute("/_authenticated/admin/parents")({
  component: () => (
    <ModulePage
      title="Parents"
      subtitle="942 mapped parents · 1,284 children"
      addLabel="Add"
      stats={[
    { label: "Total", value: 942, icon: Baby },
    { label: "Active on portal", value: 786, icon: CheckCircle2 },
    { label: "Meetings today", value: 14, icon: Calendar },
    { label: "Complaints", value: 3, icon: AlertCircle }
      ]}
      columns={[
    { key: "name", label: "Parent" },
    { key: "child", label: "Child" },
    { key: "phone", label: "Phone" },
    { key: "last", label: "Last contact" },
    { key: "mtg", label: "Next meeting" },
    { key: "status", label: "Status" }
      ]}
      rows={[
    {"id":"1","name":"Suresh Sharma","child":"Aarav Sharma","phone":"9812345678","last":"2d ago","mtg":"Fri 10 AM","status":"Active"},
    {"id":"2","name":"Bina Karki","child":"Priya Karki","phone":"9803344556","last":"1w ago","mtg":"—","status":"Active"},
    {"id":"3","name":"Dhan B. Thapa","child":"Rohan Thapa","phone":"9861122334","last":"today","mtg":"Mon 3 PM","status":"Active"},
    {"id":"4","name":"Radha Rana","child":"Sita Rana","phone":"9840001111","last":"3d ago","mtg":"—","status":"Active"},
    {"id":"5","name":"Mohan Gurung","child":"Bikash Gurung","phone":"9855667788","last":"5d ago","mtg":"Thu 11 AM","status":"Active"}
      ]}
    />
  ),
});
