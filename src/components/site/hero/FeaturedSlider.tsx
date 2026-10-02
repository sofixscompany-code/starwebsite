import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { Link } from "react-router-dom";
import { ArrowRight, ChevronLeft, ChevronRight, Pause, Play, Sparkles } from "lucide-react";
import { cn } from "@/lib/utils";
import { useHeroSlides } from "@/hooks/use-hero-slides";
import { featuredSlides } from "./slides";

const DEFAULT_DURATION = 5000;

const ALIGNMENT = {
  left: "text-left",
  center: "text-center",
  right: "text-right",
};

const JUSTIFY = {
  left: "justify-start",
  center: "justify-center",
  right: "justify-end",
};

export function FeaturedSlider() {
  const heroSlides = useHeroSlides();

  // Admin hero slides (managed at /admin/hero-slides); designed site slides as fallback.
  const slides = useMemo(() => (heroSlides.length ? heroSlides : featuredSlides), [heroSlides]);

  const [idx, setIdx] = useState(0);
  const [playing, setPlaying] = useState(true);
  const [progressKey, setProgressKey] = useState(0);
  const [portrait, setPortrait] = useState<Set<string>>(new Set());
  const touchX = useRef(0);

  const count = slides.length;
  const current = slides[idx];
  const duration = current?.duration || DEFAULT_DURATION;

  const markPortrait = useCallback((src: string) => {
    setPortrait((prev) => {
      if (prev.has(src)) return prev;
      const next = new Set(prev);
      next.add(src);
      return next;
    });
  }, []);

  const go = useCallback(
    (n: number) => {
      setIdx(((n % count) + count) % count);
      setProgressKey((k) => k + 1);
    },
    [count],
  );

  useEffect(() => {
    if (count < 2 || !playing) return;
    const t = setInterval(() => {
      setIdx((i) => (i + 1) % count);
      setProgressKey((k) => k + 1);
    }, duration);
    return () => clearInterval(t);
  }, [count, playing, duration, progressKey]);

  useEffect(() => {
    if (count > 0 && idx >= count) setIdx(0);
  }, [count, idx]);

  const handleKeyDown = useCallback(
    (e: React.KeyboardEvent) => {
      if (e.key === "ArrowLeft") {
        e.preventDefault();
        go(idx - 1);
      } else if (e.key === "ArrowRight") {
        e.preventDefault();
        go(idx + 1);
      }
    },
    [go, idx],
  );

  if (count === 0) return null;

  const primary = current;
  const secondaryCta =
    primary.ctaLink === "/courses"
      ? { text: "View Results", link: "/results" }
      : { text: "Explore Courses", link: "/courses" };
  const align = (current.alignment || "left") as keyof typeof ALIGNMENT;
  const overlayPct = Math.min(90, Math.max(20, current.overlay ?? 45)) / 100;

  return (
    <section className="relative w-full overflow-hidden bg-navy" aria-label="Featured highlights">
      <div
        role="group"
        aria-roledescription="carousel"
        aria-label="Star Coaching Institute highlights"
        tabIndex={0}
        className={cn(
          "relative w-full overflow-hidden focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-brand-red/60",
          "h-[300px] sm:h-[400px] md:h-[440px] lg:h-[520px]",
        )}
        onMouseEnter={() => setPlaying(false)}
        onMouseLeave={() => setPlaying(true)}
        onFocus={() => setPlaying(false)}
        onBlur={() => setPlaying(true)}
        onTouchStart={(e) => {
          touchX.current = e.touches[0].clientX;
        }}
        onTouchEnd={(e) => {
          const diff = touchX.current - e.changedTouches[0].clientX;
          if (Math.abs(diff) > 50) go(diff > 0 ? idx + 1 : idx - 1);
        }}
        onKeyDown={handleKeyDown}
      >
        {slides.map((s, i) => {
          const active = i === idx;
          const desktopSrc = s.desktopImage || s.image;
          const mobileSrc = s.mobileImage || s.image;
          return (
            <div
              key={s.id}
              aria-hidden={!active}
              className={cn(
                "absolute inset-0 overflow-hidden transition-opacity duration-700 ease-out",
                active ? "opacity-100" : "opacity-0 pointer-events-none",
              )}
            >
              {/* Desktop image */}
              {desktopSrc ? (
                <div
                  className={cn(
                    "absolute inset-0 hidden md:block",
                    portrait.has(desktopSrc) && "bg-navy",
                  )}
                >
                  {portrait.has(desktopSrc) ? (
                    <>
                      <img
                        src={desktopSrc}
                        alt=""
                        aria-hidden="true"
                        className="absolute inset-0 w-full h-full object-cover blur-2xl scale-110 opacity-50"
                        loading={i === 0 ? "eager" : "lazy"}
                        decoding="async"
                      />
                      <img
                        src={desktopSrc}
                        alt={s.title || "Star Coaching Institute photo"}
                        fetchPriority={i === 0 ? "high" : "low"}
                        className={cn(
                          "relative w-full h-full object-contain transition-transform duration-[1200ms] ease-out",
                          active && "scale-[1.02]",
                        )}
                        loading={i === 0 ? "eager" : "lazy"}
                        decoding="async"
                        onLoad={(e) => {
                          if (e.currentTarget.naturalHeight > e.currentTarget.naturalWidth) {
                            markPortrait(desktopSrc);
                          }
                        }}
                      />
                    </>
                  ) : (
                    <img
                      src={desktopSrc}
                      alt={s.title || "Star Coaching Institute photo"}
                      fetchPriority={i === 0 ? "high" : "low"}
                      className={cn(
                        "absolute inset-0 w-full h-full object-cover object-center transition-transform duration-[1200ms] ease-out",
                        active && "scale-[1.04]",
                      )}
                      loading={i === 0 ? "eager" : "lazy"}
                      decoding="async"
                      onLoad={(e) => {
                        if (e.currentTarget.naturalHeight > e.currentTarget.naturalWidth) {
                          markPortrait(desktopSrc);
                        }
                      }}
                    />
                  )}
                </div>
              ) : (
                <div
                  className={cn("absolute inset-0 hidden md:block bg-gradient-to-br", s.accent)}
                />
              )}

              {/* Mobile image */}
              {mobileSrc ? (
                <div
                  className={cn("absolute inset-0 md:hidden", portrait.has(mobileSrc) && "bg-navy")}
                >
                  {portrait.has(mobileSrc) ? (
                    <>
                      <img
                        src={mobileSrc}
                        alt=""
                        aria-hidden="true"
                        className="absolute inset-0 w-full h-full object-cover blur-2xl scale-110 opacity-50"
                        loading={i === 0 ? "eager" : "lazy"}
                        decoding="async"
                      />
                      <img
                        src={mobileSrc}
                        alt={s.title || "Star Coaching Institute photo"}
                        className="relative w-full h-full object-contain transition-transform duration-[1200ms] ease-out"
                        loading={i === 0 ? "eager" : "lazy"}
                        decoding="async"
                        onLoad={(e) => {
                          if (e.currentTarget.naturalHeight > e.currentTarget.naturalWidth) {
                            markPortrait(mobileSrc);
                          }
                        }}
                      />
                    </>
                  ) : (
                    <img
                      src={mobileSrc}
                      alt={s.title || "Star Coaching Institute photo"}
                      className={cn(
                        "absolute inset-0 w-full h-full object-cover object-center transition-transform duration-[1200ms] ease-out",
                        active && "scale-[1.04]",
                      )}
                      loading={i === 0 ? "eager" : "lazy"}
                      decoding="async"
                      onLoad={(e) => {
                        if (e.currentTarget.naturalHeight > e.currentTarget.naturalWidth) {
                          markPortrait(mobileSrc);
                        }
                      }}
                    />
                  )}
                </div>
              ) : (
                <div className={cn("absolute inset-0 md:hidden bg-gradient-to-br", s.accent)} />
              )}

              {/* Professional gradient overlay */}
              <div
                className="absolute inset-0 transition-opacity duration-700"
                style={{
                  background: `linear-gradient(90deg, rgba(5,20,60,${0.8 * overlayPct}) 0%, rgba(5,20,60,${0.45 * overlayPct}) 45%, rgba(5,20,60,${0.15 * overlayPct}) 72%, rgba(5,20,60,${0.05 * overlayPct}) 100%)`,
                }}
              />
              <div
                className="absolute inset-x-0 bottom-0 h-32"
                style={{
                  background:
                    "linear-gradient(to top, rgba(5,20,60,0.55) 0%, rgba(5,20,60,0) 100%)",
                }}
              />

              {/* Content */}
              {active && (
                <div className="absolute inset-0 flex items-center">
                  <div
                    key={s.id}
                    className={cn(
                      "w-full max-w-6xl mx-auto px-4 sm:px-6 md:px-10 text-white",
                      ALIGNMENT[align],
                    )}
                  >
                    {s.kicker ? (
                      <p
                        className={cn(
                          "inline-flex items-center gap-1.5 rounded-full border border-white/20 bg-white/10 backdrop-blur-md px-3.5 py-1.5",
                          "text-[10px] md:text-xs font-black uppercase tracking-[0.18em]",
                          "animate-[heroUp_0.5s_ease-out_both]",
                        )}
                      >
                        <Sparkles className="w-3 h-3 text-gold" />
                        <span className="text-gold">{s.kicker}</span>
                      </p>
                    ) : null}

                    <h2
                      className={cn(
                        "mt-3 md:mt-4 font-display font-black leading-[1.08] drop-shadow-lg",
                        "text-2xl sm:text-4xl md:text-5xl lg:text-[3.4rem]",
                        "animate-[heroUp_0.55s_0.08s_ease-out_both]",
                      )}
                    >
                      {s.title}
                    </h2>

                    {(s.subtitle || s.description) && (
                      <p
                        className={cn(
                          "mt-2 md:mt-4 text-white/90 max-w-xl text-sm md:text-lg leading-relaxed",
                          "animate-[heroUp_0.55s_0.16s_ease-out_both]",
                        )}
                      >
                        {s.subtitle || s.description}
                      </p>
                    )}

                    <div
                      className={cn(
                        "mt-4 md:mt-7 flex flex-wrap gap-2.5 md:gap-3 animate-[heroUp_0.55s_0.24s_ease-out_both]",
                        JUSTIFY[align],
                      )}
                    >
                      {s.ctaText && s.ctaLink && (
                        <Link
                          to={s.ctaLink}
                          className={cn(
                            "inline-flex items-center gap-1.5 font-bold",
                            "bg-brand-red hover:bg-brand-red/90 text-white",
                            "px-5 py-2.5 md:px-7 md:py-3 text-sm md:text-base rounded-xl shadow-lg shadow-brand-red/25",
                            "transition-all duration-200 hover:scale-[1.03] active:scale-95",
                            "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white/80",
                          )}
                        >
                          {s.ctaText} <ArrowRight className="w-4 h-4" />
                        </Link>
                      )}
                      <Link
                        to={secondaryCta.link}
                        className={cn(
                          "inline-flex items-center gap-1.5 font-bold",
                          "border-2 border-white/80 text-white hover:bg-white/15",
                          "px-5 py-2.5 md:px-7 md:py-3 text-sm md:text-base rounded-xl backdrop-blur-sm",
                          "transition-all duration-200 hover:scale-[1.03] active:scale-95",
                          "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white/80",
                        )}
                      >
                        {secondaryCta.text}
                      </Link>
                    </div>
                  </div>
                </div>
              )}
            </div>
          );
        })}

        {count > 1 && (
          <>
            {/* Arrows */}
            <button
              type="button"
              onClick={() => go(idx - 1)}
              aria-label="Previous slide"
              title="Previous slide"
              className={cn(
                "absolute left-2 md:left-7 top-1/2 -translate-y-1/2",
                "w-9 h-9 md:w-12 md:h-12 rounded-full",
                "bg-white/90 hover:bg-white text-navy flex items-center justify-center",
                "shadow-lg shadow-black/20 backdrop-blur-sm",
                "transition-all duration-200 hover:scale-110 hover:shadow-xl",
                "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-red",
              )}
            >
              <ChevronLeft className="w-5 h-5 md:w-6 md:h-6" />
            </button>
            <button
              type="button"
              onClick={() => go(idx + 1)}
              aria-label="Next slide"
              title="Next slide"
              className={cn(
                "absolute right-2 md:right-7 top-1/2 -translate-y-1/2",
                "w-9 h-9 md:w-12 md:h-12 rounded-full",
                "bg-white/90 hover:bg-white text-navy flex items-center justify-center",
                "shadow-lg shadow-black/20 backdrop-blur-sm",
                "transition-all duration-200 hover:scale-110 hover:shadow-xl",
                "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-red",
              )}
            >
              <ChevronRight className="w-5 h-5 md:w-6 md:h-6" />
            </button>

            {/* Indicators + play/pause */}
            <div className="absolute bottom-3.5 md:bottom-5 left-0 right-0 flex items-center justify-center gap-2 md:gap-2.5">
              <button
                type="button"
                onClick={() => setPlaying((p) => !p)}
                aria-label={playing ? "Pause slideshow" : "Resume slideshow"}
                title={playing ? "Pause slideshow" : "Resume slideshow"}
                className={cn(
                  "w-6 h-6 md:w-7 md:h-7 rounded-full",
                  "bg-white/25 hover:bg-white/40 text-white flex items-center justify-center",
                  "backdrop-blur-sm transition-colors",
                  "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-red",
                )}
              >
                {playing ? <Pause className="w-3 h-3" /> : <Play className="w-3 h-3" />}
              </button>

              {slides.map((s, i) => {
                const active = i === idx;
                return (
                  <button
                    key={s.id}
                    type="button"
                    onClick={() => go(i)}
                    aria-label={`Go to slide ${i + 1}`}
                    aria-current={active ? "true" : undefined}
                    title={`Slide ${i + 1}`}
                    className={cn(
                      "relative overflow-hidden rounded-full transition-all duration-300",
                      "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-red",
                      active
                        ? "h-2.5 w-8 bg-brand-red"
                        : "h-2.5 w-2.5 bg-white/40 hover:bg-white/80",
                    )}
                  >
                    {active ? (
                      <div
                        key={progressKey}
                        className="absolute inset-y-0 left-0 bg-white/50 rounded-full"
                        style={{ animation: `shrinkWidth ${duration}ms linear forwards` }}
                      />
                    ) : null}
                  </button>
                );
              })}
            </div>
          </>
        )}
      </div>

      <style>{`
        @keyframes shrinkWidth {
          from { width: 100%; }
          to { width: 0%; }
        }
        @keyframes heroUp {
          from { opacity: 0; transform: translateY(16px); }
          to { opacity: 1; transform: translateY(0); }
        }
      `}</style>
    </section>
  );
}
