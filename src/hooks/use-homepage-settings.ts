import { useEffect, useState } from "react";
import { collection, getDocs, limit, doc, getDoc, query } from "firebase/firestore";
import { db } from "@/integrations/firebase/config";

export interface WhyChooseUsItem {
  id: string;
  text: string;
  order?: number;
}

export interface MdMessage {
  name: string;
  initials: string;
  message: string;
}

const FALLBACK_WHYS = [
  "Experienced faculty from real service backgrounds",
  "Daily physical + written training",
  "Regular mock tests & OMR-based practice",
  "Hostel for both boys and girls",
  "Super 40 Scholarship — up to 40% off",
];

const FALLBACK_MD: MdMessage = {
  name: "Er. Bablu Yadav",
  initials: "BY",
  message:
    "Dear students and parents, as the Managing Director of Star Coaching Institute, I want to say that education is not just about academics — it's a journey of personal growth, skill development, and pursuit of dreams. Our dedicated team is committed to your success. Stay focused, work hard, and never hesitate to reach out. We are here for you.",
};

export function useWhyChooseUs() {
  const [items, setItems] = useState<WhyChooseUsItem[]>([]);

  useEffect(() => {
    let cancelled = false;
    getDocs(query(collection(db, "why_choose_us"), limit(20)))
      .then((snap) => {
        if (cancelled || snap.empty) return;
        const rows = snap.docs.map((d) => {
          const data = d.data();
          return {
            id: d.id,
            text: (data.text as string) ?? "",
            order: (data.order as number) ?? 9999,
          };
        });
        rows.sort((a, b) => (a.order ?? 9999) - (b.order ?? 9999));
        setItems(rows);
      })
      .catch(() => {});
    return () => {
      cancelled = true;
    };
  }, []);

  return items.length ? items : FALLBACK_WHYS.map((text, i) => ({ id: `fb-${i}`, text, order: i }));
}

export function useMdMessage() {
  const [md, setMd] = useState<MdMessage>(FALLBACK_MD);

  useEffect(() => {
    let cancelled = false;
    getDoc(doc(db, "homepage_settings", "md_message"))
      .then((snap) => {
        if (cancelled || !snap.exists()) return;
        const d = snap.data();
        setMd({
          name: (d.name as string) ?? FALLBACK_MD.name,
          initials: (d.initials as string) ?? FALLBACK_MD.initials,
          message: (d.message as string) ?? FALLBACK_MD.message,
        });
      })
      .catch(() => {});
    return () => {
      cancelled = true;
    };
  }, []);

  return md;
}
