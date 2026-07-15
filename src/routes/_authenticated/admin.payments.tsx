import { createFileRoute } from "@tanstack/react-router";
import { ModulePage } from "@/components/admin/ModulePage";
import { Wallet, CheckCircle2, XCircle, TrendingDown } from "lucide-react";

export const Route = createFileRoute("/_authenticated/admin/payments")({
  component: () => (
    <ModulePage
      title="Payments"
      subtitle="Gateway configuration & transactions."
      addLabel="Add"
      stats={[
    { label: "Received MTD", value: "₹9.82L", icon: Wallet, tone: "success" },
    { label: "Success rate", value: "97%", icon: CheckCircle2, tone: "success" },
    { label: "Failed", value: 28, icon: XCircle, tone: "danger" },
    { label: "Refunds", value: "₹12,400", icon: TrendingDown, tone: "warning" }
      ]}
      columns={[
    { key: "txn", label: "Txn ID" },
    { key: "student", label: "Student" },
    { key: "gateway", label: "Gateway" },
    { key: "amount", label: "Amount" },
    { key: "date", label: "Date" },
    { key: "status", label: "Status" }
      ]}
      rows={[
    {"id":"1","txn":"TXN-8241","student":"Priya Karki","gateway":"eSewa","amount":"₹18,500","date":"2024-09-30","status":"Paid"},
    {"id":"2","txn":"TXN-8242","student":"Aarav Sharma","gateway":"Khalti","amount":"₹25,000","date":"2024-09-30","status":"Paid"},
    {"id":"3","txn":"TXN-8243","student":"Sita Rana","gateway":"IME Pay","amount":"₹8,500","date":"2024-10-01","status":"Failed"},
    {"id":"4","txn":"TXN-8244","student":"Bikash Gurung","gateway":"Bank","amount":"₹30,000","date":"2024-10-02","status":"Paid"}
      ]}
    />
  ),
});
