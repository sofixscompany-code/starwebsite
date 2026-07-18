import { ModulePage } from "@/components/admin/ModulePage";
import { PenSquare, CheckCircle2, Clock, AlertCircle } from "lucide-react";

export function HomeworkPage() {
  return (
    <ModulePage
      title="Homework"
      subtitle="Assign, track and evaluate daily homework"
      stats={[
        { label: "Total Assigned", value: 1240, icon: PenSquare, tone: "purple" },
        { label: "Completed", value: 980, icon: CheckCircle2, tone: "success" },
        { label: "Pending Review", value: 45, icon: Clock, tone: "info" },
        { label: "Overdue", value: 18, icon: AlertCircle, tone: "warning" },
      ]}
      columns={[
        { key: "name", label: "Assignment" },
        { key: "class", label: "Class" },
        { key: "subject", label: "Subject" },
        { key: "status", label: "Status" },
      ]}
      rows={[
        { name: "Ch. 5 Exercises", class: "12-A", subject: "Mathematics", status: "Completed" },
        { name: "Lab Report – Optics", class: "12-B", subject: "Physics", status: "Pending" },
        { name: "Worksheet – Organic", class: "11-A", subject: "Chemistry", status: "Overdue" },
        { name: "Essay Draft", class: "11-B", subject: "English", status: "Completed" },
      ]}
    />
  );
}
