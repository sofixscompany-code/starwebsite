import { FirestoreModulePage } from "@/components/admin/FirestoreModulePage";
import { useModuleData } from "@/hooks/use-module-data";
import { FileText, Award, TrendingUp, AlertCircle } from "lucide-react";

export function AssignmentsPage() {
  const { rows } = useModuleData("assignments");

  const isDone = (status: unknown) =>
    ["completed", "graded"].includes(String(status || "").toLowerCase());
  const today = new Date().toISOString().slice(0, 10);
  const completed = rows.filter((r) => isDone(r.status)).length;
  const overdue = rows.filter(
    (r) => r.dueDate && String(r.dueDate).slice(0, 10) < today && !isDone(r.status),
  ).length;
  const submissionRate = rows.length ? Math.round((completed / rows.length) * 100) : 0;

  return (
    <FirestoreModulePage
      collectionName="assignments"
      title="Assignments"
      subtitle="Create, track and grade student assignments"
      stats={[
        { label: "Total Assigned", value: rows.length, icon: FileText, tone: "purple" },
        { label: "Completed", value: completed, icon: Award, tone: "success" },
        { label: "Submission Rate", value: `${submissionRate}%`, icon: TrendingUp, tone: "info" },
        { label: "Overdue", value: overdue, icon: AlertCircle, tone: "warning" },
      ]}
      columns={[
        { key: "name", label: "Assignment" },
        { key: "subject", label: "Subject" },
        { key: "dueDate", label: "Due Date" },
        { key: "status", label: "Status" },
      ]}
      rows={[
        {
          name: "Quadratic Equations Worksheet",
          subject: "Mathematics",
          dueDate: "2024-01-20",
          status: "Active",
        },
        {
          name: "Newton's Laws Lab Report",
          subject: "Physics",
          dueDate: "2024-01-18",
          status: "Overdue",
        },
        {
          name: "Periodic Table Quiz",
          subject: "Chemistry",
          dueDate: "2024-01-22",
          status: "Active",
        },
        {
          name: "Essay on Indian History",
          subject: "History",
          dueDate: "2024-01-15",
          status: "Completed",
        },
      ]}
    />
  );
}
