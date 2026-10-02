import { useLocation } from "react-router-dom";
import { BackButton } from "@/components/prep/BackButton";
import { Breadcrumb } from "@/components/prep/Breadcrumb";
import { EmptyState } from "@/components/prep/EmptyState";
import { PostCard } from "@/components/prep/PostCard";
import { postPath, servicePath } from "@/components/prep/prep-paths";
import type { PrepCourse, PrepPost, PrepService } from "@/lib/prep/types";
import { usePageMeta } from "@/lib/seo";

/** `/services/:serviceSlug/:courseSlug` — pick a post/rank inside a course. */
export function PostSelection({
  service,
  course,
  posts,
}: {
  service: PrepService;
  course: PrepCourse;
  posts: PrepPost[];
}) {
  const location = useLocation();
  usePageMeta({
    title: `${course.name} — पद`,
    description: course.description || `${service.name} — ${course.name} का पदहरू।`,
    path: location.pathname,
  });

  const list = posts.filter((post) => post.courseId === course.id);

  return (
    <>
      <Breadcrumb
        items={[
          { label: "मुख्य पृष्ठ", to: "/" },
          { label: service.name, to: servicePath(service.slug) },
          { label: course.name },
        ]}
      />
      <BackButton parentPath={servicePath(service.slug)} />

      <header className="mb-6">
        <p className="text-xs font-bold uppercase tracking-widest text-brand-red">{service.name}</p>
        <h1 className="mt-1 font-display text-3xl font-black text-slate-900">{course.name}</h1>
        {course.description ? (
          <p className="mt-2 max-w-3xl text-slate-600">{course.description}</p>
        ) : null}
      </header>

      <p className="mb-4 text-sm font-semibold text-slate-600">पद छान्नुहोस्</p>

      {list.length === 0 ? (
        <EmptyState
          title="पदहरू चाँडै उपलब्ध हुनेछन्।"
          description="यस कोर्सका पदहरू यहाँ प्रकाशित हुनेछन्।"
        />
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {list.map((post) => (
            <PostCard
              key={post.id}
              post={post}
              to={postPath(service.slug, course.slug, post.slug)}
            />
          ))}
        </div>
      )}
    </>
  );
}
