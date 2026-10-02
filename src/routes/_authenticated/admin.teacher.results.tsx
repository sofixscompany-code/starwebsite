import { FirestoreModulePage } from "@/components/admin/FirestoreModulePage";
import { useModuleData } from "@/hooks/use-module-data";
import { Trophy, Megaphone, Users } from "lucide-react";

/**
 * Writes the shared `results` collection — columns/fields must stay in sync
 * with `admin.results.tsx` and `admin.teacher.gradebook.tsx`.
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

export default function TeacherResultsPage() {
  const { rows } = useModuleData("results");

  const exams = new Set(rows.map((r) => String(r.exam || "")).filter(Boolean)).size;
  const students = new Set(rows.map((r) => String(r.studentId || "")).filter(Boolean)).size;

  return (
    <FirestoreModulePage
      collectionName="results"
      title="Results"
      subtitle="View and publish exam results"
      stats={[
        { label: "Results", value: rows.length, icon: Trophy, tone: "success" },
        { label: "Exams", value: exams, icon: Megaphone, tone: "info" },
        { label: "Students", value: students, icon: Users, tone: "purple" },
      ]}
      columns={COLUMNS}
      fields={FIELDS}
    />
  );
}
