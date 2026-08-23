import { FirestoreModulePage } from "@/components/admin/FirestoreModulePage";
import { Receipt, Wallet, TrendingUp, GraduationCap } from "lucide-react";

export function FeeStructurePage() {
  return (
    <FirestoreModulePage
      collectionName="fee_structure"
      title="Fee Structure"
      subtitle="Manage fee categories and amounts per program"
      stats={[
        { label: "Fee Plans", value: 8, icon: Receipt, tone: "purple" },
        { label: "Avg. Monthly Fee", value: "₹2,500", icon: Wallet, tone: "info" },
        { label: "Programs", value: 6, icon: GraduationCap, tone: "success" },
        { label: "Active Plans", value: 7, icon: TrendingUp, tone: "warning" },
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
        { key: "admissionFee", label: "Admission Fee (₹)", type: "number", required: true },
        { key: "monthlyFee", label: "Monthly Fee (₹)", type: "number", required: true },
        { key: "totalAmount", label: "Total Amount (₹)", type: "number" },
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
