import { FirestoreModulePage } from "@/components/admin/FirestoreModulePage";
import { useModuleData } from "@/hooks/use-module-data";
import { Award, CheckCircle2, GraduationCap } from "lucide-react";

export function CertificatesPage() {
  const { rows } = useModuleData("certificates");

  const now = new Date();
  const total = rows.length;
  const thisMonth = rows.filter((r) => {
    const d = new Date(String(r.date ?? r.createdAt ?? ""));
    return (
      !isNaN(d.getTime()) &&
      d.getMonth() === now.getMonth() &&
      d.getFullYear() === now.getFullYear()
    );
  }).length;
  const courses = new Set(rows.map((r) => r.course).filter((c) => c != null && c !== "")).size;

  return (
    <FirestoreModulePage
      collectionName="certificates"
      title="Certificates"
      subtitle="Generate and manage student achievement certificates"
      stats={[
        { label: "Total Issued", value: total, icon: Award, tone: "purple" },
        { label: "This Month", value: thisMonth, icon: CheckCircle2, tone: "success" },
        { label: "Courses Covered", value: courses, icon: GraduationCap, tone: "info" },
      ]}
      columns={[
        { key: "name", label: "Student" },
        { key: "course", label: "Course" },
        { key: "type", label: "Certificate Type" },
        { key: "date", label: "Issued" },
      ]}
      rows={[
        { name: "Aarav Patel", course: "JEE Advanced", type: "Completion", date: "2024-01-15" },
        { name: "Sneha Gupta", course: "NEET Foundation", type: "Merit", date: "2024-01-14" },
        {
          name: "Vikram Singh",
          course: "Class 12 Board Prep",
          type: "Attendance",
          date: "2024-01-13",
        },
        { name: "Priyanka Das", course: "JEE Main", type: "Top Performer", date: "2024-01-12" },
      ]}
    />
  );
}
