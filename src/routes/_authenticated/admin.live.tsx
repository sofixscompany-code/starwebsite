import { ModulePage } from "@/components/admin/ModulePage";
import { Radio, Calendar, PlayCircle, CheckCircle2 } from "lucide-react";

export function LiveClassesPage() {
  return (
    <ModulePage
      title="Live Classes"
      subtitle="Schedule and manage live online class sessions"
      stats={[
        { label: "Total Sessions", value: 246, icon: Radio, tone: "purple" },
        { label: "Upcoming", value: 12, icon: Calendar, tone: "info" },
        { label: "Recordings", value: 180, icon: PlayCircle, tone: "success" },
        { label: "Completed", value: 210, icon: CheckCircle2, tone: "success" },
      ]}
      columns={[
        { key: "name", label: "Class" },
        { key: "teacher", label: "Teacher" },
        { key: "date", label: "Date" },
        { key: "status", label: "Status" },
      ]}
      rows={[
        { name: "JEE Advanced – Thermodynamics", teacher: "Dr. Mehta", date: "2024-01-16 10:00", status: "Upcoming" },
        { name: "NEET – Human Biology", teacher: "Ms. Kapoor", date: "2024-01-15 14:00", status: "Completed" },
        { name: "Class 12 – Calculus", teacher: "Mr. Verma", date: "2024-01-15 09:00", status: "Recorded" },
        { name: "Foundation – Atomic Structure", teacher: "Dr. Mehta", date: "2024-01-14 11:00", status: "Recorded" },
      ]}
    />
  );
}
