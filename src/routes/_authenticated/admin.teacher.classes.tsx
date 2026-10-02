import { FirestoreModulePage } from "@/components/admin/FirestoreModulePage";
import { useModuleData } from "@/hooks/use-module-data";
import { BookOpen, DoorOpen } from "lucide-react";

export default function TeacherClassesPage() {
  const { rows } = useModuleData("classes");

  const rooms = new Set(rows.map((r) => String(r.room || "")).filter(Boolean)).size;

  return (
    <FirestoreModulePage
      collectionName="classes"
      title="My Classes"
      subtitle="View and manage your teaching schedule"
      stats={[
        { label: "Classes", value: rows.length, icon: BookOpen, tone: "purple" },
        { label: "Rooms", value: rooms, icon: DoorOpen, tone: "info" },
      ]}
      columns={[
        { key: "name", label: "Class" },
        { key: "subject", label: "Subject" },
        { key: "room", label: "Room" },
        { key: "startTime", label: "Start Time" },
      ]}
      fields={[
        {
          key: "name",
          label: "Class Name",
          type: "text",
          required: true,
          placeholder: "Mathematics · NP-A",
        },
        {
          key: "subject",
          label: "Subject",
          type: "text",
          required: true,
          placeholder: "Mathematics",
        },
        { key: "teacherName", label: "Teacher", type: "text", placeholder: "Ramesh Sharma" },
        { key: "room", label: "Room", type: "text", placeholder: "Room 101" },
        { key: "startTime", label: "Start Time", type: "text", placeholder: "2024-03-01 09:00" },
        { key: "durationMin", label: "Duration (min)", type: "number", placeholder: "90" },
      ]}
    />
  );
}
