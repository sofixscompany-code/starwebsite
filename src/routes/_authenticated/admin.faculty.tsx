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
        {
          key: "photoUrl",
          label: "Photo",
          sortable: false,
          render: (row) =>
            row.photoUrl ? (
              <img
                src={row.photoUrl}
                alt={row.name ?? ""}
                className="w-10 h-10 rounded-full object-cover border"
              />
            ) : (
              <div className="w-10 h-10 rounded-full bg-navy/10 flex items-center justify-center text-xs font-bold text-navy">
                {row.initials || (row.name ?? "").slice(0, 2).toUpperCase()}
              </div>
            ),
        },
        { key: "name", label: "Name" },
        { key: "role", label: "Role" },
        { key: "subject", label: "Subject" },
        { key: "order", label: "Order" },
      ]}
      fields={[
        {
          key: "photoUrl",
          label: "Photo",
          type: "upload",
          uploadFolder: "faculty",
          required: false,
          placeholder: "Upload a photo or paste an image URL",
        },
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
