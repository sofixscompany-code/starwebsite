import { ModulePage } from "@/components/admin/ModulePage";
import { MessageSquare, UserCog, GraduationCap, Clock } from "lucide-react";

export function CounsellingPage() {
  return (
    <ModulePage
      title="Counselling"
      subtitle="Student counselling sessions and mentor assignments"
      stats={[
        { label: "Total Sessions", value: 156, icon: MessageSquare, tone: "purple" },
        { label: "Counsellors", value: 8, icon: UserCog, tone: "info" },
        { label: "Students Guided", value: 134, icon: GraduationCap, tone: "success" },
        { label: "Pending Reviews", value: 12, icon: Clock, tone: "warning" },
      ]}
      columns={[
        { key: "name", label: "Student" },
        { key: "counsellor", label: "Counsellor" },
        { key: "topic", label: "Topic" },
        { key: "status", label: "Status" },
      ]}
      rows={[
        { name: "Rohan Verma", counsellor: "Dr. Sharma", topic: "Career Guidance", status: "Completed" },
        { name: "Nisha Agarwal", counsellor: "Ms. Kapoor", topic: "Study Plan", status: "Scheduled" },
        { name: "Karan Mehta", counsellor: "Dr. Sharma", topic: "Exam Stress", status: "Completed" },
        { name: "Ananya Reddy", counsellor: "Mr. Joshi", topic: "Course Selection", status: "Pending" },
      ]}
    />
  );
}
