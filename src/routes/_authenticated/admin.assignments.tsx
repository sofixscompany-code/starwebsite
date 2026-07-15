import { createFileRoute } from "@tanstack/react-router";
import { ModulePage } from "@/components/admin/ModulePage";
import { FileText, Award, TrendingUp, AlertCircle } from "lucide-react";

export const Route = createFileRoute("/_authenticated/admin/assignments")({
  component: () => (
    <ModulePage
      title="Assignments"
      subtitle="Long-form submissions & grading."
      addLabel="Add"
      stats={[
    { label: "Open", value: 24, icon: FileText },
    { label: "Graded", value: 186, icon: Award },
    { label: "Avg score", value: "78%", icon: TrendingUp },
    { label: "Delayed", value: 9, icon: AlertCircle, tone: "warning" }
      ]}
      columns={[
    { key: "title", label: "Assignment" },
    { key: "course", label: "Course" },
    { key: "due", label: "Due" },
    { key: "subs", label: "Submissions" },
    { key: "avg", label: "Avg score" },
    { key: "status", label: "Status" }
      ]}
      rows={[
    {"id":"1","title":"Research paper — Federalism","course":"Loksewa","due":"2024-10-12","subs":"22/28","avg":"81%","status":"Active"},
    {"id":"2","title":"Case study — Police reforms","course":"Nepal Police","due":"2024-10-15","subs":"30/45","avg":"74%","status":"Active"},
    {"id":"3","title":"Financial analysis","course":"Bank PO","due":"2024-10-08","subs":"30/30","avg":"88%","status":"Completed"}
      ]}
    />
  ),
});
