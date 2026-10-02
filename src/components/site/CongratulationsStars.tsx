import { useCallback, useState } from "react";
import { Link } from "react-router-dom";
import { Stars } from "lucide-react";
import { Button } from "@/components/ui/button";
import { PhotoLightbox } from "@/components/site/PhotoLightbox";
import { GALLERY_MANIFEST } from "@/data/gallery-manifest";

const INITIAL_VISIBLE = 8;

const PLACEHOLDER_GRADIENTS = [
  "from-navy to-brand-red",
  "from-brand-red to-amber-500",
  "from-navy to-indigo-600",
  "from-emerald-600 to-navy",
  "from-gold to-brand-red",
  "from-navy to-slate-700",
  "from-purple-600 to-brand-red",
  "from-indigo-600 to-navy",
  "from-brand-red to-navy",
];

function imageLabel(url: string) {
  return (url.split("/").pop() ?? "")
    .replace(/\.[a-z0-9]+$/i, "")
    .replace(/[()]/g, "")
    .trim();
}

export function CongratulationsStars({
  files = GALLERY_MANIFEST,
  initialVisible = INITIAL_VISIBLE,
}: {
  files?: string[];
  initialVisible?: number;
}) {
  const [failed, setFailed] = useState<Set<string>>(new Set());
  const [showAll, setShowAll] = useState(false);
  const [lightbox, setLightbox] = useState<number | null>(null);

  const visible =
    showAll || files.length <= initialVisible ? files : files.slice(0, initialVisible);

  const close = useCallback(() => setLightbox(null), []);

  const markFailed = useCallback((url: string) => {
    setFailed((prev) => {
      if (prev.has(url)) return prev;
      const nextSet = new Set(prev);
      nextSet.add(url);
      return nextSet;
    });
  }, []);

  return (
    <section className="py-14 bg-secondary/40">
      <div className="max-w-6xl mx-auto px-4">
        <div className="text-center max-w-2xl mx-auto mb-8">
          <p className="text-xs uppercase tracking-widest text-brand-red font-bold inline-flex items-center gap-1.5">
            <Stars className="w-3.5 h-3.5" /> Congratulations Stars
          </p>
          <h2 className="mt-2 font-display font-black text-2xl md:text-4xl text-navy leading-tight">
            Top Selections of Star Coaching
          </h2>
          <p className="mt-3 text-sm md:text-base text-muted-foreground">
            Real students, real posts. A snapshot of our recent selections across Nepal.
          </p>
        </div>

        {files.length === 0 ? (
          <p className="text-center text-sm text-muted-foreground">
            Selection photos are being added. Check back soon.
          </p>
        ) : (
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3 md:gap-4">
            {visible.map((url, i) => {
              const broken = failed.has(url);
              const gradient = PLACEHOLDER_GRADIENTS[i % PLACEHOLDER_GRADIENTS.length];
              return (
                <button
                  key={url}
                  type="button"
                  onClick={() => setLightbox(i)}
                  aria-label={`View ${imageLabel(url)}`}
                  className="group relative block w-full aspect-[4/3] rounded-2xl overflow-hidden border border-border bg-white text-left shadow-sm hover:shadow-lg hover:-translate-y-0.5 transition-all duration-300 focus:outline-none focus-visible:ring-2 focus-visible:ring-brand-red"
                >
                  {broken ? (
                    <span
                      className={`absolute inset-0 flex flex-col items-center justify-center gap-1 bg-gradient-to-br ${gradient} text-white`}
                    >
                      <Stars className="w-6 h-6 opacity-50" />
                      <span className="px-3 text-center text-[11px] font-bold text-white/80">
                        Selection snapshot
                      </span>
                    </span>
                  ) : (
                    <>
                      <img
                        src={url}
                        alt={`Selection of ${imageLabel(url)}`}
                        loading={i < 4 ? "eager" : "lazy"}
                        decoding="async"
                        onError={() => markFailed(url)}
                        className="absolute inset-0 w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                      />
                      <span className="absolute inset-0 bg-gradient-to-t from-black/45 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
                      <span className="absolute inset-x-0 bottom-0 flex items-center gap-1.5 px-3 py-2 translate-y-full group-hover:translate-y-0 transition-transform duration-300">
                        <Stars className="w-3.5 h-3.5 text-gold shrink-0" />
                        <span className="text-[10px] font-bold uppercase tracking-wider text-white truncate">
                          Congratulation Star
                        </span>
                      </span>
                    </>
                  )}
                </button>
              );
            })}
          </div>
        )}

        <div className="mt-8 flex flex-col sm:flex-row items-center justify-center gap-3">
          {files.length > initialVisible && (
            <Button
              size="lg"
              className="bg-brand-red hover:bg-brand-red/90 text-brand-red-foreground font-bold"
              onClick={() => setShowAll((v) => !v)}
            >
              {showAll ? "Show less" : `View All Selections (${files.length})`}
            </Button>
          )}
          <Button asChild size="lg" variant="outline" className="border-navy text-navy font-bold">
            <Link to="/results">See all results</Link>
          </Button>
        </div>
      </div>

      {lightbox !== null && files[lightbox] ? (
        <PhotoLightbox
          urls={files}
          index={lightbox}
          onIndexChange={setLightbox}
          onClose={close}
          labelFor={imageLabel}
        />
      ) : null}
    </section>
  );
}
