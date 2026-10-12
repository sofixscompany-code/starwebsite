/**
 * Sync Firestore `admission_courses` with the official fee document
 * "all फी २०८३-२०८४.pdf" (session २०८३/२०८४).
 *
 * Data mirrors src/lib/admission-form/defaults.ts — keep both in sync.
 * Usage: node scripts/sync-admission-courses.mjs
 */
import { readFileSync } from "node:fs";
import { initializeApp } from "firebase/app";
import { getAuth, signInWithEmailAndPassword } from "firebase/auth";
import { getFirestore, collection, getDocs, doc, setDoc, writeBatch } from "firebase/firestore";

/* ── Firebase config from .env ── */
const env = Object.fromEntries(
  readFileSync(new URL("../.env", import.meta.url), "utf8")
    .split(/\r?\n/)
    .filter((l) => l.includes("=") && !l.startsWith("#"))
    .map((l) => {
      const i = l.indexOf("=");
      return [l.slice(0, i).trim(), l.slice(i + 1).trim()];
    }),
);
const app = initializeApp({
  apiKey: env.VITE_FIREBASE_API_KEY,
  authDomain: env.VITE_FIREBASE_AUTH_DOMAIN,
  projectId: env.VITE_FIREBASE_PROJECT_ID,
  storageBucket: env.VITE_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: env.VITE_FIREBASE_MESSAGING_SENDER_ID,
  appId: env.VITE_FIREBASE_APP_ID,
});
const auth = getAuth(app);
const db = getFirestore(app);

/* ── Same helpers/data as defaults.ts ── */
const total = (p) =>
  p.admissionFee + p.tuitionFee + p.examFee + p.physicalFee + (p.additionalFee ?? 0);

const pkg = (id, name, duration, fees) => {
  const base = { ...fees, additionalFee: fees.additionalFee ?? 0 };
  return { id, name, duration, ...base, totalFee: total(base), active: true };
};

const TABLE_A = {
  threeMonth: { admissionFee: 1000, tuitionFee: 7500, examFee: 3500, physicalFee: 4500 },
  yearly: { admissionFee: 1000, tuitionFee: 22500, examFee: 6500, physicalFee: 13500 },
};
const TABLE_B = {
  threeMonth: { admissionFee: 1000, tuitionFee: 12500, examFee: 2500, physicalFee: 4500 },
  yearly: { admissionFee: 1000, tuitionFee: 25500, examFee: 7500, physicalFee: 13500 },
};
const TABLE_C = {
  threeMonth: { admissionFee: 1000, tuitionFee: 16500, examFee: 3500, physicalFee: 4500 },
  yearly: { admissionFee: 1000, tuitionFee: 35500, examFee: 7500, physicalFee: 13500 },
};
const TABLE_D = {
  elig10: { admissionFee: 1000, tuitionFee: 13000, examFee: 2500, physicalFee: 0 },
  elig12: { admissionFee: 1000, tuitionFee: 16500, examFee: 3500, physicalFee: 0 },
};

const pkgs3 = (p) => [
  pkg(`pkg-${p}-3m`, "Course Complete 3 Month", "3 Month", TABLE_C.threeMonth),
  pkg(`pkg-${p}-1y`, "Yearly", "1 Year", TABLE_C.yearly),
];

const SCHOOL_NOTE =
  "विद्यालय कोर्स — सम्पूर्ण कोर्स (५ वटा विषयहरू मात्र) • अंग्रेजी र नेपाली दुवै माध्यम • पढाई शुल्क किस्ताबन्दी: ६०% + ३०% + १०%";

