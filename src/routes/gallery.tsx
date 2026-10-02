import { useCallback, useMemo, useState } from "react";
import { Stars, Camera, Layers } from "lucide-react";
import { SiteHeader } from "@/components/site/SiteHeader";
import { SiteFooter } from "@/components/site/SiteFooter";
import { PhotoLightbox } from "@/components/site/PhotoLightbox";
import { useGallery, type GalleryItem } from "@/hooks/use-gallery";
import { useLanguage } from "@/hooks/use-language";

const GRADIENTS = [
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

/** Human label from an image URL filename (fallback when a photo has no title). */
function imageLabel(url: string) {
  return (url.split("/").pop() ?? "")
    .replace(/\.[a-z0-9]+$/i, "")
    .replace(/[()]/g, "")
    .trim();
}

export function GalleryPage() {
  const [failed, setFailed] = useState<Set<string>>(new Set());
  const [lightbox, setLightbox] = useState<number | null>(null);
  const [category, setCategory] = useState("All");
  const { t } = useLanguage();

  // Firestore-backed gallery — admin uploads only (managed at /admin/gallery).
  const fireItems = useGallery();

  const allItems = useMemo<GalleryItem[]>(
    () => fireItems.filter((i) => i.url && i.url.trim()),
    [fireItems],
  );

  const categories = useMemo(() => {
    const set = new Set<string>();
    allItems.forEach((i) => i.category && set.add(i.category));
    return ["All", ...Array.from(set)];
  }, [allItems]);

  const tiles = useMemo(
    () => (category === "All" ? allItems : allItems.filter((i) => i.category === category)),
    [allItems, category],
  );

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
    <div className="min-h-screen flex flex-col">
      <SiteHeader />
      <main className="flex-1">
        <section className="bg-navy text-navy-foreground py-14">
          <div className="max-w-6xl mx-auto px-4 text-center">
            <p className="text-xs uppercase tracking-widest text-gold font-bold">
              {t("lifeAtStar")}
            </p>
            <h1 className="font-display font-black text-3xl md:text-5xl mt-2">
              {t("galleryHeroTitle")}
            </h1>
            <p className="mt-4 text-white/70 max-w-2xl mx-auto">{t("galleryHeroSub")}</p>
          </div>
        </section>

        <section className="py-14">
          <div className="max-w-6xl mx-auto px-4">
            {allItems.length === 0 ? (
              <p className="text-center text-sm text-muted-foreground">{t("galleryEmpty")}</p>
            ) : (
              <>
                {/* Category filter */}
                <div className="flex flex-wrap items-center justify-center gap-2 mb-8">
                  {categories.map((cat) => (
                    <button
                      key={cat}
                      type="button"
                      onClick={() => setCategory(cat)}
                      className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-bold border transition ${
                        category === cat
                          ? "bg-navy text-navy-foreground border-navy"
                          : "bg-white text-navy border-border hover:border-navy/40"
                      }`}
                    >
                      <Layers className="w-3 h-3" />
                      {cat === "All" ? t("allPhotos") : cat}
                    </button>
                  ))}
                </div>

                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3 md:gap-4">
                  {tiles.map((item, i) => {
                    const url = item.url;
                    const broken = failed.has(url);
                    const gradient = GRADIENTS[i % GRADIENTS.length];
                    return (
                      <button
                        key={item.id}
                        type="button"
                        onClick={() => setLightbox(i)}
                        aria-label={`View ${item.title || imageLabel(url)}`}
                        className="group relative block w-full aspect-[4/3] rounded-xl overflow-hidden border border-border bg-white text-left shadow-sm hover:shadow-lg hover:-translate-y-0.5 transition-all duration-300 focus:outline-none focus-visible:ring-2 focus-visible:ring-brand-red"
                      >
                        {broken ? (
                          <span
                            className={`absolute inset-0 flex flex-col items-center justify-center gap-1 bg-gradient-to-br ${gradient} text-white`}
                          >
                            <Stars className="w-6 h-6 opacity-50" />
                            <span className="px-3 text-center text-[11px] font-bold text-white/80">
                              {t("starCoachingMoment")}
                            </span>
                          </span>
                        ) : (
                          <>
                            <img
                              src={url}
                              alt={item.title || `Star Coaching photo ${imageLabel(url)}`}
                              loading={i < 4 ? "eager" : "lazy"}
                              decoding="async"
                              onError={() => markFailed(url)}
                              className="absolute inset-0 w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                            />
                            <span className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity flex items-end">
                              <span className="w-full p-3">
                                <span className="block text-xs font-bold text-white drop-shadow">
                                  {item.title || "Star Coaching"}
                                </span>
                                {item.category ? (
                                  <span className="block text-[10px] text-white/70 mt-0.5">
                                    {item.category}
                                  </span>
                                ) : null}
                              </span>
                            </span>
                          </>
                        )}
                      </button>
                    );
                  })}
                </div>
                <p className="mt-6 text-center text-xs text-muted-foreground flex items-center justify-center gap-1.5">
                  <Camera className="w-3.5 h-3.5" />
                  {t("galleryPhotoCount").replace("{count}", String(tiles.length))}
                </p>
              </>
            )}
          </div>
        </section>
      </main>
      <SiteFooter />

      {lightbox !== null && tiles[lightbox] ? (
        <PhotoLightbox
          urls={tiles.map((i) => i.url)}
          index={lightbox}
          onIndexChange={setLightbox}
          onClose={close}
          labelFor={(u) => tiles.find((i) => i.url === u)?.title || imageLabel(u)}
        />
      ) : null}
    </div>
  );
}
