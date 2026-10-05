import { Link } from "react-router-dom";
import {
  ArrowRight,
  BookOpen,
  Users,
  ClipboardCheck,
  Building,
  GraduationCap,
  Star,
  MapPin,
  Phone,
  MessageCircle,
  Play,
  FileText,
  Monitor,
  CheckCircle2,
  ChevronDown,
  ChevronUp,
  Video,
  Headphones,
  Laptop,
  BedDouble,
  Shield,
  TreePine,
  Camera,
  Award,
  Clock,
  Check,
  BellRing,
  Megaphone,
  CalendarDays,
  Eye,
  Target,
  Dumbbell,
  ClipboardList,
  TrendingUp,
  ShieldCheck,
} from "lucide-react";
import { useState } from "react";
import { SiteHeader } from "@/components/site/SiteHeader";
import { SiteFooter } from "@/components/site/SiteFooter";
import { useSiteSettings } from "@/hooks/use-site-settings";
import { useLanguage } from "@/hooks/use-language";
import { HeroSlider } from "@/components/site/HeroSlider";
import { BreakingNewsTicker } from "@/components/site/BreakingNewsTicker";
import { AdBannerBelowHero, AdPopup } from "@/components/site/AdBanner";
import { MAP_EMBED, MAP_LINK } from "@/lib/maps";
import { whatsappHref, initialsOf } from "@/lib/links";
import { useHomepageStats } from "@/hooks/use-homepage-stats";
import { useHomepageTestimonials } from "@/hooks/use-homepage-testimonials";
import { useWhyChooseUs, useMdMessage } from "@/hooks/use-homepage-settings";
import { useSelections } from "@/hooks/use-selections";
import { useFaculty } from "@/hooks/use-faculty";
import { usePhysicalTraining } from "@/hooks/use-physical-training";
import { ProgressCard, SAMPLE_CARD } from "@/components/cards/student-cards";
import { useGallery } from "@/hooks/use-gallery";
import { useHomepageCategories, getIcon as getCategoryIcon } from "@/hooks/use-homepage-categories";
import { useLiveNotices, isNewNotice, noticeTimeAgo } from "@/hooks/use-live-notices";
import { CATEGORY_TONE } from "./notices";

/* ────────────────────────────────────────────────────
   STEP 1  – handled by SiteHeader (Top Bar + Nav)
   STEP 2  – Hero + Quick Features
   STEP 3  – Courses Section
   STEP 4  – Why Choose Us
   STEP 5  – Online Classes
   STEP 6  – Admission Process + Student Success
   STEP 7  – Gallery + Instructors + Hostel
   STEP 8  – Reviews + FAQ + Contact + Footer
   ──────────────────────────────────────────────────── */

/**
 * Service cards (homepage "तपाईं कुन सेवाको तयारी गर्दै हुनुहुन्छ ?").
 * `img` = per-service photo served from `public/services/`.
 * `logo` = official government emblem served from `public/logos/`:
 *   police.png  — Nepal Police emblem (nepalpolice.gov.np)
 *   army.png    — Coat of arms of the Nepali Army (Wikimedia Commons, CC BY 4.0)
 *   apf.png     — Armed Police Force logo (apf.gov.np)
 *   forest.png  — Emblem of Nepal, the logo the Ministry of Forests & Environment
 *                 and the Department of Forests display on their own sites (mofe.gov.np)
 *   loksewa.png — Public Service Commission / Loksewa Aayog logo (psc.gov.np, Wikipedia)
 * Image credits (Wikimedia Commons):
 *   police.jpg — "Nepal police on duty at Fulpati 2013…" by Ashishlohorung, CC BY-SA 3.0
 *   army.jpg   — "Bangladeshi and Nepalese soldiers stand in formation…" (Exercise Shanti Doot 3)
 *                by U.S. Dept. of Defense (M/Sgt. Jon Dyer, USAF), Public domain
 *   apf.jpg    — "Armed Police Force Nepal" by Owlf, CC BY-SA 4.0
 *   forest.jpg — "Forest Gateway to the Himalayas" by Megaurab09, CC BY-SA 4.0
 */
type HomeCourse = {
  titleKey: string;
  descKey: string;
  slug: string;
  /** Overrides the default `/services/:slug` link when no prep-portal page exists. */
  href?: string;
  bg: string;
  shadow: string;
  watermark: string;
  btnBg: string;
  icon: typeof Shield;
  img?: string;
  /** Official government emblem shown on the "Our Online Courses" card row. */
  logo: string;
  /** Rendered only in the "Our Online Courses" card row (no big service card). */
  onlineOnly?: boolean;
};

const COURSES: HomeCourse[] = [
  {
    titleKey: "nepalPolice",
    descKey: "policeDesc",
    slug: "nepal-police",
    bg: "bg-blue-600",
    shadow: "shadow-blue-600/20",
    watermark: "text-blue-500/30",
    btnBg: "bg-blue-500/80 hover:bg-blue-500",
    icon: Shield,
    logo: "/logos/police.png",
    img: "/services/police.jpg",
  },
  {
    titleKey: "nepaliArmy",
    descKey: "armyDesc",
    slug: "nepali-army",
    bg: "bg-emerald-700",
    shadow: "shadow-emerald-700/20",
    watermark: "text-emerald-600/40",
    btnBg: "bg-emerald-600/80 hover:bg-emerald-600",
    icon: Shield,
    logo: "/logos/army.png",
    img: "/services/army.jpg",
  },
  {
    titleKey: "apf",
    descKey: "apfDesc",
    slug: "apf",
    bg: "bg-red-700",
    shadow: "shadow-red-700/20",
    watermark: "text-red-600/40",
    btnBg: "bg-red-600/80 hover:bg-red-600",
    icon: Shield,
    logo: "/logos/apf.png",
    img: "/services/apf.jpg",
  },
  {
    titleKey: "forestGuard",
    descKey: "forestDesc",
    slug: "forest-guard",
    bg: "bg-emerald-950",
    shadow: "shadow-emerald-950/20",
    watermark: "text-emerald-800/40",
    btnBg: "bg-emerald-800/80 hover:bg-emerald-800",
    icon: TreePine,
    logo: "/logos/forest.png",
    img: "/services/forest.jpg",
  },
  {
    // Loksewa has no prep-portal service page yet — the card links to /courses,
    // which lists the Loksewa & Administrative course category.
    titleKey: "loksewa",
    descKey: "loksewaDesc",
    slug: "loksewa",
    href: "/courses",
    bg: "bg-indigo-700",
    shadow: "shadow-indigo-700/20",
    watermark: "text-indigo-600/40",
    btnBg: "bg-indigo-600/80 hover:bg-indigo-600",
    icon: Building,
    logo: "/logos/loksewa.png",
    onlineOnly: true,
  },
];

const WHY_US = [
  {
    icon: BookOpen,
    titleKey: "writtenPhysicalPrep",
    nepaliKey: "writtenPhysicalNepali",
    color: "bg-brand-red",
  },
  {
    icon: Users,
    titleKey: "experiencedInstructors",
    nepaliKey: "experiencedInstructorsNepali",
    color: "bg-navy",
  },
  {
    icon: ClipboardCheck,
    titleKey: "regularMockTests",
    nepaliKey: "regularMockTestsNepali",
    color: "bg-brand-red",
  },
  {
    icon: GraduationCap,
    titleKey: "examFocusedClasses",
    nepaliKey: "examFocusedNepali",
    color: "bg-navy",
  },
  {
    icon: Users,
    titleKey: "dailyPhysicalTraining",
    nepaliKey: "dailyPhysicalNepali",
    color: "bg-brand-red",
  },
  {
    icon: Building,
    titleKey: "hostelFacility",
    nepaliKey: "hostelFacilityNepali",
    color: "bg-navy",
  },
];

