import type { AdmissionFormData } from "./types";
import { districtsFor, municipalityInfo, wardsFor } from "@/data/nepal-geo";

/** Nepali mobile numbers: 96/97/98 prefix + 8 digits (10 total). */
export function isValidNepaliMobile(value: string): boolean {
  const digits = value.replace(/\D/g, "");
  return /^(9[6-9])\d{8}$/.test(digits);
}

export function digitsOnly(value: string): string {
  return value.replace(/\D/g, "");
}

/**
 * Validates the admission form and returns inline error messages
 * (spec §30). Empty object = valid.
 */
export function validateAdmissionForm(f: AdmissionFormData): Record<string, string> {
  const e: Record<string, string> = {};
  const req = (cond: boolean, key: string, msg: string) => {
    if (!cond) e[key] = msg;
  };

  // — Personal —
  req(
    f.studentName.trim().length >= 2,
    "studentName",
    "Student name is required (min. 2 characters).",
  );

  // — Class applied for —
  req(
    !!f.organization,
    "organization",
    "Select one organization (Nepal Police / Nepal Army / APF).",
  );
  req(
    !!f.appliedPost,
    "appliedPost",
    "Select one post (Inspector / Sub-Inspector / Jawan / Research Assistant).",
  );
  req(!!f.courseId, "courseId", "Select the Course / Class applied for.");

  // — Mobile —
  req(!!f.mobileNumber, "mobileNumber", "Mobile number is required.");
  if (f.mobileNumber && !isValidNepaliMobile(f.mobileNumber)) {
    e.mobileNumber = "Enter a valid 10-digit Nepali mobile number (e.g. 98XXXXXXXX).";
  }

  // — Gender / DOB —
  req(!!f.gender, "gender", "Select gender.");
  req(!!f.dateOfBirth, "dateOfBirth", "Date of birth is required.");
  if (f.dateOfBirth) {
    const t = Date.parse(f.dateOfBirth);
    if (Number.isNaN(t)) e.dateOfBirth = "Enter a valid date.";
    else if (t > Date.now()) e.dateOfBirth = "Date of birth cannot be in the future.";
    else if (new Date(t).getFullYear() < 1950) e.dateOfBirth = "Enter a valid date of birth.";
  }

  // — Parents —
  req(f.fatherName.trim().length >= 2, "fatherName", "Father's name is required.");
  req(f.motherName.trim().length >= 2, "motherName", "Mother's name is required.");
  if (f.fatherMobile && !isValidNepaliMobile(f.fatherMobile)) {
    e.fatherMobile = "Enter a valid 10-digit mobile number.";
  }
  if (f.motherMobile && !isValidNepaliMobile(f.motherMobile)) {
    e.motherMobile = "Enter a valid 10-digit mobile number.";
  }

  // — अभिभावक (paper form §4) —
  req(
    f.guardianName.trim().length >= 2,
    "guardianName",
    "Guardian's name is required (आपतकालीन अभिभावक).",
  );
  req(!!f.guardianRelation.trim(), "guardianRelation", "Relation with student is required.");
  if (f.guardianMobile && !isValidNepaliMobile(f.guardianMobile)) {
    e.guardianMobile = "Enter a valid 10-digit mobile number.";
  }

  // — शैक्षिक विवरण (paper form §3) —
  req(
    f.schoolName.trim().length >= 2,
    "schoolName",
    "Last attended school / college name is required.",
  );
  req(!!f.lastExamPassed.trim(), "lastExamPassed", "Last exam / class passed is required.");
  if (f.email.trim() && !/^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(f.email.trim())) {
    e.email = "Enter a valid email address.";
  }

  // — स्वास्थ्य विवरण (paper form §5) —
  req(!!f.bloodGroup, "bloodGroup", "Select a blood group.");
  req(
    f.physicalDisability === "Yes" || f.physicalDisability === "No",
    "physicalDisability",
    "Select Yes / No for physical disability.",
  );
  if (f.physicalDisability === "Yes") {
    req(
      f.disabilityDetail.trim().length >= 2,
      "disabilityDetail",
      "Please describe the disability.",
    );
  }
  req(!!f.nationality.trim(), "nationality", "Nationality is required.");

  // — Address (dependent dropdowns) —
  req(!!f.province, "province", "Select a province.");
  if (f.province) {
    const districts = districtsFor(f.province).map((d) => d.name);
    req(districts.includes(f.district), "district", "Select a district of the chosen province.");
  }
  if (f.district) {
    const info = f.province ? municipalityInfo(f.province, f.district, f.municipality) : undefined;
    req(!!info, "municipality", "Select a municipality of the chosen district.");
    if (info) {
      const wardNum = Number(f.ward);
      req(
        Number.isInteger(wardNum) && wardNum >= 1 && wardNum <= info.wards,
        "ward",
        "Select a ward.",
      );
      // Municipality type stays in sync with the selected municipality.
      req(
        f.municipalityType === info.type,
        "municipalityType",
        "Municipality type is set automatically from the selected municipality.",
      );
    }
  }
  req(!!f.tol.trim(), "tol", "Tol / Locality is required.");

  // — Office section (applicant-visible fields) —
  req(!!f.hostel, "hostel", "Select Yes / No.");
  req(!!f.packageType, "packageType", "Select a package (Monthly / Year / Course).");
  req(!!f.coursePackage, "coursePackage", "Select a course package (duration).");
  req(!!f.admissionDate, "admissionDate", "Admission date is required.");
  if (f.admissionDate && Number.isNaN(Date.parse(f.admissionDate))) {
    e.admissionDate = "Enter a valid admission date.";
  }

  // — Payment method (QR / bank / COD — COD is allowed, it records too) —
  req(!!f.paymentMethod, "paymentMethod", "Select a payment method (QR, bank or COD).");

  // — Pricing must be the calculated amount (never free-typed) —
  req(!!f.pricingSnapshot, "coursePackage", "Select a course package to calculate the fee.");
  if (f.pricingSnapshot) {
    const expectedTotal = f.pricingSnapshot.totalFee + (f.hostel === "Yes" ? f.hostelFee || 0 : 0);
    if (f.totalPayment !== expectedTotal) {
      e.totalPayment =
        "Total payment is calculated automatically from the selected package and hostel choice.";
    }
  }
  if (f.totalPayment !== null && Number.isNaN(f.totalPayment)) {
    e.totalPayment = "Enter a numeric amount.";
  }

  // — Photo & signature (rules: फोटो अनिवार्य) —
  req(!!f.studentPhoto, "studentPhoto", "Student photo is required.");
  req(!!f.studentSignature, "studentSignature", "Student signature is required.");

  // — Agreement —
  req(f.agreementAccepted === true, "agreementAccepted", "You must agree to the rules to submit.");

  return e;
}

