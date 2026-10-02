import { FirestoreModulePage } from "@/components/admin/FirestoreModulePage";
import { useModuleData } from "@/hooks/use-module-data";
import { Sparkles, CheckCircle2 } from "lucide-react";

export function AIPage() {
  const { rows: prompts } = useModuleData("ai_prompts");
  const activeCount = prompts.filter(
    (p) => String(p.status || "").toLowerCase() === "active",
  ).length;

  return (
    <FirestoreModulePage
      collectionName="ai_prompts"
      title="AI Assistant"
      subtitle="Intelligent automation and assistance — prompt library stored in Firestore"
      stats={[
        { label: "Prompts", value: prompts.length, icon: Sparkles, tone: "purple" },
        { label: "Active", value: activeCount, icon: CheckCircle2, tone: "success" },
      ]}
      columns={[
        { key: "model", label: "Model" },
        { key: "usage", label: "Usage" },
        { key: "status", label: "Status" },
      ]}
      fields={[
        { key: "model", label: "Model", type: "text", required: true, placeholder: "gpt-4o" },
        { key: "usage", label: "Usage", type: "text", placeholder: "Summarize exam results" },
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
