import type { AdmissionCourse, AdmissionCoursePackage } from "./types";

/**
 * DEFAULT / INITIAL pricing configuration.
 *
 * Transcribed from the institute's printed fee tables:
 *   Table A — वनरक्षकको शुल्क - २०२३/२०२४            : 3-Month Rs.16,500 / 1-Year Rs.43,500
 *   Table B — नेपाल प्रहरी / सशस्त्र प्रहरी / सेना, जवान : 3-Month Rs.20,500 / 1-Year Rs.47,500
 *   Table C — असइ (ASI)                                : 3-Month Rs.14,500 / 1-Year Rs.55,500
 *   Table D — राष्ट्रिय अनुसन्धान सहायक               : 3-Month Rs.26,500 / 1-Year Rs.58,900
 *
 * ADMISSION FEE IS Rs.1,000 IN EVERY STRUCTURE (owner instruction) — including
 * the Research Assistant sheet, which is printed as Rs.2,000 and is overridden
 * to Rs.1,000 here so the printed totals recompute to Rs.26,500 / Rs.58,900.
 *
 * These values are ONLY the initial data seeded into Firestore
 * (`admission_courses`). The Admin Panel can change every price, course,
 * package and active flag later — no code deployment required.
 * Already-submitted applications keep their own `pricingSnapshot`.
 */
export function packageTotal(p: {
  admissionFee: number;
  tuitionFee: number;
  examFee: number;
  physicalFee: number;
  additionalFee: number;
}) {
  return p.admissionFee + p.tuitionFee + p.examFee + p.physicalFee + p.additionalFee;
}

function pkg(
  id: string,
  name: string,
  duration: string,
  fees: { admissionFee: number; tuitionFee: number; examFee: number; physicalFee: number },
): AdmissionCoursePackage {
  const base = { ...fees, additionalFee: 0 };
  return { id, name, duration, ...base, totalFee: packageTotal(base), active: true };
}

/** Table A pricing (Rs. 16,500 / Rs. 43,500). */
const TABLE_A = {
  threeMonth: { admissionFee: 1000, tuitionFee: 7500, examFee: 3500, physicalFee: 4500 },
  yearly: { admissionFee: 1000, tuitionFee: 22500, examFee: 6500, physicalFee: 13500 },
};

/** Table B pricing (Rs. 20,500 / Rs. 47,500). */
const TABLE_B = {
  threeMonth: { admissionFee: 1000, tuitionFee: 12500, examFee: 2500, physicalFee: 4500 },
  yearly: { admissionFee: 1000, tuitionFee: 25500, examFee: 7500, physicalFee: 13500 },
};

/** Table C — असइ (ASI) pricing (Rs. 14,500 / Rs. 55,500). */
const TABLE_C = {
  threeMonth: { admissionFee: 1000, tuitionFee: 5500, examFee: 3500, physicalFee: 4500 },
  yearly: { admissionFee: 1000, tuitionFee: 33500, examFee: 7500, physicalFee: 13500 },
};

/**
 * Table D — राष्ट्रिय अनुसन्धान सहायक (Research Assistant) pricing.
 * Printed sheet shows admission Rs.2,000 → overridden to Rs.1,000 per owner
 * instruction, so the totals recompute to Rs.26,500 / Rs.58,900.
 * (The sheet's hostel column — Rs.8,500/month — is separate and not bundled.)
 */
const TABLE_D = {
  threeMonth: { admissionFee: 1000, tuitionFee: 23000, examFee: 2500, physicalFee: 0 },
  yearly: { admissionFee: 1000, tuitionFee: 54500, examFee: 3400, physicalFee: 0 },
};

const PACKAGES_TABLE_A = () => [
  pkg("pkg-a-3m", "Course Complete 3 Month", "3 Month", TABLE_A.threeMonth),
  pkg("pkg-a-1y", "Yearly", "1 Year", TABLE_A.yearly),
];

const PACKAGES_TABLE_B = () => [
  pkg("pkg-b-3m", "Course Complete 3 Month", "3 Month", TABLE_B.threeMonth),
  pkg("pkg-b-1y", "Yearly", "1 Year", TABLE_B.yearly),
];

const PACKAGES_TABLE_C = () => [
  pkg("pkg-c-3m", "Course Complete 3 Month", "3 Month", TABLE_C.threeMonth),
  pkg("pkg-c-1y", "Yearly", "1 Year", TABLE_C.yearly),
];

const PACKAGES_TABLE_D = () => [
  pkg("pkg-d-3m", "Course Complete 3 Month", "3 Month", TABLE_D.threeMonth),
  pkg("pkg-d-1y", "Yearly", "1 Year", TABLE_D.yearly),
];

export const DEFAULT_ADMISSION_COURSES: AdmissionCourse[] = [
  {
    id: "course-inspector",
    organization: "",
    post: "Inspector",
    name: "Inspector Preparation Course",
    description: "वनरक्षकको शुल्क - २०२३/२०२४",
    duration: "3 Month / 1 Year",
    active: true,
    packages: PACKAGES_TABLE_A(),
  },
  {
    id: "course-asi",
    organization: "",
    post: "Sub-Inspector (ASI)",
    name: "Sub-Inspector (ASI) Preparation Course",
    description: "असइ (ASI) शुल्क तालिका",
    duration: "3 Month / 1 Year",
    active: true,
    packages: PACKAGES_TABLE_C(),
  },
  {
    id: "course-jawan",
    organization: "",
    post: "Jawan",
    name: "Jawan Preparation Course",
    description: "नेपाल प्रहरी / सशस्त्र प्रहरी / सेना, जवान पद मुलुक - २०८२/२०८३",
    duration: "3 Month / 1 Year",
    active: true,
    packages: PACKAGES_TABLE_B(),
  },
  {
    id: "course-research-assistant",
    organization: "",
    post: "Research Assistant",
    name: "राष्ट्रिय अनुसन्धान सहायक (Research Assistant) Preparation Course",
    description: "राष्ट्रिय अनुसन्धान सहायक शुल्क तालिका",
    duration: "3 Month / 1 Year",
    active: true,
    packages: PACKAGES_TABLE_D(),
  },
];

/** Courses applicable to the chosen organization + post (active only). */
export function applicableCourses(
  courses: AdmissionCourse[],
  organization: string,
  post: string,
): AdmissionCourse[] {
  return courses.filter(
    (c) =>
      c.active !== false &&
      (!c.organization || c.organization === organization) &&
      (!c.post || c.post === post),
  );
}
