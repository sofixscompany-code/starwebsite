import { createFileRoute } from "@tanstack/react-router";
import { ModulePage } from "@/components/admin/ModulePage";
import { Bed, CheckCircle2, Users, Wallet } from "lucide-react";

export const Route = createFileRoute("/_authenticated/admin/hostel")({
  component: () => (
    <ModulePage
      title="Hostel"
      subtitle="Rooms · beds · mess & attendance."
      addLabel="Add"
      stats={[
    { label: "Rooms", value: 48, icon: Bed },
    { label: "Occupied", value: 186, icon: CheckCircle2 },
    { label: "Available", value: 32, icon: Users },
    { label: "Dues", value: "₹68,500", icon: Wallet, tone: "warning" }
      ]}
      columns={[
    { key: "room", label: "Room" },
    { key: "floor", label: "Floor" },
    { key: "capacity", label: "Cap" },
    { key: "occupied", label: "Occupied" },
    { key: "type", label: "Type" },
    { key: "status", label: "Status" }
      ]}
      rows={[
    {"id":"1","room":"H-101","floor":"Ground","capacity":"4","occupied":"4","type":"AC","status":"Active"},
    {"id":"2","room":"H-102","floor":"Ground","capacity":"4","occupied":"3","type":"AC","status":"Active"},
    {"id":"3","room":"H-201","floor":"First","capacity":"6","occupied":"6","type":"Non-AC","status":"Active"},
    {"id":"4","room":"H-202","floor":"First","capacity":"6","occupied":"4","type":"Non-AC","status":"Active"}
      ]}
    />
  ),
});
