import { FirestoreModulePage } from "@/components/admin/FirestoreModulePage";
import { useModuleData } from "@/hooks/use-module-data";
import { Wallet, CheckCircle2, XCircle, TrendingUp } from "lucide-react";

export function PaymentsPage() {
  const { rows } = useModuleData("payments");

  const isCompleted = (status: unknown) => {
    const s = String(status ?? "").toLowerCase();
    return s === "completed" || s === "paid";
  };
  const isFailed = (status: unknown) => String(status ?? "").toLowerCase() === "failed";

  const total = rows.length;
  const completed = rows.filter((r) => isCompleted(r.status)).length;
  const failed = rows.filter((r) => isFailed(r.status)).length;
  const collected = rows.reduce((sum, r) => {
    if (!isCompleted(r.status)) return sum;
    const amount = Number(r.amount);
    return sum + (Number.isFinite(amount) ? amount : 0);
  }, 0);

  return (
    <FirestoreModulePage
      collectionName="payments"
      title="Payments"
      subtitle="Track all fee collections, refunds and payment status"
      stats={[
        { label: "Total Payments", value: total, icon: Wallet, tone: "purple" },
        { label: "Successful", value: completed, icon: CheckCircle2, tone: "success" },
        { label: "Failed", value: failed, icon: XCircle, tone: "danger" },
        {
          label: "Collected",
          value: `Rs ${collected.toLocaleString("en-IN")}`,
          icon: TrendingUp,
          tone: "info",
        },
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
