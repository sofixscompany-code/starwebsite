import { FirestoreModulePage } from "@/components/admin/FirestoreModulePage";
import { useModuleData } from "@/hooks/use-module-data";
import { ClipboardCheck, Users } from "lucide-react";

/**
 * `attendance` is written by both `/admin/attendance` and the teacher portal —
 * keep columns/fields in sync with `admin.attendance.tsx`.
 */
const COLUMNS = [
  { key: "studentId", label: "Student ID" },
  { key: "date", label: "Date" },
  { key: "status", label: "Status" },
  { key: "markedBy", label: "Marked By" },
];

const FIELDS = [
  {
    key: "studentId",
    label: "Student ID",
    type: "text" as const,
    required: true,
    placeholder: "Student uid",
  },
  { key: "date", label: "Date", type: "text" as const, required: true, placeholder: "2024-03-01" },
  {
    key: "status",
    label: "Status",
    type: "select" as const,
    options: [
      { value: "present", label: "Present" },
      { value: "absent", label: "Absent" },
      { value: "late", label: "Late" },
    ],
  },
  { key: "markedBy", label: "Marked By", type: "text" as const, placeholder: "Teacher uid" },
];

export default function TeacherAttendancePage() {
  const { rows } = useModuleData("attendance");

  const students = new Set(rows.map((r) => String(r.studentId || "")).filter(Boolean)).size;

  return (
    <FirestoreModulePage
      collectionName="attendance"
      title="Attendance"
      subtitle="Mark and manage student attendance"
      stats={[
        { label: "Records", value: rows.length, icon: ClipboardCheck, tone: "info" },
        { label: "Students", value: students, icon: Users, tone: "success" },
      ]}
      columns={COLUMNS}
      fields={FIELDS}
    />
  );
}