const schoolCourse = (id, name, tuitionFee, examFee) => ({
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

const lokesewaCourse = (id, post, fees) => ({
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

const teacherCourse = (id, name, ayog, license) =>
  pkg(`pkg-tsc-${id}`, name, "३ महिना", {
    admissionFee: 0,
    tuitionFee: ayog,
    examFee: 0,
    physicalFee: 0,
    additionalFee: license,
  });

const DEFAULT_ADMISSION_COURSES = [
  {
    id: "course-inspector",
    organization: "",
    post: "Inspector",
    name: "वनरक्षक (Forest Guard) Preparation Course",
    description: "वनरक्षकको शुल्क - २०८३/२०८४",
    duration: "3 Month / 1 Year",
    active: true,
    packages: [
      pkg("pkg-a-3m", "Course Complete 3 Month", "3 Month", TABLE_A.threeMonth),
      pkg("pkg-a-1y", "Yearly", "1 Year", TABLE_A.yearly),
    ],
  },
  {
    id: "course-asi",
    organization: "",
    post: "Sub-Inspector (ASI)",
    name: "Sub-Inspector (ASI) Preparation Course",
    description: "सहायक निरीक्षक (असइ) शुल्क विवरण - २०८३/२०८४",
    duration: "3 Month / 1 Year",
    active: true,
    packages: pkgs3("c"),
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
    packages: [
      pkg("pkg-b-3m", "Course Complete 3 Month", "3 Month", TABLE_B.threeMonth),
      pkg("pkg-b-1y", "Yearly", "1 Year", TABLE_B.yearly),
    ],
  },
  {
    id: "course-research-assistant",
    organization: "",
    post: "Research Assistant",
    name: "राष्ट्रिय अनुसन्धान सहायक/सूचक (Research Assistant) Preparation Course",
    description: "राष्ट्रिय अनुसन्धान सहायक र सूचक पदको शुल्क - २०८३/२०८४",
    duration: "Complete Course",
    active: true,
    packages: [
      pkg("pkg-d-10", "योग्यता: १० उत्तीर्ण — Complete Course", "Complete Course", TABLE_D.elig10),
      pkg("pkg-d-12", "योग्यता: १२ उत्तीर्ण — Complete Course", "Complete Course", TABLE_D.elig12),
    ],
  },

  schoolCourse("school-class-9-10", "कक्षा ९ र कक्षा १० (Nepal Board)", 26000, 3500),
  schoolCourse("school-class-6-8", "कक्षा ६, ७ र ८ (Nepal Board)", 20500, 3000),
  schoolCourse("school-class-3-5", "कक्षा ३, ४ र ५ (Nepal Board)", 15500, 3000),
  schoolCourse("school-class-1-2", "कक्षा १ र २ (Nepal Board)", 12500, 2000),
  schoolCourse("school-pg-ukg", "PG to UKG (किन्डरगार्टन)", 11500, 1000),

  lokesewaCourse("lokesewa-adhikrit", "अधिकृत", [10500, 8500, 8500]),
  lokesewaCourse("lokesewa-nayab-subba", "नायब सुब्बा", [6000, 6500, 6500]),
  lokesewaCourse("lokesewa-kharidar", "खरीदार", [6000, 6500, 6500]),

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

/* ── Run ── */
await signInWithEmailAndPassword(auth, "super_admin@demo.starcoaching.edu.np", "Star#Demo2026!Kx7");

const existing = await getDocs(collection(db, "admission_courses"));
const created = new Map(existing.docs.map((d) => [d.id, d.data().createdAt ?? null]));
const extra = existing.docs.filter((d) => !DEFAULT_ADMISSION_COURSES.some((c) => c.id === d.id));

const batch = writeBatch(db);
const now = Date.now();
for (const c of DEFAULT_ADMISSION_COURSES) {
  batch.set(doc(db, "admission_courses", c.id), {
    ...c,
    createdAt: created.get(c.id) ?? now,
    updatedAt: now,
  });
}
await batch.commit();

console.log(`✅ admission_courses synced: ${DEFAULT_ADMISSION_COURSES.length} docs written.`);
console.log(
  `   updated: ${existing.size - extra.length}, created: ${DEFAULT_ADMISSION_COURSES.length - (existing.size - extra.length)}`,
);
if (extra.length)
  console.log(`   ⚠️ not in defaults (left untouched): ${extra.map((d) => d.id).join(", ")}`);
process.exit(0);
