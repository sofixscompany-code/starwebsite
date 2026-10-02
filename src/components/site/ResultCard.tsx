import { Award } from "lucide-react";
import type { Selection } from "@/hooks/use-selections";

function initialsOf(name: string) {
  const parts = name.trim().split(/\s+/).filter(Boolean);
  const init = parts
    .map((p) => p[0])
    .slice(0, 2)
    .join("")
    .toUpperCase();
  return init || "ST";
}

export function ResultCard({ r }: { r: Selection }) {
  const name = r.studentName || r.name || "Student";
  const achievement = r.achievement || r.post || "Selected";
  const tag = r.tag ?? "";
  const isTopper = tag.toLowerCase().includes("topper");
  // Admin-uploaded photo (admin/selections) — otherwise an honest initials avatar.
  const image = r.photoUrl || "";

  return (
    <div className="group bg-white rounded-xl border border-border overflow-hidden text-center hover:border-brand-red/40 hover:shadow-md transition">
      <div className="aspect-square bg-gradient-to-br from-navy/90 to-navy/70 flex items-center justify-center text-navy-foreground font-display font-black text-3xl relative overflow-hidden">
        {image ? (
          <img src={image} alt={name} loading="lazy" className="w-full h-full object-cover" />
        ) : (
          <div className="w-full h-full flex items-center justify-center tracking-wide">
            {initialsOf(name)}
          </div>
        )}
        {isTopper ? (
          <span className="absolute top-2 right-2 bg-gold text-navy text-[9px] font-black uppercase px-1.5 py-0.5 rounded flex items-center gap-1 shadow">
            <Award className="w-2.5 h-2.5" /> Topper
          </span>
        ) : r.featured ? (
          <span className="absolute top-2 right-2 bg-brand-red text-white text-[9px] font-black uppercase px-1.5 py-0.5 rounded shadow">
            Featured
          </span>
        ) : null}
      </div>
      <div className="p-3">
        <p className="font-display font-bold text-sm text-foreground leading-tight">{name}</p>
        <p className="text-[11px] text-brand-red font-semibold uppercase tracking-wider mt-1">
          {achievement}
        </p>
        {tag && <p className="text-[10px] text-muted-foreground mt-1">{tag}</p>}
      </div>
    </div>
  );
}

export function ResultCardSkeleton() {
  return (
    <div className="bg-white rounded-xl border border-border overflow-hidden animate-pulse">
      <div className="aspect-square bg-secondary/70" />
      <div className="p-3 space-y-2">
        <div className="h-3.5 w-3/4 mx-auto rounded bg-secondary" />
        <div className="h-3 w-1/2 mx-auto rounded bg-secondary" />
      </div>
    </div>
  );
}
