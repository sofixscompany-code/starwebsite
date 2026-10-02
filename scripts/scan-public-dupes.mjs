// One-off READ-ONLY scan: find exact-duplicate docs in public/portal collections.
import { initializeApp } from "firebase/app";
import { getFirestore, collection, getDocs } from "firebase/firestore";
import { getAuth, signInWithEmailAndPassword } from "firebase/auth";

const app = initializeApp({
  apiKey: "AIzaSyC5eZvLkCskpmgeAYBmAPmtOeL_0UsuiMA",
  authDomain: "starcoachinginstitutenepal.firebaseapp.com",
  projectId: "starcoachinginstitutenepal",
});
const db = getFirestore(app);
const auth = getAuth(app);

const KEYS = ["title", "name", "heading", "label", "month", "value"];

async function scan(name) {
  const snap = await getDocs(collection(db, name));
  const docs = snap.docs.map((d) => ({ id: d.id, data: d.data() }));
  const seen = new Map();
  for (const d of docs) {
    const key = KEYS.map((k) => (d.data[k] == null ? "" : String(d.data[k]))).join("|");
    if (!seen.has(key)) seen.set(key, []);
    seen.get(key).push(d.id);
  }
  const dupGroups = [...seen.entries()].filter(([, ids]) => ids.length > 1);
  const dupCount = dupGroups.reduce((n, [, ids]) => n + ids.length - 1, 0);
  console.log(
    `${name}: ${docs.length} docs, ${dupGroups.length} dup group(s), ${dupCount} extra(s)` +
      (dupGroups.length
        ? ` → ${dupGroups.map(([k, ids]) => `[${k.slice(0, 60)}] x${ids.length}`).join("; ")}`
        : ""),
  );
}

async function main() {
  await signInWithEmailAndPassword(
    auth,
    "super_admin@demo.starcoaching.edu.np",
    "Star#Demo2026!Kx7",
  );
  console.log("Signed in (READ-ONLY scan)\n");
  for (const c of [
    "selections",
    "banners",
    "hero_slides",
    "courses",
    "faculty",
    "events",
    "blogs",
    "notices",
    "gallery",
    "fee_structure",
    "teacher_classes",
    "live_classes",
    "messages",
    "roles",
  ]) {
    try {
      await scan(c);
    } catch (e) {
      console.log(`${c}: ERROR ${e.message}`);
    }
  }
}

main()
  .then(() => process.exit(0))
  .catch((e) => {
    console.error("FAILED:", e.message);
    process.exit(1);
  });
