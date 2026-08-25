import { FirestoreModulePage } from "@/components/admin/FirestoreModulePage";
import { ListChecks, Star, Hash } from "lucide-react";

export function WhyChooseUsPage() {
  return (
    <FirestoreModulePage
      collectionName="why_choose_us"
      title="Why Choose Us"
      subtitle="Bullet points shown in the 'Why choose us' panel next to Latest Notices on the homepage"
      stats={[
        { label: "Bullet Items", value: 5, icon: ListChecks, tone: "purple" },
        { label: "Homepage Panel", value: 1, icon: Star, tone: "info" },
      ]}
      columns={[
        { key: "text", label: "Bullet Text" },
        { key: "order", label: "Order" },
      ]}
      fields={[
        {
          key: "text",
          label: "Text",
          type: "text",
          required: true,
          placeholder: "Experienced faculty from real service backgrounds",
        },
        { key: "order", label: "Display Order", type: "number", placeholder: "1" },
      ]}
    />
  );
}
