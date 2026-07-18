import { Link } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { Clock, IndianRupee, ArrowRight, Loader2 } from "lucide-react";
import { SiteHeader } from "@/components/site/SiteHeader";
import { SiteFooter } from "@/components/site/SiteFooter";
import { Button } from "@/components/ui/button";
import { collection, query, where, orderBy, getDocs } from "firebase/firestore";
import { db } from "@/integrations/firebase/config";

export function CoursesPage() {
  const { data: courses = [], isLoading } = useQuery({
    queryKey: ["courses-all"],
    queryFn: async () => {
      const q = query(collection(db, "courses"), where("isActive", "==", true), orderBy("sortOrder"));
      const snap = await getDocs(q);
      return snap.docs.map((d) => ({ id: d.id, ...d.data() }));
    },
  });

  const grouped = courses.reduce<Record<string, typeof courses>>((acc, c) => {
    const category = (c as any).category || 'Other';
    (acc[category] ||= []).push(c);
    return acc;
  }, {});

  return (
    <div className="min-h-screen flex flex-col">
      <SiteHeader />
      <main className="flex-1">
        <section className="bg-navy text-navy-foreground py-14">
          <div className="max-w-6xl mx-auto px-4 text-center">
            <p className="text-xs uppercase tracking-widest text-gold font-bold">Our Courses</p>
            <h1 className="font-display font-black text-3xl md:text-5xl mt-2">
              Every course, one focused institute
            </h1>
            <p className="mt-4 text-white/70 max-w-2xl mx-auto">
              From uniform services to medical, technical and school tuition — pick the path that
              fits your career.
            </p>
          </div>
        </section>

        <section className="py-14">
          <div className="max-w-6xl mx-auto px-4 space-y-12">
            {isLoading && (
              <div className="flex justify-center py-20">
                <Loader2 className="w-6 h-6 animate-spin text-navy" />
              </div>
            )}

            {Object.entries(grouped).map(([category, list]) => (
              <div key={category}>
                <div className="flex items-baseline justify-between mb-4">
                  <h2 className="font-display font-black text-xl md:text-2xl text-navy">
                    {category}
                  </h2>
                  <span className="text-xs text-muted-foreground font-semibold">
                    {list.length} {list.length === 1 ? "course" : "courses"}
                  </span>
                </div>
                <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                  {list.map((c: any) => (
                    <div
                      key={c.id}
                      className="bg-white rounded-2xl border border-border p-5 hover:border-brand-red/40 hover:shadow-md transition flex flex-col"
                    >
                      <h3 className="font-display font-bold text-lg text-navy leading-tight">
                        {c.title}
                      </h3>
                      <p className="text-sm text-muted-foreground mt-2 flex-1">
                        {c.shortDescription}
                      </p>
                      <div className="mt-4 flex items-center gap-4 text-xs text-foreground/70">
                        {c.duration && (
                          <span className="flex items-center gap-1">
                            <Clock className="w-3.5 h-3.5" /> {c.duration}
                          </span>
                        )}
                        {c.feeNpr && (
                          <span className="flex items-center gap-1 font-semibold text-brand-red">
                            <IndianRupee className="w-3.5 h-3.5" />
                            Rs. {c.feeNpr.toLocaleString()}
                          </span>
                        )}
                      </div>
                      <Button
                        asChild
                        className="mt-5 w-full bg-navy hover:bg-navy/90 text-navy-foreground font-bold"
                      >
                        <Link to="/admission">
                          Apply for this course <ArrowRight className="w-4 h-4 ml-1" />
                        </Link>
                      </Button>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </section>
      </main>
      <SiteFooter />
    </div>
  );
}


