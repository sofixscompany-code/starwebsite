import { useNavigate } from "react-router-dom";
import { useState, useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import { z } from "zod";
import {
  CheckCircle2, Loader2, Copy, MessageCircle, Printer,
  Home, UserPlus, ArrowRight, Shield, LayoutDashboard,
  ChevronRight, ChevronLeft, AlertCircle, Smartphone,
} from "lucide-react";
import { toast } from "sonner";
import { SiteHeader } from "@/components/site/SiteHeader";
import { SiteFooter } from "@/components/site/SiteFooter";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { firebaseAuth } from "@/integrations/firebase/auth";
import { collection, addDoc, query, where, orderBy, getDocs, serverTimestamp } from "firebase/firestore";
import { db } from "@/integrations/firebase/config";

const WHATSAPP_NUMBER = "977984XXXXXXX";

const admissionSchema = z.object({
  fullName: z.string().trim().min(2, "Name must be at least 2 characters").max(120),
  dateOfBirth: z.string().optional(),
  gender: z.string().optional(),
  phone: z.string().trim().min(7, "Enter a valid phone number").max(20),
  email: z.string().trim().email().max(255).optional().or(z.literal("")),
  address: z.string().trim().min(3, "Address is required").max(250),
  citizenshipNumber: z.string().trim().max(50).optional().or(z.literal("")),
  parentName: z.string().trim().min(2, "Parent name is required").max(120),
  parentPhone: z.string().trim().min(7, "Enter a valid phone number").max(20),
  previousSchool: z.string().trim().max(150).optional().or(z.literal("")),
  previousQualification: z.string().trim().max(150).optional().or(z.literal("")),
  courseId: z.string().min(1, "Please select a course"),
  notes: z.string().trim().max(500).optional().or(z.literal("")),
});

type AdmissionSearch = { course?: string };

export function generateAdmissionNumber() {
  const year = new Date().getFullYear();
  const rand = Math.floor(1000 + Math.random() * 9000);
  return `SCI-${year}-${rand}`;
}

export function formatWhatsAppMessage(data: {
  admissionNumber: string;
  fullName: string;
  phone: string;
  courseTitle: string;
  parentName: string;
  parentPhone: string;
  address: string;
}) {
  return encodeURIComponent(
    ` *New Admission — Star Coaching Institute*\n\n` +
    ` *Admission #:* ${data.admissionNumber}\n` +
    ` *Name:* ${data.fullName}\n` +
    ` *Phone:* ${data.phone}\n` +
    ` *Course:* ${data.courseTitle}\n` +
    ` *Guardian:* ${data.parentName}\n` +
    ` *Guardian Phone:* ${data.parentPhone}\n` +
    ` *Address:* ${data.address}\n\n` +
    `_Please verify and process this admission._`
  );
}

const STEPS = ["Personal Info", "Guardian", "Education", "Course", "Review"];

export function AdmissionPage() {
  const navigate = useNavigate();
  const [step, setStep] = useState(0);
  const [submitting, setSubmitting] = useState(false);
  const [result, setResult] = useState<AdmissionResult | null>(null);
  const [errors, setErrors] = useState<Record<string, string>>({});

  const { data: courses = [] } = useQuery({
    queryKey: ["admission-courses"],
    queryFn: async () => {
      const q = query(collection(db, "courses"), where("isActive", "==", true), orderBy("sortOrder"));
      const snap = await getDocs(q);
      return snap.docs.map((d) => ({ id: d.id, ...d.data() }));
    },
  });

  const [form, setForm] = useState({
    fullName: "",
    dateOfBirth: "",
    gender: "",
    phone: "",
    email: "",
    address: "",
    citizenshipNumber: "",
    parentName: "",
    parentPhone: "",
    previousSchool: "",
    previousQualification: "",
    courseId: "",
    notes: "",
  });

  const prefillSlug = "";
  const prefilledCourse = prefillSlug
    ? courses.find((c: any) => c.slug === prefillSlug)
    : undefined;
  useEffect(() => {
    if (prefilledCourse && !form.courseId) {
      setForm((f) => ({ ...f, courseId: prefilledCourse.id }));
    }
  }, [prefilledCourse, courses]);

  const handleChange = (key: keyof typeof form) => (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setForm((f) => ({ ...f, [key]: e.target.value }));
    if (errors[key]) setErrors((prev) => { const n = { ...prev }; delete n[key]; return n; });
  };

  const validateStep = (s: number): boolean => {
    const fields: Record<number, (keyof typeof form)[]> = {
      0: ["fullName", "phone", "address"],
      1: ["parentName", "parentPhone"],
      2: [],
      3: ["courseId"],
      4: [],
    };
    const required = fields[s] || [];
    const newErrors: Record<string, string> = {};
    required.forEach((f) => {
      if (!form[f] || (typeof form[f] === "string" && !(form[f] as string).trim())) {
        newErrors[f] = "This field is required";
      }
    });
    if (s === 0 && form.phone && form.phone.replace(/\D/g, "").length < 7) {
      newErrors.phone = "Enter a valid phone number";
    }
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const nextStep = () => {
    if (validateStep(step)) setStep((s) => Math.min(s + 1, 4));
  };
  const prevStep = () => setStep((s) => Math.max(s - 1, 0));

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validateStep(4)) return;
    setSubmitting(true);
    try {
      const parsed = admissionSchema.safeParse(form);
      if (!parsed.success) {
        toast.error(parsed.error.issues[0]?.message ?? "Please check the form.");
        setSubmitting(false);
        return;
      }

      const chosen = courses.find((c: any) => c.id === form.courseId);
      if (!chosen) {
        toast.error("Please select a valid course.");
        setSubmitting(false);
        return;
      }

      const { data: userData } = await firebaseAuth.getUser();
      const admissionNumber = generateAdmissionNumber();

      await addDoc(collection(db, "admissions"), {
        admissionNumber,
        fullName: form.fullName.trim(),
        dateOfBirth: form.dateOfBirth || null,
        gender: form.gender || null,
        phone: form.phone.trim(),
        email: form.email.trim() || null,
        address: form.address.trim(),
        citizenshipNumber: form.citizenshipNumber.trim() || null,
        parentName: form.parentName.trim(),
        parentPhone: form.parentPhone.trim(),
        previousSchool: form.previousSchool.trim() || null,
        previousQualification: form.previousQualification.trim() || null,
        courseId: chosen.id,
        courseTitle: (chosen as any).title,
        courseCategory: (chosen as any).category || null,
        notes: form.notes.trim() || null,
        userId: userData?.user?.uid ?? null,
        status: "pending",
        createdAt: serverTimestamp(),
      });

      setResult({
        admissionNumber,
        fullName: form.fullName.trim(),
        phone: form.phone.trim(),
        courseTitle: (chosen as any).title,
        parentName: form.parentName.trim(),
        parentPhone: form.parentPhone.trim(),
        address: form.address.trim(),
      });
      toast.success("Application submitted successfully!");
    } catch (err) {
      console.error(err);
      toast.error(err instanceof Error ? err.message : "Something went wrong.");
    } finally {
      setSubmitting(false);
    }
  };

  if (result) {
    return <SuccessPage result={result} navigate={navigate} />;
  }

  return (
    <div className="min-h-screen flex flex-col">
      <SiteHeader />

      {/* Role-based demo bar */}
      <div className="bg-gradient-to-r from-purple-600 to-orange-500 text-white py-2">
        <div className="max-w-4xl mx-auto px-4 flex items-center justify-center gap-3 text-sm">
          <span className="font-semibold">Demo Mode:</span>
          <button
            onClick={() => navigate("/auth")}
            className="flex items-center gap-1.5 bg-white/20 hover:bg-white/30 px-3 py-1 rounded-full transition font-medium"
          >
            <LayoutDashboard className="w-3.5 h-3.5" /> Student Dashboard
          </button>
          <button
            onClick={() => navigate("/admin")}
            className="flex items-center gap-1.5 bg-white/20 hover:bg-white/30 px-3 py-1 rounded-full transition font-medium"
          >
            <Shield className="w-3.5 h-3.5" /> Admin Panel
          </button>
        </div>
      </div>

      <main className="flex-1">
        <section className="bg-navy text-navy-foreground py-10 md:py-14">
          <div className="max-w-3xl mx-auto px-4 text-center">
            <p className="text-xs uppercase tracking-widest text-gold font-bold">Admission Open 2082/83</p>
            <h1 className="font-display font-black text-3xl md:text-4xl mt-2">Online Admission</h1>
            <p className="mt-3 text-white/70">
              Fill this form and we'll generate your admission number instantly.
            </p>
          </div>
        </section>

        <section className="py-8 md:py-12">
          <div className="max-w-3xl mx-auto px-4">
            {/* Step indicator */}
            <div className="flex items-center justify-between mb-8 px-2">
              {STEPS.map((s, i) => (
                <div key={s} className="flex items-center flex-1">
                  <div className="flex flex-col items-center">
                    <div
                      className={`w-9 h-9 rounded-full flex items-center justify-center text-xs font-bold transition-all ${
                        i < step
                          ? "ap-grad text-white"
                          : i === step
                          ? "ap-grad text-white ring-4 ring-purple-200"
                          : "bg-gray-200 text-gray-500"
                      }`}
                    >
                      {i < step ? <CheckCircle2 className="w-4 h-4" /> : i + 1}
                    </div>
                    <span
                      className={`text-[10px] mt-1.5 font-semibold hidden sm:block ${
                        i <= step ? "text-navy" : "text-gray-400"
                      }`}
                    >
                      {s}
                    </span>
                  </div>
                  {i < STEPS.length - 1 && (
                    <div className={`flex-1 h-0.5 mx-2 ${i < step ? "ap-grad" : "bg-gray-200"}`} />
                  )}
                </div>
              ))}
            </div>

            <form onSubmit={handleSubmit} className="space-y-6">
              {/* Step 0: Personal Info */}
              {step === 0 && (
                <FormSection title="Student Information" icon={UserPlus}>
                  <Field label="Full Name *" error={errors.fullName}>
                    <Input
                      value={form.fullName}
                      onChange={handleChange("fullName")}
                      maxLength={120}
                      placeholder="Enter your full name"
                      className={errors.fullName ? "border-red-400" : ""}
                    />
                  </Field>
                  <div className="grid gap-4 sm:grid-cols-2">
                    <Field label="Date of Birth">
                      <Input type="date" value={form.dateOfBirth} onChange={handleChange("dateOfBirth")} />
                    </Field>
                    <Field label="Gender">
                      <Select value={form.gender} onValueChange={(v) => setForm((f) => ({ ...f, gender: v }))}>
                        <SelectTrigger><SelectValue placeholder="Select" /></SelectTrigger>
                        <SelectContent>
                          <SelectItem value="male">Male</SelectItem>
                          <SelectItem value="female">Female</SelectItem>
                          <SelectItem value="other">Other</SelectItem>
                        </SelectContent>
                      </Select>
                    </Field>
                  </div>
                  <div className="grid gap-4 sm:grid-cols-2">
                    <Field label="Phone *" error={errors.phone}>
                      <Input
                        value={form.phone}
                        onChange={handleChange("phone")}
                        maxLength={20}
                        placeholder="98XXXXXXXX"
                        className={errors.phone ? "border-red-400" : ""}
                      />
                    </Field>
                    <Field label="Email">
                      <Input type="email" value={form.email} onChange={handleChange("email")} maxLength={255} placeholder="your@email.com" />
                    </Field>
                  </div>
                  <Field label="Full Address *" error={errors.address}>
                    <Input
                      value={form.address}
                      onChange={handleChange("address")}
                      maxLength={250}
                      placeholder="Municipality, Ward, District"
                      className={errors.address ? "border-red-400" : ""}
                    />
                  </Field>
                  <Field label="Citizenship Number">
                    <Input value={form.citizenshipNumber} onChange={handleChange("citizenshipNumber")} maxLength={50} placeholder="XX-XX-XX-XXXXX" />
                  </Field>
                </FormSection>
              )}

              {/* Step 1: Guardian */}
              {step === 1 && (
                <FormSection title="Parent / Guardian" icon={UserPlus}>
                  <Field label="Parent / Guardian Name *" error={errors.parentName}>
                    <Input
                      value={form.parentName}
                      onChange={handleChange("parentName")}
                      maxLength={120}
                      placeholder="Father/Mother/Guardian name"
                      className={errors.parentName ? "border-red-400" : ""}
                    />
                  </Field>
                  <Field label="Parent Phone *" error={errors.parentPhone}>
                    <Input
                      value={form.parentPhone}
                      onChange={handleChange("parentPhone")}
                      maxLength={20}
                      placeholder="98XXXXXXXX"
                      className={errors.parentPhone ? "border-red-400" : ""}
                    />
                  </Field>
                  <div className="bg-blue-50 border border-blue-200 rounded-xl p-4 flex items-start gap-3">
                    <AlertCircle className="w-5 h-5 text-blue-600 mt-0.5 shrink-0" />
                    <p className="text-sm text-blue-800">
                      We'll use this number to contact your guardian regarding admission verification and fee details.
                    </p>
                  </div>
                </FormSection>
              )}

              {/* Step 2: Education */}
              {step === 2 && (
                <FormSection title="Education Background" icon={UserPlus}>
                  <div className="grid gap-4 sm:grid-cols-2">
                    <Field label="Previous School">
                      <Input value={form.previousSchool} onChange={handleChange("previousSchool")} maxLength={150} placeholder="School name" />
                    </Field>
                    <Field label="Last Qualification">
                      <Input value={form.previousQualification} onChange={handleChange("previousQualification")} maxLength={150} placeholder="e.g. SEE, +2, BSc" />
                    </Field>
                  </div>
                </FormSection>
              )}

              {/* Step 3: Course */}
              {step === 3 && (
                <FormSection title="Course Selection" icon={UserPlus}>
                  <Field label="Choose Course *" error={errors.courseId}>
                    <Select value={form.courseId} onValueChange={(v) => setForm((f) => ({ ...f, courseId: v }))}>
                      <SelectTrigger className={errors.courseId ? "border-red-400" : ""}>
                        <SelectValue placeholder="Select a course" />
                      </SelectTrigger>
                      <SelectContent>
                        {courses.map((c: any) => (
                          <SelectItem key={c.id} value={c.id}>
                            {(c as any).title}
                            {c.feeNpr && (
                              <span className="text-muted-foreground ml-2">
                                · ₹{c.feeNpr.toLocaleString()}
                              </span>
                            )}
                          </SelectItem>
                        ))}
                        {courses.length === 0 && (
                          <SelectItem value="_none" disabled>Loading courses...</SelectItem>
                        )}
                      </SelectContent>
                    </Select>
                  </Field>

                  {form.courseId && (
                    <div className="ap-card p-4 bg-purple-50 border-purple-200">
                      {(() => {
                        const c = courses.find((x: any) => x.id === form.courseId);
                        if (!c) return null;
                        return (
                          <div className="flex items-start gap-3">
                            <div className="w-10 h-10 rounded-xl ap-grad flex items-center justify-center text-white shrink-0">
                              <CheckCircle2 className="w-5 h-5" />
                            </div>
                            <div>
                              <p className="font-bold text-navy">{(c as any).title}</p>
                              <p className="text-xs text-muted-foreground">{(c as any).category}</p>
                              {(c as any).duration && <p className="text-xs text-muted-foreground mt-1">Duration: {(c as any).duration}</p>}
                              {(c as any).feeNpr && <p className="text-sm font-bold text-green-700 mt-1">Fee: ₹{(c as any).feeNpr.toLocaleString()}</p>}
                            </div>
                          </div>
                        );
                      })()}
                    </div>
                  )}

                  <Field label="Notes (optional)">
                    <Textarea value={form.notes} onChange={handleChange("notes")} maxLength={500} rows={3} placeholder="Any specific request or question" />
                  </Field>
                </FormSection>
              )}

              {/* Step 4: Review */}
              {step === 4 && (
                <FormSection title="Review & Submit" icon={UserPlus}>
                  <div className="space-y-3">
                    <ReviewRow label="Name" value={form.fullName} />
                    <div className="grid grid-cols-2 gap-3">
                      <ReviewRow label="Phone" value={form.phone} />
                      <ReviewRow label="Email" value={form.email || "—"} />
                    </div>
                    <ReviewRow label="Address" value={form.address} />
                    <ReviewRow label="Date of Birth" value={form.dateOfBirth || "—"} />
                    <ReviewRow label="Gender" value={form.gender || "—"} />
                    <div className="border-t pt-3 mt-3">
                      <ReviewRow label="Guardian" value={form.parentName} />
                      <ReviewRow label="Guardian Phone" value={form.parentPhone} />
                    </div>
                    {form.previousSchool && <ReviewRow label="Previous School" value={form.previousSchool} />}
                    {form.previousQualification && <ReviewRow label="Qualification" value={form.previousQualification} />}
                    <div className="border-t pt-3 mt-3">
                      {(() => {
                        const c = courses.find((x: any) => x.id === form.courseId);
                        return c ? <ReviewRow label="Course" value={`${(c as any).title} (${(c as any).category})`} highlight /> : null;
                      })()}
                    </div>
                    {form.notes && <ReviewRow label="Notes" value={form.notes} />}
                  </div>

                  <div className="bg-green-50 border border-green-200 rounded-xl p-4 flex items-start gap-3 mt-4">
                    <Smartphone className="w-5 h-5 text-green-600 mt-0.5 shrink-0" />
                    <div>
                      <p className="text-sm font-semibold text-green-800">WhatsApp Confirmation</p>
                      <p className="text-xs text-green-700 mt-1">
                        After submission, you can share your admission details via WhatsApp for faster processing.
                      </p>
                    </div>
                  </div>
                </FormSection>
              )}

              {/* Agreement */}
              <div className="bg-secondary/60 border border-border rounded-2xl p-5 text-sm text-muted-foreground">
                By submitting this form, you agree to be contacted by Star Coaching Institute regarding your admission.
                Fee payment (eSewa · Khalti · FonePay · IME Pay · Cash) is handled after verification.
              </div>

              {/* Navigation */}
              <div className="flex items-center justify-between gap-3">
                {step > 0 ? (
                  <button type="button" onClick={prevStep} className="ap-btn-ghost flex items-center gap-2">
                    <ChevronLeft className="w-4 h-4" /> Back
                  </button>
                ) : (
                  <div />
                )}

                {step < 4 ? (
                  <button type="button" onClick={nextStep} className="ap-btn flex items-center gap-2">
                    Next <ChevronRight className="w-4 h-4" />
                  </button>
                ) : (
                  <Button
                    type="submit"
                    size="lg"
                    className="bg-brand-red hover:bg-brand-red/90 text-brand-red-foreground font-bold shadow-red"
                    disabled={submitting}
                  >
                    {submitting ? (
                      <><Loader2 className="w-4 h-4 mr-2 animate-spin" /> Submitting...</>
                    ) : (
                      <><CheckCircle2 className="w-4 h-4 mr-2" /> Submit Application</>
                    )}
                  </Button>
                )}
              </div>
            </form>
          </div>
        </section>
      </main>
      <SiteFooter />
    </div>
  );
}

