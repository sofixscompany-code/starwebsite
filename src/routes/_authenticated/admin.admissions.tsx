import { useMemo, useState, type ReactNode } from "react";
import { createPortal } from "react-dom";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { collection, deleteDoc, doc, getDocs, orderBy, query, updateDoc } from "firebase/firestore";
import { db } from "@/integrations/firebase/config";
import { toast } from "sonner";
import {
  AlertCircle,
  CheckCircle2,
  ClipboardList,
  Clock,
  ExternalLink,
  Eye,
  FileText,
  Loader2,
  MessageCircle,
  Pencil,
  PenLine,
  Printer,
  RefreshCw,
  Save,
  Search,
  Trash2,
  X,
  XCircle,
} from "lucide-react";
import { PageHeader } from "@/components/admin/AdminShell";
import {
  Badge,
  DataTable,
  EmptyState,
  Modal,
  Panel,
  SkeletonTable,
  StatCard,
  Toolbar,
} from "@/components/admin/ui";
import { AdmissionDocument } from "@/components/admission/AdmissionDocument";
import { OFFICE_SIGNATURES } from "@/components/admission/shared";
import { FeeBreakdown } from "@/components/admission/FeeBreakdown";
import "@/components/admission/admission-print.css";
import { useAdmissionCourses } from "@/hooks/use-admission-courses";
import { whatsappDigits } from "@/lib/links";
import {
  ADMISSION_STATUSES,
  EMPTY_ADMISSION,
  ORGANIZATIONS,
  PACKAGE_TYPES,
  PAYMENT_METHODS,
  POSTS,
  type AdmissionCourse,
  type AdmissionFormData,
  type AdmissionStatus,
  type AppliedPost,
  type Organization,
  type PackageType,
  type PricingSnapshot,
} from "@/lib/admission-form/types";

/** Human label for a stored payment method ("" when unset/unknown). */
const paymentLabel = (v: string) =>
  PAYMENT_METHODS.find((m) => m.value === v)?.label ?? (v ? v : "");
/** Short payment state for tables/summary: Paid / Cash at office / Pending. */
const paymentState = (method: string, status: string) =>
  status === "paid" ? "Paid" : !method ? "" : method === "cod" ? "Cash at office" : "Pending";

/* ══════════════════════════════════════════════════════════════
   Normalization — the `admissions` collection holds BOTH the new
   3-page digital form records (AdmissionRecord) and legacy wizard
   documents (fullName/phone/address/…). mapToDocShape() folds them
   into a single view model for the table, filters and detail view.
   ══════════════════════════════════════════════════════════════ */

type RawAdmission = Record<string, unknown> & { id: string };

interface AdmissionRow {
  id: string;
  name: string;
  mobile: string;
  applicationId: string;
  admissionNumber: string;
  billNumber: string;
  organization: string;
  appliedPost: string;
  courseName: string;
  coursePackage: string;
  packageDuration: string;
  totalPayment: number | null;
  province: string;
  district: string;
  municipality: string;
  ward: string;
  addressLine: string;
  status: string;
  officeRemarks: string;
  paymentMethod: string;
  paymentReference: string;
  paymentStatus: string;
  createdLabel: string;
  isLegacy: boolean;
  /** Presentation-ready AdmissionFormData (EMPTY_ADMISSION defaults fill gaps). */
  formData: AdmissionFormData & { academicSignature?: string; principalSignature?: string };
}

function str(value: unknown): string {
  return typeof value === "string" ? value.trim() : "";
}

/** Handles epoch-ms numbers, ISO strings, Firestore Timestamps ({toDate()}) and Date. */
function toEpoch(value: unknown): number | null {
  if (typeof value === "number" && Number.isFinite(value)) return value;
  if (value instanceof Date) return value.getTime();
  if (typeof value === "string") {
    const ms = Date.parse(value);
    return Number.isNaN(ms) ? null : ms;
  }
  if (value && typeof value === "object") {
    const toDate = (value as { toDate?: () => Date }).toDate;
    if (typeof toDate === "function") {
      const d = toDate.call(value);
      const ms = d instanceof Date ? d.getTime() : NaN;
      return Number.isNaN(ms) ? null : ms;
    }
  }
  return null;
}

function cap(value: string): string {
  return value ? value.charAt(0).toUpperCase() + value.slice(1) : value;
}

function normalizeDocStatus(status: string): AdmissionStatus {
  if ((ADMISSION_STATUSES as string[]).includes(status)) return status as AdmissionStatus;
  const legacy: Record<string, AdmissionStatus> = {
    pending: "Submitted",
    Pending: "Submitted",
    approved: "Approved",
    Approved: "Approved",
    rejected: "Rejected",
    Rejected: "Rejected",
  };
  return legacy[status] ?? "Draft";
}

function normalizeGender(gender: string): "" | "Male" | "Female" {
  const v = gender.toLowerCase();
  if (v === "male") return "Male";
  if (v === "female") return "Female";
  return "";
}

function pick<T extends string>(value: string, allowed: readonly string[]): T | "" {
  return (allowed as readonly string[]).includes(value) ? (value as T) : "";
}

