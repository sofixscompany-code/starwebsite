import { useEffect, useState, type FormEvent } from "react";
import { doc, getDoc, setDoc } from "firebase/firestore";
import { db } from "@/integrations/firebase/config";
import { PageHeader } from "@/components/admin/AdminShell";
import { Panel } from "@/components/admin/ui";
import { Save, Loader2, Plus, Trash2, Upload, Image as ImageIcon } from "lucide-react";
import { toast } from "sonner";
import {
  PHYSICAL_TRAINING_DEFAULTS,
  type PhysicalTrainingData,
  type RoutineRow,
} from "@/hooks/use-physical-training";

interface Draft extends Omit<PhysicalTrainingData, "responsibilities" | "routine"> {
  responsibilities: string;
  routine: RoutineRow[];
}

const toDraft = (d: PhysicalTrainingData): Draft => ({
  ...d,
  responsibilities: d.responsibilities.join("\n"),
  routine: d.routine.map((r) => ({ ...r, note: r.note ?? "" })),
});

const emptyRow = (n: number): RoutineRow => ({ id: `r${n}`, time: "", activity: "", note: "" });

export function PhysicalTrainingPageAdmin() {
  const [draft, setDraft] = useState<Draft>(() => toDraft(PHYSICAL_TRAINING_DEFAULTS));
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    getDoc(doc(db, "site_settings", "physical_training"))
      .then((snap) => {
        if (snap.exists()) {
          const d = snap.data() as Partial<PhysicalTrainingData>;
          const base = { ...PHYSICAL_TRAINING_DEFAULTS, ...(d ?? {}) };
          setDraft(toDraft(base));
        }
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, []);

  const set = <K extends keyof Draft>(k: K, v: Draft[K]) => setDraft((s) => ({ ...s, [k]: v }));

  const setRow = (id: string, patch: Partial<RoutineRow>) =>
    setDraft((s) => ({
      ...s,
      routine: s.routine.map((r) => (r.id === id ? { ...r, ...patch } : r)),
    }));

  const addRow = () => setDraft((s) => ({ ...s, routine: [...s.routine, emptyRow(Date.now())] }));

  const removeRow = (id: string) =>
    setDraft((s) => ({ ...s, routine: s.routine.filter((r) => r.id !== id) }));

  const onPhoto = (file: File | undefined | null) => {
    if (!file) return;
    if (!file.type.startsWith("image/")) return toast.error("Choose an image file (PNG or JPG).");
    if (file.size > 900_000)
      return toast.error("Image too large — please use a file under 900 KB.");
    const reader = new FileReader();
    reader.onload = () => {
      set("photoUrl", String(reader.result || ""));
      toast.success("Photo loaded — press Save Changes to publish it.");
    };
    reader.onerror = () => toast.error("Could not read that image.");
    reader.readAsDataURL(file);
  };

  const handleSave = async (e: FormEvent) => {
    e.preventDefault();
    if (!draft.title.trim()) return toast.error("Title is required");
    setSaving(true);
    try {
      await setDoc(doc(db, "site_settings", "physical_training"), {
        title: draft.title.trim(),
        lead: draft.lead.trim(),
        responsibilityTitle: draft.responsibilityTitle.trim(),
        responsibilities: draft.responsibilities
          .split("\n")
          .map((s) => s.trim())
          .filter(Boolean)
          .map((text) => ({ text })),
        routineTitle: draft.routineTitle.trim(),
        routine: draft.routine
          .map((r, i) => ({
            id: r.id || `r${i}`,
            time: r.time.trim(),
            activity: r.activity.trim(),
            note: r.note.trim(),
          }))
          .filter((r) => r.time || r.activity),
        photoUrl: draft.photoUrl.trim(),
        attendanceRegisterLabel: draft.attendanceRegisterLabel.trim(),
        progressRegisterLabel: draft.progressRegisterLabel.trim(),
        updatedAt: new Date().toISOString(),
      });
      toast.success("Physical Training page saved");
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Failed to save");
    } finally {
      setSaving(false);
    }
  };

  return (
    <div>
      <PageHeader
        title="Physical Training"
        subtitle="Public /physical-training page — routine table, responsibility card, registers and photo"
      />
      {loading ? (
        <div className="flex items-center justify-center py-20">
          <Loader2 className="w-6 h-6 animate-spin text-muted-foreground" />
        </div>
      ) : (
        <form onSubmit={handleSave} className="max-w-4xl space-y-6">
          <Panel title="Page content">
            <div className="space-y-4">
              <label className="block">
                <span className="text-xs font-bold uppercase tracking-widest text-[hsl(var(--ap-muted))]">
                  Title
                </span>
                <input
                  className="ap-input mt-1"
                  value={draft.title}
                  onChange={(e) => set("title", e.target.value)}
                  placeholder="शारीरिक प्रशिक्षण"
                  required
                />
              </label>
              <label className="block">
                <span className="text-xs font-bold uppercase tracking-widest text-[hsl(var(--ap-muted))]">
                  Intro paragraph
                </span>
                <textarea
                  className="ap-input mt-1 min-h-[100px]"
                  value={draft.lead}
                  onChange={(e) => set("lead", e.target.value)}
                />
              </label>
              <div className="grid gap-4 sm:grid-cols-2">
                <label className="block">
                  <span className="text-xs font-bold uppercase tracking-widest text-[hsl(var(--ap-muted))]">
                    Attendance register label
                  </span>
                  <input
                    className="ap-input mt-1"
                    value={draft.attendanceRegisterLabel}
                    onChange={(e) => set("attendanceRegisterLabel", e.target.value)}
                  />
                </label>
                <label className="block">
                  <span className="text-xs font-bold uppercase tracking-widest text-[hsl(var(--ap-muted))]">
                    Progress register label
                  </span>
                  <input
                    className="ap-input mt-1"
                    value={draft.progressRegisterLabel}
                    onChange={(e) => set("progressRegisterLabel", e.target.value)}
                  />
                </label>
              </div>
            </div>
          </Panel>

          <Panel title="Responsibility card (जिम्मेवारी)">
            <div className="space-y-4">
              <label className="block">
                <span className="text-xs font-bold uppercase tracking-widest text-[hsl(var(--ap-muted))]">
                  Card heading
                </span>
                <input
                  className="ap-input mt-1"
                  value={draft.responsibilityTitle}
                  onChange={(e) => set("responsibilityTitle", e.target.value)}
                />
              </label>
              <label className="block">
                <span className="text-xs font-bold uppercase tracking-widest text-[hsl(var(--ap-muted))]">
                  Responsibility lines — one per line
                </span>
                <textarea
                  className="ap-input mt-1 min-h-[140px]"
                  value={draft.responsibilities}
                  onChange={(e) => set("responsibilities", e.target.value)}
                />
              </label>
            </div>
          </Panel>

          <Panel title="Daily routine table (60 / 90 min)">
            <div className="space-y-4">
              <label className="block">
                <span className="text-xs font-bold uppercase tracking-widest text-[hsl(var(--ap-muted))]">
                  Table heading
                </span>
                <input
                  className="ap-input mt-1"
                  value={draft.routineTitle}
                  onChange={(e) => set("routineTitle", e.target.value)}
                />
              </label>

              <div className="space-y-2">
                {draft.routine.map((r) => (
                  <div
                    key={r.id}
                    className="grid gap-2 sm:grid-cols-[160px_1fr_120px_40px] items-center"
                  >
                    <input
                      className="ap-input"
                      value={r.time}
                      placeholder="05:00 – 05:10"
                      onChange={(e) => setRow(r.id, { time: e.target.value })}
                    />
                    <input
                      className="ap-input"
                      value={r.activity}
                      placeholder="वार्मअप"
                      onChange={(e) => setRow(r.id, { activity: e.target.value })}
                    />
                    <input
                      className="ap-input"
                      value={r.note}
                      placeholder="१० मिनेट"
                      onChange={(e) => setRow(r.id, { note: e.target.value })}
                    />
                    <button
                      type="button"
                      className="ap-btn-ghost inline-flex items-center justify-center text-red-600"
                      onClick={() => removeRow(r.id)}
                      aria-label="Remove row"
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </div>
                ))}
                {draft.routine.length === 0 && (
                  <p className="text-sm text-muted-foreground">No rows — add one below.</p>
                )}
              </div>

              <button
                type="button"
                onClick={addRow}
                className="ap-btn-ghost inline-flex items-center gap-1 text-xs"
              >
                <Plus className="h-4 w-4" /> Add routine row
              </button>
            </div>
          </Panel>

          <Panel title="Training photo">
            <div className="flex flex-wrap items-center gap-4">
              <div className="h-24 w-32 shrink-0 rounded-lg border border-[hsl(var(--ap-border))] bg-white grid place-items-center overflow-hidden">
                {draft.photoUrl ? (
                  <img src={draft.photoUrl} alt="Training" className="h-full w-full object-cover" />
                ) : (
                  <ImageIcon className="h-6 w-6 text-muted-foreground" />
                )}
              </div>
              <label className="ap-btn-ghost inline-flex cursor-pointer items-center gap-1 text-xs">
                <Upload className="h-3.5 w-3.5" /> Upload photo
                <input
                  type="file"
                  accept="image/*"
                  className="hidden"
                  onChange={(e) => {
                    onPhoto(e.target.files?.[0]);
                    e.target.value = "";
                  }}
                />
              </label>
              <input
                className="ap-input flex-1 min-w-[240px]"
                value={draft.photoUrl.startsWith("data:") ? "" : draft.photoUrl}
                placeholder="/services/army.jpg — or paste an image URL"
                onChange={(e) => set("photoUrl", e.target.value)}
              />
            </div>
          </Panel>

          <button
            type="submit"
            disabled={saving}
            className="inline-flex items-center gap-2 px-5 py-2.5 rounded-lg bg-navy text-white text-sm font-bold hover:bg-navy/90 transition disabled:opacity-50"
          >
            {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
            Save Changes
          </button>
        </form>
      )}
    </div>
  );
}
