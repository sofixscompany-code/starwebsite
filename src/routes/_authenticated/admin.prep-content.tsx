/** Admin: Preparation Portal content manager (services/courses/posts/notes/model sets). */
import { useMemo, useState, type ReactNode } from "react";
import { toast } from "sonner";
import {
  BookOpen,
  ClipboardCheck,
  DownloadCloud,
  FileText,
  Loader2,
  Pencil,
  Plus,
  RefreshCw,
  ScrollText,
  Shield,
  Trash2,
} from "lucide-react";
import { PageHeader } from "@/components/admin/AdminShell";
import { Badge, EmptyState, SkeletonTable, Tabs } from "@/components/admin/ui";
import { ActiveChip, PublishedChip } from "@/components/admin/prep/prep-fields";
import {
  bySort,
  deletePrepRow,
  isBundledRow,
  savePrepRow,
} from "@/components/admin/prep/prep-shared";
import {
  CourseForm,
  ModelSetForm,
  NoteForm,
  PostForm,
  ServiceForm,
} from "@/components/admin/prep/prep-forms";
import { getPrepIcon } from "@/components/prep/prep-icons";
import { seedPrepDefaults, usePrepCatalog, usePrepRefresh } from "@/hooks/use-prep-data";
import {
  PREP_COLLECTIONS,
  type PrepCollection,
  type PrepCourse,
  type PrepModelSet,
  type PrepNote,
  type PrepPost,
  type PrepService,
} from "@/lib/prep/types";
import { usePageMeta } from "@/lib/seo";

/* ── which form is open (row = null → create) ─────────── */
type EditTarget =
  | { kind: "service"; row: PrepService | null }
  | { kind: "course"; row: PrepCourse | null }
  | { kind: "post"; row: PrepPost | null }
  | { kind: "note"; row: PrepNote | null }
  | { kind: "modelSet"; row: PrepModelSet | null };

const SHELL =
  "bg-white dark:bg-gray-800 rounded-2xl border border-gray-200 dark:border-gray-700 shadow-sm overflow-hidden";
const HEAD_ROW =
  "border-b border-gray-200 dark:border-gray-700 text-xs uppercase tracking-wider text-gray-500";
const BODY_ROW =
  "border-b border-gray-100 dark:border-gray-800 hover:bg-gray-50/60 dark:hover:bg-slate-800/50 transition align-top";
const TH = "px-4 py-3 text-left";
const TD = "px-4 py-3";

function RowActions({ onEdit, onDelete }: { onEdit: () => void; onDelete: () => void }) {
  return (
    <div className="flex items-center gap-1 justify-end">
      <button
        type="button"
        onClick={onEdit}
        className="p-1.5 rounded-lg hover:bg-gray-100 dark:hover:bg-slate-700"
        title="Edit"
      >
        <Pencil className="w-4 h-4 text-gray-500" />
      </button>
      <button
        type="button"
        onClick={onDelete}
        className="p-1.5 rounded-lg hover:bg-red-50 dark:hover:bg-red-900/20"
        title="Delete"
      >
        <Trash2 className="w-4 h-4 text-red-500" />
      </button>
    </div>
  );
}

/** Toolbar above every list: row count + "नयाँ थप्नुहोस्". */
function TabToolbar({ count, noun, onAdd }: { count: number; noun: string; onAdd: () => void }) {
  return (
    <div className="flex flex-wrap items-center justify-between gap-3 mb-4">
      <p className="text-sm text-gray-500 dark:text-gray-400">
        कुल <span className="font-semibold text-gray-800 dark:text-gray-200">{count}</span> {noun}
      </p>
      <button type="button" onClick={onAdd} className="ap-btn">
        <Plus className="w-4 h-4" /> नयाँ थप्नुहोस्
      </button>
    </div>
  );
}

/** Loading skeleton / honest empty state / table shell. */
function ListCard({
  isLoading,
  isEmpty,
  icon,
  emptyTitle,
  emptyDesc,
  onAdd,
  children,
}: {
  isLoading: boolean;
  isEmpty: boolean;
  icon: React.ComponentType<{ className?: string }>;
  emptyTitle: string;
  emptyDesc: string;
  onAdd: () => void;
  children: ReactNode;
}) {
  if (isLoading) return <SkeletonTable rows={5} />;
  if (isEmpty) {
    return (
      <div className={SHELL}>
        <EmptyState
          icon={icon}
          title={emptyTitle}
          desc={emptyDesc}
          action={{ label: "नयाँ थप्नुहोस्", onClick: onAdd }}
        />
      </div>
    );
  }
  return <div className={SHELL}>{children}</div>;
}

