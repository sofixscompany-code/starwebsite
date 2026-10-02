import { useMemo, useState } from "react";
import { BellRing, CalendarDays, Megaphone, Search, X } from "lucide-react";
import { SiteHeader } from "@/components/site/SiteHeader";
import { SiteFooter } from "@/components/site/SiteFooter";
import { isNewNotice, noticeTimeAgo, useLiveNotices } from "@/hooks/use-live-notices";
import { useLanguage } from "@/hooks/use-language";

/** Badge tones per inferred/admin category — falls back to General. Exported so the homepage notices section renders identical cards. */
export const CATEGORY_TONE: Record<string, string> = {
  Exam: "bg-blue-100 text-blue-700",
  Admission: "bg-emerald-100 text-emerald-700",
  Scholarship: "bg-amber-100 text-amber-700",
  Fees: "bg-purple-100 text-purple-700",
  Event: "bg-pink-100 text-pink-700",
  General: "bg-slate-100 text-slate-700",
};

/**
 * Public Notices & Events page — live Firestore `notices` (same source as the
 * homepage Breaking News ticker), newest first, with search + category filter.
 */
export function NoticesPage() {
  const notices = useLiveNotices(30);
  const { t } = useLanguage();
  const [search, setSearch] = useState("");
  const [category, setCategory] = useState("__all__");

  const categories = useMemo(() => {
    const set = new Set<string>();
    notices.forEach((n) => {
      if (n.category) set.add(n.category);
    });
    return Array.from(set).sort();
  }, [notices]);

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();
    return notices.filter((n) => {
      if (category !== "__all__" && n.category !== category) return false;
      if (q) {
        const hay = `${n.title} ${n.body} ${n.category}`.toLowerCase();
        if (!hay.includes(q)) return false;
      }
      return true;
    });
  }, [notices, search, category]);

  const chipCls = (active: boolean) =>
    `px-3.5 py-2 rounded-xl text-xs font-bold border transition ${
      active
        ? "bg-brand-red text-white border-brand-red"
        : "bg-white dark:bg-slate-800 text-navy dark:text-slate-200 border-border hover:border-brand-red/50 hover:text-brand-red"
    }`;

  return (
    <div className="min-h-screen flex flex-col">
      <SiteHeader />
      <main className="flex-1">
        {/* Hero */}
        <section className="relative overflow-hidden bg-navy text-navy-foreground py-14">
          {/* Banner photo — credits: "Army Money crawl" by Sudeep KC, CC BY-SA 4.0 via Wikimedia Commons */}
          <img
            src="/site/notice-hero.jpg"
            alt=""
            aria-hidden="true"
            className="absolute inset-0 h-full w-full object-cover"
          />
          <div className="absolute inset-0 bg-navy/75" />
          <div className="relative max-w-6xl mx-auto px-4 text-center">
            <p className="text-xs uppercase tracking-widest text-gold font-bold">
              {t("noticesHeroEyebrow")}
            </p>
            <h1 className="font-display font-black text-3xl md:text-5xl mt-2">
              {t("noticesHeroTitle")}
            </h1>
            <p className="mt-4 text-white/70 max-w-2xl mx-auto">{t("noticesHeroSub")}</p>
          </div>
        </section>

        {/* Notices list */}
        <section className="py-14">
          <div className="max-w-6xl mx-auto px-4">
            {/* Search + category filter */}
            <div className="flex flex-col lg:flex-row gap-3 mb-8">
              <div className="relative flex-1 max-w-md">
                <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
                <input
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  placeholder={t("noticesSearchPlaceholder")}
                  className="w-full pl-10 pr-9 py-2 rounded-xl border border-border bg-white dark:bg-slate-800 text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-brand-red/20"
                />
                {search && (
                  <button
                    onClick={() => setSearch("")}
                    aria-label="Clear search"
                    className="absolute right-2.5 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                  >
                    <X className="w-4 h-4" />
                  </button>
                )}
              </div>
              <div className="flex flex-wrap gap-2">
                <button
                  onClick={() => setCategory("__all__")}
                  className={chipCls(category === "__all__")}
                >
                  {t("allCategories")}
                </button>
                {categories.map((c) => (
                  <button
                    key={c}
                    onClick={() => setCategory(c)}
                    className={chipCls(category === c)}
                  >
                    {c}
                  </button>
                ))}
              </div>
            </div>

            {filtered.length === 0 ? (
              <div className="text-center py-16">
                <BellRing className="w-10 h-10 mx-auto text-brand-red/50 mb-3" />
                <p className="text-sm text-muted-foreground">{t("noticesEmpty")}</p>
              </div>
            ) : (
              <div className="grid gap-4 md:grid-cols-2">
                {filtered.map((n) => (
                  <article
                    key={n.id}
                    className="rounded-2xl border border-border bg-white dark:bg-slate-800 p-5 hover:shadow-md transition"
                  >
                    <div className="flex items-center gap-2 flex-wrap">
                      <span
                        className={`text-[11px] font-bold px-2.5 py-1 rounded-full ${
                          CATEGORY_TONE[n.category] ?? CATEGORY_TONE.General
                        }`}
                      >
                        {n.category || "General"}
                      </span>
                      {isNewNotice(n) && (
                        <span className="text-[10px] font-black uppercase tracking-wider bg-brand-red text-white px-2 py-0.5 rounded-full">
                          {t("newBadge")}
                        </span>
                      )}
                      <span className="ml-auto text-xs text-muted-foreground flex items-center gap-1">
                        <CalendarDays className="w-3.5 h-3.5" />
                        {noticeTimeAgo(n)}
                      </span>
                    </div>

                    <h2 className="mt-3 flex items-start gap-2 font-display font-black text-lg text-navy dark:text-white">
                      <Megaphone className="w-4 h-4 mt-1 text-brand-red shrink-0" />
                      <span>{n.title || t("generalNotice")}</span>
                    </h2>

                    {n.body && (
                      <p className="mt-2 text-sm text-slate-600 dark:text-slate-300 leading-relaxed whitespace-pre-wrap">
                        {n.body}
                      </p>
                    )}
                  </article>
                ))}
              </div>
            )}
          </div>
        </section>
      </main>
      <SiteFooter />
    </div>
  );
}
