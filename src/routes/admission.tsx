import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { z } from "zod";
import { CheckCircle2, Loader2, Copy } from "lucide-react";
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
import { supabase } from "@/integrations/supabase/client";

const admissionSchema = z.object({
  full_name: z.string().trim().min(2).max(120),
  date_of_birth: z.string().optional(),
  gender: z.string().optional(),
  phone: z.string().trim().min(7).max(20),
  email: z.string().trim().email().max(255).optional().or(z.literal("")),
  address: z.string().trim().min(3).max(250),
  citizenship_number: z.string().trim().max(50).optional().or(z.literal("")),
  parent_name: z.string().trim().min(2).max(120),
  parent_phone: z.string().trim().min(7).max(20),
  previous_school: z.string().trim().max(150).optional().or(z.literal("")),
  previous_qualification: z.string().trim().max(150).optional().or(z.literal("")),
  course_id: z.string().min(1, "Please select a course"),
  notes: z.string().trim().max(500).optional().or(z.literal("")),
});

type AdmissionSearch = { course?: string };

export const Route = createFileRoute("/admission")({
  validateSearch: (s: Record<string, unknown>): AdmissionSearch => ({
    course: typeof s.course === "string" ? s.course : undefined,
  }),
  head: () => ({
    meta: [
      { title: "Online Admission — Star Coaching Institute" },
      {
        name: "description",
        content:
          "Apply online for admission at Star Coaching Institute Janakpurdham — Nepal Police, Army, Loksewa, Medical, Technical or Tuition classes. Free online form, instant admission number.",
      },
    ],
  }),
  component: AdmissionPage,
});

