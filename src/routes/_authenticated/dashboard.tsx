import { createFileRoute, Link, redirect } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Bell, FileCheck, GraduationCap, User, ShieldCheck, Loader2 } from "lucide-react";
import { SiteHeader } from "@/components/site/SiteHeader";
import { SiteFooter } from "@/components/site/SiteFooter";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { fetchUserRole } from "@/hooks/use-user-role";

export const Route = createFileRoute("/_authenticated/dashboard")({
  beforeLoad: async () => {
    const { data } = await supabase.auth.getUser();
    if (!data.user) return;
    const role = await fetchUserRole(data.user.id);
    if (role === "admin") throw redirect({ to: "/admin" });
  },
  component: DashboardPage,
});

function DashboardPage() {
  const [userId, setUserId] = useState<string | null>(null);
  const [email, setEmail] = useState<string>("");

  useEffect(() => {
    supabase.auth.getUser().then(({ data }) => {
      setUserId(data.user?.id ?? null);
      setEmail(data.user?.email ?? "");
    });
  }, []);

  const { data: profile } = useQuery({
    queryKey: ["profile", userId],
    queryFn: async () => {
      if (!userId) return null;
      const { data } = await supabase
        .from("profiles")
        .select("*")
        .eq("id", userId)
        .maybeSingle();
      return data;
    },
    enabled: !!userId,
  });

  const { data: roles = [] } = useQuery({
    queryKey: ["roles", userId],
    queryFn: async () => {
      if (!userId) return [];
      const { data } = await supabase
        .from("user_roles")
        .select("role")
        .eq("user_id", userId);
      return data ?? [];
    },
    enabled: !!userId,
  });

  const isAdmin = roles.some((r) => r.role === "admin");

  const { data: admissions = [] } = useQuery({
    queryKey: ["my-admissions", userId],
    queryFn: async () => {
      if (!userId) return [];
      const { data } = await supabase
        .from("admissions")
        .select("id, admission_number, course_title, status, created_at")
        .eq("user_id", userId)
        .order("created_at", { ascending: false });
      return data ?? [];
    },
    enabled: !!userId,
  });

  const { data: notices = [] } = useQuery({
    queryKey: ["dashboard-notices"],
    queryFn: async () => {
      const { data } = await supabase
        .from("notices")
        .select("id, title, body, category, published_at")
        .eq("is_published", true)
        .order("published_at", { ascending: false })
        .limit(6);
      return data ?? [];
    },
  });

  if (!userId) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="w-6 h-6 animate-spin text-navy" />
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col">
      <SiteHeader />
      <main className="flex-1 bg-secondary/30">
        <section className="bg-navy text-navy-foreground py-10">
          <div className="max-w-6xl mx-auto px-4 flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div>
              <p className="text-xs uppercase tracking-widest text-gold font-bold">
                Student Dashboard
              </p>
              <h1 className="font-display font-black text-2xl md:text-3xl mt-1">
                Welcome, {profile?.full_name || email.split("@")[0]}
              </h1>
              <p className="text-white/60 text-sm mt-1">{email}</p>
            </div>
            {isAdmin && (
              <Button asChild className="bg-brand-red hover:bg-brand-red/90 text-brand-red-foreground font-bold">
                <Link to="/admin">
                  <ShieldCheck className="w-4 h-4 mr-2" /> Open Admin Panel
                </Link>
              </Button>
            )}
          </div>
        </section>

        <section className="max-w-6xl mx-auto px-4 py-10 grid gap-6 lg:grid-cols-3">
          {/* Profile */}
          <div className="bg-white rounded-2xl border border-border p-6">
            <div className="flex items-center gap-2 mb-4">
              <User className="w-5 h-5 text-brand-red" />
              <h2 className="font-display font-black text-lg text-navy">Profile</h2>
            </div>
            <dl className="space-y-2 text-sm">
              <Row label="Name" value={profile?.full_name || "—"} />
              <Row label="Phone" value={profile?.phone || "—"} />
              <Row label="Email" value={email} />
              <Row label="Role" value={isAdmin ? "Admin" : "Student"} />
            </dl>
          </div>

          {/* Admissions */}
          <div className="bg-white rounded-2xl border border-border p-6 lg:col-span-2">
            <div className="flex items-center gap-2 mb-4">
              <FileCheck className="w-5 h-5 text-brand-red" />
              <h2 className="font-display font-black text-lg text-navy">My Admissions</h2>
            </div>
            {admissions.length === 0 ? (
              <div className="text-center py-8">
                <GraduationCap className="w-10 h-10 text-muted-foreground mx-auto opacity-40" />
                <p className="text-sm text-muted-foreground mt-2">
                  You haven't applied for any course yet.
                </p>
                <Button asChild className="mt-4 bg-brand-red hover:bg-brand-red/90 text-brand-red-foreground font-bold">
                  <Link to="/admission">Apply now</Link>
                </Button>
              </div>
            ) : (
              <div className="space-y-3">
                {admissions.map((a) => (
                  <div
                    key={a.id}
                    className="border border-border rounded-xl p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3"
                  >
                    <div>
                      <p className="font-display font-bold text-navy">{a.course_title}</p>
                      <p className="text-xs text-muted-foreground mt-0.5">
                        {a.admission_number} ·{" "}
                        {new Date(a.created_at).toLocaleDateString("en-GB")}
                      </p>
                    </div>
                    <span className={statusPill(a.status)}>{a.status}</span>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Notices */}
          <div className="bg-white rounded-2xl border border-border p-6 lg:col-span-3">
            <div className="flex items-center gap-2 mb-4">
              <Bell className="w-5 h-5 text-brand-red" />
              <h2 className="font-display font-black text-lg text-navy">Notices & Announcements</h2>
            </div>
            <div className="grid gap-3 md:grid-cols-2">
              {notices.map((n) => (
                <div key={n.id} className="border border-border rounded-xl p-4">
                  <span className="text-[10px] uppercase font-bold px-2 py-0.5 rounded bg-brand-red/10 text-brand-red">
                    {n.category}
                  </span>
                  <p className="font-display font-bold text-sm text-navy mt-2">{n.title}</p>
                  <p className="text-xs text-muted-foreground mt-1 line-clamp-3">{n.body}</p>
                </div>
              ))}
            </div>
          </div>
        </section>
      </main>
      <SiteFooter />
    </div>
  );
}

function Row({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex justify-between gap-4">
      <dt className="text-muted-foreground">{label}</dt>
      <dd className="font-semibold text-foreground text-right">{value}</dd>
    </div>
  );
}

function statusPill(status: string) {
  const base = "px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider";
  if (status === "approved") return `${base} bg-emerald-100 text-emerald-800`;
  if (status === "rejected") return `${base} bg-red-100 text-red-800`;
  return `${base} bg-amber-100 text-amber-800`;
}
