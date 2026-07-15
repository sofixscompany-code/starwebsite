import { createFileRoute } from "@tanstack/react-router";
import { ModulePage } from "@/components/admin/ModulePage";
import { Layers, ShieldCheck, UserCog, History } from "lucide-react";

export const Route = createFileRoute("/_authenticated/admin/permissions")({
  component: () => (
    <ModulePage
      title="Permissions"
      subtitle="Granular per-module access."
      addLabel="Add"
      stats={[
    { label: "Modules", value: 48, icon: Layers },
    { label: "Permissions", value: 242, icon: ShieldCheck },
    { label: "Roles", value: 12, icon: UserCog },
    { label: "Audit rows", value: "4.8K", icon: History }
      ]}
      columns={[
    { key: "module", label: "Module" },
    { key: "create", label: "Create" },
    { key: "read", label: "Read" },
    { key: "update", label: "Update" },
    { key: "del", label: "Delete" },
    { key: "status", label: "Status" }
      ]}
      rows={[
    {"id":"1","module":"Students","create":"Admin","read":"All","update":"Admin","del":"Super","status":"Active"},
    {"id":"2","module":"Fees","create":"Accountant","read":"All","update":"Accountant","del":"Super","status":"Active"},
    {"id":"3","module":"LMS","create":"Teacher","read":"All","update":"Teacher","del":"Admin","status":"Active"}
      ]}
    />
  ),
});
