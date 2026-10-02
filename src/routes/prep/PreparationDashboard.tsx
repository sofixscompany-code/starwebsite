import { ClipboardCheck, FileText, ScrollText } from "lucide-react";
import { useLocation } from "react-router-dom";
import { BackButton } from "@/components/prep/BackButton";
import { Breadcrumb } from "@/components/prep/Breadcrumb";
import { PreparationCard } from "@/components/prep/PreparationCard";
import {
  coursePath,
  modelSetListPath,
  notesPath,
  servicePath,
  syllabusPath,
} from "@/components/prep/prep-paths";
import type { PrepCourse, PrepPost, PrepService } from "@/lib/prep/types";
import { usePageMeta } from "@/lib/seo";

/** `/services/:serviceSlug/:courseSlug/:postSlug` — 3 preparation entries. */
export function PreparationDashboard({
  service,
  course,
  post,
}: {
  service: PrepService;
  course: PrepCourse;
  post: PrepPost;
}) {
  const location = useLocation();
  usePageMeta({
    title: `${post.name} तयारी`,
    description:
      post.description ||
      `${post.name} को तयारी — आधिकारिक पाठ्यक्रम, Notes र Model Set एकै ठाउँमा।`,
    path: location.pathname,
  });

  const s = service.slug;
  const c = course.slug;
  const p = post.slug;

  return (
    <>
      <Breadcrumb
        items={[
          { label: "मुख्य पृष्ठ", to: "/" },
          { label: service.name, to: servicePath(s) },
          { label: course.name, to: coursePath(s, c) },
          { label: post.name },
        ]}
      />
      <BackButton parentPath={coursePath(s, c)} />

      <header className="mb-8">
        <p className="text-xs font-bold uppercase tracking-widest text-brand-red">
          {service.name} • {course.name}
        </p>
        <h1 className="mt-1 font-display text-3xl font-black text-slate-900">{post.name}</h1>
        {post.description ? (
          <p className="mt-2 max-w-3xl text-slate-600">{post.description}</p>
        ) : null}
      </header>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        <PreparationCard
          to={syllabusPath(s, c, p)}
          icon={ScrollText}
          title="पाठ्यक्रम"
          description="आधिकारिक पाठ्यक्रम हेर्नुहोस्"
        />
        <PreparationCard
          to={notesPath(s, c, p)}
          icon={FileText}
          title="Notes"
          description="STAR कोचिङको अध्ययन सामग्री"
        />
        <PreparationCard
          to={modelSetListPath(s, c, p)}
          icon={ClipboardCheck}
          title="Model Set"
          description="PDF र MCQ अभ्यास सामग्री"
        />
      </div>
    </>
  );
}
