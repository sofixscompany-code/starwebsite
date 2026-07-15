import { createFileRoute } from "@tanstack/react-router";
import { ModulePage } from "@/components/admin/ModulePage";
import { Send, Sparkles, CheckCircle2, Eye } from "lucide-react";

export const Route = createFileRoute("/_authenticated/admin/marketing/whatsapp")({
  component: () => (
    <ModulePage
      title="WhatsApp Business"
      subtitle="Templates · click-to-chat · automation."
      addLabel="Add"
      stats={[
    { label: "Chats today", value: 124, icon: Send },
    { label: "Active flows", value: 6, icon: Sparkles },
    { label: "Delivered", value: "98%", icon: CheckCircle2, tone: "success" },
    { label: "Read", value: "72%", icon: Eye, tone: "info" }
      ]}
      columns={[
    { key: "name", label: "Campaign" },
    { key: "template", label: "Template" },
    { key: "audience", label: "Audience" },
    { key: "sent", label: "Sent" },
    { key: "read", label: "Read" },
    { key: "status", label: "Status" }
      ]}
      rows={[
    {"id":"1","name":"Admission confirmation","template":"tpl_admission_ok","audience":"New admissions","sent":"86","read":"82","status":"Completed"},
    {"id":"2","name":"Exam reminder","template":"tpl_exam_remind","audience":"Batch B-12","sent":"45","read":"42","status":"Completed"},
    {"id":"3","name":"Result publish","template":"tpl_result_out","audience":"Loksewa batch","sent":"32","read":"28","status":"Completed"}
      ]}
    />
  ),
});
