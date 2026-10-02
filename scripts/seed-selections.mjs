import { initializeApp } from "firebase/app";
import { getFirestore, collection, doc, setDoc, getDocs } from "firebase/firestore";
import { getAuth, signInWithEmailAndPassword } from "firebase/auth";

const app = initializeApp({
  apiKey: "AIzaSyC5eZvLkCskpmgeAYBmAPmtOeL_0UsuiMA",
  authDomain: "starcoachinginstitutenepal.firebaseapp.com",
  projectId: "starcoachinginstitutenepal",
});

const db = getFirestore(app);
const auth = getAuth(app);

const SELECTIONS = [
  ["Sachin Yadav", "Civil Engineering", "Madhesh Province Topper"],
  ["Archana Yadav", "Staff Nurse", "Madhesh Province Topper"],
  ["Krishna Chaurasiya", "EDF", "Bagmati Province Topper"],
  ["Kajal Yadav", "Staff Nurse", "Selected"],
  ["Sonia Rayeen", "Health Assistant", "Selected"],
  ["Chandan Das", "Civil Engineering", "Selected"],
  ["Amrita Chaudhary", "Geomatic Engineering", "Selected"],
  ["Rahul Yadav", "Electrical", "Selected"],
  ["Vibek Mahato", "Health Assistant", "Selected"],
  ["Himesh Mandal", "Health Assistant", "Selected"],
  ["Afjal Ansari", "Civil Engineering", "Selected"],
  ["Dipesh Sahani", "Nepal Police", "Selected"],
  ["Rajiv Safi", "Nepal Police", "Selected"],
  ["Rabin Sunuwar", "Nepal Police", "Selected"],
  ["Meghnath Yadav", "Nepal Police", "Selected"],
  ["Raj Yadav", "Civil Engineering", "Selected"],
];

async function main() {
  await signInWithEmailAndPassword(
    auth,
    "super_admin@demo.starcoaching.edu.np",
    "Star#Demo2026!Kx7",
  );
  console.log("Signed in");

  const existing = await getDocs(collection(db, "selections"));
  if (!existing.empty) {
    console.log(`selections already has ${existing.size} docs — skipping seed`);
    return;
  }

  let i = 1;
  for (const [name, post, tag] of SELECTIONS) {
    await setDoc(doc(db, "selections", `sel-${String(i).padStart(2, "0")}`), {
      name,
      post,
      tag,
      order: i,
      createdAt: new Date().toISOString(),
    });
    i++;
  }
  console.log(`selections: ${SELECTIONS.length} seeded`);
}

main()
  .then(() => process.exit(0))
  .catch((e) => {
    console.error(e);
    process.exit(1);
  });
