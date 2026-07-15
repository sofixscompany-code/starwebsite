import { createFileRoute } from "@tanstack/react-router";
import { ModulePage } from "@/components/admin/ModulePage";
import { Send, CheckCircle2, XCircle, Wallet } from "lucide-react";

export const Route = createFileRoute("/_authenticated/admin/marketing/sms")({
  component: () => (
    <ModulePage
      title="SMS Campaigns"
      subtitle="Bulk SMS via Twilio · templates & DLR."
      addLabel="Add"
      stats={[
    { label: "Sent MTD", value: "24,812", icon: Send },
    { label: "Delivered", value: "96%", icon: CheckCircle2, tone: "success" },
    { label: "Failed", value: 984, icon: XCircle, tone: "danger" },
    { label: "Credits", value: "4,120", icon: Wallet, tone: "warning" }
      ]}
      columns={[
    { key: "name", label: "Campaign" },
    { key: "audience", label: "Audience" },
    { key: "msg", label: "Message" },
    { key: "sent", label: "Sent" },
    { key: "dlvd", label: "Delivered" },
    { key: "status", label: "Status" }
      ]}
      rows={[
    {"id":"1","name":"Sept fee reminder","audience":"All parents","msg":"Fee due 30 Sept…","sent":"942","dlvd":"912","status":"Completed"},
    {"id":"2","name":"New batch launch","audience":"Leads","msg":"New Nepal Police batch…","sent":"142","dlvd":"138","status":"Completed"},
    {"id":"3","name":"Result published","audience":"Students","msg":"Check your Loksewa result…","sent":"486","dlvd":"480","status":"Completed"}
      ]}
    />
  ),
});
