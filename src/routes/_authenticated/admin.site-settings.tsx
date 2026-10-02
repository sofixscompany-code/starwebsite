import { useEffect, useState } from "react";
import { doc, getDoc, setDoc } from "firebase/firestore";
import { toast } from "sonner";
import { Loader2, Save, Phone, Mail, MapPin, Globe, Upload, Trash2 } from "lucide-react";
import { db } from "@/integrations/firebase/config";
import { PageHeader } from "@/components/admin/AdminShell";
import { Panel } from "@/components/admin/ui";
import { site } from "@/lib/site-config";

const EMPTY = {
  name: "",
  legalName: "",
  location: "",
  city: "",
  managingDirector: "",
  phones: "",
  whatsapp: "",
  email: "",
  established: "2015",
  tagline: "",
  facebook: "",
  instagram: "",
  youtube: "",
  tiktok: "",
};

type QrKey = "esewa" | "khalti" | "fonepay";
const EMPTY_QR: Record<QrKey, string> & { bankDetails: string } = {
  esewa: "",
  khalti: "",
  fonepay: "",
  bankDetails: "",
};

export function SiteSettingsPage() {
  const [form, setForm] = useState(EMPTY);
  const [pay, setPay] = useState({ ...EMPTY_QR });
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [savingPay, setSavingPay] = useState(false);

  useEffect(() => {
    let cancelled = false;
    getDoc(doc(db, "site_settings", "config"))
      .then((d) => {
        if (cancelled) return;
        const data = d.data();
        const s = data || site;
        const socials = (data?.socials as Record<string, string>) ?? {};
        setForm({
          name: s.name ?? site.name,
          legalName: s.legalName ?? site.legalName,
          location: s.location ?? site.location,
          city: s.city ?? site.city,
          managingDirector: s.managingDirector ?? site.managingDirector,
          phones:
            Array.isArray(s.phones) && s.phones.length
              ? (s.phones as string[]).join(", ")
              : site.phones.join(", "),
          whatsapp: s.whatsapp ?? site.whatsapp,
          email: s.email ?? site.email,
          established: String(s.established ?? site.established),
          tagline: s.tagline ?? site.tagline,
          facebook: socials.facebook ?? site.socials.facebook,
          instagram: socials.instagram ?? site.socials.instagram,
          youtube: socials.youtube ?? site.socials.youtube,
          tiktok: socials.tiktok ?? site.socials.tiktok,
        });
      })
      .catch(() => setForm({ ...EMPTY, phones: site.phones.join(", ") }))
      .finally(() => !cancelled && setLoading(false));

    // Payment QR config lives in its own doc (`site_settings/payment_qr`) so
    // the main settings doc stays small — QRs are base64 (Storage is optional).
    getDoc(doc(db, "site_settings", "payment_qr"))
      .then((d) => {
        if (cancelled || !d.exists()) return;
        const data = d.data() ?? {};
        setPay({
          esewa: typeof data.esewa === "string" ? data.esewa : "",
          khalti: typeof data.khalti === "string" ? data.khalti : "",
          fonepay: typeof data.fonepay === "string" ? data.fonepay : "",
          bankDetails: typeof data.bankDetails === "string" ? data.bankDetails : "",
        });
      })
      .catch(() => undefined);
    return () => {
      cancelled = true;
    };
  }, []);

  const set = (k: keyof typeof form, v: string) => setForm((f) => ({ ...f, [k]: v }));

  /* ── Payment QR uploads (kept in `site_settings/payment_qr`) ── */
  const onQrFile = (key: QrKey, file: File | undefined | null) => {
    if (!file) return;
    if (!file.type.startsWith("image/")) {
      toast.error("Choose an image file (PNG or JPG).");
      return;
    }
    if (file.size > 500_000) {
      toast.error("Image too large — please use a file under 500 KB.");
      return;
    }
    const reader = new FileReader();
    reader.onload = () => {
      const result = String(reader.result || "");
      setPay((p) => ({ ...p, [key]: result }));
      toast.success("QR image loaded — press Save payments to publish it.");
    };
    reader.onerror = () => toast.error("Could not read that image.");
    reader.readAsDataURL(file);
  };

  const savePayments = async () => {
    setSavingPay(true);
    try {
      await setDoc(doc(db, "site_settings", "payment_qr"), {
        esewa: pay.esewa,
        khalti: pay.khalti,
        fonepay: pay.fonepay,
        bankDetails: pay.bankDetails.trim(),
        updatedAt: new Date().toISOString(),
      });
      toast.success("Payment settings saved");
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Failed to save payment settings");
    } finally {
      setSavingPay(false);
    }
  };

  const save = async () => {
    if (!form.phones.trim()) return toast.error("At least one phone number is required");
    if (!form.whatsapp.trim()) return toast.error("WhatsApp number is required");
    setSaving(true);
    try {
      await setDoc(doc(db, "site_settings", "config"), {
        name: form.name.trim(),
        legalName: form.legalName.trim(),
        location: form.location.trim(),
        city: form.city.trim(),
        managingDirector: form.managingDirector.trim(),
        phones: form.phones
          .split(",")
          .map((p) => p.trim())
          .filter(Boolean),
        whatsapp: form.whatsapp.trim(),
        email: form.email.trim(),
        established: Number(form.established) || site.established,
        tagline: form.tagline.trim(),
        socials: {
          facebook: form.facebook.trim(),
          instagram: form.instagram.trim(),
          youtube: form.youtube.trim(),
          tiktok: form.tiktok.trim(),
        },
      });
      toast.success("Site settings saved");
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Failed to save settings");
    } finally {
      setSaving(false);
    }
  };

  const field = (
    label: string,
    value: string,
    onChange: (v: string) => void,
    opts: { type?: string; placeholder?: string; hint?: string } = {},
  ) => (
    <label className="block">
      <span className="text-xs font-bold uppercase tracking-widest text-[hsl(var(--ap-muted))]">
        {label}
      </span>
      <input
        type={opts.type ?? "text"}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={opts.placeholder ?? label}
        className="ap-input mt-1"
      />
      {opts.hint && (
        <span className="text-[11px] text-[hsl(var(--ap-muted))] block mt-1">{opts.hint}</span>
      )}
    </label>
  );

  if (loading) {
    return (
      <div className="flex justify-center py-20">
        <Loader2 className="w-6 h-6 animate-spin text-navy/40" />
      </div>
    );
  }

  return (
    <div>
      <PageHeader
        title="Site Settings"
        subtitle="Contact details, social links and branding shown across the website. Falls back to defaults until saved."
        actions={
          <button onClick={save} disabled={saving} className="ap-btn">
            {saving ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" /> Saving&hellip;
              </>
            ) : (
              <>
                <Save className="w-4 h-4" /> Save settings
              </>
            )}
          </button>
        }
      />

      <div className="grid gap-6 lg:grid-cols-2">
        <Panel title="Branding & Institute">
          <div className="space-y-4">
            {field("Institute name", form.name, (v) => set("name", v))}
            {field("Legal name", form.legalName, (v) => set("legalName", v))}
            {field("Tagline", form.tagline, (v) => set("tagline", v), {
              placeholder: "Nepal Police • Army • Loksewa • Medical • Technical",
            })}
            {field("Managing Director", form.managingDirector, (v) => set("managingDirector", v))}
            {field("Established (year)", form.established, (v) => set("established", v), {
              type: "number",
            })}
            {field("City", form.city, (v) => set("city", v))}
          </div>
        </Panel>

        <Panel title="Contact Details">
          <div className="space-y-4">
            {field("Phones (comma separated)", form.phones, (v) => set("phones", v), {
              placeholder: "9804899123, 9864176606",
              hint: "Multiple numbers separated by commas",
            })}
            {field("WhatsApp number", form.whatsapp, (v) => set("whatsapp", v), {
              hint: "10-digit number without country code, e.g. 9804899123",
            })}
            {field("Email", form.email, (v) => set("email", v), {
              type: "email",
            })}
            {field("Campus Address", form.location, (v) => set("location", v))}
          </div>
        </Panel>

        <Panel title="Social Media" className="lg:col-span-2">
          <div className="grid gap-4 sm:grid-cols-2">
            {field("Facebook URL", form.facebook, (v) => set("facebook", v))}
            {field("Instagram URL", form.instagram, (v) => set("instagram", v))}
            {field("YouTube URL", form.youtube, (v) => set("youtube", v))}
            {field("TikTok URL", form.tiktok, (v) => set("tiktok", v))}
          </div>
        </Panel>

        <Panel
          title="Payment Settings — Admission QR"
          subtitle="QR codes shown on the admission form. Applicants scan to pay; COD (cash at office) always stays available."
          className="lg:col-span-2"
          actions={
            <button onClick={savePayments} disabled={savingPay} className="ap-btn">
              {savingPay ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" /> Saving&hellip;
                </>
              ) : (
                <>
                  <Save className="w-4 h-4" /> Save payments
                </>
              )}
            </button>
          }
        >
          <div className="grid gap-4 sm:grid-cols-3">
            {(["esewa", "khalti", "fonepay"] as QrKey[]).map((key) => (
              <div
                key={key}
                className="rounded-xl border border-[hsl(var(--ap-border))] bg-[hsl(var(--ap-surface))] p-3"
              >
                <p className="text-xs font-bold uppercase tracking-widest text-[hsl(var(--ap-muted))] mb-2">
                  {key === "esewa" ? "eSewa" : key === "khalti" ? "Khalti" : "FonePay"} QR
                </p>
                {pay[key] ? (
                  <img
                    src={pay[key]}
                    alt={`${key} QR`}
                    className="mb-2 h-32 w-32 rounded-lg border border-[hsl(var(--ap-border))] bg-white object-contain p-1"
                  />
                ) : (
                  <div className="mb-2 grid h-32 w-32 place-items-center rounded-lg border border-dashed border-[hsl(var(--ap-border))] px-2 text-center text-[10px] font-semibold text-[hsl(var(--ap-muted))]">
                    No QR uploaded
                  </div>
                )}
                <div className="flex gap-2">
                  <label className="ap-btn-ghost inline-flex cursor-pointer items-center gap-1 text-xs">
                    <Upload className="h-3.5 w-3.5" /> {pay[key] ? "Replace" : "Upload"}
                    <input
                      type="file"
                      accept="image/*"
                      className="hidden"
                      onChange={(e) => {
                        onQrFile(key, e.target.files?.[0]);
                        e.target.value = "";
                      }}
                    />
                  </label>
                  {pay[key] && (
                    <button
                      type="button"
                      className="ap-btn-ghost inline-flex items-center gap-1 text-xs text-red-600"
                      onClick={() => setPay((p) => ({ ...p, [key]: "" }))}
                    >
                      <Trash2 className="h-3.5 w-3.5" /> Remove
                    </button>
                  )}
                </div>
              </div>
            ))}
          </div>
          <label className="mt-4 block">
            <span className="text-xs font-bold uppercase tracking-widest text-[hsl(var(--ap-muted))]">
              Bank transfer details
            </span>
            <textarea
              rows={3}
              value={pay.bankDetails}
              onChange={(e) => setPay((p) => ({ ...p, bankDetails: e.target.value }))}
              placeholder={
                "Bank name, account name & number, branch\ne.g. Nabil Bank — Star Coaching Institute Pvt. Ltd.\nA/C 01234567890123, Janakpur Branch"
              }
              className="ap-input mt-1 resize-none"
            />
            <span className="text-[11px] text-[hsl(var(--ap-muted))] block mt-1">
              Shown on the admission form when an applicant picks Bank Transfer.
            </span>
          </label>
        </Panel>
      </div>
    </div>
  );
}
