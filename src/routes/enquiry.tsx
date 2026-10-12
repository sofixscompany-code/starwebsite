import { useEffect, useMemo, useState } from "react";
import { Loader2, MessageCircle, Send, Phone, MapPin, CheckCircle2, RotateCcw } from "lucide-react";
import { toast } from "sonner";
import { collection, addDoc } from "firebase/firestore";
import { db } from "@/integrations/firebase/config";
import { SiteHeader } from "@/components/site/SiteHeader";
import { SiteFooter } from "@/components/site/SiteFooter";
import { site } from "@/lib/site-config";
import { whatsappHref, whatsappNumberHref } from "@/lib/links";
import { useLanguage } from "@/hooks/use-language";
import { useAdmissionCourses } from "@/hooks/use-admission-courses";
import { NEPAL_GEO, districtsFor, municipalitiesFor } from "@/data/nepal-geo";
import type { AdmissionCourse } from "@/lib/admission-form/types";

/* ── Tri-language strings (page is self-contained like other public pages) ── */
const DICT = {
  en: {
    badge: "Free Enquiry",
    title: "Course Enquiry",
    sub: "Fill the form and our counsellor will call you back — or send the same details directly on WhatsApp.",
    name: "Full Name",
    phone: "Phone Number",
    parentName: "Parent's Name",
    parentPhone: "Parent's Phone Number",
    province: "Province",
    district: "District",
    municipality: "Municipality / Gaupalika",
    ward: "Ward",
    course: "Interested Course",
    message: "Message",
    messagePh: "Anything you want to ask (optional)",
    select: "Select",
    submit: "Submit Enquiry",
    waSend: "Send on WhatsApp",
    fillAll: "Please fill all required fields with valid values.",
    phoneInvalid: "Phone numbers must be at least 7 digits.",
    success: "Enquiry received!",
    successSub: "Thank you — our team will contact you shortly on your phone.",
    waContinue: "Continue on WhatsApp",
    newBtn: "New Enquiry",
    infoTitle: "Talk to us directly",
    infoSub: "Prefer talking? Reach the institute any time —",
    callNow: "Call now",
    waNow: "WhatsApp",
    address: "Campus",
    why: "Why send an enquiry?",
    why1: "Free career counselling with our senior faculty.",
    why2: "Course fees, batches and schedules explained clearly.",
    why3: "No obligation — enquiry is100% free of charge.",
    selected: "Selected Course",
    feeTotal: "Total Fee",
    feeAdmission: "Admission",
    feeTuition: "Tuition",
    feeExam: "Exam",
    feePhysical: "Physical",
    feeAdditional: "Additional",
    otherNote: "And others — for admission details of any other course/post, call",
  },
  ne: {
    badge: "निःशुल्क सोधपुछ",
    title: "कोर्स सोधपुछ",
    sub: "फार्म भर्नुहोस् — हाम्रा काउन्सेलरले फोन गरेर जानकारी दिनेछन्। चाहे त्यही विवरण सिधै व्हाट्सएपमा पठाउन सक्नुहुन्छ।",
    name: "पूरा नाम",
    phone: "फोन नम्बर",
    parentName: "अभिभावकको नाम",
    parentPhone: "अभिभावकको फोन नम्बर",
    province: "प्रदेश",
    district: "जिल्ला",
    municipality: "नगरपालिका / गाउँपालिका",
    ward: "वडा",
    course: "रुचि रहेको कोर्स",
    message: "सन्देश",
    messagePh: "जे सोध्न चाहनुहुन्छ (ऐच्छिक)",
    select: "छान्नुहोस्",
    submit: "सोधपुछ पठाउनुहोस्",
    waSend: "व्हाट्सएपमा पठाउनुहोस्",
    fillAll: "सबै आवश्यक फिल्डहरू सही भर्नुहोस्।",
    phoneInvalid: "फोन नम्बर कम्तीमा७ अंकको हुनुपर्छ।",
    success: "सोधपुछ प्राप्त भयो!",
    successSub: "धन्यवाद — हाम्रो टोलीले छिटै फोन गरी सम्पर्क गर्नेछ।",
    waContinue: "व्हाट्सएप जारी राख्नुहोस्",
    newBtn: "नयाँ सोधपुछ",
    infoTitle: "सिधै कुरा गर्नुहोस्",
    infoSub: "फोनमा कुरा गर्न मन छ? संस्थामा जुनसुकै समय सम्पर्क गर्नुहोस् —",
    callNow: "अहिले फोन",
    waNow: "व्हाट्सएप",
    address: "क्याम्पस",
    why: "सोधपुछ किन पठाउने?",
    why1: "हाम्रा वरिष्ठ शिक्षकसँग निःशुल्क करियर परामर्श।",
    why2: "कोर्स फी, ब्याच र समयतालिका स्पष्ट रूपमा जान्न पाइन्छ।",
    why3: "कुनै बाध्यता छैन — सोधपुछ पूर्ण रूपमा निःशुल्क छ।",
    selected: "छानिएको कोर्स",
    feeTotal: "जम्मा शुल्क",
    feeAdmission: "भर्ना शुल्क",
    feeTuition: "पढाई शुल्क",
    feeExam: "परीक्षा शुल्क",
    feePhysical: "फिजिकल शुल्क",
    feeAdditional: "अतिरिक्त शुल्क",
    otherNote: "र अन्य — अन्य कोर्स/पदको प्रवेश विवरणको लागि फोन गर्नुहोस्:",
  },
  hi: {
    badge: "निःशुल्क पूछताछ",
    title: "कोर्स पूछताछ",
    sub: "फॉर्म भरें — हमारे काउंसलर फोन करके जानकारी देंगे। चाहें तो वही विवरण सीधे व्हाट्सएप पर भेज सकते हैं।",
    name: "पूरा नाम",
    phone: "फ़ोन नंबर",
    parentName: "अभिभावक का नाम",
    parentPhone: "अभिभावक का फ़ोन नंबर",
    province: "प्रांत",
    district: "ज़िला",
    municipality: "नगरपालिका / गाँवपालिका",
    ward: "वार्ड",
    course: "रुचि रहे कोर्स",
    message: "संदेश",
    messagePh: "जो पूछना चाहते हैं (वैकल्पिक)",
    select: "चुनें",
    submit: "पूछताछ भेजें",
    waSend: "व्हाट्सएप पर भेजें",
    fillAll: "सभी आवश्यक फ़ील्ड सही भरें।",
    phoneInvalid: "फ़ोन नंबर कम से कम 7 अंक का होना चाहिए।",
    success: "पूछताछ प्राप्त हुई!",
    successSub: "धन्यवाद — हमारी टीम जल्द ही फोन करके संपर्क करेगी।",
    waContinue: "व्हाट्सएप जारी रखें",
    newBtn: "नई पूछताछ",
    infoTitle: "सीधे बात करें",
    infoSub: "फोन पर बात करना चाहते हैं? संस्था में कभी भी संपर्क करें —",
    callNow: "अभी कॉल",
    waNow: "व्हाट्सएप",
    address: "कैंपस",
    why: "पूछताछ क्यों भेजें?",
    why1: "हमारे वरिष्ठ शिक्षकों से निःशुल्क करियर परामर्श।",
    why2: "कोर्स फी, बैच और समय-सारणी की स्पष्ट जानकारी।",
    why3: "कोई बाध्यता नहीं — पूछताछ पूर्णतः निःशुल्क है।",
    selected: "चुना गया कोर्स",
    feeTotal: "कुल फ़ीस",
    feeAdmission: "भर्ना फ़ीस",
    feeTuition: "पढ़ाई फ़ीस",
    feeExam: "परीक्षा फ़ीस",
    feePhysical: "फ़िज़िकल फ़ीस",
    feeAdditional: "अतिरिक्त फ़ीस",
    otherNote: "और अन्य — किसी अन्य कोर्स/पद के प्रवेश विवरण के लिए फ़ोन करें:",
  },
} as const;

