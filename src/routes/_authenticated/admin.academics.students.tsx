import { FirestoreModulePage } from "@/components/admin/FirestoreModulePage";
import { useModuleData } from "@/hooks/use-module-data";
import { Users, School } from "lucide-react";

export default function AcademicsStudentsPage() {
  const { rows } = useModuleData("students");

  const active = rows.filter((r) => String(r.status || "").toLowerCase() === "active").length;

  return (
    <FirestoreModulePage
      collectionName="students"
      title="Students"
      subtitle="Academic student management"
      stats={[
        { label: "Students", value: rows.length, icon: Users, tone: "info" },
        { label: "Active", value: active, icon: School, tone: "success" },
      ]}
      columns={[
        { key: "fullName", label: "Name" },
        { key: "studentId", label: "Login UID" },
        { key: "parentEmail", label: "Parent Email" },
        { key: "course", label: "Course" },
        { key: "batch", label: "Batch" },
        { key: "status", label: "Status" },
      ]}
      fields={[
        {
          key: "fullName",
          label: "Full Name",
          type: "text",
          required: true,
          placeholder: "Aarav Sharma",
        },
        {
          key: "studentId",
          label: "Login UID",
          type: "text",
          placeholder: "Student login uid (students collection doc id)",
        },
        {
          key: "parentEmail",
          label: "Parent Email",
          type: "text",
          placeholder: "parent@demo.np",
        },
        { key: "email", label: "Email", type: "text", placeholder: "student@demo.np" },
        { key: "phone", label: "Phone", type: "text", placeholder: "+977 98XXXXXXXX" },
        { key: "course", label: "Course", type: "text", placeholder: "Nepal Police Preparation" },
        { key: "batch", label: "Batch", type: "text", placeholder: "NP-A" },
        {
          key: "status",
          label: "Status",
          type: "select",
          options: [
            { value: "active", label: "Active" },
            { value: "inactive", label: "Inactive" },
          ],
        },
      ]}
    />
  );
}
