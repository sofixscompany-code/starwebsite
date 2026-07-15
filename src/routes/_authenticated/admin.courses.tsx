import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { Plus, Trash2, BookOpen } from "lucide-react";
import { PageHeader } from "@/components/admin/AdminShell";
import { Panel, Badge } from "@/components/admin/ui";

export const Route = createFileRoute("/_authenticated/admin/courses")({
  component: CoursesPage,
});

function CoursesPage() {
  const qc = useQueryClient();
  const { data = [] } = useQuery({
    queryKey: ["admin-courses"],
    queryFn: async () => (await supabase.from("courses").select("*").order("sort_order")).data ?? [],
  });
  const [form, setForm] = useState({ slug: "", title: "", category: "", short_description: "", duration: "", fee_npr: "" });

  const add = async () => {
    if (!form.slug || !form.title || !form.category) return toast.error("Slug, title, category required.");
    const { error } = await supabase.from("courses").insert({
      slug: form.slug, title: form.title, category: form.category,
      short_description: form.short_description || null, duration: form.duration || null,
      fee_npr: form.fee_npr ? Number(form.fee_npr) : null,
    });
    if (error) return toast.error(error.message);
    toast.success("Course added");
    setForm({ slug: "", title: "", category: "", short_description: "", duration: "", fee_npr: "" });
    qc.invalidateQueries({ queryKey: ["admin-courses"] });
  };
  const del = async (id: string) => {
    if (!confirm("Delete this course?")) return;
    await supabase.from("courses").delete().eq("id", id);
    qc.invalidateQueries({ queryKey: ["admin-courses"] });
  };

  return (
    <div>
      <PageHeader title="Courses" subtitle="Course catalog · batches · seats · fees." />
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        <Panel title="Add course" className="lg:col-span-1">
          <div className="space-y-3">
            {[
              ["Slug", "slug", "nepal-police"],
              ["Title", "title", "Nepal Police Preparation"],
              ["Category", "category", "Public Service"],
              ["Duration", "duration", "3 months"],
              ["Fee (NPR)", "fee_npr", "18000"],
            ].map(([label, k, ph]) => (
              <label key={k} className="block">
                <span className="text-xs font-bold uppercase tracking-widest text-[hsl(var(--ap-muted))]">{label}</span>
                <input value={(form as Record<string, string>)[k]} onChange={(e) => setForm({ ...form, [k]: e.target.value })} placeholder={ph} className="ap-input mt-1" />
              </label>
            ))}
            <label className="block">
              <span className="text-xs font-bold uppercase tracking-widest text-[hsl(var(--ap-muted))]">Short description</span>
              <textarea value={form.short_description} onChange={(e) => setForm({ ...form, short_description: e.target.value })} rows={3} className="ap-input mt-1" />
            </label>
            <button onClick={add} className="ap-btn w-full justify-center"><Plus className="w-4 h-4" /> Add course</button>
          </div>
        </Panel>

        <div className="lg:col-span-2 grid grid-cols-1 md:grid-cols-2 gap-3">
          {data.map((c) => (
            <div key={c.id} className="ap-card p-4 relative overflow-hidden group">
              <div className="absolute -top-6 -right-6 w-24 h-24 rounded-full ap-grad opacity-20 blur-2xl" />
              <div className="flex items-start gap-3">
                <div className="w-11 h-11 rounded-xl ap-grad flex items-center justify-center text-white">
                  <BookOpen className="w-5 h-5" />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <p className="font-bold truncate">{c.title}</p>
                    <Badge tone="purple">{c.category}</Badge>
                  </div>
                  <p className="text-xs text-[hsl(var(--ap-muted))] mt-1 line-clamp-2">{c.short_description || "—"}</p>
                  <div className="flex items-center gap-3 mt-3 text-xs">
                    <span className="text-[hsl(var(--ap-muted))]">Duration: <b className="text-[hsl(var(--ap-ink))]">{c.duration || "—"}</b></span>
                    <span className="text-[hsl(var(--ap-muted))]">Fee: <b className="text-[hsl(var(--ap-success))]">₹{c.fee_npr?.toLocaleString() || "—"}</b></span>
                  </div>
                </div>
                <button onClick={() => del(c.id)} className="opacity-0 group-hover:opacity-100 transition">
                  <Trash2 className="w-4 h-4 text-[hsl(var(--ap-danger))]" />
                </button>
              </div>
            </div>
          ))}
          {data.length === 0 && (
            <div className="ap-card p-10 text-center text-[hsl(var(--ap-muted))] md:col-span-2">
              No courses yet.
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
