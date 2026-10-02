import { useState } from "react";
import { useModuleData } from "@/hooks/use-module-data";
import { PageHeader } from "@/components/admin/AdminShell";
import { Panel, Modal, Badge, EmptyState } from "@/components/admin/ui";
import { ImageUpload } from "@/components/admin/image-upload";
import { GalleryPicker } from "@/components/admin/GalleryPicker";
import { toast } from "sonner";
import { Megaphone, Plus, Pencil, Trash2, Loader2, Eye, EyeOff, ExternalLink } from "lucide-react";

const POSITIONS = [
  { value: "below_hero", label: "Below Hero" },
  { value: "popup", label: "Popup / Modal" },
  { value: "between_sections", label: "Between Sections" },
  { value: "sidebar", label: "Sidebar" },
  { value: "footer_banner", label: "Footer Banner" },
];

const EMPTY = {
  title: "",
  description: "",
  image: "",
  link: "",
  buttonText: "",
  position: "below_hero",
  priority: "0",
  startDate: "",
  endDate: "",
  active: true,
};

type AdRow = {
  id: string;
  title?: string | null;
  description?: string | null;
  image?: string | null;
  link?: string | null;
  buttonText?: string | null;
  position?: string | null;
  priority?: number | null;
  startDate?: string | null;
  endDate?: string | null;
  active?: boolean;
};

type AdForm = typeof EMPTY;