/**
 * Part 1 of the two-step form (course + hostel + fee preview). Returns the
 * subset of errors that must be fixed before the applicant may open the
 * full application form. Empty object = valid.
 */
export function validateAdmissionFeeStep(f: AdmissionFormData): Record<string, string> {
  const e: Record<string, string> = {};
  const req = (cond: boolean, key: string, msg: string) => {
    if (!cond) e[key] = msg;
  };

  req(
    !!f.organization,
    "organization",
    "Select one organization (Nepal Police / Nepal Army / APF).",
  );
  req(
    !!f.appliedPost,
    "appliedPost",
    "Select one post (Inspector / Sub-Inspector / Jawan / Research Assistant).",
  );
  req(!!f.courseId, "courseId", "Select the Course / Class applied for.");
  req(!!f.hostel, "hostel", "Select Yes / No for hostel.");
  req(!!f.packageType, "packageType", "Select a package (Monthly / Year / Course).");
  req(!!f.coursePackage, "coursePackage", "Select a course package (duration).");
  req(!!f.pricingSnapshot, "coursePackage", "Select a course package to calculate the fee.");

  return e;
}

/** Hard security note: office-only fields are never trusted from the client. */
export const OFFICE_ONLY_FIELDS = [
  "admissionNumber",
  "billNumber",
  "academicSignature",
  "principalSignature",
  "officeRemarks",
  "status",
  "discount",
  "payable",
] as const;
