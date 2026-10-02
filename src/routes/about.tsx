import { Link } from "react-router-dom";
import {
  Target,
  Eye,
  Trophy,
  Users,
  ArrowRight,
  CheckCircle2,
  Award,
  Star,
  GraduationCap,
  Sparkles,
} from "lucide-react";
import { SiteHeader } from "@/components/site/SiteHeader";
import { SiteFooter } from "@/components/site/SiteFooter";
import { Button } from "@/components/ui/button";
import { useHomepageStats } from "@/hooks/use-homepage-stats";
import { useMdMessage, useWhyChooseUs } from "@/hooks/use-homepage-settings";
import { useFaculty } from "@/hooks/use-faculty";
import { useLanguage } from "@/hooks/use-language";

const STAT_ICONS = [GraduationCap, Trophy, Sparkles, Award];

const MILESTONES = [
  {
    year: 2015,
    title: "Founded in Janakpurdham",
    body: "Started at Zeromile, Janakpurdham-7 with a vision to prepare Nepal's future uniform-service personnel.",
  },
  {
    year: 2018,
    title: "Hostel facilities launched",
    body: "Safe, separate hostel for boys and girls with mess facilities and 24/7 security.",
  },
  {
    year: 2021,
    title: "Online classes started",
    body: "Live + recorded classes, PDF notes and online mock tests for students anywhere in Nepal.",
  },
  {
    year: "Today",
    title: "800+ selections & province toppers",
    body: "Consistent selections across Nepal Police, Army, APF, Staff Nurse, HA and Engineering Diploma.",
  },
];

function StatsBand() {
  // Same live numbers as the homepage (admin /admin/homepage-stats).
  const stats = useHomepageStats();
  return (
    <section className="bg-navy text-navy-foreground py-12">
      <div className="max-w-6xl mx-auto px-4 grid grid-cols-2 md:grid-cols-4 gap-6">
        {stats.map((s, i) => {
          const Icon = STAT_ICONS[i % STAT_ICONS.length];
          return (
            <div key={s.label} className="text-center">
              <div className="w-11 h-11 mx-auto rounded-full bg-white/10 flex items-center justify-center mb-3">
                <Icon className="w-5 h-5 text-gold" />
              </div>
              <p className="font-display text-2xl md:text-3xl font-black text-gold">{s.value}</p>
              <p className="text-[11px] text-white/60 uppercase tracking-wider mt-1">{s.label}</p>
            </div>
          );
        })}
      </div>
    </section>
  );
}

