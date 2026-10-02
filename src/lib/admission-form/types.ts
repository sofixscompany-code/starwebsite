/**
 * Shared types for the Star Coaching Institute digital admission form
 * (2-page A4 document) and its admin/pricing system.
 */

export const ORGANIZATIONS = ["Nepal Police", "Nepal Army", "APF"] as const;
export type Organization = (typeof ORGANIZATIONS)[number];

export const POSTS = ["Inspector", "Sub-Inspector (ASI)", "Jawan"] as const;
export type AppliedPost = (typeof POSTS)[number];

export const GENDERS = ["Male", "Female"] as const;
export type Gender = (typeof GENDERS)[number];

export const PACKAGE_TYPES = ["Monthly", "Year", "Course"] as const;
export type PackageType = (typeof PACKAGE_TYPES)[number];

export const MUNICIPALITY_TYPES = [
  "Rural Municipality",
  "Municipality",
  "Sub-Metropolitan City",
  "Metropolitan City",
] as const;

export type AdmissionStatus = "Draft" | "Submitted" | "Verified" | "Approved" | "Rejected";

/* ── Payment (QR / bank / COD) ───────────────────────────────────── */

export type PaymentMethod = "esewa" | "khalti" | "fonepay" | "bank" | "cod";
export type PaymentMethodKind = "qr" | "bank" | "cod";

/** Options shown in the admission form's Payment Method card. */
export const PAYMENT_METHODS: {
  value: PaymentMethod;
  label: string;
  kind: PaymentMethodKind;
}[] = [
  { value: "esewa", label: "eSewa (QR)", kind: "qr" },
  { value: "khalti", label: "Khalti (QR)", kind: "qr" },
  { value: "fonepay", label: "FonePay (QR)", kind: "qr" },
  { value: "bank", label: "Bank Transfer", kind: "bank" },
  { value: "cod", label: "COD — Cash at Office", kind: "cod" },
];

/**
 * Office-set payment state. Applicants never write this field — the client
 * only records WHICH method they chose (and their transaction reference).
 */
export type AdmissionPaymentStatus = "pending" | "paid";

export const ADMISSION_STATUSES: AdmissionStatus[] = [
  "Draft",
  "Submitted",
  "Verified",
  "Approved",
  "Rejected",
];

/** One selectable package/price row inside a course (admin-managed). */
export interface AdmissionCoursePackage {
  id: string;
  /** Matches the printed "Course Package" options, e.g. "Course Complete 3 Month". */
  name: string;
  /** Human duration, e.g. "3 Month", "1 Year". */
  duration: string;
  admissionFee: number;
  tuitionFee: number;
  examFee: number;
  physicalFee: number;
  additionalFee: number;
  totalFee: number;
  active: boolean;
}

/** Admin-managed course: Organization → Post → Course/Class → Packages → Fee. */
export interface AdmissionCourse {
  id: string;
  /** "" means the course applies to every organization/post. */
  organization: Organization | "";
  post: AppliedPost | "";
  name: string;
  description: string;
  duration: string;
  active: boolean;
  packages: AdmissionCoursePackage[];
  createdAt?: number;
  updatedAt?: number;
}

/** Immutable price record captured when an application is submitted. */
export interface PricingSnapshot {
  admissionFee: number;
  tuitionFee: number;
  examFee: number;
  physicalFee: number;
  additionalFee: number;
  totalFee: number;
  /** Package name at time of submission (e.g. "Course Complete 3 Month"). */
  package: string;
  /** Course name at time of submission. */
  course: string;
  capturedAt: number;
}

/** Structured admission object — see spec §64. */
export interface AdmissionFormData {
  studentName: string;
  organization: Organization | "";
  appliedPost: AppliedPost | "";

  classAppliedFor: string;
  courseId: string;
  courseName: string;

  packageType: PackageType | "";
  coursePackage: string;
  packageDuration: string;

  pricingSnapshot: PricingSnapshot | null;

  mobileNumber: string;
  gender: Gender | "";
  dateOfBirth: string; // YYYY-MM-DD

  fatherName: string;
  fatherOccupation: string;
  fatherMobile: string;

  motherName: string;
  motherOccupation: string;
  motherMobile: string;

  province: string;
  district: string;
  municipality: string;
  municipalityType: string;
  ward: string;
  tol: string;

  hostel: "" | "Yes" | "No";

  /** Applicant's chosen payment method (QR wallets, bank, or COD). */
  paymentMethod: PaymentMethod | "";
  /** Transaction / reference ID for QR or bank payments (optional). */
  paymentReference: string;

  admissionDate: string; // YYYY-MM-DD
  totalPayment: number | null;

  admissionNumber: string;
  billNumber: string;

  studentPhoto: string; // data URL
  studentSignature: string; // data URL
  parentSignature: string; // data URL

  agreementAccepted: boolean;
  status: AdmissionStatus;
  createdAt: number;
}

/** Firestore document shape for the `admissions` collection. */
export interface AdmissionRecord extends AdmissionFormData {
  /** Office-independent application reference shown on success. */
  applicationId: string;
  /** Academic/Principal signatures — office only. */
  academicSignature?: string;
  principalSignature?: string;
  submittedAt?: number;
  updatedAt?: number;
  /** Free-text office remarks. */
  officeRemarks?: string;
  /** "pending" = awaiting verification / collect at office; "paid" = cleared. */
  paymentStatus?: AdmissionPaymentStatus;
  /** When the applicant picked the method (epoch ms). */
  paymentChosenAt?: number;
}

export const EMPTY_ADMISSION: AdmissionFormData = {
  studentName: "",
  organization: "",
  appliedPost: "",
  classAppliedFor: "",
  courseId: "",
  courseName: "",
  packageType: "",
  coursePackage: "",
  packageDuration: "",
  pricingSnapshot: null,
  mobileNumber: "",
  gender: "",
  dateOfBirth: "",
  fatherName: "",
  fatherOccupation: "",
  fatherMobile: "",
  motherName: "",
  motherOccupation: "",
  motherMobile: "",
  province: "",
  district: "",
  municipality: "",
  municipalityType: "",
  ward: "",
  tol: "",
  hostel: "",
  paymentMethod: "",
  paymentReference: "",
  admissionDate: "",
  totalPayment: null,
  admissionNumber: "",
  billNumber: "",
  studentPhoto: "",
  studentSignature: "",
  parentSignature: "",
  agreementAccepted: false,
  status: "Draft",
  createdAt: 0,
};

/** Application reference shown to the applicant (SCI-2026-XXXXXX). */
export function generateApplicationId(): string {
  const year = new Date().getFullYear();
  const stamp = Date.now().toString(36).slice(-5).toUpperCase();
  const rand = Math.floor(100 + Math.random() * 900);
  return `SCI-${year}-${stamp}${rand}`;
}
