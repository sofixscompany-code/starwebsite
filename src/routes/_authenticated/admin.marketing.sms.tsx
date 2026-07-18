import { ModulePage } from "@/components/admin/ModulePage";
import { Send, CheckCircle2, XCircle, Wallet } from "lucide-react";

export function SMSPage() {
  return (
    <ModulePage
      title="SMS Campaigns"
      subtitle="Send bulk SMS messages and track delivery"
      stats={[
        { label: "Total Sent", value: "12.6k", icon: Send, tone: "purple" },
        { label: "Delivered", value: "12.1k", icon: CheckCircle2, tone: "success" },
        { label: "Failed", value: 180, icon: XCircle, tone: "danger" },
        { label: "Cost", value: "₹6,300", icon: Wallet, tone: "info" },
      ]}
      columns={[
        { key: "name", label: "Campaign" },
        { key: "recipients", label: "Recipients" },
        { key: "sent", label: "Sent" },
        { key: "status", label: "Status" },
      ]}
      rows={[
        { name: "Attendance Alert – Jan 15", recipients: 860, sent: "Jan 15", status: "Delivered" },
        { name: "Fee Due Reminder", recipients: 320, sent: "Jan 14", status: "Delivered" },
        { name: "Parent-Teacher Meeting", recipients: 1200, sent: "Jan 20", status: "Scheduled" },
        { name: "Emergency – Branch Closed", recipients: 1240, sent: "—", status: "Draft" },
      ]}
    />
  );
}
