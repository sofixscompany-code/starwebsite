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

const FALLBACK_GALLERY: GalleryItem[] = [
  { id: "g1", url: "", title: "Nepal Police physical training", category: "Training", order: 1 },
  { id: "g2", url: "", title: "Classroom in session", category: "Campus", order: 2 },
  { id: "g3", url: "", title: "Loksewa mock test day", category: "Exams", order: 3 },
  { id: "g4", url: "", title: "Staff Nurse practical", category: "Training", order: 4 },
  { id: "g5", url: "", title: "Result celebration", category: "Events", order: 5 },
  { id: "g6", url: "", title: "Faculty session", category: "Campus", order: 6 },
  { id: "g7", url: "", title: "Hostel - Boys & Girls", category: "Campus", order: 7 },
  { id: "g8", url: "", title: "Computer lab", category: "Campus", order: 8 },
  { id: "g9", url: "", title: "SEE Preparation batch", category: "Training", order: 9 },
];

export function useGallery() {
  const [items, setItems] = useState<GalleryItem[]>(FALLBACK_GALLERY);

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
