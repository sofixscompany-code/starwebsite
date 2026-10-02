import { initializeApp } from "firebase/app";
import {
  getFirestore,
  collection,
  getDocs,
  addDoc,
  doc,
  deleteDoc,
  query,
  orderBy,
} from "firebase/firestore";
import { getAuth, signInWithEmailAndPassword } from "firebase/auth";

const app = initializeApp({
  apiKey: "AIzaSyC5eZvLkCskpmgeAYBmAPmtOeL_0UsuiMA",
  authDomain: "starcoachinginstitutenepal.firebaseapp.com",
  projectId: "starcoachinginstitutenepal",
});
const db = getFirestore(app);
const auth = getAuth(app);

const now = Date.now();
const iso = (offsetMs = 0) => new Date(now + offsetMs).toISOString();
const D = 86400000;

async function seed(name, docs) {
  const snap = await getDocs(collection(db, name));
  if (snap.size > 0) {
    console.log(`${name}: already has ${snap.size} docs — skipping seed`);
    return;
  }
  for (const d of docs) {
    await addDoc(collection(db, name), { ...d, createdAt: d.createdAt || iso() });
  }
  console.log(`${name}: ${docs.length} seeded`);
}

async function dedupeNotices() {
  const snap = await getDocs(query(collection(db, "notices"), orderBy("createdAt", "asc")));
  const seen = new Set();
  let removed = 0;
  for (const d of snap.docs) {
    const title = String(d.data().title || "");
    if (seen.has(title)) {
      await deleteDoc(doc(db, "notices", d.id));
      removed++;
    } else {
      seen.add(title);
    }
  }
  console.log(`notices: deduped ${removed} duplicate(s), kept ${seen.size}`);
}

