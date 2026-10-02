import { FirestoreModulePage } from "@/components/admin/FirestoreModulePage";
import { useModuleData } from "@/hooks/use-module-data";
import { Mail, MessageSquare } from "lucide-react";

export default function MessagesPage() {
  const { rows } = useModuleData("messages");

  const total = rows.length;
  // A message counts as unread once it has been sent but not yet read.
  const unread = rows.filter((r) => {
    const s = String(r.status ?? "");
    return s !== "Read" && s !== "Draft";
  }).length;

  return (
    <FirestoreModulePage
      collectionName="messages"
      title="Messages"
      subtitle="Internal messaging across roles"
      stats={[
        { label: "Messages", value: total, icon: Mail, tone: "info" },
        { label: "Unread", value: unread, icon: MessageSquare, tone: "warning" },
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
