// One-off demo-data cleanup: the dashboard seed ran twice (Aug 23 + Sep 4),
// duplicating every collection. This de-duplicates by natural key (keeps the
// OLDEST record) and refreshes stale class/exam/homework dates to the future.
// Idempotent: safe to re-run (second run deletes nothing, dates just re-set).
import { initializeApp } from "firebase/app";
import { getFirestore, collection, getDocs, doc, deleteDoc, updateDoc } from "firebase/firestore";
import { getAuth, signInWithEmailAndPassword } from "firebase/auth";

const app = initializeApp({
  apiKey: "AIzaSyC5eZvLkCskpmgeAYBmAPmtOeL_0UsuiMA",
  authDomain: "starcoachinginstitutenepal.firebaseapp.com",
  projectId: "starcoachinginstitutenepal",
});
const db = getFirestore(app);
const auth = getAuth(app);

const str = (v) => (v == null ? "" : String(v));
const oldestFirst = (a, b) =>
  str(a.data.createdAt).localeCompare(str(b.data.createdAt)) || a.id.localeCompare(b.id);

async function dedupe(name, keyFn, keepFn = oldestFirst) {
  const snap = await getDocs(collection(db, name));
  const groups = new Map();
  for (const d of snap.docs) {
    const data = d.data();
    const k = keyFn(data);
    if (k == null) continue;
    if (!groups.has(k)) groups.set(k, []);
    groups.get(k).push({ id: d.id, data });
  }
  const kept = [];
  let deleted = 0;
  for (const [k, arr] of groups) {
    arr.sort(keepFn);
    kept.push({ key: k, id: arr[0].id, data: arr[0].data });
    for (const extra of arr.slice(1)) {
      await deleteDoc(doc(db, name, extra.id));
      deleted++;
    }
  }
  console.log(`${name}: kept ${kept.length}, deleted ${deleted} duplicate(s)`);
  return kept;
}

const startOfToday = new Date();
startOfToday.setHours(0, 0, 0, 0);
const now = Date.now();
const at = (dayOffset, hour, min = 0) => {
  const d = new Date(startOfToday);
  d.setDate(d.getDate() + dayOffset);
  d.setHours(hour, min, 0, 0);
  return d.toISOString();
};
const clampToday = (ms) =>
  new Date(Math.min(ms, startOfToday.getTime() + 23 * 3600000)).toISOString();
// ~20 min ago (never before midnight) → shows as a LIVE class right now.
const liveStart = new Date(
  Math.max(now - 20 * 60000, startOfToday.getTime() + 5 * 60000),
).toISOString();

async function refresh(name, id, patch) {
  await updateDoc(doc(db, name, id), patch);
}

async function main() {
  await signInWithEmailAndPassword(
    auth,
    "super_admin@demo.starcoaching.edu.np",
    "Star#Demo2026!Kx7",
  );
  console.log("Signed in as super_admin\n");

  // ── De-duplicates ────────────────────────────────────────────────
  await dedupe("results", (d) =>
    [d.studentId, d.subject, d.exam, d.score ?? d.marks, d.total].map(str).join("|"),
  );
  await dedupe("attendance", (d) => [d.studentId, str(d.date).slice(0, 10)].map(str).join("|"));
  await dedupe("students", (d) =>
    [d.fullName ?? d.name, d.course, d.batch, d.parentEmail, d.studentId].map(str).join("|"),
  );
  const keptClasses = await dedupe("classes", (d) => [d.name, d.durationMin].map(str).join("|"));
  const keptExams = await dedupe("exams", (d) => [d.title, d.subject].map(str).join("|"));
  const keptHw = await dedupe("homework", (d) => [d.title, d.status].map(str).join("|"));
  await dedupe("enrollments", (d) => [d.studentId, d.course].map(str).join("|"));
  await dedupe(
    "payments",
    (d) =>
      (d.receiptNo ? `rc:${d.receiptNo}` : null) ??
      [d.studentName, d.amount, d.method, d.type].map(str).join("|"),
  );
  await dedupe("expenses", (d) => [d.title, d.amount, d.category].map(str).join("|"));
  await dedupe("fees", (d) => [d.studentName, d.course, d.amount].map(str).join("|"));
  await dedupe("admissions", (d) =>
    [d.name ?? d.studentName ?? d.fullName, d.course ?? d.courseName, d.amount].map(str).join("|"),
  );

  // ── Refresh stale dates (kept docs only) ─────────────────────────
  const classSlots = {
    "Mathematics · NP-A": liveStart,
    "Physics · IOE-A": clampToday(now + 2 * 3600000),
    "English Grammar · LS-B": at(0, 9),
    "GK Session · APF-A": clampToday(now + 4 * 3600000),
    "Reasoning · NP-B": at(1, 10),
    "Mathematics · IOE-A": at(1, 13),
    "Nepali · SEE-A": at(2, 10),
    "Mock Test Review · LS-A": at(2, 14),
  };
  for (const k of keptClasses) {
    const slot = classSlots[str(k.data.name)];
    if (slot) {
      await refresh("classes", k.id, { startTime: slot });
      console.log(`classes: "${k.data.name}" → ${slot}`);
    }
  }

  const examSlots = {
    "NP Mock Test #15": at(3, 10),
    "IOE Weekly Quiz": at(5, 10),
    "Math Unit Test Ch.4-6": at(6, 10),
    "LS Prelims Paper 1": at(7, 10),
  };
  for (const k of keptExams) {
    const slot = examSlots[str(k.data.title)];
    if (slot) {
      await refresh("exams", k.id, { scheduledAt: slot });
      console.log(`exams: "${k.data.title}" → ${slot}`);
    }
  }

  const hwSlots = {
    "Algebra Problem Set Ch.5": at(1, 20),
    "Motion Numericals Ch.3": at(2, 20),
    "GK Quiz Practice Set 8": at(3, 20),
    "Trigonometry Worksheet": at(4, 20),
  };
  for (const k of keptHw) {
    if (str(k.data.status) !== "pending") continue;
    const slot = hwSlots[str(k.data.title)];
    if (slot) {
      await refresh("homework", k.id, { dueDate: slot });
      console.log(`homework: "${k.data.title}" → ${slot}`);
    }
  }

  console.log("\nCLEANUP DONE");
}

main()
  .then(() => process.exit(0))
  .catch((e) => {
    console.error("FAILED:", e.message);
    process.exit(1);
  });
