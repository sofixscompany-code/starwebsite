import { ModulePage } from "@/components/admin/ModulePage";
import { Phone, Clock, CheckCircle2, AlertCircle } from "lucide-react";

export function InquiriesPage() {
  return (
    <ModulePage
      title="Inquiries"
      subtitle="Track and respond to prospective student inquiries"
      stats={[
        { label: "Total Inquiries", value: 234, icon: Phone, tone: "purple" },
        { label: "Pending", value: 18, icon: Clock, tone: "warning" },
        { label: "Converted", value: 142, icon: CheckCircle2, tone: "success" },
        { label: "Follow-up Needed", value: 24, icon: AlertCircle, tone: "danger" },
      ]}
      columns={[
        { key: "name", label: "Contact" },
        { key: "course", label: "Course Interest" },
        { key: "source", label: "Source" },
        { key: "status", label: "Status" },
      ]}
      rows={[
        { name: "Meera Joshi", course: "JEE Advanced", source: "Website", status: "New" },
        { name: "Arjun Nair", course: "NEET", source: "Referral", status: "Contacted" },
        { name: "Sakshi Banerjee", course: "Class 11 Foundation", source: "Walk-in", status: "Converted" },
        { name: "Rishi Kapoor", course: "JEE Main", source: "Social Media", status: "Pending" },
      ]}
    />
  );
}
