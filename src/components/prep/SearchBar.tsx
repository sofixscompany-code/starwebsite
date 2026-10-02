import { useMemo, useState } from "react";
import { Search, X } from "lucide-react";
import { Link } from "react-router-dom";
import type { PrepCourse, PrepModelSet, PrepNote, PrepPost, PrepService } from "@/lib/prep/types";
import { coursePath, modelSetDetailPath, notesPath, postPath, servicePath } from "./prep-paths";

interface SearchHit {
  to: string;
  title: string;
  context?: string;
}

interface SearchGroup {
  label: string;
  hits: SearchHit[];
}

/**
 * Live catalog search (services, courses, posts, notes, model sets).
 * Case-insensitive `.includes` matching — works with Nepali text as-is.
 */
export function SearchBar({
  services,
  courses,
  posts,
  notes,
  modelSets,
}: {
  services: PrepService[];
  courses: PrepCourse[];
  posts: PrepPost[];
  notes: PrepNote[];
  modelSets: PrepModelSet[];
}) {
  const [query, setQuery] = useState("");
  const q = query.trim().toLowerCase();

  const groups = useMemo<SearchGroup[]>(() => {
    if (!q) return [];

    const match = (...values: (string | undefined | null)[]) =>
      values.some((v) => (v ?? "").toLowerCase().includes(q));

    const serviceName = (id: string) => services.find((s) => s.id === id)?.name;
    const courseName = (id: string) => courses.find((c) => c.id === id)?.name;
    const serviceSlug = (id: string) => services.find((s) => s.id === id)?.slug;
    const courseSlug = (id: string) => courses.find((c) => c.id === id)?.slug;
    const postSlug = (id: string) => posts.find((p) => p.id === id)?.slug;

    const serviceHits: SearchHit[] = services
      .filter((s) => match(s.name, s.description))
      .map((s) => ({ to: servicePath(s.slug), title: s.name, context: "सेवा" }));

    const courseHits: SearchHit[] = [];
    for (const c of courses) {
      if (!match(c.name, c.description)) continue;
      const sSlug = serviceSlug(c.serviceId);
      if (!sSlug) continue;
      courseHits.push({
        to: coursePath(sSlug, c.slug),
        title: c.name,
        context: serviceName(c.serviceId),
      });
    }

    const postHits: SearchHit[] = [];
    for (const p of posts) {
      if (!match(p.name, p.description)) continue;
      const sSlug = serviceSlug(p.serviceId);
      const cSlug = courseSlug(p.courseId);
      if (!sSlug || !cSlug) continue;
      postHits.push({
        to: postPath(sSlug, cSlug, p.slug),
        title: p.name,
        context: serviceName(p.serviceId),
      });
    }

    const noteHits: SearchHit[] = [];
    for (const n of notes) {
      if (!match(n.title, n.subject, n.description)) continue;
      const sSlug = serviceSlug(n.serviceId);
      const cSlug = courseSlug(n.courseId);
      const pSlug = postSlug(n.postId);
      if (!sSlug || !cSlug || !pSlug) continue;
      noteHits.push({
        to: notesPath(sSlug, cSlug, pSlug),
        title: n.title,
        context: courseName(n.courseId),
      });
    }

    const modelSetHits: SearchHit[] = [];
    for (const m of modelSets) {
      if (!match(m.title, m.description)) continue;
      const sSlug = serviceSlug(m.serviceId);
      const cSlug = courseSlug(m.courseId);
      const pSlug = postSlug(m.postId);
      if (!sSlug || !cSlug || !pSlug) continue;
      modelSetHits.push({
        to: modelSetDetailPath(sSlug, cSlug, pSlug, m.id),
        title: m.title,
        context: courseName(m.courseId),
      });
    }

    return [
      { label: "सेवा", hits: serviceHits },
      { label: "कोर्स", hits: courseHits },
      { label: "पद", hits: postHits },
      { label: "Notes", hits: noteHits },
      { label: "Model Set", hits: modelSetHits },
    ].filter((g) => g.hits.length > 0);
  }, [q, services, courses, posts, notes, modelSets]);

  const totalHits = groups.reduce((sum, g) => sum + g.hits.length, 0);

  return (
    <div className="relative">
      <label htmlFor="prep-search" className="sr-only">
        तयारी सामग्री खोज्नुहोस्
      </label>
      <div className="relative">
        <Search
          className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400"
          aria-hidden="true"
        />
        <input
          id="prep-search"
          type="search"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="सेवा, कोर्स, पद, Notes वा Model Set खोज्नुहोस्…"
          className="w-full rounded-lg border border-slate-200 bg-white py-2.5 pl-9 pr-9 text-sm text-slate-900 shadow-sm outline-none placeholder:text-slate-400 focus:ring-2 focus:ring-brand-red"
        />
        {query ? (
          <button
            type="button"
            onClick={() => setQuery("")}
            aria-label="खोज मेटाउनुहोस्"
            className="absolute right-2 top-1/2 -translate-y-1/2 rounded p-1 text-slate-400 transition hover:text-slate-700 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-red"
          >
            <X className="h-4 w-4" aria-hidden="true" />
          </button>
        ) : null}
      </div>

      {q ? (
        <div className="absolute left-0 right-0 top-full z-20 mt-2 max-h-96 overflow-y-auto rounded-xl border bg-white p-2 shadow-xl">
          {totalHits === 0 ? (
            <p className="px-2 py-4 text-center text-sm text-slate-500">केही म्याच भेटिएन।</p>
          ) : (
            groups.map((group) => (
              <div key={group.label} className="mb-1 last:mb-0">
                <p className="px-2 pb-1 pt-2 text-[11px] font-bold uppercase tracking-wider text-slate-400">
                  {group.label}
                </p>
                <ul>
                  {group.hits.map((hit) => (
                    <li key={hit.to}>
                      <Link
                        to={hit.to}
                        className="flex items-center justify-between gap-3 rounded-lg px-2 py-2 text-sm transition hover:bg-slate-100 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-red"
                      >
                        <span className="font-semibold text-slate-800">{hit.title}</span>
                        {hit.context ? (
                          <span className="shrink-0 text-xs text-slate-500">{hit.context}</span>
                        ) : null}
                      </Link>
                    </li>
                  ))}
                </ul>
              </div>
            ))
          )}
        </div>
      ) : null}
    </div>
  );
}
