import { ModulePage } from "@/components/admin/ModulePage";
import { Mail, TrendingUp, MousePointer, AlertCircle } from "lucide-react";

export function EmailPage() {
  return (
    <ModulePage
      title="Email Campaigns"
      subtitle="Create and track email marketing campaigns"
      stats={[
        { label: "Total Sent", value: "8.4k", icon: Mail, tone: "purple" },
        { label: "Open Rate", value: "42%", icon: TrendingUp, tone: "success" },
        { label: "Click Rate", value: "18%", icon: MousePointer, tone: "info" },
        { label: "Bounced", value: 24, icon: AlertCircle, tone: "warning" },
      ]}
      columns={[
        { key: "name", label: "Campaign" },
        { key: "recipients", label: "Recipients" },
        { key: "sent", label: "Sent" },
        { key: "status", label: "Status" },
      ]}
      rows={[
        { name: "New Year Admission Drive", recipients: 2400, sent: "Jan 10", status: "Sent" },
        { name: "Exam Schedule Reminder", recipients: 1200, sent: "Jan 14", status: "Sent" },
        { name: "Republic Day Offer", recipients: 3000, sent: "Jan 26", status: "Scheduled" },
        { name: "Monthly Newsletter – Jan", recipients: 1800, sent: "—", status: "Draft" },
      ]}
    />
  );
}