/** Fold a raw Firestore doc (new OR legacy shape) into the shared view model. */
function mapToDocShape(raw: RawAdmission): AdmissionRow {
  const name = str(raw.studentName) || str(raw.fullName);
  const mobile = str(raw.mobileNumber) || str(raw.phone);
  const applicationId = str(raw.applicationId) || str(raw.admissionNumber) || raw.id;
  const admissionNumber = str(raw.admissionNumber);
  const billNumber = str(raw.billNumber);
  const status = str(raw.status) || "Draft";

  const province = str(raw.province);
  const district = str(raw.district);
  const municipality = str(raw.municipality);
  const ward = str(raw.ward);
  const hostel = str(raw.hostel);
  const addressLine =
    province || municipality
      ? [province, municipality].filter(Boolean).join(" → ")
      : str(raw.address) || "—";

  const totalPayment = typeof raw.totalPayment === "number" ? raw.totalPayment : null;
  const createdAt = toEpoch(raw.createdAt);

  const snap = raw.pricingSnapshot;
  const pricingSnapshot: PricingSnapshot | null =
    snap && typeof snap === "object" && typeof (snap as PricingSnapshot).totalFee === "number"
      ? (snap as PricingSnapshot)
      : null;

  const formData: AdmissionRow["formData"] = {
    ...EMPTY_ADMISSION,
    studentName: name,
    organization: pick<Organization>(str(raw.organization), ORGANIZATIONS),
    appliedPost: pick<AppliedPost>(str(raw.appliedPost), POSTS),
    classAppliedFor: str(raw.classAppliedFor) || str(raw.courseName) || str(raw.courseTitle),
    courseId: str(raw.courseId),
    courseName: str(raw.courseName) || str(raw.courseTitle) || str(raw.classAppliedFor),
    packageType: pick<PackageType>(str(raw.packageType), PACKAGE_TYPES),
    coursePackage: str(raw.coursePackage),
    packageDuration: str(raw.packageDuration),
    pricingSnapshot,
    mobileNumber: mobile,
    gender: normalizeGender(str(raw.gender)),
    dateOfBirth: str(raw.dateOfBirth),
    fatherName: str(raw.fatherName) || str(raw.parentName),
    fatherOccupation: str(raw.fatherOccupation),
    fatherMobile: str(raw.fatherMobile) || str(raw.parentPhone),
    motherName: str(raw.motherName),
    motherOccupation: str(raw.motherOccupation),
    motherMobile: str(raw.motherMobile),
    guardianName: str(raw.guardianName),
    guardianRelation: str(raw.guardianRelation),
    guardianMobile: str(raw.guardianMobile),
    schoolName: str(raw.schoolName),
    lastExamPassed: str(raw.lastExamPassed),
    educationBoard: str(raw.educationBoard),
    gpa: str(raw.gpa),
    bloodGroup: str(raw.bloodGroup),
    physicalDisability:
      raw.physicalDisability === "Yes" || raw.physicalDisability === "No"
        ? raw.physicalDisability
        : "",
    disabilityDetail: str(raw.disabilityDetail),
    heightWeight: str(raw.heightWeight),
    nationality: str(raw.nationality) || "नेपाली",
    email: str(raw.email),
    province,
    district,
    municipality,
    municipalityType: str(raw.municipalityType),
    ward,
    tol: str(raw.tol) || str(raw.address),
    hostel: hostel === "Yes" || hostel === "No" ? hostel : "",
    admissionDate: str(raw.admissionDate),
    totalPayment,
    paymentMethod: (PAYMENT_METHODS.some((m) => m.value === str(raw.paymentMethod))
      ? str(raw.paymentMethod)
      : "") as AdmissionFormData["paymentMethod"],
    paymentReference: str(raw.paymentReference),
    admissionNumber,
    billNumber,
    studentPhoto: str(raw.studentPhoto),
    studentSignature: str(raw.studentSignature),
    parentSignature: str(raw.parentSignature),
    agreementAccepted: raw.agreementAccepted === true,
    status: normalizeDocStatus(status),
    createdAt: createdAt ?? 0,
    academicSignature: str(raw.academicSignature) || OFFICE_SIGNATURES.academic,
    principalSignature: str(raw.principalSignature) || OFFICE_SIGNATURES.principal,
  };

  return {
    id: raw.id,
    name,
    mobile,
    applicationId,
    admissionNumber,
    billNumber,
    organization: str(raw.organization),
    appliedPost: str(raw.appliedPost),
    courseName: formData.courseName,
    coursePackage: str(raw.coursePackage),
    packageDuration: str(raw.packageDuration),
    totalPayment,
    province,
    district,
    municipality,
    ward,
    addressLine,
    status,
    officeRemarks: str(raw.officeRemarks),
    paymentMethod: str(raw.paymentMethod),
    paymentReference: str(raw.paymentReference),
    paymentStatus: str(raw.paymentStatus),
    createdLabel: createdAt ? new Date(createdAt).toLocaleDateString("en-GB") : "—",
    isLegacy: !str(raw.applicationId),
    formData,
  };
}

/* ════════════════════════════ PRINT ════════════════════════════
   Print contract (src/components/admission/admission-print.css):
   <body class="sci-printing"> hides everything except content inside
   .sci-print-isolated (the real 3-page document). The detail view
   containing `.sci-print-root .sci-print-isolated` must be mounted
   before calling this.
   ═══════════════════════════════════════════════════════════════ */

let printCleanupBound = false;

function runIsolatedPrint() {
  if (!printCleanupBound) {
    printCleanupBound = true;
    window.addEventListener("afterprint", () => {
      document.body.classList.remove("sci-printing");
    });
  }
  document.body.classList.add("sci-printing");
  window.print();
  // Fallback: never leave the body stuck in printing mode.
  window.setTimeout(() => document.body.classList.remove("sci-printing"), 2000);
}

/* ══════════════════════════ CONSTANTS ══════════════════════════ */

const ALL = "__all__";

const PENDING_STATUSES = new Set(["Submitted", "Draft", "pending"]);
const APPROVED_STATUSES = new Set(["Approved", "approved"]);
const REJECTED_STATUSES = new Set(["Rejected", "rejected"]);

const PAYMENT_OPTIONS = [
  { value: "any", label: "Any payment" },
  { value: "gte", label: "Paid ≥ 20,000" },
  { value: "lt", label: "Paid < 20,000" },
  { value: "none", label: "Not set" },
];

