import { useState } from "react";
import {
  MapPin,
  Phone,
  Mail,
  MessageCircle,
  Clock,
  Send,
  Facebook,
  Instagram,
  Youtube,
  Music2,
  ExternalLink,
} from "lucide-react";
import { collection, addDoc } from "@/integrations/aws/firestore";
import { toast } from "sonner";
import { SiteHeader } from "@/components/site/SiteHeader";
import { SiteFooter } from "@/components/site/SiteFooter";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { useSiteSettings } from "@/hooks/use-site-settings";
import { db } from "@/integrations/aws/config";
import { useLanguage } from "@/hooks/use-language";
import { MAP_EMBED, MAP_LINK } from "@/lib/maps";
import { whatsappHref } from "@/lib/links";

export function ContactPage() {
  const siteSettings = useSiteSettings();
  const { t } = useLanguage();

  // Live social links from admin (site_settings/config)
  const socials = [
    { label: "Facebook", href: siteSettings.socials.facebook, icon: Facebook },
    { label: "Instagram", href: siteSettings.socials.instagram, icon: Instagram },
    { label: "YouTube", href: siteSettings.socials.youtube, icon: Youtube },
    { label: "TikTok", href: siteSettings.socials.tiktok, icon: Music2 },
  ].filter((s) => !!s.href);
  // "company" is a hidden honeypot field — bots fill it, humans never see it.
  const [form, setForm] = useState({
    name: "",
    email: "",
    phone: "",
    course: "",
    message: "",
    company: "",
  });
  const [submitting, setSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.name.trim() || !form.phone.trim()) {
      toast.error(t("messageRequiredToast"));
      return;
    }
    // Honeypot: silently pretend success for bots.
    if (form.company) {
      setForm({ name: "", email: "", phone: "", course: "", message: "", company: "" });
      toast.success(t("messageSentToast"));
      return;
    }
    setSubmitting(true);
    try {
      await addDoc(collection(db, "inquiries"), {
        name: form.name.trim(),
        email: form.email.trim() || null,
        phone: form.phone.trim(),
        course: form.course.trim() || null,
        message: form.message.trim() || null,
        source: "Website",
        status: "New",
        createdAt: new Date().toISOString(),
      });
      setForm({ name: "", email: "", phone: "", course: "", message: "", company: "" });
      toast.success(t("messageSentToast"));
    } catch (err) {
      console.error(err);
      toast.error(t("messageErrorToast"));
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen flex flex-col">
      <SiteHeader />
      <main className="flex-1">
        <section className="bg-navy text-navy-foreground py-14">
          <div className="max-w-6xl mx-auto px-4 text-center">
            <p className="text-xs uppercase tracking-widest text-gold font-bold">{t("Contact")}</p>
            <h1 className="font-display font-black text-3xl md:text-5xl mt-2">{t("visitUs")}</h1>
            <p className="mt-4 text-white/70 max-w-2xl mx-auto">{t("contactSubtext")}</p>
          </div>
        </section>

        {/* Location map — prominent, right under the hero */}
        <section className="pt-14">
          <div className="max-w-6xl mx-auto px-4">
            <div className="mb-6 text-center">
              <MapPin className="w-10 h-10 text-brand-red mx-auto" />
              <h2 className="font-display font-black text-2xl md:text-3xl text-navy mt-3">
                {t("ourLocation")}
              </h2>
              <p className="text-muted-foreground max-w-xl mx-auto mt-2">{t("locationSubtext")}</p>
            </div>
            <div className="rounded-2xl overflow-hidden border border-border shadow-sm">
              <iframe
                title="Star Coaching Institute location — Zeromile, Janakpurdham"
                src={MAP_EMBED}
                width="100%"
                height="400"
                style={{ border: 0 }}
                allowFullScreen
                loading="lazy"
                referrerPolicy="no-referrer-when-downgrade"
              />
            </div>
            <div className="mt-3 text-center">
              <a
                href={MAP_LINK}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-1.5 text-sm font-bold text-brand-red hover:underline"
              >
                {t("viewLargerMap")} <ExternalLink className="w-3.5 h-3.5" />
              </a>
            </div>
          </div>
        </section>

        <section className="py-14">
          <div className="max-w-4xl mx-auto px-4 grid gap-4 md:grid-cols-2">
            <ContactCard icon={MapPin} title={t("addressLabel")} value={siteSettings.location} />
            <ContactCard icon={Clock} title={t("timing")} value={t("timingHours")} />
            <ContactCard
              icon={Phone}
              title={t("phoneNumbers")}
              value={siteSettings.phones.join(", ")}
              href={`tel:${siteSettings.phones[0]}`}
            />
            <ContactCard
              icon={MessageCircle}
              title={t("whatsappContact")}
              value={`+977 ${siteSettings.whatsapp}`}
              href={whatsappHref(siteSettings.whatsapp)}
            />
            <ContactCard
              icon={Mail}
              title={t("emailLabel")}
              value={siteSettings.email}
              href={`mailto:${siteSettings.email}`}
            />
            {/* Social card — each platform links to its own live URL */}
            <div className="bg-white rounded-2xl border border-border p-5 flex items-start gap-4 hover:border-navy/30 transition h-full">
              <div className="w-11 h-11 rounded-lg bg-brand-red/10 text-brand-red flex items-center justify-center shrink-0">
                <ExternalLink className="w-5 h-5" />
              </div>
              <div className="min-w-0">
                <p className="text-xs uppercase tracking-widest text-muted-foreground font-bold">
                  {t("followUs")}
                </p>
                <div className="flex items-center gap-2 mt-2">
                  {socials.map((s) => (
                    <a
                      key={s.label}
                      href={s.href}
                      target="_blank"
                      rel="noopener noreferrer"
                      aria-label={s.label}
                      className="w-9 h-9 rounded-full bg-secondary flex items-center justify-center text-navy hover:bg-brand-red hover:text-white transition"
                    >
                      <s.icon className="w-4 h-4" />
                    </a>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </section>

        <section className="pb-20">
          <div className="max-w-4xl mx-auto px-4">
            <div className="bg-white rounded-2xl border border-border p-6 md:p-8">
              <h2 className="font-display font-black text-2xl text-navy">
                {t("sendMessageTitle")}
              </h2>
              <p className="text-sm text-muted-foreground mt-1">{t("sendMessageSub")}</p>

              {/* Social icons */}
              <div className="flex items-center gap-2 mt-4">
                {socials.map((s) => (
                  <a
                    key={s.label}
                    href={s.href}
                    target="_blank"
                    rel="noopener noreferrer"
                    aria-label={s.label}
                    className="w-9 h-9 rounded-full bg-secondary flex items-center justify-center text-navy hover:bg-brand-red hover:text-white transition"
                  >
                    <s.icon className="w-4 h-4" />
                  </a>
                ))}
              </div>

              <form onSubmit={handleSubmit} className="mt-6 grid gap-4 sm:grid-cols-2">
                {/* Honeypot — hidden from humans */}
                <div className="hidden" aria-hidden="true">
                  <Label htmlFor="contact-company">Company</Label>
                  <Input
                    id="contact-company"
                    name="company"
                    tabIndex={-1}
                    autoComplete="off"
                    value={form.company}
                    onChange={(e) => setForm((f) => ({ ...f, company: e.target.value }))}
                  />
                </div>
                <div className="space-y-1.5">
                  <Label htmlFor="contact-name">{t("fullNameLabel")}</Label>
                  <Input
                    id="contact-name"
                    placeholder={t("yourNamePlaceholder")}
                    value={form.name}
                    onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))}
                    required
                  />
                </div>
                <div className="space-y-1.5">
                  <Label htmlFor="contact-phone">{t("phoneLabel")}</Label>
                  <Input
                    id="contact-phone"
                    placeholder="98XXXXXXXX"
                    value={form.phone}
                    onChange={(e) => setForm((f) => ({ ...f, phone: e.target.value }))}
                    required
                  />
                </div>
                <div className="space-y-1.5">
                  <Label htmlFor="contact-email">{t("emailLabel")}</Label>
                  <Input
                    id="contact-email"
                    type="email"
                    placeholder="you@example.com"
                    value={form.email}
                    onChange={(e) => setForm((f) => ({ ...f, email: e.target.value }))}
                  />
                </div>
                <div className="space-y-1.5">
                  <Label htmlFor="contact-course">{t("courseInterest")}</Label>
                  <Input
                    id="contact-course"
                    placeholder={t("coursePlaceholder")}
                    value={form.course}
                    onChange={(e) => setForm((f) => ({ ...f, course: e.target.value }))}
                  />
                </div>
                <div className="space-y-1.5 sm:col-span-2">
                  <Label htmlFor="contact-message">{t("messageLabel")}</Label>
                  <Textarea
                    id="contact-message"
                    placeholder={t("howCanWeHelp")}
                    rows={4}
                    value={form.message}
                    onChange={(e) => setForm((f) => ({ ...f, message: e.target.value }))}
                  />
                </div>
                <div className="sm:col-span-2">
                  <Button type="submit" disabled={submitting} className="w-full sm:w-auto">
                    <Send className="w-4 h-4 mr-2" />
                    {submitting ? t("sendingLabel") : t("sendLabel")}
                  </Button>
                </div>
              </form>
            </div>
          </div>
        </section>
      </main>
      <SiteFooter />
    </div>
  );
}

export function ContactCard({
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
    <div className="bg-white rounded-2xl border border-border p-5 flex items-start gap-4 hover:border-navy/30 transition h-full">
      <div className="w-11 h-11 rounded-lg bg-brand-red/10 text-brand-red flex items-center justify-center shrink-0">
        <Icon className="w-5 h-5" />
      </div>
      <div className="min-w-0">
        <p className="text-xs uppercase tracking-widest text-muted-foreground font-bold">{title}</p>
        <p className="text-sm font-semibold text-navy mt-1 break-words">{value}</p>
      </div>
    </div>
  );
  return href ? (
    <a
      href={href}
      className="block"
      target={href.startsWith("http") ? "_blank" : undefined}
      rel={href.startsWith("http") ? "noopener noreferrer" : undefined}
    >
      {inner}
    </a>
  ) : (
    inner
  );
}
