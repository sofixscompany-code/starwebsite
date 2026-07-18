import { ModulePage } from "@/components/admin/ModulePage";
import { CalendarOff, CheckCircle2, Clock, XCircle } from "lucide-react";

export function LeavesPage() {
  return (
    <ModulePage
      title="Leaves"
      subtitle="Track and manage employee leave requests"
      stats={[
        { label: "Total Requests", value: 78, icon: CalendarOff, tone: "purple" },
        { label: "Approved", value: 62, icon: CheckCircle2, tone: "success" },
        { label: "Pending", value: 8, icon: Clock, tone: "warning" },
        { label: "Rejected", value: 8, icon: XCircle, tone: "danger" },
      ]}
      columns={[
        { key: "name", label: "Employee" },
        { key: "type", label: "Leave Type" },
        { key: "dates", label: "Dates" },
        { key: "status", label: "Status" },
      ]}
      rows={[
        { name: "Amit Kumar", type: "Sick Leave", dates: "Jan 14–16", status: "Approved" },
        { name: "Sunita Devi", type: "Casual Leave", dates: "Jan 18", status: "Pending" },
        { name: "Rohit Verma", type: "Earned Leave", dates: "Jan 20–25", status: "Pending" },
        { name: "Neha Gupta", type: "Sick Leave", dates: "Jan 10", status: "Approved" },
      ]}
    />
  );
}
