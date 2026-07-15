import { createFileRoute } from "@tanstack/react-router";
import { ModulePage } from "@/components/admin/ModulePage";
import { Radio, Calendar, PlayCircle, CheckCircle2 } from "lucide-react";

export const Route = createFileRoute("/_authenticated/admin/live")({
  component: () => (
    <ModulePage
      title="Live Classes"
      subtitle="Zoom · Google Meet · Jitsi"
      addLabel="Add"
      stats={[
    { label: "Today", value: 8, icon: Radio },
    { label: "Upcoming", value: 23, icon: Calendar },
    { label: "Recorded", value: 412, icon: PlayCircle },
    { label: "Attendance avg", value: "89%", icon: CheckCircle2 }
      ]}
      columns={[
    { key: "title", label: "Class" },
    { key: "teacher", label: "Teacher" },
    { key: "course", label: "Course" },
    { key: "when", label: "Scheduled" },
    { key: "platform", label: "Platform" },
    { key: "status", label: "Status" }
      ]}
      rows={[
    {"id":"1","title":"Constitution — Part 1","teacher":"Kabita Shrestha","course":"Loksewa","when":"Today 4:00 PM","platform":"Zoom","status":"Scheduled"},
    {"id":"2","title":"Reasoning drill","teacher":"Bishal Rai","course":"Nepal Police","when":"Today 6:00 PM","platform":"Google Meet","status":"Scheduled"},
    {"id":"3","title":"GK current affairs","teacher":"Ram Bahadur K.C.","course":"APF","when":"Tomorrow 10 AM","platform":"Zoom","status":"Scheduled"},
    {"id":"4","title":"English grammar","teacher":"Sunita Neupane","course":"Bank PO","when":"Tomorrow 2 PM","platform":"Jitsi","status":"Scheduled"},
    {"id":"5","title":"Mock discussion","teacher":"Prakash Adhikari","course":"Nepal Army","when":"Fri 5 PM","platform":"Zoom","status":"Scheduled"}
      ]}
    />
  ),
});
