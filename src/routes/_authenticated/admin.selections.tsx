import { useMemo, useState } from "react";
import { useModuleData } from "@/hooks/use-module-data";
import { PageHeader } from "@/components/admin/AdminShell";
import { ImageUpload } from "@/components/admin/image-upload";
import { GalleryPicker } from "@/components/admin/GalleryPicker";
import { Tabs, Modal, Badge, SkeletonTable, EmptyState } from "@/components/admin/ui";
import { toast } from "sonner";
import {
  Trophy,
  Plus,
  Pencil,
  Trash2,
  Eye,
  ArrowUpDown,
  ChevronUp,
  ChevronDown,
  Image,
  Loader2,
  Save,
  X,
  FileText,
} from "lucide-react";

/* ---- types ---- */
interface SelectionRecord {
  id: string;
  studentName?: string;
  name?: string;
  achievement?: string;
  post?: string;
  tag?: string;
  photoUrl?: string;
  examCategory?: string;
  rank?: string;
  batch?: string;
  year?: string;
  description?: string;
  order?: number | string;
  status?: string;
  featured?: boolean;
  createdAt?: string;
  updatedAt?: string;
  [k: string]: unknown;
}

interface SelectionForm {
  studentName: string;
  achievement: string;
  examCategory: string;
  rank: string;
  batch: string;
  year: string;
  description: string;
  photoUrl: string;
  order: number | string;
  status: string;
  featured: boolean;
  tag: string;
}

const EMPTY_FORM: SelectionForm = {
  studentName: "",
  achievement: "",
  examCategory: "",
  rank: "",
  batch: "",
  year: "",
  description: "",
  photoUrl: "",
  order: "",
  status: "published",
  featured: false,
  tag: "",
};

const STATUS_OPTIONS = [
  { value: "published", label: "Published" },
  { value: "draft", label: "Draft" },
];

const TAG_OPTIONS = [
  { value: "", label: "— None —" },
  { value: "Selected", label: "Selected" },
  { value: "Madhesh Province Topper", label: "Madhesh Province Topper" },
  { value: "Bagmati Province Topper", label: "Bagmati Province Topper" },
  { value: "Province Topper", label: "Province Topper" },
];

/* ---- helpers ---- */
function initials(name: string) {
  const parts = (name || "").trim().split(/\s+/).filter(Boolean);
  return (
    parts
      .map((p) => p[0])
      .slice(0, 2)
      .join("")
      .toUpperCase() || "ST"
  );
}

function rowName(r: SelectionRecord) {
  return r.studentName ?? r.name ?? "Student";
}
function rowPost(r: SelectionRecord) {
  return r.achievement ?? r.post ?? "Selected";
}

/* ================================================================ */
/*  RESULTS MANAGEMENT PAGE                                         */
/* ================================================================ */

