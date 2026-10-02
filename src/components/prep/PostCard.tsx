import { ArrowRight } from "lucide-react";
import { Link } from "react-router-dom";
import type { PrepPost } from "@/lib/prep/types";

/** Post/rank tile inside a course (e.g. प्रहरी जवान). */
export function PostCard({ post, to }: { post: PrepPost; to: string }) {
  return (
    <Link
      to={to}
      aria-label={`${post.name} को तयारी ड्यासबोर्ड खोल्नुहोस्`}
      className="group flex flex-col rounded-xl border bg-white p-5 shadow-sm transition duration-200 hover:-translate-y-0.5 hover:border-brand-red/40 hover:shadow-md focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-red"
    >
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0">
          <p className="text-xs font-bold uppercase tracking-wider text-brand-red">पद</p>
          <h3 className="mt-1 font-bold text-slate-900">{post.name}</h3>
        </div>
        <ArrowRight
          className="h-4 w-4 shrink-0 text-slate-400 transition group-hover:translate-x-1 group-hover:text-brand-red"
          aria-hidden="true"
        />
      </div>
      {post.description ? <p className="mt-2 text-sm text-slate-600">{post.description}</p> : null}
      <span className="mt-4 text-sm font-semibold text-brand-red">तयारी सुरु गर्नुहोस् →</span>
    </Link>
  );
}
