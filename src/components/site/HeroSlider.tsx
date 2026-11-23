import { useEffect, useState, useCallback, useRef } from "react";
import { useQuery } from "@tanstack/react-query";
import { Link } from "react-router-dom";
import { ChevronLeft, ChevronRight, ArrowRight } from "lucide-react";
import { collection, getDocs } from "@/integrations/aws/firestore";
import { db } from "@/integrations/aws/config";
import { Button } from "@/components/ui/button";

type Banner = {
  id: string;
  title: string | null;
  subtitle: string | null;
  ctaText: string | null;
  ctaLink: string | null;
  imageUrl: string;
};

type BannerDoc = Banner & { isActive?: boolean; sortOrder?: number; createdAt?: string };

// Shown while the admin hasn't uploaded any banners yet (same artwork the
// dashboards use), so the hero is never blank.
const FALLBACK_BANNERS: Banner[] = [
  {
    id: "fallback-banner",
    title: null,
    subtitle: null,
    ctaText: null,
    ctaLink: null,
    imageUrl: "/BANNER/BANNER%201.png",
  },
];

// Composite-index-free: fetch all banners, filter/sort client-side so the
// live query never requires a manual Firestore composite index.
async function loadBanners(): Promise<Banner[]> {
  const snap = await getDocs(collection(db, "banners"));
  const docs = snap.docs.map((d) => ({ id: d.id, ...d.data() })) as BannerDoc[];
  return docs
    .filter((b) => b.isActive !== false && !!b.imageUrl)
    .sort(
      (a, b) =>
        (a.sortOrder ?? 0) - (b.sortOrder ?? 0) ||
        String(a.createdAt ?? "").localeCompare(String(b.createdAt ?? "")),
    );
}

export function HeroSlider({ compact = false }: { compact?: boolean }) {
  const { data: banners = [] } = useQuery({
    queryKey: ["hero-banners"],
    queryFn: loadBanners,
  });

  const slides = banners.length ? banners : FALLBACK_BANNERS;
  const [idx, setIdx] = useState(0);
  const [paused, setPaused] = useState(false);
  const touchStart = useRef(0);
  const touchEnd = useRef(0);
  const count = slides.length;

  const go = useCallback(
    (n: number) => {
      setIdx(((n % count) + count) % count);
    },
    [count],
  );

  useEffect(() => {
    if (count < 2 || paused) return;
    const t = setInterval(() => setIdx((i) => (i + 1) % count), 5000);
    return () => clearInterval(t);
  }, [count, paused]);

  useEffect(() => {
    if (idx >= count && count > 0) setIdx(0);
  }, [count, idx]);

  const handleTouchStart = (e: React.TouchEvent) => {
    touchStart.current = e.touches[0].clientX;
  };
  const handleTouchMove = (e: React.TouchEvent) => {
    touchEnd.current = e.touches[0].clientX;
  };
  const handleTouchEnd = () => {
    const diff = touchStart.current - touchEnd.current;
    if (Math.abs(diff) > 50) {
      if (diff > 0) {
        go(idx + 1);
      } else {
        go(idx - 1);
      }
    }
  };

  return (
    <section className="relative bg-navy overflow-hidden">
      <div
        className={
          compact
            ? "relative w-full aspect-[16/6] md:aspect-[16/4] max-h-[240px]"
            : "relative w-full aspect-[16/7] md:aspect-[16/6] max-h-[600px]"
        }
        onTouchStart={handleTouchStart}
        onTouchMove={handleTouchMove}
        onTouchEnd={handleTouchEnd}
        onMouseEnter={() => setPaused(true)}
        onMouseLeave={() => setPaused(false)}
      >
        {slides.map((b, i) => {
          const isCta = b.ctaLink && b.ctaLink.startsWith("/");
          return (
            <div
              key={b.id}
              className={`absolute inset-0 transition-all duration-700 ease-out ${
                i === idx ? "opacity-100 scale-100" : "opacity-0 scale-105 pointer-events-none"
              }`}
              aria-hidden={i !== idx}
            >
              <img
                src={b.imageUrl}
                alt={b.title ?? "Star Coaching banner"}
                className="w-full h-full object-cover"
                loading={i === 0 ? "eager" : "lazy"}
              />
              {(b.title || b.subtitle || b.ctaText) && (
                <div className="absolute inset-0 bg-gradient-to-t from-navy/85 via-navy/40 to-transparent flex items-end">
                  <div className="max-w-6xl mx-auto w-full px-4 pb-8 md:pb-16 text-navy-foreground">
                    {b.title && (
                      <h2 className="font-display font-black text-2xl md:text-5xl leading-tight max-w-2xl drop-shadow-lg">
                        {b.title}
                      </h2>
                    )}
                    {b.subtitle && (
                      <p className="mt-2 md:mt-3 text-sm md:text-lg text-white/90 max-w-xl">
                        {b.subtitle}
                      </p>
                    )}
                    {b.ctaText && b.ctaLink && (
                      <div className="mt-4 md:mt-6">
                        {isCta ? (
                          <Button
                            asChild
                            size="lg"
                            className="bg-brand-red hover:bg-brand-red/90 text-brand-red-foreground font-bold shadow-lg"
                          >
                            <Link to={b.ctaLink}>
                              {b.ctaText} <ArrowRight className="w-4 h-4 ml-1" />
                            </Link>
                          </Button>
                        ) : (
                          <Button
                            asChild
                            size="lg"
                            className="bg-brand-red hover:bg-brand-red/90 text-brand-red-foreground font-bold shadow-lg"
                          >
                            <a href={b.ctaLink} target="_blank" rel="noopener noreferrer">
                              {b.ctaText} <ArrowRight className="w-4 h-4 ml-1" />
                            </a>
                          </Button>
                        )}
                      </div>
                    )}
                  </div>
                </div>
              )}
            </div>
          );
        })}

        {count > 1 && (
          <>
            <button
              type="button"
              onClick={() => go(idx - 1)}
              aria-label="Previous banner"
              className="absolute left-2 md:left-6 top-1/2 -translate-y-1/2 bg-white/90 hover:bg-white text-navy rounded-full p-2.5 shadow-lg backdrop-blur-sm transition-all hover:scale-110"
            >
              <ChevronLeft className="w-5 h-5" />
            </button>
            <button
              type="button"
              onClick={() => go(idx + 1)}
              aria-label="Next banner"
              className="absolute right-2 md:right-6 top-1/2 -translate-y-1/2 bg-white/90 hover:bg-white text-navy rounded-full p-2.5 shadow-lg backdrop-blur-sm transition-all hover:scale-110"
            >
              <ChevronRight className="w-5 h-5" />
            </button>

            <div className="absolute bottom-4 md:bottom-6 left-0 right-0 flex items-center justify-center gap-2.5">
              {slides.map((_, i) => (
                <button
                  key={i}
                  onClick={() => go(i)}
                  aria-label={`Go to slide ${i + 1}`}
                  className={`h-2.5 rounded-full transition-all duration-300 ${
                    i === idx ? "w-8 bg-brand-red shadow-md" : "w-2.5 bg-white/50 hover:bg-white/80"
                  }`}
                />
              ))}
            </div>
          </>
        )}
      </div>
    </section>
  );
}
