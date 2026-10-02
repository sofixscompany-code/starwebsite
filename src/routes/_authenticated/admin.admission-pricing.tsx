import { useMemo, useState } from "react";
import { useQueryClient } from "@tanstack/react-query";
import { PageHeader } from "@/components/admin/AdminShell";
import { Badge, Modal, SkeletonTable, EmptyState } from "@/components/admin/ui";
import { toast } from "sonner";
import {
  Plus,
  Pencil,
  Trash2,
  Save,
  Loader2,
  IndianRupee,
  Package,
  BookOpen,
  Power,
  DownloadCloud,
  X,
} from "lucide-react";
import {
  useAdmissionCoursesRaw,
  seedDefaultAdmissionCourses,
  saveAdmissionCourse,
  deleteAdmissionCourse,
} from "@/hooks/use-admission-courses";
import { DEFAULT_ADMISSION_COURSES, packageTotal } from "@/lib/admission-form/defaults";
import { ORGANIZATIONS, POSTS } from "@/lib/admission-form/types";
import type { AdmissionCourse, AdmissionCoursePackage } from "@/lib/admission-form/types";

/* ── Editable form shapes ─────────────────────────────── */
type CourseDraft = {
  id: string;
  organization: string;
  post: string;
  name: string;
  description: string;
  duration: string;
  active: boolean;
  packages: AdmissionCoursePackage[];
  createdAt?: number;
};

const blankPackage = (): AdmissionCoursePackage => ({
  id: `pkg-${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 6)}`,
  name: "",
  duration: "",
  admissionFee: 0,
  tuitionFee: 0,
  examFee: 0,
  physicalFee: 0,
  additionalFee: 0,
  totalFee: 0,
  active: true,
});

const blankCourse = (): CourseDraft => ({
  id: `course-${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 6)}`,
  organization: "",
  post: "",
  name: "",
  description: "",
  duration: "",
  active: true,
  packages: [blankPackage()],
});

function toDraft(c: AdmissionCourse): CourseDraft {
  return {
    id: c.id,
    organization: c.organization ?? "",
    post: c.post ?? "",
    name: c.name ?? "",
    description: c.description ?? "",
    duration: c.duration ?? "",
    active: c.active !== false,
    packages: (c.packages ?? []).map((p) => ({ ...p })),
    createdAt: c.createdAt,
  };
}

const rs = (n: number) => `Rs. ${Number(n || 0).toLocaleString("en-IN")}`;

function FormField({
  label,
  required,
  hint,
  children,
}: {
  label: string;
  required?: boolean;
  hint?: string;
  children: React.ReactNode;
}) {
  return (
    <div>
      <label className="text-xs font-bold uppercase tracking-wider text-gray-500 dark:text-gray-400 mb-1 block">
        {label}
        {required && <span className="text-red-500 ml-0.5">*</span>}
      </label>
      {children}
      {hint && <p className="text-[11px] text-gray-400 mt-1">{hint}</p>}
    </div>
  );
}

/* ================================================================ */
/*  COURSES & PRICING (Admission)                                   */
/* ================================================================ */

