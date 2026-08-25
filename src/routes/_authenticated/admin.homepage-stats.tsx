import { FirestoreModulePage } from "@/components/admin/FirestoreModulePage";
import { BarChart3, Hash, Trophy, Users } from "lucide-react";

export function HomepageStatsPage() {
  return (
    <FirestoreModulePage
      collectionName="homepage_stats"
      title="Homepage Stats Bar"
      subtitle="Numbers shown in the navy stats bar on the homepage (e.g. Students Trained: 5,000+)"
      stats={[
        { label: "Stat Items", value: 4, icon: Hash, tone: "purple" },
        { label: "Homepage Bar", value: 1, icon: BarChart3, tone: "info" },
      ]}
      columns={[
        { key: "value", label: "Value" },
        { key: "label", label: "Label" },
        { key: "order", label: "Order" },
      ]}
      fields={[
        { key: "value", label: "Value", type: "text", required: true, placeholder: "5,000+" },
        {
          key: "label",
          label: "Label",
          type: "text",
          required: true,
          placeholder: "Students Trained",
        },
        { key: "order", label: "Display Order (1 = first)", type: "number", placeholder: "1" },
      ]}
    />
  );
}
