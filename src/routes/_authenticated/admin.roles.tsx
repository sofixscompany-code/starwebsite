import { FirestoreModulePage } from "@/components/admin/FirestoreModulePage";
import { ShieldCheck, Users } from "lucide-react";

export default function RolesPage() {
  return (
    <FirestoreModulePage
      collectionName="roles"
      title="Roles"
      subtitle="Manage system roles and their scope"
      stats={[
        { label: "Roles", value: 0, icon: ShieldCheck, tone: "purple" },
        { label: "Portal", value: "Admin", icon: Users, tone: "info" },
      ]}
      columns={[
        { key: "name", label: "Role" },
        { key: "description", label: "Description" },
        { key: "status", label: "Status" },
      ]}
      fields={[
        { key: "name", label: "Role Name", type: "text", required: true, placeholder: "Librarian" },
        {
          key: "description",
          label: "Description",
          type: "textarea",
          placeholder: "What this role can do",
        },
        {
          key: "status",
          label: "Status",
          type: "select",
          options: [
            { value: "Active", label: "Active" },
            { value: "Inactive", label: "Inactive" },
          ],
        },
      ]}
    />
  );
}
