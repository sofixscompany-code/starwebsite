import { useState, useRef, useCallback } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { Loader2, Trash2, Upload, Image as ImageIcon, Eye, EyeOff, GripVertical, FileType, AlertCircle } from "lucide-react";
import { collection, addDoc, updateDoc, deleteDoc, doc, query, orderBy, getDocs, serverTimestamp } from "firebase/firestore";
import { getStorage, ref, uploadBytes, getDownloadURL, deleteObject } from "firebase/storage";
import { db } from "@/integrations/firebase/config";
import { PageHeader } from "@/components/admin/AdminShell";
import { Panel, Badge } from "@/components/admin/ui";

const ALLOWED_TYPES = ["image/jpeg", "image/png", "image/webp"];
const MAX_SIZE = 10 * 1024 * 1024; // 10MB

export function BannersPage() {
  const qc = useQueryClient();
  const { data = [], isLoading } = useQuery({
    queryKey: ["admin-banners"],
    queryFn: async () => {
      const q = query(collection(db, "banners"), orderBy("sortOrder"), orderBy("createdAt"));
      const snap = await getDocs(q);
      return snap.docs.map((d) => ({ id: d.id, ...d.data() }));
    },
  });

  const [form, setForm] = useState({ title: "", subtitle: "", ctaText: "", ctaLink: "", sortOrder: "0" });
  const [file, setFile] = useState<File | null>(null);
  const [preview, setPreview] = useState<string | null>(null);
  const [uploading, setUploading] = useState(false);
  const [dragOver, setDragOver] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const validateFile = (f: File): boolean => {
    if (!ALLOWED_TYPES.includes(f.type)) {
      toast.error("Only JPEG, PNG, and WebP images are allowed");
      return false;
    }
    if (f.size > MAX_SIZE) {
      toast.error("Image too large (max 10MB)");
      return false;
    }
    return true;
  };

  const handleFileSelect = (f: File | null) => {
    if (!f) return;
    if (!validateFile(f)) return;
    setFile(f);
    setPreview(URL.createObjectURL(f));
  };

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setDragOver(false);
    const f = e.dataTransfer.files?.[0];
    handleFileSelect(f);
  }, []);

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setDragOver(true);
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    setDragOver(false);
  };

  const addBanner = async () => {
    if (!file) return toast.error("Please choose an image.");
    setUploading(true);
    try {
      const storage = getStorage();
      const ext = file.name.split(".").pop() || "jpg";
      const path = `banners/${Date.now()}-${Math.random().toString(36).slice(2, 8)}.${ext}`;
      const storageRef = ref(storage, path);
      await uploadBytes(storageRef, file, { contentType: file.type });
      const imageUrl = await getDownloadURL(storageRef);

      await addDoc(collection(db, "banners"), {
        title: form.title || null,
        subtitle: form.subtitle || null,
        ctaText: form.ctaText || null,
        ctaLink: form.ctaLink || null,
        sortOrder: Number(form.sortOrder) || 0,
        imageUrl,
        storagePath: path,
        isActive: true,
        createdAt: serverTimestamp(),
      });

      toast.success("Banner added successfully");
      setForm({ title: "", subtitle: "", ctaText: "", ctaLink: "", sortOrder: "0" });
      setFile(null);
      setPreview(null);
      qc.invalidateQueries({ queryKey: ["admin-banners"] });
      qc.invalidateQueries({ queryKey: ["hero-banners"] });
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Upload failed");
    } finally { setUploading(false); }
  };

  const toggleActive = async (id: string, isActive: boolean) => {
    await updateDoc(doc(db, "banners", id), { isActive: !isActive });
    qc.invalidateQueries({ queryKey: ["admin-banners"] });
    qc.invalidateQueries({ queryKey: ["hero-banners"] });
  };

  const del = async (id: string, storagePath: string | null) => {
    if (!confirm("Delete this banner?")) return;
    if (storagePath) {
      try {
        const storage = getStorage();
        await deleteObject(ref(storage, storagePath));
      } catch { /* ignore if not found */ }
    }
    await deleteDoc(doc(db, "banners", id));
    qc.invalidateQueries({ queryKey: ["admin-banners"] });
    qc.invalidateQueries({ queryKey: ["hero-banners"] });
  };

  const clearSelection = () => {
    setFile(null);
    setPreview(null);
    if (fileInputRef.current) fileInputRef.current.value = "";
  };

  return (
    <div>
      <PageHeader title="Feature Slides / Banners" subtitle="Image slides shown on the homepage hero. Supported: JPEG, PNG, WebP. Max 10MB." />
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Upload Panel */}
        <Panel title="Add new slide" className="lg:col-span-1">
          <div className="space-y-4">
            {/* Drag-and-drop zone */}
            <div
              onDrop={handleDrop}
              onDragOver={handleDragOver}
              onDragLeave={handleDragLeave}
              onClick={() => fileInputRef.current?.click()}
              className={`relative border-2 border-dashed rounded-2xl p-6 text-center cursor-pointer transition-all duration-200 ${
                dragOver
                  ? "border-emerald-400 bg-emerald-50 scale-[1.02]"
                  : "border-slate-200 hover:border-navy/40 hover:bg-slate-50"
              }`}
            >
              <input
                ref={fileInputRef}
                type="file"
                accept=".jpg,.jpeg,.png,.webp"
                onChange={(e) => handleFileSelect(e.target.files?.[0] ?? null)}
                className="hidden"
              />
              {preview ? (
                <div className="relative group">
                  <img src={preview} alt="Preview" className="w-full h-36 object-cover rounded-xl" />
                  <button
                    type="button"
                    onClick={(e) => { e.stopPropagation(); clearSelection(); }}
                    className="absolute top-2 right-2 bg-red-500 text-white rounded-full p-1.5 opacity-0 group-hover:opacity-100 transition-opacity shadow-lg hover:bg-red-600"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              ) : (
                <div className="space-y-2">
                  <div className="w-12 h-12 rounded-2xl bg-navy/5 flex items-center justify-center mx-auto">
                    <Upload className="w-5 h-5 text-navy/40" />
                  </div>
                  <p className="text-sm font-semibold text-slate-600">
                    Drop image here or click to browse
                  </p>
                  <p className="text-xs text-slate-400">
                    JPEG, PNG, WebP &middot; Max 10MB
                  </p>
                </div>
              )}
            </div>

            {/* Form fields */}
            {[
              ["Title", "title", "text"],
              ["Subtitle", "subtitle", "text"],
              ["Button text", "ctaText", "text"],
              ["Button link", "ctaLink", "text"],
              ["Sort order", "sortOrder", "number"],
            ].map(([label, k, type]) => (
              <label key={k} className="block">
                <span className="text-xs font-bold uppercase tracking-widest text-[hsl(var(--ap-muted))]">{label}</span>
                <input
                  type={type}
                  value={(form as Record<string, string>)[k]}
                  onChange={(e) => setForm({ ...form, [k]: e.target.value })}
                  className="ap-input mt-1"
                  placeholder={label}
                />
              </label>
            ))}

            <button onClick={addBanner} disabled={uploading || !file} className="ap-btn w-full justify-center">
              {uploading ? (
                <><Loader2 className="w-4 h-4 animate-spin" /> Uploading&hellip;</>
              ) : (
                <><Upload className="w-4 h-4" /> Add slide</>
              )}
            </button>
          </div>
        </Panel>

        {/* Slides grid */}
        <Panel title={`All slides (${data.length})`} className="lg:col-span-2">
          {isLoading ? (
            <div className="flex justify-center py-10"><Loader2 className="w-6 h-6 animate-spin text-navy/40" /></div>
          ) : data.length === 0 ? (
            <div className="text-center py-12 text-[hsl(var(--ap-muted))]">
              <ImageIcon className="w-12 h-12 mx-auto mb-3 opacity-30" />
              <p className="font-semibold">No slides yet</p>
              <p className="text-sm mt-1">Upload your first banner image to get started.</p>
            </div>
          ) : (
            <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-2">
              {data.map((b: any) => (
                <div key={b.id} className="ap-card overflow-hidden group hover:shadow-lg transition-shadow">
                  <div className="relative">
                    <img src={b.imageUrl} alt={b.title ?? ""} className="w-full h-40 object-cover" />
                    <div className="absolute top-2 right-2 flex gap-1.5">
                      <Badge tone={b.isActive ? "success" : "muted"}>{b.isActive ? "Active" : "Hidden"}</Badge>
                      {b.imageUrl?.endsWith(".webp") && (
                        <span className="bg-purple-100 text-purple-700 text-[10px] font-bold px-1.5 py-0.5 rounded">WebP</span>
                      )}
                    </div>
                  </div>
                  <div className="p-4 space-y-2">
                    <div className="flex items-start justify-between gap-2">
                      <div className="min-w-0">
                        <p className="font-bold text-sm text-gray-900 truncate">{b.title || <span className="italic text-gray-400">Untitled</span>}</p>
                        {b.subtitle && <p className="text-xs text-gray-500 truncate">{b.subtitle}</p>}
                      </div>
                      <span className="text-[10px] text-gray-400 font-mono shrink-0">#{b.sortOrder ?? "–"}</span>
                    </div>
                    {b.ctaText && (
                      <div className="flex items-center gap-1.5 text-[11px] text-navy font-medium">
                        <span className="px-1.5 py-0.5 rounded bg-navy/5">{b.ctaText}</span>
                        {b.ctaLink && <span className="text-gray-400 truncate">{b.ctaLink}</span>}
                      </div>
                    )}
                    <div className="flex gap-2 pt-1 border-t border-slate-100">
                      <button onClick={() => toggleActive(b.id, b.isActive)} className="ap-btn-ghost flex-1 justify-center text-xs">
                        {b.isActive ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
                        {b.isActive ? "Hide" : "Show"}
                      </button>
                      <button onClick={() => del(b.id, b.storagePath)} className="ap-btn-ghost text-xs">
                        <Trash2 className="w-3.5 h-3.5 text-[hsl(var(--ap-danger))]" />
                        Delete
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </Panel>
      </div>
    </div>
  );
}