type StatusTone = "success" | "danger" | "warning" | "info" | "muted";

function statusTone(status: string): StatusTone {
  switch (status.toLowerCase()) {
    case "approved":
      return "success";
    case "rejected":
      return "danger";
    case "verified":
      return "info";
    case "draft":
      return "muted";
    default:
      return "warning"; // Submitted / pending
  }
}

/* ══════════════════════════ HELPERS ════════════════════════════ */

function FilterSelect({
  allLabel,
  value,
  onChange,
  options,
  display = (v: string) => v,
}: {
  allLabel: string;
  value: string;
  onChange: (v: string) => void;
  options: string[];
  display?: (v: string) => string;
}) {
  return (
    <select
      aria-label={allLabel}
      value={value}
      onChange={(e) => onChange(e.target.value)}
      className="ap-input max-w-[170px] text-xs"
    >
      <option value={ALL}>{allLabel}</option>
      {options.map((o) => (
        <option key={o} value={o}>
          {display(o)}
        </option>
      ))}
    </select>
  );
}

function IconBtn({
  title,
  onClick,
  tone = "default",
  children,
}: {
  title: string;
  onClick: () => void;
  tone?: "default" | "green" | "red";
  children: ReactNode;
}) {
  const tones = {
    default: "text-gray-500 hover:bg-gray-100 dark:text-gray-400 dark:hover:bg-gray-700",
    green: "text-green-600 hover:bg-green-50 dark:hover:bg-green-900/20",
    red: "text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20",
  };
  return (
    <button
      type="button"
      title={title}
      aria-label={title}
      onClick={onClick}
      className={`rounded-lg p-1.5 transition-colors ${tones[tone]}`}
    >
      {children}
    </button>
  );
}

function Field({ label, children }: { label: string; children: ReactNode }) {
  return (
    <label className="block">
      <span className="mb-1 block text-xs font-bold uppercase tracking-wider text-gray-500 dark:text-gray-400">
        {label}
      </span>
      {children}
    </label>
  );
}

interface OfficeForm {
  admissionNumber: string;
  billNumber: string;
  totalPayment: string;
  status: string;
  officeRemarks: string;
  /** "", "pending", or "paid" — admin-only (clients cannot forge payment). */
  paymentStatus: string;
}

const EMPTY_OFFICE_FORM: OfficeForm = {
  admissionNumber: "",
  billNumber: "",
  totalPayment: "",
  status: "Draft",
  officeRemarks: "",
  paymentStatus: "",
};

/* ══════════════════════ DETAIL (3-page document) ═══════════════ */

