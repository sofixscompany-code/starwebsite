import { createFileRoute } from "@tanstack/react-router";
import { ModulePage } from "@/components/admin/ModulePage";
import { Phone, Clock, CheckCircle2, AlertCircle } from "lucide-react";

export const Route = createFileRoute("/_authenticated/admin/crm/inquiries")({
  component: () => (
    <ModulePage
      title="Inquiries"
      subtitle="Phone · email · chat inquiries."
      addLabel="Add"
      stats={[
    { label: "Total", value: 318, icon: Phone },
    { label: "Today", value: 24, icon: Clock },
    { label: "Converted", value: 72, icon: CheckCircle2, tone: "success" },
    { label: "Missed", value: 6, icon: AlertCircle, tone: "danger" }
      ]}
      columns={[
    { key: "name", label: "Name" },
    { key: "channel", label: "Channel" },
    { key: "about", label: "About" },
    { key: "when", label: "When" },
    { key: "owner", label: "Owner" },
    { key: "status", label: "Status" }
      ]}
      rows={[
    {"id":"1","name":"Bina Sharma","channel":"Phone","about":"Loksewa fees","when":"1h ago","owner":"Reception","status":"Active"},
    {"id":"2","name":"Mahesh Rai","channel":"WhatsApp","about":"Nepal Police batch","when":"2h ago","owner":"Suman","status":"Active"},
    {"id":"3","name":"Diya Basnet","channel":"Email","about":"Scholarships","when":"5h ago","owner":"Anita","status":"Pending"}
      ]}
    />
  ),
});
