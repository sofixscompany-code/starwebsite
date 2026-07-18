import { ModulePage } from "@/components/admin/ModulePage";
import { FileText, Award, TrendingUp, AlertCircle } from "lucide-react";

export function AssignmentsPage() {
  return (
    <ModulePage
      title="Assignments"
      subtitle="Create, track and grade student assignments"
      stats={[
        { label: "Total Assigned", value: 86, icon: FileText, tone: "purple" },
        { label: "Completed", value: 64, icon: Award, tone: "success" },
        { label: "Submission Rate", value: "74%", icon: TrendingUp, tone: "info" },
        { label: "Overdue", value: 5, icon: AlertCircle, tone: "warning" },
      ]}
      columns={[
        { key: "name", label: "Assignment" },
        { key: "subject", label: "Subject" },
        { key: "dueDate", label: "Due Date" },
        { key: "status", label: "Status" },
      ]}
      rows={[
        { name: "Quadratic Equations Worksheet", subject: "Mathematics", dueDate: "2024-01-20", status: "Active" },
        { name: "Newton's Laws Lab Report", subject: "Physics", dueDate: "2024-01-18", status: "Overdue" },
        { name: "Periodic Table Quiz", subject: "Chemistry", dueDate: "2024-01-22", status: "Active" },
        { name: "Essay on Indian History", subject: "History", dueDate: "2024-01-15", status: "Completed" },
      ]}
    />
  );
}
