import { createFileRoute } from "@tanstack/react-router";
import { MapPin, Phone, Mail, MessageCircle, Clock } from "lucide-react";
import { SiteHeader } from "@/components/site/SiteHeader";
import { SiteFooter } from "@/components/site/SiteFooter";
import { site } from "@/lib/site-config";

export const Route = createFileRoute("/contact")({
  head: () => ({
    meta: [
      { title: "Contact — Star Coaching Institute Janakpurdham" },
      {
        name: "description",
        content:
          "Contact Star Coaching Institute at Zeromile, Janakpurdham-7. Call 9804899123 or 9864176606 for admission and inquiries.",
      },
    ],
  }),
  component: ContactPage,
});

function ContactPage() {
  return (
    <div className="min-h-screen flex flex-col">
      <SiteHeader />
      <main className="flex-1">
        <section className="bg-navy text-navy-foreground py-14">
          <div className="max-w-6xl mx-auto px-4 text-center">
            <p className="text-xs uppercase tracking-widest text-gold font-bold">Get in touch</p>
            <h1 className="font-display font-black text-3xl md:text-5xl mt-2">Contact us</h1>
            <p className="mt-4 text-white/70 max-w-2xl mx-auto">
              Visit our campus at Zeromile, Janakpurdham-7 — or call anytime.
            </p>
          </div>
        </section>

        <section className="py-14">
          <div className="max-w-4xl mx-auto px-4 grid gap-4 md:grid-cols-2">
            <ContactCard
              icon={MapPin}
              title="Campus Address"
              value={site.location}
            />
            <ContactCard icon={Clock} title="Office Hours" value="Sun–Fri · 6 AM – 7 PM" />
            <ContactCard
              icon={Phone}
              title="Phone / Enquiry"
              value={site.phones.join(", ")}
              href={`tel:${site.phones[0]}`}
            />
            <ContactCard
              icon={MessageCircle}
              title="WhatsApp"
              value={`+977 ${site.whatsapp}`}
              href={`https://wa.me/977${site.whatsapp}`}
            />
            <ContactCard
              icon={Mail}
              title="Email"
              value={site.email}
              href={`mailto:${site.email}`}
            />
          </div>
        </section>
      </main>
      <SiteFooter />
    </div>
  );
}

function ContactCard({
  icon: Icon,
  title,
  value,
  href,
}: {
  icon: typeof Phone;
  title: string;
  value: string;
  href?: string;
}) {
  const inner = (
    <div className="bg-white rounded-2xl border border-border p-5 flex items-start gap-4 hover:border-navy/30 transition">
      <div className="w-11 h-11 rounded-lg bg-brand-red/10 text-brand-red flex items-center justify-center shrink-0">
        <Icon className="w-5 h-5" />
      </div>
      <div>
        <p className="text-xs uppercase tracking-widest text-muted-foreground font-bold">
          {title}
        </p>
        <p className="text-sm font-semibold text-navy mt-1">{value}</p>
      </div>
    </div>
  );
  return href ? <a href={href}>{inner}</a> : inner;
}
