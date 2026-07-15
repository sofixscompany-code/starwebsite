import { createFileRoute } from "@tanstack/react-router";
import { ModulePage } from "@/components/admin/ModulePage";
import { Cog, PlugZap, Users, History } from "lucide-react";

export const Route = createFileRoute("/_authenticated/admin/settings")({
  component: () => (
    <ModulePage
      title="Settings"
      subtitle="Institute branding, integrations & security."
      addLabel="Add"
      stats={[
    {label:"Modules", value:12, icon:Cog},
    {label:"Integrations", value:12, icon:PlugZap},
    {label:"Users", value:148, icon:Users},
    {label:"Last change", value:"2h ago", icon:History}
      ]}
      columns={[
    { key: "key", label: "Setting" },
    { key: "group", label: "Group" },
    { key: "value", label: "Value" },
    { key: "updated", label: "Updated" },
    { key: "by", label: "By" },
    { key: "status", label: "Status" }
      ]}
      rows={[
    {"id":"1","key":"Institute name","group":"Branding","value":"Star Coaching Institute","updated":"2024-08-01","by":"Admin","status":"Active"},
    {"id":"2","key":"Primary color","group":"Branding","value":"#7C3AED","updated":"2024-08-10","by":"Admin","status":"Active"},
    {"id":"3","key":"SMTP host","group":"Email","value":"smtp.gmail.com","updated":"2024-09-01","by":"Admin","status":"Active"},
    {"id":"4","key":"Payment gateway","group":"Payments","value":"eSewa · Khalti · IME","updated":"2024-09-15","by":"Admin","status":"Active"},
    {"id":"5","key":"Backup schedule","group":"Backup","value":"Every 6 hours","updated":"2024-09-20","by":"System","status":"Active"}
      ]}
    />
  ),
});
