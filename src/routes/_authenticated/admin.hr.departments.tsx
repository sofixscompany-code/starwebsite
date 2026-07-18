import { ModulePage } from "@/components/admin/ModulePage";
import { Layers, UserCog, Briefcase, Users } from "lucide-react";

export function DepartmentsPage() {
  return (
    <ModulePage
      title="Departments"
      subtitle="Organize staff into departments and manage hierarchy"
      stats={[
        { label: "Departments", value: 8, icon: Layers, tone: "purple" },
        { label: "Head Count", value: 64, icon: Users, tone: "info" },
        { label: "Team Leads", value: 12, icon: UserCog, tone: "success" },
        { label: "Open Roles", value: 3, icon: Briefcase, tone: "warning" },
      ]}
      columns={[
        { key: "name", label: "Department" },
        { key: "head", label: "Head" },
        { key: "staff", label: "Staff" },
        { key: "status", label: "Status" },
      ]}
      rows={[
        { name: "Academics", head: "Dr. Mehta", staff: 28, status: "Active" },
        { name: "Operations", head: "Mr. Kapoor", staff: 12, status: "Active" },
        { name: "Marketing", head: "Ms. Singh", staff: 8, status: "Active" },
        { name: "Finance", head: "Mr. Agarwal", staff: 6, status: "Active" },
      ]}
    />
  );
}
