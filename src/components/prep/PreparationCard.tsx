import { ArrowRight, type LucideIcon } from "lucide-react";
import { Link } from "react-router-dom";

/** One of the three preparation entries on the post dashboard. */
export function PreparationCard({
  to,
  icon: Icon,
  title,
  description,
}: {
  to: string;
  icon: LucideIcon;
  title: string;
  description?: string;
}) {
  return (
    <Link
      to={to}
      aria-label={title}
      className="group flex flex-col rounded-xl border bg-white p-6 shadow-sm transition duration-200 hover:-translate-y-0.5 hover:border-brand-red/40 hover:shadow-md focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-red"
    >
      <span className="inline-flex w-fit rounded-xl bg-brand-red/10 p-3 text-brand-red">
        <Icon className="h-6 w-6" aria-hidden="true" />
      </span>
      <h2 className="mt-4 text-lg font-bold text-slate-900">{title}</h2>
      {description ? <p className="mt-1 text-sm text-slate-600">{description}</p> : null}
      <span className="mt-4 inline-flex items-center gap-1.5 text-sm font-semibold text-brand-red">
        खोल्नुहोस्
        <ArrowRight className="h-4 w-4 transition group-hover:translate-x-0.5" aria-hidden="true" />
      </span>
    </Link>
  );
}
