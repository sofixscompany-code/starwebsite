import { ClipboardCheck } from "lucide-react";
import { useLocation } from "react-router-dom";
import { BackButton } from "@/components/prep/BackButton";
import { Breadcrumb } from "@/components/prep/Breadcrumb";
import { EmptyState } from "@/components/prep/EmptyState";
import { ModelSetCard } from "@/components/prep/ModelSetCard";
import {
  coursePath,
  modelSetDetailPath,
  postPath,
  servicePath,
} from "@/components/prep/prep-paths";
import { StudyMaterialBadge } from "@/components/prep/StudyMaterialBadge";
import type { PrepCourse, PrepModelSet, PrepPost, PrepService } from "@/lib/prep/types";
import { usePageMeta } from "@/lib/seo";

/** `.../:postSlug/model-set` — STAR coaching model sets (PDF / MCQ). */
export function ModelSetList({
  service,
  course,
  post,
  modelSets,
}: {
  service: PrepService;
  course: PrepCourse;
  post: PrepPost;
  modelSets: PrepModelSet[];
}) {
  const location = useLocation();
  usePageMeta({
    title: `${post.name} — Model Set`,
    description: `${post.name} का STAR कोचिङ मोडेल सेट (PDF र MCQ)।`,
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
          { label: post.name, to: postPath(s, c, p) },
          { label: "Model Set" },
        ]}
      />
      <BackButton parentPath={postPath(s, c, p)} />

      <header className="mb-4">
        <p className="text-xs font-bold uppercase tracking-widest text-brand-red">
          {post.name} • {course.name}
        </p>
        <h1 className="mt-1 font-display text-3xl font-black text-slate-900">Model Set</h1>
        <p className="mt-3 flex flex-wrap items-center gap-3 text-sm text-slate-600">
          <StudyMaterialBadge />
          <span>
            यी मोडेल सेटहरू STAR कोचिङका अभ्यास सामग्री हुन् — आधिकारिक सरकारी कागजात होइनन्।
          </span>
        </p>
      </header>

      {modelSets.length === 0 ? (
        <EmptyState
          icon={ClipboardCheck}
          title="Model Set चाँडै उपलब्ध हुनेछन्।"
          description="PDF र MCQ मोडेल सेटहरू यहाँ प्रकाशित हुनेछन्।"
        />
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {modelSets.map((modelSet) => (
            <ModelSetCard
              key={modelSet.id}
              modelSet={modelSet}
              to={modelSetDetailPath(s, c, p, modelSet.id)}
            />
          ))}
        </div>
      )}
    </>
  );
}
