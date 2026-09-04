import { FirestoreModulePage } from "@/components/admin/FirestoreModulePage";
import { Wallet, CheckCircle2, XCircle, TrendingDown } from "lucide-react";

export function PaymentsPage() {
  return (
    <FirestoreModulePage
      collectionName="payments"
      title="Payments"
      subtitle="Track all fee collections, refunds and payment status"
      stats={[
        { label: "Total Collected", value: "₹24.6L", icon: Wallet, tone: "purple" },
        { label: "Successful", value: 842, icon: CheckCircle2, tone: "success" },
        { label: "Failed", value: 18, icon: XCircle, tone: "danger" },
        { label: "Refunds", value: "₹1.2L", icon: TrendingDown, tone: "warning" },
      ]}
      columns={[
        { key: "studentName", label: "Student" },
        { key: "amount", label: "Amount" },
        { key: "method", label: "Method" },
        { key: "type", label: "Type" },
        { key: "status", label: "Status" },
      ]}
      fields={[
        { key: "studentName", label: "Student", type: "text", required: true },
        { key: "amount", label: "Amount (Rs)", type: "number", required: true },
        { key: "method", label: "Method", type: "text" },
        { key: "type", label: "Type", type: "text" },
        {
          key: "status",
          label: "Status",
          type: "select",
          options: [
            { value: "completed", label: "Completed" },
            { value: "pending", label: "Pending" },
            { value: "failed", label: "Failed" },
          ],
        },
      ]}
      rows={[
        {
          studentName: "Aarav Sharma",
          amount: 45000,
          method: "eSewa",
          type: "tuition",
          status: "completed",
        },
        {
          studentName: "Sneha Gupta",
          amount: 38000,
          method: "Khalti",
          type: "admission",
          status: "completed",
        },
        {
          studentName: "Vikram Singh",
          amount: 42000,
          method: "Bank Transfer",
          type: "hostel",
          status: "pending",
        },
      ]}
    />
  );
}
