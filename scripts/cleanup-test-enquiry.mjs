// One-off cleanup: delete the E2E test enquiry created during verification.
import { initializeApp } from "firebase/app";
import {
  getFirestore,
  collection,
  getDocs,
  query,
  where,
  deleteDoc,
  doc,
} from "firebase/firestore";
import { getAuth, signInWithEmailAndPassword } from "firebase/auth";

const app = initializeApp({
  apiKey: "AIzaSyC5eZvLkCskpmgeAYBmAPmtOeL_0UsuiMA",
  authDomain: "starcoachinginstitutenepal.firebaseapp.com",
  projectId: "starcoachinginstitutenepal",
});
const db = getFirestore(app);
const auth = getAuth(app);

await signInWithEmailAndPassword(auth, "super_admin@demo.starcoaching.edu.np", "Star#Demo2026!Kx7");

const snap = await getDocs(
  query(collection(db, "inquiries"), where("name", "==", "Test Enquiry E2E")),
);
console.log(`test enquiries found: ${snap.size}`);
for (const d of snap.docs) {
  await deleteDoc(doc(db, "inquiries", d.id));
  console.log(`  deleted ${d.id}`);
}
console.log("DONE");
process.exit(0);
