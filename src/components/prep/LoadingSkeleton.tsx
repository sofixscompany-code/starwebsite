/** Shimmering skeleton cards shown while the prep catalog is loading. */
export function LoadingSkeleton({ count = 6 }: { count?: number }) {
  return (
    <div role="status" aria-busy="true" aria-label="सामग्री लोड हुँदै...">
      <div className="mb-6 h-9 w-56 animate-pulse rounded-lg bg-slate-200" />
      <div className="mb-6 h-4 w-full max-w-2xl animate-pulse rounded bg-slate-200" />
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {Array.from({ length: count }).map((_, i) => (
          <div key={i} className="rounded-xl border bg-white p-5 shadow-sm">
            <div className="flex items-center gap-3">
              <div className="h-10 w-10 animate-pulse rounded-lg bg-slate-200" />
              <div className="flex-1 space-y-2">
                <div className="h-4 w-2/3 animate-pulse rounded bg-slate-200" />
                <div className="h-3 w-1/3 animate-pulse rounded bg-slate-200" />
              </div>
            </div>
            <div className="mt-4 h-3 w-full animate-pulse rounded bg-slate-200" />
            <div className="mt-2 h-3 w-4/5 animate-pulse rounded bg-slate-200" />
          </div>
        ))}
      </div>
      <span className="sr-only">सामग्री लोड हुँदै...</span>
    </div>
  );
}
