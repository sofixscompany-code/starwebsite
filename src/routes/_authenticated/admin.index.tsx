import { getUserRole } from "@/lib/api-auth";
import { SuperAdminDashboard } from "./dashboard.super-admin";
import { TeacherDashboard } from "./dashboard.teacher";
import { StudentDashboard } from "./dashboard.student";
import { ParentDashboard } from "./dashboard.parent";
import { AccountantDashboard } from "./dashboard.accountant";

export function Dashboard() {
  const role = getUserRole();

  switch (role) {
    case "teacher":
      return <TeacherDashboard />;
    case "student":
      return <StudentDashboard />;
    case "parent":
      return <ParentDashboard />;
    case "accountant":
      return <AccountantDashboard />;
    default:
      return <SuperAdminDashboard />;
  }
}