function AdmissionDetailOverlay({
  row,
  courses,
  onClose,
  onPrint,
  onEditOffice,
  onWhatsApp,
}: {
  row: AdmissionRow;
  courses: AdmissionCourse[];
  onClose: () => void;
  onPrint: () => void;
  onEditOffice: () => void;
  onWhatsApp: () => void;
}) {
  const qc = useQueryClient();
  /* Office sign mode — lets the office draw/override any of the 4 signatures
     on the readonly document, then persist them to Firestore. */
  const [signMode, setSignMode] = useState(false);
  const [signData, setSignData] = useState<AdmissionRow["formData"]>(row.formData);
  const [savingSign, setSavingSign] = useState(false);

  const saveSignatures = async () => {
    const keys = [
      "studentSignature",
      "parentSignature",
      "academicSignature",
      "principalSignature",
    ] as const;
    const patch: Record<string, string> = {};
    for (const k of keys) {
      if ((signData[k] ?? "") !== (row.formData[k] ?? "")) patch[k] = signData[k] ?? "";
    }
    if (!Object.keys(patch).length) {
      toast.info("No signature changes");
      return;
    }
    setSavingSign(true);
    try {
      await updateDoc(doc(db, "admissions", row.id), { ...patch, updatedAt: Date.now() });
      toast.success("Signatures saved");
      setSignMode(false);
      qc.invalidateQueries({ queryKey: ["admin-admissions"] });
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Save failed");
    } finally {
      setSavingSign(false);
    }
  };

  return createPortal(
    <div
      role="dialog"
      aria-modal="true"
      aria-label={`Admission application ${row.applicationId}`}
      onClick={onClose}
      className="adm-print-scope fixed inset-0 z-50 overflow-y-auto bg-black/55 p-3 backdrop-blur-[2px] sm:p-6"
    >
      <div
        onClick={(e) => e.stopPropagation()}
        className="mx-auto w-full max-w-5xl rounded-2xl border border-gray-200 bg-white shadow-2xl dark:border-gray-700 dark:bg-gray-800"
      >
        {/* Toolbar (screen only) */}
        <div className="no-print flex flex-wrap items-center gap-2 border-b border-gray-200 px-4 py-3 dark:border-gray-700">
          <div className="mr-auto min-w-0">
            <div className="flex flex-wrap items-center gap-2">
              <h2 className="truncate text-base font-bold text-gray-900 dark:text-white">
                {row.name || "Unnamed applicant"}
              </h2>
              <Badge tone={statusTone(row.status)}>{cap(row.status)}</Badge>
              {row.isLegacy && <Badge tone="muted">Legacy record</Badge>}
            </div>
            <p className="font-mono text-xs text-gray-500 dark:text-gray-400">
              {row.applicationId}
            </p>
          </div>
          <button
            type="button"
            onClick={onPrint}
            className="inline-flex items-center gap-1.5 rounded-lg border border-gray-300 px-3 py-2 text-xs font-bold text-gray-700 hover:bg-gray-50 dark:border-gray-600 dark:text-gray-200 dark:hover:bg-gray-700"
          >
            <Printer className="h-4 w-4" /> Print / PDF
          </button>
          <button
            type="button"
            onClick={onEditOffice}
            className="inline-flex items-center gap-1.5 rounded-lg border border-gray-300 px-3 py-2 text-xs font-bold text-gray-700 hover:bg-gray-50 dark:border-gray-600 dark:text-gray-200 dark:hover:bg-gray-700"
          >
            <Pencil className="h-4 w-4" /> Office Fields
          </button>
          <button
            type="button"
            onClick={() => setSignMode((v) => !v)}
            className={
              "inline-flex items-center gap-1.5 rounded-lg border px-3 py-2 text-xs font-bold " +
              (signMode
                ? "border-blue-500 bg-blue-50 text-blue-700 dark:bg-blue-500/10 dark:text-blue-300"
                : "border-gray-300 text-gray-700 hover:bg-gray-50 dark:border-gray-600 dark:text-gray-200 dark:hover:bg-gray-700")
            }
          >
            <PenLine className="h-4 w-4" /> {signMode ? "Signing…" : "Signatures"}
          </button>
          {signMode && (
            <button
              type="button"
              onClick={saveSignatures}
              disabled={savingSign}
              className="inline-flex items-center gap-1.5 rounded-lg bg-navy px-3 py-2 text-xs font-bold text-white hover:opacity-90 disabled:opacity-60"
            >
              {savingSign ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <Save className="h-4 w-4" />
              )}
              Save signatures
            </button>
          )}
          <button
            type="button"
            onClick={onWhatsApp}
            className="inline-flex items-center gap-1.5 rounded-lg border border-green-500/50 px-3 py-2 text-xs font-bold text-green-600 hover:bg-green-50 dark:hover:bg-green-900/20"
          >
            <MessageCircle className="h-4 w-4" /> WhatsApp
          </button>
          <button
            type="button"
            aria-label="Close"
            onClick={onClose}
            className="rounded-lg p-2 text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-700"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        {/* Signing-mode hint (screen only) */}
        {signMode && (
          <div className="no-print border-b border-blue-200 bg-blue-50 px-4 py-2 text-xs font-medium text-blue-700 dark:border-blue-800 dark:bg-blue-500/10 dark:text-blue-300">
            Signing mode — click <b>Sign</b> / <b>Redraw</b> on any signature line below, draw, then
            press <b>Save signatures</b>.
          </div>
        )}

        {/* Summary + fee breakdown (screen only) */}
        <div className="no-print grid gap-4 border-b border-gray-200 p-4 dark:border-gray-700 sm:grid-cols-2">
          <div className="space-y-1.5 text-xs text-gray-600 dark:text-gray-300">
            {[
              ["Mobile", row.mobile || "—"],
              ["Org / Post", `${row.organization || "—"} · ${row.appliedPost || "—"}`],
              ["Course", row.courseName || "—"],
              ["Package", row.coursePackage || "—"],
              [
                "Total payment",
                row.totalPayment != null
                  ? `Rs. ${row.totalPayment.toLocaleString("en-IN")}`
                  : "Not set",
              ],
              [
                "Payment method",
                row.paymentMethod
                  ? `${paymentLabel(row.paymentMethod)}${
                      row.paymentReference ? ` · ${row.paymentReference}` : ""
                    } — ${paymentState(row.paymentMethod, row.paymentStatus) || "Unconfirmed"}`
                  : "—",
              ],
              ["Address", row.addressLine],
              ["Admission No.", row.admissionNumber || "—"],
              ["Bill No.", row.billNumber || "—"],
              ["Applied on", row.createdLabel],
            ].map(([k, v]) => (
              <div key={k} className="flex justify-between gap-3">
                <span className="text-gray-400 dark:text-gray-500">{k}</span>
                <span className="text-right font-semibold">{v}</span>
              </div>
            ))}
            {row.officeRemarks && (
              <div className="rounded-lg border border-amber-200 bg-amber-50 p-2 dark:border-amber-800 dark:bg-amber-900/20">
                <span className="text-[10px] font-bold uppercase tracking-wider text-amber-600 dark:text-amber-400">
                  Office remarks
                </span>
                <p className="mt-0.5 text-gray-700 dark:text-gray-200">{row.officeRemarks}</p>
              </div>
            )}
          </div>
          <FeeBreakdown pricing={row.formData.pricingSnapshot} />
        </div>

        {/* The real 3-page document (photo + signatures render here) */}
        <div className="sci-paper-scroll">
          <div className="sci-print-root sci-print-isolated">
            <AdmissionDocument
              data={signData}
              courses={courses}
              mode="readonly"
              signatureEdit={signMode}
              onChange={(patch) => setSignData((prev) => ({ ...prev, ...patch }))}
            />
          </div>
        </div>
      </div>
    </div>,
    document.body,
  );
}

/* ════════════════════════════ PAGE ═════════════════════════════ */

