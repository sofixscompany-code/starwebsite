import { ModulePage } from "@/components/admin/ModulePage";
import { Bed, CheckCircle2, Users, Wallet } from "lucide-react";

export function HostelPage() {
  return (
    <ModulePage
      title="Hostel"
      subtitle="Manage hostel rooms, occupancy and payments"
      stats={[
        { label: "Total Rooms", value: 120, icon: Bed, tone: "purple" },
        { label: "Occupied", value: 98, icon: Users, tone: "info" },
        { label: "Available", value: 22, icon: CheckCircle2, tone: "success" },
        { label: "Monthly Revenue", value: "₹3.6L", icon: Wallet, tone: "warning" },
      ]}
      columns={[
        { key: "room", label: "Room" },
        { key: "block", label: "Block" },
        { key: "occupant", label: "Occupant" },
        { key: "status", label: "Status" },
      ]}
      rows={[
        { room: "A-101", block: "Block A", occupant: "Rahul Verma", status: "Occupied" },
        { room: "A-102", block: "Block A", occupant: "Vikram Patel", status: "Occupied" },
        { room: "B-205", block: "Block B", occupant: "—", status: "Available" },
        { room: "B-206", block: "Block B", occupant: "—", status: "Maintenance" },
      ]}
    />
  );
}
