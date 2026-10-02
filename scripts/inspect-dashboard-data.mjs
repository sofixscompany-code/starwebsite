// One-off: dump dashboard collections (key fields only) before cleanup.
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

async function dump(name, pick) {
  const snap = await getDocs(collection(db, name));
  const rows = snap.docs.map((d) => ({ id: d.id, ...pick(d.data()) }));
  console.log(`\n=== ${name} (${rows.length}) ===`);
  for (const r of rows) console.log(JSON.stringify(r));
}

async function main() {
  await signInWithEmailAndPassword(
    auth,
    "super_admin@demo.starcoaching.edu.np",
    "Star#Demo2026!Kx7",
  );
  console.log("Signed in as super_admin");

  await dump("results", (d) => ({
    studentId: d.studentId,
    subject: d.subject,
    exam: d.exam,
    score: d.score ?? d.marks,
    total: d.total,
    createdAt: d.createdAt,
  }));
  await dump("attendance", (d) => ({
    studentId: d.studentId,
    date: d.date,
    status: d.status,
    createdAt: d.createdAt,
  }));
  await dump("students", (d) => ({
    fullName: d.fullName ?? d.name,
    course: d.course,
    batch: d.batch,
    parentEmail: d.parentEmail,
    studentId: d.studentId,
  }));
  await dump("classes", (d) => ({
    name: d.name,
    startTime: d.startTime,
    durationMin: d.durationMin,
    teacherId: d.teacherId,
  }));
  await dump("exams", (d) => ({
    title: d.title,
    scheduledAt: d.scheduledAt,
    teacherId: d.teacherId,
  }));
  await dump("teacher_classes", (d) => ({
    name: d.name,
    subject: d.subject,
    day: d.day,
    startTime: d.startTime,
    endTime: d.endTime,
    teacherId: d.teacherId,
  }));
  await dump("homework", (d) => ({
    title: d.title,
    dueDate: d.dueDate,
    status: d.status,
    studentId: d.studentId,
    batch: d.batch,
    teacherId: d.teacherId,
  }));
  await dump("enrollments", (d) => ({
    studentId: d.studentId,
    course: d.course,
    status: d.status,
    createdAt: d.createdAt,
  }));
  await dump("payments", (d) => ({
    studentName: d.studentName,
    amount: d.amount,
    receiptNo: d.receiptNo,
    type: d.type,
    method: d.method,
    createdAt: d.createdAt,
  }));
  await dump("expenses", (d) => ({
    title: d.title,
    category: d.category,
    amount: d.amount,
    createdAt: d.createdAt,
  }));
  await dump("fees", (d) => ({
    studentName: d.studentName,
    course: d.course,
    amount: d.amount,
    status: d.status,
    createdAt: d.createdAt,
  }));
  await dump("fee_invoices", (d) => ({
    studentName: d.studentName,
    courseName: d.courseName,
    totalAmount: d.totalAmount,
    status: d.status,
  }));
  await dump("admissions", (d) => ({
    name: d.name,
    studentName: d.studentName,
    fullName: d.fullName,
    course: d.course,
    courseName: d.courseName,
    amount: d.amount,
    status: d.status,
    createdAt: d.createdAt,
  }));
}

main()
  .then(() => process.exit(0))
  .catch((e) => {
    console.error("FAILED:", e.message);
    process.exit(1);
  });
