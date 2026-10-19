import { ChevronRight } from "lucide-react";
import { SiteHeader } from "@/components/site/SiteHeader";
import { SiteFooter } from "@/components/site/SiteFooter";
import { useLanguage } from "@/hooks/use-language";

const LAST_UPDATED = "19 October 2026";

/**
 * Privacy Policy — required by Google Play for store listing. Bilingual
 * (English + Nepali) static page at /privacy; also linked from the footer.
 * Keep this page deployed whenever the Play listing references it.
 */
export function PrivacyPage() {
  const { t } = useLanguage();

  const sections: { en: { title: string; body: string }; ne: { title: string; body: string } }[] = [
    {
      en: {
        title: "1. Information We Collect",
        body: "When you apply for admission or use the Star Coaching Institute app or website, we collect: full name, date of birth, mobile number, email address, parent/guardian name and contact details, address, organization/post applied for, selected course and fee information, a photograph and signature supplied on the admission form, attendance, class schedules, homework, exam results, and fee payment records (including bill numbers and payment status).",
      },
      ne: {
        title: "१. हामी कुन जानकारी सङ्कलन गर्छौं",
        body: "तपाईंले भर्ना फार्म भर्दा वा स्टार कोचिङ इन्स्टिट्युटको एप र वेबसाइट प्रयोग गर्दा हामी यी जानकारीहरू सङ्कलन गर्छौं: पूरा नाम, जन्म मिति, मोबाइल नम्बर, इमेल ठेगाना, अभिभावकको नाम र सम्पर्क, ठेगाना, भर्ना भइरहेको संस्था/पद, छानिएको कोर्स र शुल्क विवरण, भर्ना फार्ममा दिइएको फोटो र सही, उपस्थिति, कक्षा तालिका, गृहकार्य, परीक्षा नतिजा र शुल्क भुक्तानी विवरण (बिल नम्बर र भुक्तानी स्थिति सहित)।",
      },
    },
    {
      en: {
        title: "2. How We Use Your Information",
        body: "Your information is used only for institute operations: processing your admission, generating fee receipts and student ID cards, recording attendance, publishing exam results, sharing class and exam schedules, and communicating with you about classes, fees, and notices. We do not sell your personal information to anyone.",
      },
      ne: {
        title: "२. जानकारीको प्रयोग",
        body: "तपाईंको जानकारी केवल संस्थाको सञ्चालनका लागि प्रयोग हुन्छ: भर्ना प्रशोधन, शुल्क रसिद र विद्यार्थी परिचयपत्र बनाउने, उपस्थिति दर्ता, परीक्षा नतिजा प्रकाशन, कक्षा र परीक्षाको तालिका साझा गर्ने र कक्षा, शुल्क तथा सूचनाबारे सम्पर्क गर्ने। हामी तपाईंको व्यक्तिगत जानकारी कसैलाई बिक्री गर्दैनौं।",
      },
    },
    {
      en: {
        title: "3. Data Storage & Security",
        body: "Your data is stored on Google Firebase (Firestore) servers, protected by Google's security infrastructure and our role-based access rules — only authorized institute staff (teachers, accountant, administration) can view the records they need for their work. Data is transmitted over encrypted HTTPS connections.",
      },
      ne: {
        title: "३. डाटा भण्डार र सुरक्षा",
        body: "तपाईंको डाटा Google Firebase (Firestore) सर्वरमा भण्डारित हुन्छ, जुन Google को सुरक्षा प्रणाली र हाम्रो भूमिका-आधारित पहुँच नियमबाट सुरक्षित छ — प्राधिकृत संस्थाकर्मी (शिक्षक, हिसाब, प्रशासन) मात्र आफ्नो कामका लागि आवश्यक रेकर्ड हेर्न सक्छन्। डाटा एन्क्रिप्टेड HTTPS जडानमार्फत पठाइन्छ।",
      },
    },
    {
      en: {
        title: "4. Sharing & Disclosure",
        body: "We share information only when required by law or government authorities, or with service providers (such as SMS or payment services) strictly for institute communications and fee processing. Student ID cards and results may be displayed within the app as part of institute services.",
      },
      ne: {
        title: "४. साझेदारी र प्रकटीकरण",
        body: "कानुन वा सरकारी निकायले आवश्यक परेमा मात्र, वा संस्थाको सञ्चार र शुल्क प्रशोधनका लागि सेवा प्रदायक (SMS वा भुक्तानी सेवा) सँग जानकारी साझा गरिन्छ। विद्यार्थी परिचयपत्र र नतिजा सेवाको भागका रूपमा एपभित्र देखाइन सक्छ।",
      },
    },
    {
      en: {
        title: "5. Retention & Deletion",
        body: "Records are kept for as long as the student is enrolled and for legitimate academic and financial record-keeping afterwards. You may request correction or deletion of your personal data by contacting the institute; we will act on valid requests within a reasonable time.",
      },
      ne: {
        title: "५. राख्ने अवधि र मेटाउने",
        body: "विद्यार्थी भर्ना भएसम्म र पछि शैक्षिक तथा वित्तीय अभिलेखका लागि रेकर्ड राखिन्छ। तपाईंले संस्थामा सम्पर्क गरेर आफ्नो व्यक्तिगत डाटा सच्याउने वा मेटाउने गुहार गर्न सक्नुहुन्छ; हामी वैध गुहारमा उचित समयभित्र कारबाही गर्छौं।",
      },
    },
    {
      en: {
        title: "6. Children & Consent",
        body: "The institute serves school-age students. By submitting an admission form, the student (or their parent/guardian for minors) consents to the collection and use of information described here. If you are a parent or guardian, please supervise your child's use of the app.",
      },
      ne: {
        title: "६. बालबालिका र सहमति",
        body: "संस्थाले विद्यालय तहका विद्यार्थीहरूलाई सेवा दिन्छ। भर्ना फार्म बुझाउँदा विद्यार्थी (वा नाबालिकको अभिभावक) ले यहाँ वर्णित जानकारी सङ्कलन र प्रयोगमा सहमति दिनुहुन्छ। अभिभावकहरूले आफ्ना बालबालिकाको एप प्रयोगमा ध्यान दिनुहोस्।",
      },
    },
    {
      en: {
        title: "7. Contact Us",
        body: "Questions about this privacy policy or your data? Contact Star Coaching Institute, Janakpurdham, Madhesh, Nepal. Mobile/WhatsApp: 977-9804899123. Email: Starcoaching@gmail.com.",
      },
      ne: {
        title: "७. सम्पर्क",
        body: "यस गोपनीयता नीति वा तपाईंको डाटाबारे प्रश्न? स्टार कोचिङ इन्स्टिट्युट, जनकपुरधाम, मधेश, नेपाल। मोबाइल/WhatsApp: ९७७-९८०४८९९१२३। इमेल: Starcoaching@gmail.com।",
      },
    },
  ];

  return (
    <div className="min-h-screen flex flex-col">
      <SiteHeader />
      <main className="flex-1">
        {/* ── Hero ── */}
        <section className="bg-navy text-navy-foreground">
          <div className="max-w-6xl mx-auto px-4 py-12 md:py-16 text-center">
            <h1 className="font-display font-black text-3xl md:text-4xl">
              {t("privacyTitle") || "Privacy Policy"}
            </h1>
            <p className="mt-3 text-white/75 max-w-2xl mx-auto text-sm md:text-base">
              गोपनीयता नीति · Last updated: {LAST_UPDATED}
            </p>
          </div>
        </section>

        {/* ── Breadcrumb ── */}
        <nav aria-label="Breadcrumb" className="border-b border-border bg-white dark:bg-slate-900">
          <ol className="max-w-6xl mx-auto px-4 py-3 flex flex-wrap items-center gap-1.5 text-xs font-bold">
            <li className="text-muted-foreground">🏠 {t("breadcrumbHome") || "Home"}</li>
            <li aria-hidden="true" className="text-muted-foreground/70">
              <ChevronRight className="w-3.5 h-3.5 inline" />
            </li>
            <li className="text-navy dark:text-slate-100">Privacy Policy</li>
          </ol>
        </nav>

        {/* ── Policy sections (English then Nepali per section) ── */}
        <section className="py-10 md:py-14">
          <div className="max-w-3xl mx-auto px-4 space-y-8">
            {sections.map((s) => (
              <article
                key={s.en.title}
                className="rounded-2xl border border-border bg-white dark:bg-slate-900 p-6 md:p-8 shadow-sm"
              >
                <h2 className="font-display font-black text-lg md:text-xl text-navy dark:text-slate-100">
                  {s.en.title}
                </h2>
                <p className="mt-3 text-sm md:text-base leading-relaxed text-foreground/85">
                  {s.en.body}
                </p>
                <div className="mt-5 pt-5 border-t border-border">
                  <h3 className="font-bold text-sm text-brand-red">{s.ne.title}</h3>
                  <p className="mt-2 text-sm leading-relaxed text-foreground/80">{s.ne.body}</p>
                </div>
              </article>
            ))}
          </div>
        </section>
      </main>
      <SiteFooter />
    </div>
  );
}
