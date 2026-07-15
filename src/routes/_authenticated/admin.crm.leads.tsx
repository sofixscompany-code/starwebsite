import { createFileRoute } from "@tanstack/react-router";
import { ModulePage } from "@/components/admin/ModulePage";
import { Target, CheckCircle2, Calendar, TrendingUp } from "lucide-react";

export const Route = createFileRoute("/_authenticated/admin/crm/leads")({
  component: () => (
    <ModulePage
      title="CRM · Leads"
      subtitle="Pipeline · follow-ups · conversions."
      addLabel="Add"
      stats={[
    { label: "Open leads", value: 142, icon: Target },
    { label: "Qualified", value: 64, icon: CheckCircle2, tone: "success" },
    { label: "Meetings", value: 18, icon: Calendar },
    { label: "Converted", value: 32, icon: TrendingUp, tone: "success", delta: 28 }
      ]}
      columns={[
    { key: "name", label: "Lead" },
    { key: "source", label: "Source" },
    { key: "course", label: "Interest" },
    { key: "stage", label: "Stage" },
    { key: "owner", label: "Owner" },
    { key: "next", label: "Next follow-up" },
    { key: "status", label: "Status" }
      ]}
      rows={[
    {"id":"1","name":"Ramesh Bhattarai","source":"Facebook","course":"Nepal Police","stage":"Meeting","owner":"Suman P.","next":"2024-10-06","status":"Active"},
    {"id":"2","name":"Sabina Karki","source":"Referral","course":"Loksewa","stage":"Contacted","owner":"Rashmi K.","next":"2024-10-04","status":"Active"},
    {"id":"3","name":"Nabin Poudel","source":"Website","course":"Bank PO","stage":"Proposal","owner":"Suman P.","next":"2024-10-05","status":"Active"},
    {"id":"4","name":"Prem Rai","source":"Walk-in","course":"APF","stage":"New","owner":"Reception","next":"2024-10-03","status":"Active"}
      ]}
    />
  ),
});
