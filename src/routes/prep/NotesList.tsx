import { FileText } from "lucide-react";
import { useLocation } from "react-router-dom";
import { BackButton } from "@/components/prep/BackButton";
import { Breadcrumb } from "@/components/prep/Breadcrumb";
import { EmptyState } from "@/components/prep/EmptyState";
import { NoteCard } from "@/components/prep/NoteCard";
import { coursePath, postPath, servicePath } from "@/components/prep/prep-paths";
import { StudyMaterialBadge } from "@/components/prep/StudyMaterialBadge";
import type { PrepCourse, PrepNote, PrepPost, PrepService } from "@/lib/prep/types";
import { usePageMeta } from "@/lib/seo";

/** `.../:postSlug/notes` — STAR coaching study notes (never official). */
export function NotesList({
  service,
  course,
  post,
  notes,
}: {
  service: PrepService;
  course: PrepCourse;
  post: PrepPost;
  notes: PrepNote[];
}) {
  const location = useLocation();
  usePageMeta({
    title: `${post.name} — Notes`,
    description: `${post.name} का STAR कोचिङ अध्ययन नोट्स।`,
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
          { label: "Notes" },
        ]}
      />
      <BackButton parentPath={postPath(s, c, p)} />

      <header className="mb-4">
        <p className="text-xs font-bold uppercase tracking-widest text-brand-red">
          {post.name} • {course.name}
        </p>
        <h1 className="mt-1 font-display text-3xl font-black text-slate-900">Notes</h1>
        <p className="mt-3 flex flex-wrap items-center gap-3 text-sm text-slate-600">
          <StudyMaterialBadge />
          <span>
            यी सामग्रीहरू STAR कोचिङले तयार गरेका अभ्यास नोट्स हुन् — आधिकारिक कागजात होइनन्।
          </span>
        </p>
      </header>

      {notes.length === 0 ? (
        <EmptyState
          icon={FileText}
          title="Notes चाँडै उपलब्ध हुनेछन्।"
          description="STAR कोचिङले तयार गरेका नोट्सहरू यहाँ प्रकाशित हुनेछन्।"
        />
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {notes.map((note) => (
            <NoteCard key={note.id} note={note} />
          ))}
        </div>
      )}
    </>
  );
}
