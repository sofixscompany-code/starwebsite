import { useState } from "react";
import { useModuleData } from "@/hooks/use-module-data";
import { PageHeader } from "@/components/admin/AdminShell";
import { Panel, Modal, Badge, EmptyState } from "@/components/admin/ui";
import { ImageUpload } from "@/components/admin/image-upload";
import { GalleryPicker } from "@/components/admin/GalleryPicker";
import { toast } from "sonner";
import {
  Eye,
  EyeOff,
  Trash2,
  Pencil,
  Plus,
  ImageIcon,
  Loader2,
  ArrowUp,
  ArrowDown,
  Monitor,
  Smartphone,
} from "lucide-react";

const EMPTY = {
  kicker: "",
  title: "",
  subtitle: "",
  description: "",
  ctaText: "",
  ctaLink: "",
  buttonType: "solid",
  imageUrl: "",
  desktopImage: "",
  mobileImage: "",
  overlay: "70",
  alignment: "left",
  duration: "4500",
  sortOrder: "0",
  isActive: true,
  status: "published",
};

type SlideRow = {
  id: string;
  kicker?: string | null;
  title?: string | null;
  subtitle?: string | null;
  description?: string | null;
  ctaText?: string | null;
  ctaLink?: string | null;
  buttonType?: string | null;
  imageUrl?: string | null;
  desktopImage?: string | null;
  mobileImage?: string | null;
  overlay?: number | null;
  alignment?: string | null;
  duration?: number | null;
  sortOrder?: number;
  isActive?: boolean;
  status?: string | null;
};

type SlideForm = typeof EMPTY;

const ACCENT_FALLBACK = "bg-gradient-to-br from-blue-900 via-navy to-navy";

