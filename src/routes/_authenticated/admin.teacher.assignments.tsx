import { FirestoreModulePage } from "@/components/admin/FirestoreModulePage";
import { FilePlus2, CalendarClock } from "lucide-react";

export default function TeacherAssignmentsPage() {
  return (
    <FirestoreModulePage
      collectionName="homework"
      title="Assignments"
      subtitle="Create, assign, and grade assignments"
      stats={[
        { label: "Assignments", value: 0, icon: FilePlus2, tone: "purple" },
        { label: "Portal", value: "Teacher", icon: CalendarClock, tone: "info" },
      ]}
      columns={[
        { key: "title", label: "Title" },
        { key: "subject", label: "Subject" },
        { key: "dueDate", label: "Due Date" },
        { key: "status", label: "Status" },
      ]}
      fields={[
        {
          key: "title",
          label: "Title",
          type: "text",
          required: true,
          placeholder: "Algebra Problem Set Ch.5",
        },
        {
          key: "subject",
          label: "Subject",
          type: "text",
          required: true,
          placeholder: "Mathematics",
        },
        {
          key: "dueDate",
          label: "Due Date",
          type: "text",
          required: true,
          placeholder: "2024-03-05",
        },
        {
          key: "status",
          label: "Status",
          type: "select",
          options: [
            { value: "pending", label: "Pending" },
            { value: "completed", label: "Completed" },
            { value: "graded", label: "Graded" },
          ],
        },
      ]}
    />
  );
}
