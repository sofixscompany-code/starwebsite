import { useMemo, useState, type ReactNode } from "react";
import { Link, useParams } from "react-router-dom";
import {
  Activity,
  AlertTriangle,
  ArrowLeft,
  ArrowRight,
  BellRing,
  BookOpen,
  ChevronDown,
  ClipboardCheck,
  ExternalLink,
  Files,
  FileText,
  GraduationCap,
  HelpCircle,
  LayoutList,
  ListOrdered,
  Loader2,
  Users,
} from "lucide-react";
import { SiteHeader } from "@/components/site/SiteHeader";
import { SiteFooter } from "@/components/site/SiteFooter";
import { useLanguage } from "@/hooks/use-language";
import {
  CAREER_SECTION_ORDER,
  POST_AWARE_SECTIONS,
  useCareerData,
  type CareerSection,
} from "@/hooks/use-career";

const URL_RE = /https?:\/\/[^\s]+/;

const SECTION_META: Record<string, { labelKey: string; icon: typeof Users }> = {
  posts: { labelKey: "secPosts", icon: Users },
  eligibility: { labelKey: "secEligibility", icon: ClipboardCheck },
  selection: { labelKey: "secSelection", icon: ListOrdered },
  written: { labelKey: "secWritten", icon: FileText },
  physical: { labelKey: "secPhysical", icon: Activity },
  "exam-pattern": { labelKey: "secPattern", icon: LayoutList },
  syllabus: { labelKey: "secSyllabus", icon: BookOpen },
  "previous-questions": { labelKey: "secQuestions", icon: Files },
  preparation: { labelKey: "secPrep", icon: GraduationCap },
  faqs: { labelKey: "secFaq", icon: HelpCircle },
  notices: { labelKey: "secNotices", icon: BellRing },
};

/* ───────────────────────── body renderer ───────────────────────── */