type Dict = { readonly [K in keyof (typeof DICT)["en"]]: string };

const INPUT =
  "w-full rounded-lg border border-gray-300 bg-white px-3 py-2.5 text-sm text-gray-900 outline-none transition focus:border-brand-red focus:ring-2 focus:ring-brand-red/15";
const LABEL = "block text-sm font-semibold text-gray-700 mb-1";
const STAR = "text-brand-red";

interface EnquiryForm {
  name: string;
  phone: string;
  parentName: string;
  parentPhone: string;
  province: string;
  district: string;
  municipality: string;
  ward: string;
  course: string;
  message: string;
  company: string; // honeypot — bots fill it, humans never see it
}

const EMPTY: EnquiryForm = {
  name: "",
  phone: "",
  parentName: "",
  parentPhone: "",
  province: "",
  district: "",
  municipality: "",
  ward: "",
  course: "",
  message: "",
  company: "",
};

export function EnquiryPage() {
  const { lang, t } = useLanguage();
  const d: Dict = DICT[lang] ?? DICT.en;
  const { data: courses = [] } = useAdmissionCourses();

  const [form, setForm] = useState<EnquiryForm>({ ...EMPTY });
  const [submitting, setSubmitting] = useState(false);
  const [done, setDone] = useState(false);

  useEffect(() => {
    const prev = document.title;
    document.title = `${d.title} | ${site.legalName}`;
    return () => {
      document.title = prev;
    };
  }, [d.title, site.legalName]);

  const set = (k: keyof EnquiryForm, v: string) => setForm((f) => ({ ...f, [k]: v }));

  const districts = form.province ? districtsFor(form.province) : [];
  const municipalities =
    form.province && form.district ? municipalitiesFor(form.province, form.district) : [];
  const wardCount = municipalities.find((m) => m.name === form.municipality)?.wards ?? 0;
  const wards = useMemo(
    () => Array.from({ length: wardCount }, (_, i) => String(i + 1)),
    [wardCount],
  );

  const digits = (v: string) => v.replace(/\D/g, "");
  const validate = (): string[] => {
    const errs: string[] = [];
    if (!form.name.trim() || !form.parentName.trim()) errs.push(d.fillAll);
    if (digits(form.phone).length < 7 || digits(form.parentPhone).length < 7)
      errs.push(d.phoneInvalid);
    if (!form.province || !form.district || !form.municipality || !form.ward) errs.push(d.fillAll);
    if (!form.course) errs.push(d.fillAll);
    return [...new Set(errs)];
  };

  const waText = () =>
    encodeURIComponent(
      [
        `Namaste! ${d.title} — ${site.legalName}`,
        `${d.name}: ${form.name}`,
        `${d.phone}: ${form.phone}`,
        `${d.parentName}: ${form.parentName}`,
        `${d.parentPhone}: ${form.parentPhone}`,
        `${d.province}: ${form.province}, ${d.district}: ${form.district}, ${d.municipality}: ${form.municipality}, ${d.ward}: ${form.ward}`,
        `${d.course}: ${form.course}`,
        form.message.trim() ? `${d.message}: ${form.message.trim()}` : "",
      ]
        .filter(Boolean)
        .join("\n"),
    );

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    // Honeypot: silently pretend success for bots (never create a record).
    if (form.company) {
      setForm({ ...EMPTY });
      setDone(true);
      return;
    }
    const errs = validate();
    if (errs.length) {
      errs.forEach((m) => toast.error(m));
      return;
    }
    setSubmitting(true);
    try {
      await addDoc(collection(db, "inquiries"), {
        name: form.name.trim(),
        phone: form.phone.trim(),
        parentName: form.parentName.trim(),
        parentPhone: form.parentPhone.trim(),
        province: form.province,
        district: form.district,
        municipality: form.municipality,
        ward: form.ward,
        course: form.course,
        message: form.message.trim() || null,
        source: "Enquiry Form",
        status: "New",
        createdAt: new Date().toISOString(),
      });
      setDone(true);
      toast.success(d.success);
      window.scrollTo({ top: 0, behavior: "smooth" });
    } catch (err) {
      console.error(err);
      toast.error(t("messageErrorToast"));
    } finally {
      setSubmitting(false);
    }
  };

  const waLink = `${whatsappNumberHref(site.whatsapp)}?text=${waText()}`;

  const selectedCourse = useMemo(
    () => courses.find((c) => c.name === form.course) ?? null,
    [courses, form.course],
  );

  const rs = (n: number) => `Rs. ${n.toLocaleString("en-IN")}`;

  /* Short price tag for <select> options — same totals the card shows below */
  const priceTag = (pkgs: AdmissionCourse["packages"]) => {
    const totals = pkgs.filter((p) => p.active !== false).map((p) => p.totalFee);
    if (!totals.length) return "";
    const min = Math.min(...totals);
    const max = Math.max(...totals);
    return min === max ? rs(min) : `${rs(min)} – ${rs(max)}`;
  };

  /* ── Success ── */
  if (done) {
    return (
      <div className="min-h-screen flex flex-col">
        <SiteHeader />
        <main className="flex-1 flex items-center justify-center px-4 py-16">
          <div className="max-w-lg w-full rounded-2xl border bg-white p-8 text-center shadow-xl">
            <div className="mx-auto w-16 h-16 rounded-full bg-green-100 flex items-center justify-center mb-4">
              <CheckCircle2 className="text-green-600" size={30} />
            </div>
            <h1 className="text-2xl font-extrabold text-navy">{d.success}</h1>
            <p className="text-muted-foreground mt-2 text-sm">{d.successSub}</p>
            <div className="mt-6 grid grid-cols-1 sm:grid-cols-2 gap-3">
              <a
                href={waLink}
                target="_blank"
                rel="noreferrer"
                className="inline-flex items-center justify-center gap-2 rounded-lg bg-green-600 text-white px-4 py-2.5 text-sm font-bold hover:bg-green-700"
              >
                <MessageCircle size={15} /> {d.waContinue}
              </a>
              <button
                type="button"
                onClick={() => {
                  setForm({ ...EMPTY });
                  setDone(false);
                }}
                className="inline-flex items-center justify-center gap-2 rounded-lg border px-4 py-2.5 text-sm font-bold hover:bg-gray-50"
              >
                <RotateCcw size={15} /> {d.newBtn}
              </button>
            </div>
          </div>
        </main>
        <SiteFooter />
      </div>
    );
  }

  /* ── Form ── */
  return (
    <div className="min-h-screen flex flex-col">
      <SiteHeader />

      <section className="bg-navy text-navy-foreground py-12 sm:py-14">
        <div className="max-w-6xl mx-auto px-4 text-center">
          <p className="text-xs uppercase tracking-widest text-gold font-bold">{d.badge}</p>
          <h1 className="font-display font-black text-3xl md:text-5xl mt-2">{d.title}</h1>
          <p className="mt-4 text-white/70 max-w-2xl mx-auto text-sm sm:text-base">{d.sub}</p>
        </div>
      </section>

      <main className="flex-1 bg-[#eef1f5] py-10">
        <div className="max-w-6xl mx-auto px-4 grid gap-6 lg:grid-cols-3">
          {/* ── Form ── */}
          <form
            onSubmit={handleSubmit}
            className="lg:col-span-2 rounded-2xl border bg-white p-5 sm:p-7 shadow-sm"
          >
            <div className="grid gap-4 sm:grid-cols-2">
              <label className="block">
                <span className={LABEL}>
                  {d.name} <span className={STAR}>*</span>
                </span>
                <input
                  className={INPUT}
                  value={form.name}
                  onChange={(e) => set("name", e.target.value)}
                  placeholder={d.name}
                  maxLength={80}
                  autoComplete="name"
                />
              </label>
              <label className="block">
                <span className={LABEL}>
                  {d.phone} <span className={STAR}>*</span>
                </span>
                <input
                  className={INPUT}
                  value={form.phone}
                  onChange={(e) => set("phone", e.target.value)}
                  placeholder="98XXXXXXXX"
                  inputMode="tel"
                  maxLength={16}
                  autoComplete="tel"
                />
              </label>
              <label className="block">
                <span className={LABEL}>
                  {d.parentName} <span className={STAR}>*</span>
                </span>
                <input
                  className={INPUT}
                  value={form.parentName}
                  onChange={(e) => set("parentName", e.target.value)}
                  placeholder={d.parentName}
                  maxLength={80}
                />
              </label>
              <label className="block">
                <span className={LABEL}>
                  {d.parentPhone} <span className={STAR}>*</span>
                </span>
                <input
                  className={INPUT}
                  value={form.parentPhone}
                  onChange={(e) => set("parentPhone", e.target.value)}
                  placeholder="98XXXXXXXX"
                  inputMode="tel"
                  maxLength={16}
                />
              </label>

              {/* Address cascade: Province → District → Municipality → Ward */}
              <label className="block">
                <span className={LABEL}>
                  {d.province} <span className={STAR}>*</span>
                </span>
                <select
                  className={INPUT}
                  value={form.province}
                  onChange={(e) =>
                    setForm((f) => ({
                      ...f,
                      province: e.target.value,
                      district: "",
                      municipality: "",
                      ward: "",
                    }))
                  }
                >
                  <option value="">{d.select}</option>
                  {NEPAL_GEO.map((p) => (
                    <option key={p.name} value={p.name}>
                      {p.name}
                    </option>
                  ))}
                </select>
              </label>
              <label className="block">
                <span className={LABEL}>
                  {d.district} <span className={STAR}>*</span>
                </span>
                <select
                  className={INPUT}
                  value={form.district}
                  disabled={!form.province}
                  onChange={(e) =>
                    setForm((f) => ({ ...f, district: e.target.value, municipality: "", ward: "" }))
                  }
                >
                  <option value="">{d.select}</option>
                  {districts.map((dist) => (
                    <option key={dist.name} value={dist.name}>
                      {dist.name}
                    </option>
                  ))}
                </select>
              </label>
              <label className="block">
                <span className={LABEL}>
                  {d.municipality} <span className={STAR}>*</span>
                </span>
                <select
                  className={INPUT}
                  value={form.municipality}
                  disabled={!form.district}
                  onChange={(e) =>
                    setForm((f) => ({ ...f, municipality: e.target.value, ward: "" }))
                  }
                >
                  <option value="">{d.select}</option>
                  {municipalities.map((m) => (
                    <option key={m.name} value={m.name}>
                      {m.name}
                    </option>
                  ))}
                </select>
              </label>
              <label className="block">
                <span className={LABEL}>
                  {d.ward} <span className={STAR}>*</span>
                </span>
                <select
                  className={INPUT}
                  value={form.ward}
                  disabled={!form.municipality || wards.length === 0}
                  onChange={(e) => set("ward", e.target.value)}
                >
                  <option value="">{d.select}</option>
                  {wards.map((w) => (
                    <option key={w} value={w}>
                      Ward {w}
                    </option>
                  ))}
                </select>
              </label>

              <label className="block sm:col-span-2">
                <span className={LABEL}>
                  {d.course} <span className={STAR}>*</span>
                </span>
                <select
                  className={INPUT}
                  value={form.course}
                  onChange={(e) => set("course", e.target.value)}
                >
                  <option value="">{d.select}</option>
                  {courses.map((c) => {
                    const price = priceTag(c.packages);
                    return (
                      <option key={c.id} value={c.name}>
                        {price ? `${c.name} — ${price}` : c.name}
                      </option>
                    );
                  })}
                </select>

                {/* Selected course — name + official fee breakdown (२०८३/२०८४) */}
                {selectedCourse && (
                  <div className="mt-3 rounded-xl border border-brand-red/25 bg-brand-red/5 p-4">
                    <p className="text-[11px] font-bold uppercase tracking-wider text-brand-red">
                      {d.selected}
                    </p>
                    <p className="mt-0.5 font-display font-black text-lg text-navy">
                      {selectedCourse.name}
                    </p>
                    {selectedCourse.description && (
                      <p className="mt-0.5 text-xs text-muted-foreground">
                        {selectedCourse.description}
                      </p>
                    )}
                    <div className="mt-3 space-y-2">
                      {selectedCourse.packages
                        .filter((p) => p.active !== false)
                        .map((p) => (
                          <div key={p.id} className="rounded-lg border bg-white px-3 py-2.5">
                            <div className="flex items-center justify-between gap-3">
                              <p className="text-sm font-bold text-navy">{p.name}</p>
                              <p className="whitespace-nowrap text-sm font-black text-brand-red">
                                {d.feeTotal}: {rs(p.totalFee)}
                              </p>
                            </div>
                            <p className="mt-1 break-words text-xs text-gray-500">
                              {[
                                p.admissionFee ? `${d.feeAdmission} ${rs(p.admissionFee)}` : "",
                                p.tuitionFee ? `${d.feeTuition} ${rs(p.tuitionFee)}` : "",
                                p.examFee ? `${d.feeExam} ${rs(p.examFee)}` : "",
                                p.physicalFee ? `${d.feePhysical} ${rs(p.physicalFee)}` : "",
                                p.additionalFee ? `${d.feeAdditional} ${rs(p.additionalFee)}` : "",
                              ]
                                .filter(Boolean)
                                .join(" • ")}
                            </p>
                          </div>
                        ))}
                    </div>
                  </div>
                )}

                {/* And others — admission details for unlisted courses/posts */}
                <p className="mt-2 text-xs text-gray-500">
                  {d.otherNote}{" "}
                  <a
                    href={`tel:${site.phones[0]}`}
                    className="font-bold text-navy underline-offset-2 hover:underline"
                  >
                    {site.phones[0]}
                  </a>
                </p>
              </label>

              <label className="block sm:col-span-2">
                <span className={LABEL}>{d.message}</span>
                <textarea
                  rows={3}
                  className={`${INPUT} resize-none`}
                  value={form.message}
                  onChange={(e) => set("message", e.target.value)}
                  placeholder={d.messagePh}
                  maxLength={600}
                />
              </label>

              {/* Honeypot — hidden from humans */}
              <input
                type="text"
                value={form.company}
                onChange={(e) => set("company", e.target.value)}
                tabIndex={-1}
                autoComplete="off"
                aria-hidden="true"
                className="hidden"
              />
            </div>

            <div className="mt-5 flex flex-col sm:flex-row gap-3">
              <button
                type="submit"
                disabled={submitting}
                className="inline-flex items-center justify-center gap-2 rounded-lg bg-brand-red text-white px-5 py-2.5 text-sm font-bold hover:bg-brand-red/90 disabled:opacity-60"
              >
                {submitting ? <Loader2 size={15} className="animate-spin" /> : <Send size={15} />}
                {submitting ? "…" : d.submit}
              </button>
              <a
                href={waLink}
                target="_blank"
                rel="noreferrer"
                className="inline-flex items-center justify-center gap-2 rounded-lg border border-green-600 text-green-700 px-5 py-2.5 text-sm font-bold hover:bg-green-50"
              >
                <MessageCircle size={15} /> {d.waSend}
              </a>
            </div>
          </form>

          {/* ── Side info ── */}
          <aside className="space-y-4">
            <div className="rounded-2xl border bg-white p-5 shadow-sm">
              <p className="font-display font-black text-lg text-navy">{d.infoTitle}</p>
              <p className="text-sm text-muted-foreground mt-1">{d.infoSub}</p>
              <div className="mt-4 space-y-2">
                <a
                  href={`tel:${site.phones[0]}`}
                  className="flex items-center gap-2 rounded-lg border px-3 py-2.5 text-sm font-bold text-navy hover:bg-gray-50"
                >
                  <Phone size={15} className="text-brand-red" /> {d.callNow} — {site.phones[0]}
                </a>
                <a
                  href={whatsappHref(site.whatsapp)}
                  target="_blank"
                  rel="noreferrer"
                  className="flex items-center gap-2 rounded-lg border border-green-600/40 px-3 py-2.5 text-sm font-bold text-green-700 hover:bg-green-50"
                >
                  <MessageCircle size={15} /> {d.waNow} — {site.whatsapp}
                </a>
                <p className="flex items-start gap-2 rounded-lg bg-gray-50 px-3 py-2.5 text-xs text-gray-600">
                  <MapPin size={14} className="mt-0.5 shrink-0 text-brand-red" /> {d.address}:{" "}
                  {site.location}
                </p>
              </div>
            </div>

            <div className="rounded-2xl border bg-white p-5 shadow-sm">
              <p className="font-display font-black text-lg text-navy">{d.why}</p>
              <ul className="mt-3 space-y-2 text-sm text-gray-600">
                {[d.why1, d.why2, d.why3].map((x) => (
                  <li key={x} className="flex gap-2">
                    <CheckCircle2 size={15} className="mt-0.5 shrink-0 text-green-600" />
                    {x}
                  </li>
                ))}
              </ul>
            </div>
          </aside>
        </div>
      </main>

      <SiteFooter />
    </div>
  );
}
