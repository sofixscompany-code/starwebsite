import { useState } from "react";
import { useModuleData } from "@/hooks/use-module-data";
import { PageHeader } from "@/components/admin/AdminShell";
import { Panel, Modal, Badge, EmptyState } from "@/components/admin/ui";
import { ImageUpload } from "@/components/admin/image-upload";
import { GalleryPicker } from "@/components/admin/GalleryPicker";
import { toast } from "sonner";
import {
  Sparkles,
  Plus,
  Pencil,
  Trash2,
  Loader2,
  Eye,
  EyeOff,
  ArrowUp,
  ArrowDown,
} from "lucide-react";

const SECTIONS = [
  { value: "features", label: "Features / Why Star Coaching" },
  { value: "courses_strip", label: "Courses Strip" },
  { value: "hostel", label: "Hostel Facility" },
  { value: "mock_tests", label: "Mock Tests" },
  { value: "student_success", label: "Student Success" },
  { value: "facilities", label: "Facilities" },
  { value: "events", label: "Events / Promotions" },
];

const EMPTY = {
  section: "features",
  title: "",
  description: "",
  image: "",
  buttonText: "",
  buttonLink: "",
  active: true,
  order: "0",
};

type FCRow = {
  id: string;
  section?: string | null;
  title?: string | null;
  description?: string | null;
  image?: string | null;
  buttonText?: string | null;
  buttonLink?: string | null;
  active?: boolean;
  order?: number | null;
};

type FCForm = typeof EMPTY;

