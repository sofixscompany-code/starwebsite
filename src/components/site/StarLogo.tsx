import { cn } from "@/lib/utils";

interface StarLogoProps {
  className?: string;
  size?: "sm" | "md" | "lg" | "xl";
}

const sizeMap = {
  sm: "w-9 h-9",
  md: "w-12 h-12",
  lg: "w-16 h-16",
  xl: "w-24 h-24",
};

export function StarLogo({ className, size = "md" }: StarLogoProps) {
  return (
    <img
      src="/logo.svg"
      alt="Star Coaching Institute"
      className={cn("object-contain", sizeMap[size], className)}
    />
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

export function StarLogoFull({ className, size = "md" }: StarLogoProps) {
  return (
    <div className={cn("flex items-center gap-3", className)}>
      <StarLogo size={size} />
      <StarWordmark />
    </div>
  );
}
