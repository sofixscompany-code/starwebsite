import { FirestoreModulePage } from "@/components/admin/FirestoreModulePage";
import { Image as ImageIcon, Camera, Images, Eye } from "lucide-react";

export function GalleryManagerPage() {
  return (
    <FirestoreModulePage
      collectionName="gallery"
      title="Gallery"
      subtitle="Photos shown on the public Photo Gallery page — paste image URLs"
      stats={[
        { label: "Photos", value: 0, icon: Camera, tone: "purple" },
        { label: "Public Page", value: 1, icon: Eye, tone: "success" },
      ]}
      columns={[
        { key: "title", label: "Title" },
        { key: "category", label: "Category" },
        { key: "status", label: "Status" },
      ]}
      fields={[
        {
          key: "url",
          label: "Image URL",
          type: "text",
          required: true,
          placeholder: "https://... (paste a hosted image link)",
        },
        {
          key: "title",
          label: "Caption",
          type: "text",
          required: true,
          placeholder: "Nepal Police physical training",
        },
        {
          key: "category",
          label: "Category",
          type: "text",
          placeholder: "Training / Campus / Exams / Events",
        },
        { key: "order", label: "Display Order", type: "number", placeholder: "1" },
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
      rows={[
        {
          title: "Nepal Police physical training",
          url: "",
          category: "Training",
          status: "Active",
        },
        {
          title: "Classroom in session",
          url: "",
          category: "Campus",
          status: "Active",
        },
        {
          title: "Result celebration",
          url: "",
          category: "Events",
          status: "Active",
        },
      ]}
    />
  );
}
