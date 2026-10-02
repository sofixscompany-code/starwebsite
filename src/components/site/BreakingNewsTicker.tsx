import { Megaphone, Trophy } from "lucide-react";
import { useLiveNotices } from "@/hooks/use-live-notices";
import { useSelections } from "@/hooks/use-selections";
import { useLanguage } from "@/hooks/use-language";

type TickerItem = { kind: "notice" | "result"; text: string };

/**
 * Notices & Results marquee — 100% admin-published Firestore content:
 *  - `notices`    → published notices (admin: /admin/notices, real-time)
 *  - `selections` → published Top Selections/Results (admin: /admin/selections)
 * No hardcoded fallback: while nothing is published the banner hides itself,
 * so the strip never shows fake news.
 */
export function BreakingNewsTicker() {
  const notices = useLiveNotices(6);
  const { rows: results, hasData: hasResults } = useSelections(4);
  const { t } = useLanguage();

  const noticeItems: TickerItem[] = notices
    .map((n) => ({ kind: "notice" as const, text: (n.title || n.body).trim() }))
    .filter((i) => i.text);

  const resultItems: TickerItem[] = hasResults
    ? results
        .map((r) => {
          const who = (r.studentName || r.name || "").trim();
          const what = (r.achievement || r.post || r.tag || "").trim();
          return { kind: "result" as const, text: [who, what].filter(Boolean).join(" — ") };
        })
        .filter((i) => i.text)
    : [];

  const items = [...noticeItems, ...resultItems];
  if (!items.length) return null;

  // Two copies for a seamless -50% loop.
  const track = [...items, ...items];

  return (
    <div className="sc-ticker bg-navy border-b border-white/10">
      <style>{`
        @keyframes sc-ticker-scroll {
          from { transform: translateX(0); }
          to { transform: translateX(-50%); }
        }
        .sc-ticker-track {
          animation: sc-ticker-scroll 30s linear infinite;
        }
        .sc-ticker:hover .sc-ticker-track {
          animation-play-state: paused;
        }
        @media (prefers-reduced-motion: reduce) {
          .sc-ticker-track { animation: none; }
        }
      `}</style>

      <div className="flex items-center gap-3 md:gap-4 px-3 md:px-5 py-2.5">
        {/* Notices & Results pill */}
        <span className="shrink-0 inline-flex items-center gap-1.5 bg-brand-red text-white text-[11px] md:text-sm font-black px-3 md:px-4 py-1.5 rounded-full shadow-md">
          <Megaphone className="w-3.5 h-3.5 md:w-4 md:h-4" />
          {t("noticesAndResults")}
        </span>

        {/* Scrolling headlines */}
        <div className="relative flex-1 overflow-hidden">
          <div className="sc-ticker-track flex w-max items-center whitespace-nowrap">
            {track.map((item, i) => (
              <span
                key={`${item.kind}-${item.text}-${i}`}
                className="inline-flex items-center gap-2 pr-6 md:pr-8 text-[11px] md:text-sm font-bold text-white"
              >
                {item.kind === "notice" ? (
                  <Megaphone className="w-3.5 h-3.5 text-brand-red shrink-0" />
                ) : (
                  <Trophy className="w-3.5 h-3.5 text-gold shrink-0" />
                )}
                {item.kind === "result" && (
                  <span className="text-gold text-[10px] md:text-xs font-black uppercase">
                    {t("resultLabel")}:
                  </span>
                )}
                {item.text}
                <span className="text-gold text-lg leading-none pl-4 md:pl-6">•</span>
              </span>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