export function FeatureContentPage() {
  const { rows: rawRows, loading, create, update, remove } = useModuleData("feature_content");
  const rows = rawRows as FCRow[];
  const [modalOpen, setModalOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [form, setForm] = useState<FCForm>(EMPTY);
  const [saving, setSaving] = useState(false);
  const [galleryOpen, setGalleryOpen] = useState(false);
  const [confirmId, setConfirmId] = useState<string | null>(null);

  const set = (k: keyof FCForm, v: string | boolean) => setForm((f) => ({ ...f, [k]: v }));
  const sorted = [...rows].sort((a, b) => (a.order ?? 999) - (b.order ?? 999));

  const openAdd = () => {
    setEditingId(null);
    setForm({ ...EMPTY, order: String(rows.length) });
    setModalOpen(true);
  };

  const openEdit = (r: FCRow) => {
    setEditingId(r.id);
    setForm({
      section: r.section ?? "features",
      title: r.title ?? "",
      description: r.description ?? "",
      image: r.image ?? "",
      buttonText: r.buttonText ?? "",
      buttonLink: r.buttonLink ?? "",
      active: r.active !== false,
      order: String(r.order ?? 0),
    });
    setModalOpen(true);
  };

  const save = async () => {
    if (!form.title.trim()) return toast.error("Enter a title");
    setSaving(true);
    try {
      const payload: Record<string, unknown> = {
        section: form.section,
        title: form.title.trim(),
        description: form.description,
        image: form.image.trim(),
        buttonText: form.buttonText,
        buttonLink: form.buttonLink,
        active: form.active,
        order: Number(form.order) || 0,
        updatedAt: new Date().toISOString(),
      };
      if (editingId) {
        await update(editingId, payload);
        toast.success("Feature updated");
      } else {
        await create(payload);
        toast.success("Feature created");
      }
      setModalOpen(false);
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Failed to save");
    } finally {
      setSaving(false);
    }
  };

  const toggleActive = async (r: FCRow) => {
    try {
      await update(r.id, { active: r.active !== false ? false : true });
      toast.success(r.active !== false ? "Feature hidden" : "Feature shown");
    } catch {
      toast.error("Failed to toggle");
    }
  };

  const moveItem = async (r: FCRow, dir: -1 | 1) => {
    const idx = sorted.findIndex((s) => s.id === r.id);
    if (idx < 0) return;
    const swapIdx = idx + dir;
    if (swapIdx < 0 || swapIdx >= sorted.length) return;
    try {
      await update(sorted[idx].id, { order: sorted[swapIdx].order ?? 0 });
      await update(sorted[swapIdx].id, { order: sorted[idx].order ?? 0 });
      toast.success("Order updated");
    } catch {
      toast.error("Failed to reorder");
    }
  };

  const removeItem = async () => {
    if (!confirmId) return;
    try {
      await remove(confirmId);
      toast.success("Feature deleted");
      setConfirmId(null);
    } catch {
      toast.error("Failed to delete");
    }
  };

  return (
    <div>
      <PageHeader
        title="Feature Content"
        subtitle="Manage feature images, descriptions, and section content across the homepage and other pages."
        actions={
          <button onClick={openAdd} className="ap-btn">
            <Plus className="w-4 h-4" /> New Feature
          </button>
        }
      />

      <Panel title={`All feature content (${sorted.length})`}>
        {loading && rows.length === 0 ? (
          <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
            {Array.from({ length: 3 }).map((_, i) => (
              <div
                key={i}
                className="rounded-2xl bg-gray-100 dark:bg-gray-800 animate-pulse h-44"
              />
            ))}
          </div>
        ) : sorted.length === 0 ? (
          <EmptyState
            icon={Sparkles}
            title="No feature content yet"
            desc="Add features, courses, or section content to display across the site."
            action={{ label: "New feature", onClick: openAdd }}
          />
        ) : (
          <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
            {sorted.map((r) => (
              <div
                key={r.id}
                className="ap-card overflow-hidden group hover:shadow-lg transition-shadow"
              >
                <div className="relative h-28 overflow-hidden bg-slate-100">
                  {r.image ? (
                    <img src={r.image} alt={r.title ?? ""} className="w-full h-full object-cover" />
                  ) : (
                    <div className="w-full h-full bg-gradient-to-br from-blue-50 to-slate-100 flex items-center justify-center">
                      <Sparkles className="w-6 h-6 text-slate-300" />
                    </div>
                  )}
                  <div className="absolute top-2 right-2 flex gap-1">
                    <Badge tone={r.active !== false ? "success" : "muted"}>
                      {r.active !== false ? "Active" : "Hidden"}
                    </Badge>
                    <span className="bg-black/50 text-white text-[10px] font-mono px-1.5 py-0.5 rounded">
                      {r.section}
                    </span>
                  </div>
                </div>
                <div className="p-3 space-y-1.5">
                  <p className="font-bold text-sm text-[hsl(var(--ap-ink))] line-clamp-1">
                    {r.title}
                  </p>
                  {r.description && (
                    <p className="text-xs text-[hsl(var(--ap-muted))] line-clamp-2">
                      {r.description}
                    </p>
                  )}
                  {r.buttonText && (
                    <span className="text-[11px] px-1.5 py-0.5 rounded bg-navy/5 text-navy font-medium">
                      {r.buttonText} → {r.buttonLink}
                    </span>
                  )}
                  <div className="flex gap-1 pt-1 border-t border-slate-100">
                    <button
                      onClick={() => openEdit(r)}
                      className="ap-btn-ghost flex-1 justify-center text-xs"
                    >
                      <Pencil className="w-3.5 h-3.5" /> Edit
                    </button>
                    <button
                      onClick={() => toggleActive(r)}
                      className="ap-btn-ghost flex-1 justify-center text-xs"
                    >
                      {r.active !== false ? (
                        <EyeOff className="w-3.5 h-3.5" />
                      ) : (
                        <Eye className="w-3.5 h-3.5" />
                      )}
                      {r.active !== false ? "Hide" : "Show"}
                    </button>
                    <button
                      onClick={() => moveItem(r, -1)}
                      className="ap-btn-ghost text-xs"
                      disabled={sorted.indexOf(r) === 0}
                    >
                      <ArrowUp className="w-3.5 h-3.5" />
                    </button>
                    <button
                      onClick={() => moveItem(r, 1)}
                      className="ap-btn-ghost text-xs"
                      disabled={sorted.indexOf(r) === sorted.length - 1}
                    >
                      <ArrowDown className="w-3.5 h-3.5" />
                    </button>
                    <button onClick={() => setConfirmId(r.id)} className="ap-btn-ghost text-xs">
                      <Trash2 className="w-3.5 h-3.5 text-[hsl(var(--ap-danger))]" />
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </Panel>

      <Modal
        open={modalOpen}
        onClose={() => setModalOpen(false)}
        size="lg"
        title={editingId ? "Edit feature" : "New feature"}
      >
        <div className="space-y-4">
          <div>
            <ImageUpload folder="features" value={form.image} onChange={(v) => set("image", v)} />
            <button onClick={() => setGalleryOpen(true)} className="ap-btn-ghost text-xs mt-2">
              Select from gallery
            </button>
          </div>
          {form.image && (
            <img src={form.image} alt="Preview" className="w-full h-32 object-cover rounded-xl" />
          )}

          <div className="grid grid-cols-2 gap-4">
            <label className="block">
              <span className="text-xs font-bold uppercase tracking-widest text-[hsl(var(--ap-muted))]">
                Section
              </span>
              <select
                value={form.section}
                onChange={(e) => set("section", e.target.value)}
                className="ap-input mt-1"
              >
                {SECTIONS.map((s) => (
                  <option key={s.value} value={s.value}>
                    {s.label}
                  </option>
                ))}
              </select>
            </label>
            <label className="block">
              <span className="text-xs font-bold uppercase tracking-widest text-[hsl(var(--ap-muted))]">
                Order
              </span>
              <input
                type="number"
                value={form.order}
                onChange={(e) => set("order", e.target.value)}
                className="ap-input mt-1"
              />
            </label>
          </div>

          <label className="block">
            <span className="text-xs font-bold uppercase tracking-widest text-[hsl(var(--ap-muted))]">
              Title *
            </span>
            <input
              value={form.title}
              onChange={(e) => set("title", e.target.value)}
              className="ap-input mt-1"
              placeholder="Expert Faculty"
            />
          </label>
          <label className="block">
            <span className="text-xs font-bold uppercase tracking-widest text-[hsl(var(--ap-muted))]">
              Description
            </span>
            <textarea
              value={form.description}
              onChange={(e) => set("description", e.target.value)}
              rows={2}
              className="ap-input mt-1 resize-none"
            />
          </label>

          <div className="grid grid-cols-2 gap-4">
            <label className="block">
              <span className="text-xs font-bold uppercase tracking-widest text-[hsl(var(--ap-muted))]">
                Button Text
              </span>
              <input
                value={form.buttonText}
                onChange={(e) => set("buttonText", e.target.value)}
                className="ap-input mt-1"
                placeholder="Learn More"
              />
            </label>
            <label className="block">
              <span className="text-xs font-bold uppercase tracking-widest text-[hsl(var(--ap-muted))]">
                Button Link
              </span>
              <input
                value={form.buttonLink}
                onChange={(e) => set("buttonLink", e.target.value)}
                className="ap-input mt-1"
                placeholder="/courses"
              />
            </label>
          </div>

          <label className="flex items-center gap-2 text-sm font-medium cursor-pointer">
            <input
              type="checkbox"
              checked={form.active}
              onChange={(e) => set("active", e.target.checked)}
              className="accent-[hsl(var(--ap-primary))] w-4 h-4"
            />
            Active (visible on site)
          </label>

          <div className="flex gap-2 pt-2">
            <button onClick={save} disabled={saving} className="ap-btn flex-1 justify-center">
              {saving ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" /> Saving…
                </>
              ) : editingId ? (
                "Save changes"
              ) : (
                "Create feature"
              )}
            </button>
            <button
              onClick={() => setModalOpen(false)}
              className="ap-btn-secondary flex-1 justify-center"
            >
              Cancel
            </button>
          </div>
        </div>
      </Modal>

      <GalleryPicker
        open={galleryOpen}
        onClose={() => setGalleryOpen(false)}
        onSelect={(url) => {
          set("image", url);
          setGalleryOpen(false);
        }}
      />

      <Modal open={!!confirmId} onClose={() => setConfirmId(null)} title="Delete feature content?">
        <p className="text-sm text-[hsl(var(--ap-muted))] mb-2">
          This feature item will be permanently removed.
        </p>
        <div className="flex gap-2">
          <button onClick={removeItem} className="ap-btn-danger flex-1 justify-center">
            <Trash2 className="w-4 h-4" /> Delete
          </button>
          <button
            onClick={() => setConfirmId(null)}
            className="ap-btn-secondary flex-1 justify-center"
          >
            Cancel
          </button>
        </div>
      </Modal>
    </div>
  );
}
