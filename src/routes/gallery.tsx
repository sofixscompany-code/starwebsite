import { useState } from "react";
import { Camera } from "lucide-react";
import { SiteHeader } from "@/components/site/SiteHeader";
import { SiteFooter } from "@/components/site/SiteFooter";
import { useGallery } from "@/hooks/use-gallery";

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

export function GalleryPage() {
  const items = useGallery();
  const [failed, setFailed] = useState<Set<string>>(new Set());

  const renderTile = (item: (typeof items)[number], i: number) => {
    const showImage = item.url && !failed.has(item.id);
    const gradient = GRADIENTS[i % GRADIENTS.length];
    return (
      <div
        key={item.id}
        className={`aspect-square rounded-xl bg-gradient-to-br ${gradient} relative overflow-hidden group`}
      >
        {showImage ? (
          <img
            src={item.url}
            alt={item.title}
            loading="lazy"
            onError={() => setFailed((prev) => new Set(prev).add(item.id))}
            className="absolute inset-0 w-full h-full object-cover group-hover:scale-105 transition duration-500"
          />
        ) : (
          <div className="absolute inset-0 flex flex-col items-center justify-center text-white p-4">
            <Camera className="w-8 h-8 opacity-40 mb-2" />
            <p className="text-xs md:text-sm font-bold text-center opacity-80">{item.title}</p>
          </div>
        )}
        <div className="absolute inset-x-0 bottom-0 bg-black/50 backdrop-blur-sm px-3 py-2">
          <p className="text-[11px] md:text-xs font-bold text-white truncate">{item.title}</p>
          {item.category ? (
            <p className="text-[10px] uppercase tracking-wider text-white/70">{item.category}</p>
          ) : null}
        </div>
      </div>
    );
  };

  return (
    <div className="min-h-screen flex flex-col">
      <SiteHeader />
      <main className="flex-1">
        <section className="bg-navy text-navy-foreground py-14">
          <div className="max-w-6xl mx-auto px-4 text-center">
            <p className="text-xs uppercase tracking-widest text-gold font-bold">Life at Star</p>
            <h1 className="font-display font-black text-3xl md:text-5xl mt-2">Photo Gallery</h1>
            <p className="mt-4 text-white/70 max-w-2xl mx-auto">
              Snapshots from our classrooms, physical training, mock tests and celebrations.
            </p>
          </div>
        </section>

        <section className="py-14">
          <div className="max-w-6xl mx-auto px-4 grid grid-cols-2 md:grid-cols-3 gap-3">
            {items.map((item, i) => renderTile(item, i))}
          </div>
        </section>
      </main>
      <SiteFooter />
    </div>
  );
}
