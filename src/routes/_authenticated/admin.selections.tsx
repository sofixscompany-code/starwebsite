import { FirestoreModulePage } from "@/components/admin/FirestoreModulePage";
import { Award, Star, Trophy, Users } from "lucide-react";

const TAG_OPTIONS = [
  { value: "Selected", label: "Selected" },
  { value: "Madhesh Province Topper", label: "Madhesh Province Topper" },
  { value: "Bagmati Province Topper", label: "Bagmati Province Topper" },
  { value: "Province Topper", label: "Province Topper" },
];

export function SelectionsPage() {
  return (
    <FirestoreModulePage
      collectionName="selections"
      title="Top Selections"
      subtitle="Students shown in the homepage Top Selections section and public Results page"
      stats={[
        { label: "Total Selections", value: 16, icon: Trophy, tone: "purple" },
        { label: "Toppers", value: 3, icon: Award, tone: "warning" },
        { label: "Homepage Shown", value: 12, icon: Star, tone: "info" },
        { label: "This Year", value: 16, icon: Users, tone: "success" },
      ]}
      columns={[
        { key: "name", label: "Student Name" },
        { key: "post", label: "Post / Program" },
        { key: "tag", label: "Tag" },
        { key: "order", label: "Display Order" },
      ]}
      fields={[
        { key: "name", label: "Student Name", type: "text", required: true },
        {
          key: "post",
          label: "Post / Program",
          type: "text",
          required: true,
          placeholder: "e.g. Staff Nurse, Civil Engineering, Nepal Police",
        },
        { key: "tag", label: "Tag", type: "select", options: TAG_OPTIONS },
        {
          key: "order",
          label: "Display Order (1 = first)",
          type: "number",
          placeholder: "1",
        },
      ]}
    />
  );
}