export function SelectionsPage() {
  const { rows: rawRows, loading, create, update, remove } = useModuleData("selections");
  const rows = rawRows as SelectionRecord[];

  /* tabs & filters */
  const [tab, setTab] = useState<"all" | "published">("all");
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("__all__");

  /* form */
  const [formOpen, setFormOpen] = useState(false);
  const [editingRow, setEditingRow] = useState<SelectionRecord | null>(null);
  const [form, setForm] = useState<SelectionForm>(EMPTY_FORM);
  const [saving, setSaving] = useState(false);

  /* gallery picker */
  const [galleryOpen, setGalleryOpen] = useState(false);

  /* confirm delete */
  const [confirmId, setConfirmId] = useState<string | null>(null);
  const [confirmName, setConfirmName] = useState("");

  /* preview */
  const [previewRow, setPreviewRow] = useState<SelectionRecord | null>(null);

  /* ---- computed ---- */
  const sortedRows = useMemo(() => {
    const list = [...rows].sort((a, b) => {
      const oa = Number(a.order ?? 9999);
      const ob = Number(b.order ?? 9999);
      return oa - ob;
    });
    return list;
  }, [rows]);

  const publishedCount = useMemo(
    () => rows.filter((r) => (r.status ?? "published") === "published").length,
    [rows],
  );
  const draftCount = rows.length - publishedCount;
  const featuredCount = useMemo(() => rows.filter((r) => r.featured === true).length, [rows]);

  const filteredRows = useMemo(() => {
    let result = sortedRows;

    if (tab === "published")
      result = result.filter((r) => (r.status ?? "published") === "published");
    if (statusFilter !== "__all__")
      result = result.filter((r) => (r.status ?? "published") === statusFilter);

    if (search.trim()) {
      const q = search.toLowerCase();
      result = result.filter((r) => {
        const name = rowName(r).toLowerCase();
        const post = rowPost(r).toLowerCase();
        const tag = (r.tag ?? "").toLowerCase();
        const cat = (r.examCategory ?? "").toLowerCase();
        return name.includes(q) || post.includes(q) || tag.includes(q) || cat.includes(q);
      });
    }
    return result;
  }, [sortedRows, tab, statusFilter, search]);

  /* ---- form helpers ---- */
  const openCreate = () => {
    setEditingRow(null);
    setForm({ ...EMPTY_FORM });
    setFormOpen(true);
  };

  const openEdit = (row: SelectionRecord) => {
    setEditingRow(row);
    setForm({
      studentName: (row.studentName ?? row.name ?? "") as string,
      achievement: (row.achievement ?? row.post ?? "") as string,
      examCategory: (row.examCategory ?? "") as string,
      rank: (row.rank ?? "") as string,
      batch: (row.batch ?? "") as string,
      year: (row.year ?? "") as string,
      description: (row.description ?? "") as string,
      photoUrl: (row.photoUrl ?? "") as string,
      order: row.order != null ? row.order : "",
      status: (row.status ?? "published") as string,
      featured: !!row.featured,
      tag: (row.tag ?? "") as string,
    });
    setFormOpen(true);
  };

  const closeForm = () => {
    setFormOpen(false);
    setEditingRow(null);
  };

  const setField = (key: keyof SelectionForm, value: unknown) =>
    setForm((p) => ({ ...p, [key]: value }));

  /* ---- submit ---- */
  const handleSubmit = async () => {
    if (!form.studentName.trim()) return toast.error("Student Name is required");
    if (!form.achievement.trim()) return toast.error("Selection / Achievement is required");
    if (!form.photoUrl.trim()) return toast.error("Please attach a photo");
    setSaving(true);
    try {
      const payload = {
        studentName: form.studentName.trim(),
        achievement: form.achievement.trim(),
        examCategory: form.examCategory.trim(),
        rank: form.rank.trim(),
        batch: form.batch.trim(),
        year: form.year.trim(),
        description: form.description.trim(),
        photoUrl: form.photoUrl,
        order: form.order === "" ? 9999 : Number(form.order),
        status: form.status,
        featured: form.featured,
        tag: form.tag,
        /* legacy compat */
        name: form.studentName.trim(),
        post: form.achievement.trim(),
      };
      if (editingRow) {
        await update(editingRow.id, payload);
        toast.success("Result updated successfully");
      } else {
        await create({ ...payload, createdAt: new Date().toISOString() });
        toast.success("Result added successfully");
      }
      closeForm();
    } catch (err: unknown) {
      toast.error(err instanceof Error ? err.message : "Save failed");
    } finally {
      setSaving(false);
    }
  };

  /* ---- publish/unpublish ---- */
  const handlePublishToggle = async (row: SelectionRecord) => {
    const next = (row.status ?? "published") === "published" ? "draft" : "published";
    try {
      await update(row.id, {
        status: next,
        studentName: rowName(row),
        achievement: rowPost(row),
      });
      toast.success(next === "published" ? "Result published successfully" : "Result unpublished");
    } catch {
      toast.error("Failed to update status");
    }
  };

  /* ---- reorder ---- */
  const handleMove = async (row: SelectionRecord, dir: -1 | 1) => {
    const cur = Number(row.order ?? 9999);
    const next = cur + dir;
    try {
      await update(row.id, {
        order: next,
        studentName: rowName(row),
        achievement: rowPost(row),
      });
      toast.success("Order updated");
    } catch {
      toast.error("Failed to update order");
    }
  };

  /* ---- toggle featured ---- */
  const handleToggleFeatured = async (row: SelectionRecord) => {
    const next = !row.featured;
    try {
      await update(row.id, {
        featured: next,
        studentName: rowName(row),
        achievement: rowPost(row),
      });
      toast.success(next ? "Result featured successfully" : "Featured removed");
    } catch {
      toast.error("Failed to update featured status");
    }
  };

  /* ---- delete ---- */
  const handleDelete = async () => {
    if (!confirmId) return;
    try {
      await remove(confirmId);
      toast.success("Result deleted successfully");
    } catch {
      toast.error("Delete failed");
    }
    setConfirmId(null);
  };

  /* ---- render ---- */
  return (
    <div>
      <PageHeader
        title="Top Selections / Results"
        subtitle="Manage which student results appear on the homepage Top Selections section and public Results page"
        actions={
          <button onClick={openCreate} className="ap-btn">
            <Plus className="w-4 h-4" /> Add Result
          </button>
        }
      />

      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
        {[
          { label: "Total Results", value: rows.length, tone: "purple" },
          { label: "Published", value: publishedCount, tone: "success" },
          { label: "Drafts", value: draftCount, tone: "warning" },
          { label: "Featured", value: featuredCount, tone: "info" },
        ].map((s) => (
          <div
            key={s.label}
            className="bg-white dark:bg-gray-800 rounded-2xl border border-gray-200 dark:border-gray-700 p-4 flex items-center gap-3"
          >
            <span className="w-10 h-10 rounded-xl bg-blue-600/10 flex items-center justify-center shrink-0">
              <Trophy className="w-5 h-5 text-blue-600" />
            </span>
            <div>
              <p className="text-xl font-bold text-gray-900 dark:text-white">{s.value}</p>
              <p className="text-[10px] uppercase tracking-wider text-gray-500">{s.label}</p>
            </div>
          </div>
        ))}
      </div>

      {/* Tabs + Toolbar */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center gap-3 mb-4">
        <Tabs
          value={tab}
          onChange={(v) => setTab(v as "all" | "published")}
          tabs={[
            { label: "All Results", value: "all", badge: rows.length },
            { label: "Published", value: "published", badge: publishedCount },
          ]}
        />
        <div className="relative flex-1 max-w-xs sm:ml-auto">
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search student / achievement..."
            className="ap-input w-full"
          />
        </div>
      </div>

      {/* Table */}
      <div className="bg-white dark:bg-gray-800 rounded-2xl border border-gray-200 dark:border-gray-700 shadow-sm overflow-hidden">
        {loading ? (
          <div className="p-5">
            <SkeletonTable rows={6} />
          </div>
        ) : filteredRows.length === 0 ? (
          <div className="p-6">
            <EmptyState
              icon={FileText}
              title={
                search || tab === "published" ? "No results match your filters" : "No results yet"
              }
              desc="Click + Add Result to create the first student result."
              action={
                !search && tab === "all" ? { label: "Add Result", onClick: openCreate } : undefined
              }
            />
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-gray-200 dark:border-gray-700 text-xs uppercase tracking-wider text-gray-500">
                  <th className="px-4 py-3 text-left w-12">Photo</th>
                  <th className="px-4 py-3 text-left">Student</th>
                  <th className="px-4 py-3 text-left">Achievement</th>
                  <th className="px-4 py-3 text-left">Year</th>
                  <th className="px-4 py-3 text-left">Status</th>
                  <th className="px-4 py-3 text-center">Featured</th>
                  <th className="px-4 py-3 text-center">
                    <span className="flex items-center justify-center gap-1">
                      Order <ArrowUpDown className="w-3 h-3" />
                    </span>
                  </th>
                  <th className="px-4 py-3 text-right w-32">Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredRows.map((row) => {
                  const name = rowName(row);
                  const post = rowPost(row);
                  const status = (row.status ?? "published") as string;
                  const featured = !!row.featured;
                  const order = row.order != null ? Number(row.order) : 9999;
                  return (
                    <tr
                      key={row.id}
                      className="border-b border-gray-100 dark:border-gray-800 hover:bg-gray-50/60 dark:hover:bg-slate-800/50 transition"
                    >
                      <td className="px-4 py-3">
                        <div className="w-10 h-10 rounded-lg overflow-hidden bg-navy text-white flex items-center justify-center text-xs font-bold shrink-0">
                          {row.photoUrl ? (
                            <img
                              src={row.photoUrl as string}
                              alt={name}
                              className="w-full h-full object-cover"
                            />
                          ) : (
                            initials(name)
                          )}
                        </div>
                      </td>
                      <td className="px-4 py-3 font-semibold text-gray-900 dark:text-white">
                        {name}
                      </td>
                      <td className="px-4 py-3 text-gray-600 dark:text-gray-300">{post}</td>
                      <td className="px-4 py-3 text-gray-500 dark:text-gray-400">
                        {(row.year as string) || "—"}
                      </td>
                      <td className="px-4 py-3">
                        <Badge tone={status === "published" ? "success" : "warning"}>
                          {status}
                        </Badge>
                      </td>
                      <td className="px-4 py-3 text-center">
                        <button
                          onClick={() => handleToggleFeatured(row)}
                          title={featured ? "Remove featured" : "Mark as featured"}
                          className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold transition ${
                            featured
                              ? "bg-brand-red text-white hover:bg-brand-red/80"
                              : "bg-gray-200 dark:bg-gray-700 text-gray-600 dark:text-gray-300 hover:bg-gray-300 dark:hover:bg-gray-600"
                          }`}
                        >
                          {featured ? "★ Featured" : "Featured"}
                        </button>
                      </td>
                      <td className="px-4 py-3">
                        <div className="flex items-center justify-center gap-1">
                          <button
                            onClick={() => handleMove(row, -1)}
                            className="p-1 rounded hover:bg-gray-100 dark:hover:bg-slate-700"
                            title="Move up"
                          >
                            <ChevronUp className="w-3.5 h-3.5 text-gray-500" />
                          </button>
                          <span className="w-8 text-center text-xs text-gray-500 tabular-nums">
                            {order}
                          </span>
                          <button
                            onClick={() => handleMove(row, 1)}
                            className="p-1 rounded hover:bg-gray-100 dark:hover:bg-slate-700"
                            title="Move down"
                          >
                            <ChevronDown className="w-3.5 h-3.5 text-gray-500" />
                          </button>
                        </div>
                      </td>
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-1 justify-end">
                          <button
                            onClick={() => setPreviewRow(row)}
                            className="p-1.5 rounded-lg hover:bg-gray-100 dark:hover:bg-slate-700"
                            title="Preview"
                          >
                            <Eye className="w-4 h-4 text-gray-500" />
                          </button>
                          <button
                            onClick={() => openEdit(row)}
                            className="p-1.5 rounded-lg hover:bg-gray-100 dark:hover:bg-slate-700"
                            title="Edit"
                          >
                            <Pencil className="w-4 h-4 text-gray-500" />
                          </button>
                          <button
                            onClick={() => {
                              setConfirmId(row.id);
                              setConfirmName(name);
                            }}
                            className="p-1.5 rounded-lg hover:bg-red-50 dark:hover:bg-red-900/20"
                            title="Delete"
                          >
                            <Trash2 className="w-4 h-4 text-red-500" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* ---- CREATE / EDIT MODAL ---- */}
      <Modal
        open={formOpen}
        onClose={closeForm}
        size="xl"
        title={editingRow ? "Edit Result" : "Add Result"}
      >
        <div className="space-y-5">
          {/* Student Name */}
          <FormField label="Student Name" required>
            <input
              value={form.studentName}
              onChange={(e) => setField("studentName", e.target.value)}
              placeholder="e.g. Sachin Yadav"
              className="ap-input w-full"
            />
          </FormField>

          {/* Photo */}
          <FormField label="Student Photo" required>
            <div className="flex flex-col gap-3">
              <div className="flex flex-wrap gap-2">
                <button
                  type="button"
                  onClick={() => setGalleryOpen(true)}
                  className="px-3 py-1.5 rounded-lg border border-dashed border-blue-300 text-xs font-medium text-blue-600 hover:bg-blue-50 transition"
                >
                  <Image className="w-4 h-4 inline mr-1" /> Select from Gallery
                </button>
              </div>
              <ImageUpload
                value={form.photoUrl}
                onChange={(url) => setField("photoUrl", url)}
                folder="results"
              />
              {form.photoUrl && (
                <div className="relative w-20 h-20 rounded-xl overflow-hidden border shadow">
                  <img src={form.photoUrl} alt="Preview" className="w-full h-full object-cover" />
                  <button
                    type="button"
                    onClick={() => setField("photoUrl", "")}
                    className="absolute top-1 right-1 w-5 h-5 rounded-full bg-red-500 text-white flex items-center justify-center"
                  >
                    <X className="w-3 h-3" />
                  </button>
                </div>
              )}
            </div>
          </FormField>

          {/* Achievement */}
          <FormField label="Selection / Achievement" required>
            <input
              value={form.achievement}
              onChange={(e) => setField("achievement", e.target.value)}
              placeholder="e.g. Civil Engineering"
              className="ap-input w-full"
            />
          </FormField>

          <div className="grid grid-cols-2 gap-4">
            <FormField label="Exam / Category">
              <input
                value={form.examCategory}
                onChange={(e) => setField("examCategory", e.target.value)}
                placeholder="e.g. IOE Entrance"
                className="ap-input w-full"
              />
            </FormField>
            <FormField label="Rank / Score">
              <input
                value={form.rank}
                onChange={(e) => setField("rank", e.target.value)}
                placeholder="e.g. Rank 12"
                className="ap-input w-full"
              />
            </FormField>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <FormField label="Batch">
              <input
                value={form.batch}
                onChange={(e) => setField("batch", e.target.value)}
                placeholder="e.g. 2082/83"
                className="ap-input w-full"
              />
            </FormField>
            <FormField label="Year">
              <input
                value={form.year}
                onChange={(e) => setField("year", e.target.value)}
                placeholder="e.g. 2083"
                className="ap-input w-full"
              />
            </FormField>
          </div>

          <FormField label="Tag">
            <select
              value={form.tag}
              onChange={(e) => setField("tag", e.target.value)}
              className="ap-input w-full"
            >
              {TAG_OPTIONS.map((o) => (
                <option key={o.value} value={o.value}>
                  {o.label}
                </option>
              ))}
            </select>
          </FormField>

          <FormField label="Short Description">
            <textarea
              value={form.description}
              onChange={(e) => setField("description", e.target.value)}
              placeholder="Optional description..."
              rows={2}
              className="ap-input w-full resize-none"
            />
          </FormField>

          <div className="grid grid-cols-3 gap-4">
            <FormField label="Display Order">
              <input
                type="number"
                value={form.order}
                onChange={(e) => setField("order", e.target.valueAsNumber || e.target.value)}
                placeholder="1"
                className="ap-input w-full"
              />
            </FormField>
            <FormField label="Status">
              <select
                value={form.status}
                onChange={(e) => setField("status", e.target.value)}
                className="ap-input w-full"
              >
                {STATUS_OPTIONS.map((o) => (
                  <option key={o.value} value={o.value}>
                    {o.label}
                  </option>
                ))}
              </select>
            </FormField>
            <FormField label="Featured">
              <div className="pt-1">
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={form.featured}
                    onChange={(e) => setField("featured", e.target.checked)}
                    className="rounded"
                  />
                  <span className="text-sm text-gray-700 dark:text-gray-300">
                    {form.featured ? "Yes" : "No"}
                  </span>
                </label>
              </div>
            </FormField>
          </div>
        </div>

        <div className="flex justify-end gap-3 mt-6 pt-4 border-t border-gray-200 dark:border-slate-700">
          <button onClick={closeForm} className="ap-btn-ghost">
            Cancel
          </button>
          <button onClick={handleSubmit} disabled={saving} className="ap-btn">
            {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
            {editingRow ? "Update Result" : "Add Result"}
          </button>
        </div>
      </Modal>

      {/* ---- GALLERY PICKER ---- */}
      <GalleryPicker
        open={galleryOpen}
        onClose={() => setGalleryOpen(false)}
        onSelect={(url) => {
          setField("photoUrl", url);
          setGalleryOpen(false);
          toast.success("Image selected from gallery");
        }}
      />

      {/* ---- PREVIEW MODAL ---- */}
      <Modal open={!!previewRow} onClose={() => setPreviewRow(null)} size="sm">
        {previewRow && (
          <div className="text-center">
            <div className="w-24 h-24 mx-auto rounded-2xl overflow-hidden bg-navy text-white flex items-center justify-center text-2xl font-bold mb-4 shadow-lg">
              {(previewRow.photoUrl as string) ? (
                <img
                  src={previewRow.photoUrl as string}
                  alt={rowName(previewRow)}
                  className="w-full h-full object-cover"
                />
              ) : (
                initials(rowName(previewRow))
              )}
            </div>
            <h3 className="text-lg font-bold text-gray-900 dark:text-white">
              {rowName(previewRow)}
            </h3>
            <p className="text-sm text-brand-red font-semibold uppercase mt-1">
              {rowPost(previewRow)}
            </p>
            <div className="flex justify-center gap-2 mt-3">
              <Badge
                tone={(previewRow.status ?? "published") === "published" ? "success" : "warning"}
              >
                {previewRow.status ?? "published"}
              </Badge>
              {previewRow.featured && <Badge tone="info">★ Featured</Badge>}
            </div>
            <div className="mt-4 text-xs text-gray-500 space-y-1">
              {previewRow.year && <p>Year: {previewRow.year}</p>}
              {previewRow.batch && <p>Batch: {previewRow.batch}</p>}
              {previewRow.examCategory && <p>Category: {previewRow.examCategory}</p>}
              {previewRow.rank && <p>Rank: {previewRow.rank}</p>}
              {previewRow.description && <p className="italic">"{previewRow.description}"</p>}
            </div>
            <button onClick={() => setPreviewRow(null)} className="ap-btn mt-6">
              Close
            </button>
          </div>
        )}
      </Modal>

      {/* ---- DELETE CONFIRM ---- */}
      <Modal open={!!confirmId} onClose={() => setConfirmId(null)} size="sm">
        <div className="text-center">
          <div className="w-14 h-14 rounded-full bg-red-50 dark:bg-red-900/20 flex items-center justify-center mx-auto mb-4">
            <Trash2 className="w-7 h-7 text-red-500" />
          </div>
          <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-1">Delete Result?</h3>
          <p className="text-sm text-gray-500 dark:text-gray-400 mb-6">
            "{confirmName}" will be permanently removed from the public Results section.
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

/* ---- FormField helper (purely visual) ---- */
function FormField({
  label,
  required,
  children,
}: {
  label: string;
  required?: boolean;
  children: React.ReactNode;
}) {
  return (
    <div>
      <label className="text-xs font-bold uppercase tracking-wider text-gray-500 dark:text-gray-400 mb-1 block">
        {label}
        {required && <span className="text-red-500 ml-0.5">*</span>}
      </label>
      {children}
    </div>
  );
}
