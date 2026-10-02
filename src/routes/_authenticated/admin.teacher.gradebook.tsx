import { FirestoreModulePage } from "@/components/admin/FirestoreModulePage";
import { useModuleData } from "@/hooks/use-module-data";
import { BookMarked, Award } from "lucide-react";

/**
 * Gradebook writes the shared `results` collection — columns/fields must stay
 * in sync with `admin.results.tsx` and `admin.teacher.results.tsx`.
 */
const COLUMNS = [
  { key: "studentId", label: "Student ID" },
  { key: "subject", label: "Subject" },
  { key: "exam", label: "Exam" },
  { key: "score", label: "Score" },
  { key: "total", label: "Total" },
];

const FIELDS = [
  {
    key: "studentId",
    label: "Student ID",
    type: "text" as const,
    required: true,
    placeholder: "Student uid",
  },
  {
    key: "subject",
    label: "Subject",
    type: "text" as const,
    required: true,
    placeholder: "Mathematics",
  },
  { key: "exam", label: "Exam", type: "text" as const, required: true, placeholder: "Unit Test 4" },
  { key: "score", label: "Score", type: "number" as const, placeholder: "85" },
  { key: "total", label: "Total", type: "number" as const, placeholder: "100" },
];

export default function TeacherGradebookPage() {
  const { rows } = useModuleData("results");

  const subjects = new Set(rows.map((r) => String(r.subject || "")).filter(Boolean)).size;

  return (
    <FirestoreModulePage
      collectionName="results"
      title="Gradebook"
      subtitle="Track and manage student grades"
      stats={[
        { label: "Entries", value: rows.length, icon: BookMarked, tone: "info" },
        { label: "Subjects", value: subjects, icon: Award, tone: "success" },
      ]}
      columns={COLUMNS}
      fields={FIELDS}
    />
  );
}
