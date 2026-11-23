import { useEffect, useState } from "react";
import { collection, onSnapshot } from "@/integrations/aws/firestore";
import { db } from "@/integrations/aws/config";
import { toppers as fallbackToppers } from "@/lib/site-config";

export interface Selection {
  id: string;
  studentName?: string;
  achievement?: string;
  tag?: string;
  photoUrl?: string;
  examCategory?: string;
  rank?: string;
  batch?: string;
  year?: string;
  description?: string;
  order?: number;
  status?: string;
  featured?: boolean;
  /** legacy alias fields kept for documents created before the results schema */
  name?: string;
  post?: string;
}

const FALLBACK_ROWS: Selection[] = fallbackToppers.map((t, i) => ({
  id: `fallback-${i}`,
  name: t.name,
  post: t.post,
  tag: t.tag,
  order: i,
  featured: t.tag.includes("Topper"),
}));

/**
 * Live "Top Selections / Results" from the Firestore `selections` collection.
 * - Real-time via onSnapshot.
 * - Only `status == "published"` records are shown (documents without a status
 *   field are treated as published for backward compatibility).
 * - Featured results come first, then ascending display order.
 * - Falls back to the static list from site-config while the collection is
 *   empty or unreachable, so the public site never breaks.
 */
export function useSelections(max?: number) {
  const [rows, setRows] = useState<Selection[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);
  const [hasData, setHasData] = useState(false);

  useEffect(() => {
    let mounted = true;
    const unsub = onSnapshot(
      collection(db, "selections"),
      (snap) => {
        const raw = snap.docs.map((d) => ({ id: d.id, ...d.data() })) as Selection[];
        const published = raw
          .filter((r) => !r.status || r.status === "published")
          .map((r) => ({ ...r, order: Number(r.order ?? 9999) }))
          .sort((a, b) => {
            const fa = a.featured ? 1 : 0;
            const fb = b.featured ? 1 : 0;
            if (fa !== fb) return fb - fa;
            return a.order - b.order;
          });
        if (!mounted) return;
        setHasData(published.length > 0);
        setRows(max ? published.slice(0, max) : published);
        setLoading(false);
        setError(null);
      },
      (err) => {
        if (!mounted) return;
        setLoading(false);
        setError(err instanceof Error ? err : new Error("Failed to load results"));
      },
    );
    return () => {
      mounted = false;
      unsub();
    };
  }, [max]);

  const fallbackSlice = max ? FALLBACK_ROWS.slice(0, max) : FALLBACK_ROWS;
  const effectiveRows = hasData ? rows : fallbackSlice;

  return { rows: effectiveRows, loading, error, hasData };
}
