export function AdmissionBadge() {
  return (
    <div className="flex justify-center -mx-4 md:mx-0">
      <div className="inline-flex items-center gap-3 px-6 py-2.5 md:px-8 md:py-3 rounded-full text-center bg-gradient-to-r from-emerald-700 via-emerald-600 to-emerald-500 shadow-lg shadow-emerald-700/30 ring-2 ring-emerald-400/40">
        <span className="relative flex w-2 h-2" aria-hidden="true">
          <span className="absolute inline-flex w-full h-full rounded-full bg-white opacity-75 animate-ping" />
          <span className="relative inline-flex w-2 h-2 rounded-full bg-white" />
        </span>
        <p className="font-display font-black text-sm md:text-lg tracking-widest text-white drop-shadow-sm">
          &#9733; ADMISSION OPEN — 2083/84 BS &#9733;
        </p>
        <span className="relative flex w-2 h-2" aria-hidden="true">
          <span className="absolute inline-flex w-full h-full rounded-full bg-white opacity-75 animate-ping" />
          <span className="relative inline-flex w-2 h-2 rounded-full bg-white" />
        </span>
      </div>
    </div>
  );
}
