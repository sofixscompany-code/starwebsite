import { createFileRoute } from "@tanstack/react-router";
import { ModulePage } from "@/components/admin/ModulePage";
import { GitBranch, Building, GraduationCap, Wallet } from "lucide-react";

export const Route = createFileRoute("/_authenticated/admin/branches")({
  component: () => (
    <ModulePage
      title="Branches"
      subtitle="Multi-branch operations."
      addLabel="Add"
      stats={[
    { label: "Branches", value: 5, icon: GitBranch },
    { label: "Cities", value: 4, icon: Building },
    { label: "Students", value: "1,284", icon: GraduationCap },
    { label: "Revenue MTD", value: "₹32L", icon: Wallet, tone: "success" }
      ]}
      columns={[
    { key: "name", label: "Branch" },
    { key: "city", label: "City" },
    { key: "students", label: "Students" },
    { key: "staff", label: "Staff" },
    { key: "rev", label: "Revenue MTD" },
    { key: "status", label: "Status" }
      ]}
      rows={[
    {"id":"1","name":"Kathmandu HQ","city":"Kathmandu","students":"642","staff":"54","rev":"₹18.4L","status":"Active"},
    {"id":"2","name":"Lalitpur","city":"Lalitpur","students":"286","staff":"22","rev":"₹6.8L","status":"Active"},
    {"id":"3","name":"Bhaktapur","city":"Bhaktapur","students":"124","staff":"12","rev":"₹2.4L","status":"Active"},
    {"id":"4","name":"Pokhara","city":"Pokhara","students":"148","staff":"14","rev":"₹3.2L","status":"Active"},
    {"id":"5","name":"Butwal","city":"Butwal","students":"84","staff":"8","rev":"₹1.4L","status":"Active"}
      ]}
    />
  ),
});
