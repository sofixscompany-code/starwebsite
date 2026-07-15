import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { Plus, Trash2 } from "lucide-react";
import { PageHeader } from "@/components/admin/AdminShell";
import { Panel, Badge } from "@/components/admin/ui";

export const Route = createFileRoute("/_authenticated/admin/notices")({
  component: NoticesPage,
});

function NoticesPage() {
  const qc = useQueryClient();
  const { data = [] } = useQuery({
    queryKey: ["admin-notices"],
    queryFn: async () => (await supabase.from("notices").select("*").order("published_at", { ascending: false })).data ?? [],
  });
  const [form, setForm] = useState({ title: "", body: "", category: "general" });

  const add = async () => {
    if (!form.title || !form.body) return toast.error("Title and body required.");
    const { error } = await supabase.from("notices").insert(form);
    if (error) return toast.error(error.message);
    toast.success("Published");
    setForm({ title: "", body: "", category: "general" });
    qc.invalidateQueries({ queryKey: ["admin-notices"] });
    qc.invalidateQueries({ queryKey: ["home-notices"] });
  };
  const del = async (id: string) => {
    if (!confirm("Delete?")) return;
    await supabase.from("notices").delete().eq("id", id);
    qc.invalidateQueries({ queryKey: ["admin-notices"] });
    qc.invalidateQueries({ queryKey: ["home-notices"] });
  };

  return (
    <div>
      <PageHeader title="Notices" subtitle="Publish announcements to students and parents." />
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        <Panel title="New notice" className="lg:col-span-1">
          <div className="space-y-3">
            <label className="block">
              <span className="text-xs font-bold uppercase tracking-widest text-[hsl(var(--ap-muted))]">Title</span>
              <input value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} className="ap-input mt-1" />
            </label>
            <label className="block">
              <span className="text-xs font-bold uppercase tracking-widest text-[hsl(var(--ap-muted))]">Category</span>
              <select value={form.category} onChange={(e) => setForm({ ...form, category: e.target.value })} className="ap-input mt-1">
                <option value="general">General</option><option value="admission">Admission</option>
                <option value="exam">Exam</option><option value="scholarship">Scholarship</option>
                <option value="batch">Batch</option>
              </select>
            </label>
            <label className="block">
              <span className="text-xs font-bold uppercase tracking-widest text-[hsl(var(--ap-muted))]">Body</span>
              <textarea rows={4} value={form.body} onChange={(e) => setForm({ ...form, body: e.target.value })} className="ap-input mt-1" />
            </label>
            <button onClick={add} className="ap-btn w-full justify-center"><Plus className="w-4 h-4" /> Publish</button>
          </div>
        </Panel>
        <Panel title={`All notices (${data.length})`} className="lg:col-span-2">
          <div className="space-y-2">
            {data.map((n) => (
              <div key={n.id} className="ap-card p-3 flex items-start justify-between gap-3 group">
                <div className="min-w-0">
                  <div className="flex items-center gap-2">
                    <Badge tone="orange">{n.category}</Badge>
                    <p className="font-bold truncate">{n.title}</p>
                  </div>
                  <p className="text-xs text-[hsl(var(--ap-muted))] mt-1">{n.body}</p>
                </div>
                <button onClick={() => del(n.id)} className="opacity-0 group-hover:opacity-100 transition">
                  <Trash2 className="w-4 h-4 text-[hsl(var(--ap-danger))]" />
                </button>
              </div>
            ))}
            {data.length === 0 && <p className="text-center text-sm text-[hsl(var(--ap-muted))] py-6">No notices yet.</p>}
          </div>
        </Panel>
      </div>
    </div>
  );
}
