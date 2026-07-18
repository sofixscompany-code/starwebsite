import { ModulePage } from "@/components/admin/ModulePage";
import { Wallet, CheckCircle2, XCircle, TrendingDown } from "lucide-react";

export function PaymentsPage() {
  return (
    <ModulePage
      title="Payments"
      subtitle="Track all fee collections, refunds and payment status"
      stats={[
        { label: "Total Collected", value: "₹24.6L", icon: Wallet, tone: "purple" },
        { label: "Successful", value: 842, icon: CheckCircle2, tone: "success" },
        { label: "Failed", value: 18, icon: XCircle, tone: "danger" },
        { label: "Refunds", value: "₹1.2L", icon: TrendingDown, tone: "warning" },
      ]}
      columns={[
        { key: "name", label: "Student" },
        { key: "amount", label: "Amount" },
        { key: "method", label: "Method" },
        { key: "status", label: "Status" },
      ]}
      rows={[
        { name: "Aarav Patel", amount: "₹45,000", method: "UPI", status: "Success" },
        { name: "Sneha Gupta", amount: "₹38,000", method: "Card", status: "Success" },
        { name: "Vikram Singh", amount: "₹42,000", method: "Net Banking", status: "Pending" },
        { name: "Priyanka Das", amount: "₹35,000", method: "UPI", status: "Failed" },
      ]}
    />
  );
}
