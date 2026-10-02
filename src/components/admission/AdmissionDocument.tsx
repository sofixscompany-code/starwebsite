import { useState } from "react";
import { cn } from "@/lib/utils";
import type {
  AdmissionCourse,
  AdmissionFormData,
  Organization,
  AppliedPost,
} from "@/lib/admission-form/types";
import {
  GENDERS,
  ORGANIZATIONS,
  POSTS,
  PACKAGE_TYPES,
  MUNICIPALITY_TYPES,
} from "@/lib/admission-form/types";
import { applicableCourses } from "@/lib/admission-form/defaults";
import {
  districtsFor,
  municipalitiesFor,
  wardsFor,
  municipalityInfo,
  PROVINCES,
} from "@/data/nepal-geo";
import {
  RULES_HEADING,
  RULE_SECTIONS,
  AGREEMENT_NOTE,
  AGREEMENT_EN,
} from "@/lib/admission-form/rules";
import {
  BlueCheck,
  SegBoxes,
  Bullet,
  DocumentHeader,
  PhotoBox,
  SignatureModal,
  SignatureLine,
} from "./shared";

type Errors = Record<string, string>;

interface Props {
  data: AdmissionFormData;
  courses: AdmissionCourse[];
  mode: "edit" | "readonly";
  errors?: Errors;
  onChange: (patch: Partial<AdmissionFormData>) => void;
}

const YEARS = Array.from({ length: 60 }, (_, i) => new Date().getFullYear() - 13 - i);
const MONTHS = Array.from({ length: 12 }, (_, i) => i + 1);

function daysInMonth(y: number, m: number) {
  if (!y || !m) return 31;
  return new Date(y, m, 0).getDate();
}

function money(n: number | null | undefined): string {
  return n == null ? "" : n.toLocaleString("en-IN");
}

function splitDate(value: string) {
  const [y = "", m = "", d = ""] = value.split("-");
  return { y, m, d };
}

