import { useEffect, useMemo, useRef, useState } from "react";
import { useNavigate, useSearchParams, Link } from "react-router-dom";
import {
  Loader2,
  Printer,
  FileDown,
  Eye,
  Pencil,
  Save,
  Send,
  Home,
  Copy,
  MessageCircle,
  AlertCircle,
  RotateCcw,
} from "lucide-react";
import { toast } from "sonner";
import { collection, addDoc, getDocs } from "@/integrations/aws/firestore";
import { db } from "@/integrations/aws/config";
import { useQuery } from "@tanstack/react-query";
import { SiteHeader } from "@/components/site/SiteHeader";
import { SiteFooter } from "@/components/site/SiteFooter";
import { site } from "@/lib/site-config";
import { whatsappDigits } from "@/lib/links";
import { useLanguage } from "@/hooks/use-language";
import { useAdmissionCourses } from "@/hooks/use-admission-courses";
import { AdmissionDocument } from "@/components/admission/AdmissionDocument";
import { CourseFeeStep } from "@/components/admission/CourseFeeStep";
import { FeeBreakdown } from "@/components/admission/FeeBreakdown";
import {
  PaymentMethodCard,
  usePaymentQrSettings,
  qrKeyForMethod,
} from "@/components/admission/PaymentMethodCard";
import { PAYMENT_METHODS } from "@/lib/admission-form/types";
import "@/components/admission/admission-print.css";
import { applicableCourses } from "@/lib/admission-form/defaults";
import {
  EMPTY_ADMISSION,
  generateApplicationId,
  type AdmissionFormData,
  type AdmissionRecord,
  type PricingSnapshot,
  type Organization,
  type AppliedPost,
} from "@/lib/admission-form/types";
import { validateAdmissionFeeStep, validateAdmissionForm } from "@/lib/admission-form/validation";

const DRAFT_KEY = "sci_admission_draft_v1";
const WHATSAPP_NUMBER = whatsappDigits(site.whatsapp);

type Mode = "edit" | "preview" | "success";
/** Two-step flow: Step 1 = course/hostel fees, Step 2 = full application form. */
type Step = "fees" | "form";

