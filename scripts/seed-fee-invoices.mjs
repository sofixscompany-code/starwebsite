// One-off migration: legacy `fees` collection → real `fee_invoices` (Fees module).
// Why: dashboards sum BOTH collections (fees + fee_invoices) → keeping both would
// double-count dues; `fees` has no admin CRUD (dashboard-only), so we move its
// facts into invoice docs and delete it.
// - one PAID invoice per existing payment (billed vs. money already received)
// - one PAID invoice for the pre-existing paid `fees` doc
// - one PENDING invoice per pre-existing pending `fees` doc, dueDate refreshed +future
// - Rohan's pending "Hostel 12000" is SKIPPED: a matching payment already exists
//   (same student, same type, same amount) → represented by its paid invoice instead.
// Idempotent guard: aborts if fee_invoices already has docs.
import { initializeApp } from "firebase/app";
import { getFirestore, collection, getDocs, addDoc, deleteDoc, doc } from "firebase/firestore";
import { getAuth, signInWithEmailAndPassword } from "firebase/auth";

const app = initializeApp({
  apiKey: "AIzaSyC5eZvLkCskpmgeAYBmAPmtOeL_0UsuiMA",
  authDomain: "starcoachinginstitutenepal.firebaseapp.com",
  projectId: "starcoachinginstitutenepal",
});
const db = getFirestore(app);
const auth = getAuth(app);

const typeLabel = (t) => {
  const s = String(t || "").toLowerCase();
  if (s.includes("hostel")) return "Hostel fee";
  if (s.includes("exam")) return "Exam fee";
  if (s.includes("admission")) return "Admission fee";
  if (s.includes("monthly")) return "Monthly fee";
  if (s.includes("tuition")) return "Tuition fee";
  return "Fee";
};
const dateStr = (iso) => String(iso || "").slice(0, 10);
const futureDate = (days) => new Date(Date.now() + days * 86400000).toISOString().slice(0, 10);

async function main() {
  await signInWithEmailAndPassword(
    auth,
    "super_admin@demo.starcoaching.edu.np",
    "Star#Demo2026!Kx7",
  );
  console.log("Signed in as super_admin");

  const existing = await getDocs(collection(db, "fee_invoices"));
  if (!existing.empty) {
    console.log(`fee_invoices already has ${existing.size} doc(s) — aborting (idempotent).`);
    return;
  }

  const studentsSnap = await getDocs(collection(db, "students"));
  const byName = new Map();
  for (const d of studentsSnap.docs) {
    const s = d.data();
    byName.set(String(s.fullName ?? s.name ?? ""), {
      docId: d.id,
      course: String(s.course ?? ""),
      uid: String(s.studentId ?? ""),
    });
  }

  const payments = (await getDocs(collection(db, "payments"))).docs.map((d) => d.data());
  const fees = (await getDocs(collection(db, "fees"))).docs.map((d) => ({ id: d.id, ...d.data() }));

  // ── 1) Paid invoices, one per payment (money already received) ──────────
  let n = 0;
  for (const p of payments) {
    const stu = byName.get(String(p.studentName || "")) || {};
    const total = Number(p.amount) || 0;
    await addDoc(collection(db, "fee_invoices"), {
      invoiceNumber: `INV-2026-${String(p.receiptNo || `X${++n}`).replace("RCP-", "")}`,
      studentId: stu.docId || "",
      studentUid: stu.uid || "",
      studentName: String(p.studentName || "Student"),
      courseId: "",
      courseName: stu.course || "Course",
      amount: total,
      discount: 0,
      tax: 0,
      totalAmount: total,
      dueDate: dateStr(p.createdAt),
      status: "paid",
      paidDate: dateStr(p.createdAt),
      items: [{ id: "i1", description: typeLabel(p.type), amount: total }],
      notes: `Migrated from payment ${p.receiptNo || ""}`.trim(),
      createdAt: p.createdAt || new Date().toISOString(),
    });
    console.log(`invoice (paid, from payment ${p.receiptNo}): ${p.studentName} Rs ${total}`);
  }

  // ── 2 + 3) Fees docs → invoices (skip Rohan hostel: payment covers it) ──
  let extra = 0;
  for (const f of fees) {
    const stu = byName.get(String(f.studentName || "")) || {};
    const total = Number(f.amount) || 0;
    const pending = String(f.status) !== "paid";
    const rohanHostel =
      pending &&
      String(f.studentName) === "Rohan Thapa" &&
      String(f.course).toLowerCase().includes("hostel") &&
      payments.some(
        (p) =>
          String(p.studentName) === "Rohan Thapa" &&
          Number(p.amount) === total &&
          String(p.type).toLowerCase().includes("hostel"),
      );
    if (rohanHostel) {
      console.log(`SKIP (already paid via payment): ${f.studentName} ${f.course} Rs ${total}`);
      continue;
    }
    extra++;
    await addDoc(collection(db, "fee_invoices"), {
      invoiceNumber: `INV-2026-02${String(extra).padStart(2, "0")}`,
      studentId: stu.docId || "",
      studentUid: stu.uid || "",
      studentName: String(f.studentName || "Student"),
      courseId: "",
      courseName: stu.course || "Course",
      amount: total,
      discount: 0,
      tax: 0,
      totalAmount: total,
      dueDate: pending ? futureDate(extra === 1 ? 7 : 5) : dateStr(f.dueDate),
      status: pending ? "pending" : "paid",
      paidDate: pending ? null : dateStr(f.dueDate),
      items: [{ id: "i1", description: String(f.course || "Fee"), amount: total }],
      notes: "Migrated from legacy fees record",
      createdAt: f.createdAt || new Date().toISOString(),
    });
    console.log(
      `invoice (${pending ? "pending" : "paid"}, from fee): ${f.studentName} ${f.course} Rs ${total}`,
    );
  }

  // ── 4) Legacy fees collection consumed → delete ─────────────────────────
  for (const f of fees) {
    await deleteDoc(doc(db, "fees", f.id));
  }
  console.log(`\nfees: deleted ${fees.length} legacy doc(s)`);
  console.log("MIGRATION DONE");
}

main()
  .then(() => process.exit(0))
  .catch((e) => {
    console.error("FAILED:", e.message);
    process.exit(1);
  });
