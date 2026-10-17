import { AlertCircle, ArrowRight, Home } from "lucide-react";
import { cn } from "@/lib/utils";
import type {
  AdmissionCourse,
  AdmissionFormData,
  Organization,
  AppliedPost,
} from "@/lib/admission-form/types";
import { ORGANIZATIONS, POSTS, PACKAGE_TYPES } from "@/lib/admission-form/types";
import { FeeBreakdown } from "./FeeBreakdown";

type Errors = Record<string, string>;

interface Props {
  data: AdmissionFormData;
  courses: AdmissionCourse[];
  errors: Errors;
  onChange: (patch: Partial<AdmissionFormData>) => void;
  onContinue: () => void;
}

function money(n: number | null | undefined): string {
  return n == null ? "—" : n.toLocaleString("en-IN");
}

/** Option price tag — min–max when a course has multiple active packages. */
function priceTag(pkgs: AdmissionCourse["packages"]): string {
  const totals = pkgs.filter((p) => p.active !== false).map((p) => p.totalFee);
  if (!totals.length) return "";
  const min = Math.min(...totals);
  const max = Math.max(...totals);
  return min === max ? `Rs. ${money(min)}` : `Rs. ${money(min)} – Rs. ${money(max)}`;
}

/**
 * Part 1 of the two-step admission form: pick Organization → Post → Course →
 * Package → Hostel and see the exact fee (course + hostel) BEFORE opening the
 * full application form. Mirrors the document's selection logic so switching
 * between steps never loses or desyncs state.
 */
