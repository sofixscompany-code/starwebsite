import { ArrowRight, ClipboardCheck, FileText } from "lucide-react";
import { Link } from "react-router-dom";
import type { PrepModelSet } from "@/lib/prep/types";
import { StudyMaterialBadge } from "./StudyMaterialBadge";

/** Model set tile — links to the PDF viewer / MCQ test detail page. */
export function ModelSetCard({ modelSet, to }: { modelSet: PrepModelSet; to: string }) {
  const isPdf = modelSet.type === "pdf";
  return (
    <Link
      to={to}
      aria-label={`${modelSet.title} खोल्नुहोस्`}
      className="group flex flex-col rounded-xl border bg-white p-5 shadow-sm transition duration-200 hover:-translate-y-0.5 hover:border-brand-red/40 hover:shadow-md focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-red"
    >
      <div className="flex flex-wrap items-start justify-between gap-2">
        <StudyMaterialBadge />
        <span className="inline-flex items-center gap-1.5 rounded-full bg-navy/10 px-2.5 py-1 text-xs font-bold text-navy">
          {isPdf ? (
            <FileText className="h-3.5 w-3.5" aria-hidden="true" />
          ) : (
            <ClipboardCheck className="h-3.5 w-3.5" aria-hidden="true" />
          )}
          {isPdf ? "PDF" : "MCQ"}
        </span>
      </div>
      <h3 className="mt-3 font-bold text-slate-900">{modelSet.title}</h3>
      {modelSet.description ? (
        <p className="mt-1 text-sm text-slate-600">{modelSet.description}</p>
      ) : null}
      <span className="mt-4 inline-flex items-center gap-1.5 text-sm font-semibold text-brand-red">
        {isPdf ? "PDF हेर्नुहोस्" : "MCQ परीक्षा दिनुहोस्"}
        <ArrowRight className="h-4 w-4 transition group-hover:translate-x-0.5" aria-hidden="true" />
      </span>
    </Link>
  );
}
