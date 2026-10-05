import { useEffect, useRef, useState } from "react";

/**
 * Timing of the simplified intro (`public/intro.html`): the badge/text
 * entrance finishes ~0.8s in, we hold until 2.4s, then fade for 0.6s —
 * gone at ~3.0s total.
 */
const HOLD_MS = 2400;
const FADE_MS = 600;
/** Safety net: dismiss even if /intro.html never fires its load event. */
const MAX_MS = 5000;

type Phase = "hold" | "fade" | "done";

/**
 * Full-screen "Powered by Sofixs" loading screen (renders `public/intro.html`).
 *
 * Shown once per hard page load — SPA navigation never re-triggers it, because
 * this component stays mounted for the lifetime of the React app. Holds for
 * the short entrance animation, fades out, then stops rendering entirely. A
 * Skip button lets impatient visitors jump straight to the site.
 */
export function SofixsIntro() {
  const [phase, setPhase] = useState<Phase>("hold");
  const holdTimer = useRef<number | null>(null);
  const maxTimer = useRef<number | null>(null);
  const previousOverflow = useRef<string>("");

  // Lock scrolling behind the intro while it plays.
  useEffect(() => {
    previousOverflow.current = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    maxTimer.current = window.setTimeout(() => setPhase("fade"), MAX_MS);
    return () => {
      if (holdTimer.current !== null) window.clearTimeout(holdTimer.current);
      if (maxTimer.current !== null) window.clearTimeout(maxTimer.current);
      document.body.style.overflow = previousOverflow.current;
    };
  }, []);

  // Arm the dismissal timer when the animation actually starts (iframe load),
  // so slow connections don't eat into the 2.4s hold.
  const startHold = () => {
    if (holdTimer.current !== null) return;
    holdTimer.current = window.setTimeout(() => setPhase("fade"), HOLD_MS);
  };

  // Fade-out finished → stop rendering. The component itself stays mounted
  // (App renders it unconditionally), so restore scrolling here — the effect
  // cleanup above only runs when the page unloads.
  useEffect(() => {
    if (phase !== "fade") return;
    const timer = window.setTimeout(() => {
      document.body.style.overflow = previousOverflow.current;
      setPhase("done");
    }, FADE_MS);
    return () => window.clearTimeout(timer);
  }, [phase]);

  if (phase === "done") return null;

  return (
    <div
      role="presentation"
      className={`fixed inset-0 z-[9999] bg-black transition-opacity duration-[600ms] ${
        phase === "fade" ? "pointer-events-none opacity-0" : "opacity-100"
      }`}
    >
      <iframe
        src="/intro.html"
        title="Powered by Sofixs"
        loading="eager"
        className="h-full w-full border-0"
        onLoad={startHold}
      />
      {phase === "hold" && (
        <button
          type="button"
          onClick={() => setPhase("fade")}
          className="absolute right-5 bottom-5 rounded-full border border-white/25 bg-white/10 px-4 py-2 text-xs font-semibold tracking-widest text-white/70 uppercase backdrop-blur-sm transition-colors hover:bg-white/20 hover:text-white sm:right-8 sm:bottom-8"
        >
          Skip
        </button>
      )}
    </div>
  );
}
