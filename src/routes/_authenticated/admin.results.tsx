import { createFileRoute } from "@tanstack/react-router";
import { ModulePage } from "@/components/admin/ModulePage";
import { Trophy, TrendingUp, Award, Clock } from "lucide-react";

export const Route = createFileRoute("/_authenticated/admin/results")({
  component: () => (
    <ModulePage
      title="Results"
      subtitle="Merit lists · ranks · publications."
      addLabel="Add"
      stats={[
    { label: "Published", value: 24, icon: Trophy },
    { label: "Avg %", value: "72%", icon: TrendingUp },
    { label: "Toppers", value: 18, icon: Award, tone: "success" },
    { label: "Pending", value: 6, icon: Clock, tone: "warning" }
      ]}
      columns={[
    { key: "exam", label: "Exam" },
    { key: "course", label: "Course" },
    { key: "date", label: "Date" },
    { key: "appeared", label: "Appeared" },
    { key: "passed", label: "Passed" },
    { key: "topper", label: "Topper" },
    { key: "status", label: "Status" }
      ]}
      rows={[
    {"id":"1","exam":"IOE Mock #13","course":"Nepal Police","date":"2024-09-25","appeared":"45","passed":"38","topper":"Aarav S.","status":"Completed"},
    {"id":"2","exam":"Bank Reasoning","course":"Bank PO","date":"2024-10-08","appeared":"30","passed":"28","topper":"Sita R.","status":"Completed"},
    {"id":"3","exam":"Loksewa Prelim","course":"Loksewa","date":"2024-09-28","appeared":"32","passed":"24","topper":"Anisha M.","status":"Completed"}
      ]}
    />
  ),
});