export function PrepContentPage() {
  usePageMeta({ title: "Preparation Content" });

  const catalog = usePrepCatalog({ admin: true });
  const refresh = usePrepRefresh();

  const services = useMemo(() => bySort(catalog.services), [catalog.services]);
  const courses = useMemo(() => bySort(catalog.courses), [catalog.courses]);
  const posts = useMemo(() => bySort(catalog.posts), [catalog.posts]);
  const notes = useMemo(() => bySort(catalog.notes), [catalog.notes]);
  const modelSets = useMemo(() => bySort(catalog.modelSets), [catalog.modelSets]);

  const serviceById = useMemo(() => new Map(services.map((s) => [s.id, s.name])), [services]);
  const courseById = useMemo(() => new Map(courses.map((c) => [c.id, c.name])), [courses]);
  const postById = useMemo(() => new Map(posts.map((p) => [p.id, p.name])), [posts]);

  const [tab, setTab] = useState("services");
  const [editing, setEditing] = useState<EditTarget | null>(null);
  const [saving, setSaving] = useState(false);
  const [seeding, setSeeding] = useState(false);

  /* Bundled default rows = that collection is still empty in Firestore. */
  const needsSeed = useMemo(
    () =>
      services.some((s) => isBundledRow(PREP_COLLECTIONS.services, s.id)) ||
      courses.some((c) => isBundledRow(PREP_COLLECTIONS.courses, c.id)) ||
      posts.some((p) => isBundledRow(PREP_COLLECTIONS.posts, p.id)),
    [services, courses, posts],
  );

  const parentPath = (serviceId: string, courseId?: string, postId?: string): string => {
    const parts: string[] = [serviceById.get(serviceId) ?? "अज्ञात सेवा"];
    if (courseId) parts.push(courseById.get(courseId) ?? "अज्ञात कोर्स");
    if (postId) parts.push(postById.get(postId) ?? "अज्ञात पद");
    return parts.join(" › ");
  };

  /* ── persistence ── */
  async function saveRow<T extends { id?: string }>(
    collection: PrepCollection,
    payload: T,
    label: string,
  ): Promise<void> {
    setSaving(true);
    try {
      await savePrepRow(collection, payload);
      toast.success(`${label} saved.`);
      setEditing(null);
      refresh();
    } catch {
      toast.error("Save failed — check permissions.");
    } finally {
      setSaving(false);
    }
  }

  const handleDelete = async (
    collection: PrepCollection,
    id: string,
    name: string,
  ): Promise<void> => {
    if (!window.confirm(`"${name}" मेटाउने हो? यो कार्य फिर्ता हुँदैन।`)) return;
    try {
      const deleted = await deletePrepRow(collection, id);
      if (!deleted) {
        toast.error(
          'यो बुन्डल गरिएको डिफल्ट डाटा हो — Firestore मा छैन। पहिले "डिफल्ट डाटा सिर्जना गर्नुहोस्" थिच्नुहोस्।',
        );
        return;
      }
      toast.success(`"${name}" deleted.`);
      refresh();
    } catch {
      toast.error("Delete failed — check permissions.");
    }
  };

  const handleSeed = async (): Promise<void> => {
    if (
      !window.confirm("डिफल्ट डाटा सिर्जना गर्ने हो? पहिलेदेखि भएका डकुमेन्टसँग दोब्बर हुन सक्छ।")
    ) {
      return;
    }
    setSeeding(true);
    try {
      const count = await seedPrepDefaults();
      toast.success(`डिफल्ट डाटा ${count} वटा Firestore मा सिर्जना भयो।`);
      refresh();
    } catch {
      toast.error("Seeding failed — check permissions.");
    } finally {
      setSeeding(false);
    }
  };

  const openCreate = (kind: EditTarget["kind"]) => setEditing({ kind, row: null } as EditTarget);

  const tabs = [
    { label: "सेवा", value: "services", badge: services.length },
    { label: "कोर्स", value: "courses", badge: courses.length },
    { label: "पद", value: "posts", badge: posts.length },
    { label: "Notes", value: "notes", badge: notes.length },
    { label: "Model Set", value: "model-sets", badge: modelSets.length },
  ];

  return (
    <div>
      <PageHeader
        title="Preparation Content"
        subtitle="तयारी पोर्टलको सेवा, कोर्स, पद, Notes र Model Set — परिवर्तन सार्वजनिक पोर्टलमा तुरुन्तै देखिन्छ।"
        actions={
          <div className="flex flex-wrap gap-2">
            <button
              type="button"
              onClick={() => refresh()}
              className="ap-btn-ghost"
              title="Firestore बाट फेरि पढ्नुहोस्"
            >
              <RefreshCw className="w-4 h-4" /> रिफ्रेस
            </button>
            {needsSeed && (
              <button
                type="button"
                onClick={() => void handleSeed()}
                disabled={seeding}
                className="ap-btn-ghost"
                title="बुन्डल गरिएको डिफल्ट क्याटालग Firestore मा लेख्नुहोस्"
              >
                {seeding ? (
                  <Loader2 className="w-4 h-4 animate-spin" />
                ) : (
                  <DownloadCloud className="w-4 h-4" />
                )}
                डिफल्ट डाटा सिर्जना गर्नुहोस्
              </button>
            )}
          </div>
        }
      />

      {needsSeed && !catalog.isLoading && (
        <div className="mb-5 rounded-xl border border-blue-200 bg-blue-50 dark:bg-blue-900/20 dark:border-blue-800 px-4 py-3 text-sm text-blue-800 dark:text-blue-200">
          <strong>बुन्डल गरिएको डिफल्ट क्याटालग देखिँदैछ</strong> — सेवा/कोर्स/पद अझै Firestore मा
          सुरक्षित छैनन्। <em>डिफल्ट डाटा सिर्जना गर्नुहोस्</em> थिचेर डिफल्ट क्याटालग लेख्नुहोस्,
          त्यसपछि सम्पादन गर्नुहोस्।
        </div>
      )}

      <div className="mb-6">
        <Tabs tabs={tabs} value={tab} onChange={setTab} />
      </div>

      {/* ── सेवा ── */}
      {tab === "services" && (
        <section>
          <TabToolbar count={services.length} noun="सेवा" onAdd={() => openCreate("service")} />
          <ListCard
            isLoading={catalog.isLoading}
            isEmpty={services.length === 0}
            icon={Shield}
            emptyTitle="कुनै सेवा छैन"
            emptyDesc="अहिलेसम्म तयारी पोर्टलमा कुनै सेवा छैन। डिफल्ट डाटा सिर्जना गर्नुहोस् वा नयाँ सेवा थप्नुहोस्।"
            onAdd={() => openCreate("service")}
          >
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className={HEAD_ROW}>
                    <th className={TH}>सेवा</th>
                    <th className={TH}>आइकन / रङ</th>
                    <th className={`${TH} text-center`}>क्रम</th>
                    <th className={`${TH} text-center`}>स्थिति</th>
                    <th className={`${TH} text-right w-32`}>कार्य</th>
                  </tr>
                </thead>
                <tbody>
                  {services.map((s) => {
                    const Icon = getPrepIcon(s.icon);
                    return (
                      <tr key={s.id} className={BODY_ROW}>
                        <td className={TD}>
                          <p className="font-semibold text-gray-900 dark:text-white">{s.name}</p>
                          <p className="text-xs text-gray-500 mt-0.5">/{s.slug}</p>
                          {s.description && (
                            <p className="text-xs text-gray-400 mt-0.5">{s.description}</p>
                          )}
                        </td>
                        <td className={TD}>
                          <div className="flex items-center gap-2">
                            <span
                              className={`w-8 h-8 rounded-lg shrink-0 bg-gradient-to-br ${s.color} flex items-center justify-center`}
                            >
                              <Icon className="w-4 h-4 text-white" />
                            </span>
                            <span className="text-xs text-gray-500">{s.icon}</span>
                          </div>
                        </td>
                        <td className={`${TD} text-center tabular-nums`}>{s.sortOrder}</td>
                        <td className={`${TD} text-center`}>
                          <ActiveChip isActive={s.isActive !== false} />
                        </td>
                        <td className={TD}>
                          <RowActions
                            onEdit={() => setEditing({ kind: "service", row: s })}
                            onDelete={() =>
                              void handleDelete(PREP_COLLECTIONS.services, s.id, s.name)
                            }
                          />
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </ListCard>
        </section>
      )}

      {/* ── कोर्स ── */}
      {tab === "courses" && (
        <section>
          <TabToolbar count={courses.length} noun="कोर्स" onAdd={() => openCreate("course")} />
          <ListCard
            isLoading={catalog.isLoading}
            isEmpty={courses.length === 0}
            icon={BookOpen}
            emptyTitle="कुनै कोर्स छैन"
            emptyDesc="सेवा भित्र कुनै कोर्स/समूह छैन। नयाँ कोर्स थप्नुहोस् वा डिफल्ट डाटा सिर्जना गर्नुहोस्।"
            onAdd={() => openCreate("course")}
          >
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className={HEAD_ROW}>
                    <th className={TH}>कोर्स</th>
                    <th className={TH}>सेवा</th>
                    <th className={`${TH} text-center`}>क्रम</th>
                    <th className={`${TH} text-center`}>स्थिति</th>
                    <th className={`${TH} text-right w-32`}>कार्य</th>
                  </tr>
                </thead>
                <tbody>
                  {courses.map((c) => (
                    <tr key={c.id} className={BODY_ROW}>
                      <td className={TD}>
                        <p className="font-semibold text-gray-900 dark:text-white">{c.name}</p>
                        <p className="text-xs text-gray-500 mt-0.5">/{c.slug}</p>
                        {c.description && (
                          <p className="text-xs text-gray-400 mt-0.5">{c.description}</p>
                        )}
                      </td>
                      <td className={`${TD} text-gray-600 dark:text-gray-300`}>
                        {serviceById.get(c.serviceId) ?? (
                          <span className="text-gray-400">अज्ञात सेवा</span>
                        )}
                      </td>
                      <td className={`${TD} text-center tabular-nums`}>{c.sortOrder}</td>
                      <td className={`${TD} text-center`}>
                        <ActiveChip isActive={c.isActive !== false} />
                      </td>
                      <td className={TD}>
                        <RowActions
                          onEdit={() => setEditing({ kind: "course", row: c })}
                          onDelete={() => void handleDelete(PREP_COLLECTIONS.courses, c.id, c.name)}
                        />
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </ListCard>
        </section>
      )}

      {/* ── पद ── */}
      {tab === "posts" && (
        <section>
          <TabToolbar count={posts.length} noun="पद" onAdd={() => openCreate("post")} />
          <ListCard
            isLoading={catalog.isLoading}
            isEmpty={posts.length === 0}
            icon={ClipboardCheck}
            emptyTitle="कुनै पद छैन"
            emptyDesc="सेवा र कोर्स छानेर नयाँ पद (र्‍याङ्क) थप्नुहोस् वा डिफल्ट डाटा सिर्जना गर्नुहोस्।"
            onAdd={() => openCreate("post")}
          >
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className={HEAD_ROW}>
                    <th className={TH}>पद</th>
                    <th className={TH}>सेवा › कोर्स</th>
                    <th className={TH}>आधिकारिक पाठ्यक्रम URL</th>
                    <th className={`${TH} text-center`}>क्रम</th>
                    <th className={`${TH} text-center`}>स्थिति</th>
                    <th className={`${TH} text-right w-32`}>कार्य</th>
                  </tr>
                </thead>
                <tbody>
                  {posts.map((p) => (
                    <tr key={p.id} className={BODY_ROW}>
                      <td className={TD}>
                        <p className="font-semibold text-gray-900 dark:text-white">{p.name}</p>
                        <p className="text-xs text-gray-500 mt-0.5">/{p.slug}</p>
                        {p.description && (
                          <p className="text-xs text-gray-400 mt-0.5">{p.description}</p>
                        )}
                      </td>
                      <td className={`${TD} text-gray-600 dark:text-gray-300`}>
                        {parentPath(p.serviceId, p.courseId)}
                      </td>
                      <td className={TD}>
                        <div className="flex flex-col gap-1 items-start">
                          {p.syllabusUrl ? (
                            <a
                              href={p.syllabusUrl}
                              target="_blank"
                              rel="noreferrer"
                              className="text-xs font-semibold text-brand-red underline break-all"
                            >
                              पाठ्यक्रम पृष्ठ
                            </a>
                          ) : (
                            <span className="text-xs text-gray-400">पाठ्यक्रम URL छैन</span>
                          )}
                          {p.syllabusIndexUrl && (
                            <a
                              href={p.syllabusIndexUrl}
                              target="_blank"
                              rel="noreferrer"
                              className="text-xs font-semibold text-brand-red underline break-all"
                            >
                              पाठ्यक्रम सूची
                            </a>
                          )}
                          {p.syllabusUpdatedAt && (
                            <span className="text-[11px] text-gray-400">
                              अद्यावधिक: {p.syllabusUpdatedAt}
                            </span>
                          )}
                        </div>
                      </td>
                      <td className={`${TD} text-center tabular-nums`}>{p.sortOrder}</td>
                      <td className={`${TD} text-center`}>
                        <ActiveChip isActive={p.isActive !== false} />
                      </td>
                      <td className={TD}>
                        <RowActions
                          onEdit={() => setEditing({ kind: "post", row: p })}
                          onDelete={() => void handleDelete(PREP_COLLECTIONS.posts, p.id, p.name)}
                        />
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </ListCard>
        </section>
      )}

      {/* ── Notes ── */}
      {tab === "notes" && (
        <section>
          <TabToolbar count={notes.length} noun="Notes" onAdd={() => openCreate("note")} />
          <ListCard
            isLoading={catalog.isLoading}
            isEmpty={notes.length === 0}
            icon={FileText}
            emptyTitle="कुनै Notes छैन"
            emptyDesc="अहिलेसम्म कुनै अध्ययन सामग्री (Note) थपिएको छैन। नयाँ Note थप्नुहोस्।"
            onAdd={() => openCreate("note")}
          >
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className={HEAD_ROW}>
                    <th className={TH}>शीर्षक</th>
                    <th className={TH}>सेवा › कोर्स › पद</th>
                    <th className={TH}>फाइल</th>
                    <th className={`${TH} text-center`}>क्रम</th>
                    <th className={`${TH} text-center`}>स्थिति</th>
                    <th className={`${TH} text-right w-32`}>कार्य</th>
                  </tr>
                </thead>
                <tbody>
                  {notes.map((n) => (
                    <tr key={n.id} className={BODY_ROW}>
                      <td className={TD}>
                        <p className="font-semibold text-gray-900 dark:text-white">{n.title}</p>
                        {n.subject && (
                          <p className="text-xs text-brand-red font-semibold mt-0.5">{n.subject}</p>
                        )}
                        {n.description && (
                          <p className="text-xs text-gray-400 mt-0.5">{n.description}</p>
                        )}
                      </td>
                      <td className={`${TD} text-gray-600 dark:text-gray-300`}>
                        {parentPath(n.serviceId, n.courseId, n.postId)}
                      </td>
                      <td className={TD}>
                        <div className="flex flex-col gap-1 items-start">
                          {n.fileUrl ? (
                            <a
                              href={n.fileUrl}
                              target="_blank"
                              rel="noreferrer"
                              className="text-xs font-semibold text-brand-red underline break-all"
                            >
                              फाइल खोल्नुहोस्
                            </a>
                          ) : (
                            <span className="text-xs text-gray-400">URL छैन</span>
                          )}
                          {n.allowDownload === false && <Badge tone="muted">डाउनलोड बन्द</Badge>}
                        </div>
                      </td>
                      <td className={`${TD} text-center tabular-nums`}>{n.sortOrder}</td>
                      <td className={`${TD} text-center`}>
                        <PublishedChip isPublished={n.isPublished === true} />
                      </td>
                      <td className={TD}>
                        <RowActions
                          onEdit={() => setEditing({ kind: "note", row: n })}
                          onDelete={() => void handleDelete(PREP_COLLECTIONS.notes, n.id, n.title)}
                        />
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </ListCard>
        </section>
      )}

      {/* ── Model Set ── */}
      {tab === "model-sets" && (
        <section>
          <TabToolbar
            count={modelSets.length}
            noun="Model Set"
            onAdd={() => openCreate("modelSet")}
          />
          <ListCard
            isLoading={catalog.isLoading}
            isEmpty={modelSets.length === 0}
            icon={ScrollText}
            emptyTitle="कुनै Model Set छैन"
            emptyDesc="अहिलेसम्म कुनै Model Set (PDF / MCQ) थपिएको छैन। नयाँ Model Set थप्नुहोस्।"
            onAdd={() => openCreate("modelSet")}
          >
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className={HEAD_ROW}>
                    <th className={TH}>शीर्षक</th>
                    <th className={TH}>प्रकार</th>
                    <th className={TH}>सेवा › कोर्स › पद</th>
                    <th className={`${TH} text-center`}>क्रम</th>
                    <th className={`${TH} text-center`}>स्थिति</th>
                    <th className={`${TH} text-right w-32`}>कार्य</th>
                  </tr>
                </thead>
                <tbody>
                  {modelSets.map((m) => (
                    <tr key={m.id} className={BODY_ROW}>
                      <td className={TD}>
                        <p className="font-semibold text-gray-900 dark:text-white">{m.title}</p>
                        {m.description && (
                          <p className="text-xs text-gray-400 mt-0.5">{m.description}</p>
                        )}
                      </td>
                      <td className={TD}>
                        <Badge tone={m.type === "mcq" ? "info" : "muted"}>
                          {m.type === "mcq" ? "MCQ" : "PDF"}
                        </Badge>
                        <p className="text-xs text-gray-500 mt-1">
                          {m.type === "mcq"
                            ? `${m.questions?.length ?? 0} प्रश्न`
                            : m.fileUrl
                              ? "फाइल जडित"
                              : "फाइल छैन"}
                        </p>
                      </td>
                      <td className={`${TD} text-gray-600 dark:text-gray-300`}>
                        {parentPath(m.serviceId, m.courseId, m.postId)}
                      </td>
                      <td className={`${TD} text-center tabular-nums`}>{m.sortOrder}</td>
                      <td className={`${TD} text-center`}>
                        <PublishedChip isPublished={m.isPublished === true} />
                      </td>
                      <td className={TD}>
                        <RowActions
                          onEdit={() => setEditing({ kind: "modelSet", row: m })}
                          onDelete={() =>
                            void handleDelete(PREP_COLLECTIONS.modelSets, m.id, m.title)
                          }
                        />
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </ListCard>
        </section>
      )}

      {/* ── CREATE / EDIT FORMS (one mounted at a time) ── */}
      {editing?.kind === "service" && (
        <ServiceForm
          key={editing.row?.id ?? "new-service"}
          initial={editing.row}
          saving={saving}
          onClose={() => setEditing(null)}
          onSubmit={(payload) => void saveRow(PREP_COLLECTIONS.services, payload, "Service")}
        />
      )}
      {editing?.kind === "course" && (
        <CourseForm
          key={editing.row?.id ?? "new-course"}
          initial={editing.row}
          services={services}
          saving={saving}
          onClose={() => setEditing(null)}
          onSubmit={(payload) => void saveRow(PREP_COLLECTIONS.courses, payload, "Course")}
        />
      )}
      {editing?.kind === "post" && (
        <PostForm
          key={editing.row?.id ?? "new-post"}
          initial={editing.row}
          services={services}
          courses={courses}
          saving={saving}
          onClose={() => setEditing(null)}
          onSubmit={(payload) => void saveRow(PREP_COLLECTIONS.posts, payload, "Post")}
        />
      )}
      {editing?.kind === "note" && (
        <NoteForm
          key={editing.row?.id ?? "new-note"}
          initial={editing.row}
          services={services}
          courses={courses}
          posts={posts}
          saving={saving}
          onClose={() => setEditing(null)}
          onSubmit={(payload) => void saveRow(PREP_COLLECTIONS.notes, payload, "Note")}
        />
      )}
      {editing?.kind === "modelSet" && (
        <ModelSetForm
          key={editing.row?.id ?? "new-model-set"}
          initial={editing.row}
          services={services}
          courses={courses}
          posts={posts}
          saving={saving}
          onClose={() => setEditing(null)}
          onSubmit={(payload) => void saveRow(PREP_COLLECTIONS.modelSets, payload, "Model Set")}
        />
      )}
    </div>
  );
}
