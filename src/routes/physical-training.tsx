import { Link } from "react-router-dom";
import {
  ChevronRight,
  ArrowRight,
  Clock3,
  ClipboardList,
  TrendingUp,
  ShieldCheck,
} from "lucide-react";
import { SiteHeader } from "@/components/site/SiteHeader";
import { SiteFooter } from "@/components/site/SiteFooter";
import { Button } from "@/components/ui/button";
import { useLanguage } from "@/hooks/use-language";
import { usePhysicalTraining } from "@/hooks/use-physical-training";

const ATTENDANCE_REGISTER = "/admin/attendance";
const PROGRESS_REGISTER = "/admin/results";

export function PhysicalTrainingPage() {
  const { t } = useLanguage();
  const { data } = usePhysicalTraining();

  return (
    <div className="min-h-screen flex flex-col">
      <SiteHeader />
      <main className="flex-1">
        {/* ── Hero ── */}
        <section className="relative overflow-hidden bg-navy text-navy-foreground">
          <img
            src={data.photoUrl}
            alt=""
            aria-hidden="true"
            className="absolute inset-0 h-full w-full object-cover"
          />
          <div className="absolute inset-0 bg-navy/80" />
          <div className="relative max-w-6xl mx-auto px-4 py-14 md:py-20 text-center">
            <p className="text-xs uppercase tracking-widest text-gold font-bold">
              {t("dailyPhysicalTraining")}
            </p>
            <h1 className="font-display font-black text-3xl md:text-5xl mt-2">{data.title}</h1>
            <p className="mt-4 text-white/75 max-w-3xl mx-auto text-sm md:text-base">{data.lead}</p>
          </div>
        </section>

        {/* ── Breadcrumb ── */}
        <nav aria-label="Breadcrumb" className="border-b border-border bg-white dark:bg-slate-900">
          <ol className="max-w-6xl mx-auto px-4 py-3 flex flex-wrap items-center gap-1.5 text-xs font-bold">
            <li>
              <Link to="/" className="text-muted-foreground hover:text-brand-red transition">
                {t("breadcrumbHome")}
              </Link>
            </li>
            <li aria-hidden="true" className="text-muted-foreground/70">
              <ChevronRight className="w-3.5 h-3.5" />
            </li>
            <li className="text-navy dark:text-slate-100">{data.title}</li>
          </ol>
        </nav>

        <section className="py-12 md:py-16">
          <div className="max-w-6xl mx-auto px-4 grid gap-8 lg:grid-cols-3">
            {/* ── Left: routine + registers ── */}
            <div className="lg:col-span-2 space-y-8">
              {/* Routine table */}
              <div className="rounded-2xl border border-border bg-white overflow-hidden">
                <div className="flex items-center gap-2 px-5 py-4 border-b border-border bg-secondary/50">
                  <Clock3 className="w-5 h-5 text-brand-red" />
                  <h2 className="font-display font-black text-lg md:text-xl text-navy dark:text-slate-100">
                    {data.routineTitle}
                  </h2>
                </div>
                <div className="overflow-x-auto">
                  <table className="w-full text-sm">
                    <thead>
                      <tr className="text-left text-[11px] uppercase tracking-widest text-muted-foreground">
                        <th className="px-5 py-3 font-bold">समय</th>
                        <th className="px-5 py-3 font-bold">गतिविधि</th>
                        <th className="px-5 py-3 font-bold text-right">अवधि</th>
                      </tr>
                    </thead>
                    <tbody>
                      {data.routine.map((r) => (
                        <tr
                          key={r.id}
                          className="border-t border-border last:border-0 hover:bg-secondary/40 transition"
                        >
                          <td className="px-5 py-3 whitespace-nowrap font-mono font-bold text-navy dark:text-slate-100">
                            {r.time}
                          </td>
                          <td className="px-5 py-3 text-foreground/90">{r.activity}</td>
                          <td className="px-5 py-3 text-right text-muted-foreground whitespace-nowrap">
                            {r.note}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>

              {/* Register buttons */}
              <div className="rounded-2xl border border-border bg-white p-5 md:p-6">
                <h3 className="font-display font-black text-lg text-navy dark:text-slate-100">
                  {t("registerTitle")}
                </h3>
                <p className="text-sm text-muted-foreground mt-1">
                  रजिस्टरमा नाम, उपस्थिति र प्रगति नियमित रूपमा भरिन्छ।
                </p>
                <div className="mt-4 grid gap-3 sm:grid-cols-2">
                  <Link
                    to={ATTENDANCE_REGISTER}
                    className="group inline-flex items-center justify-center gap-2 rounded-xl bg-brand-red px-5 py-3 text-sm font-bold text-white hover:bg-red-600 transition"
                  >
                    <ClipboardList className="w-4 h-4" />
                    {data.attendanceRegisterLabel}
                    <ArrowRight className="w-4 h-4 transition group-hover:translate-x-0.5" />
                  </Link>
                  <Link
                    to={PROGRESS_REGISTER}
                    className="group inline-flex items-center justify-center gap-2 rounded-xl border border-navy/30 bg-white px-5 py-3 text-sm font-bold text-navy hover:border-brand-red hover:text-brand-red transition dark:bg-slate-800 dark:text-slate-100"
                  >
                    <TrendingUp className="w-4 h-4" />
                    {data.progressRegisterLabel}
                    <ArrowRight className="w-4 h-4 transition group-hover:translate-x-0.5" />
                  </Link>
                </div>
              </div>
            </div>

            {/* ── Right: responsibility card + photo ── */}
            <aside className="space-y-6">
              <div className="rounded-2xl border-2 border-brand-red/30 bg-white overflow-hidden">
                <div className="flex items-center gap-2 px-5 py-4 bg-brand-red/5 border-b border-brand-red/20">
                  <ShieldCheck className="w-5 h-5 text-brand-red" />
                  <h2 className="font-display font-black text-lg text-navy dark:text-slate-100">
                    {data.responsibilityTitle}
                  </h2>
                </div>
                <ul className="p-5 space-y-3">
                  {data.responsibilities.map((line, i) => (
                    <li key={i} className="flex items-start gap-2.5 text-sm text-foreground/85">
                      <span className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-brand-red" />
                      <span className="leading-relaxed">{line}</span>
                    </li>
                  ))}
                </ul>
              </div>

              <div className="rounded-2xl border border-border overflow-hidden bg-white">
                <img
                  src={data.photoUrl}
                  alt={data.title}
                  loading="lazy"
                  className="w-full aspect-[4/3] object-cover"
                />
              </div>

              <div className="rounded-2xl bg-navy text-navy-foreground p-5">
                <p className="text-gold text-xs font-bold uppercase tracking-wider">
                  {t("applyToday")}
                </p>
                <p className="text-sm text-white/75 mt-2">{t("preparationTodaySuccessTomorrow")}</p>
                <Button
                  asChild
                  className="mt-4 w-full bg-brand-red hover:bg-red-600 text-white font-bold"
                  size="lg"
                >
                  <Link to="/admission">
                    {t("Apply Now")} <ArrowRight className="w-4 h-4 ml-1" />
                  </Link>
                </Button>
              </div>
            </aside>
          </div>
        </section>
      </main>
      <SiteFooter />
    </div>
  );
}
