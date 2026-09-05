import { useState } from "react";
import { MapPin, Phone, Mail, MessageCircle, Clock, Send } from "lucide-react";
import { collection, addDoc } from "firebase/firestore";
import { toast } from "sonner";
import { SiteHeader } from "@/components/site/SiteHeader";
import { SiteFooter } from "@/components/site/SiteFooter";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { site } from "@/lib/site-config";
import { db } from "@/integrations/firebase/config";

export function ContactPage() {
  const [form, setForm] = useState({ name: "", email: "", phone: "", course: "", message: "" });
  const [submitting, setSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.name.trim() || !form.phone.trim()) {
      toast.error("Please enter your name and phone number.");
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
      setForm({ name: "", email: "", phone: "", course: "", message: "" });
      toast.success("Message sent! Our team will contact you shortly.");
    } catch (err) {
      console.error(err);
      toast.error("Could not send your message. Please try again.");
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
            <p className="text-xs uppercase tracking-widest text-gold font-bold">Get in touch</p>
            <h1 className="font-display font-black text-3xl md:text-5xl mt-2">Contact us</h1>
            <p className="mt-4 text-white/70 max-w-2xl mx-auto">
              Visit our campus at Zeromile, Janakpurdham-7 — or call anytime.
            </p>
          </div>
        </section>

        <section className="py-14">
          <div className="max-w-4xl mx-auto px-4 grid gap-4 md:grid-cols-2">
            <ContactCard icon={MapPin} title="Campus Address" value={site.location} />
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

        <section className="pb-20">
          <div className="max-w-4xl mx-auto px-4">
            <div className="bg-white rounded-2xl border border-border p-6 md:p-8">
              <h2 className="font-display font-black text-2xl text-navy">Send us a message</h2>
              <p className="text-sm text-muted-foreground mt-1">
                Fill in the form and our team will get back to you.
              </p>
              <form onSubmit={handleSubmit} className="mt-6 grid gap-4 sm:grid-cols-2">
                <div className="space-y-1.5">
                  <Label htmlFor="contact-name">Full name *</Label>
                  <Input
                    id="contact-name"
                    placeholder="Your name"
                    value={form.name}
                    onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))}
                    required
                  />
                </div>
                <div className="space-y-1.5">
                  <Label htmlFor="contact-phone">Phone *</Label>
                  <Input
                    id="contact-phone"
                    placeholder="98XXXXXXXX"
                    value={form.phone}
                    onChange={(e) => setForm((f) => ({ ...f, phone: e.target.value }))}
                    required
                  />
                </div>
                <div className="space-y-1.5">
                  <Label htmlFor="contact-email">Email</Label>
                  <Input
                    id="contact-email"
                    type="email"
                    placeholder="you@example.com"
                    value={form.email}
                    onChange={(e) => setForm((f) => ({ ...f, email: e.target.value }))}
                  />
                </div>
                <div className="space-y-1.5">
                  <Label htmlFor="contact-course">Course interest</Label>
                  <Input
                    id="contact-course"
                    placeholder="e.g. Staff Nurse / HA"
                    value={form.course}
                    onChange={(e) => setForm((f) => ({ ...f, course: e.target.value }))}
                  />
                </div>
                <div className="space-y-1.5 sm:col-span-2">
                  <Label htmlFor="contact-message">Message</Label>
                  <Textarea
                    id="contact-message"
                    placeholder="How can we help you?"
                    rows={4}
                    value={form.message}
                    onChange={(e) => setForm((f) => ({ ...f, message: e.target.value }))}
                  />
                </div>
                <div className="sm:col-span-2">
                  <Button type="submit" disabled={submitting} className="w-full sm:w-auto">
                    <Send className="w-4 h-4 mr-2" />
                    {submitting ? "Sending..." : "Send message"}
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
    <div className="bg-white rounded-2xl border border-border p-5 flex items-start gap-4 hover:border-navy/30 transition">
      <div className="w-11 h-11 rounded-lg bg-brand-red/10 text-brand-red flex items-center justify-center shrink-0">
        <Icon className="w-5 h-5" />
      </div>
      <div>
        <p className="text-xs uppercase tracking-widest text-muted-foreground font-bold">{title}</p>
        <p className="text-sm font-semibold text-navy mt-1">{value}</p>
      </div>
    </div>
  );
  return href ? <a href={href}>{inner}</a> : inner;
}
