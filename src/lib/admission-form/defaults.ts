import type { AdmissionCourse, AdmissionCoursePackage } from "./types";

/**
 * DEFAULT / INITIAL pricing configuration.
 *
 * Transcribed from the institute's official printed fee document
 * "all फी २०८३-२०८४.pdf" (academic session २०८३/२०८४):
 *   Table A — वनरक्षकको शुल्क - २०८३/२०८४            : 3-Month Rs.16,500 / 1-Year Rs.43,500
 *   Table B — नेपाल प्रहरी / सशस्त्र प्रहरी / सेना, जवान : 3-Month Rs.20,500 / 1-Year Rs.47,500
 *   Table C — सहायक निरीक्षक (ASI)                     : 3-Month Rs.25,500 / 1-Year Rs.57,500
 *   Table D — राष्ट्रिय अनुसन्धान सहायक र सूचक        : Rs.16,500 (१० उत्तीर्ण) / Rs.21,000 (१२ उत्तीर्ण)
 *
 * The same document also lists the enquiry-only programmes (flagged
 * `enquiryOnly` so the security-forces admission form never shows them):
 * विद्यालय कक्षा १-१० / PG-UKG, लोकसेवा आयोग (अधिकृत/नायब सुब्बा/खरीदार),
 * शिक्षक सेवा आयोग, स्वास्थ्य सेवा, बैंक सेवा, संस्थागत पद
 * (विद्युत/नेपाल टेलिकम/वायु सेवा/कम्प्युटर अपरेटर) र होस्टेल (रु.८,५००/महिना)।
 *
 * कक्षा १ र २: the printed sheet shows Tuition Rs.12,500 + Exam "Rs.25,00"
 * with Total Rs.15,500 (which only adds up with Exam Rs.2,000 — owner
 * confirmed Exam is Rs.2,000, so the payable Total stays Rs.15,500).
 *
 * ADMISSION FEE IS Rs.1,000 IN EVERY SECURITY STRUCTURE (owner instruction).
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
  fees: {
    admissionFee: number;
    tuitionFee: number;
    examFee: number;
    physicalFee: number;
    additionalFee?: number;
  },
): AdmissionCoursePackage {
  const base = { ...fees, additionalFee: fees.additionalFee ?? 0 };
  return { id, name, duration, ...base, totalFee: packageTotal(base), active: true };
}

/** Table A — वनरक्षक (Rs. 16,500 / Rs. 43,500). */
const TABLE_A = {
  threeMonth: { admissionFee: 1000, tuitionFee: 7500, examFee: 3500, physicalFee: 4500 },
  yearly: { admissionFee: 1000, tuitionFee: 22500, examFee: 6500, physicalFee: 13500 },
};

/** Table B — जवान, प्रहरी/सशस्त्र/सेना (Rs. 20,500 / Rs. 47,500). */
const TABLE_B = {
  threeMonth: { admissionFee: 1000, tuitionFee: 12500, examFee: 2500, physicalFee: 4500 },
  yearly: { admissionFee: 1000, tuitionFee: 25500, examFee: 7500, physicalFee: 13500 },
};

/** Table C — असइ (ASI) (Rs. 25,500 / Rs. 57,500). */
const TABLE_C = {
  threeMonth: { admissionFee: 1000, tuitionFee: 16500, examFee: 3500, physicalFee: 4500 },
  yearly: { admissionFee: 1000, tuitionFee: 35500, examFee: 7500, physicalFee: 13500 },
};

/** Table D — राष्ट्रिय अनुसन्धान सहायक/सूचक (Rs. 16,500 / Rs. 21,000). */
const TABLE_D = {
  elig10: { admissionFee: 1000, tuitionFee: 13000, examFee: 2500, physicalFee: 0 },
  elig12: { admissionFee: 1000, tuitionFee: 16500, examFee: 3500, physicalFee: 0 },
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
  pkg("pkg-d-10", "योग्यता: १० उत्तीर्ण — Complete Course", "Complete Course", TABLE_D.elig10),
  pkg("pkg-d-12", "योग्यता: १२ उत्तीर्ण — Complete Course", "Complete Course", TABLE_D.elig12),
];

/** विद्यालय तर्फ — Nepal Board, ५ वटा विषयहरू मात्र (२०८३/२०८४). */
const SCHOOL_NOTE =
  "विद्यालय कोर्स — सम्पूर्ण कोर्स (५ वटा विषयहरू मात्र) • अंग्रेजी र नेपाली दुवै माध्यम • पढाई शुल्क किस्ताबन्दी: ६०% + ३०% + १०%";

