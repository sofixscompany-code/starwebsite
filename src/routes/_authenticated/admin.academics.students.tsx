import { FirestoreModulePage } from "@/components/admin/FirestoreModulePage";
import { Users, School } from "lucide-react";

export default function AcademicsStudentsPage() {
  return (
    <FirestoreModulePage
      collectionName="students"
      title="Students"
      subtitle="Academic student management"
      stats={[
        { label: "Students", value: 0, icon: Users, tone: "info" },
        { label: "Section", value: "Academics", icon: School, tone: "success" },
      ]}
      columns={[
        { key: "fullName", label: "Name" },
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