async function main() {
  await signInWithEmailAndPassword(
    auth,
    "super_admin@demo.starcoaching.edu.np",
    "Star#Demo2026!Kx7",
  );
  console.log("Signed in");

  await dedupeNotices();

  await seed(
    "lms_courses",
    [
      ["Nepal Police Preparation", "nepal-police", "Public Service", 3, 18000, 12, true],
      ["Loksewa Officer Prep", "loksewa-officer", "Public Service", 6, 25000, 18, true],
      ["APF Constable Training", "apf-constable", "Armed Police", 2, 15000, 10, true],
      ["Nepal Army Preparation", "nepal-army", "Army", 3, 20000, 12, true],
      ["Bank PO Preparation", "bank-po", "Banking", 4, 22000, 14, true],
      ["Medical Entrance", "entrance-medical", "Entrance", 6, 40000, 20, true],
      ["SEE Bridge Course", "see-bridge", "Bridge Course", 2, 9000, 8, true],
      ["IOE Preparation", "ioe-prep", "Engineering", 6, 32000, 22, true],
      ["English Grammar", "english-grammar", "Language", 2, 8000, 10, true],
      ["GK & Current Affairs", "gk-current", "General", 3, 10000, 12, true],
    ].map(([title, slug, category, durationMonths, fee, totalLessons, isPublished], i) => ({
      title,
      slug,
      category,
      shortDescription: `${title} — comprehensive preparation for the relevant competitive exams at Star Coaching Institute, Nepal.`,
      level: category,
      duration: `${durationMonths} months`,
      fee,
      price: fee,
      order: i,
      totalLessons,
      isPublished,
    })),
  );

  await seed("events", [
    {
      title: "Admission Open 2083/84",
      date: "2083/04/15",
      startTime: "10:00 AM",
      location: "Institute Main Hall",
      description: "Online and physical admission counselling for the new academic session.",
      isPublished: true,
    },
    {
      title: "NP Mock Test #15",
      date: "2083/04/20",
      startTime: "8:00 AM",
      location: "Hall A",
      description: "Full-length mock test for Nepal Police preparation.",
      isPublished: true,
    },
    {
      title: "Parent-Teacher Meeting",
      date: "2083/05/01",
      startTime: "11:00 AM",
      location: "Conference Room",
      description: "Quarterly progress review with parents.",
      isPublished: true,
    },
    {
      title: "Scholarship Exam",
      date: "2083/05/10",
      startTime: "9:00 AM",
      location: "Hall B",
      description: "Merit scholarship selection examination.",
      isPublished: true,
    },
  ]);

  await seed("blogs", [
    {
      title: "Tips for Nepal Police Exam 2083",
      body: "Focused preparation strategy covering GK, math and physical readiness.",
      author: "Star Coaching",
      date: "2083/03/20",
      isPublished: true,
    },
    {
      title: "How to Prepare for Loksewa",
      body: "A structured roadmap for Section Officer and Nayab Subba exams.",
      author: "Star Coaching",
      date: "2083/02/10",
      isPublished: true,
    },
  ]);

  await seed("fee_structure", [
    {
      planName: "Police – Full",
      program: "Police",
      admissionFee: 2500,
      monthlyFee: 4000,
      totalAmount: 14500,
      status: "Active",
    },
    {
      planName: "Loksewa – Full",
      program: "Loksewa",
      admissionFee: 3000,
      monthlyFee: 5500,
      totalAmount: 36000,
      status: "Active",
    },
    {
      planName: "APF – Full",
      program: "Army",
      admissionFee: 2000,
      monthlyFee: 3500,
      totalAmount: 9000,
      status: "Active",
    },
    {
      planName: "Bank PO – Full",
      program: "Banking",
      admissionFee: 2500,
      monthlyFee: 4500,
      totalAmount: 20500,
      status: "Active",
    },
    {
      planName: "Medical – Full",
      program: "Medical",
      admissionFee: 5000,
      monthlyFee: 8000,
      totalAmount: 53000,
      status: "Active",
    },
    {
      planName: "SEE Bridge",
      program: "Bridge",
      admissionFee: 1000,
      monthlyFee: 2500,
      totalAmount: 6000,
      status: "Active",
    },
  ]);

  await seed("courses", [
    {
      title: "Nepal Police Preparation",
      category: "Public Service",
      fee: 18000,
      duration: "3 months",
      isPublished: true,
    },
    {
      title: "Loksewa Officer Prep",
      category: "Public Service",
      fee: 25000,
      duration: "6 months",
      isPublished: true,
    },
  ]);

  await seed("faculty", [
    {
      name: "Suraj Pandit",
      role: "Senior Faculty",
      subject: "Veterinary Science",
      initials: "SP",
      order: 1,
    },
    {
      name: "Ramesh Yadav",
      role: "Senior Faculty",
      subject: "Staff Nurse / HA",
      initials: "RY",
      order: 2,
    },
    {
      name: "Purushotam Mandal",
      role: "Faculty",
      subject: "Electrical Engineering",
      initials: "PM",
      order: 3,
    },
    {
      name: "Chandan Thakur",
      role: "Faculty",
      subject: "Electrical Engineering",
      initials: "CT",
      order: 4,
    },
    {
      name: "Rajababu Yadav",
      role: "Faculty",
      subject: "Geomatic Engineering",
      initials: "RY",
      order: 5,
    },
    { name: "Bishesh Mandal", role: "Faculty", subject: "Agriculture", initials: "BM", order: 6 },
    {
      name: "Hare Kripal Yadav",
      role: "Faculty",
      subject: "Nepal Police Coaching",
      initials: "HY",
      order: 7,
    },
    {
      name: "Phuleshwar Pandit",
      role: "Faculty",
      subject: "Nepal Police Physical",
      initials: "PP",
      order: 8,
    },
  ]);

  console.log("ALL DONE");
}

main()
  .then(() => process.exit(0))
  .catch((e) => {
    console.error("SEED FAILED:", e.message);
    process.exit(1);
  });
