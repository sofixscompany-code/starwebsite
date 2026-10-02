import { Link } from "react-router-dom";
import { ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";

export function HeroActions() {
  return (
    <div className="mt-6 flex flex-col sm:flex-row gap-3">
      <Button
        asChild
        size="lg"
        className="bg-brand-red hover:bg-brand-red/90 text-brand-red-foreground font-bold shadow-red rounded-xl transition-all hover:-translate-y-0.5 hover:shadow-xl hover:shadow-red/25"
      >
        <Link to="/admission">
          Online Admission <ArrowRight className="w-4 h-4 ml-1" />
        </Link>
      </Button>
      <Button
        asChild
        size="lg"
        variant="outline"
        className="border-2 border-navy text-navy hover:bg-navy hover:text-white dark:border-slate-300 dark:text-slate-200 font-bold rounded-xl transition-all hover:-translate-y-0.5"
      >
        <Link to="/courses">Explore Courses</Link>
      </Button>
    </div>
  );
}
