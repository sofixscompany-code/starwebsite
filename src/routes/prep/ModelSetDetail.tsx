import { useLocation } from "react-router-dom";
import { BackButton } from "@/components/prep/BackButton";
import { Breadcrumb } from "@/components/prep/Breadcrumb";
import { McqTest } from "@/components/prep/McqTest";
import { PdfViewer } from "@/components/prep/PdfViewer";
import { coursePath, modelSetListPath, postPath, servicePath } from "@/components/prep/prep-paths";
import { StudyMaterialBadge } from "@/components/prep/StudyMaterialBadge";
import type { PrepCourse, PrepModelSet, PrepPost, PrepService } from "@/lib/prep/types";
import { usePageMeta } from "@/lib/seo";

/** `.../:postSlug/model-set/:modelSetId` — PDF viewer or MCQ test. */
export function ModelSetDetail({
  service,
  course,
  post,
  modelSet,
}: {
  service: PrepService;
  course: PrepCourse;
  post: PrepPost;
  modelSet: PrepModelSet;
}) {
  const location = useLocation();
  usePageMeta({
    title: `${modelSet.title} — Model Set`,
    description:
      modelSet.description || `${post.name} को STAR कोचिङ मोडेल सेट — ${modelSet.title}।`,
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
          { label: "Model Set", to: modelSetListPath(s, c, p) },
          { label: modelSet.title },
        ]}
      />
      <BackButton parentPath={modelSetListPath(s, c, p)} />

      <header className="mb-4">
        <p className="text-xs font-bold uppercase tracking-widest text-brand-red">
          {post.name} • {modelSet.type === "pdf" ? "PDF" : "MCQ"}
        </p>
        <h1 className="mt-1 font-display text-3xl font-black text-slate-900">{modelSet.title}</h1>
        {modelSet.description ? (
          <p className="mt-2 max-w-3xl text-slate-600">{modelSet.description}</p>
        ) : null}
        <p className="mt-3">
          <StudyMaterialBadge />
        </p>
        <p className="mt-2 text-sm text-slate-500">
          यो STAR कोचिङको अभ्यास सामग्री हो — आधिकारिक सरकारी कागजात होइन।
        </p>
      </header>

      {modelSet.type === "pdf" ? (
        <PdfViewer
          fileUrl={modelSet.fileUrl}
          allowDownload={modelSet.allowDownload}
          title={modelSet.title}
        />
      ) : (
        <McqTest questions={modelSet.questions ?? []} backPath={modelSetListPath(s, c, p)} />
      )}
    </>
  );
}
