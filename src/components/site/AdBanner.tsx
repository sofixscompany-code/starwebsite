import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { X } from "lucide-react";
import { useAdvertisements, type Advertisement } from "@/hooks/use-advertisements";
import { cn } from "@/lib/utils";

export function AdBannerBelowHero() {
  const ads = useAdvertisements("below_hero");
  if (ads.length === 0) return null;
  const ad = ads[0];
  return (
    <section className="px-3 md:px-6 pb-4">
      <AdCard ad={ad} />
    </section>
  );
}

export function AdPopup() {
  const ads = useAdvertisements("popup");
  const [dismissed, setDismissed] = useState(false);
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    if (ads.length === 0 || dismissed) return;
    const key = `ad_popup_dismissed_${ads[0].id}`;
    if (sessionStorage.getItem(key)) return;
    const t = setTimeout(() => setVisible(true), 1200);
    return () => clearTimeout(t);
  }, [ads, dismissed]);

  if (!visible || ads.length === 0) return null;
  const ad = ads[0];
  const key = `ad_popup_dismissed_${ad.id}`;

  const dismiss = () => {
    setDismissed(true);
    setVisible(false);
    sessionStorage.setItem(key, "1");
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm p-4"
      onClick={dismiss}
    >
      <div
        className="relative bg-white dark:bg-slate-900 rounded-2xl shadow-2xl max-w-lg w-full overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        <button
          onClick={dismiss}
          className="absolute top-3 right-3 z-10 bg-black/40 hover:bg-black/60 text-white rounded-full p-1.5 transition-colors"
          aria-label="Close popup"
        >
          <X className="w-4 h-4" />
        </button>
        {ad.image && (
          <img src={ad.image} alt={ad.title} className="w-full h-48 sm:h-64 object-cover" />
        )}
        <div className="p-5">
          <h3 className="font-bold text-lg text-[hsl(var(--ap-ink))]">{ad.title}</h3>
          {ad.description && (
            <p className="text-sm text-[hsl(var(--ap-muted))] mt-1">{ad.description}</p>
          )}
          {ad.link && (
            <div className="mt-4">
              {ad.link.startsWith("/") ? (
                <Link
                  to={ad.link}
                  onClick={dismiss}
                  className="inline-flex items-center gap-1 bg-brand-red hover:bg-brand-red/90 text-white font-bold px-5 py-2.5 rounded-xl transition-all"
                >
                  {ad.buttonText || "Learn More"}
                </Link>
              ) : (
                <a
                  href={ad.link}
                  target="_blank"
                  rel="noopener noreferrer"
                  onClick={dismiss}
                  className="inline-flex items-center gap-1 bg-brand-red hover:bg-brand-red/90 text-white font-bold px-5 py-2.5 rounded-xl transition-all"
                >
                  {ad.buttonText || "Learn More"}
                </a>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

function AdCard({ ad }: { ad: Advertisement }) {
  if (!ad.image) return null;

  const inner = (
    <div className="relative">
      <img
        src={ad.image}
        alt={ad.title}
        className="w-full h-24 sm:h-32 object-cover group-hover:scale-[1.02] transition-transform"
      />
      <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/60 to-transparent px-4 pb-3 pt-6">
        <p className="text-white font-bold text-sm drop-shadow-md">{ad.title}</p>
        {ad.description && <p className="text-white/80 text-xs line-clamp-1">{ad.description}</p>}
      </div>
    </div>
  );

  const cls = "block group rounded-2xl overflow-hidden shadow-md hover:shadow-xl transition-shadow";

  if (ad.link && ad.link.startsWith("/")) {
    return (
      <Link to={ad.link} className={cls}>
        {inner}
      </Link>
    );
  }
  return (
    <a href={ad.link || "#"} target="_blank" rel="noopener noreferrer" className={cls}>
      {inner}
    </a>
  );
}
