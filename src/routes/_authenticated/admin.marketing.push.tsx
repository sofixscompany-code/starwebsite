import { ModulePage } from "@/components/admin/ModulePage";
import { Bell, CheckCircle2, MousePointer, Smartphone } from "lucide-react";

export function PushPage() {
  return (
    <ModulePage
      title="Push Notifications"
      subtitle="Send and manage push notifications to students and parents"
      stats={[
        { label: "Total Sent", value: "5.2k", icon: Bell, tone: "purple" },
        { label: "Delivered", value: "4.9k", icon: CheckCircle2, tone: "success" },
        { label: "Click Rate", value: "32%", icon: MousePointer, tone: "info" },
        { label: "Subscribed", value: 1080, icon: Smartphone, tone: "success" },
      ]}
      columns={[
        { key: "name", label: "Notification" },
        { key: "audience", label: "Audience" },
        { key: "sent", label: "Sent" },
        { key: "status", label: "Status" },
      ]}
      rows={[
        { name: "Exam Timetable Released", audience: "All Students", sent: "Jan 15", status: "Sent" },
        { name: "Fee Payment Reminder", audience: "Parents", sent: "Jan 14", status: "Sent" },
        { name: "Holiday Notice – Jan 26", audience: "All Users", sent: "Jan 25", status: "Scheduled" },
        { name: "New Batch Enrollment Open", audience: "Leads", sent: "—", status: "Draft" },
      ]}
    />
  );
}
