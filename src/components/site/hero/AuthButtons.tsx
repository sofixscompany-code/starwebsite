import { Link } from "react-router-dom";
import { LogIn, UserPlus, LayoutDashboard } from "lucide-react";
import { Button } from "@/components/ui/button";
import { isAuthenticated, getUserRole } from "@/lib/api-auth";
import { ROLE_DASHBOARD_ROUTES } from "@/hooks/use-user-role";

export function AuthButtons() {
  const signedIn = isAuthenticated();
  const role = getUserRole();
  const dashboardTarget = role ? ROLE_DASHBOARD_ROUTES[role] || "/auth" : "/auth";

  if (signedIn) {
    return (
      <Button
        asChild
        size="lg"
        className="bg-navy hover:bg-navy/90 dark:bg-slate-700 dark:hover:bg-slate-600 text-navy-foreground font-bold rounded-lg shadow-sm transition-all hover:-translate-y-0.5"
      >
        <Link to={dashboardTarget}>
          <LayoutDashboard className="w-4 h-4" /> Go to Dashboard
        </Link>
      </Button>
    );
  }

  return (
    <div className="flex flex-wrap items-center gap-3">
      <Button
        asChild
        size="lg"
        variant="outline"
        className="border-2 border-navy text-navy hover:bg-navy hover:text-white dark:border-slate-300 dark:text-slate-200 rounded-lg font-bold transition-all hover:-translate-y-0.5"
      >
        <Link to="/auth">
          <LogIn className="w-4 h-4" /> Sign In
        </Link>
      </Button>
      <Button
        asChild
        size="lg"
        className="bg-brand-red hover:bg-brand-red/90 text-brand-red-foreground font-bold rounded-lg shadow-red transition-all hover:-translate-y-0.5 hover:shadow-xl"
      >
        <Link to="/register">
          <UserPlus className="w-4 h-4" /> Sign Up
        </Link>
      </Button>
    </div>
  );
}
