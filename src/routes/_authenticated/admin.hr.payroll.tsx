import { ModulePage } from "@/components/admin/ModulePage";
import { Wallet, TrendingDown, CheckCircle2, Users } from "lucide-react";

export function PayrollPage() {
  return (
    <ModulePage
      title="Payroll"
      subtitle="Process and manage employee salary disbursements"
      stats={[
        { label: "Monthly Payroll", value: "₹12.8L", icon: Wallet, tone: "purple" },
        { label: "Deductions", value: "₹1.2L", icon: TrendingDown, tone: "danger" },
        { label: "Processed", value: 59, icon: CheckCircle2, tone: "success" },
        { label: "Employees", value: 64, icon: Users, tone: "info" },
      ]}
      columns={[
        { key: "name", label: "Employee" },
        { key: "basic", label: "Basic Salary" },
        { key: "deductions", label: "Deductions" },
        { key: "status", label: "Status" },
      ]}
      rows={[
        { name: "Rahul Sharma", basic: "₹45,000", deductions: "₹4,500", status: "Paid" },
        { name: "Priya Mehta", basic: "₹38,000", deductions: "₹3,800", status: "Paid" },
        { name: "Amit Kumar", basic: "₹35,000", deductions: "₹3,500", status: "Pending" },
        { name: "Neha Gupta", basic: "₹30,000", deductions: "₹3,000", status: "Pending" },
      ]}
    />
  );
}
