import { createFileRoute } from "@tanstack/react-router";
import { ModulePage } from "@/components/admin/ModulePage";
import { Layers, UserCog, Briefcase, Users } from "lucide-react";

export const Route = createFileRoute("/_authenticated/admin/hr/departments")({
  component: () => (
    <ModulePage
      title="Departments"
      subtitle="Organisation structure."
      addLabel="Add"
      stats={[
    { label: "Departments", value: 8, icon: Layers },
    { label: "Heads", value: 8, icon: UserCog },
    { label: "Roles", value: 24, icon: Briefcase },
    { label: "Employees", value: 104, icon: Users }
      ]}
      columns={[
    { key: "name", label: "Department" },
    { key: "head", label: "Head" },
    { key: "members", label: "Members" },
    { key: "budget", label: "Monthly budget" },
    { key: "status", label: "Status" }
      ]}
      rows={[
    {"id":"1","name":"Academics","head":"Ram B. K.C.","members":"42","budget":"₹12.4L","status":"Active"},
    {"id":"2","name":"Accounts","head":"Anita Rai","members":"6","budget":"₹1.8L","status":"Active"},
    {"id":"3","name":"Reception","head":"Suman P.","members":"8","budget":"₹2.2L","status":"Active"},
    {"id":"4","name":"IT","head":"Anju Rana","members":"5","budget":"₹2.6L","status":"Active"},
    {"id":"5","name":"HR","head":"Rashmi K.","members":"4","budget":"₹1.5L","status":"Active"}
      ]}
    />
  ),
});
