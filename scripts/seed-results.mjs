import { initializeApp } from "firebase/app";
import { getFirestore, collection, getDocs, updateDoc, setDoc, doc } from "firebase/firestore";
import { getAuth, signInWithEmailAndPassword } from "firebase/auth";

const app = initializeApp({
  apiKey: "AIzaSyC5eZvLkCskpmgeAYBmAPmtOeL_0UsuiMA",
  authDomain: "starcoachinginstitutenepal.firebaseapp.com",
  projectId: "starcoachinginstitutenepal",
});

const db = getFirestore(app);
const auth = getAuth(app);

/* [studentName, achievement, examCategory, extra] */
const SEED_RESULTS = [
  ["Sachin Yadav", "Civil Engineering", "IOE Entrance", "Madhesh Province Topper"],
  ["Archana Yadav", "Staff Nurse", "CTEVT", "Madhesh Province Topper"],
  ["Krishna Chaurasiya", "EDF", "EDF", "Bagmati Province Topper"],
  ["Kajal Yadav", "Staff Nurse", "CTEVT", "Selected"],
  ["Sonia Rayeen", "Health Assistant", "CTEVT", "Selected"],
  ["Chandan Das", "Civil Engineering", "IOE Entrance", "Selected"],
  ["Amrita Chaudhary", "Geomatic Engineering", "IOE Entrance", "Selected"],
  ["Rahul Yadav", "Electrical", "IOE Entrance", "Selected"],
  ["Vibek Mahato", "Health Assistant", "CTEVT", "Selected"],
  ["Himesh Mandal", "Health Assistant", "CTEVT", "Selected"],
  ["Afjal Ansari", "Civil Engineering", "IOE Entrance", "Selected"],
  ["Dipesh Sahani", "Nepal Police", "Nepal Police", "Selected"],
  ["Rajiv Safi", "Nepal Police", "Nepal Police", "Selected"],
  ["Rabin Sunuwar", "Nepal Police", "Nepal Police", "Selected"],
  ["Meghnath Yadav", "Nepal Police", "Nepal Police", "Selected"],
  ["Raj Yadav", "Civil Engineering", "IOE Entrance", "Selected"],
];

function findDoc(docs, studentName) {
  return docs.find((d) => {
    const data = d.data();
    return (
      String(data.studentName ?? data.name ?? "")
        .trim()
        .toLowerCase() === studentName.trim().toLowerCase()
    );
  });
}

async function main() {
  await signInWithEmailAndPassword(
    auth,
    "super_admin@demo.starcoaching.edu.np",
    "Star#Demo2026!Kx7",
  );
  console.log("Signed in");

  const snap = await getDocs(collection(db, "selections"));
  const docs = snap.docs;

  let updated = 0;
  let added = 0;

  for (let i = 0; i < SEED_RESULTS.length; i++) {
    const [studentName, achievement, examCategory, tag] = SEED_RESULTS[i];
    const existing = findDoc(docs, studentName);

    const payload = {
      studentName,
      achievement,
      tag,
      examCategory,
      rank: "",
      batch: "2082/83",
      year: "2083",
      description: "",
      featured: tag.toLowerCase().includes("topper"),
      status: "published",
      /* legacy mirror so older readers still work */
      name: studentName,
      post: achievement,
    };

    if (existing) {
      await updateDoc(existing.ref, payload);
      updated++;
    } else {
      const order = i + 1;
      await setDoc(doc(db, "selections", `sel-${String(i + 1).padStart(2, "0")}`), {
        ...payload,
        order,
        createdAt: new Date().toISOString(),
      });
      added++;
    }
  }

  console.log(`selections: ${updated} updated in place, ${added} added`);
  console.log("ALL DONE");
}

main()
  .then(() => process.exit(0))
  .catch((e) => {
    console.error("SEED FAILED:", e.message);
    process.exit(1);
  });
