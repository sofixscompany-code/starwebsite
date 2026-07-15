import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useState, useEffect } from "react";
import { Loader2 } from "lucide-react";
import { toast } from "sonner";
import { SiteHeader } from "@/components/site/SiteHeader";
import { SiteFooter } from "@/components/site/SiteFooter";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { supabase } from "@/integrations/supabase/client";
import { StarLogo } from "@/components/site/StarLogo";
import { fetchUserRole, routeForRole } from "@/hooks/use-user-role";

export const Route = createFileRoute("/auth")({
  head: () => ({
    meta: [
      { title: "Student Login — Star Coaching Institute" },
      { name: "description", content: "Sign in to your Star Coaching Institute student dashboard." },
    ],
  }),
  component: AuthPage,
});

function AuthPage() {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [signIn, setSignIn] = useState({ email: "", password: "" });
  const [signUp, setSignUp] = useState({ full_name: "", phone: "", email: "", password: "" });

  const goByRole = async (userId: string) => {
    const role = await fetchUserRole(userId);
    navigate({ to: routeForRole(role) });
  };

  useEffect(() => {
    supabase.auth.getUser().then(({ data }) => {
      if (data.user) goByRole(data.user.id);
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleSignIn = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email: signIn.email.trim(),
        password: signIn.password,
      });
      if (error) throw error;
      toast.success("Welcome back!");
      if (data.user) await goByRole(data.user.id);
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Sign in failed");
    } finally {
      setLoading(false);
    }
  };

  const handleSignUp = async (e: React.FormEvent) => {
    e.preventDefault();
    if (signUp.password.length < 6) {
      toast.error("Password must be at least 6 characters.");
      return;
    }
    setLoading(true);
    try {
      const redirectUrl = `${window.location.origin}/dashboard`;
      const { data, error } = await supabase.auth.signUp({
        email: signUp.email.trim(),
        password: signUp.password,
        options: {
          emailRedirectTo: redirectUrl,
          data: { full_name: signUp.full_name, phone: signUp.phone },
        },
      });
      if (error) throw error;
      toast.success("Account created! Check your email to confirm (if required).");
      if (data.user) await goByRole(data.user.id);
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Sign up failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex flex-col bg-secondary/30">
      <SiteHeader />
      <main className="flex-1 flex items-center justify-center py-10 px-4">
        <div className="w-full max-w-md">
          <div className="text-center mb-6">
            <div className="flex justify-center mb-3">
              <StarLogo size="lg" />
            </div>
            <h1 className="font-display font-black text-2xl text-navy">Student Portal</h1>
            <p className="text-sm text-muted-foreground mt-1">
              Sign in or create your account to access your dashboard.
            </p>
          </div>

          <div className="bg-white rounded-2xl border border-border p-6 shadow-sm">
            <Tabs defaultValue="signin">
              <TabsList className="grid grid-cols-2 w-full">
                <TabsTrigger value="signin">Sign in</TabsTrigger>
                <TabsTrigger value="signup">Create account</TabsTrigger>
              </TabsList>

              <TabsContent value="signin">
                <form onSubmit={handleSignIn} className="space-y-4 mt-4">
                  <div className="space-y-1.5">
                    <Label>Email</Label>
                    <Input
                      type="email"
                      required
                      value={signIn.email}
                      onChange={(e) => setSignIn((s) => ({ ...s, email: e.target.value }))}
                    />
                  </div>
                  <div className="space-y-1.5">
                    <Label>Password</Label>
                    <Input
                      type="password"
                      required
                      value={signIn.password}
                      onChange={(e) => setSignIn((s) => ({ ...s, password: e.target.value }))}
                    />
                  </div>
                  <Button
                    type="submit"
                    disabled={loading}
                    className="w-full bg-navy hover:bg-navy/90 text-navy-foreground font-bold"
                  >
                    {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : "Sign in"}
                  </Button>
                </form>
              </TabsContent>

              <TabsContent value="signup">
                <form onSubmit={handleSignUp} className="space-y-4 mt-4">
                  <div className="space-y-1.5">
                    <Label>Full Name</Label>
                    <Input
                      required
                      value={signUp.full_name}
                      onChange={(e) => setSignUp((s) => ({ ...s, full_name: e.target.value }))}
                    />
                  </div>
                  <div className="space-y-1.5">
                    <Label>Phone</Label>
                    <Input
                      required
                      value={signUp.phone}
                      onChange={(e) => setSignUp((s) => ({ ...s, phone: e.target.value }))}
                    />
                  </div>
                  <div className="space-y-1.5">
                    <Label>Email</Label>
                    <Input
                      type="email"
                      required
                      value={signUp.email}
                      onChange={(e) => setSignUp((s) => ({ ...s, email: e.target.value }))}
                    />
                  </div>
                  <div className="space-y-1.5">
                    <Label>Password</Label>
                    <Input
                      type="password"
                      required
                      minLength={6}
                      value={signUp.password}
                      onChange={(e) => setSignUp((s) => ({ ...s, password: e.target.value }))}
                    />
                  </div>
                  <Button
                    type="submit"
                    disabled={loading}
                    className="w-full bg-brand-red hover:bg-brand-red/90 text-brand-red-foreground font-bold"
                  >
                    {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : "Create account"}
                  </Button>
                </form>
              </TabsContent>
            </Tabs>
          </div>
        </div>
      </main>
      <SiteFooter />
    </div>
  );
}
