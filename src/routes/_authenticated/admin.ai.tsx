import { ModulePage } from "@/components/admin/ModulePage";
import { Sparkles, BarChart3, TrendingUp, CheckCircle2 } from "lucide-react";

export function AIPage() {
  return (
    <ModulePage
      title="AI Assistant"
      subtitle="Intelligent automation and assistance"
      stats={[
        { label: "Active Models", value: 3, icon: Sparkles, tone: "purple" },
        { label: "Queries Today", value: 142, icon: BarChart3, tone: "info" },
        { label: "Accuracy Rate", value: "94%", icon: TrendingUp, tone: "success" },
        { label: "Actions Automated", value: 278, icon: CheckCircle2, tone: "warning" },
      ]}
      columns={[
        { key: "model", label: "Model" },
        { key: "usage", label: "Usage" },
        { key: "status", label: "Status" },
      ]}
      rows={[
        { model: "GPT-4", usage: "45%", status: "Active" },
        { model: "Claude 3", usage: "30%", status: "Active" },
        { model: "Llama 3", usage: "25%", status: "Active" },
      ]}
    />
  );
}
