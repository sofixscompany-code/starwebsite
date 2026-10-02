import { useState, useEffect } from "react";
import { useModuleData } from "@/hooks/use-module-data";
import { PageHeader } from "@/components/admin/AdminShell";
import { Panel, Modal, EmptyState } from "@/components/admin/ui";
import { ImageUpload } from "@/components/admin/image-upload";
import { toast } from "sonner";
import {
  Images,
  Search,
  Trash2,
  Loader2,
  Copy,
  Check,
  ExternalLink,
  Filter,
  Plus,
  Info,
} from "lucide-react";

type MediaRow = {
  id: string;
  fileName?: string | null;
  fileUrl?: string | null;
  type?: string | null;
  category?: string | null;
  size?: number | null;
  width?: number | null;
  height?: number | null;
  uploadedBy?: string | null;
  createdAt?: string | null;
};

const CATEGORIES = [
  "All",
  "Hero",
  "Gallery",
  "Ads",
  "Faculty",
  "Results",
  "Selections",
  "Testimonials",
  "Other",
];

function formatBytes(bytes: number | null | undefined): string {
  if (!bytes) return "—";
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1048576) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / 1048576).toFixed(1)} MB`;
}

export function MediaLibraryPage() {
  const { rows: rawRows, loading, create, remove } = useModuleData("media_library");
  const rows = rawRows as MediaRow[];
  const [search, setSearch] = useState("");
  const [filterCat, setFilterCat] = useState("All");
  const [confirmId, setConfirmId] = useState<string | null>(null);
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [previewItem, setPreviewItem] = useState<MediaRow | null>(null);
  const [addOpen, setAddOpen] = useState(false);
  const [url, setUrl] = useState("");
  const [uploadUrl, setUploadUrl] = useState("");
  const [fileName, setFileName] = useState("");
  const [category, setCategory] = useState("Other");
  const [saving, setSaving] = useState(false);

  const guessType = (u: string) => {
    const clean = u.split("?")[0].split("#")[0].toLowerCase();
    if (clean.endsWith(".png")) return "image/png";
    if (clean.endsWith(".webp")) return "image/webp";
    if (clean.endsWith(".gif")) return "image/gif";
    if (clean.endsWith(".svg")) return "image/svg+xml";
    return "image/jpeg";
  };

  const nameFromUrl = (u: string) => {
    const last = u.split("?")[0].split("#")[0].split("/").pop() || "";
    try {
      return decodeURIComponent(last) || "image";
    } catch {
      return last || "image";
    }
  };

  const handleAddByUrl = async () => {
    const finalUrl = url.trim();
    if (!finalUrl) return toast.error("Paste an image URL first");
    if (!/^https?:\/\//i.test(finalUrl) && !finalUrl.startsWith("data:"))
      return toast.error("Enter a valid image URL (https://…)");
    setSaving(true);
    try {
      await create({
        fileName: fileName.trim() || nameFromUrl(finalUrl),
        fileUrl: finalUrl,
        type: guessType(finalUrl),
        category,
      });
      toast.success("Image added to the library");
      setUrl("");
      setFileName("");
      setAddOpen(false);
    } catch {
      toast.error("Failed to add image");
    } finally {
      setSaving(false);
    }
  };

  const filtered = rows.filter((r) => {
    const name = (r.fileName || "").toLowerCase();
    const cat = (r.category || "").toLowerCase();
    if (filterCat !== "All" && cat !== filterCat.toLowerCase()) return false;
    if (search && !name.includes(search.toLowerCase())) return false;
    return true;
  });

  const copyUrl = (url: string | null | undefined, id: string) => {
    if (!url) return;
    navigator.clipboard.writeText(url).then(() => {
      setCopiedId(id);
      toast.success("URL copied to clipboard");
      setTimeout(() => setCopiedId(null), 2000);
    });
  };

  const deleteMedia = async () => {
    if (!confirmId) return;
    try {
      await remove(confirmId);
      toast.success("Media deleted");
      setConfirmId(null);
    } catch {
      toast.error("Failed to delete");
    }
  };

  return (
    <div>
      <PageHeader
        title="Media Library"
        subtitle="All uploaded images. Search, filter, copy URL, and manage your media assets."
        actions={
          <button className="ap-btn" onClick={() => setAddOpen(true)}>
            <Plus className="w-4 h-4" /> Add Image
          </button>
        }
      />

      <div className="mb-4 flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search by filename…"
            className="ap-input pl-10"
          />
        </div>
        <div className="flex gap-1 flex-wrap">
          {CATEGORIES.map((c) => (
            <button
              key={c}
              onClick={() => setFilterCat(c)}
              className={`text-xs font-bold px-3 py-1.5 rounded-lg transition ${filterCat === c ? "bg-navy text-white" : "bg-slate-100 text-slate-600 hover:bg-slate-200"}`}
            >
              {c}
            </button>
          ))}
        </div>
      </div>

      <Panel title={`All media (${filtered.length})`}>
        {loading && rows.length === 0 ? (
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {Array.from({ length: 8 }).map((_, i) => (
              <div
                key={i}
                className="rounded-xl bg-gray-100 dark:bg-gray-800 animate-pulse aspect-square"
              />
            ))}
          </div>
        ) : filtered.length === 0 ? (
          <EmptyState
            icon={Images}
            title="No media files yet"
            desc="Use “Add Image” to upload a file or paste an image URL — images added from any admin page (Hero Slides, Gallery, Ads, etc.) also appear here."
          />
        ) : (
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
            {filtered.map((r) => (
              <div
                key={r.id}
                className="ap-card overflow-hidden group hover:shadow-lg transition-shadow"
              >
                <div
                  className="relative aspect-square bg-slate-100 cursor-pointer"
                  onClick={() => setPreviewItem(r)}
                >
                  {r.fileUrl ? (
                    <img
                      src={r.fileUrl}
                      alt={r.fileName ?? ""}
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center">
                      <Images className="w-8 h-8 text-slate-300" />
                    </div>
                  )}
                  <div className="absolute top-2 left-2 opacity-0 group-hover:opacity-100 transition-opacity flex gap-1">
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        copyUrl(r.fileUrl, r.id);
                      }}
                      className="bg-black/60 hover:bg-black/80 text-white rounded-md p-1.5 shadow transition-colors"
                      title="Copy URL"
                    >
                      {copiedId === r.id ? (
                        <Check className="w-3 h-3 text-green-400" />
                      ) : (
                        <Copy className="w-3 h-3" />
                      )}
                    </button>
                    {r.fileUrl && (
                      <a
                        href={r.fileUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        onClick={(e) => e.stopPropagation()}
                        className="bg-black/60 hover:bg-black/80 text-white rounded-md p-1.5 shadow transition-colors"
                        title="Open in new tab"
                      >
                        <ExternalLink className="w-3 h-3" />
                      </a>
                    )}
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        setConfirmId(r.id);
                      }}
                      className="bg-red-500/80 hover:bg-red-600 text-white rounded-md p-1.5 shadow transition-colors"
                      title="Delete"
                    >
                      <Trash2 className="w-3 h-3" />
                    </button>
                  </div>
                </div>
                <div className="p-2.5 space-y-1">
                  <p className="text-xs font-semibold text-[hsl(var(--ap-ink))] truncate">
                    {r.fileName || "Untitled"}
                  </p>
                  <div className="flex items-center gap-2 text-[10px] text-[hsl(var(--ap-muted))]">
                    <span>{formatBytes(r.size)}</span>
                    {r.width && r.height && (
                      <span>
                        {r.width}×{r.height}
                      </span>
                    )}
                    {r.category && (
                      <span className="px-1.5 py-0.5 rounded bg-navy/5 font-medium">
                        {r.category}
                      </span>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </Panel>

      <Modal
        open={!!previewItem}
        onClose={() => setPreviewItem(null)}
        size="lg"
        title={previewItem?.fileName || "Preview"}
      >
        {previewItem?.fileUrl && (
          <div className="space-y-4">
            <img
              src={previewItem.fileUrl}
              alt={previewItem.fileName ?? ""}
              className="w-full rounded-xl"
            />
            <div className="grid grid-cols-2 gap-3 text-xs text-[hsl(var(--ap-muted))]">
              <div>
                <span className="font-bold">Size:</span> {formatBytes(previewItem.size)}
              </div>
              <div>
                <span className="font-bold">Dimensions:</span>{" "}
                {previewItem.width && previewItem.height
                  ? `${previewItem.width}×${previewItem.height}`
                  : "—"}
              </div>
              <div>
                <span className="font-bold">Category:</span> {previewItem.category || "—"}
              </div>
              <div>
                <span className="font-bold">Uploaded:</span>{" "}
                {previewItem.createdAt ? new Date(previewItem.createdAt).toLocaleDateString() : "—"}
              </div>
            </div>
            <div className="flex gap-2">
              <button
                onClick={() => copyUrl(previewItem.fileUrl, previewItem.id)}
                className="ap-btn flex-1 justify-center"
              >
                {copiedId === previewItem.id ? (
                  <>
                    <Check className="w-4 h-4" /> Copied
                  </>
                ) : (
                  <>
                    <Copy className="w-4 h-4" /> Copy URL
                  </>
                )}
              </button>
              <button
                onClick={() => setPreviewItem(null)}
                className="ap-btn-secondary flex-1 justify-center"
              >
                Close
              </button>
            </div>
          </div>
        )}
      </Modal>

      <Modal open={!!confirmId} onClose={() => setConfirmId(null)} title="Delete media file?">
        <p className="text-sm text-[hsl(var(--ap-muted))] mb-2">
          This file will be permanently deleted. Any pages using this image may show a broken image.
        </p>
        <div className="flex gap-2">
          <button onClick={deleteMedia} className="ap-btn-danger flex-1 justify-center">
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

      <Modal open={addOpen} onClose={() => setAddOpen(false)} title="Add image">
        <div className="space-y-4">
          <div>
            <label className="text-xs font-bold uppercase tracking-wider text-gray-500 dark:text-gray-400 mb-1 block">
              Category
            </label>
            <select
              value={category}
              onChange={(e) => setCategory(e.target.value)}
              className="ap-input w-full"
            >
              {CATEGORIES.filter((c) => c !== "All").map((c) => (
                <option key={c} value={c}>
                  {c}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="text-xs font-bold uppercase tracking-wider text-gray-500 dark:text-gray-400 mb-1 block">
              Upload a file
            </label>
            <ImageUpload
              value={uploadUrl}
              folder={category.toLowerCase()}
              onChange={(u) => {
                setUploadUrl(u);
                if (u) {
                  toast.success("Image uploaded and added to the library");
                  setUploadUrl("");
                  setAddOpen(false);
                }
              }}
            />
            <p className="text-[11px] text-[hsl(var(--ap-muted))] mt-1.5 flex items-start gap-1.5">
              <Info className="w-3.5 h-3.5 mt-px shrink-0" />
              <span>
                File upload needs Firebase Storage enabled — if it isn&apos;t, paste a direct image
                URL below instead.
              </span>
            </p>
          </div>

          <div className="flex items-center gap-3">
            <div className="h-px flex-1 bg-[hsl(var(--ap-border))]" />
            <span className="text-[10px] font-bold uppercase tracking-widest text-[hsl(var(--ap-muted))]">
              or add by URL
            </span>
            <div className="h-px flex-1 bg-[hsl(var(--ap-border))]" />
          </div>

          <div>
            <label className="text-xs font-bold uppercase tracking-wider text-gray-500 dark:text-gray-400 mb-1 block">
              Image URL
            </label>
            <input
              value={url}
              onChange={(e) => setUrl(e.target.value)}
              placeholder="https://…/image.jpg"
              className="ap-input w-full"
            />
          </div>
          <div>
            <label className="text-xs font-bold uppercase tracking-wider text-gray-500 dark:text-gray-400 mb-1 block">
              File name <span className="normal-case font-normal">(optional)</span>
            </label>
            <input
              value={fileName}
              onChange={(e) => setFileName(e.target.value)}
              placeholder="hero-slide.jpg"
              className="ap-input w-full"
            />
          </div>

          <div className="flex justify-end gap-3 pt-3 border-t border-[hsl(var(--ap-border))]">
            <button className="ap-btn-ghost" onClick={() => setAddOpen(false)}>
              Cancel
            </button>
            <button className="ap-btn" onClick={handleAddByUrl} disabled={saving || !url.trim()}>
              {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Plus className="w-4 h-4" />}
              Add by URL
            </button>
          </div>
        </div>
      </Modal>
    </div>
  );
}
