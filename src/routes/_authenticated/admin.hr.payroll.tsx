import { createFileRoute } from "@tanstack/react-router";
import { ModulePage } from "@/components/admin/ModulePage";
import { Wallet, TrendingDown, CheckCircle2, Users } from "lucide-react";

export const Route = createFileRoute("/_authenticated/admin/hr/payroll")({
  component: () => (
    <ModulePage
      title="Payroll"
      subtitle="October 2024 pay cycle."
      addLabel="Add"
      stats={[
    { label: "Gross", value: "₹22.4L", icon: Wallet },
    { label: "Deductions", value: "₹3.2L", icon: TrendingDown, tone: "warning" },
    { label: "Net", value: "₹19.2L", icon: CheckCircle2, tone: "success" },
    { label: "Processed", value: "98/104", icon: Users }
      ]}
      columns={[
    { key: "emp", label: "Employee" },
    { key: "basic", label: "Basic" },
    { key: "allow", label: "Allowance" },
    { key: "ded", label: "Deductions" },
    { key: "net", label: "Net pay" },
    { key: "status", label: "Status" }
      ]}
      rows={[
    {"id":"1","emp":"Ram Bahadur K.C.","basic":"₹55,000","allow":"₹10,000","ded":"₹5,500","net":"₹59,500","status":"Paid"},
    {"id":"2","emp":"Anita Rai","basic":"₹35,000","allow":"₹7,000","ded":"₹3,200","net":"₹38,800","status":"Paid"},
    {"id":"3","emp":"Kabita Shrestha","basic":"₹42,000","allow":"₹10,000","ded":"₹4,100","net":"₹47,900","status":"Pending"}
      ]}
    />
  ),
});
