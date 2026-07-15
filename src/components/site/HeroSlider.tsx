import { useEffect, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Link } from "@tanstack/react-router";
import { ChevronLeft, ChevronRight, ArrowRight } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";

type Banner = {
  id: string;
  title: string | null;
  subtitle: string | null;
  cta_text: string | null;
  cta_link: string | null;
  image_url: string;
};

export function HeroSlider() {
  const { data: banners = [] } = useQuery({
    queryKey: ["hero-banners"],
    queryFn: async () => {
      const { data } = await supabase
        .from("banners")
        .select("id, title, subtitle, cta_text, cta_link, image_url")
        .eq("is_active", true)
        .order("sort_order")
        .order("created_at");
      return (data ?? []) as Banner[];
    },
  });

  const [idx, setIdx] = useState(0);
  const count = banners.length;

  useEffect(() => {
    if (count < 2) return;
    const t = setInterval(() => setIdx((i) => (i + 1) % count), 5000);
    return () => clearInterval(t);
  }, [count]);

  useEffect(() => {
    if (idx >= count && count > 0) setIdx(0);
  }, [count, idx]);

  if (count === 0) return null;

  const go = (n: number) => setIdx(((n % count) + count) % count);

  return (
    <section className="relative bg-navy overflow-hidden">
      <div className="relative w-full aspect-[16/7] md:aspect-[16/6] max-h-[560px]">
        {banners.map((b, i) => {
          const isCta = b.cta_link && b.cta_link.startsWith("/");
          return (
            <div
              key={b.id}
              className={`absolute inset-0 transition-opacity duration-700 ease-out ${
                i === idx ? "opacity-100" : "opacity-0 pointer-events-none"
              }`}
              aria-hidden={i !== idx}
            >
              <img
                src={b.image_url}
                alt={b.title ?? "Star Coaching banner"}
                className="w-full h-full object-cover"
                loading={i === 0 ? "eager" : "lazy"}
              />
              {(b.title || b.subtitle || b.cta_text) && (
                <div className="absolute inset-0 bg-gradient-to-t from-navy/80 via-navy/30 to-transparent flex items-end">
                  <div className="max-w-6xl mx-auto w-full px-4 pb-8 md:pb-14 text-navy-foreground">
                    {b.title && (
                      <h2 className="font-display font-black text-2xl md:text-5xl leading-tight max-w-2xl drop-shadow">
                        {b.title}
                      </h2>
                    )}
                    {b.subtitle && (
                      <p className="mt-2 md:mt-3 text-sm md:text-lg text-white/90 max-w-xl">
                        {b.subtitle}
                      </p>
                    )}
                    {b.cta_text && b.cta_link && (
                      <div className="mt-4">
                        {isCta ? (
                          <Button
                            asChild
                            size="lg"
                            className="bg-brand-red hover:bg-brand-red/90 text-brand-red-foreground font-bold"
                          >
                            <Link to={b.cta_link}>
                              {b.cta_text} <ArrowRight className="w-4 h-4 ml-1" />
                            </Link>
                          </Button>
                        ) : (
                          <Button
                            asChild
                            size="lg"
                            className="bg-brand-red hover:bg-brand-red/90 text-brand-red-foreground font-bold"
                          >
                            <a href={b.cta_link} target="_blank" rel="noopener noreferrer">
                              {b.cta_text} <ArrowRight className="w-4 h-4 ml-1" />
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
              className="absolute left-2 md:left-4 top-1/2 -translate-y-1/2 bg-white/80 hover:bg-white text-navy rounded-full p-2 shadow"
            >
              <ChevronLeft className="w-5 h-5" />
            </button>
            <button
              type="button"
              onClick={() => go(idx + 1)}
              aria-label="Next banner"
              className="absolute right-2 md:right-4 top-1/2 -translate-y-1/2 bg-white/80 hover:bg-white text-navy rounded-full p-2 shadow"
            >
              <ChevronRight className="w-5 h-5" />
            </button>
            <div className="absolute bottom-3 left-0 right-0 flex justify-center gap-2">
              {banners.map((_, i) => (
                <button
                  key={i}
                  onClick={() => go(i)}
                  aria-label={`Go to slide ${i + 1}`}
                  className={`h-2 rounded-full transition-all ${
                    i === idx ? "w-6 bg-gold" : "w-2 bg-white/60 hover:bg-white"
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
