import { useEffect, useState } from "react";
import { collection, limit, onSnapshot, query } from "@/integrations/aws/firestore";
import { db } from "@/integrations/aws/config";

export interface LiveNotice {
  id: string;
  title: string;
  body: string;
  category: string;
  isPublished?: boolean;
  publishedAt: { toMillis?: () => number } | string | null;
}

function inferCategory(title: string): string {
  const t = title.toLowerCase();
  if (/exam|test|mock|quiz|result/.test(t)) return "Exam";
  if (/admission|batch|enroll|registrat/.test(t)) return "Admission";
  if (/scholarship|discount|offer|super 40/.test(t)) return "Scholarship";
  if (/fee|payment|due|invoice/.test(t)) return "Fees";
  if (/event|holiday|celebrat|tour|function/.test(t)) return "Event";
  return "General";
}

export function noticeTimeAgo(n: Pick<LiveNotice, "publishedAt">): string {
  const p = n.publishedAt;
  if (!p) return "";
  const ms = typeof p === "object" && p.toMillis ? p.toMillis() : Date.parse(String(p)) || 0;
  if (!ms) return "";
  const diff = Date.now() - ms;
  if (diff < 60_000) return "Just now";
  const mins = Math.floor(diff / 60_000);
  if (mins < 60) return `${mins} min ago`;
  const hrs = Math.floor(mins / 60);
  if (hrs < 24) return `${hrs} hr${hrs > 1 ? "s" : ""} ago`;
  const days = Math.floor(hrs / 24);
  if (days < 7) return `${days} day${days > 1 ? "s" : ""} ago`;
  return new Date(ms).toLocaleDateString("en-GB", {
    day: "numeric",
    month: "short",
    year: "numeric",
  });
}

export function isNewNotice(n: Pick<LiveNotice, "publishedAt">, withinHrs = 48): boolean {
  const p = n.publishedAt;
  if (!p) return false;
  const ms = typeof p === "object" && p.toMillis ? p.toMillis() : Date.parse(String(p)) || 0;
  return ms > Date.now() - withinHrs * 3_600_000;
}

/**
 * Real-time homepage notices via Firestore onSnapshot.
 * Updates live (no refresh) when staff publishes a notice.
 */
export function useLiveNotices(max = 5) {
  const [notices, setNotices] = useState<LiveNotice[]>([]);

  useEffect(() => {
    const q = query(collection(db, "notices"), limit(30));
    const unsub = onSnapshot(
      q,
      (snap) => {
        const rows = snap.docs.map((d) => {
          const data = d.data();
          const title = (data.title as string) ?? "";
          return {
            id: d.id,
            title,
            body: (data.body as string) ?? "",
            category: ((data.category as string) || inferCategory(title)).trim(),
            isPublished: data.isPublished as boolean | undefined,
            publishedAt:
              (data.publishedAt as { toMillis?: () => number } | string) ??
              (data.createdAt as string | undefined) ??
              null,
          };
        });
        const visible = rows
          .filter((n) => n.isPublished !== false)
          .sort((a, b) => {
            const ma =
              typeof a.publishedAt === "object" && a.publishedAt?.toMillis
                ? a.publishedAt.toMillis()
                : Date.parse(String(a.publishedAt)) || 0;
            const mb =
              typeof b.publishedAt === "object" && b.publishedAt?.toMillis
                ? b.publishedAt.toMillis()
                : Date.parse(String(b.publishedAt)) || 0;
            return mb - ma;
          });
        setNotices(visible.slice(0, max));
      },
      () => {
        /* permission/network error: keep current list (likely empty) */
      },
    );
    return unsub;
  }, [max]);

  return notices;
}
