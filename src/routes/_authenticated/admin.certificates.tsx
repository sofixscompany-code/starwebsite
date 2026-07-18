import { ModulePage } from "@/components/admin/ModulePage";
import { Award, CheckCircle2, ShieldCheck, Download } from "lucide-react";

export function CertificatesPage() {
  return (
    <ModulePage
      title="Certificates"
      subtitle="Generate and manage student achievement certificates"
      stats={[
        { label: "Total Issued", value: 482, icon: Award, tone: "purple" },
        { label: "Approved", value: 460, icon: CheckCircle2, tone: "success" },
        { label: "Verified", value: 310, icon: ShieldCheck, tone: "info" },
        { label: "Downloads", value: 890, icon: Download, tone: "warning" },
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
        { name: "Vikram Singh", course: "Class 12 Board Prep", type: "Attendance", date: "2024-01-13" },
        { name: "Priyanka Das", course: "JEE Main", type: "Top Performer", date: "2024-01-12" },
      ]}
    />
  );
}
