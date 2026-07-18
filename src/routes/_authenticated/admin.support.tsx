import { ModulePage } from "@/components/admin/ModulePage";
import { LifeBuoy, Clock, CheckCircle2, Star } from "lucide-react";

export function SupportPage() {
  return (
    <ModulePage
      title="Support"
      subtitle="Manage student and parent support tickets"
      stats={[
        { label: "Total Tickets", value: 324, icon: LifeBuoy, tone: "purple" },
        { label: "Open", value: 18, icon: Clock, tone: "warning" },
        { label: "Resolved", value: 290, icon: CheckCircle2, tone: "success" },
        { label: "Satisfaction", value: "4.6★", icon: Star, tone: "info" },
      ]}
      columns={[
        { key: "name", label: "Ticket" },
        { key: "user", label: "Raised By" },
        { key: "priority", label: "Priority" },
        { key: "status", label: "Status" },
      ]}
      rows={[
        { name: "Can't access study material", user: "Aarav Patel", priority: "High", status: "Open" },
        { name: "Fee receipt not received", user: "Meera Joshi", priority: "Medium", status: "In Progress" },
        { name: "App crash on Android 14", user: "Rohan Verma", priority: "High", status: "Resolved" },
        { name: "Query about batch timing", user: "Sunita Devi", priority: "Low", status: "Resolved" },
      ]}
    />
  );
}
