import { FirestoreModulePage } from "@/components/admin/FirestoreModulePage";
import { PenSquare, CheckCircle2, Clock, AlertCircle } from "lucide-react";

export function HomeworkPage() {
  return (
    <FirestoreModulePage
      collectionName="homework"
      title="Homework"
      subtitle="Assign, track and evaluate daily homework"
      stats={[
        { label: "Total Assigned", value: 1240, icon: PenSquare, tone: "purple" },
        { label: "Completed", value: 980, icon: CheckCircle2, tone: "success" },
        { label: "Pending Review", value: 45, icon: Clock, tone: "info" },
        { label: "Overdue", value: 18, icon: AlertCircle, tone: "warning" },
      ]}
      columns={[
        { key: "title", label: "Assignment" },
        { key: "batch", label: "Batch" },
        { key: "subject", label: "Subject" },
        { key: "dueDate", label: "Due Date" },
        { key: "status", label: "Status" },
      ]}
      fields={[
        { key: "title", label: "Assignment", type: "text", required: true },
        { key: "batch", label: "Batch", type: "text" },
        { key: "subject", label: "Subject", type: "text" },
        {
          key: "status",
          label: "Status",
          type: "select",
          options: [
            { value: "pending", label: "Pending" },
            { value: "submitted", label: "Submitted" },
            { value: "graded", label: "Graded" },
          ],
        },
      ]}
      rows={[
        {
          title: "Ch. 5 Exercises",
          batch: "12-A",
          subject: "Mathematics",
          dueDate: "2026-09-10",
          status: "pending",
        },
        {
          title: "Lab Report – Optics",
          batch: "12-B",
          subject: "Physics",
          dueDate: "2026-09-12",
          status: "submitted",
        },
        {
          title: "Worksheet – Organic",
          batch: "11-A",
          subject: "Chemistry",
          dueDate: "2026-09-08",
          status: "pending",
        },
        {
          title: "Essay Draft",
          batch: "11-B",
          subject: "English",
          dueDate: "2026-09-14",
          status: "graded",
        },
      ]}
    />
  );
}
