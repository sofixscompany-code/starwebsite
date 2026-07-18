import { ModulePage } from "@/components/admin/ModulePage";
import { UserPlus, Users, GraduationCap, Clock } from "lucide-react";

export function VisitorsPage() {
  return (
    <ModulePage
      title="Visitors"
      subtitle="Track campus visits from prospective students and parents"
      stats={[
        { label: "Total Visitors", value: 312, icon: UserPlus, tone: "purple" },
        { label: "This Week", value: 28, icon: Users, tone: "info" },
        { label: "Enrolled", value: 86, icon: GraduationCap, tone: "success" },
        { label: "Scheduled", value: 14, icon: Clock, tone: "warning" },
      ]}
      columns={[
        { key: "name", label: "Visitor" },
        { key: "purpose", label: "Purpose" },
        { key: "branch", label: "Branch" },
        { key: "status", label: "Status" },
      ]}
      rows={[
        { name: "Rajesh Kumar", purpose: "Campus Tour", branch: "Downtown", status: "Completed" },
        { name: "Sunita Devi", purpose: "Admission Enquiry", branch: "North Campus", status: "Completed" },
        { name: "Amit Tiwari", purpose: "Demo Class", branch: "South Wing", status: "Scheduled" },
        { name: "Pooja Singh", purpose: "Fee Discussion", branch: "Downtown", status: "Scheduled" },
      ]}
    />
  );
}
