import { Link } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import {
  ShieldCheck,
  Stethoscope,
  Wrench,
  Monitor,
  GraduationCap,
  BookOpen,
  Phone,
  MessageCircle,
  ArrowRight,
  Star,
  Award,
  CheckCircle2,
  Quote,
  Calendar,
  Bell,
} from "lucide-react";
import { SiteHeader } from "@/components/site/SiteHeader";
import { SiteFooter } from "@/components/site/SiteFooter";
import { HeroSlider } from "@/components/site/HeroSlider";
import { Button } from "@/components/ui/button";
import { StarLogo } from "@/components/site/StarLogo";
import { site, stats, toppers, testimonials } from "@/lib/site-config";
import { firebaseAuth } from "@/integrations/firebase/auth";
import { collection, query, where, orderBy, limit, getDocs } from "firebase/firestore";
import { db } from "@/integrations/firebase/config";



const categories = [
  {
    icon: ShieldCheck,
    title: "Security Forces",
    desc: "Nepal Police · Army · Armed Police",
    color: "bg-blue-50 text-navy",
  },
  {
    icon: Award,
    title: "Loksewa Aayog",
    desc: "Kharidar · Na.Su. · Officer",
    color: "bg-red-50 text-brand-red",
  },
  {
    icon: Stethoscope,
    title: "Medical & Nursing",
    desc: "Staff Nurse · HA · CMA / ANM",
    color: "bg-emerald-50 text-emerald-700",
  },
  {
    icon: Wrench,
    title: "Engineering Diploma",
    desc: "Civil · Mechanical · IT · Electrical",
    color: "bg-amber-50 text-amber-700",
  },
  {
    icon: Monitor,
    title: "Computer Training",
    desc: "Office · AutoCAD · C++",
    color: "bg-indigo-50 text-indigo-700",
  },
  {
    icon: BookOpen,
    title: "SEE & Bridge Course",
    desc: "Class 8-10 · +2 Bridge",
    color: "bg-purple-50 text-purple-700",
  },
] as const;

