import { FileX, ShieldAlert } from "lucide-react";
import { EmptyState } from "@/components/prep/EmptyState";
import { SearchBar } from "@/components/prep/SearchBar";
import { ServiceCard } from "@/components/prep/ServiceCard";
import type { PrepCourse, PrepModelSet, PrepNote, PrepPost, PrepService } from "@/lib/prep/types";
import { usePageMeta } from "@/lib/seo";

/** `/services` — service catalog + portal-wide search. */
export function ServicesHome({
  services,
  courses,
  posts,
  notes,
  modelSets,
}: {
  services: PrepService[];
  courses: PrepCourse[];
  posts: PrepPost[];
  notes: PrepNote[];
  modelSets: PrepModelSet[];
}) {
  usePageMeta({
    title: "तयारी पोर्टल",
    description:
      "नेपाल प्रहरी, नेपाली सेना, APF र वनरक्षकको तयारी — आधिकारिक पाठ्यक्रम, Notes र Model Set एकै ठाउँमा।",
    path: "/services",
  });

  return (
    <>
      <section className="rounded-2xl bg-navy px-6 py-10 text-white md:px-8">
        <p className="text-xs font-bold uppercase tracking-widest text-gold">
          STAR कोचिङ इन्स्टिट्युट
        </p>
        <h1 className="mt-2 font-display text-3xl font-black md:text-4xl">तयारी पोर्टल</h1>
        <p className="mt-3 font-display text-lg font-bold text-gold md:text-2xl">
          तपाईं कुन सेवाको तयारी गर्दै हुनुहुन्छ ?
        </p>
        <p className="mt-3 max-w-3xl text-sm leading-relaxed text-white/75 md:text-base">
          नेपाल प्रहरी, नेपाली सेना, APF र वनरक्षकको तयारी — आधिकारिक पाठ्यक्रम, Notes र Model Set
          एकै ठाउँमा।
        </p>
        <div className="mt-6 max-w-2xl">
          <SearchBar
            services={services}
            courses={courses}
            posts={posts}
            notes={notes}
            modelSets={modelSets}
          />
        </div>
      </section>

      <section className="mt-8">
        <div className="mb-4 flex flex-wrap items-center justify-between gap-2">
          <h2 className="text-lg font-bold text-slate-900">सेवाहरू छान्नुहोस्</h2>
          <span className="text-xs font-semibold text-slate-500">{services.length} वटा सेवा</span>
        </div>

        {services.length === 0 ? (
          <EmptyState
            icon={ShieldAlert}
            title="सेवाहरू अहिले उपलब्ध छैनन्।"
            description="चाँडै नै नयाँ सेवाहरू थपिनेछन्।"
          />
        ) : (
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {services.map((service) => (
              <ServiceCard key={service.id} service={service} />
            ))}
          </div>
        )}

        {notes.length === 0 && modelSets.length === 0 ? (
          <p className="mt-6 flex items-center gap-2 rounded-xl border border-dashed bg-white px-4 py-3 text-sm text-slate-500">
            <FileX className="h-4 w-4 shrink-0" aria-hidden="true" />
            Notes र Model Set चाँडै उपलब्ध हुनेछन्।
          </p>
        ) : null}
      </section>
    </>
  );
}