export function HeroSlidesPage() {
  const { rows: rawRows, loading, create, update, remove } = useModuleData("hero_slides");
  const rows = rawRows as SlideRow[];

  const [modalOpen, setModalOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [form, setForm] = useState<SlideForm>(EMPTY);
  const [saving, setSaving] = useState(false);
  const [galleryOpen, setGalleryOpen] = useState(false);
  const [galleryTarget, setGalleryTarget] = useState<"desktop" | "mobile" | "legacy">("legacy");
  const [confirmId, setConfirmId] = useState<string | null>(null);
  const [previewMode, setPreviewMode] = useState<"desktop" | "mobile">("desktop");

  const set = (k: keyof SlideForm, v: string | boolean) => setForm((f) => ({ ...f, [k]: v }));

  const sorted = [...rows].sort((a, b) => (a.sortOrder ?? 999) - (b.sortOrder ?? 999));

  const openAdd = () => {
    setEditingId(null);
    setForm({ ...EMPTY, sortOrder: String((rows.length || 0) + 1) });
    setModalOpen(true);
  };

  const openEdit = (r: SlideRow) => {
    setEditingId(r.id);
    setForm({
      kicker: r.kicker ?? "",
      title: r.title ?? "",
      subtitle: r.subtitle ?? "",
      description: r.description ?? "",
      ctaText: r.ctaText ?? "",
      ctaLink: r.ctaLink ?? "",
      buttonType: r.buttonType ?? "solid",
      imageUrl: r.imageUrl ?? "",
      desktopImage: r.desktopImage ?? "",
      mobileImage: r.mobileImage ?? "",
      overlay: String(r.overlay ?? 70),
      alignment: r.alignment ?? "left",
      duration: String(r.duration ?? 4500),
      sortOrder: String(r.sortOrder ?? 0),
      isActive: r.isActive !== false,
      status: r.status ?? "published",
    });
    setModalOpen(true);
  };

  const save = async (publishStatus?: string) => {
    if (!form.title.trim()) return toast.error("Please enter a slide title");
    const img = form.desktopImage || form.imageUrl;
    if (!img.trim()) return toast.error("Please upload a desktop image");
    setSaving(true);
    try {
      const payload: Record<string, unknown> = {
        kicker: form.kicker || "",
        title: form.title.trim(),
        subtitle: form.subtitle,
        description: form.description,
        ctaText: form.ctaText,
        ctaLink: form.ctaLink,
        buttonType: form.buttonType,
        imageUrl: img.trim(),
        desktopImage: form.desktopImage.trim() || img.trim(),
        mobileImage: form.mobileImage.trim(),
        overlay: Number(form.overlay) || 70,
        alignment: form.alignment,
        duration: Number(form.duration) || 4500,
        sortOrder: Number(form.sortOrder) || 0,
        isActive: form.isActive,
        status: publishStatus || form.status,
      };
      if (editingId) {
        await update(editingId, payload);
        toast.success("Hero slide updated successfully");
      } else {
        await create(payload);
        toast.success("Hero slide added successfully");
      }
      setModalOpen(false);
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Failed to save slide");
    } finally {
      setSaving(false);
    }
  };

  const toggleActive = async (r: SlideRow) => {
    try {
      await update(r.id, { isActive: r.isActive !== false ? false : true });
      toast.success(r.isActive !== false ? "Slide hidden" : "Slide shown");
    } catch {
      toast.error("Failed to update slide");
    }
  };

  const moveSlide = async (r: SlideRow, dir: -1 | 1) => {
    const idx = sorted.findIndex((s) => s.id === r.id);
    if (idx < 0) return;
    const swapIdx = idx + dir;
    if (swapIdx < 0 || swapIdx >= sorted.length) return;
    const a = sorted[idx];
    const b = sorted[swapIdx];
    try {
      await update(a.id, { sortOrder: b.sortOrder ?? 0 });
      await update(b.id, { sortOrder: a.sortOrder ?? 0 });
      toast.success("Slide order updated");
    } catch {
      toast.error("Failed to reorder slide");
    }
  };

  const removeSlide = async () => {
    if (!confirmId) return;
    try {
      await remove(confirmId);
      toast.success("Hero slide deleted successfully");
      setConfirmId(null);
    } catch {
      toast.error("Failed to delete slide");
    }
  };

  return (
    <div>
      <PageHeader
        title="Hero Slides (Featured)"
        subtitle="The featured slides on the homepage hero. Change the image and text here — the homepage updates live."
        actions={
          <button onClick={openAdd} className="ap-btn">
            <Plus className="w-4 h-4" /> Add Slide
          </button>
        }
      />

      <Panel title={`Featured slides (${sorted.length})`}>
        {loading && rows.length === 0 ? (
          <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
            {Array.from({ length: 3 }).map((_, i) => (
              <div
                key={i}
                className="rounded-2xl bg-gray-100 dark:bg-gray-800 animate-pulse h-56"
              />
            ))}
          </div>
        ) : sorted.length === 0 ? (
          <EmptyState
            icon={ImageIcon}
            title="No hero slides yet"
            desc="Add your first slide with an image — without slides the default gradient slides are shown."
            action={{ label: "Add slide", onClick: openAdd }}
          />
        ) : (
          <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
            {sorted.map((r) => {
              const imgSrc = r.desktopImage || r.imageUrl;
              return (
                <div
                  key={r.id}
                  className="ap-card overflow-hidden group hover:shadow-lg transition-shadow"
                >
                  <div className="relative rounded-t-2xl overflow-hidden">
                    {imgSrc ? (
                      <img src={imgSrc} alt={r.title ?? ""} className="w-full h-40 object-cover" />
                    ) : (
                      <div className={`w-full h-40 ${ACCENT_FALLBACK}`} />
                    )}
                    <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-navy/80 to-transparent px-3 pb-2 pt-8">
                      {r.kicker && (
                        <p className="text-[9px] font-black uppercase tracking-[0.2em] text-gold">
                          {r.kicker}
                        </p>
                      )}
                      <p className="text-white font-bold text-sm leading-snug">
                        {r.title || <span className="italic opacity-70">Untitled</span>}
                      </p>
                    </div>
                    <div className="absolute top-2 right-2 flex gap-1.5">
                      <Badge
                        tone={
                          r.status === "draft"
                            ? "warning"
                            : r.isActive !== false
                              ? "success"
                              : "muted"
                        }
                      >
                        {r.status === "draft"
                          ? "Draft"
                          : r.isActive !== false
                            ? "Active"
                            : "Hidden"}
                      </Badge>
                      <span className="bg-black/50 text-white text-[10px] font-mono px-1.5 py-0.5 rounded">
                        #{r.sortOrder ?? "–"}
                      </span>
                      {r.mobileImage && (
                        <span className="bg-blue-500/80 text-white text-[10px] px-1.5 py-0.5 rounded">
                          Mobile
                        </span>
                      )}
                    </div>
                  </div>
                  <div className="p-3 space-y-2">
                    {r.subtitle && (
                      <p className="text-xs text-gray-500 line-clamp-2">{r.subtitle}</p>
                    )}
                    {r.ctaText && (
                      <div className="flex items-center gap-1.5 text-[11px] text-navy font-medium">
                        <span className="px-1.5 py-0.5 rounded bg-navy/5">{r.ctaText}</span>
                        <span className="text-gray-400 text-[10px]">
                          {r.buttonType ?? "solid"} · {r.alignment ?? "left"} · {r.duration ?? 4500}
                          ms
                        </span>
                      </div>
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
                        {r.isActive !== false ? (
                          <EyeOff className="w-3.5 h-3.5" />
                        ) : (
                          <Eye className="w-3.5 h-3.5" />
                        )}
                        {r.isActive !== false ? "Hide" : "Show"}
                      </button>
                      <button
                        onClick={() => moveSlide(r, -1)}
                        className="ap-btn-ghost text-xs"
                        disabled={sorted.indexOf(r) === 0}
                      >
                        <ArrowUp className="w-3.5 h-3.5" />
                      </button>
                      <button
                        onClick={() => moveSlide(r, 1)}
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
              );
            })}
          </div>
        )}
      </Panel>

      <Modal
        open={modalOpen}
        onClose={() => setModalOpen(false)}
        size="xl"
        title={editingId ? "Edit hero slide" : "Add hero slide"}
      >
        <div className="space-y-5">
          {/* Desktop / Mobile image upload */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <p className="text-xs font-bold uppercase tracking-widest text-[hsl(var(--ap-muted))] mb-2 flex items-center gap-1.5">
                <Monitor className="w-3.5 h-3.5" /> Desktop Image *
              </p>
              <ImageUpload
                folder="hero"
                value={form.desktopImage || form.imageUrl}
                onChange={(v) => {
                  set("desktopImage", v);
                  if (!form.imageUrl) set("imageUrl", v);
                }}
              />
              <button
                onClick={() => {
                  setGalleryTarget("desktop");
                  setGalleryOpen(true);
                }}
                className="ap-btn-ghost text-xs mt-2"
              >
                <ImageIcon className="w-4 h-4" /> Select from gallery
              </button>
            </div>
            <div>
              <p className="text-xs font-bold uppercase tracking-widest text-[hsl(var(--ap-muted))] mb-2 flex items-center gap-1.5">
                <Smartphone className="w-3.5 h-3.5" /> Mobile Image{" "}
                <span className="text-[10px] font-normal">(optional — falls back to desktop)</span>
              </p>
              <ImageUpload
                folder="hero"
                value={form.mobileImage}
                onChange={(v) => set("mobileImage", v)}
              />
              <button
                onClick={() => {
                  setGalleryTarget("mobile");
                  setGalleryOpen(true);
                }}
                className="ap-btn-ghost text-xs mt-2"
              >
                <ImageIcon className="w-4 h-4" /> Select from gallery
              </button>
            </div>
          </div>

          {/* Preview */}
          {(form.desktopImage || form.imageUrl || form.mobileImage) && (
            <div>
              <div className="flex gap-2 mb-2">
                <button
                  onClick={() => setPreviewMode("desktop")}
                  className={`text-xs font-bold px-3 py-1 rounded-lg transition ${previewMode === "desktop" ? "bg-navy text-white" : "bg-slate-100 text-slate-600 hover:bg-slate-200"}`}
                >
                  <Monitor className="w-3.5 h-3.5 inline mr-1" /> Desktop
                </button>
                <button
                  onClick={() => setPreviewMode("mobile")}
                  className={`text-xs font-bold px-3 py-1 rounded-lg transition ${previewMode === "mobile" ? "bg-navy text-white" : "bg-slate-100 text-slate-600 hover:bg-slate-200"}`}
                >
                  <Smartphone className="w-3.5 h-3.5 inline mr-1" /> Mobile
                </button>
              </div>
              <div
                className={`relative overflow-hidden rounded-xl bg-navy ${previewMode === "mobile" ? "max-w-[220px] mx-auto aspect-[9/16]" : "w-full aspect-[16/7]"}`}
              >
                <img
                  src={
                    previewMode === "mobile"
                      ? form.mobileImage || form.desktopImage || form.imageUrl
                      : form.desktopImage || form.imageUrl
                  }
                  alt="Preview"
                  className="w-full h-full object-cover"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-transparent" />
                {form.title && (
                  <div className="absolute inset-x-0 bottom-0 px-4 pb-4">
                    <p className="text-white font-bold text-xs leading-snug drop-shadow-md line-clamp-2">
                      {form.title}
                    </p>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Kicker + Sort */}
          <div className="grid grid-cols-2 gap-4">
            <label className="block">
              <span className="text-xs font-bold uppercase tracking-widest text-[hsl(var(--ap-muted))]">
                Kicker (small top line)
              </span>
              <input
                value={form.kicker}
                onChange={(e) => set("kicker", e.target.value)}
                placeholder="Admission Open"
                className="ap-input mt-1"
              />
            </label>
            <label className="block">
              <span className="text-xs font-bold uppercase tracking-widest text-[hsl(var(--ap-muted))]">
                Sort order
              </span>
              <input
                type="number"
                value={form.sortOrder}
                onChange={(e) => set("sortOrder", e.target.value)}
                className="ap-input mt-1"
              />
            </label>
          </div>

          {/* Title */}
          <label className="block">
            <span className="text-xs font-bold uppercase tracking-widest text-[hsl(var(--ap-muted))]">
              Title *
            </span>
            <input
              value={form.title}
              onChange={(e) => set("title", e.target.value)}
              placeholder="Admissions Open for 2083/84 B.S."
              className="ap-input mt-1"
            />
          </label>

          {/* Subtitle */}
          <label className="block">
            <span className="text-xs font-bold uppercase tracking-widest text-[hsl(var(--ap-muted))]">
              Subtitle
            </span>
            <textarea
              value={form.subtitle}
              onChange={(e) => set("subtitle", e.target.value)}
              rows={2}
              placeholder="Short description shown under the title."
              className="ap-input mt-1 resize-none"
            />
          </label>

          {/* Description */}
          <label className="block">
            <span className="text-xs font-bold uppercase tracking-widest text-[hsl(var(--ap-muted))]">
              Description (extended)
            </span>
            <textarea
              value={form.description}
              onChange={(e) => set("description", e.target.value)}
              rows={2}
              placeholder="Additional description (shown on hover or larger screens)."
              className="ap-input mt-1 resize-none"
            />
          </label>

          {/* CTA */}
          <div className="grid grid-cols-2 gap-4">
            <label className="block">
              <span className="text-xs font-bold uppercase tracking-widest text-[hsl(var(--ap-muted))]">
                Button text
              </span>
              <input
                value={form.ctaText}
                onChange={(e) => set("ctaText", e.target.value)}
                placeholder="Apply Online"
                className="ap-input mt-1"
              />
            </label>
            <label className="block">
              <span className="text-xs font-bold uppercase tracking-widest text-[hsl(var(--ap-muted))]">
                Button link
              </span>
              <input
                value={form.ctaLink}
                onChange={(e) => set("ctaLink", e.target.value)}
                placeholder="/admission"
                className="ap-input mt-1"
              />
            </label>
          </div>

          {/* Button type / Overlay / Alignment / Duration */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <label className="block">
              <span className="text-xs font-bold uppercase tracking-widest text-[hsl(var(--ap-muted))]">
                Button style
              </span>
              <select
                value={form.buttonType}
                onChange={(e) => set("buttonType", e.target.value)}
                className="ap-input mt-1"
              >
                <option value="solid">Solid (filled)</option>
                <option value="outline">Outline</option>
                <option value="ghost">Ghost (text only)</option>
              </select>
            </label>
            <label className="block">
              <span className="text-xs font-bold uppercase tracking-widest text-[hsl(var(--ap-muted))]">
                Overlay %
              </span>
              <input
                type="number"
                min={0}
                max={100}
                value={form.overlay}
                onChange={(e) => set("overlay", e.target.value)}
                className="ap-input mt-1"
              />
            </label>
            <label className="block">
              <span className="text-xs font-bold uppercase tracking-widest text-[hsl(var(--ap-muted))]">
                Alignment
              </span>
              <select
                value={form.alignment}
                onChange={(e) => set("alignment", e.target.value)}
                className="ap-input mt-1"
              >
                <option value="left">Left</option>
                <option value="center">Center</option>
                <option value="right">Right</option>
              </select>
            </label>
            <label className="block">
              <span className="text-xs font-bold uppercase tracking-widest text-[hsl(var(--ap-muted))]">
                Duration (ms)
              </span>
              <input
                type="number"
                min={2000}
                step={500}
                value={form.duration}
                onChange={(e) => set("duration", e.target.value)}
                className="ap-input mt-1"
              />
            </label>
          </div>

          {/* Status / Active */}
          <div className="grid grid-cols-2 gap-4">
            <label className="block">
              <span className="text-xs font-bold uppercase tracking-widest text-[hsl(var(--ap-muted))]">
                Status
              </span>
              <select
                value={form.status}
                onChange={(e) => set("status", e.target.value)}
                className="ap-input mt-1"
              >
                <option value="published">Published</option>
                <option value="draft">Draft</option>
              </select>
            </label>
            <label className="flex items-center gap-2 text-sm font-medium cursor-pointer mt-6">
              <input
                type="checkbox"
                checked={form.isActive}
                onChange={(e) => set("isActive", e.target.checked)}
                className="accent-[hsl(var(--ap-primary))] w-4 h-4"
              />
              Active (visible on homepage)
            </label>
          </div>

          {/* Actions */}
          <div className="flex gap-2 pt-2">
            <button
              onClick={() => save()}
              disabled={saving}
              className="ap-btn flex-1 justify-center"
            >
              {saving ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" /> Saving…
                </>
              ) : editingId ? (
                "Save changes"
              ) : (
                "Add slide"
              )}
            </button>
            <button
              onClick={() => save("draft")}
              disabled={saving}
              className="ap-btn-secondary flex-1 justify-center"
            >
              Save as Draft
            </button>
            <button onClick={() => setModalOpen(false)} className="ap-btn-ghost">
              Cancel
            </button>
          </div>
        </div>
      </Modal>

      <GalleryPicker
        open={galleryOpen}
        onClose={() => setGalleryOpen(false)}
        onSelect={(url) => {
          if (galleryTarget === "desktop") {
            set("desktopImage", url);
          } else if (galleryTarget === "mobile") {
            set("mobileImage", url);
          } else {
            set("imageUrl", url);
          }
          setGalleryOpen(false);
        }}
      />

      <Modal open={!!confirmId} onClose={() => setConfirmId(null)} title="Delete hero slide?">
        <p className="text-sm text-[hsl(var(--ap-muted))] mb-2">
          This slide will be removed from the homepage hero. The default gradient slide will be
          shown instead.
        </p>
        <div className="flex gap-2">
          <button onClick={removeSlide} className="ap-btn-danger flex-1 justify-center">
            <Trash2 className="w-4 h-4" /> Delete slide
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