const ONLINE_FEATURES = [
  { icon: Video, titleKey: "liveOnlineClasses", descKey: "liveOnlineDesc" },
  { icon: Play, titleKey: "recordedClasses", descKey: "recordedDesc" },
  { icon: FileText, titleKey: "pdfNotes", descKey: "pdfNotesDesc" },
  { icon: ClipboardCheck, titleKey: "onlineMockTests", descKey: "onlineMockDesc" },
  { icon: Headphones, titleKey: "teacherSupport", descKey: "teacherSupportDesc" },
  { icon: Monitor, titleKey: "mobileLaptopFriendly", descKey: "mobileLaptopDesc" },
];

const FAQS = [
  { qKey: "faq1Q", aKey: "faq1A" },
  { qKey: "faq2Q", aKey: "faq2A" },
  { qKey: "faq3Q", aKey: "faq3A" },
  { qKey: "faq4Q", aKey: "faq4A" },
  { qKey: "faq5Q", aKey: "faq5A" },
];

/* ────────────────────────────────────────────────────
   Physical Training — homepage preview (full page at /physical-training)
   ──────────────────────────────────────────────────── */
function PhysicalTrainingPreview() {
  const { t } = useLanguage();
  const { data } = usePhysicalTraining();

  return (
    <section className="py-14 bg-gradient-to-b from-white to-slate-50">
      <div className="max-w-6xl mx-auto px-4">
        <div className="flex flex-col md:flex-row md:items-end md:justify-between gap-4 mb-8">
          <div>
            <p className="text-xs font-bold uppercase tracking-widest text-brand-red flex items-center gap-2">
              <Dumbbell className="w-4 h-4" /> {t("dailyPhysicalTraining")}
            </p>
            <h2 className="font-display font-black text-2xl md:text-3xl text-navy mt-2">
              {data.title}
            </h2>
            <p className="text-muted-foreground max-w-2xl mt-2 text-sm leading-relaxed">
              {data.lead}
            </p>
          </div>
          <Link
            to="/physical-training"
            className="inline-flex shrink-0 items-center gap-1.5 text-sm font-bold text-brand-red hover:underline"
          >
            {t("explorePhysicalTraining")} <ArrowRight className="w-4 h-4" />
          </Link>
        </div>

        <div className="grid gap-4 lg:grid-cols-3">
          {/* Routine table */}
          <div className="lg:col-span-2 rounded-2xl border border-border bg-white overflow-hidden">
            <div className="flex items-center gap-2 px-5 py-4 border-b border-border bg-secondary/50">
              <Clock className="w-5 h-5 text-brand-red" />
              <h3 className="font-display font-black text-lg text-navy">{data.routineTitle}</h3>
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
                    <tr key={r.id} className="border-t border-border last:border-0">
                      <td className="px-5 py-2.5 whitespace-nowrap font-mono font-bold text-navy">
                        {r.time}
                      </td>
                      <td className="px-5 py-2.5 text-foreground/90">{r.activity}</td>
                      <td className="px-5 py-2.5 text-right text-muted-foreground whitespace-nowrap">
                        {r.note}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* Responsibility card + photo */}
          <div className="space-y-4">
            <div className="rounded-2xl border-2 border-brand-red/30 bg-white overflow-hidden">
              <div className="flex items-center gap-2 px-5 py-3.5 bg-brand-red/5 border-b border-brand-red/20">
                <ShieldCheck className="w-5 h-5 text-brand-red" />
                <h3 className="font-display font-black text-base text-navy">
                  {data.responsibilityTitle}
                </h3>
              </div>
              <ul className="p-5 space-y-2.5">
                {data.responsibilities.slice(0, 4).map((line, i) => (
                  <li key={i} className="flex items-start gap-2.5 text-sm text-foreground/85">
                    <span className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-brand-red" />
                    <span className="leading-relaxed">{line}</span>
                  </li>
                ))}
              </ul>
            </div>
            <img
              src={data.photoUrl}
              alt={data.title}
              loading="lazy"
              className="w-full h-36 rounded-2xl border border-border object-cover"
            />
          </div>
        </div>

        {/* Register buttons */}
        <div className="mt-4 grid gap-3 sm:grid-cols-2 max-w-xl">
          <Link
            to="/admin/attendance"
            className="inline-flex items-center justify-center gap-2 rounded-xl bg-brand-red px-5 py-3 text-sm font-bold text-white hover:bg-red-600 transition"
          >
            <ClipboardList className="w-4 h-4" /> {data.attendanceRegisterLabel}
          </Link>
          <Link
            to="/admin/results"
            className="inline-flex items-center justify-center gap-2 rounded-xl border border-navy/30 bg-white px-5 py-3 text-sm font-bold text-navy hover:border-brand-red hover:text-brand-red transition"
          >
            <TrendingUp className="w-4 h-4" /> {data.progressRegisterLabel}
          </Link>
        </div>
      </div>
    </section>
  );
}

/* ────────────────────────────────────────────────────
   Progress Card — homepage preview (admin: /admin/student-cards)
   ──────────────────────────────────────────────────── */
function ProgressCardPreview() {
  const { t } = useLanguage();

  const features = [
    { icon: ClipboardList, key: "progressCardF1" },
    { icon: TrendingUp, key: "progressCardF2" },
    { icon: Award, key: "progressCardF3" },
  ] as const;

  return (
    <section className="py-14 md:py-16 bg-navy text-navy-foreground relative overflow-hidden">
      <div
        className="absolute -top-24 -left-24 h-72 w-72 rounded-full bg-brand-red/15 blur-3xl"
        aria-hidden="true"
      />
      <div
        className="absolute -bottom-32 -right-16 h-72 w-72 rounded-full bg-gold/10 blur-3xl"
        aria-hidden="true"
      />
      <div className="max-w-5xl mx-auto px-4 relative">
        {/* Heading + CTA on one row (stacked on mobile) */}
        <div className="flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
          <div className="max-w-2xl">
            <p className="text-xs font-bold uppercase tracking-widest text-gold">{t("Results")}</p>
            <h2 className="font-display font-black text-2xl md:text-3xl mt-2">
              {t("progressCardTitle")}
            </h2>
            <p className="text-white/70 max-w-xl mt-2 text-sm leading-relaxed">
              {t("progressCardSub")}
            </p>
          </div>
          <Link
            to="/results"
            className="inline-flex w-fit shrink-0 items-center gap-1.5 rounded-xl bg-brand-red px-5 py-3 text-sm font-bold text-white hover:bg-red-600 transition"
          >
            {t("Results")} <ArrowRight className="w-4 h-4" />
          </Link>
        </div>

        {/* Quick feature bullets */}
        <ul className="mt-6 grid grid-cols-1 gap-3 sm:grid-cols-3">
          {features.map((f) => (
            <li
              key={f.key}
              className="flex items-center gap-2.5 rounded-2xl border border-white/10 bg-white/5 px-4 py-3"
            >
              <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-gold/20">
                <f.icon className="h-4 w-4 text-gold" />
              </span>
              <span className="text-xs font-semibold text-white/85">{t(f.key)}</span>
            </li>
          ))}
        </ul>

        {/* Card framed inside a soft panel so it never floats on bare navy */}
        <div className="mt-8 rounded-3xl border border-white/10 bg-white/5 p-3 sm:p-5 backdrop-blur-sm">
          <div className="sc-print-root overflow-x-auto pb-2">
            <ProgressCard data={SAMPLE_CARD} />
          </div>
        </div>
      </div>
    </section>
  );
}