function LinkRow({ line }: { line: string }) {
  const raw = line.match(URL_RE)?.[0] ?? "";
  const url = raw.replace(/[.,;:)\]]+$/, "");
  const title =
    line
      .replace(raw, "")
      .replace(/\s*[-–—:|·]\s*$/, "")
      .replace(/^\s*[-–—:|·]\s*/, "")
      .trim() || url;
  return (
    <a
      href={url}
      target="_blank"
      rel="noopener noreferrer"
      className="flex items-start gap-2.5 rounded-xl border border-red-100 bg-red-50/60 px-3.5 py-2.5 hover:border-brand-red/40 hover:bg-red-50 transition-colors"
    >
      <ExternalLink className="w-4 h-4 text-brand-red shrink-0 mt-0.5" />
      <span className="min-w-0">
        <span className="block text-sm font-bold text-navy leading-snug">{title}</span>
        <span className="block text-xs text-slate-500 break-all">
          {url.replace(/^https?:\/\//, "")}
        </span>
      </span>
    </a>
  );
}

/** Parses admin-authored plain text: bullets ("- "), label lines, headings, links. */
function renderBody(body?: string): ReactNode[] {
  if (!body?.trim()) return [];
  const out: ReactNode[] = [];
  let bullets: string[] = [];

  const flushBullets = (key: string) => {
    if (!bullets.length) return;
    out.push(
      <ul key={`ul-${key}`} className="list-disc pl-5 space-y-1 marker:text-brand-red">
        {bullets.map((b, i) => (
          <li key={i}>{b}</li>
        ))}
      </ul>,
    );
    bullets = [];
  };

  body.split("\n").forEach((raw, idx) => {
    const line = raw.trim();
    const key = String(idx);
    if (!line) {
      flushBullets(key);
      return;
    }
    if (URL_RE.test(line)) {
      flushBullets(key);
      out.push(<LinkRow key={`ln-${key}`} line={line} />);
      return;
    }
    if (line.startsWith("- ") || line.startsWith("• ")) {
      bullets.push(line.slice(2));
      return;
    }
    flushBullets(key);
    if (line.endsWith(":") && line.length < 110) {
      out.push(
        <p key={`h-${key}`} className="font-bold text-navy pt-1.5">
          {line}
        </p>,
      );
      return;
    }
    const label = line.match(/^([^:|]{1,60}):\s+(.+)$/);
    if (label && !URL_RE.test(label[2])) {
      out.push(
        <p key={`l-${key}`}>
          <span className="font-bold text-navy">{label[1]}:</span> {label[2]}
        </p>,
      );
      return;
    }
    out.push(<p key={`p-${key}`}>{line}</p>);
  });
  flushBullets("end");
  return out;
}

/* ───────────────────────── section pieces ───────────────────────── */

function BlockCard({
  block,
  index,
  numbered,
}: {
  block: CareerSection;
  index?: number;
  numbered?: boolean;
}) {
  const body = renderBody(block.body);

  if (block.section === "faqs") {
    return (
      <details className="group bg-white rounded-xl border border-border hover:border-brand-red/30 transition-colors">
        <summary className="flex items-start justify-between gap-3 cursor-pointer list-none px-5 py-4">
          <span className="flex items-start gap-3 font-bold text-navy text-sm sm:text-base">
            {numbered ? (
              <span className="w-6 h-6 shrink-0 rounded-full bg-brand-red text-white text-xs font-bold grid place-items-center mt-0.5">
                {index! + 1}
              </span>
            ) : (
              <HelpCircle className="w-5 h-5 text-brand-red shrink-0 mt-0.5" />
            )}
            {block.title}
          </span>
          <ChevronDown className="w-4 h-4 shrink-0 text-slate-400 mt-1 transition-transform group-open:rotate-180" />
        </summary>
        <div className="px-5 pb-5 pl-5 text-sm text-foreground/80 leading-relaxed space-y-1.5">
          {body}
        </div>
      </details>
    );
  }

  return (
    <div className="bg-white rounded-xl border border-border p-5 sm:p-6">
      <div className="flex items-start gap-3 mb-2">
        {numbered ? (
          <span className="w-7 h-7 shrink-0 rounded-full bg-brand-red text-white text-sm font-bold grid place-items-center">
            {index! + 1}
          </span>
        ) : null}
        <div className="min-w-0">
          <h4 className="font-bold text-navy text-sm sm:text-base leading-snug">
            {block.title}
            {block.post ? (
              <span className="ml-2 align-middle text-[10px] font-bold uppercase tracking-wide bg-navy/10 text-navy px-2 py-0.5 rounded-full">
                {block.post}
              </span>
            ) : null}
          </h4>
        </div>
      </div>
      <div className="text-sm text-foreground/80 leading-relaxed space-y-1.5">{body}</div>
    </div>
  );
}

/** Renders one section's blocks — with post-wise tabs where applicable. */
function SectionContent({ sectionKey, blocks }: { sectionKey: string; blocks: CareerSection[] }) {
  const postAware = POST_AWARE_SECTIONS.has(sectionKey);
  const postNames = useMemo(
    () => [...new Set(blocks.map((b) => b.post).filter((p): p is string => !!p))],
    [blocks],
  );
  const [activePost, setActivePost] = useState<string | undefined>(postNames[0]);

  const general = postAware ? blocks.filter((b) => !b.post) : blocks;
  const postBlocks = postAware && activePost ? blocks.filter((b) => b.post === activePost) : [];

  if (sectionKey === "selection") {
    return (
      <div className="grid gap-4 md:grid-cols-2">
        {blocks.map((b, i) => (
          <BlockCard key={b.id} block={b} index={i} numbered />
        ))}
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {general.length ? (
        <div className={sectionKey === "posts" ? "grid gap-4 md:grid-cols-2" : "space-y-4"}>
          {general.map((b, i) => (
            <BlockCard key={b.id} block={b} index={i} />
          ))}
        </div>
      ) : null}

      {postNames.length ? (
        <>
          <div className="flex flex-wrap gap-2 pt-1">
            {postNames.map((p) => (
              <button
                key={p}
                type="button"
                onClick={() => setActivePost(p)}
                className={`px-4 py-2 rounded-full text-xs sm:text-sm font-bold transition cursor-pointer ${
                  activePost === p
                    ? "bg-navy text-white shadow-md"
                    : "bg-white border border-border text-foreground/70 hover:border-brand-red/40 hover:text-brand-red"
                }`}
              >
                {p}
              </button>
            ))}
          </div>
          <div className="space-y-4">
            {postBlocks.map((b) => (
              <BlockCard key={b.id} block={b} />
            ))}
          </div>
        </>
      ) : null}
    </div>
  );
}

/* ───────────────────────── page ───────────────────────── */

export function CareerDetailPage() {
  const { slug } = useParams<{ slug: string }>();
  const { t } = useLanguage();
  const { services, service, sections, loading } = useCareerData(slug);

  const grouped = useMemo(() => {
    const map = new Map<string, CareerSection[]>();
    for (const s of sections) {
      const arr = map.get(s.section) ?? [];
      arr.push(s);
      map.set(s.section, arr);
    }
    return CAREER_SECTION_ORDER.filter((k) => (map.get(k)?.length ?? 0) > 0).map((key) => ({
      key,
      blocks: map.get(key)!,
    }));
  }, [sections]);

  const otherServices = services.filter((s) => s.slug !== service?.slug);

  return (
    <div className="min-h-screen flex flex-col">
      <SiteHeader />
      <main className="flex-1">
        {loading ? (
          <section className="bg-navy py-20">
            <div className="max-w-6xl mx-auto px-4 flex items-center justify-center gap-3 text-white/80">
              <Loader2 className="w-5 h-5 animate-spin" />
              {t("careerLoading")}
            </div>
          </section>
        ) : !service ? (
          <section className="bg-navy py-20">
            <div className="max-w-3xl mx-auto px-4 text-center text-white">
              <AlertTriangle className="w-10 h-10 text-gold mx-auto mb-4" />
              <h1 className="font-display font-black text-3xl">{t("careerNotFound")}</h1>
              <div className="mt-6 flex flex-wrap justify-center gap-3">
                {services.map((s) => (
                  <Link
                    key={s.id}
                    to={`/career/${s.slug}`}
                    className="px-4 py-2 rounded-full bg-white/10 hover:bg-white/20 text-sm font-bold transition"
                  >
                    {s.name}
                  </Link>
                ))}
                <Link
                  to="/"
                  className="px-4 py-2 rounded-full bg-brand-red hover:bg-brand-red/90 text-sm font-bold transition"
                >
                  {t("backToHome") || "Home"}
                </Link>
              </div>
            </div>
          </section>
        ) : (
          <>
            {/* ── Hero ── */}
            <section className="bg-navy text-white py-14">
              <div className="max-w-6xl mx-auto px-4">
                <Link
                  to="/"
                  className="inline-flex items-center gap-1.5 text-xs font-bold text-white/60 hover:text-white transition mb-5"
                >
                  <ArrowLeft className="w-3.5 h-3.5" /> {t("backToHome") || "Home"}
                </Link>
                <p className="text-xs uppercase tracking-widest text-gold font-bold">
                  {t("careerGuidesEyebrow") || "Career Guide"}
                </p>
                <h1 className="font-display font-black text-3xl md:text-5xl mt-2">
                  {service.name}
                </h1>
                {service.tagline ? (
                  <p className="mt-3 text-white/70 max-w-3xl">{service.tagline}</p>
                ) : null}

                <div className="mt-6 flex flex-wrap gap-3">
                  {service.applyUrl ? (
                    <a
                      href={service.applyUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-2 bg-brand-red hover:bg-brand-red/90 text-white font-bold px-6 py-3 rounded-xl text-sm transition"
                    >
                      {t("applyNow")} <ExternalLink className="w-4 h-4" />
                    </a>
                  ) : null}
                  {service.officialUrl && service.officialUrl !== service.applyUrl ? (
                    <a
                      href={service.officialUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-2 bg-white/10 hover:bg-white/20 border border-white/20 text-white font-bold px-6 py-3 rounded-xl text-sm transition"
                    >
                      {t("officialWebsite")} <ExternalLink className="w-4 h-4" />
                    </a>
                  ) : null}
                </div>

                {service.intro ? (
                  <p className="mt-6 text-sm sm:text-base text-white/75 leading-relaxed max-w-4xl whitespace-pre-line">
                    {service.intro}
                  </p>
                ) : null}

                <div className="mt-6 flex items-start gap-2.5 rounded-xl bg-gold/10 border border-gold/30 px-4 py-3 max-w-4xl">
                  <AlertTriangle className="w-4 h-4 text-gold shrink-0 mt-0.5" />
                  <p className="text-xs sm:text-sm text-white/85">{t("careerDisclaimer")}</p>
                </div>
              </div>
            </section>

            {/* ── Jump links ── */}
            {grouped.length ? (
              <div className="sticky top-0 z-30 bg-white border-b border-border shadow-sm">
                <div className="max-w-6xl mx-auto px-4 py-2.5 flex gap-2 overflow-x-auto">
                  <span className="hidden sm:flex items-center text-[10px] font-bold uppercase tracking-wider text-slate-400 pr-1 shrink-0">
                    {t("jumpTo")}
                  </span>
                  {grouped.map(({ key }) => (
                    <a
                      key={key}
                      href={`#sec-${key}`}
                      className="shrink-0 px-3 py-1.5 rounded-full text-xs font-bold text-foreground/70 bg-secondary/60 hover:bg-brand-red hover:text-white transition-colors"
                    >
                      {t(SECTION_META[key]?.labelKey ?? key)}
                    </a>
                  ))}
                </div>
              </div>
            ) : null}

            {/* ── Sections ── */}
            <section className="py-12">
              <div className="max-w-6xl mx-auto px-4 space-y-12">
                {grouped.length === 0 ? (
                  <div className="text-center py-16 bg-white rounded-2xl border border-border">
                    <BookOpen className="w-10 h-10 text-brand-red mx-auto mb-3" />
                    <p className="text-foreground/70">{t("careerSoon")}</p>
                  </div>
                ) : (
                  grouped.map(({ key, blocks }) => {
                    const Icon = SECTION_META[key]?.icon ?? BookOpen;
                    return (
                      <div key={key} id={`sec-${key}`} className="scroll-mt-20">
                        <div className="flex items-center gap-3 mb-5">
                          <span className="w-1.5 h-7 rounded-full bg-brand-red" />
                          <Icon className="w-5 h-5 text-brand-red" />
                          <h2 className="font-display font-black text-xl sm:text-2xl text-navy">
                            {t(SECTION_META[key]?.labelKey ?? key)}
                          </h2>
                        </div>
                        <SectionContent key={key} sectionKey={key} blocks={blocks} />
                      </div>
                    );
                  })
                )}
              </div>
            </section>

            {/* ── Other services ── */}
            {otherServices.length ? (
              <section className="py-12 bg-secondary/40">
                <div className="max-w-6xl mx-auto px-4">
                  <h2 className="font-display font-black text-xl sm:text-2xl text-navy mb-5">
                    {t("exploreOtherServices")}
                  </h2>
                  <div className="grid gap-4 sm:grid-cols-3">
                    {otherServices.map((s) => (
                      <Link
                        key={s.id}
                        to={`/career/${s.slug}`}
                        className="group bg-white rounded-xl border border-border p-5 hover:border-brand-red/40 hover:shadow-md transition-all"
                      >
                        <p className="font-bold text-navy group-hover:text-brand-red transition-colors">
                          {s.name}
                        </p>
                        {s.tagline ? (
                          <p className="text-xs text-foreground/60 mt-1 line-clamp-2">
                            {s.tagline}
                          </p>
                        ) : null}
                        <span className="mt-3 inline-flex items-center gap-1 text-xs font-bold text-brand-red">
                          {t("viewDetails")} <ArrowRight className="w-3 h-3" />
                        </span>
                      </Link>
                    ))}
                  </div>
                </div>
              </section>
            ) : null}

            {/* ── Star CTA ── */}
            <section className="py-14">
              <div className="max-w-6xl mx-auto px-4">
                <div className="bg-navy rounded-2xl p-7 sm:p-10 text-white text-center">
                  <h2 className="font-display font-black text-2xl sm:text-3xl">
                    {t("startPrepTitle")}
                  </h2>
                  <p className="mt-2 text-white/70 text-sm">{t("startPrepText")}</p>
                  <div className="mt-6 flex flex-wrap justify-center gap-3">
                    <Link
                      to="/admission"
                      className="inline-flex items-center gap-2 bg-brand-red hover:bg-brand-red/90 font-bold px-6 py-3 rounded-xl text-sm transition"
                    >
                      {t("Apply Now")} <ArrowRight className="w-4 h-4" />
                    </Link>
                    <Link
                      to="/courses"
                      className="inline-flex items-center gap-2 bg-white/10 hover:bg-white/20 border border-white/20 font-bold px-6 py-3 rounded-xl text-sm transition"
                    >
                      {t("viewCourses")} <ArrowRight className="w-4 h-4" />
                    </Link>
                  </div>
                </div>
              </div>
            </section>
          </>
        )}
      </main>
      <SiteFooter />
    </div>
  );
}
