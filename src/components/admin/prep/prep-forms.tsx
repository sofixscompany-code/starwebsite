import { useState, type ReactNode } from "react";
import { toast } from "sonner";
import { Loader2, Plus, Save, Trash2 } from "lucide-react";
import { Modal } from "@/components/admin/ui";
import { getPrepIcon } from "@/components/prep/prep-icons";
import {
  PREP_COLLECTIONS,
  slugify,
  type PrepCourse,
  type PrepModelSet,
  type PrepNote,
  type PrepPost,
  type PrepQuestion,
  type PrepService,
} from "@/lib/prep/types";
import { FileUrlField, FormField, PublishedChip } from "./prep-fields";
import { PREP_GRADIENTS, PREP_ICON_NAMES, isBundledRow, isValidHttpsUrl } from "./prep-shared";

/* ── Editable drafts: id optional so new rows create instead of update ── */
type ServiceDraft = Omit<PrepService, "id"> & { id?: string };
type CourseDraft = Omit<PrepCourse, "id"> & { id?: string };
type PostDraft = Omit<PrepPost, "id"> & { id?: string };
type NoteDraft = Omit<PrepNote, "id"> & { id?: string };
type ModelSetDraft = Omit<PrepModelSet, "id"> & { id?: string };

const ABCD = ["A", "B", "C", "D"] as const;

const BUNDLED_PARENT_HINT =
  'Selected service/course/post is still a bundled default — click "डिफल्ट डाटा सिर्जना गर्नुहोस्" first.';

const toNum = (v: string): number => {
  const n = Number(v);
  return Number.isFinite(n) ? n : 0;
};

/** Cascade validation shared by the post/note/model-set forms. */
function checkServiceParent(serviceId: string): string | null {
  if (!serviceId) return "Select a service.";
  if (isBundledRow(PREP_COLLECTIONS.services, serviceId)) return BUNDLED_PARENT_HINT;
  return null;
}

function checkCourseParent(serviceId: string, courseId: string): string | null {
  const serviceError = checkServiceParent(serviceId);
  if (serviceError) return serviceError;
  if (!courseId) return "Select a course.";
  if (isBundledRow(PREP_COLLECTIONS.courses, courseId)) return BUNDLED_PARENT_HINT;
  return null;
}

function checkPostParent(serviceId: string, courseId: string, postId: string): string | null {
  const courseError = checkCourseParent(serviceId, courseId);
  if (courseError) return courseError;
  if (!postId) return "Select a post.";
  if (isBundledRow(PREP_COLLECTIONS.posts, postId)) return BUNDLED_PARENT_HINT;
  return null;
}

type NamedRow = { id: string; name: string };

/** Keeps a stale/unknown parent id selectable when the referenced row is gone. */
function unknownOption(id: string | undefined, rows: NamedRow[]): ReactNode {
  if (!id || rows.some((r) => r.id === id)) return null;
  return (
    <option key={id} value={id}>
      {id} (हटाइएको)
    </option>
  );
}

function ParentMissingHint({ rows, kind }: { rows: number; kind: string }) {
  if (rows > 0) return null;
  return (
    <p className="text-[11px] text-amber-600 dark:text-amber-400 mt-1">
      कुनै {kind} छैन — पहिले {kind} थप्नुहोस् वा डिफल्ट डाटा सिर्जना गर्नुहोस्।
    </p>
  );
}

function IconSelect({
  value,
  onChange,
  allowEmpty,
}: {
  value: string;
  onChange: (v: string) => void;
  allowEmpty?: boolean;
}) {
  const PreviewIcon = getPrepIcon(value);
  const known = (PREP_ICON_NAMES as readonly string[]).includes(value);
  return (
    <FormField label="Icon" hint="पोर्टलमा देखिने आइकन">
      <div className="flex items-center gap-2">
        <select
          value={value}
          onChange={(e) => onChange(e.target.value)}
          className="ap-input w-full"
        >
          {allowEmpty && <option value="">— (बुँदैन)</option>}
          {!known && value && <option value={value}>{value}</option>}
          {PREP_ICON_NAMES.map((n) => (
            <option key={n} value={n}>
              {n}
            </option>
          ))}
        </select>
        <span className="w-9 h-9 rounded-lg bg-gray-100 dark:bg-gray-700 flex items-center justify-center shrink-0">
          <PreviewIcon className="w-4 h-4 text-gray-600 dark:text-gray-300" />
        </span>
      </div>
    </FormField>
  );
}

