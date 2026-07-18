import { ModulePage } from "@/components/admin/ModulePage";
import { History, Users, ShieldCheck, CheckCircle2 } from "lucide-react";

export function AuditLogsPage() {
  return (
    <ModulePage
      title="Audit Logs"
      subtitle="Track all user and system actions across the platform"
      stats={[
        { label: "Total Events", value: "12.4k", icon: History, tone: "purple" },
        { label: "Unique Users", value: 48, icon: Users, tone: "info" },
        { label: "Security Events", value: 3, icon: ShieldCheck, tone: "warning" },
        { label: "Successful Actions", value: "98%", icon: CheckCircle2, tone: "success" },
      ]}
      columns={[
        { key: "user", label: "User" },
        { key: "action", label: "Action" },
        { key: "target", label: "Target" },
        { key: "date", label: "Timestamp" },
      ]}
      rows={[
        { user: "Rahul Sharma", action: "Login", target: "Admin Panel", date: "2024-01-15 09:12" },
        { user: "Priya Mehta", action: "Updated Fee", target: "Student #1042", date: "2024-01-15 08:45" },
        { user: "System", action: "Backup Completed", target: "Database", date: "2024-01-15 06:00" },
        { user: "Ankit Kumar", action: "Deleted Record", target: "Attendance Log", date: "2024-01-14 17:30" },
      ]}
    />
  );
}