/* -------------------- SUCCESS PAGE -------------------- */
interface AdmissionResult {
  admissionNumber: string;
  fullName: string;
  phone: string;
  courseTitle: string;
  parentName: string;
  parentPhone: string;
  address: string;
}

export function SuccessPage({ result, navigate }: { result: AdmissionResult; navigate: (to: string) => void }) {
  const waMsg = formatWhatsAppMessage(result);
  const waUrl = `https://wa.me/${WHATSAPP_NUMBER}?text=${waMsg}`;

  return (
    <div className="min-h-screen flex flex-col">
      <SiteHeader />
      <main className="flex-1 py-10">
        <div className="max-w-lg mx-auto px-4">
          <div className="bg-white border-2 border-green-300 rounded-2xl p-8 text-center shadow-lg">
            <div className="w-20 h-20 rounded-full bg-green-100 text-green-600 mx-auto flex items-center justify-center">
              <CheckCircle2 className="w-10 h-10" />
            </div>
            <h1 className="font-display font-black text-2xl text-navy mt-4">
              Admission Submitted!
            </h1>
            <p className="text-muted-foreground mt-2">
              Welcome, <strong className="text-foreground">{result.fullName}</strong>. Our team will call you shortly.
            </p>

            <div className="mt-6 bg-navy text-navy-foreground rounded-xl p-5">
              <p className="text-xs uppercase tracking-widest text-gold font-bold">Your Admission Number</p>
              <div className="flex items-center justify-center gap-2 mt-2">
                <p className="font-display font-black text-3xl tracking-wider">{result.admissionNumber}</p>
                <button
                  onClick={() => { navigator.clipboard.writeText(result.admissionNumber); toast.success("Copied!"); }}
                  className="p-2 rounded-lg hover:bg-white/10 transition"
                >
                  <Copy className="w-4 h-4" />
                </button>
              </div>
              <p className="text-[11px] text-white/60 mt-2">Keep this number safe for your first visit.</p>
            </div>

            {/* Quick info */}
            <div className="mt-4 grid grid-cols-2 gap-3 text-left">
              <div className="bg-gray-50 rounded-xl p-3">
                <p className="text-[10px] uppercase text-muted-foreground font-bold">Course</p>
                <p className="text-sm font-semibold text-navy">{result.courseTitle}</p>
              </div>
              <div className="bg-gray-50 rounded-xl p-3">
                <p className="text-[10px] uppercase text-muted-foreground font-bold">Status</p>
                <p className="text-sm font-semibold text-amber-600">Pending Verification</p>
              </div>
            </div>

            {/* Action buttons */}
            <div className="mt-6 space-y-3">
              <a
                href={waUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center justify-center gap-2 w-full py-3 rounded-xl bg-green-500 hover:bg-green-600 text-white font-bold transition"
              >
                <MessageCircle className="w-5 h-5" /> Share via WhatsApp
              </a>

              <button
                onClick={() => window.print()}
                className="flex items-center justify-center gap-2 w-full py-3 rounded-xl border-2 border-navy text-navy font-bold hover:bg-navy hover:text-white transition"
              >
                <Printer className="w-4 h-4" /> Print Admission Form
              </button>
            </div>

            <div className="mt-6 flex flex-col sm:flex-row gap-2">
              <Button
                className="flex-1 bg-brand-red hover:bg-brand-red/90 text-brand-red-foreground font-bold"
                onClick={() => navigate("/auth")}
              >
                <UserPlus className="w-4 h-4 mr-1.5" /> Create Login
              </Button>
              <Button
                variant="outline"
                className="flex-1 border-navy text-navy font-bold"
                onClick={() => navigate("/")}
              >
                <Home className="w-4 h-4 mr-1.5" /> Go Home
              </Button>
            </div>
          </div>
        </div>
      </main>
      <SiteFooter />
    </div>
  );
}

/* -------------------- FORM COMPONENTS -------------------- */
export function FormSection({
  title, icon: Icon, children,
}: {
  title: string; icon: React.ComponentType<{ className?: string }>; children: React.ReactNode;
}) {
  return (
    <div className="bg-white border border-border rounded-2xl p-5 md:p-6 space-y-4">
      <div className="flex items-center gap-2 pb-3 border-b border-border">
        <div className="w-8 h-8 rounded-lg ap-grad flex items-center justify-center text-white">
          <Icon className="w-4 h-4" />
        </div>
        <h2 className="font-display font-black text-lg text-navy">{title}</h2>
      </div>
      {children}
    </div>
  );
}

export function Field({
  label, children, error,
}: {
  label: string; children: React.ReactNode; error?: string;
}) {
  return (
    <div className="space-y-1.5">
      <Label className="text-xs uppercase tracking-wider font-bold text-foreground/80">
        {label}
      </Label>
      {children}
      {error && <p className="text-xs text-red-500 font-medium">{error}</p>}
    </div>
  );
}

export function ReviewRow({
  label, value, highlight,
}: {
  label: string; value: string; highlight?: boolean;
}) {
  return (
    <div className="flex justify-between items-start py-1.5">
      <span className="text-xs uppercase text-muted-foreground font-bold">{label}</span>
      <span className={`text-sm text-right max-w-[60%] ${highlight ? "font-bold text-navy" : "font-medium"}`}>
        {value}
      </span>
    </div>
  );
}




