import { useLocation } from "react-router-dom";
import { BackButton } from "@/components/prep/BackButton";
import { Breadcrumb } from "@/components/prep/Breadcrumb";
import { CourseCard } from "@/components/prep/CourseCard";
import { EmptyState } from "@/components/prep/EmptyState";
import { coursePath, prepHome } from "@/components/prep/prep-paths";
import type { PrepCourse, PrepService } from "@/lib/prep/types";
import { usePageMeta } from "@/lib/seo";

/** `/services/:serviceSlug` — pick a course inside a service. */
export function CourseSelection({
  service,
  courses,
}: {
  service: PrepService;
  courses: PrepCourse[];
}) {
  const location = useLocation();
  usePageMeta({
    title: `${service.name} — कोर्स`,
    description: service.description || `${service.name} का तयारी कोर्सहरू।`,
    path: location.pathname,
  });

  const list = courses.filter((course) => course.serviceId === service.id);

  return (
    <>
      <Breadcrumb items={[{ label: "मुख्य पृष्ठ", to: "/" }, { label: service.name }]} />
      <BackButton parentPath={prepHome} />

      <header className="mb-6">
        <p className="text-xs font-bold uppercase tracking-widest text-brand-red">सेवा</p>
        <h1 className="mt-1 font-display text-3xl font-black text-slate-900">{service.name}</h1>
        {service.description ? (
          <p className="mt-2 max-w-3xl text-slate-600">{service.description}</p>
        ) : null}
      </header>

      <p className="mb-4 text-sm font-semibold text-slate-600">कोर्स छान्नुहोस्</p>

      {list.length === 0 ? (
        <EmptyState
          title="कोर्सहरू चाँडै उपलब्ध हुनेछन्।"
          description="यस सेवाका तयारी कोर्सहरू यहाँ प्रकाशित हुनेछन्।"
        />
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {list.map((course) => (
            <CourseCard
              key={course.id}
              course={course}
              to={coursePath(service.slug, course.slug)}
            />
          ))}
        </div>
      )}
    </>
  );
}
