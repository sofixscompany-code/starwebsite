import { FirestoreModulePage } from "@/components/admin/FirestoreModulePage";
import { useModuleData } from "@/hooks/use-module-data";
import { Receipt, Wallet, TrendingUp, GraduationCap } from "lucide-react";

export function FeeStructurePage() {
  const { rows } = useModuleData("fee_structure");

  const totalPlans = rows.length;
  const activePlans = rows.filter((r) => String(r.status ?? "") === "Active").length;
  const programs = new Set(rows.map((r) => r.program).filter((p) => p != null && p !== "")).size;
  const monthlyFees = rows
    .map((r) => Number(r.monthlyFee))
    .filter((n) => Number.isFinite(n) && n > 0);
  const avgMonthly = monthlyFees.length
    ? Math.round(monthlyFees.reduce((a, b) => a + b, 0) / monthlyFees.length)
    : 0;

  return (
    <FirestoreModulePage
      collectionName="fee_structure"
      title="Fee Structure"
      subtitle="Manage fee categories and amounts per program"
      stats={[
        { label: "Fee Plans", value: totalPlans, icon: Receipt, tone: "purple" },
        {
          label: "Avg. Monthly Fee",
          value: monthlyFees.length ? `Rs ${avgMonthly.toLocaleString("en-IN")}` : "—",
          icon: Wallet,
          tone: "info",
        },
        { label: "Programs", value: programs, icon: GraduationCap, tone: "success" },
        { label: "Active Plans", value: activePlans, icon: TrendingUp, tone: "warning" },
      ]}
      columns={[
        { key: "planName", label: "Plan Name" },
        { key: "program", label: "Program" },
        { key: "admissionFee", label: "Admission Fee" },
        { key: "monthlyFee", label: "Monthly Fee" },
        { key: "totalAmount", label: "Total Amount" },
        { key: "status", label: "Status" },
      ]}
      fields={[
        { key: "planName", label: "Plan Name", type: "text", required: true },
        {
          key: "program",
          label: "Program",
          type: "select",
          options: [
            { value: "Police", label: "Police" },
            { value: "Army", label: "Army" },
            { value: "Loksewa", label: "Loksewa" },
            { value: "Medical", label: "Medical" },
            { value: "Engineering", label: "Engineering" },
            { value: "Tuition", label: "Tuition" },
          ],
        },
        { key: "admissionFee", label: "Admission Fee (Rs)", type: "number", required: true },
        { key: "monthlyFee", label: "Monthly Fee (Rs)", type: "number", required: true },
        { key: "totalAmount", label: "Total Amount (Rs)", type: "number" },
        {
          key: "status",
          label: "Status",
          type: "select",
          options: [
            { value: "Active", label: "Active" },
            { value: "Inactive", label: "Inactive" },
          ],
        },
      ]}
    />
  );
}
