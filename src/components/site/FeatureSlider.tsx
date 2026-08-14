import { useState, useCallback, useEffect, useRef } from "react";
import { useQuery } from "@tanstack/react-query";
import { Link } from "react-router-dom";
import { ChevronLeft, ChevronRight, ArrowRight, Pause, Play } from "lucide-react";
import { collection, query, where, orderBy, getDocs } from "firebase/firestore";
import { db } from "@/integrations/firebase/config";

type Slide = {
  id: string;
  title: string | null;
  subtitle: string | null;
  ctaText: string | null;
  ctaLink: string | null;
  imageUrl: string;
};

export function FeatureSlider() {
  const { data: slides = [] } = useQuery({
    queryKey: ["hero-banners"],
    queryFn: async () => {
      const q = query(collection(db, "banners"), where("isActive", "==", true), orderBy("sortOrder"), orderBy("createdAt"));
      const snap = await getDocs(q);
      return snap.docs.map((d) => ({ id: d.id, ...d.data() })) as Slide[];
    },
  });

  const [idx, setIdx] = useState(0);
  const [paused, setPaused] = useState(false);
  const touchStart = useRef(0);
  const touchEnd = useRef(0);
  const count = slides.length;

  const go = useCallback((n: number) => {
    setIdx(((n % count) + count) % count);
  }, [count]);

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
      diff > 0 ? go(idx + 1) : go(idx - 1);
    }
  };

  if (count === 0) return null;

  return (
    <section className="relative bg-navy overflow-hidden">
      <div
        className="relative w-full aspect-[16/7] md:aspect-[16/6] max-h-[600px]"
        onTouchStart={handleTouchStart}
        onTouchMove={handleTouchMove}
        onTouchEnd={handleTouchEnd}
        onMouseEnter={() => setPaused(true)}
        onMouseLeave={() => setPaused(false)}
      >
        {slides.map((s, i) => {
          const isInternal = s.ctaLink && s.ctaLink.startsWith("/");
          return (
            <div
              key={s.id}
              className={`absolute inset-0 transition-all duration-700 ease-out ${
                i === idx ? "opacity-100 scale-100" : "opacity-0 scale-105 pointer-events-none"
              }`}
              aria-hidden={i !== idx}
            >
              <img
                src={s.imageUrl}
                alt={s.title ?? "Feature slide"}
                className="w-full h-full object-cover"
                loading={i === 0 ? "eager" : "lazy"}
              />
              {(s.title || s.subtitle || s.ctaText) && (
                <div className="absolute inset-0 bg-gradient-to-t from-navy/85 via-navy/40 to-transparent flex items-end">
                  <div className="max-w-6xl mx-auto w-full px-4 pb-8 md:pb-16 text-navy-foreground">
                    {s.title && (
                      <h2 className="font-display font-black text-2xl md:text-5xl leading-tight max-w-2xl drop-shadow-lg">
                        {s.title}
                      </h2>
                    )}
                    {s.subtitle && (
                      <p className="mt-2 md:mt-3 text-sm md:text-lg text-white/90 max-w-xl">
                        {s.subtitle}
                      </p>
                    )}
                    {s.ctaText && s.ctaLink && (
                      <div className="mt-4 md:mt-6">
                        {isInternal ? (
                          <Link
                            to={s.ctaLink}
                            className="inline-flex items-center gap-1.5 bg-brand-red hover:bg-brand-red/90 text-white font-bold px-6 py-3 rounded-xl shadow-lg transition-all hover:scale-105 active:scale-95"
                          >
                            {s.ctaText} <ArrowRight className="w-4 h-4" />
                          </Link>
                        ) : (
                          <a
                            href={s.ctaLink}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="inline-flex items-center gap-1.5 bg-brand-red hover:bg-brand-red/90 text-white font-bold px-6 py-3 rounded-xl shadow-lg transition-all hover:scale-105 active:scale-95"
                          >
                            {s.ctaText} <ArrowRight className="w-4 h-4" />
                          </a>
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
              aria-label="Previous slide"
              className="absolute left-2 md:left-6 top-1/2 -translate-y-1/2 bg-white/90 hover:bg-white text-navy rounded-full p-2.5 shadow-lg backdrop-blur-sm transition-all hover:scale-110"
            >
              <ChevronLeft className="w-5 h-5" />
            </button>
            <button
              type="button"
              onClick={() => go(idx + 1)}
              aria-label="Next slide"
              className="absolute right-2 md:right-6 top-1/2 -translate-y-1/2 bg-white/90 hover:bg-white text-navy rounded-full p-2.5 shadow-lg backdrop-blur-sm transition-all hover:scale-110"
            >
              <ChevronRight className="w-5 h-5" />
            </button>

            <div className="absolute bottom-4 md:bottom-6 left-0 right-0 flex items-center justify-center gap-2.5">
              <button
                onClick={() => setPaused((p) => !p)}
                aria-label={paused ? "Resume slideshow" : "Pause slideshow"}
                className="bg-white/80 hover:bg-white text-navy rounded-full p-1.5 shadow transition"
              >
                {paused ? <Play className="w-3 h-3" /> : <Pause className="w-3 h-3" />}
              </button>
              {slides.map((_, i) => (
                <button
                  key={i}
                  onClick={() => go(i)}
                  aria-label={`Go to slide ${i + 1}`}
                  className={`h-2.5 rounded-full transition-all duration-300 ${
                    i === idx ? "w-8 bg-gold shadow-md" : "w-2.5 bg-white/50 hover:bg-white/80"
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
