import { FirestoreModulePage } from "@/components/admin/FirestoreModulePage";
import { BookOpen, Layers, Hash } from "lucide-react";

export function HomepageCategoriesPage() {
  return (
    <FirestoreModulePage
      collectionName="homepage_categories"
      title="Homepage Course Categories"
      subtitle="Course category cards shown on the homepage under 'What you can prepare for'"
      stats={[
        { label: "Categories", value: 6, icon: Layers, tone: "purple" },
        { label: "Homepage Grid", value: 1, icon: BookOpen, tone: "info" },
      ]}
      columns={[
        { key: "title", label: "Title" },
        { key: "desc", label: "Description" },
        { key: "icon", label: "Icon" },
        { key: "color", label: "Color Class" },
        { key: "order", label: "Order" },
      ]}
      fields={[
        {
          key: "title",
          label: "Title",
          type: "text",
          required: true,
          placeholder: "Security Forces",
        },
        {
          key: "desc",
          label: "Description",
          type: "text",
          required: true,
          placeholder: "Nepal Police · Army · Armed Police",
        },
        {
          key: "icon",
          label: "Icon Name",
          type: "select",
          required: true,
          options: [
            { value: "ShieldCheck", label: "ShieldCheck" },
            { value: "Stethoscope", label: "Stethoscope" },
            { value: "Wrench", label: "Wrench" },
            { value: "Monitor", label: "Monitor" },
            { value: "GraduationCap", label: "GraduationCap" },
            { value: "BookOpen", label: "BookOpen" },
            { value: "Award", label: "Award" },
            { value: "Trophy", label: "Trophy" },
          ],
        },
        {
          key: "color",
          label: "Color Class",
          type: "select",
          options: [
            { value: "bg-blue-50 text-navy", label: "Blue" },
            { value: "bg-red-50 text-brand-red", label: "Red" },
            { value: "bg-emerald-50 text-emerald-700", label: "Green" },
            { value: "bg-amber-50 text-amber-700", label: "Amber" },
            { value: "bg-indigo-50 text-indigo-700", label: "Indigo" },
            { value: "bg-purple-50 text-purple-700", label: "Purple" },
          ],
        },
        { key: "order", label: "Display Order", type: "number", placeholder: "1" },
      ]}
    />
  );
}
