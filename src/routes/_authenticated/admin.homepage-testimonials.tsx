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
        { key: "quote", label: "Quote" },
        { key: "name", label: "Student Name" },
        { key: "result", label: "Result" },
        { key: "order", label: "Order" },
      ]}
      fields={[
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
