import { useState, useEffect, type FormEvent } from "react";
import { doc, getDoc, setDoc } from "@/integrations/aws/firestore";
import { db } from "@/integrations/aws/config";
import { PageHeader } from "@/components/admin/AdminShell";
import { Panel } from "@/components/admin/ui";
import { Save, Loader2, Quote, User } from "lucide-react";
import { toast } from "sonner";

export function MdMessagePage() {
  const [name, setName] = useState("");
  const [initials, setInitials] = useState("");
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    getDoc(doc(db, "homepage_settings", "md_message")).then((snap) => {
      if (snap.exists()) {
        const d = snap.data();
        setName((d.name as string) ?? "");
        setInitials((d.initials as string) ?? "");
        setMessage((d.message as string) ?? "");
      }
      setLoading(false);
    });
  }, []);

  const handleSave = async (e: FormEvent) => {
    e.preventDefault();
    setSaving(true);
    try {
      await setDoc(doc(db, "homepage_settings", "md_message"), {
        name,
        initials,
        message,
      });
      toast.success("MD Message saved successfully");
    } catch {
      toast.error("Failed to save");
    }
    setSaving(false);
  };

  return (
    <div>
      <PageHeader title="MD Message" subtitle="Managing Director message shown on the homepage" />
      {loading ? (
        <div className="flex items-center justify-center py-20">
          <Loader2 className="w-6 h-6 animate-spin text-muted-foreground" />
        </div>
      ) : (
        <form onSubmit={handleSave} className="max-w-3xl space-y-6">
          <Panel title="Message Settings">
            <div className="space-y-4">
              <label className="block">
                <span className="text-xs font-bold uppercase tracking-widest text-[hsl(var(--ap-muted))]">
                  Managing Director Name
                </span>
                <div className="relative mt-1">
                  <User className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                  <input
                    className="ap-input pl-9"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="Er. Bablu Yadav"
                    required
                  />
                </div>
              </label>
              <label className="block">
                <span className="text-xs font-bold uppercase tracking-widest text-[hsl(var(--ap-muted))]">
                  Initials (shown in avatar)
                </span>
                <input
                  className="ap-input mt-1"
                  value={initials}
                  onChange={(e) => setInitials(e.target.value.toUpperCase())}
                  placeholder="BY"
                  maxLength={3}
                  required
                />
              </label>
              <label className="block">
                <span className="text-xs font-bold uppercase tracking-widest text-[hsl(var(--ap-muted))]">
                  Message
                </span>
                <textarea
                  className="ap-input mt-1 min-h-[160px]"
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
                  placeholder="Dear students and parents..."
                  required
                />
              </label>
            </div>
          </Panel>

          {/* Preview */}
          <Panel title="Preview">
            <div className="bg-white border border-border rounded-2xl p-6 relative">
              <Quote className="absolute top-4 left-4 w-10 h-10 text-brand-red/10" />
              <div className="flex items-start gap-5">
                <div className="w-16 h-16 rounded-full bg-navy text-navy-foreground flex items-center justify-center font-display font-black text-2xl shrink-0">
                  {initials || "BY"}
                </div>
                <div>
                  <p className="text-xs uppercase tracking-widest text-brand-red font-bold">
                    Message from the Managing Director
                  </p>
                  <h3 className="font-display font-black text-xl text-navy mt-1">
                    {name || "Er. Bablu Yadav"}
                  </h3>
                  <p className="mt-3 text-sm text-foreground leading-relaxed">
                    "{message || "Your message here..."}"
                  </p>
                </div>
              </div>
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
