import { Link } from "react-router-dom";
import { ChevronRight, CheckCircle2, ArrowRight, Target } from "lucide-react";
import { SiteHeader } from "@/components/site/SiteHeader";
import { SiteFooter } from "@/components/site/SiteFooter";
import { Button } from "@/components/ui/button";
import { useLanguage } from "@/hooks/use-language";

const LOGO = "/favicon-180x180.jpg";
const BUILDING = "/site/about-lead.jpg";

/** Goals list — the checklist shown under हाम्रो लक्ष्य. */
const GOAL_KEYS = ["aboutGoal1", "aboutGoal2", "aboutGoal3"] as const;

export function AboutPage() {
  const { t } = useLanguage();

  return (
    <div className="min-h-screen flex flex-col">
      <SiteHeader />
      <main className="flex-1">
        {/* ── Hero: navy band over the institute building ── */}
        <section className="relative overflow-hidden bg-navy text-navy-foreground">
          <img
            src={BUILDING}
            alt=""
            aria-hidden="true"
            className="absolute inset-0 h-full w-full object-cover"
          />
          <div className="absolute inset-0 bg-navy/80" />
          <div className="relative max-w-6xl mx-auto px-4 py-14 md:py-20 text-center">
            <img
              src={LOGO}
              alt="Star Coaching Institute logo"
              className="mx-auto h-16 w-16 md:h-20 md:w-20 rounded-full object-cover ring-2 ring-gold/70 shadow-lg"
            />
            <h1 className="font-display font-black text-3xl md:text-5xl mt-4">
              {t("aboutPageTitle")}
            </h1>
            <p className="mt-3 text-white/75 max-w-2xl mx-auto text-sm md:text-base">
              {t("aboutHeroSub")}
            </p>
          </div>
        </section>

        {/* ── Breadcrumb ── */}
        <nav aria-label="Breadcrumb" className="border-b border-border bg-white dark:bg-slate-900">
          <ol className="max-w-6xl mx-auto px-4 py-3 flex flex-wrap items-center gap-1.5 text-xs font-bold">
            <li className="flex items-center gap-1.5">
              <Link to="/" className="text-muted-foreground hover:text-brand-red transition">
                {t("breadcrumbHome")}
              </Link>
            </li>
            <li aria-hidden="true" className="text-muted-foreground/70">
              <ChevronRight className="w-3.5 h-3.5" />
            </li>
            <li className="text-navy dark:text-slate-100">{t("aboutPageTitle")}</li>
          </ol>
        </nav>

        {/* ── हाम्रो परिचय ── */}
        <section className="py-12 md:py-16">
          <div className="max-w-6xl mx-auto px-4 grid gap-8 md:grid-cols-2 md:gap-10 items-center">
            <div>
              <h2 className="font-display font-black text-2xl md:text-3xl text-navy dark:text-slate-100">
                {t("aboutIntroTitle")}
              </h2>
              <div className="mt-1 h-1 w-16 rounded bg-brand-red" />
              <p className="mt-4 text-foreground/80 leading-relaxed text-sm md:text-base">
                {t("aboutIntroBody")}
              </p>
            </div>
            <div className="overflow-hidden rounded-2xl border border-border bg-white shadow-sm">
              <img
                src={BUILDING}
                alt="Star Coaching Institute building, Janakpurdham"
                className="w-full aspect-[4/3] object-cover"
              />
            </div>
          </div>
        </section>

        {/* ── हाम्रो लक्ष्य ── */}
        <section className="py-12 md:py-16 bg-secondary/40">
          <div className="max-w-4xl mx-auto px-4">
            <div className="text-center mb-8">
              <div className="w-11 h-11 mx-auto rounded-lg bg-brand-red/10 text-brand-red flex items-center justify-center">
                <Target className="w-5 h-5" />
              </div>
              <h2 className="font-display font-black text-2xl md:text-3xl text-navy dark:text-slate-100 mt-3">
                {t("aboutGoalsTitle")}
              </h2>
            </div>

            <ul className="space-y-3">
              {GOAL_KEYS.map((k) => (
                <li
                  key={k}
                  className="flex items-start gap-3 rounded-2xl border border-border bg-white p-4 md:p-5 hover:border-brand-red/40 transition"
                >
                  <CheckCircle2 className="w-5 h-5 text-green-600 mt-0.5 shrink-0" />
                  <span className="text-sm md:text-base font-semibold text-foreground/90">
                    {t(k)}
                  </span>
                </li>
              ))}
            </ul>
          </div>
        </section>

        {/* ── CTA ── */}
        <section className="py-14">
          <div className="max-w-6xl mx-auto px-4">
            <div className="rounded-3xl overflow-hidden bg-gradient-to-r from-brand-red via-brand-red/90 to-red-600 px-6 py-10 md:p-12">
              <div className="flex flex-col md:flex-row items-center justify-between gap-6">
                <div>
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
