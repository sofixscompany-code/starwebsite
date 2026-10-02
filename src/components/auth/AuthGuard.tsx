import { useEffect, useState } from "react";
import { Outlet, Navigate } from "react-router-dom";
import { isAuthenticated, verifyToken, clearAuthData, getUserRole } from "@/lib/api-auth";

/**
 * Route guard for /admin and /dashboard/*.
 *
 * Checks are two-layered:
 * 1. Local session markers (auth_token / auth_user) — instant rejection when
 *    there is nothing stored at all.
 * 2. verifyToken() — validates the *Firebase* session and re-fetches the role
 *    from Firestore. A hand-crafted localStorage session with no signed-in
 *    Firebase user fails here and is wiped, so a tampered `auth_user` can never
 *    grant a dashboard.
 *
 * While checking, a minimal loader is rendered to avoid a redirect flicker on
 * cold reload (Firebase auth restores asynchronously).
 */
export function AuthGuard() {
  const [state, setState] = useState<"checking" | "ok" | "no">("checking");

  useEffect(() => {
    let cancelled = false;

    (async () => {
      if (!isAuthenticated()) {
        if (!cancelled) setState("no");
        return;
      }

      const res = await verifyToken();
      if (cancelled) return;

      if (!res.valid) {
        clearAuthData();
        setState("no");
        return;
      }

      // Keep the cached role in sync with the server-truth role (covers role
      // changes made by an admin as well as tampered localStorage).
      const stored = getUserRole();
      if (stored && stored !== res.user.role) {
        try {
          const raw = localStorage.getItem("auth_user");
          if (raw) {
            const u = JSON.parse(raw) as Record<string, unknown>;
            u.role = res.user.role;
            localStorage.setItem("auth_user", JSON.stringify(u));
          }
        } catch {
          // ignore — worst case the stale role refreshes on next login
        }
      }

      setState("ok");
    })();

    return () => {
      cancelled = true;
    };
  }, []);

  if (state === "checking") {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-950">
        <div className="h-8 w-8 rounded-full border-2 border-gray-300 dark:border-gray-700 border-t-indigo-600 animate-spin" />
      </div>
    );
  }

  if (state === "no") {
    return <Navigate to="/auth" replace />;
  }

  return <Outlet />;
}
