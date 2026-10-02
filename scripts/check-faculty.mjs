// Read-only: inspect the live `faculty` collection (public read).
import { initializeApp } from "firebase/app";
import { getFirestore, collection, getDocs, query, orderBy } from "firebase/firestore";

const app = initializeApp({
  apiKey: "AIzaSyC5eZvLkCskpmgeAYBmAPmtOeL_0UsuiMA",
  authDomain: "starcoachinginstitutenepal.firebaseapp.com",
  projectId: "starcoachinginstitutenepal",
});
const db = getFirestore(app);

const snap = await getDocs(query(collection(db, "faculty")));
console.log(`faculty: ${snap.size} docs`);
for (const d of snap.docs) {
  const x = d.data();
  console.log(
    `  ${d.id} | order=${x.order ?? "—"} | ${x.name} | ${x.subject || x.role} | photo=${x.photoUrl ? (String(x.photoUrl).startsWith("data:") ? `inline(${String(x.photoUrl).length} chars)` : String(x.photoUrl).slice(0, 60)) : "NONE"}`,
  );
}
process.exit(0);
