import { ModulePage } from "@/components/admin/ModulePage";
import { Briefcase, CalendarOff, UserPlus, Wallet } from "lucide-react";

export function EmployeesPage() {
  return (
    <ModulePage
      title="Employees"
      subtitle="Manage staff records, roles and employment details"
      stats={[
        { label: "Total Employees", value: 64, icon: Briefcase, tone: "purple" },
        { label: "On Leave", value: 5, icon: CalendarOff, tone: "warning" },
        { label: "New This Month", value: 3, icon: UserPlus, tone: "success" },
        { label: "Payroll Cost", value: "₹12.8L", icon: Wallet, tone: "info" },
      ]}
      columns={[
        { key: "name", label: "Employee" },
        { key: "role", label: "Role" },
        { key: "department", label: "Department" },
        { key: "status", label: "Status" },
      ]}
      rows={[
        { name: "Rahul Sharma", role: "Senior Teacher", department: "Academics", status: "Active" },
        { name: "Priya Mehta", role: "Counsellor", department: "Student Affairs", status: "Active" },
        { name: "Amit Kumar", role: "Accountant", department: "Finance", status: "On Leave" },
        { name: "Neha Gupta", role: "Receptionist", department: "Operations", status: "Active" },
      ]}
    />
  );
}
