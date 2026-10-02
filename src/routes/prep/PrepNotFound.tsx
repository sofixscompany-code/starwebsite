import { SearchX } from "lucide-react";
import { Link, useLocation } from "react-router-dom";
import { usePageMeta } from "@/lib/seo";

/** Unknown slug / depth anywhere under /services — honest 404 state. */
export function PrepNotFound() {
  const location = useLocation();
  usePageMeta({ title: "तयारी सामग्री भेटिएन", path: location.pathname });

  return (
    <div className="flex min-h-[50vh] flex-col items-center justify-center py-16 text-center">
      <SearchX className="h-12 w-12 text-slate-400" aria-hidden="true" />
      <h1 className="mt-5 max-w-xl font-display text-2xl font-black text-slate-900 sm:text-3xl">
        तपाईंले खोज्नुभएको तयारी सामग्री भेटिएन।
      </h1>
      <Link
        to="/"
        className="mt-6 inline-flex items-center gap-2 rounded-lg bg-brand-red px-6 py-2.5 text-sm font-bold text-white shadow-sm transition hover:bg-brand-red/90 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-red"
      >
        मुख्य पृष्ठ
      </Link>
    </div>
  );
}
