import { useEffect, useState } from "react";
import { Download, ExternalLink, FileText, FileX, Loader2 } from "lucide-react";
import { EmptyState } from "./EmptyState";

/**
 * Lazy-mounted PDF iframe with a working toolbar
 * (open in new tab + optional download). Never hosts/alters the file.
 */
export function PdfViewer({
  fileUrl,
  allowDownload,
  title,
}: {
  fileUrl?: string;
  allowDownload?: boolean;
  title?: string;
}) {
  const [mounted, setMounted] = useState(false);
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  const url = (fileUrl ?? "").trim();

  if (!url) {
    return (
      <EmptyState
        icon={FileX}
        title="फाइल अहिले उपलब्ध छैन।"
        description="यो मोडेल सेटको PDF चाँडै नै प्रकाशित हुनेछ।"
      />
    );
  }

  return (
    <div className="overflow-hidden rounded-xl border bg-white shadow-sm">
      <div className="flex flex-wrap items-center justify-between gap-3 border-b bg-slate-50 px-4 py-3">
        <p className="flex min-w-0 items-center gap-2 text-sm font-semibold text-slate-700">
          <FileText className="h-4 w-4 shrink-0 text-brand-red" aria-hidden="true" />
          <span className="truncate">{title ?? "PDF"}</span>
        </p>
        <div className="flex flex-wrap gap-2">
          <a
            href={url}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-1.5 rounded-md border bg-white px-3 py-1.5 text-xs font-bold text-slate-700 shadow-sm transition hover:bg-slate-100 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-red"
          >
            <ExternalLink className="h-3.5 w-3.5" aria-hidden="true" />
            नयाँ ट्याबमा खोज्नुहोस्
          </a>
          {allowDownload !== false ? (
            <a
              href={url}
              download
              className="inline-flex items-center gap-1.5 rounded-md bg-brand-red px-3 py-1.5 text-xs font-bold text-white shadow-sm transition hover:bg-brand-red/90 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-red"
            >
              <Download className="h-3.5 w-3.5" aria-hidden="true" />
              डाउनलोड
            </a>
          ) : null}
        </div>
      </div>

      <div className="relative h-[70vh] bg-slate-200">
        {!loaded ? (
          <div className="absolute inset-0 z-10 flex flex-col items-center justify-center gap-2 bg-slate-100 text-sm text-slate-500">
            <Loader2 className="h-6 w-6 animate-spin" aria-hidden="true" />
            PDF लोड हुँदै...
          </div>
        ) : null}
        {mounted ? (
          <iframe
            src={url}
            title={title ?? "PDF पाठ्यक्रम"}
            onLoad={() => setLoaded(true)}
            className={`h-full w-full border-0 ${loaded ? "opacity-100" : "opacity-0"}`}
          />
        ) : null}
      </div>
    </div>
  );
}
