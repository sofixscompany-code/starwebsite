import { ModulePage } from "@/components/admin/ModulePage";
import { Bus, Users, GitBranch, GraduationCap } from "lucide-react";

export function TransportPage() {
  return (
    <ModulePage
      title="Transport"
      subtitle="Manage bus routes, stops and student transport assignments"
      stats={[
        { label: "Total Buses", value: 8, icon: Bus, tone: "purple" },
        { label: "Active Routes", value: 12, icon: GitBranch, tone: "info" },
        { label: "Students Transported", value: 420, icon: GraduationCap, tone: "success" },
        { label: "Drivers", value: 10, icon: Users, tone: "warning" },
      ]}
      columns={[
        { key: "route", label: "Route" },
        { key: "bus", label: "Bus No." },
        { key: "students", label: "Students" },
        { key: "status", label: "Status" },
      ]}
      rows={[
        { route: "Route A – Downtown to North Campus", bus: "DL-01-AB-1234", students: 48, status: "Active" },
        { route: "Route B – South Wing Express", bus: "DL-02-CD-5678", students: 42, status: "Active" },
        { route: "Route C – East Hub Circuit", bus: "DL-03-EF-9012", students: 38, status: "Active" },
        { route: "Route D – Weekend Special", bus: "DL-04-GH-3456", students: 0, status: "Inactive" },
      ]}
    />
  );
}
