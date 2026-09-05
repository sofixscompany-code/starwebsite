import { FirestoreModulePage } from "@/components/admin/FirestoreModulePage";
import { BookOpen, Clock } from "lucide-react";

export default function TeacherClassesPage() {
  return (
    <FirestoreModulePage
      collectionName="classes"
      title="My Classes"
      subtitle="View and manage your teaching schedule"
      stats={[
        { label: "Classes", value: 0, icon: BookOpen, tone: "purple" },
        { label: "Duration", value: "60–120 min", icon: Clock, tone: "info" },
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
