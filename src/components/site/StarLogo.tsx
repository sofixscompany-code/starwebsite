import { cn } from "@/lib/utils";

interface StarLogoProps {
  className?: string;
  size?: "sm" | "md" | "lg";
}

const sizeMap = {
  sm: { box: "w-9 h-9", text: "text-lg" },
  md: { box: "w-11 h-11", text: "text-2xl" },
  lg: { box: "w-16 h-16", text: "text-4xl" },
};

export function StarLogo({ className, size = "md" }: StarLogoProps) {
  const s = sizeMap[size];
  return (
    <div
      className={cn(
        "relative flex items-center justify-center rounded-full bg-brand-red text-brand-red-foreground font-black border-4 border-navy shadow-md",
        s.box,
        s.text,
        className,
      )}
      aria-hidden
    >
      S
      <span className="pointer-events-none absolute -top-1 -right-1 text-gold text-[10px]">★</span>
    </div>
  );
}

export function StarWordmark({ className }: { className?: string }) {
  return (
    <div className={cn("leading-tight", className)}>
      <h1 className="font-display font-extrabold uppercase tracking-tight text-navy text-base sm:text-lg">
        Star Coaching <span className="text-brand-red">Institute</span>
      </h1>
      <p className="text-[10px] text-muted-foreground font-semibold tracking-widest uppercase">
        Pvt. Ltd. · Janakpurdham
      </p>
    </div>
  );
}
