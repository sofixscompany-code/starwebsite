import { FirestoreModulePage } from "@/components/admin/FirestoreModulePage";
import { Bell, Calendar } from "lucide-react";

export default function CommunicationNoticesPage() {
  return (
    <FirestoreModulePage
      collectionName="notices"
      title="Communication Notices"
      subtitle="Publish notices and announcements for students, parents, and staff"
      columns={[
        { key: "title", label: "Title" },
        { key: "body", label: "Body" },
        { key: "category", label: "Category" },
        { key: "isPublished", label: "Published" },
        { key: "publishedAt", label: "Published At" },
      ]}
      fields={[
        { key: "title", label: "Title", type: "text", required: true },
        { key: "body", label: "Body", type: "textarea" },
        {
          key: "category",
          label: "Category",
          type: "select",
          options: [
            { value: "Exam", label: "Exam" },
            { value: "Admission", label: "Admission" },
            { value: "Scholarship", label: "Scholarship" },
            { value: "Fees", label: "Fees" },
            { value: "Event", label: "Event" },
            { value: "General", label: "General" },
          ],
        },
        { key: "isPublished", label: "Published", type: "checkbox" },
        { key: "publishedAt", label: "Published At", type: "text" },
      ]}
    />
  );
}