export function CourseFeeStep({ data, courses, errors, onChange, onContinue }: Props) {
  const active = courses.filter((c) => c.active !== false);
  const courseOptions = active.filter((c) => c.id !== "hostel");
  const hostelCourse = active.find((c) => c.id === "hostel");
  const hostelPkg = hostelCourse?.packages.find((p) => p.active !== false);
  const selectedCourse = active.find((c) => c.id === data.courseId);
  const packages = (selectedCourse?.packages ?? []).filter((p) => p.active !== false);

  const selectCourse = (id: string) => {
    const c = active.find((x) => x.id === id);
    onChange({
      courseId: id,
      courseName: c?.name ?? "",
      classAppliedFor: c?.name ?? "",
      coursePackage: "",
      packageDuration: "",
      pricingSnapshot: null,
      totalPayment: null,
    });
  };

  const selectPackage = (name: string) => {
    const pkg = packages.find((p) => p.name === name);
    if (!pkg || !selectedCourse) {
      onChange({
        coursePackage: name,
        packageDuration: "",
        pricingSnapshot: null,
        totalPayment: null,
      });
      return;
    }
    onChange({
      coursePackage: name,
      packageDuration: pkg.duration,
      pricingSnapshot: {
        admissionFee: pkg.admissionFee,
        tuitionFee: pkg.tuitionFee,
        examFee: pkg.examFee,
        physicalFee: pkg.physicalFee,
        additionalFee: pkg.additionalFee,
        totalFee: pkg.totalFee,
        package: pkg.name,
        course: selectedCourse.name,
        capturedAt: Date.now(),
      },
      totalPayment: pkg.totalFee + (data.hostel === "Yes" ? data.hostelFee : 0),
    });
  };

  const setHostel = (h: "Yes" | "No") => {
    const hostelFee = h === "Yes" ? (hostelPkg?.totalFee ?? 0) : 0;
    onChange({
      hostel: h,
      hostelFee,
      totalPayment: data.pricingSnapshot ? data.pricingSnapshot.totalFee + hostelFee : null,
    });
  };

  const errList = Object.entries(errors);
  const total =
    (data.pricingSnapshot?.totalFee ?? 0) + (data.hostel === "Yes" ? data.hostelFee : 0);

  return (
    <div className="max-w-4xl mx-auto px-4 py-8">
      {/* Step heading */}
      <div className="flex items-start gap-3 mb-6">
        <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-brand-red text-white font-extrabold text-lg">
          1
        </span>
        <div className="min-w-0">
          <h2 className="text-xl font-extrabold text-navy leading-tight">
            Course &amp; Hostel Fees
          </h2>
          <p className="text-sm text-muted-foreground mt-0.5">
            आफ्नो कोर्स र छात्रावास छान्नुहोस् — पूरा फार्म भर्नु अघि नै पूरा शुल्क थाहा पाउनुहोस्।
          </p>
        </div>
        <span className="ml-auto shrink-0 rounded-full border px-3 py-1 text-xs font-bold text-muted-foreground">
          Step 1 of 2
        </span>
      </div>

      {/* Step errors */}
      {errList.length > 0 && (
        <div className="mb-5 rounded-lg border border-brand-red/40 bg-red-50 px-4 py-3 text-sm flex gap-2">
          <AlertCircle size={16} className="text-brand-red mt-0.5 shrink-0" />
          <div>
            <p className="font-bold text-brand-red">
              {errList.length} field(s) need attention to continue:
            </p>
            <ul className="mt-1 list-disc pl-5 text-xs text-red-800/90 space-y-0.5">
              {errList.map(([k, v]) => (
                <li key={k}>{v}</li>
              ))}
            </ul>
          </div>
        </div>
      )}

      <div className="bg-white rounded-2xl border shadow-sm overflow-hidden divide-y">
        {/* Organization + Post */}
        <StepSection title="Class Applied For" hint="संस्था र पद छान्नुहोस्">
          <RadioRow
            name="fee-organization"
            options={ORGANIZATIONS.map((o) => ({ value: o, label: o === "APF" ? "APF" : o }))}
            value={data.organization}
            error={errors.organization}
            onChange={(v) =>
              onChange({
                organization: v as Organization,
                courseId: "",
                courseName: "",
                classAppliedFor: "",
                coursePackage: "",
                packageDuration: "",
                pricingSnapshot: null,
                totalPayment: null,
              })
            }
          />
          <div className="mt-3">
            <RadioRow
              name="fee-post"
              options={POSTS.map((p) => ({ value: p, label: p }))}
              value={data.appliedPost}
              error={errors.appliedPost}
              onChange={(v) =>
                onChange({
                  appliedPost: v as AppliedPost,
                  courseId: "",
                  courseName: "",
                  classAppliedFor: "",
                  coursePackage: "",
                  packageDuration: "",
                  pricingSnapshot: null,
                  totalPayment: null,
                })
              }
            />
          </div>
        </StepSection>

        {/* Course */}
        <StepSection title="Course / Class Applied For" hint="कोर्स छान्नुहोस् — मूल्यसहित">
          <div className="flex flex-wrap items-center gap-3">
            <select
              className={cn(
                "w-full sm:w-auto min-w-[280px] rounded-lg border px-3 py-2.5 text-sm font-semibold bg-white",
                errors.courseId ? "border-brand-red" : "border-gray-300",
              )}
              value={data.courseId}
              disabled={courseOptions.length === 0}
              aria-label="Course / Class applied for"
              onChange={(e) => selectCourse(e.target.value)}
            >
              <option value="">— Select Course / Class —</option>
              {courseOptions.map((c) => {
                const price = priceTag(c.packages);
                return (
                  <option key={c.id} value={c.id}>
                    {price ? `${c.name} — ${price}` : c.name}
                  </option>
                );
              })}
              <option value="others">Others (अन्य)</option>
            </select>
            {data.courseId === "others" && (
              <input
                className="rounded-lg border border-gray-300 px-3 py-2.5 text-sm w-full sm:w-64"
                value={data.courseName}
                placeholder="Type course / class name"
                maxLength={80}
                aria-label="Course name (if others)"
                onChange={(e) =>
                  onChange({ courseName: e.target.value, classAppliedFor: e.target.value })
                }
              />
            )}
          </div>
          {errors.courseId && <StepError msg={errors.courseId} />}
        </StepSection>

        {/* Package type */}
        <StepSection title="Package" hint="प्याकेजको प्रकार">
          <RadioRow
            name="fee-packageType"
            options={PACKAGE_TYPES.map((p) => ({ value: p, label: p }))}
            value={data.packageType}
            error={errors.packageType}
            onChange={(v) => onChange({ packageType: v as AdmissionFormData["packageType"] })}
          />
        </StepSection>

        {/* Course package */}
        <StepSection
          title="Course Package"
          hint="कोर्स प्याकेज छान्नुहोस्"
          disabledHint={
            data.courseId && packages.length === 0 && data.courseId !== "others"
              ? "This course has no active packages yet — contact the institute."
              : undefined
          }
        >
          {packages.length > 0 ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
              {packages.map((p) => (
                <label
                  key={p.name}
                  className={cn(
                    "flex items-start gap-3 rounded-xl border-2 px-3.5 py-3 cursor-pointer transition",
                    data.coursePackage === p.name
                      ? "border-brand-red bg-red-50/60"
                      : "border-gray-200 hover:border-gray-300 bg-white",
                  )}
                >
                  <input
                    type="radio"
                    name="fee-coursePackage"
                    className="mt-1 accent-red-600"
                    checked={data.coursePackage === p.name}
                    aria-label={`Course package: ${p.name}`}
                    onChange={() => selectPackage(p.name)}
                  />
                  <span className="min-w-0 flex-1">
                    <span className="block text-sm font-bold text-navy leading-snug">{p.name}</span>
                    <span className="block text-xs text-muted-foreground mt-0.5">
                      {p.duration} · Admission Rs. {money(p.admissionFee)} · Tuition Rs.{" "}
                      {money(p.tuitionFee)}
                    </span>
                  </span>
                  <span className="shrink-0 rounded-md bg-navy text-white text-xs font-extrabold px-2 py-1">
                    Rs. {money(p.totalFee)}
                  </span>
                </label>
              ))}
            </div>
          ) : (
            !data.courseId && (
              <p className="text-sm text-muted-foreground">
                पहिले कोर्स छान्नुहोस् — त्यसपछि प्याकेजहरू देखिनेछन्।
              </p>
            )
          )}
          {errors.coursePackage && <StepError msg={errors.coursePackage} />}
        </StepSection>

        {/* Hostel */}
        <StepSection title="Hostel" hint="छात्रावास चाहिन्छ?">
          <div className="flex flex-wrap items-center gap-4">
            <RadioRow
              name="fee-hostel"
              options={[
                { value: "Yes", label: "Yes — हजुर" },
                { value: "No", label: "No — होइन" },
              ]}
              value={data.hostel}
              error={errors.hostel}
              onChange={(v) => setHostel(v as "Yes" | "No")}
            />
            {data.hostel === "Yes" && (
              <span className="inline-flex items-center gap-1.5 rounded-lg border border-green-300 bg-green-50 px-3 py-1.5 text-sm font-bold text-green-700">
                <Home size={14} />
                Hostel fee: Rs. {money(hostelPkg?.totalFee ?? 0)}
                {hostelPkg ? ` / ${hostelPkg.name}` : ""}
              </span>
            )}
            {data.hostel === "Yes" && !hostelPkg && (
              <p className="w-full text-xs font-semibold text-amber-600">
                Hostel package is not configured yet — contact the institute for the hostel fee.
              </p>
            )}
          </div>
        </StepSection>
      </div>

      {/* Fee summary + continue */}
      <div className="mt-6 grid grid-cols-1 lg:grid-cols-2 gap-5 items-start">
        <FeeBreakdown
          pricing={data.pricingSnapshot}
          hostelFee={data.hostel === "Yes" ? data.hostelFee : 0}
          hostelName={hostelCourse?.name && data.hostel === "Yes" ? hostelCourse.name : ""}
        />
        <div className="bg-navy text-white rounded-2xl p-5">
          <p className="text-xs uppercase tracking-wider text-white/60 font-bold">
            Course + Hostel Total
          </p>
          <p className="text-3xl font-extrabold mt-1">
            Rs. {total ? money(total) : "—"}
            <span className="text-sm font-semibold text-white/60 ml-2">/-</span>
          </p>
          <div className="mt-3 space-y-1 text-xs text-white/70">
            <p>
              Course fee:{" "}
              <strong className="text-white">
                Rs. {money(data.pricingSnapshot?.totalFee ?? 0)}
              </strong>
            </p>
            <p>
              Hostel fee:{" "}
              <strong className="text-white">
                Rs. {data.hostel === "Yes" ? money(data.hostelFee) : "0"}
              </strong>
            </p>
            <p className="pt-2 border-t border-white/15">
              यदि छुट पाइयो भने त्यो छुट तपाईंकै प्रतिलिपिमा देखिनेछ (अफिसबाट भरिन्छ)।
            </p>
          </div>
          <button
            type="button"
            onClick={onContinue}
            className="mt-5 w-full inline-flex items-center justify-center gap-2 rounded-lg bg-brand-red px-4 py-3 text-sm font-extrabold hover:bg-brand-red/90 transition"
          >
            Continue to Application Form <ArrowRight size={16} />
          </button>
          <p className="mt-2 text-[11px] text-white/50 text-center">
            Step 2 मा व्यक्तिगत विवरण, फोटो, छाप र भुक्तानी भरिनेछ।
          </p>
        </div>
      </div>
    </div>
  );
}

