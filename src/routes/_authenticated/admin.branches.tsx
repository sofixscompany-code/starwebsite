import { FirestoreModulePage } from "@/components/admin/FirestoreModulePage";
import { useModuleData } from "@/hooks/use-module-data";
import { GitBranch, Building, GraduationCap } from "lucide-react";

export function BranchesPage() {
  const { rows } = useModuleData("branches");

  const total = rows.length;
  const active = rows.filter((r) => String(r.status ?? "") === "Active").length;
  const students = rows.reduce((sum, r) => {
    const n = Number(r.students);
    return sum + (Number.isFinite(n) ? n : 0);
  }, 0);

  return (
    <FirestoreModulePage
      collectionName="branches"
      title="Branches"
      subtitle="Manage coaching centre locations and their details"
      stats={[
        { label: "Total Branches", value: total, icon: GitBranch, tone: "purple" },
        { label: "Active", value: active, icon: Building, tone: "info" },
        { label: "Students", value: students, icon: GraduationCap, tone: "success" },
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
