import { initializeApp } from "firebase/app";
import { getFirestore, collection, getDocs, doc, updateDoc } from "firebase/firestore";
import { getAuth, signInWithEmailAndPassword } from "firebase/auth";

const app = initializeApp({
  apiKey: "AIzaSyC5eZvLkCskpmgeAYBmAPmtOeL_0UsuiMA",
  authDomain: "starcoachinginstitutenepal.firebaseapp.com",
  projectId: "starcoachinginstitutenepal",
});
const db = getFirestore(app);
const auth = getAuth(app);

const CATEGORY_BY_TITLE = {
  "np mock test": "Exam",
  scholarship: "Scholarship",
  "batch starting": "Admission",
  "fee payment": "Fees",
};

function pick(title) {
  const t = title.toLowerCase();
  for (const [key, cat] of Object.entries(CATEGORY_BY_TITLE)) {
    if (t.includes(key)) return cat;
  }
  return "General";
}

async function main() {
  await signInWithEmailAndPassword(
    auth,
    "super_admin@demo.starcoaching.edu.np",
    "Star#Demo2026!Kx7",
  );
  const snap = await getDocs(collection(db, "notices"));
  let patched = 0;
  for (const d of snap.docs) {
    if (!d.data().category) {
      await updateDoc(doc(db, "notices", d.id), { category: pick(d.data().title ?? "") });
      patched++;
      console.log(`patched: ${d.data().title} -> ${pick(d.data().title ?? "")}`);
    }
  }
  console.log(`done, ${patched} patched`);
}

main()
  .then(() => process.exit(0))
  .catch((e) => {
    console.error(e);
    process.exit(1);
  });
