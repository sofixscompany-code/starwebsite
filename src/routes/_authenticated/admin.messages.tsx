import { FirestoreModulePage } from "@/components/admin/FirestoreModulePage";
import { Mail, MessageSquare } from "lucide-react";

export default function MessagesPage() {
  return (
    <FirestoreModulePage
      collectionName="messages"
      title="Messages"
      subtitle="Internal messaging across roles"
      stats={[
        { label: "Messages", value: 0, icon: Mail, tone: "info" },
        { label: "Unread", value: 0, icon: MessageSquare, tone: "warning" },
      ]}
      columns={[
        { key: "from", label: "From" },
        { key: "to", label: "To" },
        { key: "subject", label: "Subject" },
        { key: "status", label: "Status" },
      ]}
      fields={[
        { key: "from", label: "From", type: "text", required: true, placeholder: "Admin" },
        {
          key: "to",
          label: "To",
          type: "text",
          required: true,
          placeholder: "teacher@demo.starcoaching.edu.np",
        },
        {
          key: "subject",
          label: "Subject",
          type: "text",
          required: true,
          placeholder: "Test schedule",
        },
        { key: "body", label: "Body", type: "textarea", placeholder: "Message content..." },
        {
          key: "status",
          label: "Status",
          type: "select",
          options: [
            { value: "Sent", label: "Sent" },
            { value: "Read", label: "Read" },
            { value: "Draft", label: "Draft" },
          ],
        },
      ]}
    />
  );
}
