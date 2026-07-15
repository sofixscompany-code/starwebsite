import { createFileRoute } from "@tanstack/react-router";
import { ModulePage } from "@/components/admin/ModulePage";
import { Briefcase, CalendarOff, UserPlus, Wallet } from "lucide-react";

export const Route = createFileRoute("/_authenticated/admin/hr/employees")({
  component: () => (
    <ModulePage
      title="Employees"
      subtitle="104 employees across 8 departments."
      addLabel="Add"
      stats={[
    { label: "Total", value: 104, icon: Briefcase },
    { label: "On leave today", value: 6, icon: CalendarOff, tone: "warning" },
    { label: "New hires", value: 4, icon: UserPlus, tone: "success" },
    { label: "Payroll due", value: "₹18.4L", icon: Wallet }
      ]}
      columns={[
    { key: "emp", label: "Employee" },
    { key: "dept", label: "Department" },
    { key: "role", label: "Role" },
    { key: "join", label: "Joined" },
    { key: "salary", label: "Salary" },
    { key: "status", label: "Status" }
      ]}
      rows={[
    {"id":"1","emp":"Ram Bahadur K.C.","dept":"Academics","role":"Senior Faculty","join":"2018-04-01","salary":"₹65,000","status":"Active"},
    {"id":"2","emp":"Anita Rai","dept":"Accounts","role":"Accountant","join":"2020-01-15","salary":"₹42,000","status":"Active"},
    {"id":"3","emp":"Suman Poudel","dept":"Reception","role":"Front Desk","join":"2022-06-10","salary":"₹28,000","status":"Active"},
    {"id":"4","emp":"Kabita Shrestha","dept":"Academics","role":"Faculty","join":"2021-03-20","salary":"₹52,000","status":"Active"}
      ]}
    />
  ),
});