export function AdvertisementsPage() {
  const { rows: rawRows, loading, create, update, remove } = useModuleData("advertisements");
  const rows = rawRows as AdRow[];
  const [modalOpen, setModalOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [form, setForm] = useState<AdForm>(EMPTY);
  const [saving, setSaving] = useState(false);
  const [galleryOpen, setGalleryOpen] = useState(false);
  const [confirmId, setConfirmId] = useState<string | null>(null);

  const set = (k: keyof AdForm, v: string | boolean) => setForm((f) => ({ ...f, [k]: v }));
  const sorted = [...rows].sort((a, b) => (a.priority ?? 999) - (b.priority ?? 999));

  const openAdd = () => {
    setEditingId(null);
    setForm(EMPTY);
    setModalOpen(true);
  };

  const openEdit = (r: AdRow) => {
    setEditingId(r.id);
    setForm({
      title: r.title ?? "",
      description: r.description ?? "",
      image: r.image ?? "",
      link: r.link ?? "",
      buttonText: r.buttonText ?? "",
      position: r.position ?? "below_hero",
      priority: String(r.priority ?? 0),
      startDate: r.startDate ?? "",
      endDate: r.endDate ?? "",
      active: r.active !== false,
    });
    setModalOpen(true);
  };

  const save = async () => {
    if (!form.title.trim()) return toast.error("Enter an ad title");
    if (!form.image.trim()) return toast.error("Upload an ad image");
    setSaving(true);
    try {
      const payload: Record<string, unknown> = {
        title: form.title.trim(),
        description: form.description,
        image: form.image.trim(),
        link: form.link,
        buttonText: form.buttonText,
        position: form.position,
        priority: Number(form.priority) || 0,
        startDate: form.startDate || null,
        endDate: form.endDate || null,
        active: form.active,
        updatedAt: new Date().toISOString(),
      };
      if (editingId) {
        await update(editingId, payload);
        toast.success("Ad updated");
      } else {
        await create(payload);
        toast.success("Ad created");
      }
      setModalOpen(false);
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Failed to save");
    } finally {
      setSaving(false);
    }
  };

  const removeAd = async () => {
    if (!confirmId) return;
    try {
      await remove(confirmId);
      toast.success("Ad deleted");
      setConfirmId(null);
    } catch {
      toast.error("Failed to delete");
    }
  };

  const toggleActive = async (r: AdRow) => {
    try {
      await update(r.id, { active: r.active !== false ? false : true });
      toast.success(r.active !== false ? "Ad disabled" : "Ad enabled");
    } catch {
      toast.error("Failed to toggle");
    }
  };

  return (
    <div>
      <PageHeader
        title="Advertisements"
        subtitle="Manage banner ads, popups, and promotional placements across the site."
        actions={
          <button onClick={openAdd} className="ap-btn">
            <Plus className="w-4 h-4" /> New Ad
          </button>
        }
      />
      <Panel title={`All advertisements (${sorted.length})`}>
        {loading && rows.length === 0 ? (
          <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
            {Array.from({ length: 3 }).map((_, i) => (
              <div
                key={i}
                className="rounded-2xl bg-gray-100 dark:bg-gray-800 animate-pulse h-40"
              />
            ))}
          </div>
        ) : sorted.length === 0 ? (
          <EmptyState
            icon={Megaphone}
            title="No advertisements yet"
            desc="Create your first ad to display banners or popups on the site."
            action={{ label: "New ad", onClick: openAdd }}
          />
        ) : (
          <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
            {sorted.map((r) => (
              <div
                key={r.id}
                className="ap-card overflow-hidden group hover:shadow-lg transition-shadow"
              >
                <div className="relative h-32 overflow-hidden bg-slate-100">
                  {r.image ? (
                    <img src={r.image} alt={r.title ?? ""} className="w-full h-full object-cover" />
                  ) : (
                    <div className="w-full h-full bg-gradient-to-br from-blue-100 to-slate-200 flex items-center justify-center">
                      <Megaphone className="w-8 h-8 text-slate-300" />
                    </div>
                  )}
                  <div className="absolute top-2 right-2 flex gap-1">
                    <Badge tone={r.active !== false ? "success" : "muted"}>
                      {r.active !== false ? "Active" : "Disabled"}
                    </Badge>
                    <span className="bg-black/50 text-white text-[10px] font-mono px-1.5 py-0.5 rounded">
                      {r.position ?? "below_hero"}
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
                  <div className="flex items-center gap-2 text-[10px] text-[hsl(var(--ap-muted))]">
                    <span>Priority: {r.priority ?? 0}</span>
                    {r.link && (
                      <span className="flex items-center gap-0.5">
                        <ExternalLink className="w-2.5 h-2.5" />
                        Link
                      </span>
                    )}
                  </div>
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
                      {r.active !== false ? "Disable" : "Enable"}
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
        title={editingId ? "Edit advertisement" : "New advertisement"}
      >
        <div className="space-y-4">
          <div>
            <ImageUpload folder="ads" value={form.image} onChange={(v) => set("image", v)} />
            <button onClick={() => setGalleryOpen(true)} className="ap-btn-ghost text-xs mt-2">
              Select from gallery
            </button>
          </div>
          {form.image && (
            <img src={form.image} alt="Preview" className="w-full h-32 object-cover rounded-xl" />
          )}

          <label className="block">
            <span className="text-xs font-bold uppercase tracking-widest text-[hsl(var(--ap-muted))]">
              Title *
            </span>
            <input
              value={form.title}
              onChange={(e) => set("title", e.target.value)}
              className="ap-input mt-1"
              placeholder="Summer Enrollment Offer"
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
              placeholder="Short description for the ad."
            />
          </label>

          <div className="grid grid-cols-2 gap-4">
            <label className="block">
              <span className="text-xs font-bold uppercase tracking-widest text-[hsl(var(--ap-muted))]">
                Target URL
              </span>
              <input
                value={form.link}
                onChange={(e) => set("link", e.target.value)}
                className="ap-input mt-1"
                placeholder="/admission"
              />
            </label>
            <label className="block">
              <span className="text-xs font-bold uppercase tracking-widest text-[hsl(var(--ap-muted))]">
                Button Text
              </span>
              <input
                value={form.buttonText}
                onChange={(e) => set("buttonText", e.target.value)}
                className="ap-input mt-1"
                placeholder="Apply Now"
              />
            </label>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <label className="block">
              <span className="text-xs font-bold uppercase tracking-widest text-[hsl(var(--ap-muted))]">
                Position
              </span>
              <select
                value={form.position}
                onChange={(e) => set("position", e.target.value)}
                className="ap-input mt-1"
              >
                {POSITIONS.map((p) => (
                  <option key={p.value} value={p.value}>
                    {p.label}
                  </option>
                ))}
              </select>
            </label>
            <label className="block">
              <span className="text-xs font-bold uppercase tracking-widest text-[hsl(var(--ap-muted))]">
                Priority (lower = first)
              </span>
              <input
                type="number"
                value={form.priority}
                onChange={(e) => set("priority", e.target.value)}
                className="ap-input mt-1"
              />
            </label>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <label className="block">
              <span className="text-xs font-bold uppercase tracking-widest text-[hsl(var(--ap-muted))]">
                Start date
              </span>
              <input
                type="date"
                value={form.startDate}
                onChange={(e) => set("startDate", e.target.value)}
                className="ap-input mt-1"
              />
            </label>
            <label className="block">
              <span className="text-xs font-bold uppercase tracking-widest text-[hsl(var(--ap-muted))]">
                End date
              </span>
              <input
                type="date"
                value={form.endDate}
                onChange={(e) => set("endDate", e.target.value)}
                className="ap-input mt-1"
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
                "Create ad"
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

      <Modal open={!!confirmId} onClose={() => setConfirmId(null)} title="Delete advertisement?">
        <p className="text-sm text-[hsl(var(--ap-muted))] mb-2">
          This ad will be permanently removed from the site.
        </p>
        <div className="flex gap-2">
          <button onClick={removeAd} className="ap-btn-danger flex-1 justify-center">
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
