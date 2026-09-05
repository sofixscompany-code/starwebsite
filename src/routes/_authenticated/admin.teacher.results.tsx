import { FirestoreModulePage } from "@/components/admin/FirestoreModulePage";
import { Trophy, Megaphone } from "lucide-react";

export default function TeacherResultsPage() {
  return (
    <FirestoreModulePage
      collectionName="results"
      title="Results"
      subtitle="View and publish exam results"
      stats={[
        { label: "Results", value: 0, icon: Trophy, tone: "success" },
        { label: "Portal", value: "Teacher", icon: Megaphone, tone: "info" },
      ]}
      columns={[
        { key: "studentId", label: "Student" },
        { key: "exam", label: "Exam" },
        { key: "subject", label: "Subject" },
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
        { key: "exam", label: "Exam", type: "text", required: true, placeholder: "Mock Test #14" },
        { key: "score", label: "Score", type: "number", placeholder: "72" },
        { key: "total", label: "Total", type: "number", placeholder: "100" },
      ]}
    />
  );
}
