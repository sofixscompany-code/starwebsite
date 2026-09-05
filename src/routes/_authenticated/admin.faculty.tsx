import { FirestoreModulePage } from "@/components/admin/FirestoreModulePage";
import { GraduationCap, Users } from "lucide-react";

export function FacultyPage() {
  return (
    <FirestoreModulePage
      collectionName="faculty"
      title="Faculty"
      subtitle="Faculty members shown on the public Faculty page"
      stats={[
        { label: "Faculty Members", value: 0, icon: Users, tone: "info" },
        { label: "Public Page", value: 1, icon: GraduationCap, tone: "success" },
      ]}
      columns={[
        { key: "name", label: "Name" },
        { key: "role", label: "Role" },
        { key: "subject", label: "Subject" },
        { key: "initials", label: "Initials" },
        { key: "order", label: "Order" },
      ]}
      fields={[
        {
          key: "name",
          label: "Name",
          type: "text",
          required: true,
          placeholder: "Suraj Pandit",
        },
        {
          key: "role",
          label: "Role",
          type: "text",
          required: true,
          placeholder: "Senior Faculty",
        },
        {
          key: "subject",
          label: "Subject / Specialization",
          type: "text",
          required: true,
          placeholder: "Nepal Police Coaching",
        },
        {
          key: "initials",
          label: "Initials (avatar)",
          type: "text",
          placeholder: "SP (auto-derived if empty)",
        },
        { key: "order", label: "Display Order", type: "number", placeholder: "1" },
      ]}
    />
  );
}
