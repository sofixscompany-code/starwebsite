import { FirestoreModulePage } from "@/components/admin/FirestoreModulePage";
import { useModuleData } from "@/hooks/use-module-data";
import { Radio, Calendar, PlayCircle, CheckCircle2 } from "lucide-react";

export function LiveClassesPage() {
  const { rows } = useModuleData("live_classes");

  const total = rows.length;
  const upcoming = rows.filter((r) => String(r.status ?? "") === "Upcoming").length;
  const recorded = rows.filter((r) => String(r.status ?? "") === "Recorded").length;
  const completed = rows.filter((r) => String(r.status ?? "") === "Completed").length;

  return (
    <FirestoreModulePage
      collectionName="live_classes"
      title="Live Classes"
      subtitle="Schedule and manage live online class sessions"
      stats={[
        { label: "Total Sessions", value: total, icon: Radio, tone: "purple" },
        { label: "Upcoming", value: upcoming, icon: Calendar, tone: "info" },
        { label: "Recorded", value: recorded, icon: PlayCircle, tone: "success" },
        { label: "Completed", value: completed, icon: CheckCircle2, tone: "success" },
      ]}
      columns={[
        { key: "name", label: "Class" },
        { key: "teacher", label: "Teacher" },
        { key: "date", label: "Date" },
        { key: "status", label: "Status" },
      ]}
      rows={[
        {
          name: "JEE Advanced – Thermodynamics",
          teacher: "Dr. Mehta",
          date: "2024-01-16 10:00",
          status: "Upcoming",
        },
        {
          name: "NEET – Human Biology",
          teacher: "Ms. Kapoor",
          date: "2024-01-15 14:00",
          status: "Completed",
        },
        {
          name: "Class 12 – Calculus",
          teacher: "Mr. Verma",
          date: "2024-01-15 09:00",
          status: "Recorded",
        },
        {
          name: "Foundation – Atomic Structure",
          teacher: "Dr. Mehta",
          date: "2024-01-14 11:00",
          status: "Recorded",
        },
      ]}
    />
  );
}
