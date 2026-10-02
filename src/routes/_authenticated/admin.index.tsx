import { useNavigate } from "react-router-dom";
import { getUserRole, handleSignOut } from "@/lib/api-auth";
import { SuperAdminDashboard } from "./dashboard.super-admin";
import { TeacherDashboard } from "./dashboard.teacher";
import { StudentDashboard } from "./dashboard.student";
import { ParentDashboard } from "./dashboard.parent";
import { AccountantDashboard } from "./dashboard.accountant";
import { ShieldOff } from "lucide-react";

export function Dashboard() {
  const role = getUserRole();
  const navigate = useNavigate();

  switch (role) {
    case "super_admin":
      return <SuperAdminDashboard />;
    case "teacher":
      return <TeacherDashboard />;
    case "student":
      return <StudentDashboard />;
    case "parent":
      return <ParentDashboard />;
    case "accountant":
      return <AccountantDashboard />;
    default:
      // No (or unknown) role — never fall back to the super-admin dashboard.
      return (
        <div className="rounded-xl border border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900 p-8 text-center max-w-lg mx-auto mt-10">
          <div className="w-14 h-14 rounded-full bg-red-50 dark:bg-red-900/20 mx-auto flex items-center justify-center mb-4">
            <ShieldOff className="w-7 h-7 text-red-500" />
          </div>
          <p className="text-lg font-semibold text-gray-900 dark:text-white">No role assigned</p>
          <p className="text-sm text-gray-500 dark:text-gray-400 mt-2">
            Your account isn&apos;t linked to a role yet. Please contact your administrator to get
            access, or sign in with a different account.
          </p>
          <button
            onClick={() => void handleSignOut(navigate)}
            className="mt-5 px-4 py-2 rounded-lg bg-indigo-600 text-white text-sm font-medium hover:bg-indigo-700 transition-colors"
          >
            Sign out
          </button>
        </div>
      );
  }
}
