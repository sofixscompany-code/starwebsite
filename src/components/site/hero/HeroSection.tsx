import { Phone, MessageCircle } from "lucide-react";
import { useSiteSettings } from "@/hooks/use-site-settings";
import { AdmissionBadge } from "./AdmissionBadge";
import { HeroActions } from "./HeroActions";
import { AuthButtons } from "./AuthButtons";
import { ScholarshipCard } from "./ScholarshipCard";

export function HeroSection() {
  const site = useSiteSettings();
  return (
    <section className="relative overflow-hidden bg-secondary/40">
      <div
        className="pointer-events-none absolute inset-0"
        style={{
          background:
            "radial-gradient(60% 50% at 78% 30%, rgba(30,58,138,0.06), transparent 70%), radial-gradient(50% 45% at 15% 85%, rgba(239,68,68,0.05), transparent 70%)",
        }}
      />
      <div className="relative max-w-6xl mx-auto px-4 pt-8 md:pt-10 pb-8 md:pb-10">
        <div className="mb-6 md:mb-8">
          <AdmissionBadge />
        </div>

        <div className="grid gap-6 md:gap-8 md:grid-cols-2 items-center">
          <div>
            <span className="inline-block bg-brand-red/10 text-brand-red font-bold text-xs uppercase tracking-widest px-3 py-1 rounded-full mb-3">
              Nepal's Trusted Preparation
            </span>

            <h1 className="font-display text-2xl sm:text-3xl md:text-4xl font-black leading-[1.05] text-foreground">
              Become the next{" "}
              <span className="text-brand-red italic underline decoration-4 decoration-brand-red/40 underline-offset-4">
                Star Success
              </span>{" "}
              Story
            </h1>

            <p className="mt-4 text-base md:text-lg text-muted-foreground max-w-lg leading-relaxed">
              Focused coaching for{" "}
              <strong>
                Nepal Police, Nepal Army, Armed Police, Loksewa, Medical & Technical entrance
              </strong>{" "}
              — plus school tuition, since 2015.
            </p>

            <HeroActions />

            <div className="mt-6">
              <AuthButtons />
            </div>

            <div className="mt-6 flex flex-wrap gap-4 text-sm">
              <a
                href={`tel:${site.phones[0]}`}
                className="flex items-center gap-2 text-navy dark:text-slate-300 font-semibold hover:underline"
              >
                <Phone className="w-4 h-4" /> {site.phones[0]}
              </a>
              <a
                href={`https://wa.me/977${site.whatsapp}`}
                className="flex items-center gap-2 text-emerald-700 dark:text-emerald-400 font-semibold hover:underline"
              >
                <MessageCircle className="w-4 h-4" /> WhatsApp Chat
              </a>
            </div>
          </div>

          <ScholarshipCard />
        </div>
      </div>
    </section>
  );
}
