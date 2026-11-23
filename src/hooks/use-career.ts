import { useEffect, useState } from "react";
import { collection, onSnapshot } from "@/integrations/aws/firestore";
import { db } from "@/integrations/aws/config";

/** One service (Nepal Police / Nepali Army / APF / Forest Guard) — doc id or slug. */
export interface CareerService {
  id: string;
  slug: string;
  name: string;
  tagline?: string;
  intro?: string;
  applyUrl?: string;
  officialUrl?: string;
  order?: number;
}

/** One content block inside a service page (posts, eligibility, written, …). */
export interface CareerSection {
  id: string;
  /** service slug — e.g. "nepal-police" */
  service: string;
  /** section key — see CAREER_SECTION_ORDER */
  section: string;
  /** optional post grouping, e.g. "Inspector" (post-wise exam data) */
  post?: string;
  title: string;
  body?: string;
  order?: number;
}

/** Render order of sections on a career detail page. */
export const CAREER_SECTION_ORDER: string[] = [
  "posts",
  "eligibility",
  "selection",
  "written",
  "physical",
  "exam-pattern",
  "syllabus",
  "previous-questions",
  "preparation",
  "faqs",
  "notices",
];

/** Sections whose blocks may carry a `post` field → rendered as post-wise tabs. */
export const POST_AWARE_SECTIONS = new Set(["eligibility", "written", "exam-pattern", "syllabus"]);

/**
 * Live career content from Firestore:
 *  - `career`          → service-level docs (name, intro, apply/official URLs)
 *  - `career_sections` → content blocks grouped by service + section (+ post)
 *
 * No hardcoded fallback — the admin CMS (`/admin/career`) is the source of
 * truth, so the page shows a loading/empty state until data exists.
 */
export function useCareerData(slug?: string) {
  const [services, setServices] = useState<CareerService[]>([]);
  const [sections, setSections] = useState<CareerSection[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let mounted = true;

    const unServices = onSnapshot(
      collection(db, "career"),
      (snap) => {
        const rows = snap.docs.map((d) => ({ id: d.id, ...d.data() })) as CareerService[];
        if (!mounted) return;
        setServices(
          rows
            .map((r) => ({ ...r, slug: r.slug || r.id, order: Number(r.order ?? 999) }))
            .sort((a, b) => a.order - b.order),
        );
        setLoading(false);
      },
      () => mounted && setLoading(false),
    );

    const unSections = onSnapshot(
      collection(db, "career_sections"),
      (snap) => {
        const rows = snap.docs.map((d) => ({ id: d.id, ...d.data() })) as CareerSection[];
        if (!mounted) return;
        setSections(
          rows
            .map((r) => ({ ...r, order: Number(r.order ?? 999) }))
            .sort((a, b) => a.order - b.order),
        );
        setLoading(false);
      },
      () => mounted && setLoading(false),
    );

    return () => {
      mounted = false;
      unServices();
      unSections();
    };
  }, []);

  const service = slug ? services.find((s) => s.slug === slug) : undefined;
  const serviceSections = slug ? sections.filter((s) => s.service === slug) : [];

  return { services, service, sections: serviceSections, loading };
}
