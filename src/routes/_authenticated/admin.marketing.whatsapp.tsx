import { useState } from "react";
import { FirestoreModulePage } from "@/components/admin/FirestoreModulePage";
import { Modal } from "@/components/admin/ui";
import { useModuleData } from "@/hooks/use-module-data";
import { db } from "@/integrations/firebase/config";
import { addDoc, collection } from "firebase/firestore";
import { toast } from "sonner";
import { MessageCircle, FileText, Save, Loader2, Info } from "lucide-react";

const AUDIENCES = ["All users", "All students", "All parents", "All teachers", "Custom list"];

export default function WhatsAppPage() {
  const { rows: campaigns } = useModuleData("whatsapp_campaigns");
  const { rows: drafts } = useModuleData("marketing_drafts");
  const channelDrafts = drafts.filter((d) => String(d.channel) === "whatsapp");

  const [draftOpen, setDraftOpen] = useState(false);
  const [audience, setAudience] = useState(AUDIENCES[0]);
  const [message, setMessage] = useState("");
  const [saving, setSaving] = useState(false);

  const saveDraft = async () => {
    if (!message.trim()) return toast.error("Write the message before saving a draft");
    setSaving(true);
    try {
      await addDoc(collection(db, "marketing_drafts"), {
        channel: "whatsapp",
        message: message.trim(),
        audience,
        status: "draft",
        createdAt: new Date().toISOString(),
      });
      toast.success("Saved as draft — connect a gateway to send");
      setMessage("");
      setDraftOpen(false);
    } catch {
      toast.error("Could not save the draft");
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="space-y-4">
      <div className="flex items-start gap-2 rounded-xl border border-[hsl(var(--ap-border))] bg-[hsl(var(--ap-surface))] px-4 py-3">
        <Info className="w-4 h-4 mt-0.5 shrink-0 text-[hsl(var(--ap-muted))]" />
        <p className="text-xs text-[hsl(var(--ap-muted))]">
          Campaign sending requires a WhatsApp Business gateway — drafts are saved here.
        </p>
      </div>

      <FirestoreModulePage
        collectionName="whatsapp_campaigns"
        title="WhatsApp Campaigns"
        subtitle="Compose and store WhatsApp broadcasts as drafts — no WhatsApp gateway is connected, so nothing is sent yet"
        actions={
          <button className="ap-btn" onClick={() => setDraftOpen(true)}>
            <Save className="w-4 h-4" /> Save Draft
          </button>
        }
        stats={[
          { label: "Campaigns", value: campaigns.length, icon: MessageCircle, tone: "purple" },
          { label: "Saved Drafts", value: channelDrafts.length, icon: FileText, tone: "info" },
        ]}
        columns={[
          { key: "name", label: "Campaign" },
          { key: "recipients", label: "Recipients" },
          {
            key: "message",
            label: "Message",
            render: (row) => (
              <span className="block max-w-[260px] truncate text-[hsl(var(--ap-muted))]">
                {row.message ? String(row.message) : "—"}
              </span>
            ),
          },
          { key: "status", label: "Status" },
        ]}
        fields={[
          {
            key: "name",
            label: "Campaign Name",
            type: "text",
            required: true,
            placeholder: "Admission Open 2083",
          },
          {
            key: "message",
            label: "Message",
            type: "textarea",
            placeholder: "WhatsApp broadcast text…",
          },
          { key: "recipients", label: "Recipients", type: "number", placeholder: "0" },
          {
            key: "status",
            label: "Status",
            type: "select",
            options: [
              { value: "Draft", label: "Draft" },
              { value: "Scheduled", label: "Scheduled" },
            ],
          },
        ]}
      />

      <Modal open={draftOpen} onClose={() => setDraftOpen(false)} title="Save a WhatsApp draft">
        <div className="space-y-4">
          <div>
            <label className="text-xs font-bold uppercase tracking-wider text-gray-500 dark:text-gray-400 mb-1 block">
              Audience
            </label>
            <select
              value={audience}
              onChange={(e) => setAudience(e.target.value)}
              className="ap-input w-full"
            >
              {AUDIENCES.map((a) => (
                <option key={a} value={a}>
                  {a}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label className="text-xs font-bold uppercase tracking-wider text-gray-500 dark:text-gray-400 mb-1 block">
              Message
            </label>
            <textarea
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              rows={4}
              placeholder="Admission is open for 2083 — apply now!"
              className="ap-input w-full resize-none"
            />
            <p className="text-[11px] text-[hsl(var(--ap-muted))] mt-1">
              Nothing is sent — this is stored as a draft in{" "}
              <span className="font-semibold">marketing_drafts</span>.
            </p>
          </div>
          <div className="flex justify-end gap-3 pt-3 border-t border-[hsl(var(--ap-border))]">
            <button className="ap-btn-ghost" onClick={() => setDraftOpen(false)}>
              Cancel
            </button>
            <button className="ap-btn" onClick={saveDraft} disabled={saving}>
              {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
              Save Draft
            </button>
          </div>
        </div>
      </Modal>
    </div>
  );
}