const schoolCourse = (
  id: string,
  name: string,
  tuitionFee: number,
  examFee: number,
): AdmissionCourse => ({
  id,
  organization: "",
  post: "",
  enquiryOnly: true,
  name,
  description: SCHOOL_NOTE,
  duration: "१ वर्ष (Annual)",
  active: true,
  packages: [
    pkg(`pkg-${id}`, "सम्पूर्ण कोर्स", "१ वर्ष", {
      admissionFee: 1000,
      tuitionFee,
      examFee,
      physicalFee: 0,
    }),
  ],
});

/** लोकसेवा आयोग — per-paper fees (प्रथम/द्वितीय/तृतीय पत्र). */
const lokesewaCourse = (
  id: string,
  post: string,
  fees: [number, number, number],
): AdmissionCourse => ({
  id,
  organization: "",
  post: "",
  enquiryOnly: true,
  name: `लोकसेवा आयोग — ${post}`,
  description: "लोकसेवा आयोग तयारी — प्रत्येक पत्रको शुल्क",
  duration: "प्रति पत्र",
  active: true,
  packages: [
    pkg(`pkg-${id}-1`, "प्रथम पत्र (1st Paper)", "प्रति पत्र", {
      admissionFee: 0,
      tuitionFee: fees[0],
      examFee: 0,
      physicalFee: 0,
    }),
    pkg(`pkg-${id}-2`, "द्वितीय पत्र (2nd Paper)", "प्रति पत्र", {
      admissionFee: 0,
      tuitionFee: fees[1],
      examFee: 0,
      physicalFee: 0,
    }),
    pkg(`pkg-${id}-3`, "तृतीय पत्र (3rd Paper)", "प्रति पत्र", {
      admissionFee: 0,
      tuitionFee: fees[2],
      examFee: 0,
      physicalFee: 0,
    }),
  ],
});

/** शिक्षक सेवा आयोग — आयोग + लाइसेन्स, समय अवधि ३ महिना. */
const teacherCourse = (
  id: string,
  name: string,
  ayog: number,
  license: number,
): AdmissionCoursePackage =>
  pkg(`pkg-tsc-${id}`, name, "३ महिना", {
    admissionFee: 0,
    tuitionFee: ayog,
    examFee: 0,
    physicalFee: 0,
    additionalFee: license,
  });

