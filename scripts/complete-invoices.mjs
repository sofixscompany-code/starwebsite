// One-off completion pass for fee_invoices demo data:
// 1) Fix the pre-existing "Anita Shrestha" payment typo → "Anita Thapa"
//    (students collection has "Anita Thapa"), and repair its invoice linkage
//    (studentId / courseName were empty because the name lookup missed).
// 2) Add pending invoices for the two students with NO invoice yet
//    (Priya Karki, Ram Prasad) so every student appears in the Fees module.
// Pending Dues after: 18000+3500+6000+5500 = 33,000; Fee Collection re-bases.
// Idempotent: skips each step if already applied.
import { initializeApp } from "firebase/app";
import { getFirestore, collection, getDocs, doc, updateDoc, addDoc } from "firebase/firestore";
import { getAuth, signInWithEmailAndPassword } from "firebase/auth";

const app = initializeApp({
  apiKey: "AIzaSyC5eZvLkCskpmgeAYBmAPmtOeL_0UsuiMA",
  authDomain: "starcoachinginstitutenepal.firebaseapp.com",
  projectId: "starcoachinginstitutenepal",
});
const db = getFirestore(app);
const auth = getAuth(app);

const futureDate = (days) => new Date(Date.now() + days * 86400000).toISOString().slice(0, 10);

async function main() {
  await signInWithEmailAndPassword(
    auth,
    "super_admin@demo.starcoaching.edu.np",
    "Star#Demo2026!Kx7",
  );
  console.log("Signed in as super_admin");

  // Current state
  const studentsSnap = await getDocs(collection(db, "students"));
  const byName = new Map();
  const docIds = new Map(); // fullName -> docId
  for (const d of studentsSnap.docs) {
    const s = d.data();
    const name = String(s.fullName ?? s.name ?? "");
    byName.set(name, {
      docId: d.id,
      course: String(s.course ?? ""),
      uid: String(s.studentId ?? ""),
    });
    docIds.set(name, d.id);
  }
  const invSnap = await getDocs(collection(db, "fee_invoices"));
  const invoices = invSnap.docs.map((d) => ({ id: d.id, ...d.data() }));
  const paySnap = await getDocs(collection(db, "payments"));
  const payments = paySnap.docs.map((d) => ({ id: d.id, ...d.data() }));

  // Students covered by an invoice (by studentName OR studentId -> doc)
  const covered = new Set();
  for (const inv of invoices) {
    if (inv.studentId && docIds.has(String(inv.studentName))) covered.add(inv.studentId);
    else if (inv.studentId) covered.add(inv.studentId);
    // resolve via name to docId
    for (const [name, info] of byName) {
      if (name === String(inv.studentName) || info.docId === String(inv.studentId))
        covered.add(info.docId);
    }
  }

  // ── 1) Anita typo fix ────────────────────────────────────────────────
  const anita = byName.get("Anita Thapa");
  const typoPay = payments.find((p) => String(p.studentName) === "Anita Shrestha");
  if (typoPay) {
    await updateDoc(doc(db, "payments", typoPay.id), { studentName: "Anita Thapa" });
    console.log(`payment ${typoPay.receiptNo}: "Anita Shrestha" → "Anita Thapa"`);
  }
  const anitaInv = invoices.find(
    (i) =>
      String(i.studentName) === "Anita Shrestha" || String(i.invoiceNumber) === "INV-2026-1002",
  );
  if (anitaInv && anita) {
    const needsFix =
      String(anitaInv.studentId || "") !== anita.docId ||
      String(anitaInv.courseName || "") !== anita.course;
    if (needsFix) {
      await updateDoc(doc(db, "fee_invoices", anitaInv.id), {
        studentName: "Anita Thapa",
        studentId: anita.docId,
        studentUid: anita.uid || "",
        courseName: anita.course,
      });
      console.log(`invoice ${anitaInv.invoiceNumber}: linked → Anita Thapa · ${anita.course}`);
    } else {
      console.log(`invoice ${anitaInv.invoiceNumber}: already linked`);
    }
  }

  // ── 2) Invoices for students with none ──────────────────────────────
  const missing = [...byName.entries()].filter(([name, info]) => !covered.has(info.docId));
  let n = 0;
  for (const [name, info] of missing) {
    n++;
    const amount = info.course.toLowerCase().includes("loksewa") ? 5500 : 6000;
    await addDoc(collection(db, "fee_invoices"), {
      invoiceNumber: `INV-2026-02${String(3 + n).padStart(2, "0")}`,
      studentId: info.docId,
      studentUid: info.uid || "",
      studentName: name,
      courseId: "",
      courseName: info.course,
      amount,
      discount: 0,
      tax: 0,
      totalAmount: amount,
      dueDate: futureDate(3 + n),
      status: "pending",
      paidDate: null,
      items: [{ id: "i1", description: "Monthly Tuition", amount }],
      notes: "Demo monthly tuition invoice",
      createdAt: new Date().toISOString(),
    });
    console.log(
      `invoice (pending): ${name} · ${info.course} · Rs ${amount} · due ${futureDate(3 + n)}`,
    );
  }
  if (n === 0) console.log("no missing students — all covered");

  // Summary
  const after = await getDocs(collection(db, "fee_invoices"));
  const inv2 = after.docs.map((d) => d.data());
  const dues = inv2
    .filter((i) => i.status === "pending" || i.status === "overdue")
    .reduce((s, i) => s + (Number(i.totalAmount) || Number(i.amount) || 0), 0);
  const total = inv2.reduce((s, i) => s + (Number(i.totalAmount) || Number(i.amount) || 0), 0);
  console.log(
    `\ntotal invoices: ${inv2.length} · invoiced Rs ${total.toLocaleString()} · pending dues Rs ${dues.toLocaleString()}`,
  );
  const names = new Set(inv2.map((i) => String(i.studentName)));
  console.log(`students covered: ${names.size}`);
  console.log("COMPLETION DONE");
}

main()
  .then(() => process.exit(0))
  .catch((e) => {
    console.error("FAILED:", e.message);
    process.exit(1);
  });
