import { useEffect, useState } from "react";
import { collection, getDocs, query, limit } from "firebase/firestore";
import { db } from "@/integrations/firebase/config";

export interface GalleryItem {
  id: string;
  url: string;
  title: string;
  category: string;
  order?: number;
  active?: boolean;
}

export function useGallery() {
  // Admin uploads only (/admin/gallery) — no bundled/placeholder photos.
  const [items, setItems] = useState<GalleryItem[]>([]);

  useEffect(() => {
    let cancelled = false;
    getDocs(query(collection(db, "gallery"), limit(100)))
      .then((snap) => {
        if (cancelled || snap.empty) return;
        const rows = snap.docs
          .filter((d) => {
            const data = d.data();
            return data.active !== false && data.status !== "Inactive";
          })
          .map((d) => {
            const data = d.data();
            return {
              id: d.id,
              url: (data.url as string) ?? "",
              title: (data.title as string) ?? "",
              category: (data.category as string) ?? "",
              order: (data.order as number) ?? 9999,
              active: data.active as boolean | undefined,
            };
          })
          .sort((a, b) => (a.order ?? 9999) - (b.order ?? 9999));
        setItems(rows);
      })
      .catch(() => {});
    return () => {
      cancelled = true;
    };
  }, []);

  return items;
}
