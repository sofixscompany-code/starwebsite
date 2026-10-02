import { CheckCircle2 } from "lucide-react";
import { StarLogo } from "@/components/site/StarLogo";
import { useHomepageStats } from "@/hooks/use-homepage-stats";
import { site } from "@/lib/site-config";

const PERKS = ["Police, Army & Loksewa Coaching", "Hostel available — Boys & Girls"];

/**
 * Hero highlights card (formerly the "Super 40 Scholarship" promo card).
 * The scholarship offer was removed at the owner's request — the card now
 * shows neutral institute highlights: perks + the homepage stats strip.
 */
export function ScholarshipCard() {
  const stats = useHomepageStats();

  return (
    <div className="relative">
      <div className="absolute -inset-3 rounded-[28px] bg-gradient-to-br from-navy/10 via-transparent to-brand-red/10 blur-2xl -z-10" />

      <div className="relative bg-white rounded-[20px] border-2 border-navy/10 p-6 md:p-7 shadow-brand hover:shadow-2xl hover:shadow-navy/15 hover:-translate-y-1 transition-all duration-300 dark:bg-slate-800 dark:border-slate-700">
        <div className="flex items-center gap-3.5 mb-5">
          <div className="w-12 h-12 shrink-0 flex items-center justify-center bg-white rounded-xl shadow-sm ring-1 ring-navy/10 dark:bg-slate-900 dark:ring-slate-600">
            <StarLogo size="md" />
          </div>
          <div>
            <p className="font-display font-black text-navy dark:text-white text-lg leading-tight">
              {site.legalName}
            </p>
            <p className="text-xs text-muted-foreground">{site.tagline}</p>
          </div>
        </div>

        <ul className="space-y-3 text-sm">
          {PERKS.map((f) => (
            <li key={f} className="flex items-start gap-2.5">
              <CheckCircle2 className="w-4 h-4 text-brand-red mt-0.5 shrink-0" />
              <span className="text-foreground">{f}</span>
            </li>
          ))}
        </ul>

        <div className="mt-6 pt-5 border-t border-dashed border-border dark:border-slate-700 grid grid-cols-3 gap-2 text-center">
          {stats.slice(0, 3).map((s) => (
            <div key={`${s.id ?? s.label}`}>
              <p className="font-display font-black text-navy dark:text-white text-base md:text-lg leading-none">
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
  );
}
