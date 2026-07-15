import { useState } from "react";
import { Link, useRouter } from "@tanstack/react-router";
import { Menu, Phone, X, LogOut, LayoutDashboard, Shield } from "lucide-react";
import { StarLogo, StarWordmark } from "./StarLogo";
import { Button } from "@/components/ui/button";
import { site } from "@/lib/site-config";
import { supabase } from "@/integrations/supabase/client";
import { useUserRole, routeForRole } from "@/hooks/use-user-role";
import { cn } from "@/lib/utils";

const nav = [
  { to: "/", label: "Home" },
  { to: "/about", label: "About" },
  { to: "/courses", label: "Courses" },
  { to: "/faculty", label: "Faculty" },
  { to: "/results", label: "Results" },
  { to: "/gallery", label: "Gallery" },
  { to: "/contact", label: "Contact" },
] as const;

export function SiteHeader() {
  const [open, setOpen] = useState(false);
  const roleState = useUserRole();
  const router = useRouter();

  const isSignedIn = !!roleState?.userId;
  const isAdmin = roleState?.role === "admin";
  const homeTarget = routeForRole(roleState?.role ?? null);

  const handleSignOut = async () => {
    await supabase.auth.signOut();
    router.navigate({ to: "/" });
  };

  return (
    <>
      {/* Top contact strip */}
      <div className="bg-navy text-navy-foreground text-xs">
        <div className="max-w-6xl mx-auto px-4 py-2 flex justify-between items-center">
          <a href={`tel:${site.phones[0]}`} className="flex items-center gap-1.5">
            <Phone className="w-3 h-3 text-brand-red" />
            <span className="font-semibold">{site.phones[0]}</span>
            <span className="hidden sm:inline text-white/60">· {site.phones[1]}</span>
          </a>
          <span className="hidden md:inline text-white/70">{site.location}</span>
          {isSignedIn ? (
            <div className="flex items-center gap-3">
              <Link to={homeTarget} className="flex items-center gap-1 font-semibold hover:text-gold">
                {isAdmin ? (
                  <><Shield className="w-3 h-3" /> Admin Panel</>
                ) : (
                  <><LayoutDashboard className="w-3 h-3" /> Dashboard</>
                )}
              </Link>
              <button onClick={handleSignOut} className="flex items-center gap-1 font-semibold hover:text-gold">
                <LogOut className="w-3 h-3" /> Sign out
              </button>
            </div>
          ) : (
            <Link
              to="/auth"
              className="bg-brand-red text-brand-red-foreground font-bold px-3 py-1 rounded-full hover:brightness-110 transition"
            >
              Student Login
            </Link>
          )}
        </div>
      </div>


      <header className="sticky top-0 z-40 bg-white/95 backdrop-blur border-b border-border">
        <div className="max-w-6xl mx-auto px-4 py-3 flex items-center justify-between gap-4">
          <Link to="/" className="flex items-center gap-3">
            <StarLogo size="sm" />
            <StarWordmark />
          </Link>

          <nav className="hidden lg:flex items-center gap-1">
            {nav.map((n) => (
              <NavLink key={n.to} to={n.to} label={n.label} />
            ))}
          </nav>

          <div className="hidden lg:flex items-center gap-2">
            <Button asChild variant="outline" className="border-navy text-navy font-bold">
              <Link to="/admission">Apply Now</Link>
            </Button>
          </div>

          <button
            className="lg:hidden p-2 text-navy"
            onClick={() => setOpen((v) => !v)}
            aria-label="Toggle menu"
          >
            {open ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
          </button>
        </div>

        {open && (
          <div className="lg:hidden border-t border-border bg-white">
            <nav className="max-w-6xl mx-auto px-4 py-3 flex flex-col gap-1">
              {nav.map((n) => (
                <Link
                  key={n.to}
                  to={n.to}
                  onClick={() => setOpen(false)}
                  className="py-2.5 px-3 rounded-lg font-semibold text-navy hover:bg-secondary"
                >
                  {n.label}
                </Link>
              ))}
              <Link
                to="/admission"
                onClick={() => setOpen(false)}
                className="mt-2 py-3 px-3 rounded-lg bg-brand-red text-brand-red-foreground font-bold text-center"
              >
                Apply Now
              </Link>
            </nav>
          </div>
        )}
      </header>
    </>
  );
}

function NavLink({ to, label }: { to: string; label: string }) {
  return (
    <Link
      to={to}
      className={cn(
        "px-3 py-2 text-sm font-semibold text-foreground/80 hover:text-navy rounded-md transition",
      )}
      activeProps={{ className: "text-navy bg-secondary" }}
      activeOptions={{ exact: to === "/" }}
    >
      {label}
    </Link>
  );
}
