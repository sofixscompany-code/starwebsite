// One-off: remove the "Super 40 Scholarship — up to 40% off" promotion from
// LIVE site content (owner request). Deletes matching docs from:
//   why_choose_us  — the "Super 40 Scholarship — up to 40% off" bullet
//   homepage_stats — the "40% / Super 40 Scholarship" stat
//   hero_slides    — any Super 40 / 40% fee-waiver hero slide
// Idempotent: prints what it (would) delete; safe to re-run.
import { initializeApp } from "firebase/app";
import { getFirestore, collection, getDocs, doc, deleteDoc } from "firebase/firestore";
import { getAuth, signInWithEmailAndPassword } from "firebase/auth";

const app = initializeApp({
  apiKey: "AIzaSyC5eZvLkCskpmgeAYBmAPmtOeL_0UsuiMA",
  authDomain: "starcoachinginstitutenepal.firebaseapp.com",
  projectId: "starcoachinginstitutenepal",
});
const db = getFirestore(app);
const auth = getAuth(app);

const SUPER40 = /super\s*40|40%\s*(off|fee waiver)|up to 40%/i;
const match = (v) => typeof v === "string" && SUPER40.test(v);

async function sweep(collectionName, fields) {
  const snap = await getDocs(collection(db, collectionName));
  let removed = 0;
  for (const d of snap.docs) {
    const data = d.data();
    const hit = fields.some((f) => match(data?.[f]));
    if (hit) {
      const preview = fields.map((f) => String(data?.[f] ?? "")).find((v) => match(v)) || "";
      console.log(`  deleting ${collectionName}/${d.id} → "${preview.slice(0, 70)}"`);
      await deleteDoc(doc(db, collectionName, d.id));
      removed++;
    }
  }
  console.log(`${collectionName}: ${snap.size} docs scanned, ${removed} deleted`);
}

async function main() {
  await signInWithEmailAndPassword(
    auth,
    "super_admin@demo.starcoaching.edu.np",
    "Star#Demo2026!Kx7",
  );
  console.log("Signed in as super_admin — sweeping Super 40 promotion…");

  await sweep("why_choose_us", ["text"]);
  await sweep("homepage_stats", ["label", "value"]);
  await sweep("hero_slides", ["kicker", "title", "subtitle", "description"]);

  console.log("DONE");
}

main()
  .then(() => process.exit(0))
  .catch((e) => {
    console.error("FAILED:", e.message);
    process.exit(1);
  });
