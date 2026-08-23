import { useQuery } from "@tanstack/react-query";
import { collection, getDocs } from "firebase/firestore";
import { db } from "@/integrations/firebase/config";
import { toppers as fallbackToppers } from "@/lib/site-config";

export interface Selection {
  id: string;
  name: string;
  post: string;
  tag: string;
  order?: number;
}

/**
 * Live "Top Selections" from the Firestore `selections` collection.
 * Composite-index-free (client-side sort by `order`). Falls back to the
 * static list from site-config when the collection is empty or unreachable.
 */
export function useSelections(max?: number) {
  const query = useQuery({
    queryKey: ["selections", max ?? "all"],
    queryFn: async () => {
      const snap = await getDocs(collection(db, "selections"));
      const rows = snap.docs.map((d) => ({
        id: d.id,
        ...(d.data() as Omit<Selection, "id">),
      })) as Selection[];
      rows.sort((a, b) => (a.order ?? 9999) - (b.order ?? 9999));
      return max ? rows.slice(0, max) : rows;
    },
    staleTime: 5 * 60 * 1000,
    retry: 1,
  });

  const rows: Selection[] =
    query.data && query.data.length > 0
      ? query.data
      : fallbackToppers.map((t, i) => ({ id: `fallback-${i}`, ...t, order: i }));

  return { ...query, rows };
}
