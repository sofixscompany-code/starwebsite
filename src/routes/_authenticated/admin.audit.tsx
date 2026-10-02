import { FirestoreModulePage } from "@/components/admin/FirestoreModulePage";
import { useModuleData } from "@/hooks/use-module-data";
import { History, Users, CheckCircle2 } from "lucide-react";

export function AuditLogsPage() {
  const { rows } = useModuleData("audit_logs");

  const total = rows.length;
  const uniqueUsers = new Set(rows.map((r) => r.user).filter((u) => u != null && u !== "")).size;
  const today = new Date().toISOString().slice(0, 10);
  const eventsToday = rows.filter((r) =>
    String(r.date ?? r.createdAt ?? "").startsWith(today),
  ).length;

  return (
    <FirestoreModulePage
      collectionName="audit_logs"
      title="Audit Logs"
      subtitle="Track all user and system actions across the platform"
      stats={[
        { label: "Total Events", value: total, icon: History, tone: "purple" },
        { label: "Unique Users", value: uniqueUsers, icon: Users, tone: "info" },
        { label: "Events Today", value: eventsToday, icon: CheckCircle2, tone: "success" },
      ]}
      columns={[
        { key: "user", label: "User" },
        { key: "action", label: "Action" },
        { key: "target", label: "Target" },
        { key: "date", label: "Timestamp" },
      ]}
      rows={[
        { user: "Rahul Sharma", action: "Login", target: "Admin Panel", date: "2024-01-15 09:12" },
        {
          user: "Priya Mehta",
          action: "Updated Fee",
          target: "Student #1042",
          date: "2024-01-15 08:45",
        },
        {
          user: "System",
          action: "Backup Completed",
          target: "Database",
          date: "2024-01-15 06:00",
        },
        {
          user: "Ankit Kumar",
          action: "Deleted Record",
          target: "Attendance Log",
          date: "2024-01-14 17:30",
        },
      ]}
    />
  );
}