function AdmissionPage() {
  const { course: prefillSlug } = Route.useSearch();
  const navigate = useNavigate();
  const [submitting, setSubmitting] = useState(false);
  const [result, setResult] = useState<{ admission_number: string; full_name: string } | null>(null);

  const { data: courses = [] } = useQuery({
    queryKey: ["admission-courses"],
    queryFn: async () => {
      const { data } = await supabase
        .from("courses")
        .select("id, slug, title, category, fee_npr")
        .eq("is_active", true)
        .order("sort_order");
      return data ?? [];
    },
  });

  const [form, setForm] = useState({
    full_name: "",
    date_of_birth: "",
    gender: "",
    phone: "",
    email: "",
    address: "",
    citizenship_number: "",
    parent_name: "",
    parent_phone: "",
    previous_school: "",
    previous_qualification: "",
    course_id: "",
    notes: "",
  });

  // Prefill from ?course=slug
  const prefilledCourse = prefillSlug
    ? courses.find((c) => c.slug === prefillSlug)
    : undefined;
  if (prefilledCourse && form.course_id !== prefilledCourse.id) {
    setForm((f) => ({ ...f, course_id: prefilledCourse.id }));
  }

  const handleChange = (key: keyof typeof form) => (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) =>
    setForm((f) => ({ ...f, [key]: e.target.value }));

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      const parsed = admissionSchema.safeParse(form);
      if (!parsed.success) {
        const first = parsed.error.issues[0];
        toast.error(first?.message ?? "Please check the form.");
        setSubmitting(false);
        return;
      }

      const chosen = courses.find((c) => c.id === form.course_id);
      if (!chosen) {
        toast.error("Please select a valid course.");
        setSubmitting(false);
        return;
      }

      const { data: userData } = await supabase.auth.getUser();

      const { data, error } = await supabase
        .from("admissions")
        .insert({
          full_name: form.full_name.trim(),
          date_of_birth: form.date_of_birth || null,
          gender: form.gender || null,
          phone: form.phone.trim(),
          email: form.email.trim() || null,
          address: form.address.trim(),
          citizenship_number: form.citizenship_number.trim() || null,
          parent_name: form.parent_name.trim(),
          parent_phone: form.parent_phone.trim(),
          previous_school: form.previous_school.trim() || null,
          previous_qualification: form.previous_qualification.trim() || null,
          course_id: chosen.id,
          course_title: chosen.title,
          notes: form.notes.trim() || null,
          user_id: userData.user?.id ?? null,
          status: "pending",
        })
        .select("admission_number, full_name")
        .single();

      if (error) throw error;

      setResult({
        admission_number: data.admission_number!,
        full_name: data.full_name,
      });
      toast.success("Application submitted!");
    } catch (err) {
      console.error(err);
      toast.error(err instanceof Error ? err.message : "Something went wrong.");
    } finally {
      setSubmitting(false);
    }
  };

  if (result) {
    return (
      <div className="min-h-screen flex flex-col">
        <SiteHeader />
        <main className="flex-1 py-14">
          <div className="max-w-lg mx-auto px-4">
            <div className="bg-white border-2 border-brand-red/30 rounded-2xl p-8 text-center shadow-red">
              <div className="w-16 h-16 rounded-full bg-brand-red/10 text-brand-red mx-auto flex items-center justify-center">
                <CheckCircle2 className="w-8 h-8" />
              </div>
              <h1 className="font-display font-black text-2xl text-navy mt-4">
                Admission Submitted!
              </h1>
              <p className="text-muted-foreground mt-2">
                Welcome, <strong className="text-foreground">{result.full_name}</strong>. Our
                team will call you shortly to complete verification.
              </p>

              <div className="mt-6 bg-navy text-navy-foreground rounded-xl p-4">
                <p className="text-xs uppercase tracking-widest text-gold font-bold">
                  Your Admission Number
                </p>
                <div className="flex items-center justify-center gap-2 mt-2">
                  <p className="font-display font-black text-2xl tracking-wider">
                    {result.admission_number}
                  </p>
                  <button
                    onClick={() => {
                      navigator.clipboard.writeText(result.admission_number);
                      toast.success("Copied");
                    }}
                    className="p-1.5 rounded-md hover:bg-white/10"
                    aria-label="Copy"
                  >
                    <Copy className="w-4 h-4" />
                  </button>
                </div>
                <p className="text-[11px] text-white/60 mt-2">
                  Keep this number safe. You'll need it during your first visit.
                </p>
              </div>

              <div className="mt-6 flex flex-col sm:flex-row gap-2">
                <Button
                  className="flex-1 bg-brand-red hover:bg-brand-red/90 text-brand-red-foreground font-bold"
                  onClick={() => navigate({ to: "/auth" })}
                >
                  Create student login
                </Button>
                <Button
                  variant="outline"
                  className="flex-1 border-navy text-navy font-bold"
                  onClick={() => navigate({ to: "/" })}
                >
                  Go to home
                </Button>
              </div>
            </div>
          </div>
        </main>
        <SiteFooter />
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col">
      <SiteHeader />
      <main className="flex-1">
        <section className="bg-navy text-navy-foreground py-12">
          <div className="max-w-3xl mx-auto px-4 text-center">
            <p className="text-xs uppercase tracking-widest text-gold font-bold">Admission Open</p>
            <h1 className="font-display font-black text-3xl md:text-4xl mt-2">Online Admission</h1>
            <p className="mt-3 text-white/70">
              Fill this short form and we'll generate your admission number instantly.
            </p>
          </div>
        </section>

        <section className="py-10">
          <form
            onSubmit={handleSubmit}
            className="max-w-3xl mx-auto px-4 space-y-8"
          >
            <FormSection title="Student information">
              <Field label="Full Name *">
                <Input value={form.full_name} onChange={handleChange("full_name")} required maxLength={120} />
              </Field>
              <div className="grid gap-4 sm:grid-cols-2">
                <Field label="Date of Birth">
                  <Input type="date" value={form.date_of_birth} onChange={handleChange("date_of_birth")} />
                </Field>
                <Field label="Gender">
                  <Select value={form.gender} onValueChange={(v) => setForm((f) => ({ ...f, gender: v }))}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="male">Male</SelectItem>
                      <SelectItem value="female">Female</SelectItem>
                      <SelectItem value="other">Other</SelectItem>
                    </SelectContent>
                  </Select>
                </Field>
              </div>
              <div className="grid gap-4 sm:grid-cols-2">
                <Field label="Phone *">
                  <Input value={form.phone} onChange={handleChange("phone")} required maxLength={20} />
                </Field>
                <Field label="Email">
                  <Input type="email" value={form.email} onChange={handleChange("email")} maxLength={255} />
                </Field>
              </div>
              <Field label="Full Address *">
                <Input value={form.address} onChange={handleChange("address")} required maxLength={250} placeholder="Municipality, Ward, District" />
              </Field>
              <Field label="Citizenship Number">
                <Input value={form.citizenship_number} onChange={handleChange("citizenship_number")} maxLength={50} />
              </Field>
            </FormSection>

            <FormSection title="Parent / Guardian">
              <div className="grid gap-4 sm:grid-cols-2">
                <Field label="Parent / Guardian Name *">
                  <Input value={form.parent_name} onChange={handleChange("parent_name")} required maxLength={120} />
                </Field>
                <Field label="Parent Phone *">
                  <Input value={form.parent_phone} onChange={handleChange("parent_phone")} required maxLength={20} />
                </Field>
              </div>
            </FormSection>

            <FormSection title="Education background">
              <div className="grid gap-4 sm:grid-cols-2">
                <Field label="Previous School">
                  <Input value={form.previous_school} onChange={handleChange("previous_school")} maxLength={150} />
                </Field>
                <Field label="Last Qualification">
                  <Input value={form.previous_qualification} onChange={handleChange("previous_qualification")} maxLength={150} placeholder="e.g. SEE, +2, BSc" />
                </Field>
              </div>
            </FormSection>

            <FormSection title="Course selection">
              <Field label="Choose Course *">
                <Select value={form.course_id} onValueChange={(v) => setForm((f) => ({ ...f, course_id: v }))}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select a course" />
                  </SelectTrigger>
                  <SelectContent>
                    {courses.map((c) => (
                      <SelectItem key={c.id} value={c.id}>
                        {c.title} <span className="text-muted-foreground">— {c.category}</span>
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </Field>
              <Field label="Notes (optional)">
                <Textarea value={form.notes} onChange={handleChange("notes")} maxLength={500} rows={3} placeholder="Any specific request or question" />
              </Field>
            </FormSection>

            <div className="bg-secondary/60 border border-border rounded-2xl p-5 text-sm text-muted-foreground">
              By submitting this form, you agree to be contacted by Star Coaching Institute regarding your admission. Fee payment (eSewa · Khalti · FonePay · IME Pay · Cash) is handled after verification.
            </div>

            <Button
              type="submit"
              size="lg"
              className="w-full bg-brand-red hover:bg-brand-red/90 text-brand-red-foreground font-bold shadow-red"
              disabled={submitting}
            >
              {submitting ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" /> Submitting...
                </>
              ) : (
                "Submit Admission Application"
              )}
            </Button>
          </form>
        </section>
      </main>
      <SiteFooter />
    </div>
  );
}

function FormSection({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="bg-white border border-border rounded-2xl p-5 md:p-6 space-y-4">
      <h2 className="font-display font-black text-lg text-navy border-b border-border pb-3">
        {title}
      </h2>
      {children}
    </div>
  );
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="space-y-1.5">
      <Label className="text-xs uppercase tracking-wider font-bold text-foreground/80">
        {label}
      </Label>
      {children}
    </div>
  );
}
