import { useEffect, useRef } from "react";
import { ChevronLeft, ChevronRight, X } from "lucide-react";

function defaultLabel(url: string) {
  return (url.split("/").pop() ?? "")
    .replace(/\.[a-z0-9]+$/i, "")
    .replace(/[()]/g, "")
    .trim();
}

export function PhotoLightbox({
  urls,
  index,
  onIndexChange,
  onClose,
  labelFor,
}: {
  urls: string[];
  index: number;
  onIndexChange: (index: number) => void;
  onClose: () => void;
  labelFor?: (url: string) => string;
}) {
  const touchX = useRef<number | null>(null);
  const total = urls.length;
  const url = urls[index];
  const label = (labelFor ?? defaultLabel)(url);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
      if (e.key === "ArrowLeft") onIndexChange((index - 1 + total) % total);
      if (e.key === "ArrowRight") onIndexChange((index + 1) % total);
    };
    window.addEventListener("keydown", onKey);
    document.body.style.overflow = "hidden";
    return () => {
      window.removeEventListener("keydown", onKey);
      document.body.style.overflow = "";
    };
  }, [index, total, onClose, onIndexChange]);

  if (!url) return null;

  return (
    <div
      className="fixed inset-0 z-[100] bg-black/90 backdrop-blur-sm flex items-center justify-center"
      role="dialog"
      aria-modal="true"
      aria-label={label}
      onClick={onClose}
      onTouchStart={(e) => {
        touchX.current = e.touches[0]?.clientX ?? null;
      }}
      onTouchEnd={(e) => {
        if (touchX.current === null) return;
        const dx = (e.changedTouches[0]?.clientX ?? 0) - touchX.current;
        touchX.current = null;
        if (Math.abs(dx) > 40) {
          if (dx < 0) onIndexChange((index + 1) % total);
          else onIndexChange((index - 1 + total) % total);
        }
      }}
    >
      <button
        type="button"
        aria-label="Close"
        onClick={onClose}
        className="absolute top-4 right-4 w-10 h-10 rounded-full bg-white/10 hover:bg-white/25 text-white flex items-center justify-center transition-colors"
      >
        <X className="w-5 h-5" />
      </button>

      <button
        type="button"
        aria-label="Previous image"
        onClick={(e) => {
          e.stopPropagation();
          onIndexChange((index - 1 + total) % total);
        }}
        className="absolute left-2 md:left-4 w-10 h-10 rounded-full bg-white/10 hover:bg-white/25 text-white flex items-center justify-center transition-colors z-10"
      >
        <ChevronLeft className="w-5 h-5" />
      </button>

      <img
        src={url}
        alt={label}
        onClick={(e) => e.stopPropagation()}
        className="max-w-[92vw] max-h-[82vh] rounded-xl shadow-2xl object-contain bg-black/40"
      />

      <button
        type="button"
        aria-label="Next image"
        onClick={(e) => {
          e.stopPropagation();
          onIndexChange((index + 1) % total);
        }}
        className="absolute right-2 md:right-4 w-10 h-10 rounded-full bg-white/10 hover:bg-white/25 text-white flex items-center justify-center transition-colors z-10"
      >
        <ChevronRight className="w-5 h-5" />
      </button>

      <div className="absolute bottom-4 inset-x-0 flex flex-col items-center gap-1 pointer-events-none">
        <p className="text-xs font-bold text-white/90">
          {index + 1} / {total}
        </p>
        <p className="text-[10px] uppercase tracking-widest text-white/60">{label}</p>
      </div>
    </div>
  );
}
