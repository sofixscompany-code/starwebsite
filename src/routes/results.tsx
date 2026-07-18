import {  } from "react-router-dom";
import { Award } from "lucide-react";
import { SiteHeader } from "@/components/site/SiteHeader";
import { SiteFooter } from "@/components/site/SiteFooter";
import { toppers } from "@/lib/site-config";

export function ResultsPage() {
  return (
    <div className="min-h-screen flex flex-col">
      <SiteHeader />
      <main className="flex-1">
        <section className="bg-navy text-navy-foreground py-14">
          <div className="max-w-6xl mx-auto px-4 text-center">
            <p className="text-xs uppercase tracking-widest text-gold font-bold">
              Congratulations Stars
            </p>
            <h1 className="font-display font-black text-3xl md:text-5xl mt-2">
              Our top selections
            </h1>
            <p className="mt-4 text-white/70 max-w-2xl mx-auto">
              Real students, real posts. A snapshot of our recent successes across Nepal.
            </p>
          </div>
        </section>

        <section className="py-14">
          <div className="max-w-6xl mx-auto px-4 grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3">
            {toppers.map((t) => (
              <div
                key={t.name}
                className="bg-white rounded-xl border border-border overflow-hidden text-center hover:border-brand-red/40 transition"
              >
                <div className="aspect-square bg-gradient-to-br from-navy/90 to-navy/70 flex items-center justify-center text-navy-foreground font-display font-black text-3xl relative">
                  {t.name
                    .split(" ")
                    .map((n) => n[0])
                    .slice(0, 2)
                    .join("")}
                  {t.tag.includes("Topper") && (
                    <span className="absolute top-2 right-2 bg-gold text-navy text-[9px] font-black uppercase px-1.5 py-0.5 rounded flex items-center gap-1">
                      <Award className="w-2.5 h-2.5" /> Topper
                    </span>
                  )}
                </div>
                <div className="p-3">
                  <p className="font-display font-bold text-sm text-foreground leading-tight">
                    {t.name}
                  </p>
                  <p className="text-[11px] text-brand-red font-semibold uppercase tracking-wider mt-1">
                    {t.post}
                  </p>
                  <p className="text-[10px] text-muted-foreground mt-1">{t.tag}</p>
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


