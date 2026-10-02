import { useEffect, useState } from "react";
import { collection, onSnapshot, query, orderBy } from "firebase/firestore";
import { db } from "@/integrations/firebase/config";

export type Advertisement = {
  id: string;
  title: string;
  description?: string;
  image?: string;
  link?: string;
  buttonText?: string;
  position: string;
  priority: number;
  startDate?: string;
  endDate?: string;
  active: boolean;
  createdAt?: string;
};

const DEFAULT_ADS: Advertisement[] = [];

export function useAdvertisements(position?: string): Advertisement[] {
  const [ads, setAds] = useState<Advertisement[]>(DEFAULT_ADS);

  useEffect(() => {
    const q = query(collection(db, "advertisements"), orderBy("priority"));

    const unsub = onSnapshot(
      q,
      (snap) => {
        const now = new Date().toISOString();
        const docs = snap.docs.map((d) => ({ id: d.id, ...d.data() })) as Advertisement[];
        const filtered = docs.filter((d) => {
          if (d.active !== true) return false;
          if (position && d.position !== position) return false;
          if (d.startDate && d.startDate > now) return false;
          if (d.endDate && d.endDate < now) return false;
          return true;
        });
        setAds(filtered);
      },
      () => setAds(DEFAULT_ADS),
    );
    return unsub;
  }, [position]);

  return ads;
}
