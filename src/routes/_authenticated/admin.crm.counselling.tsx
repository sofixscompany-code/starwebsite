import { createFileRoute } from "@tanstack/react-router";
import { ModulePage } from "@/components/admin/ModulePage";
import { MessageSquare, UserCog, GraduationCap, Clock } from "lucide-react";

export const Route = createFileRoute("/_authenticated/admin/crm/counselling")({
  component: () => (
    <ModulePage
      title="Counselling"
      subtitle="Career guidance sessions."
      addLabel="Add"
      stats={[
    { label: "Sessions", value: 64, icon: MessageSquare },
    { label: "Counsellors", value: 4, icon: UserCog },
    { label: "Enrolled", value: 28, icon: GraduationCap, tone: "success" },
    { label: "Pending", value: 10, icon: Clock, tone: "warning" }
      ]}
      columns={[
    { key: "student", label: "Student" },
    { key: "counsellor", label: "Counsellor" },
    { key: "topic", label: "Topic" },
    { key: "when", label: "When" },
    { key: "mode", label: "Mode" },
    { key: "status", label: "Status" }
      ]}
      rows={[
    {"id":"1","student":"Aarav Sharma","counsellor":"Kabita S.","topic":"Course selection","when":"Today 3 PM","mode":"In-person","status":"Scheduled"},
    {"id":"2","student":"Priya Karki","counsellor":"Ram B. K.C.","topic":"Career path","when":"Tomorrow","mode":"Video","status":"Scheduled"}
      ]}
    />
  ),
});
