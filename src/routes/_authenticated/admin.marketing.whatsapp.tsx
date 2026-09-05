import { FirestoreModulePage } from "@/components/admin/FirestoreModulePage";
import { MessageCircle, Send } from "lucide-react";

export default function WhatsAppPage() {
  return (
    <FirestoreModulePage
      collectionName="whatsapp_campaigns"
      title="WhatsApp Campaigns"
      subtitle="Send and track WhatsApp broadcast campaigns"
      stats={[
        { label: "Campaigns", value: 0, icon: MessageCircle, tone: "success" },
        { label: "Portal", value: "Marketing", icon: Send, tone: "info" },
      ]}
      columns={[
        { key: "name", label: "Campaign" },
        { key: "recipients", label: "Recipients" },
        { key: "delivered", label: "Delivered" },
        { key: "status", label: "Status" },
      ]}
      fields={[
        {
          key: "name",
          label: "Campaign Name",
          type: "text",
          required: true,
          placeholder: "Admission Open 2083",
        },
        {
          key: "message",
          label: "Message",
          type: "textarea",
          placeholder: "WhatsApp broadcast text...",
        },
        { key: "recipients", label: "Recipients", type: "number", placeholder: "1200" },
        { key: "delivered", label: "Delivered", type: "number", placeholder: "0" },
        {
          key: "status",
          label: "Status",
          type: "select",
          options: [
            { value: "Draft", label: "Draft" },
            { value: "Sent", label: "Sent" },
            { value: "Scheduled", label: "Scheduled" },
          ],
        },
      ]}
    />
  );
}
