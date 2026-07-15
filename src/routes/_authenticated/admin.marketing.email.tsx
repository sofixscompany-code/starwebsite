import { createFileRoute } from "@tanstack/react-router";
import { ModulePage } from "@/components/admin/ModulePage";
import { Mail, TrendingUp, MousePointer, AlertCircle } from "lucide-react";

export const Route = createFileRoute("/_authenticated/admin/marketing/email")({
  component: () => (
    <ModulePage
      title="Email Campaigns"
      subtitle="Newsletters · transactional email."
      addLabel="Add"
      stats={[
    { label: "Sent MTD", value: "18,412", icon: Mail },
    { label: "Open rate", value: "42%", icon: TrendingUp, tone: "success" },
    { label: "Clicks", value: "8.4%", icon: MousePointer, tone: "info" },
    { label: "Bounces", value: "1.2%", icon: AlertCircle, tone: "warning" }
      ]}
      columns={[
    { key: "name", label: "Campaign" },
    { key: "subject", label: "Subject" },
    { key: "audience", label: "Audience" },
    { key: "sent", label: "Sent" },
    { key: "opens", label: "Opens" },
    { key: "status", label: "Status" }
      ]}
      rows={[
    {"id":"1","name":"October newsletter","subject":"What's happening this month","audience":"All","sent":"4,200","opens":"1,764","status":"Completed"},
    {"id":"2","name":"Scholarship announcement","subject":"Merit scholarship deadline","audience":"Students","sent":"1,284","opens":"642","status":"Completed"}
      ]}
    />
  ),
});
