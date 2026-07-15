import { createFileRoute } from "@tanstack/react-router";
import { ModulePage } from "@/components/admin/ModulePage";
import { LifeBuoy, Clock, CheckCircle2, Star } from "lucide-react";

export const Route = createFileRoute("/_authenticated/admin/support")({
  component: () => (
    <ModulePage
      title="Support"
      subtitle="Tickets from students, parents & staff."
      addLabel="Add"
      stats={[
    { label: "Open", value: 42, icon: LifeBuoy },
    { label: "First reply", value: "28 min", icon: Clock, tone: "success" },
    { label: "Resolved (7d)", value: 186, icon: CheckCircle2, tone: "success" },
    { label: "CSAT", value: "4.6/5", icon: Star, tone: "warning" }
      ]}
      columns={[
    { key: "id", label: "Ticket" },
    { key: "subject", label: "Subject" },
    { key: "from", label: "From" },
    { key: "priority", label: "Priority" },
    { key: "assigned", label: "Assigned" },
    { key: "status", label: "Status" }
      ]}
      rows={[
    {"id":"T-8241","subject":"Cannot access LMS videos","from":"Priya Karki","priority":"High","assigned":"Anju R.","status":"Active"},
    {"id":"T-8242","subject":"Fee receipt mismatch","from":"Aarav S.","priority":"Medium","assigned":"Anita R.","status":"Pending"},
    {"id":"T-8243","subject":"Login OTP not received","from":"Rohan T.","priority":"Low","assigned":"Suman P.","status":"Completed"}
      ]}
    />
  ),
});
