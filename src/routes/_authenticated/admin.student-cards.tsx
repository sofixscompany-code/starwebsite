import { useEffect, useMemo, useState } from "react";
import { collection, doc, getDoc, getDocs, setDoc } from "firebase/firestore";
import { db } from "@/integrations/firebase/config";
import { PageHeader } from "@/components/admin/AdminShell";
import { Panel } from "@/components/admin/ui";
import { Printer, Loader2, Save, Plus, Trash2, CreditCard, BarChart3, Upload } from "lucide-react";
import { toast } from "sonner";
import { cn } from "@/lib/utils";
import "@/components/cards/student-cards.css";
import {
  ProgressCard,
  IdCard,
  CARD_STATUSES,
  defaultSubjects,
  emptyCard,
  type CardStatus,
  type CardSubject,
  type StudentCardData,
} from "@/components/cards/student-cards";

/* ════════════════════════════ PRINT ════════════════════════════
   Print contract (src/components/cards/student-cards.css):
   <body class="sc-printing"> hides everything except content inside
   .sc-print-isolated (the visible card). Remove the class on afterprint.
   ═══════════════════════════════════════════════════════════════ */

let printCleanupBound = false;

function runCardPrint() {
  if (!printCleanupBound) {
    printCleanupBound = true;
    window.addEventListener("afterprint", () => {
      document.body.classList.remove("sc-printing");
    });
  }
  document.body.classList.add("sc-printing");
  window.print();
  window.setTimeout(() => document.body.classList.remove("sc-printing"), 2000);
}

/* ════════════════════════════ DATA ═════════════════════════════ */

type CardKind = "progress" | "id";

interface AdmissionPick {
  id: string;
  name: string;
  status: string;
  course: string;
  admissionNumber: string;
  photo: string;
}

const str = (v: unknown) => (typeof v === "string" ? v : "");

function pickOf(id: string, raw: Record<string, unknown>): AdmissionPick {
  const formData = (raw.formData ?? {}) as Record<string, unknown>;
  const name =
    str(raw.studentName) ||
    str(raw.fullName) ||
    str(formData.studentName) ||
    str(raw.name) ||
    "Unnamed applicant";
  return {
    id,
    name,
    status: str(raw.status) || "—",
    course:
      str(raw.classAppliedFor) ||
      str(raw.courseName) ||
      str(raw.courseTitle) ||
      str(formData.classAppliedFor) ||
      "—",
    admissionNumber: str(raw.admissionNumber) || str(formData.admissionNumber) || "",
    photo: str(raw.studentPhoto) || str(formData.studentPhoto) || "",
  };
}

function cardFromAdmission(a: AdmissionPick): StudentCardData {
  const base = emptyCard();
  return {
    ...base,
    studentName: a.name,
    photo: a.photo,
    courseName: a.course,
    admissionNumber: a.admissionNumber,
  };
}

/* ════════════════════════════ PAGE ═════════════════════════════ */

