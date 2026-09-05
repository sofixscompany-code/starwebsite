import { FirestoreModulePage } from "@/components/admin/FirestoreModulePage";
import { PencilLine, AlarmClock } from "lucide-react";

export default function TeacherExaminationsPage() {
  return (
    <FirestoreModulePage
      collectionName="exams"
      title="Examinations"
      subtitle="Create, schedule, manage examinations"
      stats={[
        { label: "Exams", value: 0, icon: PencilLine, tone: "purple" },
        { label: "Portal", value: "Teacher", icon: AlarmClock, tone: "info" },
      ]}
      columns={[
        { key: "title", label: "Title" },
        { key: "subject", label: "Subject" },
        { key: "scheduledAt", label: "Scheduled At" },
        { key: "totalMarks", label: "Total Marks" },
      ]}
      fields={[
        {
          key: "title",
          label: "Title",
          type: "text",
          required: true,
          placeholder: "Math Unit Test Ch.4-6",
        },
        {
          key: "subject",
          label: "Subject",
          type: "text",
          required: true,
          placeholder: "Mathematics",
        },
        {
          key: "scheduledAt",
          label: "Scheduled At",
          type: "text",
          required: true,
          placeholder: "2024-03-08 09:00",
        },
        { key: "durationMin", label: "Duration (min)", type: "number", placeholder: "90" },
        { key: "totalMarks", label: "Total Marks", type: "number", placeholder: "75" },
      ]}
    />
  );
}