export function AdmissionsPage() {
  const qc = useQueryClient();

  const {
    data: docs = [],
    isLoading,
    isError,
    error,
    refetch,
  } = useQuery({
    queryKey: ["admin-admissions"],
    queryFn: async (): Promise<RawAdmission[]> => {
      const snap = await getDocs(query(collection(db, "admissions"), orderBy("createdAt", "desc")));
      return snap.docs.map((d) => ({ id: d.id, ...d.data() })) as RawAdmission[];
    },
    staleTime: 15_000,
    refetchInterval: 60_000, // "live-ish": re-sync every minute
  });

  const { data: courses = [] } = useAdmissionCourses({ includeInactive: true });

  const rows = useMemo(() => docs.map(mapToDocShape), [docs]);

  /* ── filters (client-side; option lists derived from loaded data) ── */
  const [search, setSearch] = useState("");
  const [fStatus, setFStatus] = useState(ALL);
  const [fOrg, setFOrg] = useState(ALL);
  const [fPost, setFPost] = useState(ALL);
  const [fCourse, setFCourse] = useState(ALL);
  const [fPackage, setFPackage] = useState(ALL);
  const [fDuration, setFDuration] = useState(ALL);
  const [fProvince, setFProvince] = useState(ALL);
  const [fDistrict, setFDistrict] = useState(ALL);
  const [fMunicipality, setFMunicipality] = useState(ALL);
  const [fPayment, setFPayment] = useState("any");

  /* ── detail + office edit ── */
  const [detailId, setDetailId] = useState<string | null>(null);
  const [officeRow, setOfficeRow] = useState<AdmissionRow | null>(null);
  const [officeForm, setOfficeForm] = useState<OfficeForm>(EMPTY_OFFICE_FORM);
  const [savingOffice, setSavingOffice] = useState(false);

  const filterOptions = useMemo(() => {
    const uniq = (values: string[]) => Array.from(new Set(values.filter(Boolean))).sort();
    return {
      status: uniq(rows.map((r) => r.status)),
      organization: uniq(rows.map((r) => r.organization)),
      post: uniq(rows.map((r) => r.appliedPost)),
      course: uniq(rows.map((r) => r.courseName)),
      coursePackage: uniq(rows.map((r) => r.coursePackage)),
      duration: uniq(rows.map((r) => r.packageDuration)),
      province: uniq(rows.map((r) => r.province)),
      district: uniq(rows.map((r) => r.district)),
      municipality: uniq(rows.map((r) => r.municipality)),
    };
  }, [rows]);

  const stats = useMemo(
    () => ({
      total: rows.length,
      pending: rows.filter((r) => PENDING_STATUSES.has(r.status)).length,
      approved: rows.filter((r) => APPROVED_STATUSES.has(r.status)).length,
      rejected: rows.filter((r) => REJECTED_STATUSES.has(r.status)).length,
    }),
    [rows],
  );

  const activeFilterCount =
    (search.trim() ? 1 : 0) +
    [
      fStatus,
      fOrg,
      fPost,
      fCourse,
      fPackage,
      fDuration,
      fProvince,
      fDistrict,
      fMunicipality,
    ].filter((v) => v !== ALL).length +
    (fPayment !== "any" ? 1 : 0);

  const clearFilters = () => {
    setSearch("");
    setFStatus(ALL);
    setFOrg(ALL);
    setFPost(ALL);
    setFCourse(ALL);
    setFPackage(ALL);
    setFDuration(ALL);
    setFProvince(ALL);
    setFDistrict(ALL);
    setFMunicipality(ALL);
    setFPayment("any");
  };

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();
    return rows.filter((r) => {
      if (q) {
        const haystack =
          `${r.name} ${r.mobile} ${r.applicationId} ${r.admissionNumber}`.toLowerCase();
        if (!haystack.includes(q)) return false;
      }
      if (fStatus !== ALL && r.status !== fStatus) return false;
      if (fOrg !== ALL && r.organization !== fOrg) return false;
      if (fPost !== ALL && r.appliedPost !== fPost) return false;
      if (fCourse !== ALL && r.courseName !== fCourse) return false;
      if (fPackage !== ALL && r.coursePackage !== fPackage) return false;
      if (fDuration !== ALL && r.packageDuration !== fDuration) return false;
      if (fProvince !== ALL && r.province !== fProvince) return false;
      if (fDistrict !== ALL && r.district !== fDistrict) return false;
      if (fMunicipality !== ALL && r.municipality !== fMunicipality) return false;
      if (fPayment === "gte" && !(r.totalPayment != null && r.totalPayment >= 20000)) return false;
      if (fPayment === "lt" && !(r.totalPayment != null && r.totalPayment < 20000)) return false;
      if (fPayment === "none" && r.totalPayment != null) return false;
      return true;
    });
  }, [
    rows,
    search,
    fStatus,
    fOrg,
    fPost,
    fCourse,
    fPackage,
    fDuration,
    fProvince,
    fDistrict,
    fMunicipality,
    fPayment,
  ]);

  const detailRow = useMemo(
    () => (detailId ? (rows.find((r) => r.id === detailId) ?? null) : null),
    [rows, detailId],
  );

  /* ── office-only edit modal ── */
  const statusOptions = useMemo(() => {
    const list: { value: string; label: string }[] = ADMISSION_STATUSES.map((s) => ({
      value: s,
      label: s,
    }));
    const current = officeRow?.status ?? "";
    if (current && !(ADMISSION_STATUSES as string[]).includes(current)) {
      list.push({ value: current, label: `${cap(current)} (legacy)` });
    }
    return list;
  }, [officeRow]);

  const openOfficeEdit = (row: AdmissionRow) => {
    setOfficeRow(row);
    setOfficeForm({
      admissionNumber: row.admissionNumber,
      billNumber: row.billNumber,
      totalPayment: row.totalPayment != null ? String(row.totalPayment) : "",
      status: row.status || "Draft",
      officeRemarks: row.officeRemarks,
      paymentStatus: row.paymentStatus || "",
    });
  };

  const closeOfficeEdit = () => {
    if (savingOffice) return;
    setOfficeRow(null);
    setOfficeForm(EMPTY_OFFICE_FORM);
  };

  const saveOfficeFields = async () => {
    if (!officeRow) return;
    const rawTotal = officeForm.totalPayment.trim();
    let total: number | null = null;
    if (rawTotal !== "") {
      total = Number(rawTotal);
      if (!Number.isFinite(total)) {
        toast.error("Total payment must be a number");
        return;
      }
    }
    setSavingOffice(true);
    try {
      await updateDoc(doc(db, "admissions", officeRow.id), {
        admissionNumber: officeForm.admissionNumber.trim(),
        billNumber: officeForm.billNumber.trim(),
        totalPayment: total,
        status: officeForm.status,
        officeRemarks: officeForm.officeRemarks.trim(),
        paymentStatus: officeForm.paymentStatus,
        updatedAt: Date.now(),
      });
      toast.success("Office fields updated");
      setOfficeRow(null);
      setOfficeForm(EMPTY_OFFICE_FORM);
      qc.invalidateQueries({ queryKey: ["admin-admissions"] });
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Save failed");
    } finally {
      setSavingOffice(false);
    }
  };

  /* ── row actions ── */
  const handlePrintRow = (row: AdmissionRow) => {
    toast.info('Choose "Save as PDF" in the print dialog');
    if (detailId !== row.id) {
      // Make sure the detail view containing .sci-print-root .sci-print-isolated
      // is mounted first, then print once React has committed it.
      setDetailId(row.id);
      window.setTimeout(runIsolatedPrint, 350);
    } else {
      runIsolatedPrint();
    }
  };

  const sendWhatsApp = (row: AdmissionRow) => {
    const digits = whatsappDigits(row.mobile);
    if (!digits) {
      toast.error("This application has no mobile number on file.");
      return;
    }
    const text = encodeURIComponent(
      `Star Coaching Institute\nApplication: ${row.applicationId}\nApplicant: ${row.name || "-"}\nStatus: ${cap(row.status)}`,
    );
    window.open(`https://wa.me/${digits}?text=${text}`, "_blank");
  };

  const removeRow = async (row: AdmissionRow) => {
    const label = row.name || row.applicationId;
    if (!window.confirm(`Delete application for "${label}"? This cannot be undone.`)) return;
    try {
      await deleteDoc(doc(db, "admissions", row.id));
      toast.success("Application deleted");
      if (detailId === row.id) setDetailId(null);
      if (officeRow?.id === row.id) {
        setOfficeRow(null);
        setOfficeForm(EMPTY_OFFICE_FORM);
      }
      qc.invalidateQueries({ queryKey: ["admin-admissions"] });
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Delete failed");
    }
  };

  /* ── table body: loading / error / empty / data ── */
  let tableContent: ReactNode;
  if (isLoading) {
    tableContent = <SkeletonTable rows={6} />;
  } else if (isError) {
    tableContent = (
      <div className="rounded-2xl border border-red-200 bg-red-50 p-10 text-center dark:border-red-900/60 dark:bg-red-900/10">
        <AlertCircle className="mx-auto mb-3 h-8 w-8 text-red-500" />
        <h3 className="text-base font-semibold text-gray-900 dark:text-white">
          Couldn&apos;t load applications
        </h3>
        <p className="mx-auto mt-1 max-w-md text-sm text-gray-500 dark:text-gray-400">
          {error instanceof Error ? error.message : "The Firestore read failed."} Check your
          connection and try again.
        </p>
        <button type="button" className="ap-btn mt-4" onClick={() => refetch()}>
          <RefreshCw className="h-4 w-4" /> Try again
        </button>
      </div>
    );
  } else if (rows.length === 0) {
    tableContent = (
      <Panel title="Applications" subtitle="Firestore · admissions">
        <EmptyState
          icon={FileText}
          title="No admission applications yet"
          desc="Applications submitted through the public digital admission form (/admission) will appear here."
        />
      </Panel>
    );
  } else if (filtered.length === 0) {
    tableContent = (
      <Panel title="Applications" subtitle={`${rows.length} total`}>
        <EmptyState
          icon={Search}
          title="No applications match your filters"
          desc="Try a different search, or clear the active filters to see everything."
          action={{ label: "Clear filters", onClick: clearFilters }}
        />
      </Panel>
    );
  } else {
    tableContent = (
      <DataTable
        rows={filtered}
        columns={[
          {
            key: "applicant",
            label: "Applicant",
            render: (r) => (
              <div className="min-w-[150px]">
                <p className="font-semibold text-gray-900 dark:text-white">{r.name || "—"}</p>
                <p className="text-xs text-gray-500 dark:text-gray-400">
                  {r.mobile || "No mobile"}
                </p>
              </div>
            ),
          },
          {
            key: "appId",
            label: "App / Admission ID",
            render: (r) => (
              <div className="min-w-[130px]">
                <p className="font-mono text-xs font-bold text-brand-red">{r.applicationId}</p>
                {r.admissionNumber && r.admissionNumber !== r.applicationId && (
                  <p className="text-[11px] text-gray-500 dark:text-gray-400">
                    Adm: {r.admissionNumber}
                  </p>
                )}
                <p className="text-[11px] text-gray-400 dark:text-gray-500">{r.createdLabel}</p>
              </div>
            ),
          },
          {
            key: "org",
            label: "Org / Post",
            render: (r) => (
              <div>
                <p className="text-sm">{r.organization || "—"}</p>
                <p className="text-xs text-gray-500 dark:text-gray-400">{r.appliedPost || "—"}</p>
              </div>
            ),
          },
          {
            key: "courseName",
            label: "Course",
            render: (r) => <span className="text-sm">{r.courseName || "—"}</span>,
          },
          {
            key: "package",
            label: "Package",
            render: (r) => (
              <div>
                <p className="text-sm">{r.coursePackage || "—"}</p>
                {r.packageDuration && (
                  <p className="text-xs text-gray-500 dark:text-gray-400">{r.packageDuration}</p>
                )}
              </div>
            ),
          },
          {
            key: "payment",
            label: "Total Payment",
            render: (r) => (
              <div className="min-w-[130px]">
                {r.totalPayment != null ? (
                  <span className="font-semibold tabular-nums text-gray-900 dark:text-white">
                    Rs. {Number(r.totalPayment).toLocaleString("en-IN")}
                  </span>
                ) : (
                  <span className="text-xs text-gray-400 dark:text-gray-500">Not set</span>
                )}
                {r.paymentMethod && (
                  <p className="text-[10px] text-gray-500 dark:text-gray-400">
                    {paymentLabel(r.paymentMethod)}
                    {paymentState(r.paymentMethod, r.paymentStatus) &&
                      ` · ${paymentState(r.paymentMethod, r.paymentStatus)}`}
                  </p>
                )}
              </div>
            ),
          },
          {
            key: "address",
            label: "Address",
            render: (r) => (
              <div className="min-w-[140px]">
                <p className="text-sm">{r.addressLine}</p>
                {r.ward && (
                  <p className="text-xs text-gray-500 dark:text-gray-400">Ward {r.ward}</p>
                )}
              </div>
            ),
          },
          {
            key: "status",
            label: "Status",
            render: (r) => <Badge tone={statusTone(r.status)}>{cap(r.status)}</Badge>,
          },
        ]}
        actions={(r) => (
          <div className="flex items-center justify-end gap-1">
            <IconBtn title="View application" onClick={() => setDetailId(r.id)}>
              <Eye className="h-4 w-4" />
            </IconBtn>
            <IconBtn title="Print / PDF" onClick={() => handlePrintRow(r)}>
              <Printer className="h-4 w-4" />
            </IconBtn>
            <IconBtn title="Edit office fields" onClick={() => openOfficeEdit(r)}>
              <Pencil className="h-4 w-4" />
            </IconBtn>
            <IconBtn
              title="WhatsApp applicant"
              tone="green"
              onClick={() => sendWhatsApp(r as AdmissionRow)}
            >
              <MessageCircle className="h-4 w-4" />
            </IconBtn>
            <IconBtn
              title="Delete application"
              tone="red"
              onClick={() => removeRow(r as AdmissionRow)}
            >
              <Trash2 className="h-4 w-4" />
            </IconBtn>
          </div>
        )}
      />
    );
  }

  return (
    <div>
      {/* While `sci-printing` is on <body>, only the portaled document prints —
          flatten the overlay so `.sci-print-isolated` resolves against the page
          origin (no positioned ancestor), and keep the admin shell out of the
          printed pages. Scoped to `body.sci-printing` so a plain Ctrl+P on the
          admin list is unaffected. */}
      <style>
        {`@media print {
  body.sci-printing .admin-shell { display: none !important; }
  body.sci-printing .adm-print-scope {
    position: static !important;
    inset: auto !important;
    overflow: visible !important;
    background: transparent !important;
    backdrop-filter: none !important;
    padding: 0 !important;
    z-index: auto !important;
  }
  body.sci-printing .adm-print-scope > div {
    max-width: none !important;
    margin: 0 !important;
    border: 0 !important;
    border-radius: 0 !important;
    box-shadow: none !important;
  }
}`}
      </style>

      <PageHeader
        title="Admissions"
        subtitle="Applications from the digital /admission form (and legacy records) — review, verify, approve and print."
        actions={
          <>
            <button
              type="button"
              className="ap-btn-ghost"
              onClick={() => refetch()}
              disabled={isLoading}
            >
              <RefreshCw className={`h-4 w-4 ${isLoading ? "animate-spin" : ""}`} /> Refresh
            </button>
            <a href="/admission" target="_blank" rel="noreferrer" className="ap-btn">
              <ExternalLink className="h-4 w-4" /> Admission Form
            </a>
          </>
        }
      />

      {/* Stats */}
      <div className="mb-6 grid grid-cols-2 gap-4 md:grid-cols-4">
        <StatCard
          label="Total Applications"
          value={stats.total}
          icon={ClipboardList}
          tone="purple"
        />
        <StatCard label="Pending" value={stats.pending} icon={Clock} tone="warning" />
        <StatCard label="Approved" value={stats.approved} icon={CheckCircle2} tone="success" />
        <StatCard label="Rejected" value={stats.rejected} icon={XCircle} tone="danger" />
      </div>

      {/* Filters */}
      <Panel
        title="Filters"
        subtitle="Search & filter across all applications — options come from the loaded data."
        className="mb-4"
        actions={
          activeFilterCount > 0 ? (
            <button type="button" className="ap-btn-ghost" onClick={clearFilters}>
              <X className="h-4 w-4" /> Clear {activeFilterCount}{" "}
              {activeFilterCount === 1 ? "filter" : "filters"}
            </button>
          ) : (
            <Badge tone="muted">No filters active</Badge>
          )
        }
      >
        <Toolbar className="gap-2">
          <div className="relative min-w-[220px] max-w-xs flex-1">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
            <input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search name, mobile, application ID..."
              className="ap-input pl-9"
            />
          </div>
          <FilterSelect
            allLabel="Any status"
            value={fStatus}
            onChange={setFStatus}
            options={filterOptions.status}
            display={cap}
          />
          <FilterSelect
            allLabel="Any organization"
            value={fOrg}
            onChange={setFOrg}
            options={filterOptions.organization}
          />
          <FilterSelect
            allLabel="Any post"
            value={fPost}
            onChange={setFPost}
            options={filterOptions.post}
          />
          <FilterSelect
            allLabel="Any course"
            value={fCourse}
            onChange={setFCourse}
            options={filterOptions.course}
          />
          <FilterSelect
            allLabel="Any package"
            value={fPackage}
            onChange={setFPackage}
            options={filterOptions.coursePackage}
          />
          <FilterSelect
            allLabel="Any duration"
            value={fDuration}
            onChange={setFDuration}
            options={filterOptions.duration}
          />
          <FilterSelect
            allLabel="Any province"
            value={fProvince}
            onChange={setFProvince}
            options={filterOptions.province}
          />
          <FilterSelect
            allLabel="Any district"
            value={fDistrict}
            onChange={setFDistrict}
            options={filterOptions.district}
          />
          <FilterSelect
            allLabel="Any municipality"
            value={fMunicipality}
            onChange={setFMunicipality}
            options={filterOptions.municipality}
          />
          <select
            aria-label="Payment filter"
            value={fPayment}
            onChange={(e) => setFPayment(e.target.value)}
            className="ap-input max-w-[170px] text-xs"
          >
            {PAYMENT_OPTIONS.map((o) => (
              <option key={o.value} value={o.value}>
                {o.label}
              </option>
            ))}
          </select>
        </Toolbar>
      </Panel>

      {tableContent}

      {/* Detail: the real 3-page admission document (print target) */}
      {detailRow &&
        createPortal(
          <AdmissionDetailOverlay
            row={detailRow}
            courses={courses}
            onClose={() => setDetailId(null)}
            onPrint={() => {
              toast.info('Choose "Save as PDF" in the print dialog');
              runIsolatedPrint();
            }}
            onEditOffice={() => openOfficeEdit(detailRow)}
            onWhatsApp={() => sendWhatsApp(detailRow)}
          />,
          document.body,
        )}

      {/* Office-only fields edit — Admission No., Bill No., Total Payment, Status, Remarks */}
      <Modal open={!!officeRow} onClose={closeOfficeEdit} size="lg" title="Edit Office Fields">
        {officeRow && (
          <div>
            <div className="mb-4 flex flex-wrap items-center gap-2 text-sm text-gray-500 dark:text-gray-400">
              <span className="font-semibold text-gray-900 dark:text-white">
                {officeRow.name || "Unnamed applicant"}
              </span>
              <span className="font-mono text-xs">{officeRow.applicationId}</span>
              <Badge tone={statusTone(officeRow.status)}>{cap(officeRow.status)}</Badge>
            </div>
            <p className="mb-4 rounded-lg border border-blue-200 bg-blue-50 px-3 py-2 text-xs text-blue-700 dark:border-blue-900 dark:bg-blue-900/20 dark:text-blue-300">
              These are office-only fields, filled by the institute after verification — applicants
              can never edit them from the public form.
            </p>

            <div className="space-y-4">
              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                <Field label="Admission No.">
                  <input
                    value={officeForm.admissionNumber}
                    onChange={(e) =>
                      setOfficeForm((p) => ({ ...p, admissionNumber: e.target.value }))
                    }
                    placeholder="SCI-2026-0001"
                    className="ap-input w-full"
                  />
                </Field>
                <Field label="Bill No.">
                  <input
                    value={officeForm.billNumber}
                    onChange={(e) => setOfficeForm((p) => ({ ...p, billNumber: e.target.value }))}
                    placeholder="BILL-001"
                    className="ap-input w-full"
                  />
                </Field>
              </div>

              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                <Field label="Total Payment (Rs.)">
                  <input
                    type="number"
                    min={0}
                    inputMode="numeric"
                    value={officeForm.totalPayment}
                    onChange={(e) => setOfficeForm((p) => ({ ...p, totalPayment: e.target.value }))}
                    placeholder="20500"
                    className="ap-input w-full"
                  />
                </Field>
                <Field label="Status">
                  <select
                    value={officeForm.status}
                    onChange={(e) => setOfficeForm((p) => ({ ...p, status: e.target.value }))}
                    className="ap-input w-full"
                  >
                    {statusOptions.map((o) => (
                      <option key={o.value} value={o.value}>
                        {o.label}
                      </option>
                    ))}
                  </select>
                </Field>
              </div>

              {/* Chosen by the applicant (read-only) + confirmed by the office */}
              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                <Field label="Method (as chosen by applicant)">
                  <div className="ap-input flex min-h-[38px] items-center bg-gray-50 text-sm text-gray-600 dark:bg-gray-900 dark:text-gray-300">
                    {officeRow?.paymentMethod
                      ? `${paymentLabel(officeRow.paymentMethod)}${
                          officeRow.paymentReference ? ` · ${officeRow.paymentReference}` : ""
                        }`
                      : "Not chosen"}
                  </div>
                </Field>
                <Field label="Payment Status">
                  <select
                    value={officeForm.paymentStatus}
                    onChange={(e) =>
                      setOfficeForm((p) => ({ ...p, paymentStatus: e.target.value }))
                    }
                    className="ap-input w-full"
                  >
                    <option value="">— Not confirmed</option>
                    <option value="pending">Pending</option>
                    <option value="paid">Paid</option>
                  </select>
                </Field>
              </div>

              <Field label="Office Remarks">
                <textarea
                  rows={3}
                  value={officeForm.officeRemarks}
                  onChange={(e) => setOfficeForm((p) => ({ ...p, officeRemarks: e.target.value }))}
                  placeholder="Documents verified, fee cleared in cash, etc."
                  className="ap-input w-full resize-none"
                />
              </Field>
            </div>

            <div className="mt-6 flex justify-end gap-3 border-t border-gray-200 pt-4 dark:border-gray-700">
              <button
                type="button"
                className="ap-btn-ghost"
                onClick={closeOfficeEdit}
                disabled={savingOffice}
              >
                Cancel
              </button>
              <button
                type="button"
                className="ap-btn"
                onClick={saveOfficeFields}
                disabled={savingOffice}
              >
                {savingOffice ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  <Save className="h-4 w-4" />
                )}
                Save Changes
              </button>
            </div>
          </div>
        )}
      </Modal>
    </div>
  );
}
