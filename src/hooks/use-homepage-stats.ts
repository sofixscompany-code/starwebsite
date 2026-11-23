import { useEffect, useState } from "react";
import { collection, getDocs, query, limit } from "@/integrations/aws/firestore";
import { db } from "@/integrations/aws/config";

export interface HomepageStat {
  id: string;
  value: string;
  label: string;
  order?: number;
}

const FALLBACK_STATS: HomepageStat[] = [
  { id: "fb-1", value: "5,000+", label: "Students Trained" },
  { id: "fb-2", value: "800+", label: "Top Selections" },
  { id: "fb-4", value: "10+", label: "Years of Trust" },
];

export function useHomepageStats() {
  const [stats, setStats] = useState<HomepageStat[]>(FALLBACK_STATS);

  useEffect(() => {
    let cancelled = false;
    const q = query(collection(db, "homepage_stats"), limit(10));
    getDocs(q)
      .then((snap) => {
        if (cancelled || snap.empty) return;
        const rows = snap.docs.map((d) => ({
          id: d.id,
          value: (d.data().value as string) ?? "",
          label: (d.data().label as string) ?? "",
          order: (d.data().order as number) ?? 9999,
        }));
        rows.sort((a, b) => (a.order ?? 9999) - (b.order ?? 9999));
        setStats(rows);
      })
      .catch(() => {});
    return () => {
      cancelled = true;
    };
  }, []);

  return stats;
}
