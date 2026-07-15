import { createFileRoute } from "@tanstack/react-router";
import { ModulePage } from "@/components/admin/ModulePage";
import { Bus, Users, GitBranch, GraduationCap } from "lucide-react";

export const Route = createFileRoute("/_authenticated/admin/transport")({
  component: () => (
    <ModulePage
      title="Transport"
      subtitle="Vehicles · drivers · GPS routes."
      addLabel="Add"
      stats={[
    { label: "Vehicles", value: 14, icon: Bus },
    { label: "Drivers", value: 18, icon: Users },
    { label: "Routes", value: 22, icon: GitBranch },
    { label: "Riders", value: 486, icon: GraduationCap }
      ]}
      columns={[
    { key: "veh", label: "Vehicle" },
    { key: "driver", label: "Driver" },
    { key: "route", label: "Route" },
    { key: "stops", label: "Stops" },
    { key: "riders", label: "Riders" },
    { key: "status", label: "Status" }
      ]}
      rows={[
    {"id":"1","veh":"BA-2-KHA-1234","driver":"Ramesh K.","route":"Kalanki → Chabahil","stops":"12","riders":"32","status":"Active"},
    {"id":"2","veh":"BA-2-KHA-5678","driver":"Suresh T.","route":"Balaju → Baneshwor","stops":"10","riders":"28","status":"Active"},
    {"id":"3","veh":"BA-2-KHA-9012","driver":"Bishnu R.","route":"Kirtipur → Boudha","stops":"14","riders":"36","status":"Active"}
      ]}
    />
  ),
});
