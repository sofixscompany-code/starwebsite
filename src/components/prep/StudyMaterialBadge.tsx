import { Star } from "lucide-react";

/**
 * Badge marking content as STAR Coaching study material (never official /
 * government material). Show on every note + model set card/detail.
 */
export function StudyMaterialBadge() {
  return (
    <span className="inline-flex items-center gap-1.5 rounded-full border border-amber-300 bg-amber-100 px-3 py-1 text-[11px] font-bold tracking-wide text-amber-800">
      <Star className="h-3 w-3" aria-hidden="true" />
      STAR कोचिङ स्टडी मटेरियल
    </span>
  );
}
