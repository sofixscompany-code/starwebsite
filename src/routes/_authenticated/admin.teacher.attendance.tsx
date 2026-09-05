import { FirestoreModulePage } from "@/components/admin/FirestoreModulePage";
import { ClipboardCheck, Users } from "lucide-react";

export default function TeacherAttendancePage() {
  return (
    <FirestoreModulePage
      collectionName="attendance"
      title="Attendance"
      subtitle="Mark and manage student attendance"
      stats={[
        { label: "Records", value: 0, icon: ClipboardCheck, tone: "info" },
        { label: "Students", value: 0, icon: Users, tone: "success" },
      ]}
      columns={[
        { key: "studentId", label: "Student ID" },
        { key: "date", label: "Date" },
        { key: "status", label: "Status" },
        { key: "markedBy", label: "Marked By" },
      ]}
      fields={[
        {
          key: "studentId",
          label: "Student ID",
          type: "text",
          required: true,
          placeholder: "Student uid",
        },
        { key: "date", label: "Date", type: "text", required: true, placeholder: "2024-03-01" },
        {
          key: "status",
          label: "Status",
          type: "select",
          options: [
            { value: "present", label: "Present" },
            { value: "absent", label: "Absent" },
            { value: "late", label: "Late" },
          ],
        },
        { key: "markedBy", label: "Marked By", type: "text", placeholder: "Teacher uid" },
      ]}
    />
  );
}
