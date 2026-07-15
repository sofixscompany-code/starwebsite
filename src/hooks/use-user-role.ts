import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";

export type Role = "admin" | "student" | null;

export async function fetchUserRole(userId: string): Promise<Role> {
  const { data } = await supabase
    .from("user_roles")
    .select("role")
    .eq("user_id", userId);
  if (!data || data.length === 0) return null;
  if (data.some((r) => r.role === "admin")) return "admin";
  return "student";
}

export function routeForRole(role: Role): "/admin" | "/dashboard" {
  return role === "admin" ? "/admin" : "/dashboard";
}

/** Reactively tracks the current user's role. Returns `undefined` while loading. */
export function useUserRole() {
  const [state, setState] = useState<{ userId: string | null; role: Role } | undefined>(undefined);

  useEffect(() => {
    let active = true;
    const load = async (userId: string | null) => {
      if (!userId) {
        if (active) setState({ userId: null, role: null });
        return;
      }
      const role = await fetchUserRole(userId);
      if (active) setState({ userId, role });
    };
    supabase.auth.getUser().then(({ data }) => load(data.user?.id ?? null));
    const { data: sub } = supabase.auth.onAuthStateChange((_e, s) => {
      load(s?.user?.id ?? null);
    });
    return () => {
      active = false;
      sub.subscription.unsubscribe();
    };
  }, []);

  return state;
}
