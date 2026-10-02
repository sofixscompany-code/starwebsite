import { FirestoreModulePage } from "@/components/admin/FirestoreModulePage";
import { useModuleData } from "@/hooks/use-module-data";
import { PencilLine, AlarmClock } from "lucide-react";

/**
 * `exams` is also edited from `/admin/exams` — keep column keys in sync with
 * `admin.exams.tsx`.
 */
const COLUMNS = [
  { key: "title", label: "Title" },
  { key: "subject", label: "Subject" },
  { key: "scheduledAt", label: "Scheduled At" },
  { key: "durationMin", label: "Duration (min)" },
  { key: "totalMarks", label: "Total Marks" },
];

const FIELDS = [
  {
    key: "title",
    label: "Title",
    type: "text" as const,
    required: true,
    placeholder: "Math Unit Test Ch.4-6",
  },
  {
    key: "subject",
    label: "Subject",
    type: "text" as const,
    required: true,
    placeholder: "Mathematics",
  },
  {
    key: "scheduledAt",
    label: "Scheduled At",
    type: "text" as const,
    required: true,
    placeholder: "2024-03-08 09:00",
  },
  { key: "durationMin", label: "Duration (min)", type: "number" as const, placeholder: "90" },
  { key: "totalMarks", label: "Total Marks", type: "number" as const, placeholder: "75" },
];

export default function TeacherExaminationsPage() {
  const { rows } = useModuleData("exams");

  const now = Date.now();
  const upcoming = rows.filter(
    (r) => r.scheduledAt && new Date(String(r.scheduledAt)).getTime() > now,
  ).length;

  return (
    <FirestoreModulePage
      collectionName="exams"
      title="Examinations"
      subtitle="Create, schedule, manage examinations"
      stats={[
        { label: "Exams", value: rows.length, icon: PencilLine, tone: "purple" },
        { label: "Upcoming", value: upcoming, icon: AlarmClock, tone: "info" },
      ]}
      columns={COLUMNS}
      fields={FIELDS}
    />
  );
}
