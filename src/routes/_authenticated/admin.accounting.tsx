import { createFileRoute } from "@tanstack/react-router";
import { ModulePage } from "@/components/admin/ModulePage";
import { Wallet, CheckCircle2, AlertCircle, TrendingDown } from "lucide-react";

export const Route = createFileRoute("/_authenticated/admin/accounting")({
  component: () => (
    <ModulePage
      title="Accounting"
      subtitle="Fees, revenue, expenses & ledgers."
      addLabel="Add"
      stats={[
    { label: "Revenue MTD", value: "₹9.82L", icon: Wallet, tone: "success", delta: 18 },
    { label: "Collected", value: "₹8.6L", icon: CheckCircle2, tone: "info" },
    { label: "Pending", value: "₹1.2L", icon: AlertCircle, tone: "danger", delta: -6 },
    { label: "Expenses MTD", value: "₹3.4L", icon: TrendingDown, tone: "warning" }
      ]}
      columns={[
    { key: "inv", label: "Invoice" },
    { key: "name", label: "Student" },
    { key: "desc", label: "Description" },
    { key: "amount", label: "Amount" },
    { key: "method", label: "Method" },
    { key: "date", label: "Date" },
    { key: "status", label: "Status" }
      ]}
      rows={[
    {"id":"1","inv":"INV-2024-1041","name":"Priya Karki","desc":"Sept fee · Loksewa","amount":"₹18,500","method":"eSewa","date":"2024-09-30","status":"Paid"},
    {"id":"2","inv":"INV-2024-1042","name":"Aarav Sharma","desc":"Admission fee","amount":"₹25,000","method":"Khalti","date":"2024-09-30","status":"Paid"},
    {"id":"3","inv":"INV-2024-1043","name":"Rohan Thapa","desc":"Hostel · Oct","amount":"₹12,000","method":"Cash","date":"2024-10-01","status":"Paid"},
    {"id":"4","inv":"INV-2024-1044","name":"Sita Rana","desc":"Books & material","amount":"₹8,500","method":"Card","date":"2024-10-01","status":"Pending"},
    {"id":"5","inv":"INV-2024-1045","name":"Bikash Gurung","desc":"Full package","amount":"₹30,000","method":"Bank","date":"2024-10-02","status":"Paid"},
    {"id":"6","inv":"INV-2024-1046","name":"Anisha Magar","desc":"Test series","amount":"₹5,500","method":"eSewa","date":"2024-10-02","status":"Overdue"}
      ]}
    />
  ),
});