export function AdmissionDocument({ data, courses, mode, errors = {}, onChange }: Props) {
  const edit = mode === "edit";
  const err = (k: string) => (edit ? errors[k] : undefined);

  const [sigModal, setSigModal] = useState<null | "studentSignature" | "parentSignature">(null);

  const active = courses.filter((c) => c.active !== false);
  const courseOptions = applicableCourses(active, data.organization, data.appliedPost);
  const selectedCourse = active.find((c) => c.id === data.courseId);
  const packages = (selectedCourse?.packages ?? []).filter((p) => p.active !== false);
  const fallbackPackages = [
    { name: "Course Complete 3 Month", duration: "3 Month" },
    { name: "Yearly", duration: "1 Year" },
  ];
  const packageOptions = packages.length
    ? packages
    : fallbackPackages.map((f) => ({ ...f, id: "", totalFee: null as number | null }));

  const districts = data.province ? districtsFor(data.province) : [];
  const municipalities =
    data.province && data.district ? municipalitiesFor(data.province, data.district) : [];
  const wards = wardsFor(data.province, data.district, data.municipality);
  const munInfo = municipalityInfo(data.province, data.district, data.municipality);

  const dob = splitDate(data.dateOfBirth);

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
      totalPayment: pkg.totalFee,
    });
  };

  // dateOfBirth always stores 3 segments (y-m-d, empties allowed) so a partial
  // selection (e.g. year only) survives re-render — it only becomes a complete
  // "YYYY-MM-DD" once all three parts are chosen (validation enforces that).
  const setDobPart = (part: "y" | "m" | "d", value: string) => {
    const y = part === "y" ? value : dob.y;
    const m = part === "m" ? value : dob.m;
    const dRaw = part === "d" ? value : dob.d;
    const max = daysInMonth(Number(y), Number(m));
    const d = dRaw && y && m && Number(dRaw) > max ? String(max) : dRaw;
    onChange({ dateOfBirth: y || m || d ? [y, m, d].join("-") : "" });
  };

  return (
    <>
      {/* ═══════════════ PAGE 1 ═══════════════ */}
      <section className="sci-page page-1" aria-label="Admission form page 1">
        <div className="sci-watermark" aria-hidden="true">
          <img src="/favicon-180x180.jpg" alt="" />
          <span>
            Star Coaching Institute Pvt. Ltd.
            <br />
            Janakpurdham
          </span>
        </div>

        <DocumentHeader
          photoBox={
            <PhotoBox
              src={data.studentPhoto}
              disabled={!edit}
              error={!!err("studentPhoto")}
              onChange={(studentPhoto) => onChange({ studentPhoto })}
            />
          }
        />

        <div className="sci-title">APPLICATION FOR ADMISSION FROM</div>

        {/* Name of student — segmented boxes */}
        <div className="sci-row">
          <Bullet />
          <div className="sci-label-col">
            <span className="sci-label">Name Of the Student</span>
            <span className="sci-sub">(Block Letters)</span>
          </div>
          <SegBoxes
            value={data.studentName}
            onChange={(studentName) => onChange({ studentName })}
            length={18}
            uppercase
            disabled={!edit}
            ariaLabel="Name of the student in block letters"
            error={!!err("studentName")}
          />
          {err("studentName") && <FieldError msg={err("studentName")!} />}
        </div>

        {/* Class Applied For — organizations */}
        <div className="sci-row">
          <Bullet />
          <span className="sci-label">Class Applied For:</span>
          <div className="sci-checks">
            {ORGANIZATIONS.map((o) => (
              <BlueCheck
                key={o}
                type="radio"
                name="organization"
                checked={data.organization === o}
                disabled={!edit}
                error={!!err("organization") && !data.organization}
                ariaLabel={`Organization: ${o}`}
                label={o === "APF" ? "APF" : o === "Nepal Police" ? "Nepal police" : o}
                onChange={() =>
                  onChange({
                    organization: o as Organization,
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
            ))}
          </div>
        </div>

        {/* Class Applied For — posts */}
        <div className="sci-row sci-row-indent">
          <div className="sci-checks">
            {POSTS.map((p) => (
              <BlueCheck
                key={p}
                type="radio"
                name="appliedPost"
                checked={data.appliedPost === p}
                disabled={!edit}
                error={!!err("appliedPost") && !data.appliedPost}
                ariaLabel={`Post: ${p}`}
                label={p}
                onChange={() =>
                  onChange({
                    appliedPost: p as AppliedPost,
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
            ))}
          </div>
        </div>

        {/* Course / Class Applied For — dynamic dropdown */}
        <div className="sci-row">
          <Bullet />
          <span className="sci-label">Course / Class Applied For:</span>
          <select
            className={cn("sci-inline-select", err("courseId") && "sci-select-error")}
            value={data.courseId}
            disabled={!edit || courseOptions.length === 0}
            aria-label="Course / Class applied for"
            onChange={(e) => selectCourse(e.target.value)}
          >
            <option value="">
              {courseOptions.length
                ? "— Select Course / Class —"
                : "Select organization & post first"}
            </option>
            {courseOptions.map((c) => (
              <option key={c.id} value={c.id}>
                {c.name}
              </option>
            ))}
          </select>
          {err("courseId") && <FieldError msg={err("courseId")!} />}
        </div>

        {/* Mobile number — segmented boxes */}
        <div className="sci-row">
          <Bullet />
          <span className="sci-label">Mobile Number:</span>
          <SegBoxes
            value={data.mobileNumber}
            onChange={(mobileNumber) => onChange({ mobileNumber })}
            length={10}
            numeric
            disabled={!edit}
            ariaLabel="Mobile number"
            error={!!err("mobileNumber")}
          />
          {err("mobileNumber") && <FieldError msg={err("mobileNumber")!} />}
        </div>

        {/* Gender + Date of birth */}
        <div className="sci-row">
          <Bullet />
          <span className="sci-label">Gender:</span>
          <div className="sci-checks">
            {GENDERS.map((g) => (
              <BlueCheck
                key={g}
                type="radio"
                name="gender"
                checked={data.gender === g}
                disabled={!edit}
                error={!!err("gender") && !data.gender}
                ariaLabel={`Gender: ${g}`}
                label={g}
                onChange={() => onChange({ gender: g })}
              />
            ))}
          </div>
          <span className="sci-label sci-label-gap">Date Of Birth</span>
          <div className="sci-dob">
            <div className="sci-dob-part">
              <select
                value={dob.y}
                disabled={!edit}
                aria-label="Birth year"
                onChange={(e) => setDobPart("y", e.target.value)}
              >
                <option value="">YYYY</option>
                {YEARS.map((y) => (
                  <option key={y} value={y}>
                    {y}
                  </option>
                ))}
              </select>
              <span className="sci-dob-hint">Y Y Y Y</span>
            </div>
            <div className="sci-dob-part">
              <select
                value={dob.m}
                disabled={!edit}
                aria-label="Birth month"
                onChange={(e) => setDobPart("m", e.target.value)}
              >
                <option value="">MM</option>
                {MONTHS.map((m) => (
                  <option key={m} value={m}>
                    {String(m).padStart(2, "0")}
                  </option>
                ))}
              </select>
              <span className="sci-dob-hint">M M</span>
            </div>
            <div className="sci-dob-part">
              <select
                value={dob.d}
                disabled={!edit}
                aria-label="Birth day"
                onChange={(e) => setDobPart("d", e.target.value)}
              >
                <option value="">DD</option>
                {Array.from(
                  { length: daysInMonth(Number(dob.y), Number(dob.m)) },
                  (_, i) => i + 1,
                ).map((d) => (
                  <option key={d} value={d}>
                    {String(d).padStart(2, "0")}
                  </option>
                ))}
              </select>
              <span className="sci-dob-hint">D D</span>
            </div>
          </div>
          {err("dateOfBirth") && <FieldError msg={err("dateOfBirth")!} />}
          {err("gender") && <FieldError msg={err("gender")!} />}
        </div>

        {/* Father */}
        <div className="sci-row">
          <Bullet />
          <span className="sci-label">Father's Name:</span>
          <input
            className={cn("sci-line-input", err("fatherName") && "sci-input-error")}
            value={data.fatherName}
            disabled={!edit}
            aria-label="Father's name"
            onChange={(e) => onChange({ fatherName: e.target.value })}
          />
          {err("fatherName") && <FieldError msg={err("fatherName")!} />}
        </div>
        <div className="sci-row-pair">
          <span className="sci-label">Occupation:</span>
          <input
            className="sci-line-input"
            value={data.fatherOccupation}
            disabled={!edit}
            aria-label="Father's occupation"
            onChange={(e) => onChange({ fatherOccupation: e.target.value })}
          />
          <span className="sci-label">Mobile Number:</span>
          <input
            className={cn("sci-line-input", err("fatherMobile") && "sci-input-error")}
            value={data.fatherMobile}
            disabled={!edit}
            inputMode="numeric"
            maxLength={10}
            aria-label="Father's mobile number"
            onChange={(e) =>
              onChange({ fatherMobile: e.target.value.replace(/\D/g, "").slice(0, 10) })
            }
          />
          {err("fatherMobile") && <FieldError msg={err("fatherMobile")!} />}
        </div>

        {/* Mother */}
        <div className="sci-row">
          <Bullet />
          <span className="sci-label">Mother's Name:</span>
          <input
            className={cn("sci-line-input", err("motherName") && "sci-input-error")}
            value={data.motherName}
            disabled={!edit}
            aria-label="Mother's name"
            onChange={(e) => onChange({ motherName: e.target.value })}
          />
          {err("motherName") && <FieldError msg={err("motherName")!} />}
        </div>
        <div className="sci-row-pair">
          <span className="sci-label">Occupation:</span>
          <input
            className="sci-line-input"
            value={data.motherOccupation}
            disabled={!edit}
            aria-label="Mother's occupation"
            onChange={(e) => onChange({ motherOccupation: e.target.value })}
          />
          <span className="sci-label">Mobile Number:</span>
          <input
            className={cn("sci-line-input", err("motherMobile") && "sci-input-error")}
            value={data.motherMobile}
            disabled={!edit}
            inputMode="numeric"
            maxLength={10}
            aria-label="Mother's mobile number"
            onChange={(e) =>
              onChange({ motherMobile: e.target.value.replace(/\D/g, "").slice(0, 10) })
            }
          />
          {err("motherMobile") && <FieldError msg={err("motherMobile")!} />}
        </div>

        {/* Address — municipality type checkboxes (auto) */}
        <div className="sci-row">
          <Bullet />
          <span className="sci-label">Address:</span>
          <div className="sci-checks">
            {MUNICIPALITY_TYPES.map((t) => (
              <BlueCheck
                key={t}
                checked={data.municipalityType === t}
                disabled
                label={t}
                ariaLabel={`${t} (set automatically from municipality)`}
              />
            ))}
          </div>
        </div>

        {/* Address — dependent dropdowns on the dotted line */}
        <div className="sci-addr-line">
          <div className="sci-addr-selects">
            <select
              value={data.province}
              disabled={!edit}
              aria-label="Province"
              className={cn("sci-inline-select", err("province") && "sci-select-error")}
              onChange={(e) =>
                onChange({
                  province: e.target.value,
                  district: "",
                  municipality: "",
                  municipalityType: "",
                  ward: "",
                })
              }
            >
              <option value="">Province…</option>
              {PROVINCES.map((p) => (
                <option key={p} value={p}>
                  {p}
                </option>
              ))}
            </select>
            <select
              value={data.district}
              disabled={!edit || !data.province}
              aria-label="District"
              className={cn("sci-inline-select", err("district") && "sci-select-error")}
              onChange={(e) =>
                onChange({
                  district: e.target.value,
                  municipality: "",
                  municipalityType: "",
                  ward: "",
                })
              }
            >
              <option value="">District…</option>
              {districts.map((d) => (
                <option key={d.name} value={d.name}>
                  {d.name}
                </option>
              ))}
            </select>
            <select
              value={data.municipality}
              disabled={!edit || !data.district}
              aria-label="Municipality"
              className={cn("sci-inline-select", err("municipality") && "sci-select-error")}
              onChange={(e) => {
                const info = municipalityInfo(data.province, data.district, e.target.value);
                onChange({
                  municipality: e.target.value,
                  municipalityType: info?.type ?? "",
                  ward: "",
                });
              }}
            >
              <option value="">Municipality…</option>
              {municipalities.map((m) => (
                <option key={m.name} value={m.name}>
                  {m.name}
                </option>
              ))}
            </select>
          </div>
          <span className="sci-label">Ward No.</span>
          <select
            value={data.ward}
            disabled={!edit || !data.municipality}
            aria-label="Ward number"
            className={cn("sci-inline-select sci-ward-select", err("ward") && "sci-select-error")}
            onChange={(e) => onChange({ ward: e.target.value })}
          >
            <option value="">—</option>
            {wards.map((w) => (
              <option key={w} value={w}>
                {w}
              </option>
            ))}
          </select>
          <span className="sci-label">Tol:</span>
          <input
            className={cn("sci-line-input sci-tol-input", err("tol") && "sci-input-error")}
            value={data.tol}
            disabled={!edit}
            aria-label="Tol / locality"
            onChange={(e) => onChange({ tol: e.target.value })}
          />
          {munInfo && <span className="sci-type-hint no-print">{munInfo.type}</span>}
          {(err("province") ||
            err("district") ||
            err("municipality") ||
            err("ward") ||
            err("tol")) && (
            <FieldError
              msg={
                err("province") ||
                err("district") ||
                err("municipality") ||
                err("ward") ||
                err("tol")!
              }
            />
          )}
        </div>

        {/* For Office Use Only */}
        <div className="sci-office-box">For Office Use Only</div>

        {/* Hostel + Package */}
        <div className="sci-row">
          <Bullet />
          <span className="sci-label">Hostel:</span>
          <div className="sci-checks">
            {(["Yes", "No"] as const).map((h) => (
              <BlueCheck
                key={h}
                type="radio"
                name="hostel"
                checked={data.hostel === h}
                disabled={!edit}
                error={!!err("hostel") && !data.hostel}
                ariaLabel={`Hostel: ${h}`}
                label={h}
                onChange={() => onChange({ hostel: h })}
              />
            ))}
          </div>
          <span className="sci-label sci-label-gap">Package :</span>
          <div className="sci-checks">
            {PACKAGE_TYPES.map((p) => (
              <BlueCheck
                key={p}
                type="radio"
                name="packageType"
                checked={data.packageType === p}
                disabled={!edit}
                error={!!err("packageType") && !data.packageType}
                ariaLabel={`Package: ${p}`}
                label={p}
                onChange={() => onChange({ packageType: p })}
              />
            ))}
          </div>
          <span className="sci-label">Rs. =</span>
          <span className="sci-amount-box" />
          {err("hostel") && <FieldError msg={err("hostel")!} />}
          {err("packageType") && <FieldError msg={err("packageType")!} />}
        </div>

        {/* Course Package (dynamic) */}
        <div className="sci-row">
          <Bullet />
          <span className="sci-label">Course Package:</span>
          <div className="sci-checks">
            {packageOptions.map((p) => (
              <BlueCheck
                key={p.name}
                type="radio"
                name="coursePackage"
                checked={data.coursePackage === p.name}
                disabled={!edit}
                error={!!err("coursePackage") && !data.coursePackage}
                ariaLabel={`Course package: ${p.name}`}
                label={p.name}
                onChange={() => selectPackage(p.name)}
              />
            ))}
          </div>
          <span className="sci-label">Rs. =</span>
          <span className="sci-amount-box">{money(data.pricingSnapshot?.totalFee)}</span>
          {err("coursePackage") && <FieldError msg={err("coursePackage")!} />}
        </div>

        {/* Admission date + total payment */}
        <div className="sci-row">
          <Bullet />
          <span className="sci-label">Admission Date</span>
          <input
            type="date"
            className={cn(
              "sci-line-input sci-date-input",
              err("admissionDate") && "sci-input-error",
            )}
            value={data.admissionDate}
            disabled={!edit}
            aria-label="Admission date"
            onChange={(e) => onChange({ admissionDate: e.target.value })}
          />
          <span className="sci-label sci-label-gap">Total Payment: Rs</span>
          <span className={cn("sci-amount-box", err("totalPayment") && "sci-input-error")}>
            {money(data.totalPayment)}
          </span>
          {err("admissionDate") && <FieldError msg={err("admissionDate")!} />}
          {err("totalPayment") && <FieldError msg={err("totalPayment")!} />}
        </div>

        {/* Admission No + Bill No — office only */}
        <div className="sci-row">
          <Bullet />
          <span className="sci-label">Admission No.</span>
          <span className="sci-line-fill">{data.admissionNumber}</span>
          <span className="sci-label sci-label-gap">Bill No.</span>
          <span className="sci-line-fill">{data.billNumber}</span>
        </div>
      </section>

      {/* ═══════════════ PAGE 2 ═══════════════ */}
      <section className="sci-page page-2" aria-label="Rules and agreement page 2">
        <div className="sci-watermark" aria-hidden="true">
          <img src="/favicon-180x180.jpg" alt="" />
          <span>
            Star Coaching Institute Pvt. Ltd.
            <br />
            Janakpurdham
          </span>
        </div>

        <DocumentHeader />

        <h2 className="sci-rules-heading">
          <Bullet /> {RULES_HEADING}
        </h2>

        <div className="sci-rules">
          {RULE_SECTIONS.map((s) => (
            <div key={s.no} className="sci-rule">
              <div className="sci-rule-title">
                {s.no}. {s.title}
              </div>
              <ul>
                {s.bullets.map((b, i) => (
                  <li key={i}>{b}</li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        {/* Agreement line + thumb impressions */}
        <div className="sci-agree-line">
          <span>म</span>
          <span className="sci-agree-fill">{data.studentName ? data.studentName : ""}</span>
          <span>माथि उल्लेख गरेको सबै नियमहरुको पालना गर्नेछ ।</span>
          <span className="sci-thumbs">
            <span>दा .छाप</span>
            <span>बा .छाप</span>
          </span>
        </div>

        {/* Note box with the REQUIRED blue-tick agreement */}
        <div className={cn("sci-note-box", err("agreementAccepted") && "sci-note-error")}>
          <BlueCheck
            checked={data.agreementAccepted}
            disabled={!edit}
            error={!!err("agreementAccepted")}
            ariaLabel={AGREEMENT_EN}
            onChange={(v) => onChange({ agreementAccepted: v })}
          />
          <div className="sci-note-text">
            <p>
              <strong>नोट:</strong> {AGREEMENT_NOTE}
            </p>
            <p className="sci-agree-en">{AGREEMENT_EN}</p>
          </div>
        </div>
        {err("agreementAccepted") && <FieldError msg={err("agreementAccepted")!} />}

        {/* Four signatures */}
        <div className="sci-signatures">
          <SignatureLine
            label="Student's Signature"
            value={data.studentSignature}
            editable={edit}
            actionLabel="Sign"
            error={!!err("studentSignature")}
            onAction={() => setSigModal("studentSignature")}
            onClear={() => onChange({ studentSignature: "" })}
          />
          <SignatureLine
            label="Parent's Signature"
            value={data.parentSignature}
            editable={edit}
            actionLabel="Sign"
            error={!!err("parentSignature")}
            onAction={() => setSigModal("parentSignature")}
            onClear={() => onChange({ parentSignature: "" })}
          />
          <SignatureLine
            label="Academic Signature"
            value={
              (data as AdmissionFormData & { academicSignature?: string }).academicSignature ?? ""
            }
            editable={false}
            actionLabel="Sign"
          />
          <SignatureLine
            label="Principal's Signature"
            value={
              (data as AdmissionFormData & { principalSignature?: string }).principalSignature ?? ""
            }
            editable={false}
            actionLabel="Sign"
          />
        </div>
      </section>

      <SignatureModal
        open={sigModal !== null}
        title={sigModal === "studentSignature" ? "Student's Signature" : "Parent's Signature"}
        initial={sigModal ? (data[sigModal] as string) : undefined}
        onClose={() => setSigModal(null)}
        onSave={(dataUrl) => {
          if (sigModal) onChange({ [sigModal]: dataUrl } as Partial<AdmissionFormData>);
          setSigModal(null);
        }}
      />
    </>
  );
}

function FieldError({ msg }: { msg: string }) {
  return <span className="sci-error-msg no-print">{msg}</span>;
}
