import { createFileRoute } from "@tanstack/react-router";
import { ModulePage } from "@/components/admin/ModulePage";
import { FileBadge, Radio, Database, Sparkles } from "lucide-react";

export const Route = createFileRoute("/_authenticated/admin/exams")({
  component: () => (
    <ModulePage
      title="Examinations"
      subtitle="Create · schedule · publish results."
      addLabel="Add"
      stats={[
    { label: "Upcoming", value: 12, icon: FileBadge },
    { label: "Live", value: 3, icon: Radio, tone: "warning" },
    { label: "Question bank", value: "8,241", icon: Database },
    { label: "Auto-graded", value: "94%", icon: Sparkles, tone: "success" }
      ]}
      columns={[
    { key: "name", label: "Exam" },
    { key: "course", label: "Course" },
    { key: "date", label: "Date" },
    { key: "questions", label: "Qs" },
    { key: "marks", label: "Marks" },
    { key: "attempts", label: "Attempts" },
    { key: "status", label: "Status" }
      ]}
      rows={[
    {"id":"1","name":"IOE Mock #14","course":"Nepal Police","date":"2024-10-10","questions":"100","marks":"100","attempts":"42","status":"Scheduled"},
    {"id":"2","name":"Loksewa Prelim","course":"Loksewa","date":"2024-10-12","questions":"150","marks":"150","attempts":"28","status":"Scheduled"},
    {"id":"3","name":"Bank Reasoning","course":"Bank PO","date":"2024-10-08","questions":"60","marks":"60","attempts":"30","status":"Completed"},
    {"id":"4","name":"APF Fitness Theory","course":"APF","date":"2024-10-15","questions":"80","marks":"80","attempts":"0","status":"Scheduled"}
      ]}
    />
  ),
});
