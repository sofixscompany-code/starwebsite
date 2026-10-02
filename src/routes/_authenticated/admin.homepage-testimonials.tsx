import { FirestoreModulePage } from "@/components/admin/FirestoreModulePage";
import { MessageSquareQuote, Quote, Users } from "lucide-react";

export function HomepageTestimonialsPage() {
  return (
    <FirestoreModulePage
      collectionName="homepage_testimonials"
      title="Testimonials"
      subtitle="Student testimonials shown in the Testimonials section of the homepage"
      stats={[
        { label: "Testimonials", value: 3, icon: Quote, tone: "purple" },
        { label: "Homepage Section", value: 1, icon: MessageSquareQuote, tone: "info" },
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
                {(row.name ?? "ST").slice(0, 2).toUpperCase()}
              </div>
            ),
        },
        { key: "quote", label: "Quote" },
        { key: "name", label: "Student Name" },
        { key: "result", label: "Result" },
        { key: "order", label: "Order" },
      ]}
      fields={[
        {
          key: "photoUrl",
          label: "Photo",
          type: "upload",
          uploadFolder: "testimonials",
          required: false,
          placeholder: "Upload a photo or paste an image URL",
        },
        {
          key: "quote",
          label: "Quote",
          type: "textarea",
          required: true,
          placeholder: "What the student says...",
        },
        {
          key: "name",
          label: "Student Name",
          type: "text",
          required: true,
          placeholder: "Dipesh Sahani",
        },
        {
          key: "result",
          label: "Result / Post",
          type: "text",
          required: true,
          placeholder: "Nepal Police",
        },
        { key: "order", label: "Display Order", type: "number", placeholder: "1" },
      ]}
    />
  );
}
