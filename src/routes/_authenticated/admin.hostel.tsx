import { FirestoreModulePage } from "@/components/admin/FirestoreModulePage";
import { useModuleData } from "@/hooks/use-module-data";
import { Bed, CheckCircle2, Users } from "lucide-react";

export function HostelPage() {
  const { rows } = useModuleData("hostel");

  const total = rows.length;
  const occupied = rows.filter((r) => String(r.status ?? "") === "Occupied").length;
  const available = rows.filter((r) => String(r.status ?? "") === "Available").length;

  return (
    <FirestoreModulePage
      collectionName="hostel"
      title="Hostel"
      subtitle="Manage hostel rooms, occupancy and payments"
      stats={[
        { label: "Total Rooms", value: total, icon: Bed, tone: "purple" },
        { label: "Occupied", value: occupied, icon: Users, tone: "info" },
        { label: "Available", value: available, icon: CheckCircle2, tone: "success" },
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
