import { FirestoreModulePage } from "@/components/admin/FirestoreModulePage";
import { useModuleData } from "@/hooks/use-module-data";
import { FilePlus2, Clock, CheckCircle2 } from "lucide-react";

/**
 * Teacher side of the shared `homework` collection — columns/fields must stay
 * in sync with `admin.homework.tsx` so records created here stay editable there.
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

export default function TeacherAssignmentsPage() {
  const { rows } = useModuleData("homework");

  const pending = rows.filter((r) => String(r.status || "") === "pending").length;
  const graded = rows.filter((r) => String(r.status || "") === "graded").length;

  return (
    <FirestoreModulePage
      collectionName="homework"
      title="Assignments"
      subtitle="Create, assign, and grade assignments"
      stats={[
        { label: "Assignments", value: rows.length, icon: FilePlus2, tone: "purple" },
        { label: "Pending", value: pending, icon: Clock, tone: "info" },
        { label: "Graded", value: graded, icon: CheckCircle2, tone: "success" },
      ]}
      columns={COLUMNS}
      fields={FIELDS}
    />
  );
}
