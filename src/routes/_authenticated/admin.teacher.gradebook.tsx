import { FirestoreModulePage } from "@/components/admin/FirestoreModulePage";
import { BookMarked, Award } from "lucide-react";

export default function TeacherGradebookPage() {
  return (
    <FirestoreModulePage
      collectionName="results"
      title="Gradebook"
      subtitle="Track and manage student grades"
      stats={[
        { label: "Entries", value: 0, icon: BookMarked, tone: "info" },
        { label: "Portal", value: "Teacher", icon: Award, tone: "success" },
      ]}
      columns={[
        { key: "studentId", label: "Student" },
        { key: "subject", label: "Subject" },
        { key: "exam", label: "Exam" },
        { key: "score", label: "Score" },
        { key: "total", label: "Total" },
      ]}
      fields={[
        {
          key: "studentId",
          label: "Student ID",
          type: "text",
          required: true,
          placeholder: "Student uid",
        },
        {
          key: "subject",
          label: "Subject",
          type: "text",
          required: true,
          placeholder: "Mathematics",
        },
        { key: "exam", label: "Exam", type: "text", required: true, placeholder: "Unit Test 4" },
        { key: "score", label: "Score", type: "number", placeholder: "85" },
        { key: "total", label: "Total", type: "number", placeholder: "100" },
      ]}
    />
  );
}
