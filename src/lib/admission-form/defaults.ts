import type { AdmissionCourse, AdmissionCoursePackage } from "./types";

/**
 * DEFAULT / INITIAL pricing configuration.
 *
 * Transcribed from the institute's printed fee tables (reference image 3):
 *   Table A — दनरक्षकको शुल्क - २०२३/२०२४   : 3-Month Rs.16,500 / 1-Year Rs.43,500
 *   Table B — नेपाल प्रहरी / सशस्त्र प्रहरी / वनको सेवा, जवान पद मुलुक - २०८२/२०८३
 *                                                : 3-Month Rs.20,500 / 1-Year Rs.47,500
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

const PACKAGES_TABLE_A = () => [
  pkg("pkg-a-3m", "Course Complete 3 Month", "3 Month", TABLE_A.threeMonth),
  pkg("pkg-a-1y", "Yearly", "1 Year", TABLE_A.yearly),
];

const PACKAGES_TABLE_B = () => [
  pkg("pkg-b-3m", "Course Complete 3 Month", "3 Month", TABLE_B.threeMonth),
  pkg("pkg-b-1y", "Yearly", "1 Year", TABLE_B.yearly),
];

export const DEFAULT_ADMISSION_COURSES: AdmissionCourse[] = [
  {
    id: "course-inspector",
    organization: "",
    post: "Inspector",
    name: "Inspector Preparation Course",
    description: "दनरक्षकको शुल्क - २०२३/२०२४",
    duration: "3 Month / 1 Year",
    active: true,
    packages: PACKAGES_TABLE_A(),
  },
  {
    id: "course-asi",
    organization: "",
    post: "Sub-Inspector (ASI)",
    name: "Sub-Inspector (ASI) Preparation Course",
    description: "दनरक्षकको शुल्क - २०२३/२०२४",
    duration: "3 Month / 1 Year",
    active: true,
    packages: PACKAGES_TABLE_A(),
  },
  {
    id: "course-jawan",
    organization: "",
    post: "Jawan",
    name: "Jawan Preparation Course",
    description: "नेपाल प्रहरी / सशस्त्र प्रहरी / वनको सेवा, जवान पद मुलुक - २०८२/२०८३",
    duration: "3 Month / 1 Year",
    active: true,
    packages: PACKAGES_TABLE_B(),
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