export function Index() {
  const { data: notices = [] } = useQuery({
    queryKey: ["home-notices"],
    queryFn: async () => {
      const q = query(collection(db, "notices"), where("isPublished", "==", true), orderBy("publishedAt", "desc"), limit(4));
      const snap = await getDocs(q);
      return snap.docs.map((d) => ({ id: d.id, ...d.data() }));
    },
  });

  return (
    <div className="min-h-screen flex flex-col bg-background">
      <SiteHeader />

      <HeroSlider />

      {/* HERO */}
      <section className="relative overflow-hidden bg-secondary/40">
        <div className="max-w-6xl mx-auto px-4 pt-8 md:pt-14 pb-6">
          {/* Admission Open ribbon */}
          <div className="mb-6 -mx-4 md:mx-0">
            <div className="ribbon-slash px-6 py-2 md:rounded-md text-center">
              <p className="font-display font-black text-lg md:text-xl tracking-widest text-navy-foreground">
                &#9733; ADMISSION OPEN — 2081/82 &#9733;
              </p>
            </div>
          </div>

          <div className="grid gap-8 md:grid-cols-2 items-center">
            <div>
              <span className="inline-block bg-brand-red/10 text-brand-red font-bold text-xs uppercase tracking-widest px-3 py-1 rounded-full mb-4">
                Nepal's Trusted Preparation
              </span>
              <h1 className="font-display text-3xl md:text-5xl font-black leading-[1.05] text-foreground">
                Become the next{" "}
                <span className="text-brand-red italic underline decoration-4 decoration-brand-red/40 underline-offset-4">
                  Star Success
                </span>{" "}
                Story
              </h1>
              <p className="mt-4 text-base md:text-lg text-muted-foreground max-w-lg leading-relaxed">
                Focused coaching for <strong>Nepal Police, Nepal Army, Armed Police, Loksewa,
                Medical & Technical entrance</strong> — plus school tuition, since 2015.
              </p>

              <div className="mt-6 flex flex-col sm:flex-row gap-3">
                <Button asChild size="lg" className="bg-brand-red hover:bg-brand-red/90 text-brand-red-foreground font-bold shadow-red">
                  <Link to="/admission">
                    Online Admission <ArrowRight className="w-4 h-4 ml-1" />
                  </Link>
                </Button>
                <Button asChild size="lg" variant="outline" className="border-2 border-navy text-navy font-bold">
                  <Link to="/courses">Explore Courses</Link>
                </Button>
              </div>

              <div className="mt-6 flex flex-wrap gap-4 text-sm">
                <a
                  href={`tel:${site.phones[0]}`}
                  className="flex items-center gap-2 text-navy font-semibold hover:underline"
                >
                  <Phone className="w-4 h-4" /> {site.phones[0]}
                </a>
                <a
                  href={`https://wa.me/977${site.whatsapp}`}
                  className="flex items-center gap-2 text-emerald-700 font-semibold hover:underline"
                >
                  <MessageCircle className="w-4 h-4" /> WhatsApp Chat
                </a>
              </div>
            </div>

            {/* Hero card cluster */}
            <div className="relative">
              <div className="relative bg-white rounded-2xl border-2 border-navy/10 p-6 shadow-brand">
                <div className="absolute -top-3 -right-3 bg-gold text-navy px-3 py-1 rounded-full text-xs font-black uppercase tracking-wider shadow-md">
                  Super 40 · 40% Off
                </div>
                <div className="flex items-center gap-3 mb-4">
                  <div className="w-12 h-12 flex items-center justify-center bg-white rounded-xl shadow-sm">
                    <StarLogo size="md" />
                  </div>
                  <div>
                    <p className="font-display font-black text-navy text-lg leading-tight">
                      Scholarship Batch
                    </p>
                    <p className="text-xs text-muted-foreground">
                      Merit-based, up to 40% fee waiver
                    </p>
                  </div>
                </div>
                <ul className="space-y-2.5 text-sm">
                  {[
                    "Entrance Preparation (After SEE)",
                    "Bridge Course +2 Science/Management",
                    "Police, Army & Loksewa Coaching",
                    "Hostel available — Boys & Girls",
                  ].map((f) => (
                    <li key={f} className="flex items-start gap-2">
                      <CheckCircle2 className="w-4 h-4 text-brand-red mt-0.5 shrink-0" />
                      <span className="text-foreground">{f}</span>
                    </li>
                  ))}
                </ul>
                <div className="mt-5 pt-5 border-t border-border grid grid-cols-3 gap-2 text-center">
                  {stats.slice(0, 3).map((s) => (
                    <div key={s.label}>
                      <p className="font-display font-black text-navy text-base md:text-lg leading-none">
                        {s.value}
                      </p>
                      <p className="text-[10px] text-muted-foreground uppercase tracking-wider mt-1">
                        {s.label}
                      </p>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* STATS BAR */}
      <section className="bg-navy text-navy-foreground">
        <div className="max-w-6xl mx-auto px-4 py-6 grid grid-cols-2 md:grid-cols-4 divide-y md:divide-y-0 md:divide-x divide-white/10">
          {stats.map((s) => (
            <div key={s.label} className="text-center py-3 md:py-0">
              <p className="font-display text-2xl md:text-3xl font-black text-gold">{s.value}</p>
              <p className="text-[10px] md:text-xs uppercase tracking-wider text-white/70 mt-1">
                {s.label}
              </p>
            </div>
          ))}
        </div>
      </section>

      {/* COURSE CATEGORIES */}
      <section className="py-14">
        <div className="max-w-6xl mx-auto px-4">
          <SectionHead
            eyebrow="Preparation Excellence"
            title="What you can prepare for"
            subtitle="From uniform services to medical, technical and school tuition — all under one roof."
          />
          <div className="grid grid-cols-2 md:grid-cols-3 gap-3 md:gap-4">
            {categories.map((c) => (
              <Link
                key={c.title}
                to="/courses"
                className="group bg-white border border-border rounded-2xl p-4 md:p-5 hover:border-navy/30 hover:shadow-md transition"
              >
                <div className={`w-10 h-10 rounded-lg flex items-center justify-center mb-3 ${c.color}`}>
                  <c.icon className="w-5 h-5" />
                </div>
                <h3 className="font-display font-bold text-sm md:text-base text-foreground leading-tight">
                  {c.title}
                </h3>
                <p className="text-xs text-muted-foreground mt-1">{c.desc}</p>
                <p className="mt-3 text-xs font-bold text-brand-red flex items-center gap-1 opacity-0 group-hover:opacity-100 transition">
                  View <ArrowRight className="w-3 h-3" />
                </p>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* NOTICES + WHY US */}
      <section className="py-6">
        <div className="max-w-6xl mx-auto px-4 grid gap-6 lg:grid-cols-3">
          <div className="lg:col-span-2 bg-white border border-border rounded-2xl p-6">
            <div className="flex items-center gap-2 mb-4">
              <Bell className="w-5 h-5 text-brand-red" />
              <h3 className="font-display font-black text-lg text-navy">Latest Notices</h3>
            </div>
            <ul className="divide-y divide-border">
              {notices.length === 0 && (
                <li className="py-3 text-sm text-muted-foreground">No notices yet.</li>
              )}
              {notices.map((n: any) => (
                <li key={n.id} className="py-3 flex items-start gap-3">
                  <span className="text-[10px] uppercase font-bold px-2 py-0.5 rounded bg-brand-red/10 text-brand-red mt-0.5">
                    {n.category}
                  </span>
                  <div className="flex-1">
                    <p className="text-sm font-semibold text-foreground leading-snug">{n.title}</p>
                    <p className="text-[11px] text-muted-foreground mt-0.5 flex items-center gap-1">
                      <Calendar className="w-3 h-3" />
                      {n.publishedAt ? new Date(n.publishedAt.toDate?.() ?? n.publishedAt).toLocaleDateString("en-GB", {
                        day: "numeric",
                        month: "short",
                        year: "numeric",
                      }) : "—"}
                    </p>
                  </div>
                </li>
              ))}
            </ul>
          </div>

          <div className="bg-navy text-navy-foreground rounded-2xl p-6">
            <p className="text-xs uppercase tracking-widest text-gold font-bold mb-2">Why choose us</p>
            <h3 className="font-display font-black text-2xl leading-tight">
              Result-focused. Locally rooted. Nationally trusted.
            </h3>
            <ul className="mt-5 space-y-3 text-sm">
              {[
                "Experienced faculty from real service backgrounds",
                "Daily physical + written training",
                "Regular mock tests & OMR-based practice",
                "Hostel for both boys and girls",
                "Super 40 Scholarship — up to 40% off",
              ].map((x) => (
                <li key={x} className="flex items-start gap-2">
                  <Star className="w-4 h-4 text-gold mt-0.5 shrink-0" />
                  <span>{x}</span>
                </li>
              ))}
            </ul>
          </div>
        </div>
      </section>

      {/* TOP SELECTIONS */}
      <section className="py-14 bg-secondary/40 mt-10">
        <div className="max-w-6xl mx-auto px-4">
          <SectionHead
            eyebrow="Congratulations Stars"
            title="Top Selections of Star Coaching"
            subtitle="Real students, real posts. A snapshot of our recent selections across Nepal."
          />
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
            {toppers.slice(0, 12).map((t) => (
              <div
                key={t.name}
                className="bg-white rounded-xl border border-border overflow-hidden text-center hover:border-brand-red/40 transition"
              >
                <div className="aspect-square bg-gradient-to-br from-navy/90 to-navy/70 flex items-center justify-center text-navy-foreground font-display font-black text-3xl">
                  {t.name
                    .split(" ")
                    .map((n) => n[0])
                    .slice(0, 2)
                    .join("")}
                </div>
                <div className="p-3">
                  <p className="font-display font-bold text-sm text-foreground leading-tight">
                    {t.name}
                  </p>
                  <p className="text-[11px] text-brand-red font-semibold uppercase tracking-wider mt-1">
                    {t.post}
                  </p>
                </div>
              </div>
            ))}
          </div>
          <div className="mt-6 text-center">
            <Button asChild variant="outline" className="border-navy text-navy font-bold">
              <Link to="/results">See all results</Link>
            </Button>
          </div>
        </div>
      </section>

      {/* MD MESSAGE */}
      <section className="py-14">
        <div className="max-w-4xl mx-auto px-4">
          <div className="bg-white border border-border rounded-2xl p-6 md:p-10 relative">
            <Quote className="absolute top-4 left-4 w-12 h-12 text-brand-red/10" />
            <div className="flex flex-col md:flex-row items-start gap-6">
              <div className="w-20 h-20 rounded-full bg-navy text-navy-foreground flex items-center justify-center font-display font-black text-3xl shrink-0">
                BY
              </div>
              <div>
                <p className="text-xs uppercase tracking-widest text-brand-red font-bold">
                  Message from the Managing Director
                </p>
                <h3 className="font-display font-black text-2xl text-navy mt-1">
                  {site.managingDirector}
                </h3>
                <p className="mt-4 text-foreground leading-relaxed">
                  "Dear students and parents, as the Managing Director of Star Coaching Institute,
                  I want to say that education is not just about academics — it's a journey of
                  personal growth, skill development, and pursuit of dreams. Our dedicated team is
                  committed to your success. Stay focused, work hard, and never hesitate to reach
                  out. We are here for you."
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* TESTIMONIALS */}
      <section className="py-14 bg-secondary/40">
        <div className="max-w-6xl mx-auto px-4">
          <SectionHead
            eyebrow="Success Stories"
            title="What our students say"
            subtitle="Real words from students who trusted Star Coaching and cleared their exams."
          />
          <div className="grid gap-4 md:grid-cols-3">
            {testimonials.map((t) => (
              <div key={t.name} className="bg-white rounded-xl border border-border p-5">
                <Quote className="w-6 h-6 text-brand-red mb-3" />
                <p className="text-sm text-foreground leading-relaxed">"{t.quote}"</p>
                <div className="mt-4 pt-4 border-t border-border">
                  <p className="font-bold text-sm text-navy">{t.name}</p>
                  <p className="text-xs text-brand-red font-semibold uppercase tracking-wider">
                    {t.result}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-14">
        <div className="max-w-4xl mx-auto px-4">
          <div className="bg-navy text-navy-foreground rounded-2xl p-8 md:p-12 text-center relative overflow-hidden">
            <div className="absolute inset-0 bg-gradient-to-br from-brand-red/20 to-transparent" />
            <div className="relative">
              <GraduationCap className="w-12 h-12 text-gold mx-auto mb-3" />
              <h3 className="font-display font-black text-2xl md:text-4xl leading-tight">
                Take the first step. Your Star journey starts today.
              </h3>
              <p className="mt-3 text-white/70 max-w-xl mx-auto">
                Apply online in under 3 minutes. Our team will call you back to complete admission.
              </p>
              <div className="mt-6 flex flex-col sm:flex-row justify-center gap-3">
                <Button asChild size="lg" className="bg-brand-red hover:bg-brand-red/90 text-brand-red-foreground font-bold">
                  <Link to="/admission">Start Online Admission</Link>
                </Button>
                <Button asChild size="lg" variant="outline" className="border-white/30 text-navy-foreground hover:bg-white/10 hover:text-navy-foreground font-bold">
                  <a href={`tel:${site.phones[0]}`}>Call {site.phones[0]}</a>
                </Button>
              </div>
            </div>
          </div>
        </div>
      </section>

      <SiteFooter />
    </div>
  );
}

export function SectionHead({
  eyebrow,
  title,
  subtitle,
}: {
  eyebrow: string;
  title: string;
  subtitle?: string;
}) {
  return (
    <div className="text-center max-w-2xl mx-auto mb-8">
      <p className="text-xs uppercase tracking-widest text-brand-red font-bold">{eyebrow}</p>
      <h2 className="mt-2 font-display font-black text-2xl md:text-4xl text-navy leading-tight">
        {title}
      </h2>
      {subtitle && (
        <p className="mt-3 text-sm md:text-base text-muted-foreground">{subtitle}</p>
      )}
    </div>
  );
}




