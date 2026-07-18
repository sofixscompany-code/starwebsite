import { ModulePage } from "@/components/admin/ModulePage";
import { IdCard, Clock, AlertCircle, Layers } from "lucide-react";

export function IdCardsPage() {
  return (
    <ModulePage
      title="ID Cards"
      subtitle="Generate and manage student and staff identity cards"
      stats={[
        { label: "Total Generated", value: 1304, icon: IdCard, tone: "purple" },
        { label: "Pending Print", value: 24, icon: Clock, tone: "warning" },
        { label: "Expired", value: 38, icon: AlertCircle, tone: "danger" },
        { label: "Templates", value: 4, icon: Layers, tone: "info" },
      ]}
      columns={[
        { key: "name", label: "Name" },
        { key: "type", label: "Type" },
        { key: "validTill", label: "Valid Till" },
        { key: "status", label: "Status" },
      ]}
      rows={[
        { name: "Aarav Patel", type: "Student", validTill: "2025-03-31", status: "Active" },
        { name: "Rahul Sharma", type: "Staff", validTill: "2025-06-30", status: "Active" },
        { name: "Sneha Gupta", type: "Student", validTill: "2024-12-31", status: "Expired" },
        { name: "Priya Mehta", type: "Staff", validTill: "2025-06-30", status: "Pending Print" },
      ]}
    />
  );
}
