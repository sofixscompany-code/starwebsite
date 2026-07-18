import { Link } from "react-router-dom";
import { ShieldOff, ArrowLeft } from "lucide-react";

export function AccessDeniedPage() {
  return (
    <div className="min-h-[60vh] flex items-center justify-center px-4">
      <div className="text-center max-w-md">
        <div className="w-16 h-16 rounded-full bg-[hsl(var(--ap-danger)/0.1)] mx-auto flex items-center justify-center mb-4">
          <ShieldOff className="w-8 h-8 text-[hsl(var(--ap-danger))]" />
        </div>
        <h1 className="text-3xl font-bold text-[hsl(var(--ap-ink))] mb-2">Access Denied</h1>
        <p className="text-[hsl(var(--ap-muted))] mb-6">
          You don't have permission to access this page. Contact your administrator if you believe this is a mistake.
        </p>
        <Link
          to="/dashboard/super-admin"
          className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-[hsl(var(--ap-blue))] text-white text-sm font-semibold hover:bg-[hsl(var(--ap-blue-light))] transition"
        >
          <ArrowLeft className="w-4 h-4" /> Back to Dashboard
        </Link>
      </div>
    </div>
  );
}


