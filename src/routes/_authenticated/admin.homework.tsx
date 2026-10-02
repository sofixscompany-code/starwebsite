import { FirestoreModulePage } from "@/components/admin/FirestoreModulePage";
import { useModuleData } from "@/hooks/use-module-data";
import { PenSquare, CheckCircle2, Clock, AlertCircle } from "lucide-react";

/**
 * `homework` is written by both `/admin/homework` and the teacher portal's
 * `/admin/teacher/assignments` — keep columns/fields in sync with
 * `admin.teacher.assignments.tsx`.
 */
const COLUMNS = [
  { key: "title", label: "Title" },
  { key: "batch", label: "Batch" },
  { key: "subject", label: "Subject" },
  { key: "dueDate", label: "Due Date" },
  { key: "status", label: "Status" },
];

const FIELDS = [
  {
    key: "title",
    label: "Title",
    type: "text" as const,
    required: true,
    placeholder: "Ch. 5 Exercises",
  },
  { key: "batch", label: "Batch", type: "text" as const, placeholder: "12-A" },
  { key: "subject", label: "Subject", type: "text" as const, placeholder: "Mathematics" },
  { key: "dueDate", label: "Due Date", type: "text" as const, placeholder: "YYYY-MM-DD" },
  {
    key: "status",
    label: "Status",
    type: "select" as const,
    options: [
      { value: "pending", label: "Pending" },
      { value: "submitted", label: "Submitted" },
      { value: "completed", label: "Completed" },
      { value: "graded", label: "Graded" },
    ],
  },
];

export function HomeworkPage() {
  const { rows } = useModuleData("homework");

  const isDone = (status: unknown) => ["completed", "graded"].includes(String(status || ""));
  const today = new Date().toISOString().slice(0, 10);
  const completed = rows.filter((r) => isDone(r.status)).length;
  const pendingReview = rows.filter((r) => r.status === "submitted").length;
  const overdue = rows.filter(
    (r) => r.dueDate && String(r.dueDate).slice(0, 10) < today && !isDone(r.status),
  ).length;

  return (
    <FirestoreModulePage
      collectionName="homework"
      title="Homework"
      subtitle="Assign, track and evaluate daily homework"
      stats={[
        { label: "Total Assigned", value: rows.length, icon: PenSquare, tone: "purple" },
        { label: "Completed", value: completed, icon: CheckCircle2, tone: "success" },
        { label: "Pending Review", value: pendingReview, icon: Clock, tone: "info" },
        { label: "Overdue", value: overdue, icon: AlertCircle, tone: "warning" },
      ]}
      columns={COLUMNS}
      fields={FIELDS}
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