export const DEFAULT_ADMISSION_COURSES: AdmissionCourse[] = [
  /* ── सुरक्षा निकाय — admission-form courses (Police / APF / Army) ── */
  {
    id: "course-inspector",
    organization: "",
    post: "Inspector",
    name: "वनरक्षक (Forest Guard) Preparation Course",
    description: "वनरक्षकको शुल्क - २०८३/२०८४",
    duration: "3 Month / 1 Year",
    active: true,
    packages: PACKAGES_TABLE_A(),
  },
  {
    id: "course-asi",
    organization: "",
    post: "Sub-Inspector (ASI)",
    name: "Sub-Inspector (ASI) Preparation Course",
    description: "सहायक निरीक्षक (असइ) शुल्क विवरण - २०८३/२०८४",
    duration: "3 Month / 1 Year",
    active: true,
    packages: PACKAGES_TABLE_C(),
  },
  {
    id: "course-jawan",
    organization: "",
    post: "Jawan",
    name: "Jawan Preparation Course",
    description:
      "नेपाल प्रहरी / सशस्त्र प्रहरी / नेपाली सेना — जवान तथा सैन्य पद शुल्क विवरण (२०८३/२०८४)",
    duration: "3 Month / 1 Year",
    active: true,
    packages: PACKAGES_TABLE_B(),
  },
  {
    id: "course-research-assistant",
    organization: "",
    post: "Research Assistant",
    name: "राष्ट्रिय अनुसन्धान सहायक/सूचक (Research Assistant) Preparation Course",
    description: "राष्ट्रिय अनुसन्धान सहायक र सूचक पदको शुल्क - २०८३/२०८४",
    duration: "Complete Course",
    active: true,
    packages: PACKAGES_TABLE_D(),
  },

  /* ── विद्यालय तर्फ (enquiry-only) ── */
  schoolCourse("school-class-9-10", "कक्षा ९ र कक्षा १० (Nepal Board)", 26000, 3500),
  schoolCourse("school-class-6-8", "कक्षा ६, ७ र ८ (Nepal Board)", 20500, 3000),
  schoolCourse("school-class-3-5", "कक्षा ३, ४ र ५ (Nepal Board)", 15500, 3000),
  schoolCourse("school-class-1-2", "कक्षा १ र २ (Nepal Board)", 12500, 2000),
  schoolCourse("school-pg-ukg", "PG to UKG (किन्डरगार्टन)", 11500, 1000),

  /* ── लोकसेवा आयोग (enquiry-only) ── */
  lokesewaCourse("lokesewa-adhikrit", "अधिकृत", [10500, 8500, 8500]),
  lokesewaCourse("lokesewa-nayab-subba", "नायब सुब्बा", [6000, 6500, 6500]),
  lokesewaCourse("lokesewa-kharidar", "खरीदार", [6000, 6500, 6500]),

  /* ── शिक्षक सेवा आयोग (enquiry-only) ── */
  {
    id: "shikshak-sewa-ayog",
    organization: "",
    post: "",
    enquiryOnly: true,
    name: "शिक्षक सेवा आयोग",
    description: "शिक्षक सेवा आयोग तयारी — आयोग + लाइसेन्स शुल्क, समय अवधि ३ महिना",
    duration: "३ महिना",
    active: true,
    packages: [
      teacherCourse("primary", "प्रा.शि.", 7500, 7000),
      teacherCourse("lower-secondary", "नि.मा.शि.", 7500, 7000),
      teacherCourse("secondary", "मा.शि.", 7500, 7000),
      teacherCourse("vn", "वि.नि.", 18000, 0),
      teacherCourse("ps", "प्रा.स.", 15000, 0),
    ],
  },

  /* ── स्वास्थ्य सेवा (enquiry-only) ── */
  {
    id: "swasthya-sewa",
    organization: "",
    post: "",
    enquiryOnly: true,
    name: "स्वास्थ्य सेवा कोर्स",
    description: "स्वास्थ्य सेवा आयोग / लाइसेन्स शुल्क",
    duration: "Course",
    active: true,
    packages: [
      pkg("pkg-hl-cma", "C.M.A. / A.N.M. (Pre-Diploma)", "Pre-Diploma", {
        admissionFee: 0,
        tuitionFee: 13000,
        examFee: 0,
        physicalFee: 0,
      }),
      pkg("pkg-hl-ha", "H.A. / Staff Nurse (Diploma)", "Diploma", {
        admissionFee: 0,
        tuitionFee: 16000,
        examFee: 0,
        physicalFee: 0,
      }),
      pkg("pkg-hl-overseer", "Overseer / Agriculture", "Diploma", {
        admissionFee: 0,
        tuitionFee: 16000,
        examFee: 0,
        physicalFee: 0,
      }),
    ],
  },

  /* ── बैंक सेवा आयोग (enquiry-only) ── */
  {
    id: "bank-sewa-ayog",
    organization: "",
    post: "",
    enquiryOnly: true,
    name: "बैंक सेवा आयोग कोर्स",
    description: "वाणिज्य बैंक / कृषि विकास बैंक / नेपाल बैंक / नेपाल राष्ट्रिय बैंक",
    duration: "Course",
    active: true,
    packages: [
      pkg("pkg-bank", "बैंक भर्ना तयारी", "Course", {
        admissionFee: 0,
        tuitionFee: 10500,
        examFee: 0,
        physicalFee: 0,
      }),
    ],
  },

  /* ── संस्थागत पद (enquiry-only) ── */
  {
    id: "sanstha-sewa",
    organization: "",
    post: "",
    enquiryOnly: true,
    name: "संस्थागत सेवा कोर्स",
    description: "विद्युत / नेपाल टेलिकम / नेपाल वायु सेवा / कम्प्युटर अपरेटर",
    duration: "Course",
    active: true,
    packages: [
      pkg("pkg-institutional", "संस्था भर्ना तयारी", "Course", {
        admissionFee: 0,
        tuitionFee: 10500,
        examFee: 0,
        physicalFee: 0,
      }),
    ],
  },

  /* ── होस्टेल (enquiry-only) ── */
  {
    id: "hostel",
    organization: "",
    post: "",
    enquiryOnly: true,
    name: "होस्टेल (खाना + बास)",
    description: "होस्टेल शुल्क संरचना — खाना र बास सबै मिलाएर, प्रति महिना",
    duration: "प्रति महिना",
    active: true,
    packages: [
      pkg("pkg-hostel", "प्रति महिना", "प्रति महिना", {
        admissionFee: 0,
        tuitionFee: 8500,
        examFee: 0,
        physicalFee: 0,
      }),
    ],
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
      !c.enquiryOnly &&
      (!c.organization || c.organization === organization) &&
      (!c.post || c.post === post),
  );
}