function StepSection({
  title,
  hint,
  disabledHint,
  children,
}: {
  title: string;
  hint?: string;
  disabledHint?: string;
  children: React.ReactNode;
}) {
  return (
    <section className="px-5 py-5">
      <div className="flex items-baseline gap-2 mb-3">
        <h3 className="text-sm font-extrabold uppercase tracking-wider text-navy">{title}</h3>
        {hint && <span className="text-xs text-muted-foreground">{hint}</span>}
      </div>
      {children}
      {disabledHint && <p className="mt-2 text-xs font-semibold text-amber-600">{disabledHint}</p>}
    </section>
  );
}

function RadioRow({
  name,
  options,
  value,
  error,
  onChange,
}: {
  name: string;
  options: Array<{ value: string; label: string }>;
  value: string;
  error?: string;
  onChange: (v: string) => void;
}) {
  return (
    <div>
      <div className="flex flex-wrap gap-x-5 gap-y-2">
        {options.map((o) => (
          <label key={o.value} className="inline-flex items-center gap-2 cursor-pointer">
            <input
              type="radio"
              name={name}
              className="accent-red-600"
              checked={value === o.value}
              aria-label={`${name}: ${o.label}`}
              onChange={() => onChange(o.value)}
            />
            <span className="text-sm font-semibold text-gray-800">{o.label}</span>
          </label>
        ))}
      </div>
      {error && <StepError msg={error} />}
    </div>
  );
}

function StepError({ msg }: { msg: string }) {
  return <p className="mt-2 text-xs font-semibold text-brand-red">{msg}</p>;
}
