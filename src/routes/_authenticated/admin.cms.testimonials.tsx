import { createFileRoute } from "@tanstack/react-router";
import { ModulePage } from "@/components/admin/ModulePage";
import { Star, PlayCircle, Award, Clock } from "lucide-react";

export const Route = createFileRoute("/_authenticated/admin/cms/testimonials")({
  component: () => (
    <ModulePage
      title="Testimonials"
      subtitle="Student & parent stories."
      addLabel="Add"
      stats={[
    { label: "Total", value: 142, icon: Star },
    { label: "Video", value: 28, icon: PlayCircle },
    { label: "Featured", value: 12, icon: Award, tone: "success" },
    { label: "Pending", value: 4, icon: Clock, tone: "warning" }
      ]}
      columns={[
    { key: "name", label: "Student" },
    { key: "course", label: "Course" },
    { key: "rating", label: "Rating" },
    { key: "short", label: "Quote" },
    { key: "date", label: "Date" },
    { key: "status", label: "Status" }
      ]}
      rows={[
    {"id":"1","name":"Aarav Sharma","course":"Nepal Police","rating":"5","short":"'Star helped me clear in first attempt.'","date":"2024-09-30","status":"Active"},
    {"id":"2","name":"Priya Karki","course":"Loksewa","rating":"5","short":"'Great teachers and mock tests.'","date":"2024-09-28","status":"Active"}
      ]}
    />
  ),
});
