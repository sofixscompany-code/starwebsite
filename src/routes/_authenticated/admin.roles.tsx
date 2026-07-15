import { createFileRoute } from "@tanstack/react-router";
import { ModulePage } from "@/components/admin/ModulePage";
import { UserCog, Users, Sparkles, ShieldCheck } from "lucide-react";

export const Route = createFileRoute("/_authenticated/admin/roles")({
  component: () => (
    <ModulePage
      title="Roles"
      subtitle="Role-based access control."
      addLabel="Add"
      stats={[
    { label: "Roles", value: 12, icon: UserCog },
    { label: "Users", value: 148, icon: Users },
    { label: "Custom", value: 4, icon: Sparkles, tone: "info" },
    { label: "System", value: 8, icon: ShieldCheck }
      ]}
      columns={[
    { key: "role", label: "Role" },
    { key: "users", label: "Users" },
    { key: "perms", label: "Permissions" },
    { key: "scope", label: "Scope" },
    { key: "updated", label: "Updated" },
    { key: "status", label: "Status" }
      ]}
      rows={[
    {"id":"1","role":"Super Admin","users":"2","perms":"All","scope":"Global","updated":"2024-08-01","status":"Active"},
    {"id":"2","role":"Branch Admin","users":"5","perms":"Branch-scoped","scope":"Branch","updated":"2024-08-15","status":"Active"},
    {"id":"3","role":"Receptionist","users":"8","perms":"Admissions · Fees","scope":"Branch","updated":"2024-09-01","status":"Active"},
    {"id":"4","role":"Teacher","users":"68","perms":"LMS · Homework","scope":"Course","updated":"2024-09-10","status":"Active"},
    {"id":"5","role":"Accountant","users":"6","perms":"Fees · Payroll","scope":"Branch","updated":"2024-09-15","status":"Active"},
    {"id":"6","role":"Librarian","users":"2","perms":"Library","scope":"Branch","updated":"2024-09-20","status":"Active"},
    {"id":"7","role":"Hostel Warden","users":"2","perms":"Hostel","scope":"Branch","updated":"2024-09-25","status":"Active"}
      ]}
    />
  ),
});