function FormFooter({
  saving,
  onSave,
  onClose,
  saveLabel,
}: {
  saving: boolean;
  onSave: () => void;
  onClose: () => void;
  saveLabel: string;
}) {
  return (
    <div className="flex justify-end gap-3 mt-6 pt-4 border-t border-gray-200 dark:border-slate-700">
      <button type="button" onClick={onClose} className="ap-btn-ghost">
        रद्दगर्नुहोस्
      </button>
      <button type="button" onClick={onSave} disabled={saving} className="ap-btn">
        {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
        {saveLabel}
      </button>
    </div>
  );
}

function Toggle({
  checked,
  onChange,
  onLabel,
  offLabel,
}: {
  checked: boolean;
  onChange: (v: boolean) => void;
  onLabel: string;
  offLabel: string;
}) {
  return (
    <label className="flex items-center gap-2 cursor-pointer text-sm text-gray-700 dark:text-gray-300">
      <input
        type="checkbox"
        checked={checked}
        onChange={(e) => onChange(e.target.checked)}
        className="rounded"
      />
      {checked ? onLabel : offLabel}
    </label>
  );
}

/* ── blanks ─────────────────────────────────────────────── */

const blankService = (): ServiceDraft => ({
  name: "",
  slug: "",
  description: "",
  icon: "BookOpen",
  color: PREP_GRADIENTS[0].value,
  sortOrder: 1,
  isActive: true,
});

const blankCourse = (): CourseDraft => ({
  serviceId: "",
  name: "",
  slug: "",
  description: "",
  icon: "",
  sortOrder: 1,
  isActive: true,
});

const blankPost = (): PostDraft => ({
  serviceId: "",
  courseId: "",
  name: "",
  slug: "",
  description: "",
  syllabusUrl: "",
  syllabusIndexUrl: "",
  syllabusUpdatedAt: "",
  sortOrder: 1,
  isActive: true,
});

const blankNote = (): NoteDraft => ({
  serviceId: "",
  courseId: "",
  postId: "",
  title: "",
  subject: "",
  description: "",
  fileUrl: "",
  allowDownload: true,
  isPublished: false,
  sortOrder: 1,
});

const blankModelSet = (): ModelSetDraft => ({
  serviceId: "",
  courseId: "",
  postId: "",
  title: "",
  description: "",
  type: "pdf",
  fileUrl: "",
  allowDownload: true,
  questions: [],
  isPublished: false,
  sortOrder: 1,
});

const newQuestion = (index: number): PrepQuestion => ({
  id: `q-${Date.now()}-${index}`,
  text: "",
  options: ["", "", "", ""],
  correctIndex: -1,
});

/* ═══ SERVICE ═══════════════════════════════════════════ */

export function ServiceForm({
  initial,
  saving,
  onClose,
  onSubmit,
}: {
  initial: PrepService | null;
  saving: boolean;
  onClose: () => void;
  onSubmit: (payload: ServiceDraft) => void;
}) {
  const [draft, setDraft] = useState<ServiceDraft>(() => initial ?? blankService());
  const [slugAuto, setSlugAuto] = useState(!initial);

  const patch = (p: Partial<ServiceDraft>) => setDraft((d) => ({ ...d, ...p }));
  const knownColor = PREP_GRADIENTS.some((g) => g.value === draft.color);

  const submit = () => {
    const name = draft.name.trim();
    if (!name) return toast.error("Name is required.");
    onSubmit({
      ...draft,
      name,
      slug: draft.slug.trim() || slugify(name),
      description: (draft.description ?? "").trim(),
      sortOrder: toNum(String(draft.sortOrder)),
    });
  };

  return (
    <Modal open onClose={onClose} size="lg" title={initial ? "Edit Service" : "New Service"}>
      <div className="space-y-4">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <FormField label="Name" required>
            <input
              value={draft.name}
              onChange={(e) => {
                const name = e.target.value;
                setDraft((d) => ({
                  ...d,
                  name,
                  slug: slugAuto && name.trim() ? slugify(name) : d.slug,
                }));
              }}
              placeholder="e.g. Nepal Police"
              className="ap-input w-full"
            />
          </FormField>
          <FormField label="Slug" hint="URL का लागि — स्वतः बन्छ, मोड्न पनि सक्नुहुन्छ">
            <input
              value={draft.slug}
              onChange={(e) => {
                setSlugAuto(false);
                patch({ slug: e.target.value });
              }}
              placeholder="nepal-police"
              className="ap-input w-full"
            />
          </FormField>
        </div>

        <FormField label="Description">
          <textarea
            value={draft.description}
            onChange={(e) => patch({ description: e.target.value })}
            rows={2}
            className="ap-input w-full"
          />
        </FormField>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <FormField label="Color" hint="कार्डको ग्रेडिएन्ट रङ">
            <div className="flex items-center gap-2">
              <select
                value={draft.color}
                onChange={(e) => patch({ color: e.target.value })}
                className="ap-input w-full"
              >
                {!knownColor && <option value={draft.color}>{draft.color}</option>}
                {PREP_GRADIENTS.map((g) => (
                  <option key={g.value} value={g.value}>
                    {g.label}
                  </option>
                ))}
              </select>
              <span
                className={`w-9 h-9 rounded-lg shrink-0 bg-gradient-to-br ${draft.color}`}
                title={draft.color}
              />
            </div>
          </FormField>
          <IconSelect value={draft.icon} onChange={(icon) => patch({ icon })} />
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 items-end">
          <FormField label="Sort Order">
            <input
              type="number"
              value={draft.sortOrder}
              onChange={(e) => patch({ sortOrder: toNum(e.target.value) })}
              className="ap-input w-full"
            />
          </FormField>
          <div className="pb-2">
            <Toggle
              checked={draft.isActive}
              onChange={(isActive) => patch({ isActive })}
              onLabel="सक्रिय — पोर्टलमा देखिन्छ"
              offLabel="लुकेको — पोर्टलमा देखिन्छैन"
            />
          </div>
        </div>
      </div>
      <FormFooter saving={saving} onSave={submit} onClose={onClose} saveLabel="Save Service" />
    </Modal>
  );
}

/* ═══ COURSE ════════════════════════════════════════════ */

export function CourseForm({
  initial,
  services,
  saving,
  onClose,
  onSubmit,
}: {
  initial: PrepCourse | null;
  services: PrepService[];
  saving: boolean;
  onClose: () => void;
  onSubmit: (payload: CourseDraft) => void;
}) {
  const [draft, setDraft] = useState<CourseDraft>(() =>
    initial
      ? { ...initial, description: initial.description ?? "", icon: initial.icon ?? "" }
      : blankCourse(),
  );
  const [slugAuto, setSlugAuto] = useState(!initial);

  const patch = (p: Partial<CourseDraft>) => setDraft((d) => ({ ...d, ...p }));

  const submit = () => {
    const name = draft.name.trim();
    const parentError = checkServiceParent(draft.serviceId);
    if (parentError) return toast.error(parentError);
    if (!name) return toast.error("Name is required.");
    onSubmit({
      ...draft,
      name,
      slug: draft.slug.trim() || slugify(name),
      description: (draft.description ?? "").trim(),
      sortOrder: toNum(String(draft.sortOrder)),
    });
  };

  return (
    <Modal open onClose={onClose} size="lg" title={initial ? "Edit Course" : "New Course"}>
      <div className="space-y-4">
        <FormField label="Service" required>
          <>
            <select
              value={draft.serviceId}
              onChange={(e) => patch({ serviceId: e.target.value })}
              className="ap-input w-full"
            >
              <option value="">— सेवा छान्नुहोस् —</option>
              {unknownOption(draft.serviceId, services)}
              {services.map((s) => (
                <option key={s.id} value={s.id}>
                  {s.name}
                </option>
              ))}
            </select>
            <ParentMissingHint rows={services.length} kind="सेवा" />
          </>
        </FormField>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <FormField label="Name" required>
            <input
              value={draft.name}
              onChange={(e) => {
                const name = e.target.value;
                setDraft((d) => ({
                  ...d,
                  name,
                  slug: slugAuto && name.trim() ? slugify(name) : d.slug,
                }));
              }}
              placeholder="e.g. जनपद प्रहरी"
              className="ap-input w-full"
            />
          </FormField>
          <FormField label="Slug" hint="URL का लागि — स्वतः बन्छ, मोड्न पनि सक्नुहुन्छ">
            <input
              value={draft.slug}
              onChange={(e) => {
                setSlugAuto(false);
                patch({ slug: e.target.value });
              }}
              className="ap-input w-full"
            />
          </FormField>
        </div>

        <FormField label="Description">
          <textarea
            value={draft.description}
            onChange={(e) => patch({ description: e.target.value })}
            rows={2}
            className="ap-input w-full"
          />
        </FormField>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 items-end">
          <IconSelect value={draft.icon ?? ""} onChange={(icon) => patch({ icon })} allowEmpty />
          <FormField label="Sort Order">
            <input
              type="number"
              value={draft.sortOrder}
              onChange={(e) => patch({ sortOrder: toNum(e.target.value) })}
              className="ap-input w-full"
            />
          </FormField>
        </div>

        <Toggle
          checked={draft.isActive}
          onChange={(isActive) => patch({ isActive })}
          onLabel="सक्रिय — पोर्टलमा देखिन्छ"
          offLabel="लुकेको — पोर्टलमा देखिन्छैन"
        />
      </div>
      <FormFooter saving={saving} onSave={submit} onClose={onClose} saveLabel="Save Course" />
    </Modal>
  );
}

/* ═══ POST (पद) ═════════════════════════════════════════ */

export function PostForm({
  initial,
  services,
  courses,
  saving,
  onClose,
  onSubmit,
}: {
  initial: PrepPost | null;
  services: PrepService[];
  courses: PrepCourse[];
  saving: boolean;
  onClose: () => void;
  onSubmit: (payload: PostDraft) => void;
}) {
  const [draft, setDraft] = useState<PostDraft>(() =>
    initial
      ? {
          ...initial,
          description: initial.description ?? "",
          syllabusUrl: initial.syllabusUrl ?? "",
          syllabusIndexUrl: initial.syllabusIndexUrl ?? "",
          syllabusUpdatedAt: initial.syllabusUpdatedAt ?? "",
        }
      : blankPost(),
  );
  const [slugAuto, setSlugAuto] = useState(!initial);

  const patch = (p: Partial<PostDraft>) => setDraft((d) => ({ ...d, ...p }));
  const serviceCourses = courses.filter((c) => c.serviceId === draft.serviceId);

  const submit = () => {
    const name = draft.name.trim();
    const syllabusUrl = (draft.syllabusUrl ?? "").trim();
    const syllabusIndexUrl = (draft.syllabusIndexUrl ?? "").trim();
    const parentError = checkCourseParent(draft.serviceId, draft.courseId);
    if (parentError) return toast.error(parentError);
    if (!name) return toast.error("Name is required.");
    if (!isValidHttpsUrl(syllabusUrl)) {
      return toast.error("Syllabus URL must start with https:// (or be empty).");
    }
    if (!isValidHttpsUrl(syllabusIndexUrl)) {
      return toast.error("Syllabus index URL must start with https:// (or be empty).");
    }
    onSubmit({
      ...draft,
      name,
      slug: draft.slug.trim() || slugify(name),
      description: (draft.description ?? "").trim(),
      syllabusUrl,
      syllabusIndexUrl,
      syllabusUpdatedAt: (draft.syllabusUpdatedAt ?? "").trim(),
      sortOrder: toNum(String(draft.sortOrder)),
    });
  };

  return (
    <Modal open onClose={onClose} title={initial ? "Edit Post" : "New Post"}>
      <div className="space-y-4">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <FormField label="Service" required>
            <>
              <select
                value={draft.serviceId}
                onChange={(e) => patch({ serviceId: e.target.value, courseId: "" })}
                className="ap-input w-full"
              >
                <option value="">— सेवा छान्नुहोस् —</option>
                {unknownOption(draft.serviceId, services)}
                {services.map((s) => (
                  <option key={s.id} value={s.id}>
                    {s.name}
                  </option>
                ))}
              </select>
              <ParentMissingHint rows={services.length} kind="सेवा" />
            </>
          </FormField>
          <FormField label="Course" required>
            <>
              <select
                value={draft.courseId}
                onChange={(e) => patch({ courseId: e.target.value })}
                className="ap-input w-full"
              >
                <option value="">— कोर्स छान्नुहोस् —</option>
                {unknownOption(draft.courseId, serviceCourses)}
                {serviceCourses.map((c) => (
                  <option key={c.id} value={c.id}>
                    {c.name}
                  </option>
                ))}
              </select>
              <ParentMissingHint rows={serviceCourses.length} kind="कोर्स" />
            </>
          </FormField>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <FormField label="Name" required>
            <input
              value={draft.name}
              onChange={(e) => {
                const name = e.target.value;
                setDraft((d) => ({
                  ...d,
                  name,
                  slug: slugAuto && name.trim() ? slugify(name) : d.slug,
                }));
              }}
              placeholder="e.g. प्रहरी जवान"
              className="ap-input w-full"
            />
          </FormField>
          <FormField label="Slug" hint="URL का लागि — स्वतः बन्छ, मोड्न पनि सक्नुहुन्छ">
            <input
              value={draft.slug}
              onChange={(e) => {
                setSlugAuto(false);
                patch({ slug: e.target.value });
              }}
              className="ap-input w-full"
            />
          </FormField>
        </div>

        <FormField label="Description">
          <textarea
            value={draft.description}
            onChange={(e) => patch({ description: e.target.value })}
            rows={2}
            className="ap-input w-full"
          />
        </FormField>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <FormField
            label="Syllabus URL"
            hint="आधिकारिक वेबसाइटको पाठ्यक्रम पृष्ठ — छाड्दा पनि हुन्छ"
          >
            <input
              value={draft.syllabusUrl ?? ""}
              onChange={(e) => patch({ syllabusUrl: e.target.value })}
              placeholder="https://..."
              className="ap-input w-full"
            />
          </FormField>
          <FormField
            label="Syllabus Index URL"
            hint="आधिकारिक वेबसाइटको पाठ्यक्रम पृष्ठ — छाड्दा पनि हुन्छ"
          >
            <input
              value={draft.syllabusIndexUrl ?? ""}
              onChange={(e) => patch({ syllabusIndexUrl: e.target.value })}
              placeholder="https://..."
              className="ap-input w-full"
            />
          </FormField>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 items-end">
          <FormField label="Syllabus Updated" hint="URL पुष्टि गरेको मिति">
            <input
              type="date"
              value={draft.syllabusUpdatedAt ?? ""}
              onChange={(e) => patch({ syllabusUpdatedAt: e.target.value })}
              className="ap-input w-full"
            />
          </FormField>
          <FormField label="Sort Order">
            <input
              type="number"
              value={draft.sortOrder}
              onChange={(e) => patch({ sortOrder: toNum(e.target.value) })}
              className="ap-input w-full"
            />
          </FormField>
          <div className="pb-2">
            <Toggle
              checked={draft.isActive}
              onChange={(isActive) => patch({ isActive })}
              onLabel="सक्रिय — पोर्टलमा देखिन्छ"
              offLabel="लुकेको — पोर्टलमा देखिन्छैन"
            />
          </div>
        </div>
      </div>
      <FormFooter saving={saving} onSave={submit} onClose={onClose} saveLabel="Save Post" />
    </Modal>
  );
}

/* ═══ NOTE ══════════════════════════════════════════════ */

export function NoteForm({
  initial,
  services,
  courses,
  posts,
  saving,
  onClose,
  onSubmit,
}: {
  initial: PrepNote | null;
  services: PrepService[];
  courses: PrepCourse[];
  posts: PrepPost[];
  saving: boolean;
  onClose: () => void;
  onSubmit: (payload: NoteDraft) => void;
}) {
  const [draft, setDraft] = useState<NoteDraft>(() =>
    initial
      ? {
          ...initial,
          subject: initial.subject ?? "",
          description: initial.description ?? "",
          fileUrl: initial.fileUrl ?? "",
          allowDownload: initial.allowDownload ?? true,
          isPublished: initial.isPublished === true,
        }
      : blankNote(),
  );

  const patch = (p: Partial<NoteDraft>) => setDraft((d) => ({ ...d, ...p }));
  const serviceCourses = courses.filter((c) => c.serviceId === draft.serviceId);
  const coursePosts = posts.filter(
    (p) => p.serviceId === draft.serviceId && p.courseId === draft.courseId,
  );

  const submit = () => {
    const title = draft.title.trim();
    const parentError = checkPostParent(draft.serviceId, draft.courseId, draft.postId);
    if (parentError) return toast.error(parentError);
    if (!title) return toast.error("Title is required.");
    onSubmit({
      ...draft,
      title,
      subject: (draft.subject ?? "").trim(),
      description: (draft.description ?? "").trim(),
      fileUrl: (draft.fileUrl ?? "").trim(),
      allowDownload: draft.allowDownload ?? true,
      // Firestore rules require a real boolean for public reads.
      isPublished: draft.isPublished === true,
      sortOrder: toNum(String(draft.sortOrder)),
    });
  };

  return (
    <Modal open onClose={onClose} size="xl" title={initial ? "Edit Note" : "New Note"}>
      <div className="space-y-4">
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <FormField label="Service" required>
            <>
              <select
                value={draft.serviceId}
                onChange={(e) => patch({ serviceId: e.target.value, courseId: "", postId: "" })}
                className="ap-input w-full"
              >
                <option value="">— सेवा छान्नुहोस् —</option>
                {unknownOption(draft.serviceId, services)}
                {services.map((s) => (
                  <option key={s.id} value={s.id}>
                    {s.name}
                  </option>
                ))}
              </select>
              <ParentMissingHint rows={services.length} kind="सेवा" />
            </>
          </FormField>
          <FormField label="Course" required>
            <>
              <select
                value={draft.courseId}
                onChange={(e) => patch({ courseId: e.target.value, postId: "" })}
                className="ap-input w-full"
              >
                <option value="">— कोर्स छान्नुहोस् —</option>
                {unknownOption(draft.courseId, serviceCourses)}
                {serviceCourses.map((c) => (
                  <option key={c.id} value={c.id}>
                    {c.name}
                  </option>
                ))}
              </select>
              <ParentMissingHint rows={serviceCourses.length} kind="कोर्स" />
            </>
          </FormField>
          <FormField label="Post" required>
            <>
              <select
                value={draft.postId}
                onChange={(e) => patch({ postId: e.target.value })}
                className="ap-input w-full"
              >
                <option value="">— पद छान्नुहोस् —</option>
                {unknownOption(draft.postId, coursePosts)}
                {coursePosts.map((p) => (
                  <option key={p.id} value={p.id}>
                    {p.name}
                  </option>
                ))}
              </select>
              <ParentMissingHint rows={coursePosts.length} kind="पद" />
            </>
          </FormField>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <FormField label="Title" required>
            <input
              value={draft.title}
              onChange={(e) => patch({ title: e.target.value })}
              placeholder="e.g. गणित — Chapter 1 Note"
              className="ap-input w-full"
            />
          </FormField>
          <FormField label="Subject">
            <input
              value={draft.subject ?? ""}
              onChange={(e) => patch({ subject: e.target.value })}
              placeholder="e.g. गणित"
              className="ap-input w-full"
            />
          </FormField>
        </div>

        <FormField label="Description">
          <textarea
            value={draft.description ?? ""}
            onChange={(e) => patch({ description: e.target.value })}
            rows={2}
            className="ap-input w-full"
          />
        </FormField>

        <FileUrlField
          label="File URL"
          value={draft.fileUrl ?? ""}
          onChange={(fileUrl) => patch({ fileUrl })}
          folder="notes"
          accept=".pdf,.doc,.docx,application/pdf"
        />

        <div className="flex flex-wrap items-center justify-between gap-4">
          <Toggle
            checked={draft.allowDownload ?? true}
            onChange={(allowDownload) => patch({ allowDownload })}
            onLabel="डाउनलोड गर्न दिनुहोस्"
            offLabel="डाउनलोड बन्द (अनलाइन मात्र)"
          />
          <div className="flex items-center gap-3">
            <PublishedChip isPublished={draft.isPublished === true} />
            <Toggle
              checked={draft.isPublished === true}
              onChange={(isPublished) => patch({ isPublished })}
              onLabel="प्रकाशित — सार्वजनिक पोर्टलमा देखिन्छ"
              offLabel="ड्राफ्ट — सार्वजनिक पोर्टलमा देखिन्छैन"
            />
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:max-w-xs">
          <FormField label="Sort Order">
            <input
              type="number"
              value={draft.sortOrder}
              onChange={(e) => patch({ sortOrder: toNum(e.target.value) })}
              className="ap-input w-full"
            />
          </FormField>
        </div>
      </div>
      <FormFooter saving={saving} onSave={submit} onClose={onClose} saveLabel="Save Note" />
    </Modal>
  );
}

/* ═══ MODEL SET ═════════════════════════════════════════ */

export function ModelSetForm({
  initial,
  services,
  courses,
  posts,
  saving,
  onClose,
  onSubmit,
}: {
  initial: PrepModelSet | null;
  services: PrepService[];
  courses: PrepCourse[];
  posts: PrepPost[];
  saving: boolean;
  onClose: () => void;
  onSubmit: (payload: ModelSetDraft) => void;
}) {
  const [draft, setDraft] = useState<ModelSetDraft>(() =>
    initial
      ? {
          ...initial,
          description: initial.description ?? "",
          fileUrl: initial.fileUrl ?? "",
          allowDownload: initial.allowDownload ?? true,
          questions: initial.questions ?? [],
          isPublished: initial.isPublished === true,
        }
      : blankModelSet(),
  );

  const patch = (p: Partial<ModelSetDraft>) => setDraft((d) => ({ ...d, ...p }));
  const questions = draft.questions ?? [];
  const serviceCourses = courses.filter((c) => c.serviceId === draft.serviceId);
  const coursePosts = posts.filter(
    (p) => p.serviceId === draft.serviceId && p.courseId === draft.courseId,
  );

  const setQuestions = (next: PrepQuestion[]) => patch({ questions: next });

  const addQuestion = () => setQuestions([...questions, newQuestion(questions.length)]);

  const removeQuestion = (idx: number) => setQuestions(questions.filter((_, i) => i !== idx));

  const updateQuestion = (idx: number, p: Partial<PrepQuestion>) =>
    setQuestions(questions.map((q, i) => (i === idx ? { ...q, ...p } : q)));

  const updateOption = (qIdx: number, oIdx: number, value: string) =>
    setQuestions(
      questions.map((q, i) => {
        if (i !== qIdx) return q;
        const options = [...q.options] as [string, string, string, string];
        options[oIdx] = value;
        return { ...q, options };
      }),
    );

  const submit = () => {
    const title = draft.title.trim();
    const parentError = checkPostParent(draft.serviceId, draft.courseId, draft.postId);
    if (parentError) return toast.error(parentError);
    if (!title) return toast.error("Title is required.");

    if (draft.type === "pdf") {
      const fileUrl = (draft.fileUrl ?? "").trim();
      if (!fileUrl) return toast.error("PDF fileUrl is required — upload a file or paste a URL.");
      onSubmit({
        ...draft,
        title,
        description: (draft.description ?? "").trim(),
        fileUrl,
        allowDownload: draft.allowDownload ?? true,
        questions: [],
        isPublished: draft.isPublished === true,
        sortOrder: toNum(String(draft.sortOrder)),
      });
      return;
    }

    if (questions.length < 1) return toast.error("Add at least one question.");
    for (let i = 0; i < questions.length; i++) {
      const q = questions[i];
      if (!q.text.trim()) return toast.error(`Question ${i + 1}: question text is required.`);
      for (let o = 0; o < q.options.length; o++) {
        if (!q.options[o].trim()) {
          return toast.error(`Question ${i + 1}: option ${ABCD[o]} is required.`);
        }
      }
      if (q.correctIndex < 0 || q.correctIndex > 3) {
        return toast.error(`Question ${i + 1}: select the correct answer.`);
      }
    }
    onSubmit({
      ...draft,
      title,
      description: (draft.description ?? "").trim(),
      fileUrl: "",
      allowDownload: draft.allowDownload ?? true,
      questions: questions.map((q) => ({
        ...q,
        text: q.text.trim(),
        options: q.options.map((o) => o.trim()) as [string, string, string, string],
        correctIndex: q.correctIndex,
      })),
      isPublished: draft.isPublished === true,
      sortOrder: toNum(String(draft.sortOrder)),
    });
  };

  return (
    <Modal open onClose={onClose} size="xl" title={initial ? "Edit Model Set" : "New Model Set"}>
      <div className="space-y-4">
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <FormField label="Service" required>
            <>
              <select
                value={draft.serviceId}
                onChange={(e) => patch({ serviceId: e.target.value, courseId: "", postId: "" })}
                className="ap-input w-full"
              >
                <option value="">— सेवा छान्नुहोस् —</option>
                {unknownOption(draft.serviceId, services)}
                {services.map((s) => (
                  <option key={s.id} value={s.id}>
                    {s.name}
                  </option>
                ))}
              </select>
              <ParentMissingHint rows={services.length} kind="सेवा" />
            </>
          </FormField>
          <FormField label="Course" required>
            <>
              <select
                value={draft.courseId}
                onChange={(e) => patch({ courseId: e.target.value, postId: "" })}
                className="ap-input w-full"
              >
                <option value="">— कोर्स छान्नुहोस् —</option>
                {unknownOption(draft.courseId, serviceCourses)}
                {serviceCourses.map((c) => (
                  <option key={c.id} value={c.id}>
                    {c.name}
                  </option>
                ))}
              </select>
              <ParentMissingHint rows={serviceCourses.length} kind="कोर्स" />
            </>
          </FormField>
          <FormField label="Post" required>
            <>
              <select
                value={draft.postId}
                onChange={(e) => patch({ postId: e.target.value })}
                className="ap-input w-full"
              >
                <option value="">— पद छान्नुहोस् —</option>
                {unknownOption(draft.postId, coursePosts)}
                {coursePosts.map((p) => (
                  <option key={p.id} value={p.id}>
                    {p.name}
                  </option>
                ))}
              </select>
              <ParentMissingHint rows={coursePosts.length} kind="पद" />
            </>
          </FormField>
        </div>

        <FormField label="Title" required>
          <input
            value={draft.title}
            onChange={(e) => patch({ title: e.target.value })}
            placeholder="e.g. Model Set 2081 — Set A"
            className="ap-input w-full"
          />
        </FormField>

        <FormField label="Description">
          <textarea
            value={draft.description ?? ""}
            onChange={(e) => patch({ description: e.target.value })}
            rows={2}
            className="ap-input w-full"
          />
        </FormField>

        <FormField label="Type" required>
          <div className="flex gap-5 pt-1">
            {(["pdf", "mcq"] as const).map((t) => (
              <label
                key={t}
                className="flex items-center gap-2 cursor-pointer text-sm text-gray-700 dark:text-gray-300"
              >
                <input
                  type="radio"
                  name="prep-model-set-type"
                  checked={draft.type === t}
                  onChange={() => patch({ type: t })}
                />
                {t === "pdf" ? "PDF" : "MCQ"}
              </label>
            ))}
          </div>
        </FormField>

        {draft.type === "pdf" ? (
          <>
            <FileUrlField
              label="PDF File URL"
              required
              value={draft.fileUrl ?? ""}
              onChange={(fileUrl) => patch({ fileUrl })}
              folder="model-sets"
              accept=".pdf,application/pdf"
            />
            <Toggle
              checked={draft.allowDownload ?? true}
              onChange={(allowDownload) => patch({ allowDownload })}
              onLabel="डाउनलोड गर्न दिनुहोस्"
              offLabel="डाउनलोड बन्द (अनलाइन मात्र)"
            />
          </>
        ) : (
          <div className="border border-gray-200 dark:border-gray-700 rounded-xl p-4">
            <div className="flex items-center justify-between mb-3">
              <p className="text-xs font-bold uppercase tracking-wider text-gray-500">
                प्रश्नहरू ({questions.length})
              </p>
              <button
                type="button"
                onClick={addQuestion}
                className="text-xs font-bold text-brand-red inline-flex items-center gap-1"
              >
                <Plus className="w-3.5 h-3.5" /> प्रश्न थप्नुहोस्
              </button>
            </div>

            {questions.length === 0 && (
              <p className="text-xs text-gray-400">
                कम्तीमा एउटा प्रश्न थप्नुहोस् — MCQ टेस्ट चलाउन प्रश्न आवश्यक छ।
              </p>
            )}

            <div className="space-y-4">
              {questions.map((q, idx) => (
                <div
                  key={q.id}
                  className="rounded-lg border border-gray-200 dark:border-gray-700 p-3 bg-gray-50/60 dark:bg-slate-900/40"
                >
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-xs font-bold uppercase tracking-wider text-gray-500">
                      प्रश्न {idx + 1}
                    </span>
                    <button
                      type="button"
                      onClick={() => removeQuestion(idx)}
                      className="text-red-500 hover:text-red-700 text-xs font-bold inline-flex items-center gap-1"
                    >
                      <Trash2 className="w-3.5 h-3.5" /> हटाउनुहोस्
                    </button>
                  </div>

                  <textarea
                    value={q.text}
                    onChange={(e) => updateQuestion(idx, { text: e.target.value })}
                    rows={2}
                    placeholder="प्रश्न लेख्नुहोस्..."
                    className="ap-input w-full mb-3"
                  />

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                    {q.options.map((opt, oIdx) => (
                      <div key={oIdx} className="flex items-center gap-2">
                        <span className="w-6 h-6 rounded-full bg-gray-200 dark:bg-gray-700 text-[11px] font-bold flex items-center justify-center shrink-0 text-gray-700 dark:text-gray-200">
                          {ABCD[oIdx]}
                        </span>
                        <input
                          value={opt}
                          onChange={(e) => updateOption(idx, oIdx, e.target.value)}
                          placeholder={`विकल्प ${ABCD[oIdx]}`}
                          className="ap-input w-full"
                        />
                      </div>
                    ))}
                  </div>

                  <div className="flex items-center gap-3 mt-3">
                    <label className="text-xs font-bold uppercase tracking-wider text-gray-500">
                      सही उत्तर
                    </label>
                    <select
                      value={q.correctIndex}
                      onChange={(e) => updateQuestion(idx, { correctIndex: toNum(e.target.value) })}
                      className="ap-input w-auto"
                    >
                      <option value={-1}>— छान्नुहोस् —</option>
                      {ABCD.map((l, i) => (
                        <option key={l} value={i}>
                          {l}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        <div className="flex flex-wrap items-center justify-between gap-4">
          <FormField label="Sort Order">
            <input
              type="number"
              value={draft.sortOrder}
              onChange={(e) => patch({ sortOrder: toNum(e.target.value) })}
              className="ap-input w-full"
            />
          </FormField>
          <div className="flex items-center gap-3">
            <PublishedChip isPublished={draft.isPublished === true} />
            <Toggle
              checked={draft.isPublished === true}
              onChange={(isPublished) => patch({ isPublished })}
              onLabel="प्रकाशित — सार्वजनिक पोर्टलमा देखिन्छ"
              offLabel="ड्राफ्ट — सार्वजनिक पोर्टलमा देखिन्छैन"
            />
          </div>
        </div>
      </div>
      <FormFooter saving={saving} onSave={submit} onClose={onClose} saveLabel="Save Model Set" />
    </Modal>
  );
}