export function AdmissionPricingPage() {
  const qc = useQueryClient();
  const { data: storedRows = [], isLoading } = useAdmissionCoursesRaw();
  const usingDefaults = storedRows.length === 0;
  const rows = usingDefaults ? DEFAULT_ADMISSION_COURSES : storedRows;

  const [formOpen, setFormOpen] = useState(false);
  const [draft, setDraft] = useState<CourseDraft | null>(null);
  const [saving, setSaving] = useState(false);
  const [confirmId, setConfirmId] = useState<string | null>(null);
  const [seeding, setSeeding] = useState(false);
  const [search, setSearch] = useState("");

  const refresh = () => {
    qc.invalidateQueries({ queryKey: ["admission-courses"] });
  };

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();
    if (!q) return rows;
    return rows.filter(
      (c) =>
        c.name?.toLowerCase().includes(q) ||
        c.post?.toLowerCase().includes(q) ||
        c.organization?.toLowerCase().includes(q) ||
        c.packages?.some((p) => p.name?.toLowerCase().includes(q)),
    );
  }, [rows, search]);

  const activeCount = rows.filter((c) => c.active !== false).length;
  const packageCount = rows.reduce((n, c) => n + (c.packages?.length ?? 0), 0);
  const totals = rows.flatMap((c) => (c.packages ?? []).map((p) => p.totalFee || 0));
  const minTotal = totals.length ? Math.min(...totals) : 0;
  const maxTotal = totals.length ? Math.max(...totals) : 0;

  /* ── seed ── */
  const handleSeed = async () => {
    if (!confirm("Write the built-in default pricing tables into Firestore?")) return;
    setSeeding(true);
    try {
      const n = await seedDefaultAdmissionCourses();
      toast.success(`Seeded ${n} default courses with printed-fee-table pricing.`);
      refresh();
    } catch {
      toast.error("Seeding failed — check permissions.");
    } finally {
      setSeeding(false);
    }
  };

  /* ── create / edit ── */
  const openCreate = () => {
    setDraft(blankCourse());
    setFormOpen(true);
  };

  const openEdit = (c: AdmissionCourse) => {
    setDraft(toDraft(c));
    setFormOpen(true);
  };

  const setPkg = (idx: number, patch: Partial<AdmissionCoursePackage>) => {
    setDraft((d) => {
      if (!d) return d;
      const packages = d.packages.map((p, i) => {
        if (i !== idx) return p;
        const next = { ...p, ...patch };
        next.totalFee = packageTotal(next);
        return next;
      });
      return { ...d, packages };
    });
  };

  const handleSubmit = async () => {
    if (!draft) return;
    if (!draft.name.trim()) return toast.error("Course / Class name is required.");
    if (draft.packages.length === 0) return toast.error("Add at least one package.");
    for (const p of draft.packages) {
      if (!p.name.trim()) return toast.error("Every package needs a name.");
      if (p.totalFee <= 0) return toast.error(`Package "${p.name}" must have a total fee > 0.`);
    }
    setSaving(true);
    try {
      // Saving from the built-in default state: persist ALL defaults first so
      // the edited course doesn't become the only document in the collection.
      if (usingDefaults) {
        for (const c of DEFAULT_ADMISSION_COURSES) {
          await saveAdmissionCourse(c);
        }
      }
      const payload: AdmissionCourse = {
        id: draft.id,
        organization: (draft.organization || "") as AdmissionCourse["organization"],
        post: (draft.post || "") as AdmissionCourse["post"],
        name: draft.name.trim(),
        description: draft.description.trim(),
        duration: draft.duration.trim(),
        active: draft.active,
        packages: draft.packages.map((p) => ({
          ...p,
          name: p.name.trim(),
          totalFee: packageTotal(p),
        })),
        createdAt: draft.createdAt ?? Date.now(),
      };
      await saveAdmissionCourse(payload);
      toast.success(`"${payload.name}" saved. Live pricing updated on the admission form.`);
      refresh();
      setFormOpen(false);
      setDraft(null);
    } catch {
      toast.error("Save failed — check permissions.");
    } finally {
      setSaving(false);
    }
  };

  const handleToggleActive = async (c: AdmissionCourse) => {
    try {
      await saveAdmissionCourse({ ...c, active: c.active === false, updatedAt: Date.now() });
      toast.success(c.active === false ? `"${c.name}" activated` : `"${c.name}" deactivated`);
      refresh();
    } catch {
      toast.error("Update failed");
    }
  };

  const handleDelete = async () => {
    if (!confirmId) return;
    try {
      await deleteAdmissionCourse(confirmId);
      toast.success("Course deleted");
      refresh();
    } catch {
      toast.error("Delete failed");
    }
    setConfirmId(null);
  };

  /* ── render ── */
  return (
    <div>
      <PageHeader
        title="Courses & Pricing"
        subtitle="Admission Class/Course/Package/fee structure — changes go live on the /admission form immediately. Already-submitted applications keep their own pricing snapshot."
        actions={
          <div className="flex flex-wrap gap-2">
            <button
              onClick={handleSeed}
              disabled={seeding}
              className="ap-btn-ghost inline-flex items-center gap-1.5"
              title="Write the built-in default pricing (printed fee tables) to Firestore"
            >
              {seeding ? (
                <Loader2 className="w-4 h-4 animate-spin" />
              ) : (
                <DownloadCloud className="w-4 h-4" />
              )}
              Seed Defaults
            </button>
            <button onClick={openCreate} className="ap-btn inline-flex items-center gap-1.5">
              <Plus className="w-4 h-4" /> Add Course
            </button>
          </div>
        }
      />

      {usingDefaults && !isLoading && (
        <div className="mb-5 rounded-xl border border-blue-200 bg-blue-50 dark:bg-blue-900/20 dark:border-blue-800 px-4 py-3 text-sm text-blue-800 dark:text-blue-200">
          <strong>Showing built-in default pricing</strong> (from the institute's printed fee
          tables). The <code>admission_courses</code> collection is empty — your first Save or{" "}
          <em>Seed Defaults</em> will store them in Firestore.
        </div>
      )}

      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
        {[
          { label: "Courses", value: rows.length, icon: BookOpen },
          { label: "Active", value: activeCount, icon: Power },
          { label: "Packages", value: packageCount, icon: Package },
          {
            label: "Fee Range",
            value: totals.length
              ? `${(minTotal / 1000).toFixed(1)}k–${(maxTotal / 1000).toFixed(1)}k`
              : "—",
            icon: IndianRupee,
          },
        ].map((s) => (
          <div
            key={s.label}
            className="bg-white dark:bg-gray-800 rounded-2xl border border-gray-200 dark:border-gray-700 p-4 flex items-center gap-3"
          >
            <span className="w-10 h-10 rounded-xl bg-brand-red/10 flex items-center justify-center shrink-0">
              <s.icon className="w-5 h-5 text-brand-red" />
            </span>
            <div>
              <p className="text-xl font-bold text-gray-900 dark:text-white">{s.value}</p>
              <p className="text-[10px] uppercase tracking-wider text-gray-500">{s.label}</p>
            </div>
          </div>
        ))}
      </div>

      {/* Search */}
      <div className="flex flex-col sm:flex-row gap-3 mb-4">
        <input
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Search course / post / package..."
          className="ap-input w-full sm:max-w-xs"
        />
      </div>

      {/* Course list */}
      <div className="bg-white dark:bg-gray-800 rounded-2xl border border-gray-200 dark:border-gray-700 shadow-sm overflow-hidden">
        {isLoading ? (
          <div className="p-5">
            <SkeletonTable rows={5} />
          </div>
        ) : filtered.length === 0 ? (
          <div className="p-6">
            <EmptyState
              icon={BookOpen}
              title="No courses match"
              desc="Add a course or seed the built-in default pricing."
              action={{ label: "Add Course", onClick: openCreate }}
            />
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-gray-200 dark:border-gray-700 text-xs uppercase tracking-wider text-gray-500">
                  <th className="px-4 py-3 text-left">Course / Class</th>
                  <th className="px-4 py-3 text-left">Org / Post</th>
                  <th className="px-4 py-3 text-left">Packages & Fees</th>
                  <th className="px-4 py-3 text-center">Active</th>
                  <th className="px-4 py-3 text-right w-32">Actions</th>
                </tr>
              </thead>
              <tbody>
                {filtered.map((c) => (
                  <tr
                    key={c.id}
                    className="border-b border-gray-100 dark:border-gray-800 hover:bg-gray-50/60 dark:hover:bg-slate-800/50 transition align-top"
                  >
                    <td className="px-4 py-3">
                      <p className="font-semibold text-gray-900 dark:text-white">{c.name}</p>
                      {c.description && (
                        <p className="text-xs text-brand-red font-semibold mt-0.5">
                          {c.description}
                        </p>
                      )}
                      {c.duration && <p className="text-xs text-gray-500 mt-0.5">{c.duration}</p>}
                    </td>
                    <td className="px-4 py-3 text-gray-600 dark:text-gray-300">
                      <p>{c.organization || "All organizations"}</p>
                      <p className="text-xs text-gray-500">{c.post || "All posts"}</p>
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex flex-col gap-1">
                        {(c.packages ?? []).map((p) => (
                          <div
                            key={p.id}
                            className="flex items-center gap-2 text-xs border border-gray-200 dark:border-gray-700 rounded-lg px-2 py-1"
                          >
                            <span className="font-semibold">{p.name}</span>
                            <span className="text-gray-400">· {p.duration}</span>
                            <span
                              className={`ml-auto font-bold tabular-nums ${
                                p.active === false ? "text-gray-400 line-through" : "text-brand-red"
                              }`}
                            >
                              {rs(p.totalFee)}
                            </span>
                          </div>
                        ))}
                        {(c.packages ?? []).length === 0 && (
                          <span className="text-xs text-gray-400">No packages</span>
                        )}
                      </div>
                    </td>
                    <td className="px-4 py-3 text-center">
                      <Badge tone={c.active === false ? "warning" : "success"}>
                        {c.active === false ? "inactive" : "active"}
                      </Badge>
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-1 justify-end">
                        <button
                          onClick={() => handleToggleActive(c)}
                          className="p-1.5 rounded-lg hover:bg-gray-100 dark:hover:bg-slate-700"
                          title={c.active === false ? "Activate" : "Deactivate"}
                        >
                          <Power className="w-4 h-4 text-gray-500" />
                        </button>
                        <button
                          onClick={() => openEdit(c)}
                          className="p-1.5 rounded-lg hover:bg-gray-100 dark:hover:bg-slate-700"
                          title="Edit"
                        >
                          <Pencil className="w-4 h-4 text-gray-500" />
                        </button>
                        <button
                          onClick={() => setConfirmId(c.id)}
                          className="p-1.5 rounded-lg hover:bg-red-50 dark:hover:bg-red-900/20"
                          title="Delete"
                        >
                          <Trash2 className="w-4 h-4 text-red-500" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* ── CREATE / EDIT MODAL ── */}
      <Modal
        open={formOpen && !!draft}
        onClose={() => {
          setFormOpen(false);
          setDraft(null);
        }}
        size="xl"
        title={
          draft && rows.some((r) => r.id === draft.id)
            ? "Edit Course & Pricing"
            : "Add Course & Pricing"
        }
      >
        {draft && (
          <div className="space-y-5">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <FormField label="Course / Class Name" required>
                <input
                  value={draft.name}
                  onChange={(e) => setDraft({ ...draft, name: e.target.value })}
                  placeholder="e.g. Inspector Preparation Course"
                  className="ap-input w-full"
                />
              </FormField>
              <FormField label="Duration" hint="Shown on the form, e.g. 3 Month / 1 Year">
                <input
                  value={draft.duration}
                  onChange={(e) => setDraft({ ...draft, duration: e.target.value })}
                  placeholder="3 Month / 1 Year"
                  className="ap-input w-full"
                />
              </FormField>
              <FormField
                label="Organization"
                hint="Applies when a candidate picks this organization"
              >
                <select
                  value={draft.organization}
                  onChange={(e) => setDraft({ ...draft, organization: e.target.value })}
                  className="ap-input w-full"
                >
                  <option value="">All organizations</option>
                  {ORGANIZATIONS.map((o) => (
                    <option key={o} value={o}>
                      {o}
                    </option>
                  ))}
                </select>
              </FormField>
              <FormField label="Post" hint="Applies when a candidate picks this post">
                <select
                  value={draft.post}
                  onChange={(e) => setDraft({ ...draft, post: e.target.value })}
                  className="ap-input w-full"
                >
                  <option value="">All posts</option>
                  {POSTS.map((p) => (
                    <option key={p} value={p}>
                      {p}
                    </option>
                  ))}
                </select>
              </FormField>
            </div>

            <FormField
              label="Printed Fee-Table Heading (Nepali)"
              hint="From the official printed fee sheet, e.g. दनरक्षकको शुल्क - २०२३/२०२४"
            >
              <input
                value={draft.description}
                onChange={(e) => setDraft({ ...draft, description: e.target.value })}
                className="ap-input w-full"
              />
            </FormField>

            <label className="flex items-center gap-2 cursor-pointer text-sm text-gray-700 dark:text-gray-300">
              <input
                type="checkbox"
                checked={draft.active}
                onChange={(e) => setDraft({ ...draft, active: e.target.checked })}
                className="rounded"
              />
              Active (visible on the admission form)
            </label>

            {/* ── Packages & fees ── */}
            <div className="border border-gray-200 dark:border-gray-700 rounded-xl p-4">
              <div className="flex items-center justify-between mb-3">
                <p className="text-xs font-bold uppercase tracking-wider text-gray-500">
                  Packages & Fee Breakdown
                </p>
                <button
                  type="button"
                  onClick={() =>
                    setDraft({ ...draft, packages: [...draft.packages, blankPackage()] })
                  }
                  className="text-xs font-bold text-brand-red inline-flex items-center gap-1"
                >
                  <Plus className="w-3.5 h-3.5" /> Add Package
                </button>
              </div>

              <div className="space-y-4">
                {draft.packages.map((p, idx) => (
                  <div
                    key={p.id}
                    className="rounded-lg border border-gray-200 dark:border-gray-700 p-3 bg-gray-50/60 dark:bg-slate-900/40"
                  >
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 mb-3">
                      <FormField label="Package Name" required>
                        <input
                          value={p.name}
                          onChange={(e) => setPkg(idx, { name: e.target.value })}
                          placeholder="Course Complete 3 Month"
                          className="ap-input w-full"
                        />
                      </FormField>
                      <FormField label="Duration">
                        <input
                          value={p.duration}
                          onChange={(e) => setPkg(idx, { duration: e.target.value })}
                          placeholder="3 Month"
                          className="ap-input w-full"
                        />
                      </FormField>
                      <FormField label="Active">
                        <label className="flex items-center gap-2 cursor-pointer text-sm pt-2">
                          <input
                            type="checkbox"
                            checked={p.active !== false}
                            onChange={(e) => setPkg(idx, { active: e.target.checked })}
                            className="rounded"
                          />
                          {p.active !== false ? "Visible" : "Hidden"}
                        </label>
                      </FormField>
                    </div>

                    <div className="grid grid-cols-2 sm:grid-cols-5 gap-3">
                      {(
                        [
                          ["admissionFee", "Admission Fee"],
                          ["tuitionFee", "Tuition Fee"],
                          ["examFee", "Exam Fee"],
                          ["physicalFee", "Physical Fee"],
                          ["additionalFee", "Additional Fee"],
                        ] as const
                      ).map(([key, label]) => (
                        <FormField key={key} label={label}>
                          <input
                            type="number"
                            min={0}
                            value={p[key]}
                            onChange={(e) =>
                              setPkg(idx, { [key]: Math.max(0, e.target.valueAsNumber || 0) })
                            }
                            className="ap-input w-full"
                          />
                        </FormField>
                      ))}
                    </div>

                    <div className="flex items-center justify-between mt-3 pt-3 border-t border-gray-200 dark:border-gray-700">
                      <span className="text-xs font-bold uppercase tracking-wider text-gray-500">
                        Total (auto)
                      </span>
                      <span className="font-extrabold text-brand-red tabular-nums">
                        {rs(p.totalFee)}
                      </span>
                      <button
                        type="button"
                        onClick={() =>
                          setDraft({
                            ...draft,
                            packages: draft.packages.filter((_, i) => i !== idx),
                          })
                        }
                        className="text-red-500 hover:text-red-700 text-xs font-bold inline-flex items-center gap-1"
                      >
                        <X className="w-3.5 h-3.5" /> Remove
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        <div className="flex justify-end gap-3 mt-6 pt-4 border-t border-gray-200 dark:border-slate-700">
          <button
            onClick={() => {
              setFormOpen(false);
              setDraft(null);
            }}
            className="ap-btn-ghost"
          >
            Cancel
          </button>
          <button onClick={handleSubmit} disabled={saving} className="ap-btn">
            {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
            Save Course
          </button>
        </div>
      </Modal>

      {/* ── DELETE CONFIRM ── */}
      <Modal open={!!confirmId} onClose={() => setConfirmId(null)} size="sm">
        <div className="text-center">
          <div className="w-14 h-14 rounded-full bg-red-50 dark:bg-red-900/20 flex items-center justify-center mx-auto mb-4">
            <Trash2 className="w-7 h-7 text-red-500" />
          </div>
          <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-1">Delete Course?</h3>
          <p className="text-sm text-gray-500 dark:text-gray-400 mb-6">
            This course will no longer appear on the admission form. Existing applications keep
            their saved pricing snapshot.
          </p>
          <div className="flex gap-3 justify-center">
            <button onClick={() => setConfirmId(null)} className="ap-btn-ghost px-6">
              Cancel
            </button>
            <button
              onClick={handleDelete}
              className="ap-btn bg-red-600 hover:bg-red-700 text-white px-6"
            >
              Delete
            </button>
          </div>
        </div>
      </Modal>
    </div>
  );
}
