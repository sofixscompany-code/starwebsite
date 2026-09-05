import { FirestoreModulePage } from "@/components/admin/FirestoreModulePage";
import { Users, GraduationCap } from "lucide-react";

export default function TeacherStudentsPage() {
  return (
    <FirestoreModulePage
      collectionName="students"
      title="My Students"
      subtitle="View and manage students"
      stats={[
        { label: "Students", value: 0, icon: Users, tone: "info" },
        { label: "Portal", value: "Teacher", icon: GraduationCap, tone: "success" },
      ]}
      columns={[
        { key: "fullName", label: "Name" },
        { key: "course", label: "Course" },
        { key: "batch", label: "Batch" },
        { key: "phone", label: "Phone" },
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
