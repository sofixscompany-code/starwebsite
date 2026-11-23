import { useEffect, useState } from "react";
import { collection, getDocs, limit, query } from "@/integrations/aws/firestore";
import { db } from "@/integrations/aws/config";

export interface AgendaItem {
  id: string;
  kind: "event" | "exam" | "homework";
  title: string;
  date: string;
  details?: string;
}

const toMs = (v?: unknown) => {
  const n = typeof v === "number" ? v : Date.parse(String(v ?? ""));
  return Number.isFinite(n) ? n : 0;
};

export function useAgenda() {
  const [items, setItems] = useState<AgendaItem[]>([]);

  useEffect(() => {
    let cancelled = false;
    Promise.all([
      getDocs(query(collection(db, "events"), limit(100))),
      getDocs(query(collection(db, "exams"), limit(100))),
      getDocs(query(collection(db, "homework"), limit(200))),
    ])
      .then(([events, exams, homework]) => {
        if (cancelled) return;
        const rows: AgendaItem[] = [];
        events.docs.forEach((d) => {
          const data = d.data();
          const dateStr = String(data.date ?? "");
          rows.push({
            id: d.id,
            kind: "event",
            title: String(data.title ?? "Event"),
            date: dateStr,
            details: data.location ? String(data.location) : undefined,
          });
        });
        exams.docs.forEach((d) => {
          const data = d.data();
          rows.push({
            id: d.id,
            kind: "exam",
            title: String(data.title ?? data.subject ?? "Exam"),
            date: new Date(toMs(data.scheduledAt)).toISOString().slice(0, 10),
            details: data.subject ? String(data.subject) : undefined,
          });
        });
        homework.docs.forEach((d) => {
          const data = d.data();
          rows.push({
            id: d.id,
            kind: "homework",
            title: String(data.title ?? "Assignment"),
            date: new Date(toMs(data.dueDate)).toISOString().slice(0, 10),
            details: data.subject ? String(data.subject) : undefined,
          });
        });
        rows.sort((a, b) => toMs(a.date) - toMs(b.date));
        setItems(rows.filter((r) => r.date && r.date.length >= 8));
      })
      .catch(() => {});
    return () => {
      cancelled = true;
    };
  }, []);

  return items;
}
