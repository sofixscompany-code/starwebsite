import { ModulePage } from "@/components/admin/ModulePage";
import { Target, CheckCircle2, Calendar, TrendingUp } from "lucide-react";

export function LeadsPage() {
  return (
    <ModulePage
      title="Leads"
      subtitle="Manage potential student leads and conversion pipeline"
      stats={[
        { label: "Total Leads", value: 567, icon: Target, tone: "purple" },
        { label: "Converted", value: 198, icon: CheckCircle2, tone: "success" },
        { label: "This Month", value: 45, icon: Calendar, tone: "info" },
        { label: "Conversion Rate", value: "35%", icon: TrendingUp, tone: "warning" },
      ]}
      columns={[
        { key: "name", label: "Lead" },
        { key: "course", label: "Course" },
        { key: "source", label: "Source" },
        { key: "status", label: "Status" },
      ]}
      rows={[
        { name: "Deepak Mishra", course: "JEE Advanced", source: "Google Ads", status: "Hot" },
        { name: "Tanya Sethi", course: "NEET", source: "Instagram", status: "Warm" },
        { name: "Mohit Rathi", course: "Foundation (Class 10)", source: "School Tie-up", status: "Converted" },
        { name: "Isha Chauhan", course: "JEE Main", source: "Referral", status: "Cold" },
      ]}
    />
  );
}
