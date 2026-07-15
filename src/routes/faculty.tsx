import { createFileRoute } from "@tanstack/react-router";
import { SiteHeader } from "@/components/site/SiteHeader";
import { SiteFooter } from "@/components/site/SiteFooter";
import { faculty } from "@/lib/site-config";

export const Route = createFileRoute("/faculty")({
  head: () => ({
    meta: [
      { title: "Faculty — Star Coaching Institute Janakpurdham" },
      {
        name: "description",
        content:
          "Meet the experienced faculty at Star Coaching Institute — subject experts for Nepal Police, Loksewa, Medical, and Engineering preparation.",
      },
    ],
  }),
  component: FacultyPage,
});

function FacultyPage() {
  return (
    <div className="min-h-screen flex flex-col">
      <SiteHeader />
      <main className="flex-1">
        <section className="bg-navy text-navy-foreground py-14">
          <div className="max-w-6xl mx-auto px-4 text-center">
            <p className="text-xs uppercase tracking-widest text-gold font-bold">Our Faculty</p>
            <h1 className="font-display font-black text-3xl md:text-5xl mt-2">
              Learn from real experts
            </h1>
            <p className="mt-4 text-white/70 max-w-2xl mx-auto">
              A team of subject experts, physical trainers and mentors — many from real service
              backgrounds.
            </p>
          </div>
        </section>

        <section className="py-14">
          <div className="max-w-6xl mx-auto px-4 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {faculty.map((f) => (
              <div
                key={f.name}
                className="bg-white rounded-2xl border border-border p-5 flex items-start gap-4 hover:border-brand-red/40 transition"
              >
                <div className="w-14 h-14 rounded-full bg-gradient-to-br from-navy to-navy/70 text-navy-foreground flex items-center justify-center font-display font-black text-lg shrink-0">
                  {f.initials}
                </div>
                <div>
                  <h3 className="font-display font-bold text-lg text-navy leading-tight">
                    {f.name}
                  </h3>
                  <p className="text-xs uppercase tracking-wider text-brand-red font-bold mt-1">
                    {f.role}
                  </p>
                  <p className="text-sm text-muted-foreground mt-1">{f.subject}</p>
                </div>
              </div>
            ))}
          </div>
        </section>
      </main>
      <SiteFooter />
    </div>
  );
}
