import { useEffect, useState } from "react";
import { collection, onSnapshot, orderBy, query } from "@/integrations/aws/firestore";
import { db } from "@/integrations/aws/config";
import { featuredSlides, type FeatureSlide } from "@/components/site/hero/slides";

type HeroSlideDoc = {
  id: string;
  kicker?: string | null;
  title?: string | null;
  subtitle?: string | null;
  description?: string | null;
  ctaText?: string | null;
  ctaLink?: string | null;
  buttonType?: string | null;
  imageUrl?: string | null;
  desktopImage?: string | null;
  mobileImage?: string | null;
  overlay?: number | null;
  alignment?: string | null;
  duration?: number | null;
  sortOrder?: number;
  isActive?: boolean;
  status?: string | null;
  createdAt?: unknown;
};

const DEFAULT_ACCENT = "from-blue-900 via-navy to-navy";

/** Normalize Firestore Timestamps / ISO strings / numbers to epoch ms. */
const toMs = (v: unknown): number => {
  if (!v) return 0;
  if (typeof v === "number") return v;
  if (typeof v === "string") return Date.parse(v) || 0;
  const t = v as { toMillis?: () => number; seconds?: number };
  if (typeof t.toMillis === "function") return t.toMillis();
  if (typeof t.seconds === "number") return t.seconds * 1000;
  return 0;
};

function docToSlide(d: HeroSlideDoc): FeatureSlide {
  return {
    id: d.id,
    kicker: d.kicker || undefined,
    title: d.title || "Star Coaching Institute",
    subtitle: d.subtitle || undefined,
    description: d.description || undefined,
    ctaText: d.ctaText || undefined,
    ctaLink: d.ctaLink || undefined,
    buttonType: (d.buttonType as FeatureSlide["buttonType"]) || "solid",
    image: d.imageUrl || d.desktopImage || undefined,
    desktopImage: d.desktopImage || d.imageUrl || undefined,
    mobileImage: d.mobileImage || undefined,
    overlay: d.overlay ?? 70,
    alignment: (d.alignment as FeatureSlide["alignment"]) || "left",
    duration: d.duration || 4500,
    accent: DEFAULT_ACCENT,
    status: (d.status as FeatureSlide["status"]) || "published",
  };
}

export function useHeroSlides(): FeatureSlide[] {
  const [slides, setSlides] = useState<FeatureSlide[]>(featuredSlides);

  useEffect(() => {
    // Single-field `orderBy("sortOrder")` is auto-indexed; a second
    // `orderBy("createdAt")` would require a composite index that may not be
    // deployed — createdAt ordering is applied client-side instead.
    const q = query(collection(db, "hero_slides"), orderBy("sortOrder"));
    const unsub = onSnapshot(
      q,
      (snap) => {
        const docs = snap.docs.map((d) => ({ id: d.id, ...d.data() })) as HeroSlideDoc[];
        docs.sort((a, b) => {
          const byOrder = (a.sortOrder ?? 0) - (b.sortOrder ?? 0);
          if (byOrder !== 0) return byOrder;
          return toMs(a.createdAt) - toMs(b.createdAt);
        });
        const active = docs.filter((d) => d.isActive !== false && d.status !== "draft");
        setSlides(active.length ? active.map(docToSlide) : featuredSlides);
      },
      () => {
        setSlides(featuredSlides);
      },
    );
    return unsub;
  }, []);

  return slides;
}
