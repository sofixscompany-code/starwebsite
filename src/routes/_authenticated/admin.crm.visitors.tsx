import { createFileRoute } from "@tanstack/react-router";
import { ModulePage } from "@/components/admin/ModulePage";
import { UserPlus, Users, GraduationCap, Clock } from "lucide-react";

export const Route = createFileRoute("/_authenticated/admin/crm/visitors")({
  component: () => (
    <ModulePage
      title="Visitors"
      subtitle="Walk-in log."
      addLabel="Add"
      stats={[
    { label: "Today", value: 32, icon: UserPlus },
    { label: "This week", value: 186, icon: Users },
    { label: "Enrolled", value: 24, icon: GraduationCap, tone: "success" },
    { label: "Follow-ups", value: 48, icon: Clock, tone: "warning" }
      ]}
      columns={[
    { key: "time", label: "Time" },
    { key: "name", label: "Visitor" },
    { key: "from", label: "City" },
    { key: "purpose", label: "Purpose" },
    { key: "staff", label: "Staff" },
    { key: "status", label: "Status" }
      ]}
      rows={[
    {"id":"1","time":"09:12 AM","name":"Ram Prasad B.","from":"Kathmandu","purpose":"Course info","staff":"Suman","status":"Completed"},
    {"id":"2","time":"10:20 AM","name":"Kiran Basnet","from":"Lalitpur","purpose":"Fee","staff":"Reception","status":"Completed"}
      ]}
    />
  ),
});
