import { ExternalLink, ScrollText } from "lucide-react";
import { useLocation } from "react-router-dom";
import { BackButton } from "@/components/prep/BackButton";
import { Breadcrumb } from "@/components/prep/Breadcrumb";
import { coursePath, postPath, servicePath } from "@/components/prep/prep-paths";
import type { PrepCourse, PrepPost, PrepService } from "@/lib/prep/types";
import { usePageMeta } from "@/lib/seo";

function sourceHostname(url: string): string {
  try {
    return new URL(url).hostname;
  } catch {
    return "";
  }
}

/** `.../:postSlug/syllabus` — official syllabus (external link, data-driven). */
export function SyllabusPage({
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
    title: `${post.name} — पाठ्यक्रम`,
    description: `${post.name} को आधिकारिक पाठ्यक्रम।`,
    path: location.pathname,
  });

  const s = service.slug;
  const c = course.slug;
  const p = post.slug;

  const syllabusUrl = (post.syllabusUrl ?? "").trim();
  const indexUrl = (post.syllabusIndexUrl ?? "").trim();
  const hostname = syllabusUrl ? sourceHostname(syllabusUrl) : "";

  return (
    <>
      <Breadcrumb
        items={[
          { label: "मुख्य पृष्ठ", to: "/" },
          { label: service.name, to: servicePath(s) },
          { label: course.name, to: coursePath(s, c) },
          { label: post.name, to: postPath(s, c, p) },
          { label: "पाठ्यक्रम" },
        ]}
      />
      <BackButton parentPath={postPath(s, c, p)} />

      <header className="mb-6">
        <p className="text-xs font-bold uppercase tracking-widest text-brand-red">
          {post.name} • {course.name}
        </p>
        <h1 className="mt-1 font-display text-3xl font-black text-slate-900">आधिकारिक पाठ्यक्रम</h1>
      </header>

      {syllabusUrl ? (
        <div className="rounded-xl border bg-white p-6 shadow-sm">
          <div className="flex items-start gap-3">
            <span className="inline-flex rounded-xl bg-navy/10 p-3 text-navy">
              <ScrollText className="h-6 w-6" aria-hidden="true" />
            </span>
            <div>
              <p className="text-sm font-bold text-slate-900">{post.name}</p>
              {post.description ? (
                <p className="mt-0.5 text-sm text-slate-600">{post.description}</p>
              ) : null}
            </div>
          </div>

          <a
            href={syllabusUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="mt-5 inline-flex items-center gap-2 rounded-lg bg-brand-red px-5 py-3 text-sm font-bold text-white shadow-sm transition hover:bg-brand-red/90 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-red"
          >
            <ExternalLink className="h-4 w-4" aria-hidden="true" />
            आधिकारिक वेबसाइटमा पाठ्यक्रम हेर्नुहोस्
          </a>

          <dl className="mt-5 space-y-1.5 text-sm text-slate-600">
            {hostname ? (
              <div className="flex flex-wrap gap-1.5">
                <dt className="font-semibold text-slate-700">स्रोत:</dt>
                <dd className="font-medium">{hostname}</dd>
              </div>
            ) : null}
            {post.syllabusUpdatedAt ? (
              <div className="flex flex-wrap gap-1.5">
                <dt className="font-semibold text-slate-700">अन्तिम अद्यावधिक:</dt>
                <dd className="font-medium">{post.syllabusUpdatedAt}</dd>
              </div>
            ) : null}
          </dl>

          <p className="mt-5 rounded-lg bg-slate-50 px-4 py-3 text-sm leading-relaxed text-slate-600">
            यो पाठ्यक्रम आधिकारिक वेबसाइटमा मात्र खुल्छ। STAR ले यसलाई होस्ट वा परिवर्तन गर्दैन —
            तपाईं सीधै आधिकारिक स्रोतबाट हेर्नुहुन्छ।
          </p>
        </div>
      ) : (
        <div className="rounded-xl border bg-white p-6 shadow-sm">
          <div className="flex items-start gap-3">
            <span className="inline-flex rounded-xl bg-amber-100 p-3 text-amber-700">
              <ScrollText className="h-6 w-6" aria-hidden="true" />
            </span>
            <div>
              <p className="text-sm font-bold text-slate-900">{post.name}</p>
              {post.description ? (
                <p className="mt-0.5 text-sm text-slate-600">{post.description}</p>
              ) : null}
            </div>
          </div>

          <p className="mt-5 text-slate-700">यस पदको आधिकारिक पाठ्यक्रम अहिले उपलब्ध छैन।</p>

          {indexUrl ? (
            <a
              href={indexUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="mt-4 inline-flex items-center gap-2 rounded-lg border bg-white px-4 py-2.5 text-sm font-bold text-slate-700 shadow-sm transition hover:bg-slate-100 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-red"
            >
              <ExternalLink className="h-4 w-4" aria-hidden="true" />
              आधिकारिक सूची हेर्नुहोस्
            </a>
          ) : null}

          <p className="mt-5 rounded-lg bg-slate-50 px-4 py-3 text-sm leading-relaxed text-slate-600">
            पाठ्यक्रम प्राप्त भएपछि यहाँ आधिकारिक लिंक प्रकाशित हुनेछ। STAR ले आधिकारिक कागजातहरू
            होस्ट वा परिवर्तन गर्दैन।
          </p>
        </div>
      )}
    </>
  );
}
