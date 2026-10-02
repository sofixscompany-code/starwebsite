// TEMPORARY maintenance: clears prep catalog collections so the admin
// "seed defaults" button can re-create them with remapped references.
// Safe: only prep_services / prep_courses / prep_posts are touched.
import { initializeApp } from "firebase/app";
import { getFirestore, collection, getDocs, deleteDoc, doc } from "firebase/firestore";
import { getAuth, signInWithEmailAndPassword } from "firebase/auth";

const app = initializeApp({
  apiKey: "AIzaSyC5eZvLkCskpmgeAYBmAPmtOeL_0UsuiMA",
  authDomain: "starcoachinginstitutenepal.firebaseapp.com",
  projectId: "starcoachinginstitutenepal",
});

const db = getFirestore(app);
const auth = getAuth(app);

async function clear(name) {
  const snap = await getDocs(collection(db, name));
  for (const d of snap.docs) await deleteDoc(doc(db, name, d.id));
  console.log(`${name}: ${snap.docs.length} deleted`);
}

async function main() {
  await signInWithEmailAndPassword(
    auth,
    "super_admin@demo.starcoaching.edu.np",
    "Star#Demo2026!Kx7",
  );
  console.log("Signed in");
  await clear("prep_services");
  await clear("prep_courses");
  await clear("prep_posts");
}

main()
  .then(() => process.exit(0))
  .catch((e) => {
    console.error(e);
    process.exit(1);
  });
