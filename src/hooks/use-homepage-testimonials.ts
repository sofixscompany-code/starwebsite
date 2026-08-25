import { useEffect, useState } from "react";
import { collection, getDocs, query, limit } from "firebase/firestore";
import { db } from "@/integrations/firebase/config";

export interface HomepageTestimonial {
  id: string;
  quote: string;
  name: string;
  result: string;
  order?: number;
}

const FALLBACK_TESTIMONIALS: HomepageTestimonial[] = [
  {
    id: "fb-1",
    quote:
      "Star Coaching bata padhai garepachhi Nepal Police ma selection bhayo. Physical ra written dubai ma detailed guidance milyo.",
    name: "Dipesh Sahani",
    result: "Nepal Police",
  },
  {
    id: "fb-2",
    quote:
      "Staff Nurse entrance ko mock test bahut helpful thiyo. Faculty haru le prashna kasari solve garne bhaneko sikhaunu bhayo.",
    name: "Archana Yadav",
    result: "Staff Nurse — Province Topper",
  },
  {
    id: "fb-3",
    quote:
      "Engineering diploma ko preparation ma syllabus complete garaidiyo. Er. Bablu sir ko guidance le confidence badhyo.",
    name: "Sachin Yadav",
    result: "Civil Engineering — Province Topper",
  },
];

export function useHomepageTestimonials() {
  const [testimonials, setTestimonials] = useState<HomepageTestimonial[]>(FALLBACK_TESTIMONIALS);

  useEffect(() => {
    let cancelled = false;
    const q = query(collection(db, "homepage_testimonials"), limit(20));
    getDocs(q)
      .then((snap) => {
        if (cancelled || snap.empty) return;
        const rows = snap.docs.map((d) => ({
          id: d.id,
          quote: (d.data().quote as string) ?? "",
          name: (d.data().name as string) ?? "",
          result: (d.data().result as string) ?? "",
          order: (d.data().order as number) ?? 9999,
        }));
        rows.sort((a, b) => (a.order ?? 9999) - (b.order ?? 9999));
        setTestimonials(rows);
      })
      .catch(() => {});
    return () => {
      cancelled = true;
    };
  }, []);

  return testimonials;
}
