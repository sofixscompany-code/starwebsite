import { FirestoreModulePage } from "@/components/admin/FirestoreModulePage";
import { Camera, Images, Eye } from "lucide-react";

export function GalleryManagerPage() {
  return (
    <FirestoreModulePage
      collectionName="gallery"
      title="Gallery"
      subtitle="Photos shown on the public Photo Gallery page — upload from device or paste an image URL"
      stats={[
        { label: "Photos", value: 0, icon: Camera, tone: "purple" },
        { label: "Public Page", value: 1, icon: Eye, tone: "success" },
      ]}
      columns={[
        {
          key: "url",
          label: "Image",
          sortable: false,
          render: (row) =>
            row.url ? (
              <img
                src={row.url}
                alt={row.title ?? ""}
                className="w-14 h-10 rounded-md object-cover border"
              />
            ) : (
              <Images className="w-5 h-5 text-gray-300" />
            ),
        },
        { key: "title", label: "Caption" },
        { key: "category", label: "Category" },
        { key: "status", label: "Status" },
      ]}
      fields={[
        {
          key: "url",
          label: "Image",
          type: "upload",
          uploadFolder: "gallery",
          required: true,
          placeholder: "Upload or paste a hosted image URL",
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