function Milestones() {
  return (
    <section className="py-14 bg-secondary/40">
      <div className="max-w-4xl mx-auto px-4">
        <div className="text-center mb-10">
          <Award className="w-10 h-10 text-brand-red mx-auto" />
          <h2 className="font-display font-black text-2xl md:text-3xl text-navy mt-3">
            Our Journey
          </h2>
          <p className="text-muted-foreground max-w-xl mx-auto mt-2">
            From a single classroom in Janakpurdham to one of Madhesh's most trusted coaching
            institutes.
          </p>
        </div>
        <div className="space-y-6">
          {MILESTONES.map((m, i) => (
            <div key={`${m.year}-${i}`} className="relative flex gap-4 md:gap-6">
              <div className="flex flex-col items-center">
                <span className="w-5 h-5 rounded-full border-4 border-brand-red/30 bg-white shrink-0 mt-1" />
                {i < MILESTONES.length - 1 && (
                  <span className="w-0.5 flex-1 bg-brand-red/20 my-1" />
                )}
              </div>
              <div className="bg-white rounded-2xl border border-border p-5 flex-1">
                <span className="text-xs font-black uppercase tracking-widest text-brand-red">
                  {m.year}
                </span>
                <h3 className="font-display font-bold text-lg text-navy mt-1">{m.title}</h3>
                <p className="text-sm text-muted-foreground mt-1 leading-relaxed">{m.body}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

export function AboutPage() {
  const { md } = useMdMessage();
  const faculty = useFaculty();
  const { items: whys } = useWhyChooseUs();
  const { t } = useLanguage();
  return (
    <div className="min-h-screen flex flex-col">
      <SiteHeader />
      <main className="flex-1">
        <section className="bg-navy text-navy-foreground py-14">
          <div className="max-w-6xl mx-auto px-4 text-center">
            <p className="text-xs uppercase tracking-widest text-gold font-bold">{t("About")}</p>
            <h1 className="font-display font-black text-3xl md:text-5xl mt-2">
              {t("aboutHeroTitle")}
            </h1>
            <p className="mt-4 text-white/70 max-w-2xl mx-auto">{t("aboutHeroSub")}</p>
          </div>
        </section>

        <StatsBand />

        <section className="py-14">
          <div className="max-w-4xl mx-auto px-4">
            <h2 className="font-display font-black text-2xl text-navy">{t("ourHistory")}</h2>
            <p className="text-foreground/80 leading-relaxed mt-2">{t("historyBody")}</p>

            <div className="mt-10 rounded-2xl border border-border overflow-hidden bg-white flex flex-col md:flex-row">
              {md.photoUrl ? (
                <img
                  src={md.photoUrl}
                  alt={md.name}
                  className="md:w-56 md:shrink-0 object-cover aspect-[4/3] md:aspect-auto"
                />
              ) : null}
              <div className="p-6 md:p-8 flex-1">
                <h2 className="font-display font-black text-2xl text-navy">
                  {t("mdMessageAbout")}
                </h2>
                <p className="text-foreground/80 leading-relaxed mt-3">"{md.message}"</p>
                <p className="font-bold text-navy mt-3">
                  — {md.name}, {t("managingDirector")}
                </p>
              </div>
            </div>
          </div>
        </section>

        <section className="py-14 bg-secondary/40">
          <div className="max-w-6xl mx-auto px-4 grid gap-6 md:grid-cols-3">
            <ValueCard icon={Eye} title={t("vision")} body={t("visionBody")} />
            <ValueCard icon={Target} title={t("mission")} body={t("missionBody")} />
            <ValueCard icon={Trophy} title={t("achievements")} body={t("achievementsBody")} />
          </div>
        </section>

        {/* Why Choose Us — live from Firestore (admin /admin/why-choose-us) */}
        <section className="py-14">
          <div className="max-w-4xl mx-auto px-4">
            <div className="text-center mb-8">
              <Users className="w-10 h-10 text-brand-red mx-auto" />
              <h2 className="font-display font-black text-2xl md:text-3xl text-navy mt-3">
                {t("whyChooseUs")}
              </h2>
            </div>
            <div className="grid gap-3 sm:grid-cols-2">
              {whys.map((w) => (
                <div
                  key={w.id}
                  className="bg-white rounded-2xl border border-border p-4 flex items-start gap-3 hover:border-brand-red/40 transition"
                >
                  <CheckCircle2 className="w-5 h-5 text-green-600 mt-0.5 shrink-0" />
                  <p className="text-sm font-medium text-foreground/90">{w.text}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        <Milestones />

        <section className="py-14">
          <div className="max-w-6xl mx-auto px-4 text-center">
            <Users className="w-10 h-10 text-brand-red mx-auto" />
            <h2 className="font-display font-black text-2xl md:text-3xl text-navy mt-3">
              {t("ourTeam")}
            </h2>
            <p className="text-muted-foreground max-w-xl mx-auto mt-2">{t("teamSubtext")}</p>
          </div>
          <div className="max-w-5xl mx-auto px-4 mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {faculty.slice(0, 6).map((f) => (
              <div
                key={f.id}
                className="bg-white rounded-2xl border border-border p-4 flex items-center gap-4 hover:border-brand-red/40 transition"
              >
                {f.photoUrl ? (
                  <img
                    src={f.photoUrl}
                    alt={f.name}
                    className="w-12 h-12 rounded-full object-cover ring-2 ring-brand-red/20 shrink-0"
                  />
                ) : (
                  <div className="w-12 h-12 rounded-full bg-gradient-to-br from-navy to-navy/70 text-navy-foreground flex items-center justify-center font-display font-black shrink-0">
                    {f.initials}
                  </div>
                )}
                <div className="text-left">
                  <p className="font-bold text-navy leading-tight">{f.name}</p>
                  <p className="text-xs uppercase tracking-wider text-brand-red font-bold mt-0.5">
                    {f.role}
                  </p>
                  <p className="text-xs text-muted-foreground mt-0.5">{f.subject}</p>
                </div>
              </div>
            ))}
          </div>
          <div className="text-center mt-8">
            <Link
              to="/faculty"
              className="inline-flex items-center gap-1.5 text-sm font-bold text-brand-red hover:underline"
            >
              {t("viewAllFaculty")} <ArrowRight className="w-4 h-4" />
            </Link>
          </div>
        </section>

        {/* CTA banner */}
        <section className="pb-16">
          <div className="max-w-6xl mx-auto px-4">
            <div className="rounded-3xl overflow-hidden bg-gradient-to-r from-brand-red via-brand-red/90 to-red-600 px-6 py-10 md:p-12">
              <div className="flex flex-col md:flex-row items-center justify-between gap-6">
                <div>
                  <Star className="w-8 h-8 text-white/80 mb-2" />
                  <h2 className="font-display font-black text-2xl md:text-3xl text-white">
                    {t("yourDreamOurGuidance")}
                  </h2>
                  <p className="text-white/80 text-sm mt-1">
                    {t("preparationTodaySuccessTomorrow")}
                  </p>
                </div>
                <div className="flex flex-col sm:flex-row gap-3 shrink-0">
                  <Button
                    asChild
                    className="bg-white text-brand-red hover:bg-slate-50 font-bold"
                    size="lg"
                  >
                    <Link to="/admission">
                      {t("applyToday")} <ArrowRight className="w-4 h-4 ml-1" />
                    </Link>
                  </Button>
                  <Button
                    asChild
                    variant="outline"
                    className="border-white/60 text-white hover:bg-white/10 font-bold"
                    size="lg"
                  >
                    <Link to="/contact">{t("Contact")}</Link>
                  </Button>
                </div>
              </div>
            </div>
          </div>
        </section>
      </main>
      <SiteFooter />
    </div>
  );
}

export function ValueCard({
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
