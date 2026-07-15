import { createFileRoute } from "@tanstack/react-router";
import { ModulePage } from "@/components/admin/ModulePage";
import { PenSquare, CheckCircle2, Clock, AlertCircle } from "lucide-react";

export const Route = createFileRoute("/_authenticated/admin/homework")({
  component: () => (
    <ModulePage
      title="Homework"
      subtitle="Assigned, submitted & pending evaluation."
      addLabel="Add"
      stats={[
    { label: "Active", value: 48, icon: PenSquare },
    { label: "Submitted", value: 312, icon: CheckCircle2 },
    { label: "Pending review", value: 64, icon: Clock },
    { label: "Late", value: 12, icon: AlertCircle, tone: "danger" }
      ]}
      columns={[
    { key: "title", label: "Title" },
    { key: "course", label: "Course" },
    { key: "assigned", label: "Assigned" },
    { key: "due", label: "Due" },
    { key: "subs", label: "Submissions" },
    { key: "status", label: "Status" }
      ]}
      rows={[
    {"id":"1","title":"Constitution essay","course":"Loksewa","assigned":"2024-10-01","due":"2024-10-05","subs":"28/32","status":"Active"},
    {"id":"2","title":"Math worksheet #12","course":"Nepal Police","assigned":"2024-10-02","due":"2024-10-04","subs":"42/45","status":"Active"},
    {"id":"3","title":"Grammar test","course":"Bank PO","assigned":"2024-10-01","due":"2024-10-03","subs":"30/30","status":"Completed"},
    {"id":"4","title":"Current affairs quiz","course":"APF","assigned":"2024-10-02","due":"2024-10-06","subs":"18/40","status":"Active"}
      ]}
    />
  ),
});
