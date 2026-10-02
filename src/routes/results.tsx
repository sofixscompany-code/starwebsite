import { useMemo, useState } from "react";
import { Search, X } from "lucide-react";
import { SiteHeader } from "@/components/site/SiteHeader";
import { SiteFooter } from "@/components/site/SiteFooter";
import { useSelections } from "@/hooks/use-selections";
import { useLanguage } from "@/hooks/use-language";
import { ResultCard, ResultCardSkeleton } from "@/components/site/ResultCard";

export function ResultsPage() {
  const { rows: toppers, loading, error } = useSelections();
  const { t } = useLanguage();
  const [search, setSearch] = useState("");
  const [achievement, setAchievement] = useState("__all__");
  const [category, setCategory] = useState("__all__");
  const [year, setYear] = useState("__all__");
  const [batch, setBatch] = useState("__all__");

  const achievements = useMemo(() => {
    const set = new Set<string>();
    toppers.forEach((t) => {
      const a = (t.achievement || t.post || "").trim();
      if (a) set.add(a);
    });
    return Array.from(set).sort();
  }, [toppers]);

  const categories = useMemo(() => {
    const set = new Set<string>();
    toppers.forEach((t) => {
      const c = (t.examCategory || "").trim();
      if (c) set.add(c);
    });
    return Array.from(set).sort();
  }, [toppers]);

  const years = useMemo(() => {
    const set = new Set<string>();
    toppers.forEach((t) => {
      const y = (t.year || "").trim();
      if (y) set.add(y);
    });
    return Array.from(set).sort().reverse();
  }, [toppers]);

  const batches = useMemo(() => {
    const set = new Set<string>();
    toppers.forEach((t) => {
      const b = (t.batch || "").trim();
      if (b) set.add(b);
    });
    return Array.from(set).sort().reverse();
  }, [toppers]);

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();
    return toppers.filter((t) => {
      if (q) {
        const name = (t.studentName || t.name || "").toLowerCase();
        const post = (t.achievement || t.post || "").toLowerCase();
        const tag = (t.tag || "").toLowerCase();
        if (![name, post, tag].some((v) => v.includes(q))) return false;
      }
      if (achievement !== "__all__" && (t.achievement || t.post) !== achievement) return false;
      if (category !== "__all__" && (t.examCategory || "") !== category) return false;
      if (year !== "__all__" && (t.year || "") !== year) return false;
      if (batch !== "__all__" && (t.batch || "") !== batch) return false;
      return true;
    });
  }, [toppers, search, achievement, category, year, batch]);

  const selectCls =
    "w-full sm:w-auto px-3 py-2 rounded-xl border border-border bg-white dark:bg-slate-800 text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-brand-red/20";

  return (
    <div className="min-h-screen flex flex-col">
      <SiteHeader />
      <main className="flex-1">
        <section className="bg-navy text-navy-foreground py-14">
          <div className="max-w-6xl mx-auto px-4 text-center">
            <p className="text-xs uppercase tracking-widest text-gold font-bold">
              {t("resultsHeroEyebrow")}
            </p>
            <h1 className="font-display font-black text-3xl md:text-5xl mt-2">
              {t("resultsHeroTitle")}
            </h1>
            <p className="mt-4 text-white/70 max-w-2xl mx-auto">{t("resultsHeroSub")}</p>
          </div>
        </section>

        <section className="py-14">
          <div className="max-w-6xl mx-auto px-4">
            <div className="flex flex-col lg:flex-row gap-3 mb-8">
              <div className="relative flex-1 max-w-md">
                <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
                <input
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  placeholder={t("searchResultsPlaceholder")}
                  className="w-full pl-10 pr-9 py-2 rounded-xl border border-border bg-white dark:bg-slate-800 text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-brand-red/20"
                />
                {search && (
                  <button
                    onClick={() => setSearch("")}
                    className="absolute right-2.5 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                  >
                    <X className="w-4 h-4" />
                  </button>
                )}
              </div>
              <div className="flex flex-wrap gap-3">
                <select
                  value={achievement}
                  onChange={(e) => setAchievement(e.target.value)}
                  className={selectCls}
                >
                  <option value="__all__">{t("allAchievements")}</option>
                  {achievements.map((a) => (
                    <option key={a} value={a}>
                      {a}
                    </option>
                  ))}
                </select>
                {categories.length > 0 && (
                  <select
                    value={category}
                    onChange={(e) => setCategory(e.target.value)}
                    className={selectCls}
                  >
                    <option value="__all__">{t("allCategories")}</option>
                    {categories.map((c) => (
                      <option key={c} value={c}>
                        {c}
                      </option>
                    ))}
                  </select>
                )}
                {years.length > 0 && (
                  <select
                    value={year}
                    onChange={(e) => setYear(e.target.value)}
                    className={selectCls}
                  >
                    <option value="__all__">{t("allYears")}</option>
                    {years.map((y) => (
                      <option key={y} value={y}>
                        {y}
                      </option>
                    ))}
                  </select>
                )}
                {batches.length > 0 && (
                  <select
                    value={batch}
                    onChange={(e) => setBatch(e.target.value)}
                    className={selectCls}
                  >
                    <option value="__all__">{t("allBatches")}</option>
                    {batches.map((b) => (
                      <option key={b} value={b}>
                        {b}
                      </option>
                    ))}
                  </select>
                )}
              </div>
            </div>

            {/* Prefer showing rows (incl. static fallback) over an error wall */}
            {loading && filtered.length === 0 ? (
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3">
                {Array.from({ length: 8 }).map((_, i) => (
                  <ResultCardSkeleton key={`sk-${i}`} />
                ))}
              </div>
            ) : filtered.length === 0 ? (
              <div className="text-center py-16">
                <p className="text-sm text-muted-foreground">
                  {error ? t("resultsLoadError") : t("noSelectionsYet")}
                </p>
              </div>
            ) : (
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3">
                {filtered.map((row) => (
                  <ResultCard key={row.id} r={row} />
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
