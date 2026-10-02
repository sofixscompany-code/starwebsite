import { FileText } from "lucide-react";
import type { PrepNote } from "@/lib/prep/types";
import { StudyMaterialBadge } from "./StudyMaterialBadge";

/** Coaching note card — open/download actions are driven by fileUrl/allowDownload. */
export function NoteCard({ note }: { note: PrepNote }) {
  const fileUrl = (note.fileUrl ?? "").trim();
  const hasFile = fileUrl.length > 0;
  const canDownload = note.allowDownload !== false;

  const actionClass =
    "inline-flex cursor-pointer items-center gap-1.5 rounded-lg bg-brand-red px-3 py-1.5 text-xs font-bold text-white shadow-sm transition hover:bg-brand-red/90 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-red disabled:cursor-not-allowed disabled:opacity-50";
  const disabledActionClass =
    "inline-flex items-center gap-1.5 rounded-lg border bg-slate-100 px-3 py-1.5 text-xs font-bold text-slate-400 shadow-sm";

  return (
    <article className="flex flex-col rounded-xl border bg-white p-5 shadow-sm">
      <div className="flex flex-wrap items-start justify-between gap-2">
        <StudyMaterialBadge />
        {note.subject ? (
          <span className="rounded-full bg-slate-100 px-2.5 py-1 text-xs font-semibold text-slate-600">
            {note.subject}
          </span>
        ) : null}
      </div>
      <h3 className="mt-3 flex items-center gap-2 font-bold text-slate-900">
        <FileText className="h-4 w-4 shrink-0 text-brand-red" aria-hidden="true" />
        {note.title}
      </h3>
      {note.description ? <p className="mt-1 text-sm text-slate-600">{note.description}</p> : null}

      <div className="mt-4 flex flex-wrap items-center gap-2">
        {hasFile ? (
          <>
            <a href={fileUrl} target="_blank" rel="noopener noreferrer" className={actionClass}>
              खोल्नुहोस्
            </a>
            {canDownload ? (
              <a href={fileUrl} download className={actionClass}>
                डाउनलोड
              </a>
            ) : null}
          </>
        ) : (
          <>
            <button type="button" disabled className={disabledActionClass}>
              खोल्नुहोस्
            </button>
            <button type="button" disabled className={disabledActionClass}>
              डाउनलोड
            </button>
            <span className="text-xs font-medium text-slate-500">फाइल अहिले छैन।</span>
          </>
        )}
      </div>
    </article>
  );
}