export function StudentCardsPage() {
  const [students, setStudents] = useState<AdmissionPick[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedId, setSelectedId] = useState("");
  const [kind, setKind] = useState<CardKind>("progress");
  const [card, setCard] = useState<StudentCardData>(emptyCard);
  const [saving, setSaving] = useState(false);
  const [dirty, setDirty] = useState(false);

  /* ── Admitted students ── */
  useEffect(() => {
    getDocs(collection(db, "admissions"))
      .then((snap) => {
        const rows = snap.docs
          .map((d) => pickOf(d.id, d.data() as Record<string, unknown>))
          .sort((a, b) => a.name.localeCompare(b.name));
        setStudents(rows);
        if (rows[0]) setSelectedId(rows[0].id);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, []);

  /* ── Load saved card whenever selection changes ── */
  useEffect(() => {
    if (!selectedId) return;
    const admission = students.find((s) => s.id === selectedId);
    let cancelled = false;
    setDirty(false);
    getDoc(doc(db, "student_cards", selectedId))
      .then((snap) => {
        if (cancelled) return;
        if (snap.exists()) {
          const d = snap.data() as Partial<StudentCardData>;
          const subjects =
            Array.isArray(d.subjects) && d.subjects.length ? d.subjects : defaultSubjects();
          setCard({ ...cardFromAdmission(admission ?? ({} as AdmissionPick)), ...d, subjects });
        } else if (admission) {
          setCard(cardFromAdmission(admission));
        }
      })
      .catch(() => {
        if (admission) setCard(cardFromAdmission(admission));
      });
    return () => {
      cancelled = true;
    };
  }, [selectedId, students]);

  const patch = (p: Partial<StudentCardData>) => {
    setCard((c) => ({ ...c, ...p }));
    setDirty(true);
  };

  const setSubject = (id: string, p: Partial<CardSubject>) => {
    setCard((c) => ({
      ...c,
      subjects: c.subjects.map((s) => (s.id === id ? { ...s, ...p } : s)),
    }));
    setDirty(true);
  };

  const addSubject = () => {
    setCard((c) => ({
      ...c,
      subjects: [
        ...c.subjects,
        {
          id: `s${Date.now()}`,
          subject: "",
          total: "100",
          obt: "",
          grade: "",
          status: "समीक्षाधीन",
        },
      ],
    }));
    setDirty(true);
  };

  const removeSubject = (id: string) => {
    setCard((c) => ({ ...c, subjects: c.subjects.filter((s) => s.id !== id) }));
    setDirty(true);
  };

  const onPhoto = (file: File | undefined | null) => {
    if (!file) return;
    if (!file.type.startsWith("image/")) return toast.error("Choose an image file (PNG or JPG).");
    if (file.size > 900_000)
      return toast.error("Image too large — please use a file under 900 KB.");
    const reader = new FileReader();
    reader.onload = () => {
      patch({ photo: String(reader.result || "") });
      toast.success("Photo loaded — press Save to store it.");
    };
    reader.onerror = () => toast.error("Could not read that image.");
    reader.readAsDataURL(file);
  };

  const save = async () => {
    if (!selectedId) return toast.error("Select a student first.");
    if (!card.studentName.trim()) return toast.error("Student name is required.");
    setSaving(true);
    try {
      await setDoc(doc(db, "student_cards", selectedId), {
        ...card,
        subjects: card.subjects.map((s, i) => ({ ...s, id: s.id || `s${i}` })),
        admissionId: selectedId,
        updatedAt: new Date().toISOString(),
      });
      setDirty(false);
      toast.success("Student card saved");
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Failed to save");
    } finally {
      setSaving(false);
    }
  };

  const selected = useMemo(() => students.find((s) => s.id === selectedId), [students, selectedId]);

  if (loading) {
    return (
      <div>
        <PageHeader
          title="Student Cards"
          subtitle="Generate progress cards and photo ID cards for admitted students"
        />
        <div className="flex items-center justify-center py-20">
          <Loader2 className="w-6 h-6 animate-spin text-muted-foreground" />
        </div>
      </div>
    );
  }

  return (
    <div>
      <PageHeader
        title="Student Cards"
        subtitle="Generate progress cards and photo ID cards for admitted students"
        actions={
          <div className="flex flex-wrap gap-2">
            <button
              type="button"
              onClick={() => setKind("progress")}
              className={cn(
                "inline-flex items-center gap-1.5 rounded-lg px-3 py-2 text-xs font-bold transition",
                kind === "progress"
                  ? "bg-navy text-white"
                  : "border border-border bg-white text-navy hover:border-brand-red hover:text-brand-red",
              )}
            >
              <BarChart3 className="h-4 w-4" /> Progress Card
            </button>
            <button
              type="button"
              onClick={() => setKind("id")}
              className={cn(
                "inline-flex items-center gap-1.5 rounded-lg px-3 py-2 text-xs font-bold transition",
                kind === "id"
                  ? "bg-navy text-white"
                  : "border border-border bg-white text-navy hover:border-brand-red hover:text-brand-red",
              )}
            >
              <CreditCard className="h-4 w-4" /> Photo ID Card
            </button>
            <button
              type="button"
              onClick={save}
              disabled={saving}
              className="inline-flex items-center gap-1.5 rounded-lg bg-navy px-3 py-2 text-xs font-bold text-white hover:bg-navy/90 transition disabled:opacity-50"
            >
              {saving ? <Loader2 className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />}
              Save
            </button>
            <button
              type="button"
              onClick={runCardPrint}
              className="inline-flex items-center gap-1.5 rounded-lg bg-brand-red px-3 py-2 text-xs font-bold text-white hover:bg-red-600 transition"
            >
              <Printer className="h-4 w-4" /> Print
            </button>
          </div>
        }
      />

      {students.length === 0 ? (
        <div className="rounded-2xl border border-dashed border-border bg-white p-10 text-center">
          <p className="font-bold text-navy">No admission applications yet.</p>
          <p className="mt-1 text-sm text-muted-foreground">
            Students appear here once their application is saved under Admin → Admissions.
          </p>
        </div>
      ) : (
        <div className="grid gap-6 xl:grid-cols-[340px_minmax(0,1fr)]">
          {/* ── Editor ── */}
          <div className="space-y-5">
            <Panel title="Student">
              <label className="block">
                <span className="text-xs font-bold uppercase tracking-widest text-[hsl(var(--ap-muted))]">
                  Admitted student
                </span>
                <select
                  className="ap-input mt-1"
                  value={selectedId}
                  onChange={(e) => setSelectedId(e.target.value)}
                >
                  {students.map((s) => (
                    <option key={s.id} value={s.id}>
                      {s.name} — {s.status}
                    </option>
                  ))}
                </select>
              </label>
              {selected && (
                <p className="mt-2 text-xs text-muted-foreground">
                  {selected.course}
                  {selected.admissionNumber ? ` • ${selected.admissionNumber}` : ""}
                </p>
              )}
            </Panel>

            <Panel title="Card details">
              <div className="space-y-3">
                <label className="block">
                  <span className="text-xs font-bold uppercase tracking-widest text-[hsl(var(--ap-muted))]">
                    Full name
                  </span>
                  <input
                    className="ap-input mt-1"
                    value={card.studentName}
                    onChange={(e) => patch({ studentName: e.target.value })}
                  />
                </label>
                <div className="grid grid-cols-2 gap-3">
                  <label className="block">
                    <span className="text-xs font-bold uppercase tracking-widest text-[hsl(var(--ap-muted))]">
                      Roll no.
                    </span>
                    <input
                      className="ap-input mt-1"
                      value={card.rollNumber}
                      onChange={(e) => patch({ rollNumber: e.target.value })}
                    />
                  </label>
                  <label className="block">
                    <span className="text-xs font-bold uppercase tracking-widest text-[hsl(var(--ap-muted))]">
                      Attendance
                    </span>
                    <input
                      className="ap-input mt-1"
                      value={card.attendance}
                      placeholder="94%"
                      onChange={(e) => patch({ attendance: e.target.value })}
                    />
                  </label>
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <label className="block">
                    <span className="text-xs font-bold uppercase tracking-widest text-[hsl(var(--ap-muted))]">
                      Session (सत्र)
                    </span>
                    <input
                      className="ap-input mt-1"
                      value={card.term}
                      onChange={(e) => patch({ term: e.target.value })}
                    />
                  </label>
                  <label className="block">
                    <span className="text-xs font-bold uppercase tracking-widest text-[hsl(var(--ap-muted))]">
                      Issued date
                    </span>
                    <input
                      className="ap-input mt-1"
                      value={card.issuedDate}
                      onChange={(e) => patch({ issuedDate: e.target.value })}
                    />
                  </label>
                </div>
                <label className="block">
                  <span className="text-xs font-bold uppercase tracking-widest text-[hsl(var(--ap-muted))]">
                    शिक्षकको टिप्पणी
                  </span>
                  <textarea
                    className="ap-input mt-1 min-h-[80px]"
                    value={card.remarks}
                    onChange={(e) => patch({ remarks: e.target.value })}
                  />
                </label>

                <div className="flex flex-wrap items-center gap-3">
                  <div className="h-16 w-14 shrink-0 rounded-md border border-[hsl(var(--ap-border))] bg-white grid place-items-center overflow-hidden">
                    {card.photo ? (
                      <img src={card.photo} alt="" className="h-full w-full object-cover" />
                    ) : (
                      <span className="text-[10px] text-muted-foreground">No photo</span>
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
                  {card.photo && (
                    <button
                      type="button"
                      className="ap-btn-ghost inline-flex items-center gap-1 text-xs text-red-600"
                      onClick={() => patch({ photo: "" })}
                    >
                      <Trash2 className="h-3.5 w-3.5" /> Remove
                    </button>
                  )}
                </div>
              </div>
            </Panel>

            {kind === "progress" && (
              <Panel title="Subjects">
                <div className="space-y-2">
                  {card.subjects.map((s) => (
                    <div key={s.id} className="grid grid-cols-2 gap-2">
                      <input
                        className="ap-input"
                        value={s.subject}
                        placeholder="विषय"
                        onChange={(e) => setSubject(s.id, { subject: e.target.value })}
                      />
                      <div className="flex gap-2">
                        <input
                          className="ap-input w-14"
                          value={s.obt}
                          placeholder="प्राप्त"
                          inputMode="numeric"
                          onChange={(e) => setSubject(s.id, { obt: e.target.value })}
                        />
                        <input
                          className="ap-input w-14"
                          value={s.total}
                          placeholder="पूर्ण"
                          inputMode="numeric"
                          onChange={(e) => setSubject(s.id, { total: e.target.value })}
                        />
                        <input
                          className="ap-input w-14"
                          value={s.grade}
                          placeholder="ग्रेड"
                          onChange={(e) => setSubject(s.id, { grade: e.target.value })}
                        />
                        <select
                          className="ap-input flex-1 min-w-0"
                          value={s.status}
                          onChange={(e) =>
                            setSubject(s.id, { status: e.target.value as CardStatus })
                          }
                        >
                          {CARD_STATUSES.map((st) => (
                            <option key={st} value={st}>
                              {st}
                            </option>
                          ))}
                        </select>
                        <button
                          type="button"
                          className="ap-btn-ghost inline-flex items-center justify-center text-red-600"
                          aria-label="Remove subject"
                          onClick={() => removeSubject(s.id)}
                        >
                          <Trash2 className="h-4 w-4" />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
                <button
                  type="button"
                  onClick={addSubject}
                  className="ap-btn-ghost mt-3 inline-flex items-center gap-1 text-xs"
                >
                  <Plus className="h-4 w-4" /> Add subject
                </button>
              </Panel>
            )}
          </div>

          {/* ── Preview (this is the print target) ── */}
          <div>
            <div className="mb-3 flex flex-wrap items-center justify-between gap-2">
              <p className="text-xs font-bold uppercase tracking-widest text-[hsl(var(--ap-muted))]">
                {kind === "progress" ? "Progress Card preview" : "Photo ID Card preview"}
                {dirty ? " • unsaved changes" : ""}
              </p>
            </div>
            <div className="sc-print-root sc-print-isolated">
              <div className="sc-wrap">
                {kind === "progress" ? <ProgressCard data={card} /> : <IdCard data={card} />}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
