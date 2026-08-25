import { initializeApp } from "firebase/app";
import { getFirestore, doc, setDoc, getDocs, collection } from "firebase/firestore";
import { getAuth, signInWithEmailAndPassword } from "firebase/auth";

const app = initializeApp({
  apiKey: "AIzaSyC5eZvLkCskpmgeAYBmAPmtOeL_0UsuiMA",
  authDomain: "starcoachinginstitutenepal.firebaseapp.com",
  projectId: "starcoachinginstitutenepal",
});
const db = getFirestore(app);
const auth = getAuth(app);

async function seedIfEmpty(name, docs) {
  const snap = await getDocs(collection(db, name));
  if (!snap.empty) {
    console.log(`${name}: already has ${snap.size} docs — skipping`);
    return;
  }
  let i = 1;
  for (const [id, data] of docs) {
    await setDoc(doc(db, name, id), { ...data, order: i });
    i++;
  }
  console.log(`${name}: ${docs.length} seeded`);
}

async function main() {
  await signInWithEmailAndPassword(auth, "super_admin@demo.starcoaching.edu.np", "Demo@2026!");
  console.log("Signed in");

  await seedIfEmpty("homepage_stats", [
    ["stat-1", { value: "5,000+", label: "Students Trained" }],
    ["stat-2", { value: "800+", label: "Top Selections" }],
    ["stat-3", { value: "40%", label: "Super 40 Scholarship" }],
    ["stat-4", { value: "10+", label: "Years of Trust" }],
  ]);

  await seedIfEmpty("homepage_categories", [
    [
      "cat-1",
      {
        icon: "ShieldCheck",
        title: "Security Forces",
        desc: "Nepal Police · Army · Armed Police",
        color: "bg-blue-50 text-navy",
      },
    ],
    [
      "cat-2",
      {
        icon: "Award",
        title: "Loksewa Aayog",
        desc: "Kharidar · Na.Su. · Officer",
        color: "bg-red-50 text-brand-red",
      },
    ],
    [
      "cat-3",
      {
        icon: "Stethoscope",
        title: "Medical & Nursing",
        desc: "Staff Nurse · HA · CMA / ANM",
        color: "bg-emerald-50 text-emerald-700",
      },
    ],
    [
      "cat-4",
      {
        icon: "Wrench",
        title: "Engineering Diploma",
        desc: "Civil · Mechanical · IT · Electrical",
        color: "bg-amber-50 text-amber-700",
      },
    ],
    [
      "cat-5",
      {
        icon: "Monitor",
        title: "Computer Training",
        desc: "Office · AutoCAD · C++",
        color: "bg-indigo-50 text-indigo-700",
      },
    ],
    [
      "cat-6",
      {
        icon: "BookOpen",
        title: "SEE Preparation",
        desc: "Class 8-10 All Subjects",
        color: "bg-purple-50 text-purple-700",
      },
    ],
  ]);

  await seedIfEmpty("homepage_testimonials", [
    [
      "test-1",
      {
        quote:
          "Star Coaching bata padhai garepachhi Nepal Police ma selection bhayo. Physical ra written dubai ma detailed guidance milyo.",
        name: "Dipesh Sahani",
        result: "Nepal Police",
      },
    ],
    [
      "test-2",
      {
        quote:
          "Staff Nurse entrance ko mock test bahut helpful thiyo. Faculty haru le prashna kasari solve garne bhaneko sikhaunu bhayo.",
        name: "Archana Yadav",
        result: "Staff Nurse — Province Topper",
      },
    ],
    [
      "test-3",
      {
        quote:
          "Engineering diploma ko preparation ma syllabus complete garaidiyo. Er. Bablu sir ko guidance le confidence badhyo.",
        name: "Sachin Yadav",
        result: "Civil Engineering — Province Topper",
      },
    ],
  ]);
}

main()
  .then(() => process.exit(0))
  .catch((e) => {
    console.error(e);
    process.exit(1);
  });
