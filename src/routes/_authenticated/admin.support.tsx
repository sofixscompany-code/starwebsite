import { FirestoreModulePage } from "@/components/admin/FirestoreModulePage";
import { useModuleData } from "@/hooks/use-module-data";
import { LifeBuoy, Clock, Hourglass, CheckCircle2 } from "lucide-react";

export function SupportPage() {
  const { rows } = useModuleData("support_tickets");

  const total = rows.length;
  const open = rows.filter((r) => String(r.status ?? "") === "Open").length;
  const inProgress = rows.filter((r) => String(r.status ?? "") === "In Progress").length;
  const resolved = rows.filter((r) => String(r.status ?? "") === "Resolved").length;

  return (
    <FirestoreModulePage
      collectionName="support_tickets"
      title="Support"
      subtitle="Manage student and parent support tickets"
      stats={[
        { label: "Total Tickets", value: total, icon: LifeBuoy, tone: "purple" },
        { label: "Open", value: open, icon: Clock, tone: "warning" },
        { label: "In Progress", value: inProgress, icon: Hourglass, tone: "info" },
        { label: "Resolved", value: resolved, icon: CheckCircle2, tone: "success" },
      ]}
      columns={[
        { key: "name", label: "Ticket" },
        { key: "user", label: "Raised By" },
        { key: "priority", label: "Priority" },
        { key: "status", label: "Status" },
      ]}
      rows={[
        {
          name: "Can't access study material",
          user: "Aarav Patel",
          priority: "High",
          status: "Open",
        },
        {
          name: "Fee receipt not received",
          user: "Meera Joshi",
          priority: "Medium",
          status: "In Progress",
        },
        {
          name: "App crash on Android 14",
          user: "Rohan Verma",
          priority: "High",
          status: "Resolved",
        },
        {
          name: "Query about batch timing",
          user: "Sunita Devi",
          priority: "Low",
          status: "Resolved",
        },
      ]}
    />
  );
}
