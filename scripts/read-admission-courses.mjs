import { initializeApp } from "firebase/app";
import { getFirestore, collection, getDocs } from "firebase/firestore";

const app = initializeApp({
  apiKey: "AIzaSyC5eZvLkCskpmgeAYBmAPmtOeL_0UsuiMA",
  authDomain: "starcoachinginstitutenepal.firebaseapp.com",
  projectId: "starcoachinginstitutenepal",
});

const db = getFirestore(app);

const snap = await getDocs(collection(db, "admission_courses"));
console.log(`admission_courses docs: ${snap.size}`);
snap.docs.forEach((d) => {
  const c = d.data();
  console.log("-", d.id, {
    name: c.name,
    post: c.post,
    organization: c.organization,
    active: c.active,
    packages: (c.packages ?? []).map(
      (p) =>
        `${p.name}[${p.duration}] adm=${p.admissionFee} tuition=${p.tuitionFee} exam=${p.examFee} phys=${p.physicalFee} add=${p.additionalFee} total=${p.totalFee} active=${p.active}`,
    ),
  });
});
