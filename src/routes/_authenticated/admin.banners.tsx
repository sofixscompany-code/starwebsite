import {  } from "react-router-dom";
import { useState } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { Loader2, Trash2, Upload, Image as ImageIcon, Eye, EyeOff } from "lucide-react";
import { collection, addDoc, updateDoc, deleteDoc, doc, query, orderBy, getDocs, serverTimestamp } from "firebase/firestore";
import { getStorage, ref, uploadBytes, getDownloadURL, deleteObject } from "firebase/storage";
import { db } from "@/integrations/firebase/config";
import { PageHeader } from "@/components/admin/AdminShell";
import { Panel, Badge } from "@/components/admin/ui";

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
  const [uploading, setUploading] = useState(false);

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

      toast.success("Banner added");
      setForm({ title: "", subtitle: "", ctaText: "", ctaLink: "", sortOrder: "0" });
      setFile(null);
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

  return (
    <div>
      <PageHeader title="Hero Banners" subtitle="Auto-sliding banner shown on the homepage." />
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        <Panel title="Upload new banner" subtitle="Landscape image, e.g. 1600x700" className="lg:col-span-1">
          <div className="space-y-3">
            <label className="block">
              <span className="text-xs font-bold uppercase tracking-widest text-[hsl(var(--ap-muted))]">Image</span>
              <input type="file" accept="image/*" onChange={(e) => setFile(e.target.files?.[0] ?? null)} className="ap-input mt-1" />
            </label>
            {[
              ["Title", "title"],
              ["Subtitle", "subtitle"],
              ["Button text", "ctaText"],
              ["Button link", "ctaLink"],
              ["Sort order", "sortOrder"],
            ].map(([label, k]) => (
              <label key={k} className="block">
                <span className="text-xs font-bold uppercase tracking-widest text-[hsl(var(--ap-muted))]">{label}</span>
                <input value={(form as Record<string, string>)[k]} onChange={(e) => setForm({ ...form, [k]: e.target.value })} className="ap-input mt-1" />
              </label>
            ))}
            <button onClick={addBanner} disabled={uploading} className="ap-btn w-full justify-center">
              {uploading ? <><Loader2 className="w-4 h-4 animate-spin" /> Uploading…</> : <><Upload className="w-4 h-4" /> Add banner</>}
            </button>
          </div>
        </Panel>

        <Panel title={`All banners (${data.length})`} className="lg:col-span-2">
          {isLoading ? (
            <Loader2 className="w-5 h-5 animate-spin" />
          ) : data.length === 0 ? (
            <div className="text-center py-10 text-[hsl(var(--ap-muted))]">
              <ImageIcon className="w-8 h-8 mx-auto mb-2 opacity-40" />
              No banners yet.
            </div>
          ) : (
            <div className="grid gap-3 md:grid-cols-2">
              {data.map((b: any) => (
                <div key={b.id} className="ap-card overflow-hidden">
                  <img src={b.imageUrl} alt={b.title ?? ""} className="w-full h-32 object-cover" />
                  <div className="p-3">
                    <div className="flex items-center justify-between gap-2">
                      <p className="font-bold text-sm truncate">{b.title || "(untitled)"}</p>
                      <Badge tone={b.isActive ? "success" : "muted"}>{b.isActive ? "Active" : "Hidden"}</Badge>
                    </div>
                    <p className="text-xs text-[hsl(var(--ap-muted))] truncate">{b.subtitle || "—"}</p>
                    <div className="flex gap-2 mt-3">
                      <button onClick={() => toggleActive(b.id, b.isActive)} className="ap-btn-ghost flex-1 justify-center">
                        {b.isActive ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
                        {b.isActive ? "Hide" : "Show"}
                      </button>
                      <button onClick={() => del(b.id, b.storagePath)} className="ap-btn-ghost">
                        <Trash2 className="w-3.5 h-3.5 text-[hsl(var(--ap-danger))]" />
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


