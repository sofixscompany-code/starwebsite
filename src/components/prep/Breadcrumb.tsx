import { ChevronRight } from "lucide-react";
import { Link } from "react-router-dom";

/** Hierarchical breadcrumb — the last item (no `to`) is the current page. */
export function Breadcrumb({ items }: { items: { label: string; to?: string }[] }) {
  if (items.length === 0) return null;
  return (
    <nav aria-label="ब्रेडक्रम्ब" className="mb-4">
      <ol className="flex flex-wrap items-center gap-1.5 text-sm">
        {items.map((item, index) => (
          <li key={`${item.label}-${index}`} className="flex items-center gap-1.5">
            {index > 0 ? (
              <ChevronRight className="h-3.5 w-3.5 text-slate-400" aria-hidden="true" />
            ) : null}
            {item.to ? (
              <Link
                to={item.to}
                className="font-medium text-slate-500 transition hover:text-brand-red"
              >
                {item.label}
              </Link>
            ) : (
              <span aria-current="page" className="font-semibold text-slate-900">
                {item.label}
              </span>
            )}
          </li>
        ))}
      </ol>
    </nav>
  );
}
