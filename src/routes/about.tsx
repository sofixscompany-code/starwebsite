import { createFileRoute } from "@tanstack/react-router";
import { Target, Eye, Trophy, Users } from "lucide-react";
import { SiteHeader } from "@/components/site/SiteHeader";
import { SiteFooter } from "@/components/site/SiteFooter";
import { site } from "@/lib/site-config";

export const Route = createFileRoute("/about")({
  head: () => ({
    meta: [
      { title: "About Star Coaching Institute — Janakpurdham" },
      {
        name: "description",
        content:
          "About Star Coaching Institute Pvt. Ltd., Janakpurdham — history, vision, mission, and message from Managing Director Er. Bablu Yadav.",
      },
    ],
  }),
  component: AboutPage,
});

function AboutPage() {
  return (
    <div className="min-h-screen flex flex-col">
      <SiteHeader />
      <main className="flex-1">
        <section className="bg-navy text-navy-foreground py-14">
          <div className="max-w-6xl mx-auto px-4 text-center">
            <p className="text-xs uppercase tracking-widest text-gold font-bold">About Us</p>
            <h1 className="font-display font-black text-3xl md:text-5xl mt-2">
              Building Nepal's future — one student at a time.
            </h1>
            <p className="mt-4 text-white/70 max-w-2xl mx-auto">
              Star Coaching Institute Pvt. Ltd. is a Janakpurdham-based coaching institute
              specializing in Security Forces, Loksewa, Medical, Technical and School education.
            </p>
          </div>
        </section>

        <section className="py-14">
          <div className="max-w-4xl mx-auto px-4 prose prose-slate max-w-none">
            <h2 className="font-display font-black text-2xl text-navy">Our history</h2>
            <p className="text-foreground/80 leading-relaxed">
              Since {site.established}, Star Coaching Institute has been guiding thousands of
              students from Madhesh Province and beyond to succeed in Nepal Police, Nepal Army,
              Armed Police Force, Loksewa Aayog, and entrance exams for Staff Nurse, HA, CMA/ANM,
              Engineering Diploma and Computer training. Our Zeromile, Janakpurdham-7 campus is a
              trusted preparation hub with hostel facilities for both boys and girls.
            </p>

            <h2 className="font-display font-black text-2xl text-navy mt-8">
              Message from the Managing Director
            </h2>
            <p className="text-foreground/80 leading-relaxed">
              "Dear students and parents, education is not just about academics — it's a journey of
              personal growth, skill development, and pursuit of dreams. Our dedicated team is
              committed to helping you succeed. Stay focused, work hard, and never hesitate to reach
              out. We are here for you."
            </p>
            <p className="font-bold text-navy">— {site.managingDirector}, Managing Director</p>
          </div>
        </section>

        <section className="py-14 bg-secondary/40">
          <div className="max-w-6xl mx-auto px-4 grid gap-6 md:grid-cols-3">
            <ValueCard
              icon={Eye}
              title="Vision"
              body="To become Nepal's most trusted coaching institute for government-service preparation and career-focused technical education."
            />
            <ValueCard
              icon={Target}
              title="Mission"
              body="Deliver disciplined, result-focused coaching with real-service faculty, honest guidance and full support — including scholarships for deserving students."
            />
            <ValueCard
              icon={Trophy}
              title="Achievements"
              body="800+ selections across Nepal Police, Army, APF, Staff Nurse, HA and Engineering Diploma programs — with province toppers every year."
            />
          </div>
        </section>

        <section className="py-14">
          <div className="max-w-6xl mx-auto px-4 text-center">
            <Users className="w-10 h-10 text-brand-red mx-auto" />
            <h2 className="font-display font-black text-2xl md:text-3xl text-navy mt-3">
              Our team
            </h2>
            <p className="text-muted-foreground max-w-xl mx-auto mt-2">
              A blend of experienced faculty from real service backgrounds, dedicated coordinators,
              and physical trainers.
            </p>
          </div>
        </section>
      </main>
      <SiteFooter />
    </div>
  );
}

function ValueCard({
  icon: Icon,
  title,
  body,
}: {
  icon: typeof Target;
  title: string;
  body: string;
}) {
  return (
    <div className="bg-white rounded-2xl border border-border p-6">
      <div className="w-11 h-11 rounded-lg bg-brand-red/10 text-brand-red flex items-center justify-center">
        <Icon className="w-5 h-5" />
      </div>
      <h3 className="font-display font-black text-xl text-navy mt-4">{title}</h3>
      <p className="text-sm text-muted-foreground mt-2 leading-relaxed">{body}</p>
    </div>
  );
}
