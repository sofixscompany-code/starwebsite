import { useEffect, useState } from "react";
import { collection, onSnapshot, query, orderBy } from "firebase/firestore";
import { db } from "@/integrations/firebase/config";

export type FeatureContentItem = {
  id: string;
  section: string;
  title: string;
  description?: string;
  image?: string;
  buttonText?: string;
  buttonLink?: string;
  active: boolean;
  order: number;
  updatedAt?: string;
};

export function useFeatureContent(section?: string): FeatureContentItem[] {
  const [items, setItems] = useState<FeatureContentItem[]>([]);

  useEffect(() => {
    const q = query(collection(db, "feature_content"), orderBy("order"));

    const unsub = onSnapshot(
      q,
      (snap) => {
        setItems(snap.docs.map((d) => ({ id: d.id, ...d.data() })) as FeatureContentItem[]);
      },
      () => setItems([]),
    );
    return unsub;
  }, []);

  const filtered = section
    ? items.filter((i) => i.active && i.section === section)
    : items.filter((i) => i.active);
  return filtered;
}
