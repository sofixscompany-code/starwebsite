import { ModulePage } from "@/components/admin/ModulePage";
import { GitBranch, Building, GraduationCap, Wallet } from "lucide-react";

export function BranchesPage() {
  return (
    <ModulePage
      title="Branches"
      subtitle="Manage coaching centre locations and their details"
      stats={[
        { label: "Total Branches", value: 5, icon: GitBranch, tone: "purple" },
        { label: "Classrooms", value: 32, icon: Building, tone: "info" },
        { label: "Students", value: 1240, icon: GraduationCap, tone: "success" },
        { label: "Monthly Revenue", value: "₹8.4L", icon: Wallet, tone: "warning" },
      ]}
      columns={[
        { key: "name", label: "Branch Name" },
        { key: "location", label: "Location" },
        { key: "students", label: "Students" },
        { key: "status", label: "Status" },
      ]}
      rows={[
        { name: "Downtown Centre", location: "MG Road, Delhi", students: 320, status: "Active" },
        { name: "North Campus", location: "Rohini, Delhi", students: 280, status: "Active" },
        { name: "South Wing", location: "Noida Sector 62", students: 245, status: "Active" },
        { name: "East Hub", location: "Ghaziabad", students: 210, status: "Active" },
      ]}
    />
  );
}