export function Index() {
  const site = useSiteSettings();
  const { t } = useLanguage();
  const [openFaq, setOpenFaq] = useState<number | null>(0);

  // Live Firestore content (admin-managed; static fallbacks live in the hooks)
  const stats = useHomepageStats();
  const categories = useHomepageCategories();
  const testimonials = useHomepageTestimonials();
  const { items: whyItems, hasData: whyHasData } = useWhyChooseUs();
  const { md, hasData: mdHasData } = useMdMessage();
  const { rows: selections } = useSelections(5);
  const faculty = useFaculty();
  const galleryItems = useGallery();
  const homeNotices = useLiveNotices(4);

  // Why-Choose-Us: admin-edited texts render as cards; otherwise the
  // designed bilingual cards below are used.
  const whyCards = whyHasData
    ? whyItems.slice(0, 6).map((item, idx) => ({
        key: item.id,
        icon: WHY_US[idx % WHY_US.length].icon,
        color: WHY_US[idx % WHY_US.length].color,
        title: item.text,
        subtitle: "",
      }))
    : WHY_US.map((w) => ({
        key: w.titleKey,
        icon: w.icon,
        color: w.color,
        title: t(w.titleKey),
        subtitle: t(w.nepaliKey),
      }));

  // Homepage gallery: admin-uploaded photos only (managed at /admin/gallery).
  const homeGallery = galleryItems
    .filter((g) => g.url && g.url.trim())
    .map((g) => ({ url: g.url, label: g.title || t("galleryInsideStar") }))
    .filter((item, idx, arr) => arr.findIndex((a) => a.url === item.url) === idx)
    .slice(0, 6);

  return (
    <div className="min-h-screen flex flex-col bg-background pb-14 md:pb-0">
      <SiteHeader />

      {/* ════════════════════════════════════════════
          STEP 2 — Breaking News ticker + admin banner slider
         ════════════════════════════════════════════ */}
      <section className="bg-navy">
        <BreakingNewsTicker />
        <HeroSlider />

        {/* Quick Features Strip */}
        <div className="relative bg-white border-t border-border">
          <div className="max-w-6xl mx-auto px-4 py-5 sm:py-6">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3 sm:gap-4">
              {[
                { icon: BookOpen, titleKey: "writtenPreparation" },
                { icon: Users, titleKey: "physicalTraining" },
                { icon: ClipboardCheck, titleKey: "regularMockTests" },
                { icon: Building, titleKey: "safeHostel" },
              ].map((f) => (
                <div key={f.titleKey} className="text-center group">
                  <div className="w-12 h-12 sm:w-14 sm:h-14 mx-auto rounded-full bg-navy/10 flex items-center justify-center mb-2 group-hover:scale-110 transition">
                    <f.icon className="w-5 h-5 sm:w-6 sm:h-6 text-navy" />
                  </div>
                  <p className="font-bold text-xs sm:text-sm text-navy">{t(f.titleKey)}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Admin-published advertisement (renders nothing when no active ad) */}
      <AdBannerBelowHero />

      {/* ════════════════════════════════════════════
          STEP 3 — Courses Section
         ════════════════════════════════════════════ */}
      <section className="py-14 bg-gradient-to-b from-slate-50 to-white">
        <div className="max-w-7xl mx-auto px-4">
          {/* Section Header */}
          <div className="text-center mb-10">
            <div className="flex items-center justify-center gap-4 mb-3">
              <div className="h-0.5 w-12 sm:w-20 bg-red-500" />
              <h2 className="text-xl sm:text-2xl md:text-3xl font-extrabold text-slate-900 tracking-tight">
                {t("coursePrompt")}
              </h2>
              <div className="h-0.5 w-12 sm:w-20 bg-red-500" />
            </div>
            <p className="text-slate-600 text-sm sm:text-base">{t("courseSubtext")}</p>
          </div>

          {/* Course Cards — 2×2 grid matching reference (Loksewa has no service card) */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
            {COURSES.filter((c) => !c.onlineOnly).map((c) => {
              const Icon = c.icon;
              return (
                <div
                  key={c.titleKey}
                  className={`relative overflow-hidden rounded-2xl ${c.bg} p-6 sm:p-7 text-white shadow-xl ${c.shadow} transition-all duration-300 hover:scale-[1.02] flex flex-col justify-between group`}
                >
                  {/* Watermark Icon */}
                  <Icon
                    className={`absolute -right-6 -bottom-6 w-40 h-40 ${c.watermark} pointer-events-none transition-transform duration-500 group-hover:scale-110`}
                    strokeWidth={1.5}
                  />

                  {/* Service photo — fills the whole card, card colour shows through */}
                  <img
                    src={c.img}
                    alt=""
                    aria-hidden="true"
                    loading="lazy"
                    className="pointer-events-none absolute inset-0 h-full w-full object-cover object-[center_30%] opacity-60 saturate-[0.9] transition-transform duration-500 group-hover:scale-105"
                  />

                  {/* Readability gradient — keeps white text sharp over the photo */}
                  <div className="pointer-events-none absolute inset-0 bg-gradient-to-r from-black/50 via-black/25 to-black/5" />

                  <div className="relative z-[1]">
                    <h3 className="text-xl sm:text-2xl font-bold mb-2">{t(c.titleKey)}</h3>
                    <p className="text-white/80 text-xs sm:text-sm leading-relaxed mb-8">
                      {t(c.descKey)}
                    </p>
                  </div>

                  <Link
                    to={`/services/${c.slug}`}
                    className={`relative z-10 inline-flex items-center gap-2 ${c.btnBg} text-white text-xs sm:text-sm font-semibold px-4 py-2.5 rounded-xl backdrop-blur-sm transition-all duration-200 w-fit cursor-pointer shadow-sm`}
                  >
                    {t("viewDetails")}
                    <ArrowRight className="w-4 h-4 transition-transform duration-200 group-hover:translate-x-1" />
                  </Link>
                </div>
              );
            })}
          </div>

          {/* Browse by Category */}
          <div className="mt-8">
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-display font-black text-lg text-navy">{t("browseByCategory")}</h3>
              <Link
                to="/courses"
                className="text-xs font-bold text-brand-red flex items-center gap-1 hover:underline"
              >
                {t("viewMore")} <ArrowRight className="w-3 h-3" />
              </Link>
            </div>
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
              {categories.slice(0, 6).map((c) => {
                const CIcon = getCategoryIcon(c.icon);
                return (
                  <Link
                    key={c.id}
                    to="/courses"
                    className={`${c.color} rounded-xl p-4 text-center border border-slate-100 hover:shadow-md transition group`}
                  >
                    <div className="w-10 h-10 mx-auto rounded-full bg-white flex items-center justify-center mb-2 shadow-sm group-hover:scale-110 transition">
                      <CIcon className="w-5 h-5" />
                    </div>
                    <p className="font-bold text-xs text-navy">{c.title}</p>
                    <p className="text-[10px] opacity-75 mt-0.5 line-clamp-2">{c.desc}</p>
                  </Link>
                );
              })}
            </div>
          </div>

          {/* Stats Row */}
          <div className="mt-10 bg-navy rounded-2xl p-6 grid grid-cols-2 md:grid-cols-4 gap-4">
            {stats.slice(0, 4).map((s) => (
              <div key={s.id} className="text-center">
                <div className="w-10 h-10 mx-auto rounded-full bg-white/10 flex items-center justify-center mb-2">
                  <Award className="w-5 h-5 text-gold" />
                </div>
                <p className="font-display text-2xl font-black text-gold">{s.value}</p>
                <p className="text-[10px] text-white/60 uppercase tracking-wider mt-1">{s.label}</p>
              </div>
            ))}
          </div>

          {/* CTA Banner */}
          <div className="mt-6 rounded-2xl overflow-hidden bg-gradient-to-r from-brand-red via-brand-red/90 to-red-600">
            <div className="h-40 flex items-center">
              <div className="max-w-6xl mx-auto px-6 w-full flex flex-col md:flex-row items-center justify-between gap-4">
                <div className="text-white">
                  <h3 className="font-display font-black text-xl md:text-2xl">
                    {t("yourDreamOurGuidance")}
                  </h3>
                  <p className="text-sm text-white/80 mt-1">
                    {t("preparationTodaySuccessTomorrow")}
                  </p>
                </div>
                <Link
                  to="/admission"
                  className="inline-flex items-center gap-2 bg-white text-brand-red px-6 py-3 rounded-xl font-bold text-sm hover:bg-slate-50 transition shrink-0"
                >
                  <FileText className="w-4 h-4" />
                  {t("applyToday")}
                  <ArrowRight className="w-4 h-4" />
                </Link>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ════════════════════════════════════════════
          STEP 3.5 — Latest Notices (live from admin `notices`,
          same cards/data as the public /notices page)
         ════════════════════════════════════════════ */}
      <section className="py-14 bg-slate-50">
        <div className="max-w-7xl mx-auto px-4">
          <div className="text-center mb-10">
            <div className="flex items-center justify-center gap-4 mb-3">
              <div className="h-0.5 w-12 sm:w-20 bg-red-500" />
              <h2 className="text-xl sm:text-2xl md:text-3xl font-extrabold text-slate-900 tracking-tight">
                {t("latestNotices")}
              </h2>
              <div className="h-0.5 w-12 sm:w-20 bg-red-500" />
            </div>
            <p className="text-slate-600 text-sm sm:text-base">{t("latestNoticesSub")}</p>
          </div>

          <div className="grid gap-6 lg:grid-cols-5">
            {/* Banner — photo + link to the full notices page.
                Photo: "Army Money crawl" by Sudeep KC, CC BY-SA 4.0 (Wikimedia Commons) */}
            <div className="group relative overflow-hidden rounded-2xl lg:col-span-2 min-h-[260px]">
              <img
                src="/site/notice-hero.jpg"
                alt=""
                aria-hidden="true"
                loading="lazy"
                className="absolute inset-0 h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-navy via-navy/85 to-navy/45" />
              <div className="relative flex h-full min-h-[260px] flex-col justify-end p-6 text-white">
                <BellRing className="mb-3 w-8 h-8 text-gold" />
                <h3 className="font-display font-black text-xl">{t("noticesHeroTitle")}</h3>
                <p className="mt-1 line-clamp-2 text-sm text-white/70">{t("noticesHeroSub")}</p>
                <Link
                  to="/notices"
                  className="mt-4 inline-flex w-fit items-center gap-2 rounded-xl bg-brand-red px-4 py-2.5 text-xs sm:text-sm font-semibold transition hover:bg-brand-red/90"
                >
                  {t("viewAllNotices")}
                  <ArrowRight className="w-4 h-4" />
                </Link>
              </div>
            </div>

            {/* Latest notices — identical cards to /notices (admin-managed, live) */}
            <div className="lg:col-span-3">
              {homeNotices.length === 0 ? (
                <div className="flex h-full min-h-[260px] flex-col items-center justify-center rounded-2xl border border-dashed border-border bg-white p-8 text-center">
                  <BellRing className="mb-3 w-8 h-8 text-brand-red/40" />
                  <p className="text-sm text-muted-foreground">{t("noticesEmpty")}</p>
                </div>
              ) : (
                <div className="grid gap-4 sm:grid-cols-2">
                  {homeNotices.map((n) => (
                    <article
                      key={n.id}
                      className="flex flex-col rounded-2xl border border-border bg-white p-4 transition hover:shadow-md dark:bg-slate-800"
                    >
                      <div className="flex flex-wrap items-center gap-2">
                        <span
                          className={`text-[11px] font-bold px-2.5 py-1 rounded-full ${
                            CATEGORY_TONE[n.category] ?? CATEGORY_TONE.General
                          }`}
                        >
                          {n.category || "General"}
                        </span>
                        {isNewNotice(n) && (
                          <span className="text-[10px] font-black uppercase tracking-wider bg-brand-red text-white px-2 py-0.5 rounded-full">
                            {t("newBadge")}
                          </span>
                        )}
                        <span className="ml-auto text-xs text-muted-foreground flex items-center gap-1">
                          <CalendarDays className="w-3.5 h-3.5" />
                          {noticeTimeAgo(n)}
                        </span>
                      </div>
                      <h3 className="mt-2.5 flex items-start gap-2 font-display font-black text-base text-navy dark:text-white">
                        <Megaphone className="w-4 h-4 mt-0.5 text-brand-red shrink-0" />
                        <span className="line-clamp-2">{n.title || t("generalNotice")}</span>
                      </h3>
                      {n.body && (
                        <p className="mt-1.5 text-sm leading-relaxed text-slate-600 dark:text-slate-300 line-clamp-2">
                          {n.body}
                        </p>
                      )}
                    </article>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      </section>

      {/* ════════════════════════════════════════════
          STEP 4 — Why Choose Us
         ════════════════════════════════════════════ */}
      <section className="py-14 bg-white">
        <div className="max-w-6xl mx-auto px-4">
          <div className="text-center mb-10">
            <div className="inline-flex items-center gap-2 bg-navy/10 text-navy px-4 py-2 rounded-full text-xs font-bold uppercase tracking-wider mb-4">
              <span className="w-2 h-2 bg-navy rounded-full" />
              {t("whyChooseUs")}
            </div>
            <h2
              className="font-display text-2xl md:text-4xl font-black text-navy leading-tight"
              dangerouslySetInnerHTML={{ __html: t("whyChooseStar") }}
            />
            <p className="mt-3 text-sm md:text-base text-slate-500">{t("whySubtext")}</p>
          </div>

          {/* Feature Grid */}
          <div className="grid grid-cols-2 md:grid-cols-3 gap-4 md:gap-6">
            {whyCards.map((w) => {
              const Icon = w.icon;
              return (
                <div
                  key={w.key}
                  className="text-center p-6 bg-slate-50 rounded-2xl hover:bg-white hover:shadow-lg border border-transparent hover:border-slate-200 transition-all duration-300"
                >
                  <div
                    className={`w-14 h-14 mx-auto rounded-full ${w.color} flex items-center justify-center mb-3 shadow-lg`}
                  >
                    <Icon className="w-6 h-6 text-white" />
                  </div>
                  <h3 className="font-bold text-sm md:text-base text-navy">{w.title}</h3>
                  {w.subtitle && <p className="text-xs text-slate-500 mt-1">{w.subtitle}</p>}
                </div>
              );
            })}
          </div>

          {/* Written vs Physical Training */}
          <div className="mt-10 grid md:grid-cols-2 gap-4">
            {/* Written Classes */}
            <div className="bg-gradient-to-br from-navy to-blue-900 rounded-2xl relative h-64 group flex items-center overflow-hidden">
              <BookOpen
                className="absolute -top-8 -right-4 w-44 h-44 text-white/5 rotate-12 pointer-events-none"
                strokeWidth={1.5}
              />
              <div className="absolute bottom-0 left-0 right-0 p-6 text-white z-10">
                <div className="flex items-center gap-2 mb-2">
                  <BookOpen className="w-6 h-6 text-gold" />
                  <h3 className="font-display font-black text-xl">{t("writtenClasses")}</h3>
                </div>
                <p className="text-xs text-white/70 mb-2">{t("nepaliEnglishMath")}</p>
                <p className="text-sm text-white/80 mb-3">{t("comprehensivePrep")}</p>
                <Link
                  to="/courses"
                  className="inline-flex items-center gap-1.5 bg-white/20 hover:bg-white/30 text-white px-4 py-2 rounded-lg text-xs font-bold transition backdrop-blur-sm"
                >
                  {t("exploreWrittenClasses")} <ArrowRight className="w-3 h-3" />
                </Link>
              </div>
            </div>

            {/* Physical Training */}
            <div className="bg-gradient-to-br from-brand-red to-red-800 rounded-2xl relative h-64 group flex items-center overflow-hidden">
              <Users
                className="absolute -top-8 -right-4 w-44 h-44 text-white/10 rotate-12 pointer-events-none"
                strokeWidth={1.5}
              />
              <div className="absolute bottom-0 left-0 right-0 p-6 text-white z-10">
                <div className="flex items-center gap-2 mb-2">
                  <Users className="w-6 h-6 text-gold" />
                  <h3 className="font-display font-black text-xl">{t("physicalTrainingDetail")}</h3>
                </div>
                <p className="text-xs text-white/70 mb-2">{t("runningPushupSitup")}</p>
                <p className="text-sm text-white/80 mb-3">{t("physicalPrepAsPerStandard")}</p>
                <Link
                  to="/physical-training"
                  className="inline-flex items-center gap-1.5 bg-white/20 hover:bg-white/30 text-white px-4 py-2 rounded-lg text-xs font-bold transition backdrop-blur-sm"
                >
                  {t("explorePhysicalTraining")} <ArrowRight className="w-3 h-3" />
                </Link>
              </div>
            </div>
          </div>

          {/* MD Message Banner */}
          <div className="mt-8 rounded-2xl overflow-hidden bg-gradient-to-r from-navy via-navy/90 to-navy/60">
            <div className="flex items-center min-h-[200px]">
              <div className="flex flex-col md:flex-row items-center gap-6 max-w-6xl mx-auto px-6 w-full">
                <div className="shrink-0 w-16 h-16 rounded-full bg-gold/20 overflow-hidden flex items-center justify-center border-2 border-gold">
                  {md.photoUrl ? (
                    <img
                      src={md.photoUrl}
                      alt={md.name}
                      className="w-full h-full object-cover"
                      loading="lazy"
                    />
                  ) : (
                    <Star className="w-8 h-8 text-gold" />
                  )}
                </div>
                <div className="text-center md:text-left text-white">
                  <p className="text-gold text-xs font-bold uppercase tracking-wider">
                    {t("managingDirector")}
                  </p>
                  <h3 className="font-display font-black text-xl mt-1">{md.name}</h3>
                  <p className="text-sm text-white/80 mt-2 max-w-xl line-clamp-3">
                    &ldquo;{mdHasData ? md.message : t("mdQuote")}&rdquo;
                  </p>
                </div>
                <Link
                  to="/admission"
                  className="shrink-0 inline-flex items-center gap-2 bg-brand-red hover:bg-red-600 text-white px-6 py-3 rounded-xl font-bold text-sm transition"
                >
                  <FileText className="w-4 h-4" />
                  {t("Apply Now")} <ArrowRight className="w-4 h-4" />
                </Link>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* STEP 4.2 — Physical Training (full page at /physical-training) */}
      <PhysicalTrainingPreview />

      {/* STEP 4.3 — Student Progress Card preview (admin: /admin/student-cards) */}
      <ProgressCardPreview />

      {/* ════════════════════════════════════════════
          STEP 4.5 — About the Institute (short version; full page at /about)
          Photos: "…Operation Sahayogi Haat (9030163)" by Cpl. Thomas Sheng and
          Nepal Police band photo, U.S. Marine Corps / public domain
         ════════════════════════════════════════════ */}
      <section className="py-14 md:py-16 bg-gradient-to-b from-white to-slate-50">
        <div className="mx-auto grid max-w-7xl items-center gap-10 px-4 lg:grid-cols-2">
          {/* Image collage */}
          <div className="relative">
            <div className="pointer-events-none absolute -inset-2 sm:-inset-3 translate-x-3 translate-y-3 rounded-3xl border-2 border-gold/50" />
            <img
              src="/site/about-lead.jpg"
              alt=""
              aria-hidden="true"
              loading="lazy"
              className="relative h-64 w-full rounded-3xl object-cover shadow-xl sm:h-80 lg:h-[26rem]"
            />
            <div className="relative -mt-10 ml-4 mr-16 overflow-hidden rounded-2xl border-4 border-white shadow-xl sm:-mt-14 sm:ml-8 sm:mr-24">
              <img
                src="/site/notice-hero.jpg"
                alt=""
                aria-hidden="true"
                loading="lazy"
                className="h-28 w-full object-cover sm:h-36"
              />
            </div>
            {/* Logo badge */}
            <div className="absolute right-4 top-4 flex items-center gap-2 rounded-full bg-navy/90 px-3 py-2 shadow-lg backdrop-blur-sm sm:right-6 sm:top-6">
              <img
                src="/favicon-48x48.jpg"
                alt="Star Coaching Institute logo"
                className="h-7 w-7 rounded-full object-cover ring-1 ring-gold/70"
              />
              <span className="text-[11px] font-bold uppercase tracking-wider text-gold">
                {t("starCoaching")}
              </span>
            </div>
          </div>

          {/* Content */}
          <div>
            <p className="text-xs font-bold uppercase tracking-widest text-brand-red">
              {t("About")}
            </p>
            <h2 className="mt-2 font-display font-black text-2xl text-navy md:text-3xl">
              {t("aboutSectionTitle")}
            </h2>
            <div className="mt-1 h-1 w-16 rounded bg-brand-red" />
            <p className="mt-4 leading-relaxed text-foreground/80 text-sm md:text-base">
              {t("historyBody").replace("{year}", String(site.established))}
            </p>

            {/* Vision & Mission */}
            <div className="mt-5 grid grid-cols-1 gap-3 sm:grid-cols-2">
              <div className="rounded-2xl border border-border bg-white p-4 shadow-sm transition hover:border-brand-red/40">
                <div className="mb-2 flex h-9 w-9 items-center justify-center rounded-lg bg-brand-red/10">
                  <Eye className="w-5 h-5 text-brand-red" />
                </div>
                <p className="text-sm font-bold text-navy">{t("vision")}</p>
                <p className="mt-1 text-xs leading-relaxed text-muted-foreground line-clamp-3">
                  {t("visionBody")}
                </p>
              </div>
              <div className="rounded-2xl border border-border bg-white p-4 shadow-sm transition hover:border-brand-red/40">
                <div className="mb-2 flex h-9 w-9 items-center justify-center rounded-lg bg-brand-red/10">
                  <Target className="w-5 h-5 text-brand-red" />
                </div>
                <p className="text-sm font-bold text-navy">{t("mission")}</p>
                <p className="mt-1 text-xs leading-relaxed text-muted-foreground line-clamp-3">
                  {t("missionBody")}
                </p>
              </div>
            </div>

            {/* Quick facts */}
            <ul className="mt-4 space-y-2 text-sm text-foreground/80">
              <li className="flex items-start gap-2">
                <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0 text-green-600" />
                <span>{t("aboutGoal1")}</span>
              </li>
              <li className="flex items-start gap-2">
                <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0 text-green-600" />
                <span>{t("aboutGoal2")}</span>
              </li>
              <li className="flex items-start gap-2">
                <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0 text-green-600" />
                <span>{t("aboutGoal3")}</span>
              </li>
            </ul>

            <div className="mt-6 flex flex-wrap items-center gap-3">
              <Link
                to="/about"
                className="inline-flex items-center gap-2 rounded-xl bg-navy px-5 py-3 text-sm font-semibold text-white transition hover:bg-navy/90"
              >
                {t("exploreAbout")}
                <ArrowRight className="w-4 h-4" />
              </Link>
              <Link
                to="/admission"
                className="inline-flex items-center gap-2 rounded-xl border border-navy/20 bg-white px-5 py-3 text-sm font-semibold text-navy transition hover:border-brand-red hover:text-brand-red"
              >
                {t("Apply Now")}
                <ArrowRight className="w-4 h-4" />
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* ════════════════════════════════════════════
          STEP 5 — Online Classes
         ════════════════════════════════════════════ */}
      <section className="py-14 bg-slate-50">
        <div className="max-w-6xl mx-auto px-4">
          <div className="text-center mb-10">
            <div className="inline-flex items-center gap-2 bg-brand-red/10 text-brand-red px-4 py-2 rounded-full text-xs font-bold uppercase tracking-wider mb-4">
              <span className="w-2 h-2 bg-brand-red rounded-full" />
              {t("onlineClasses")}
            </div>
            <h2 className="font-display text-2xl md:text-4xl font-black text-navy leading-tight">
              {t("prepareFromHome")}
            </h2>
            <p className="mt-3 text-xs text-slate-500 uppercase tracking-wider">
              {t("anytimeAnywhereSameQuality")}
            </p>
          </div>

          {/* Live Class Banner */}
          <div className="rounded-2xl overflow-hidden mb-8 bg-gradient-to-r from-navy via-navy/90 to-navy/40 relative">
            <div className="relative z-10 px-6 py-8 md:py-12">
              <div className="absolute top-4 right-4 bg-brand-red text-white text-xs font-bold px-3 py-1 rounded-full flex items-center gap-1">
                <span className="w-2 h-2 bg-white rounded-full animate-pulse" />
                {t("liveClass")}
              </div>
              <div className="grid md:grid-cols-2 gap-6 items-center">
                <div>
                  <h3 className="font-display font-black text-2xl md:text-3xl text-white">
                    {t("nepalPolice")}
                  </h3>
                  <ul className="mt-4 space-y-2 text-sm text-white/80">
                    {[
                      t("sangathanSanchana"),
                      t("karyaAdhikarJimmewari"),
                      t("sewaAnushasan"),
                      t("mahatwapurnPrashna"),
                    ].map((item) => (
                      <li key={item} className="flex items-center gap-2">
                        <CheckCircle2 className="w-4 h-4 text-gold" />
                        {item}
                      </li>
                    ))}
                  </ul>
                </div>
                <div className="bg-white/10 backdrop-blur-sm rounded-xl p-6 text-center border border-white/10">
                  <Laptop className="w-12 h-12 text-gold mx-auto mb-3" />
                  <p className="font-bold text-white">{t("liveOnlineClasses")}</p>
                  <p className="text-xs text-white/70 mt-1">{t("prepareFromHome")}</p>
                  <Link
                    to="/admission"
                    className="mt-4 inline-flex items-center gap-2 bg-brand-red hover:bg-red-600 text-white px-5 py-2.5 rounded-lg text-xs font-bold transition"
                  >
                    {t("joinOnlineClass")} <ArrowRight className="w-3.5 h-3.5" />
                  </Link>
                </div>
              </div>
            </div>
          </div>

          {/* Online Features Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 mb-8">
            {ONLINE_FEATURES.map((f) => {
              const Icon = f.icon;
              return (
                <div
                  key={f.titleKey}
                  className="bg-white rounded-xl p-5 border border-slate-100 hover:shadow-md transition"
                >
                  <div className="w-10 h-10 rounded-full bg-brand-red/10 flex items-center justify-center mb-3">
                    <Icon className="w-5 h-5 text-brand-red" />
                  </div>
                  <h4 className="font-bold text-sm text-navy">{t(f.titleKey)}</h4>
                  <p className="text-xs text-slate-500 mt-1">{t(f.descKey)}</p>
                </div>
              );
            })}
          </div>

          {/* Online Course Cards */}
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-display font-black text-lg text-navy">{t("ourOnlineCourses")}</h3>
            <Link
              to="/courses"
              className="text-xs font-bold text-brand-red flex items-center gap-1 hover:underline"
            >
              {t("prepareBrighterTomorrow")} <ArrowRight className="w-3 h-3" />
            </Link>
          </div>
          <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
            {COURSES.map((c) => {
              return (
                <Link
                  key={c.titleKey}
                  to={c.href ?? `/services/${c.slug}`}
                  className={`group relative rounded-xl overflow-hidden text-white text-center hover:shadow-lg transition aspect-[3/4] bg-gradient-to-br ${c.bg} flex flex-col items-center justify-center`}
                >
                  {/* Official government emblem on a white plate — stays legible on every card colour.
                      Explicit w-full/h-full (not max-*): an unloaded image has an intrinsic size of
                      0×0, so max-* would collapse the box and lazy-loading would never trigger. */}
                  <div className="w-28 h-20 mb-3 rounded-2xl bg-white shadow-sm flex items-center justify-center p-2">
                    <img
                      src={c.logo}
                      alt=""
                      aria-hidden="true"
                      loading="lazy"
                      className="h-full w-full object-contain"
                    />
                  </div>
                  <div className="p-4">
                    <h4 className="font-bold text-sm">{t(c.titleKey)}</h4>
                    <span className="mt-2 inline-flex items-center gap-1 bg-white/20 hover:bg-white/30 text-white text-xs font-bold px-3 py-1 rounded-full transition backdrop-blur-sm">
                      {t("viewDetails")} <ArrowRight className="w-3 h-3" />
                    </span>
                  </div>
                </Link>
              );
            })}
          </div>

          {/* Join CTA */}
          <div className="mt-6 flex flex-col sm:flex-row gap-3">
            <Link
              to="/admission"
              className="flex-1 inline-flex items-center justify-center gap-2 bg-navy hover:bg-blue-900 text-white px-6 py-3 rounded-xl font-bold text-sm transition"
            >
              <GraduationCap className="w-4 h-4" />
              {t("joinOnlineClass")}
              <ArrowRight className="w-4 h-4" />
            </Link>
            <a
              href={whatsappHref(site.whatsapp)}
              target="_blank"
              rel="noopener noreferrer"
              className="flex-1 inline-flex items-center justify-center gap-2 bg-green-600 hover:bg-green-700 text-white px-6 py-3 rounded-xl font-bold text-sm transition"
            >
              <MessageCircle className="w-4 h-4" />
              {t("whatsappForDetails")}
              <ArrowRight className="w-4 h-4" />
            </a>
          </div>
        </div>
      </section>

      {/* ════════════════════════════════════════════
          STEP 6 — Admission Process + Student Success
         ════════════════════════════════════════════ */}
      <section className="py-14 bg-white">
        <div className="max-w-6xl mx-auto px-4">
          {/* Admission Process */}
          <div className="text-center mb-10">
            <div className="inline-flex items-center gap-2 bg-navy/10 text-navy px-4 py-2 rounded-full text-xs font-bold uppercase tracking-wider mb-4">
              <span className="w-2 h-2 bg-navy rounded-full" />
              {t("admissionProcess")}
            </div>
            <h2 className="font-display text-2xl md:text-4xl font-black text-navy leading-tight">
              {t("howToEnroll")}
            </h2>
            <p className="mt-3 text-sm md:text-base text-slate-500">{t("admissionSubtext")}</p>
          </div>

          {/* 3 Steps */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
            {[
              { step: 1, icon: BookOpen, titleKey: "courseSelect", descKey: "courseSelectDesc" },
              { step: 2, icon: FileText, titleKey: "formFill", descKey: "formFillDesc" },
              {
                step: 3,
                icon: Check,
                titleKey: "admissionConfirm",
                descKey: "admissionConfirmDesc",
              },
            ].map((s, i) => {
              const Icon = s.icon;
              return (
                <div key={s.step} className="relative text-center">
                  <div className="w-14 h-14 mx-auto rounded-full bg-navy text-white flex items-center justify-center font-display font-black text-xl mb-3 shadow-lg">
                    {s.step}
                  </div>
                  {i < 2 && (
                    <div className="hidden md:block absolute top-7 left-[60%] w-[80%] h-0.5 bg-slate-200" />
                  )}
                  <div className="w-12 h-12 mx-auto rounded-full bg-brand-red/10 flex items-center justify-center mb-2">
                    <Icon className="w-6 h-6 text-brand-red" />
                  </div>
                  <h4 className="font-bold text-sm text-navy">{t(s.titleKey)}</h4>
                  <p className="text-xs text-slate-500 mt-1 max-w-[200px] mx-auto">
                    {t(s.descKey)}
                  </p>
                </div>
              );
            })}
          </div>

          <div className="text-center">
            <Link
              to="/admission"
              className="inline-flex items-center gap-2 bg-brand-red hover:bg-red-600 text-white px-8 py-3 rounded-xl font-bold text-sm transition shadow-lg shadow-brand-red/25"
            >
              <FileText className="w-4 h-4" />
              {t("startYourAdmission")}
              <ArrowRight className="w-4 h-4" />
            </Link>
          </div>

          {/* Student Success */}
          <div className="mt-14">
            <div className="text-center mb-10">
              <div className="inline-flex items-center gap-2 bg-gold/20 text-amber-700 px-4 py-2 rounded-full text-xs font-bold uppercase tracking-wider mb-4">
                <span className="w-2 h-2 bg-gold rounded-full" />
                {t("studentSuccess")}
              </div>
              <h2 className="font-display text-2xl md:text-4xl font-black text-navy leading-tight">
                {t("ourStudentOurPride")}
              </h2>
              <p className="mt-3 text-sm md:text-base text-slate-500">
                {t("successStoriesSubtext")}
              </p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
              {selections.map((s) => {
                const name = s.studentName || s.name || "";
                const badge = s.achievement || s.post || s.examCategory || s.tag || "";
                const sub = [s.rank, s.year].filter(Boolean).join(" · ") || s.tag || "";
                return (
                  <div
                    key={s.id}
                    className="bg-slate-50 rounded-xl text-center hover:shadow-md transition border border-slate-100 p-4"
                  >
                    <div className="w-14 h-14 mx-auto rounded-full bg-navy text-white flex items-center justify-center font-display font-bold text-sm mb-2 overflow-hidden">
                      {s.photoUrl ? (
                        <img
                          src={s.photoUrl}
                          alt={name}
                          className="w-full h-full object-cover"
                          loading="lazy"
                        />
                      ) : (
                        initialsOf(name)
                      )}
                    </div>
                    {badge && (
                      <span className="inline-block bg-brand-red text-white text-[9px] font-bold px-2 py-0.5 rounded-full mb-2">
                        {t("selectedFor")} {badge}
                      </span>
                    )}
                    <p className="font-bold text-xs text-navy">{name}</p>
                    <p className="text-[10px] text-slate-400">{sub}</p>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </section>

      {/* ════════════════════════════════════════════
          STEP 7 — Gallery + Instructors + Hostel
         ════════════════════════════════════════════ */}
      <section className="py-14 bg-slate-50">
        <div className="max-w-6xl mx-auto px-4">
          {/* Gallery */}
          <div className="mb-12">
            <div className="flex items-center justify-between mb-6">
              <div>
                <div className="flex items-center gap-2 mb-1">
                  <Camera className="w-5 h-5 text-brand-red" />
                  <h2 className="font-display font-black text-xl text-navy">
                    {t("galleryInsideStar")}
                  </h2>
                </div>
                <p className="text-xs text-slate-500">{t("gallerySubtext")}</p>
              </div>
              <Link
                to="/gallery"
                className="text-xs font-bold text-brand-red flex items-center gap-1 hover:underline"
              >
                {t("viewMore")} <ArrowRight className="w-3 h-3" />
              </Link>
            </div>
            {homeGallery.length === 0 ? (
              <div className="rounded-xl border border-dashed border-slate-300 bg-white p-8 text-center">
                <Camera className="w-7 h-7 text-slate-300 mx-auto mb-3" />
                <p className="text-sm text-slate-500">{t("galleryEmpty")}</p>
              </div>
            ) : (
              <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                {homeGallery.map((item, idx) => (
                  <Link
                    key={`${item.url}-${idx}`}
                    to="/gallery"
                    className="relative rounded-xl overflow-hidden aspect-[4/3] group cursor-pointer"
                  >
                    <img
                      src={item.url}
                      alt={item.label}
                      className="absolute inset-0 w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                      loading="lazy"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
                    <div className="absolute bottom-0 left-0 right-0 p-3 translate-y-full group-hover:translate-y-0 transition-transform duration-300">
                      <span className="text-white text-xs font-bold bg-brand-red/80 backdrop-blur-sm px-2 py-1 rounded">
                        {item.label}
                      </span>
                    </div>
                  </Link>
                ))}
              </div>
            )}
          </div>

          {/* Instructors */}
          <div className="mb-12">
            <div className="flex items-center justify-between mb-6">
              <div>
                <div className="flex items-center gap-2 mb-1">
                  <Users className="w-5 h-5 text-brand-red" />
                  <h2 className="font-display font-black text-xl text-navy">
                    {t("ourInstructors")}
                  </h2>
                </div>
                <p className="text-xs text-slate-500">{t("instructorsSubtext")}</p>
              </div>
              <Link
                to="/faculty"
                className="text-xs font-bold text-brand-red flex items-center gap-1 hover:underline"
              >
                {t("viewAllInstructors")} <ArrowRight className="w-3 h-3" />
              </Link>
            </div>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              {faculty.slice(0, 4).map((f) => (
                <div
                  key={f.id || f.name}
                  className="bg-white rounded-xl text-center border border-slate-100 hover:shadow-md transition p-4"
                >
                  <div className="w-16 h-16 mx-auto rounded-full bg-navy text-white flex items-center justify-center font-display font-bold text-lg mb-3 overflow-hidden">
                    {f.photoUrl ? (
                      <img
                        src={f.photoUrl}
                        alt={f.name}
                        className="w-full h-full object-cover"
                        loading="lazy"
                      />
                    ) : (
                      initialsOf(f.name)
                    )}
                  </div>
                  <p className="font-bold text-sm text-navy">{f.name}</p>
                  <p className="text-xs text-brand-red mt-1">{f.subject || f.role}</p>
                </div>
              ))}
            </div>
          </div>

          {/* Hostel */}
          <div className="bg-white rounded-2xl overflow-hidden border border-slate-100">
            <div className="grid md:grid-cols-2 gap-0">
              <div className="bg-gradient-to-br from-blue-600 to-navy relative flex items-center justify-center h-64 md:h-auto overflow-hidden">
                <div className="relative text-center text-white p-6">
                  <BedDouble className="w-16 h-16 text-white/50 mx-auto mb-3" />
                  <p className="font-bold text-sm">{t("starHostel")}</p>
                  <p className="text-[10px] text-white/70">{t("safeStayBetterTomorrow")}</p>
                </div>
              </div>
              <div className="p-6 md:p-8">
                <div className="flex items-center gap-2 mb-4">
                  <div className="w-10 h-10 rounded-full bg-brand-red flex items-center justify-center">
                    <BedDouble className="w-5 h-5 text-white" />
                  </div>
                  <div>
                    <h3 className="font-display font-black text-lg text-navy">
                      {t("hostelAvailable")}
                    </h3>
                    <p className="text-xs text-slate-500">{t("hostelSubtext")}</p>
                  </div>
                </div>
                <ul className="space-y-2">
                  {[
                    t("separateHostel"),
                    t("cleanRooms"),
                    t("nutritiousMeals"),
                    t("security247"),
                    t("peacefulEnvironment"),
                    t("nearToInstitute"),
                  ].map((item) => (
                    <li key={item} className="flex items-center gap-2 text-sm text-slate-700">
                      <CheckCircle2 className="w-4 h-4 text-green-500 shrink-0" />
                      {item}
                    </li>
                  ))}
                </ul>
                <a
                  href={whatsappHref(site.whatsapp)}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="mt-4 inline-flex items-center gap-2 bg-brand-red hover:bg-red-600 text-white px-5 py-2.5 rounded-lg font-bold text-xs transition"
                >
                  <Phone className="w-3.5 h-3.5" />
                  {t("contactForDetails")}
                  <ArrowRight className="w-3 h-3" />
                </a>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ════════════════════════════════════════════
          STEP 8 — Reviews + FAQ + Contact + Footer
         ════════════════════════════════════════════ */}
      <section className="py-14 bg-white">
        <div className="max-w-6xl mx-auto px-4">
          {/* Student Reviews */}
          <div className="mb-12">
            <div className="text-center mb-8">
              <p className="text-xs uppercase tracking-widest text-brand-red font-bold">
                {t("studentReviews")}
              </p>
              <h2 className="font-display text-2xl md:text-4xl font-black text-navy leading-tight mt-2">
                {t("whatStudentsSay")}
              </h2>
              <p className="mt-3 text-sm text-slate-500">{t("reviewsSubtext")}</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {testimonials.slice(0, 3).map((r) => (
                <div key={r.id} className="bg-slate-50 rounded-xl border border-slate-100 p-5">
                  {/* Stars */}
                  <div className="flex gap-0.5 mb-3">
                    {Array.from({ length: 5 }).map((_, i) => (
                      <Star key={i} className="w-4 h-4 fill-gold text-gold" />
                    ))}
                  </div>
                  <p className="text-sm text-slate-700 leading-relaxed italic">
                    &ldquo;{r.quote}&rdquo;
                  </p>
                  <div className="mt-4 pt-3 border-t border-slate-200 flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full bg-navy text-white flex items-center justify-center font-bold text-xs shrink-0 overflow-hidden">
                      {r.photoUrl ? (
                        <img
                          src={r.photoUrl}
                          alt={r.name}
                          className="w-full h-full object-cover"
                          loading="lazy"
                        />
                      ) : (
                        initialsOf(r.name)
                      )}
                    </div>
                    <div>
                      <p className="font-bold text-xs text-navy">{r.name}</p>
                      <p className="text-[10px] text-brand-red font-semibold">{r.result}</p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* FAQ */}
          <div className="mb-12">
            <div className="text-center mb-8">
              <p className="text-xs uppercase tracking-widest text-brand-red font-bold">
                {t("faqs")}
              </p>
              <h2 className="font-display text-2xl md:text-3xl font-black text-navy leading-tight mt-2">
                {t("faqHeading")}
              </h2>
              <p className="mt-2 text-sm text-slate-500">{t("faqSubtext")}</p>
            </div>

            <div className="max-w-3xl mx-auto space-y-3">
              {FAQS.map((faq, i) => (
                <div
                  key={i}
                  className="bg-slate-50 rounded-xl border border-slate-100 overflow-hidden"
                >
                  <button
                    onClick={() => setOpenFaq(openFaq === i ? null : i)}
                    className="w-full flex items-center gap-3 p-4 text-left hover:bg-slate-100 transition"
                  >
                    <span className="w-8 h-8 rounded-full bg-brand-red text-white flex items-center justify-center font-bold text-xs shrink-0">
                      {i + 1}
                    </span>
                    <span className="flex-1 font-bold text-sm text-navy">{t(faq.qKey)}</span>
                    {openFaq === i ? (
                      <ChevronUp className="w-5 h-5 text-slate-400 shrink-0" />
                    ) : (
                      <ChevronDown className="w-5 h-5 text-slate-400 shrink-0" />
                    )}
                  </button>
                  {openFaq === i && (
                    <div className="px-4 pb-4 pl-15 text-sm text-slate-600 leading-relaxed">
                      {t(faq.aKey)}
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>

          {/* Contact / Map */}
          <div>
            <div className="text-center mb-8">
              <p className="text-xs uppercase tracking-widest text-brand-red font-bold">
                {t("Contact")}
              </p>
              <h2 className="font-display text-2xl md:text-3xl font-black text-navy leading-tight mt-2">
                {t("visitUs")}
              </h2>
              <p className="mt-2 text-sm text-slate-500">{t("contactSubtext")}</p>
            </div>

            <div className="grid md:grid-cols-2 gap-6">
              {/* Contact Info */}
              <div className="space-y-4">
                <div className="flex items-start gap-3 p-4 bg-slate-50 rounded-xl">
                  <MapPin className="w-5 h-5 text-brand-red shrink-0 mt-0.5" />
                  <div>
                    <p className="font-bold text-sm text-navy">{t("addressLabel")}</p>
                    <p className="text-xs text-slate-500">{site.location}</p>
                  </div>
                </div>
                <div className="flex items-start gap-3 p-4 bg-slate-50 rounded-xl">
                  <Phone className="w-5 h-5 text-brand-red shrink-0 mt-0.5" />
                  <div>
                    <p className="font-bold text-sm text-navy">{t("phoneNumbers")}</p>
                    <p className="text-xs text-slate-500">
                      {site.phones.filter(Boolean).slice(0, 2).join(" | ")}
                    </p>
                  </div>
                </div>
                <div className="flex items-start gap-3 p-4 bg-slate-50 rounded-xl">
                  <MessageCircle className="w-5 h-5 text-green-500 shrink-0 mt-0.5" />
                  <div>
                    <p className="font-bold text-sm text-navy">{t("whatsappContact")}</p>
                    <a
                      href={whatsappHref(site.whatsapp)}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-1 bg-green-600 hover:bg-green-700 text-white px-3 py-1.5 rounded-lg text-xs font-bold transition mt-1"
                    >
                      {t("whatsappNowBtn")} <ArrowRight className="w-3 h-3" />
                    </a>
                  </div>
                </div>
                <div className="flex items-start gap-3 p-4 bg-slate-50 rounded-xl">
                  <Clock className="w-5 h-5 text-brand-red shrink-0 mt-0.5" />
                  <div>
                    <p className="font-bold text-sm text-navy">{t("timing")}</p>
                    <p className="text-xs text-slate-500">{t("timingHours")}</p>
                  </div>
                </div>
              </div>

              {/* Live location map */}
              <div className="bg-slate-100 rounded-xl overflow-hidden border border-border flex flex-col min-h-[300px]">
                <iframe
                  title="Star Coaching Institute location — Zeromile, Janakpurdham"
                  src={MAP_EMBED}
                  width="100%"
                  height="300"
                  className="w-full flex-1 min-h-[300px]"
                  style={{ border: 0 }}
                  allowFullScreen
                  loading="lazy"
                  referrerPolicy="no-referrer-when-downgrade"
                />
                <a
                  href={MAP_LINK}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="shrink-0 flex items-center justify-center gap-1.5 bg-brand-red hover:bg-red-600 text-white py-2.5 text-xs font-bold transition"
                >
                  {t("viewLargerMap")} <ArrowRight className="w-3 h-3" />
                </a>
              </div>
            </div>
          </div>
        </div>
      </section>

      <SiteFooter />

      {/* Admin-published popup ad (once per session; nothing when none active) */}
      <AdPopup />

      {/* Floating Bottom CTA (Mobile) */}
      <div className="fixed bottom-0 inset-x-0 z-50 md:hidden bg-white border-t border-slate-200 px-4 py-2 flex gap-2">
        <a
          href={`tel:${site.phones[0]}`}
          className="flex-1 flex items-center justify-center gap-1.5 bg-navy text-white py-2.5 rounded-lg font-bold text-xs"
        >
          <Phone className="w-3.5 h-3.5" />
          {t("callNow")}
        </a>
        <a
          href={whatsappHref(site.whatsapp)}
          target="_blank"
          rel="noopener noreferrer"
          className="flex-1 flex items-center justify-center gap-1.5 bg-green-600 text-white py-2.5 rounded-lg font-bold text-xs"
        >
          <MessageCircle className="w-3.5 h-3.5" />
          WHATSAPP
        </a>
        <Link
          to="/admission"
          className="flex-1 flex items-center justify-center gap-1.5 bg-brand-red text-white py-2.5 rounded-lg font-bold text-xs"
        >
          <FileText className="w-3.5 h-3.5" />
          {t("Apply Now")}
        </Link>
      </div>
    </div>
  );
}