export function AdmissionPage() {
  const { t } = useLanguage();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();

  const { data: courses = [] } = useAdmissionCourses();
  const [form, setForm] = useState<AdmissionFormData>(() => ({ ...EMPTY_ADMISSION }));
  const [mode, setMode] = useState<Mode>("edit");
  const [step, setStep] = useState<Step>("fees");
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [submitting, setSubmitting] = useState(false);
  const [applicationId, setApplicationId] = useState("");
  const restored = useRef(false);
  // QR config for the success screen (always mounted — rules of hooks).
  const { data: qrCfg } = usePaymentQrSettings();

  const patch = (p: Partial<AdmissionFormData>) => {
    setForm((f) => ({ ...f, ...p }));
    if (Object.keys(p).length === 1) {
      const k = Object.keys(p)[0];
      if (errors[k])
        setErrors((e) => {
          const n = { ...e };
          delete n[k];
          return n;
        });
    }
  };

  /* ── Restore saved draft ── */
  useEffect(() => {
    if (restored.current) return;
    restored.current = true;
    try {
      const raw = localStorage.getItem(DRAFT_KEY);
      if (raw) {
        const parsed = JSON.parse(raw) as Partial<AdmissionFormData>;
        if (parsed && typeof parsed === "object" && parsed.studentName) {
          setForm({ ...EMPTY_ADMISSION, ...parsed, status: "Draft" });
          // A restored draft with a chosen package goes straight to Step 2.
          if (parsed.pricingSnapshot && parsed.coursePackage) setStep("form");
          toast.info("Saved draft restored.");
        }
      }
    } catch {
      /* ignore broken drafts */
    }
  }, []);

  /* ── ?course=<id> deep-link (Courses page "Apply for this course") ── */
  const courseIdParam = searchParams.get("course") ?? "";
  // Public `courses` collection uses different IDs than `admission_courses`;
  // resolve the public course name first so the deep-link keeps working.
  const { data: publicCourses = [] } = useQuery({
    queryKey: ["public-courses-lite"],
    queryFn: async () => {
      try {
        const snap = await getDocs(collection(db, "courses"));
        return snap.docs.map((d) => ({
          id: d.id,
          name: String((d.data() as { name?: string }).name ?? ""),
        }));
      } catch {
        return [];
      }
    },
    staleTime: 5 * 60_000,
  });

  useEffect(() => {
    if (!courseIdParam || form.courseId || courses.length === 0) return;

    const label =
      publicCourses.find((c) => c.id === courseIdParam)?.name ??
      decodeURIComponent(courseIdParam).replace(/-/g, " ");
    const q = label.toLowerCase().trim();

    const score = (name: string) => {
      const n = name.toLowerCase();
      if (n === q) return 100;
      if (q.length > 3 && n.includes(q)) return 80;
      const words = q.split(/\s+/).filter((w) => w.length > 3);
      return words.filter((w) => n.includes(w)).length;
    };
    const best = courses.map((c) => ({ c, s: score(c.name) })).sort((a, b) => b.s - a.s)[0];

    // Derive organization/post from the public course label as a fallback.
    const orgGuess: Organization | "" = /police/.test(q)
      ? "Nepal Police"
      : /army|sainik|soldier/.test(q)
        ? "Nepal Army"
        : /\bapf\b|armed police/.test(q)
          ? "APF"
          : "";
    const postGuess: AppliedPost | "" = /research|anushandhan/.test(q)
      ? "Research Assistant"
      : /sub.?inspector|\basi\b/.test(q)
        ? "Sub-Inspector (ASI)"
        : /inspector/.test(q)
          ? "Inspector"
          : /jawan|constable|soldier|guard/.test(q)
            ? "Jawan"
            : "";

    let hit = best && best.s >= 2 ? best.c : null;
    if (!hit && (orgGuess || postGuess)) {
      hit = applicableCourses(courses, orgGuess, postGuess)[0] ?? null;
    }
    if (!hit) return;

    patch({
      courseId: hit.id,
      courseName: hit.name,
      classAppliedFor: hit.name,
      organization: hit.organization || orgGuess || form.organization,
      appliedPost: hit.post || postGuess || form.appliedPost,
      coursePackage: "",
      packageDuration: "",
      pricingSnapshot: null,
      totalPayment: null,
    });
    toast.info(`Course pre-selected: ${hit.name}`);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [courseIdParam, courses, publicCourses]);

  const errList = useMemo(() => Object.entries(errors), [errors]);

  const focusFirstError = (errs: Record<string, string>) => {
    const first = Object.keys(errs)[0];
    if (!first) return;
    const el =
      document.querySelector<HTMLElement>(`[data-sci-field="${first}"]`) ??
      document.querySelector<HTMLElement>(".sci-error-msg");
    el?.scrollIntoView({ behavior: "smooth", block: "center" });
  };

  const doValidate = () => {
    const errs = validateAdmissionForm(form);
    setErrors(errs);
    if (Object.keys(errs).length > 0) {
      toast.error(`Please fix ${Object.keys(errs).length} field(s) before continuing.`);
      focusFirstError(errs);
      return false;
    }
    return true;
  };

  /* ── Step 1 → Step 2 ── */
  const continueToForm = () => {
    const errs = validateAdmissionFeeStep(form);
    setErrors(errs);
    if (Object.keys(errs).length > 0) {
      toast.error(`Please complete ${Object.keys(errs).length} selection(s) in Step 1 first.`);
      return;
    }
    setStep("form");
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const backToFees = () => {
    setStep("fees");
    setErrors({});
    setMode("edit");
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const saveDraft = () => {
    try {
      localStorage.setItem(DRAFT_KEY, JSON.stringify(form));
      toast.success("Draft saved on this device.");
    } catch {
      toast.error("Could not save draft (storage full).");
    }
  };

  const clearDraft = () => {
    try {
      localStorage.removeItem(DRAFT_KEY);
    } catch {
      /* ignore */
    }
  };

  const printDoc = (pdf: boolean) => {
    if (pdf) toast.info('Choose "Save as PDF" as the destination in the print dialog.');
    setTimeout(() => window.print(), 120);
  };

  /* ── Submit to Firestore `admissions` ── */
  const submit = async () => {
    if (!doValidate()) return;

    // Rebuild pricing snapshot at submission time (historical accuracy, §61).
    const course = courses.find((c) => c.id === form.courseId);
    const pkg = course?.packages.find((p) => p.name === form.coursePackage && p.active !== false);
    const snapshot: PricingSnapshot | null =
      pkg && course
        ? {
            admissionFee: pkg.admissionFee,
            tuitionFee: pkg.tuitionFee,
            examFee: pkg.examFee,
            physicalFee: pkg.physicalFee,
            additionalFee: pkg.additionalFee,
            totalFee: pkg.totalFee,
            package: pkg.name,
            course: course.name,
            capturedAt: Date.now(),
          }
        : form.pricingSnapshot;
    if (!snapshot) {
      setErrors({ coursePackage: "Select a course package to calculate the fee." });
      toast.error("Select a course package.");
      return;
    }

    // Hostel fee rebuilt from admission_courses (authoritative — mirrors the
    // pricing snapshot above so a tampered draft can't understate the total).
    const hostelPkgLive = courses
      .find((c) => c.id === "hostel" && c.active !== false)
      ?.packages.find((p) => p.active !== false);
    const hostelFee = form.hostel === "Yes" ? (hostelPkgLive?.totalFee ?? 0) : 0;

    setSubmitting(true);
    try {
      const id = generateApplicationId();
      const record: AdmissionRecord = {
        ...form,
        courseName: course?.name ?? form.courseName,
        classAppliedFor: course?.name ?? form.classAppliedFor,
        pricingSnapshot: snapshot,
        hostelFee,
        // Course + hostel form the payable total; discount is office-set only
        // and is stripped from every public submission (OFFICE_ONLY_FIELDS).
        discount: 0,
        totalPayment: snapshot.totalFee + hostelFee,
        paymentReference: form.paymentReference.trim(),
        paymentChosenAt: form.paymentMethod ? Date.now() : undefined,
        applicationId: id,
        admissionNumber: "",
        billNumber: "",
        status: "Submitted",
        createdAt: Date.now(),
        submittedAt: Date.now(),
      };
      await addDoc(collection(db, "admissions"), record as unknown as Record<string, unknown>);
      clearDraft();
      setApplicationId(id);
      setMode("success");
      window.scrollTo({ top: 0, behavior: "smooth" });
    } catch (e) {
      toast.error("Submission failed. Check your connection and try again.");
      console.error(e);
    } finally {
      setSubmitting(false);
    }
  };

  const resetAll = () => {
    if (!confirm("Start a new application? Current fields will be cleared.")) return;
    clearDraft();
    setForm({ ...EMPTY_ADMISSION });
    setErrors({});
    setApplicationId("");
    setMode("edit");
    setStep("fees");
    navigate("/admission");
  };

  /* ── Success screen ── */
  if (mode === "success") {
    return (
      <div className="min-h-screen flex flex-col bg-[#eef1f5] sci-print-root">
        <SiteHeader />
        <main className="flex-1 flex items-center justify-center px-4 py-12 no-print">
          <div className="bg-white rounded-2xl shadow-xl border max-w-lg w-full p-8 text-center">
            <div className="mx-auto w-16 h-16 rounded-full bg-green-100 flex items-center justify-center mb-4">
              <Send className="text-green-600" size={28} />
            </div>
            <h1 className="text-2xl font-extrabold text-navy">Application Submitted</h1>
            <p className="text-muted-foreground mt-2 text-sm">
              Your admission form has been received. The institute will contact you on your mobile
              number for verification.
            </p>
            <div className="mt-5 border border-dashed border-brand-red/50 rounded-xl p-4 bg-red-50/50">
              <p className="text-xs uppercase tracking-wider text-muted-foreground font-bold">
                Application ID
              </p>
              <p className="text-xl font-extrabold text-brand-red mt-1 select-all">
                {applicationId}
              </p>
              <button
                type="button"
                className="mt-2 inline-flex items-center gap-1 text-xs font-semibold text-muted-foreground hover:text-foreground"
                onClick={() => {
                  navigator.clipboard.writeText(applicationId);
                  toast.success("Application ID copied.");
                }}
              >
                <Copy size={12} /> Copy ID
              </button>
            </div>
            {/* Fee summary — course + hostel separately, payable after discount */}
            <div className="mt-4 rounded-xl border border-gray-200 bg-white p-4 text-left">
              <p className="text-xs uppercase tracking-wider text-muted-foreground font-bold">
                Fee Summary
              </p>
              <dl className="mt-2 space-y-1.5 text-sm">
                <div className="flex items-center justify-between gap-3">
                  <dt className="text-gray-600">
                    Course fee{form.pricingSnapshot ? ` (${form.pricingSnapshot.package})` : ""}
                  </dt>
                  <dd className="font-bold text-brand-red">
                    Rs. {(form.pricingSnapshot?.totalFee ?? 0).toLocaleString("en-IN")}
                  </dd>
                </div>
                {form.hostel === "Yes" && form.hostelFee > 0 && (
                  <div className="flex items-center justify-between gap-3">
                    <dt className="text-gray-600">Hostel fee</dt>
                    <dd className="font-bold text-green-700">
                      Rs. {form.hostelFee.toLocaleString("en-IN")}
                    </dd>
                  </div>
                )}
                <div className="flex items-center justify-between gap-3 border-t pt-1.5">
                  <dt className="font-bold text-navy">Total</dt>
                  <dd className="font-extrabold text-navy">
                    Rs. {(form.totalPayment ?? 0).toLocaleString("en-IN")}
                  </dd>
                </div>
                {form.discount > 0 && (
                  <div className="flex items-center justify-between gap-3">
                    <dt className="text-gray-600">Discount (छुट)</dt>
                    <dd className="font-bold text-green-700">
                      − Rs. {form.discount.toLocaleString("en-IN")}
                    </dd>
                  </div>
                )}
                <div className="flex items-center justify-between gap-3">
                  <dt className="font-bold text-navy">Payable (दिनुपर्ने)</dt>
                  <dd className="font-extrabold text-brand-red">
                    Rs.{" "}
                    {Math.max((form.totalPayment ?? 0) - (form.discount || 0), 0).toLocaleString(
                      "en-IN",
                    )}
                  </dd>
                </div>
              </dl>
            </div>
            {form.paymentMethod && (
              <div className="mt-4 rounded-xl border border-gray-200 bg-gray-50 p-4 text-left">
                <p className="text-xs uppercase tracking-wider text-muted-foreground font-bold">
                  Payment Method
                </p>
                <p className="mt-1 text-sm font-bold text-navy">
                  {PAYMENT_METHODS.find((m) => m.value === form.paymentMethod)?.label ??
                    form.paymentMethod}
                  {form.paymentReference && (
                    <span className="ml-1 font-mono text-xs font-semibold text-gray-500">
                      · Ref: {form.paymentReference}
                    </span>
                  )}
                </p>
                {form.paymentMethod === "cod" ? (
                  <p className="mt-1 text-xs text-gray-600">
                    कुनै अग्रिम भुक्तानी छैन — भुक्तानी अफिसमा पहुँदा गर्नुहुनेछ। तपाईंको भुक्तानी
                    विधि यस आवेदनसँगै रेकर्ड भइसकेको छ।
                  </p>
                ) : qrCfg?.[qrKeyForMethod(form.paymentMethod)] ? (
                  <img
                    src={qrCfg[qrKeyForMethod(form.paymentMethod)]}
                    alt="Payment QR code"
                    className="mt-2 h-36 w-36 rounded-lg border bg-white object-contain p-1"
                  />
                ) : (
                  <p className="mt-1 text-xs text-gray-600">
                    QR भुक्तानी गर्न भए व्हाट्सएप वा अफिसबाट QR कोड लिनुहोस्।
                  </p>
                )}
              </div>
            )}
            <div className="mt-6 grid grid-cols-1 sm:grid-cols-2 gap-3">
              <button
                type="button"
                onClick={() => printDoc(true)}
                className="inline-flex items-center justify-center gap-2 rounded-lg border px-4 py-2.5 text-sm font-bold hover:bg-gray-50"
              >
                <FileDown size={15} /> Download PDF
              </button>
              <a
                href={`https://wa.me/${WHATSAPP_NUMBER}?text=${encodeURIComponent(
                  `Namaste! I have submitted an online admission application at Star Coaching Institute.\nApplication ID: ${applicationId}\nName: ${form.studentName}\nCourse: ${form.courseName}\nHostel: ${form.hostel === "Yes" ? `Yes — Rs. ${form.hostelFee.toLocaleString("en-IN")}` : "No"}\nTotal Fee: Rs. ${form.totalPayment?.toLocaleString("en-IN") ?? "-"}`,
                )}`}
                target="_blank"
                rel="noreferrer"
                className="inline-flex items-center justify-center gap-2 rounded-lg bg-green-600 text-white px-4 py-2.5 text-sm font-bold hover:bg-green-700"
              >
                <MessageCircle size={15} /> Share on WhatsApp
              </a>
              <Link
                to="/"
                className="inline-flex items-center justify-center gap-2 rounded-lg border px-4 py-2.5 text-sm font-bold hover:bg-gray-50"
              >
                <Home size={15} /> Home
              </Link>
              <button
                type="button"
                onClick={resetAll}
                className="inline-flex items-center justify-center gap-2 rounded-lg border px-4 py-2.5 text-sm font-bold hover:bg-gray-50"
              >
                <RotateCcw size={15} /> New Application
              </button>
            </div>
          </div>
        </main>

        {/* Submitted document — exactly what will print / export as PDF */}
        <div className="sci-paper-scroll">
          <AdmissionDocument data={form} courses={courses} mode="readonly" onChange={() => {}} />
        </div>
        <SiteFooter />
      </div>
    );
  }

  const editing = mode === "edit";

  return (
    <div className="min-h-screen flex flex-col sci-print-root">
      <SiteHeader />

      {/* Hero strip */}
      <div className="bg-brand-red text-white no-print">
        <div className="max-w-7xl mx-auto px-4 py-6 sm:py-8">
          <h1 className="text-2xl sm:text-3xl font-extrabold font-display">
            {t("admissionOpen")} {t("admissionYear")} BS
          </h1>
          <p className="text-white/80 text-sm mt-1.5">{t("admissionFormHint")}</p>
        </div>
      </div>

      {/* Toolbar */}
      <div className="bg-white border-b sticky top-0 z-40 no-print shadow-sm">
        <div className="max-w-7xl mx-auto px-4 py-2.5 flex flex-wrap items-center gap-2">
          <span className="text-xs font-bold uppercase tracking-wider text-muted-foreground mr-auto">
            {step === "fees"
              ? "Step 1 of 2 — Course & Hostel Fees"
              : "Step 2 of 2 — Application Form (3 Page A4 Document)"}
          </span>

          {editing && step === "fees" && (
            <>
              <ToolbarBtn icon={<Save size={14} />} label="Save Draft" onClick={saveDraft} />
            </>
          )}

          {editing && step === "form" && (
            <>
              <ToolbarBtn icon={<Pencil size={14} />} label="Course & Fees" onClick={backToFees} />
              <ToolbarBtn icon={<Save size={14} />} label="Save Draft" onClick={saveDraft} />
              <ToolbarBtn
                icon={<Printer size={14} />}
                label="Print"
                onClick={() => printDoc(false)}
              />
              <ToolbarBtn
                icon={<FileDown size={14} />}
                label="Download PDF"
                onClick={() => printDoc(true)}
              />
              <button
                type="button"
                onClick={() => {
                  setMode("preview");
                  setErrors({});
                  window.scrollTo({ top: 0, behavior: "smooth" });
                }}
                className="inline-flex items-center gap-1.5 rounded-lg border border-brand-red text-brand-red px-3.5 py-2 text-xs font-bold hover:bg-brand-red/5"
              >
                <Eye size={14} /> Preview
              </button>
              <button
                type="button"
                onClick={submit}
                disabled={submitting}
                className="inline-flex items-center gap-1.5 rounded-lg bg-brand-red text-white px-4 py-2 text-xs font-bold hover:bg-brand-red/90 disabled:opacity-60"
              >
                {submitting ? <Loader2 size={14} className="animate-spin" /> : <Send size={14} />}
                {submitting ? "Submitting…" : "Submit Application"}
              </button>
            </>
          )}

          {!editing && (
            <>
              <button
                type="button"
                onClick={() => {
                  setMode("edit");
                  window.scrollTo({ top: 0, behavior: "smooth" });
                }}
                className="inline-flex items-center gap-1.5 rounded-lg border px-3.5 py-2 text-xs font-bold hover:bg-gray-50"
              >
                <Pencil size={14} /> Back to Edit
              </button>
              <ToolbarBtn
                icon={<Printer size={14} />}
                label="Print"
                onClick={() => printDoc(false)}
              />
              <ToolbarBtn
                icon={<FileDown size={14} />}
                label="Download PDF"
                onClick={() => printDoc(true)}
              />
              <button
                type="button"
                onClick={submit}
                disabled={submitting}
                className="inline-flex items-center gap-1.5 rounded-lg bg-brand-red text-white px-4 py-2 text-xs font-bold hover:bg-brand-red/90 disabled:opacity-60"
              >
                {submitting ? <Loader2 size={14} className="animate-spin" /> : <Send size={14} />}
                {submitting ? "Submitting…" : "Submit Application"}
              </button>
            </>
          )}
        </div>
      </div>

      {/* Error summary */}
      {editing && errList.length > 0 && (
        <div className="max-w-7xl mx-auto w-full px-4 pt-4 no-print">
          <div className="rounded-lg border border-brand-red/40 bg-red-50 px-4 py-3 text-sm flex gap-2">
            <AlertCircle size={16} className="text-brand-red mt-0.5 shrink-0" />
            <div>
              <p className="font-bold text-brand-red">
                {errList.length} field(s) need attention before submission:
              </p>
              <ul className="mt-1 list-disc pl-5 text-xs text-red-800/90 space-y-0.5">
                {errList.slice(0, 6).map(([k, v]) => (
                  <li key={k}>{v}</li>
                ))}
                {errList.length > 6 && <li>…and {errList.length - 6} more</li>}
              </ul>
            </div>
          </div>
        </div>
      )}

      {/* Workspace */}
      {editing && step === "fees" ? (
        <CourseFeeStep
          data={form}
          courses={courses}
          errors={errors}
          onChange={patch}
          onContinue={continueToForm}
        />
      ) : (
        <div className="sci-workspace no-print-bg">
          <aside className="sci-side no-print">
            <FeeBreakdown
              pricing={form.pricingSnapshot}
              hostelFee={form.hostel === "Yes" ? form.hostelFee : 0}
              hostelName={courses.find((c) => c.id === "hostel")?.name ?? ""}
              discount={form.discount || 0}
            />
            <PaymentMethodCard
              value={form.paymentMethod}
              reference={form.paymentReference}
              amount={form.totalPayment ?? form.pricingSnapshot?.totalFee ?? 0}
              error={errors.paymentMethod}
              onChange={(m) => patch({ paymentMethod: m })}
              onReferenceChange={(v) => patch({ paymentReference: v })}
            />
            <div className="sci-side-card">
              <p className="sci-side-title">How it works</p>
              <ol className="sci-side-steps">
                <li>
                  <strong>Step 1 —</strong> कोर्स र छात्रावास छान्नुहोस्: कोर्स + छात्रावासको पूरा
                  शुल्क (Total) तुरुन्तै देखिन्छ।
                </li>
                <li>
                  <strong>Step 2 —</strong> व्यक्तिगत विवरण, फोटो, छाप र भुक्तानी भर्नुहोस् (draft
                  saves on this device).
                </li>
                <li>Preview to check exactly what will print.</li>
                <li>Print or Download PDF (A4, 3 pages).</li>
                <li>Submit — you get an Application ID instantly.</li>
              </ol>
              <p className="sci-side-note">
                Office fields (Admission No., Bill No., Discount, signatures) are filled by the
                institute only — any discount granted appears on your own copy.
              </p>
            </div>
          </aside>

          <div className="sci-paper-scroll">
            <AdmissionDocument
              data={form}
              courses={courses}
              mode={editing ? "edit" : "readonly"}
              errors={errors}
              onChange={patch}
            />
          </div>
        </div>
      )}

      <SiteFooter />
    </div>
  );
}

function ToolbarBtn({
  icon,
  label,
  onClick,
}: {
  icon: React.ReactNode;
  label: string;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className="inline-flex items-center gap-1.5 rounded-lg border px-3.5 py-2 text-xs font-bold hover:bg-gray-50"
    >
      {icon} {label}
    </button>
  );
}
