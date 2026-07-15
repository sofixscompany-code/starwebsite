import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { Loader2, Trash2, Upload, Image as ImageIcon, Eye, EyeOff } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { PageHeader } from "@/components/admin/AdminShell";
import { Panel, Badge } from "@/components/admin/ui";

export const Route = createFileRoute("/_authenticated/admin/banners")({
  component: BannersPage,
});

function BannersPage() {
  const qc = useQueryClient();
  const { data = [], isLoading } = useQuery({
    queryKey: ["admin-banners"],
    queryFn: async () => {
      const { data } = await supabase.from("banners").select("*").order("sort_order").order("created_at");
      return data ?? [];
    },
  });

  const [form, setForm] = useState({ title: "", subtitle: "", cta_text: "", cta_link: "", sort_order: "0" });
  const [file, setFile] = useState<File | null>(null);
  const [uploading, setUploading] = useState(false);

  const addBanner = async () => {
    if (!file) return toast.error("Please choose an image.");
    setUploading(true);
    try {
      const ext = file.name.split(".").pop() || "jpg";
      const path = `${Date.now()}-${Math.random().toString(36).slice(2, 8)}.${ext}`;
      const { error: upErr } = await supabase.storage.from("banners").upload(path, file, { contentType: file.type });
      if (upErr) throw upErr;
      const { data: signed, error: sErr } = await supabase.storage.from("banners").createSignedUrl(path, 60 * 60 * 24 * 365 * 10);
      if (sErr || !signed) throw sErr ?? new Error("URL");
      const { error } = await supabase.from("banners").insert({
        title: form.title || null, subtitle: form.subtitle || null,
        cta_text: form.cta_text || null, cta_link: form.cta_link || null,
        sort_order: Number(form.sort_order) || 0,
        image_url: signed.signedUrl, storage_path: path,
      });
      if (error) throw error;
      toast.success("Banner added");
      setForm({ title: "", subtitle: "", cta_text: "", cta_link: "", sort_order: "0" });
      setFile(null);
      qc.invalidateQueries({ queryKey: ["admin-banners"] });
      qc.invalidateQueries({ queryKey: ["hero-banners"] });
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Upload failed");
    } finally { setUploading(false); }
  };

  const toggleActive = async (id: string, is_active: boolean) => {
    await supabase.from("banners").update({ is_active: !is_active }).eq("id", id);
    qc.invalidateQueries({ queryKey: ["admin-banners"] });
    qc.invalidateQueries({ queryKey: ["hero-banners"] });
  };
  const del = async (id: string, path: string | null) => {
    if (!confirm("Delete this banner?")) return;
    if (path) await supabase.storage.from("banners").remove([path]);
    await supabase.from("banners").delete().eq("id", id);
    qc.invalidateQueries({ queryKey: ["admin-banners"] });
    qc.invalidateQueries({ queryKey: ["hero-banners"] });
  };

  return (
    <div>
      <PageHeader title="Hero Banners" subtitle="Auto-sliding banner shown on the homepage." />
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        <Panel title="Upload new banner" subtitle="Landscape image, e.g. 1600×700" className="lg:col-span-1">
          <div className="space-y-3">
            <label className="block">
              <span className="text-xs font-bold uppercase tracking-widest text-[hsl(var(--ap-muted))]">Image</span>
              <input type="file" accept="image/*" onChange={(e) => setFile(e.target.files?.[0] ?? null)} className="ap-input mt-1" />
            </label>
            {[
              ["Title", "title"],
              ["Subtitle", "subtitle"],
              ["Button text", "cta_text"],
              ["Button link", "cta_link"],
              ["Sort order", "sort_order"],
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
              {data.map((b) => (
                <div key={b.id} className="ap-card overflow-hidden">
                  <img src={b.image_url} alt={b.title ?? ""} className="w-full h-32 object-cover" />
                  <div className="p-3">
                    <div className="flex items-center justify-between gap-2">
                      <p className="font-bold text-sm truncate">{b.title || "(untitled)"}</p>
                      <Badge tone={b.is_active ? "success" : "muted"}>{b.is_active ? "Active" : "Hidden"}</Badge>
                    </div>
                    <p className="text-xs text-[hsl(var(--ap-muted))] truncate">{b.subtitle || "—"}</p>
                    <div className="flex gap-2 mt-3">
                      <button onClick={() => toggleActive(b.id, b.is_active)} className="ap-btn-ghost flex-1 justify-center">
                        {b.is_active ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
                        {b.is_active ? "Hide" : "Show"}
                      </button>
                      <button onClick={() => del(b.id, b.storage_path)} className="ap-btn-ghost">
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
