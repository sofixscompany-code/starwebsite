import { initializeApp } from "firebase/app";
import { getFirestore, collection, addDoc } from "firebase/firestore";
import { getAuth, signInWithEmailAndPassword } from "firebase/auth";

const app = initializeApp({
  apiKey: "AIzaSyC5eZvLkCskpmgeAYBmAPmtOeL_0UsuiMA",
  authDomain: "starcoachinginstitutenepal.firebaseapp.com",
  projectId: "starcoachinginstitutenepal",
});

const db = getFirestore(app);
const auth = getAuth(app);

const STUDENT_UID = "oYgl1Ki6oBaNW78aVqisx2gph7i2";
const TEACHER_UID = "KETKKqUjMfbNm2JNHHu7DtP306e2";
const PARENT_EMAIL = "parent@demo.starcoaching.edu.np";
const STUDENT_NAME = "Aarav Sharma";

const now = Date.now();
const D = 86400000;
const iso = (offsetMs = 0) => new Date(now + offsetMs).toISOString();

async function seed(name, docs) {
  for (const d of docs) {
    await addDoc(collection(db, name), { ...d, createdAt: d.createdAt || iso() });
  }
  console.log(`${name}: ${docs.length} seeded`);
}

async function main() {
  // Must sign in as super_admin: these portal collections (attendance, grades,
  // homework, …) are isStaff()/isAccountant()-gated in firestore.rules, and an
  // accountant session gets permission-denied on staff collections.
  await signInWithEmailAndPassword(
    auth,
    "super_admin@demo.starcoaching.edu.np",
    "Star#Demo2026!Kx7",
  );
  console.log("Signed in");

  /* ---------------- STUDENT PORTAL ---------------- */
  const attendance = [
    ["2026-08-03", "present"],
    ["2026-08-04", "present"],
    ["2026-08-05", "present"],
    ["2026-08-06", "late"],
    ["2026-08-07", "absent"],
    ["2026-08-10", "present"],
    ["2026-08-11", "present"],
    ["2026-08-12", "present"],
    ["2026-08-13", "excused"],
    ["2026-08-14", "present"],
  ].map(([date, status]) => ({
    studentId: STUDENT_UID,
    courseName: "Nepal Police Preparation",
    date,
    status,
    markedBy: TEACHER_UID,
  }));
  await seed("student_attendance", attendance);

  await seed(
    "student_grades",
    [
      ["Midterm Exam", 88, 100, "A", "2026-07-20"],
      ["Monthly Test", 42, 50, "B+", "2026-08-05"],
      ["Practice Set", 90, 100, "A", "2026-08-15"],
      ["Pre-Final", 166, 200, "A", "2026-08-25"],
    ].map(([examName, marks, totalMarks, grade, date]) => ({
      studentId: STUDENT_UID,
      courseName: "Nepal Police Preparation",
      examName,
      marks,
      totalMarks,
      grade,
      date,
    })),
  );

  await seed("student_schedule", [
    {
      courseId: "np-prep",
      courseName: "Nepal Police Preparation",
      day: "Sunday",
      startTime: "6:00 AM",
      endTime: "8:30 AM",
      room: "Room 101",
      teacher: "Ramesh Sharma",
      type: "lecture",
      isActive: true,
    },
    {
      courseId: "np-prep",
      courseName: "Nepal Police Preparation",
      day: "Monday",
      startTime: "6:00 AM",
      endTime: "8:30 AM",
      room: "Room 101",
      teacher: "Kamala Devi",
      type: "lecture",
      isActive: true,
    },
    {
      courseId: "np-prep",
      courseName: "Nepal Police Preparation",
      day: "Tuesday",
      startTime: "6:00 AM",
      endTime: "8:30 AM",
      room: "Room 101",
      teacher: "Bikash Mandal",
      type: "tutorial",
      isActive: true,
    },
    {
      courseId: "np-prep",
      courseName: "Nepal Police Preparation",
      day: "Thursday",
      startTime: "6:00 AM",
      endTime: "8:30 AM",
      room: "Room 101",
      teacher: "Ramesh Sharma",
      type: "lecture",
      isActive: true,
    },
    {
      courseId: "np-prep",
      courseName: "Nepal Police Preparation",
      day: "Friday",
      startTime: "6:00 AM",
      endTime: "8:30 AM",
      room: "Room 102",
      teacher: "Gita Thapa",
      type: "lab",
      isActive: true,
    },
  ]);

  await seed("student_assignments", [
    {
      studentId: STUDENT_UID,
      courseId: "np-prep",
      courseName: "Nepal Police Preparation",
      title: "Algebra Problem Set Ch.5",
      description: "Solve problems 1-20 from chapter 5.",
      dueDate: "2026-08-18",
      totalMarks: 20,
      status: "pending",
    },
    {
      studentId: STUDENT_UID,
      courseId: "np-prep",
      courseName: "Nepal Police Preparation",
      title: "Current Affairs Quiz",
      description: "Weekly current affairs multiple choice.",
      dueDate: "2026-08-20",
      totalMarks: 25,
      status: "pending",
    },
    {
      studentId: STUDENT_UID,
      courseId: "np-prep",
      courseName: "Nepal Police Preparation",
      title: "GK Practice Sheet",
      description: "Complete the GK practice sheet handed in class.",
      dueDate: "2026-08-15",
      totalMarks: 50,
      status: "submitted",
      submittedAt: iso(-1 * D),
    },
    {
      studentId: STUDENT_UID,
      courseId: "np-prep",
      courseName: "Nepal Police Preparation",
      title: "Reasoning Drill",
      description: "Logical reasoning drill 1-30.",
      dueDate: "2026-08-10",
      totalMarks: 30,
      status: "graded",
    },
  ]);

  /* ---------------- TEACHER PORTAL ---------------- */
  await seed("teacher_classes", [
    {
      teacherId: TEACHER_UID,
      courseId: "np-prep",
      courseName: "Nepal Police Preparation",
      day: "Sunday",
      startTime: "6:00 AM",
      endTime: "8:30 AM",
      room: "Room 101",
      studentCount: 34,
      type: "lecture",
      isActive: true,
    },
    {
      teacherId: TEACHER_UID,
      courseId: "np-prep",
      courseName: "Nepal Police Preparation",
      day: "Thursday",
      startTime: "6:00 AM",
      endTime: "8:30 AM",
      room: "Room 101",
      studentCount: 34,
      type: "lecture",
      isActive: true,
    },
    {
      teacherId: TEACHER_UID,
      courseId: "eng-gr",
      courseName: "English Grammar",
      day: "Monday",
      startTime: "4:00 PM",
      endTime: "5:00 PM",
      room: "Room 105",
      studentCount: 22,
      type: "tutorial",
      isActive: true,
    },
    {
      teacherId: TEACHER_UID,
      courseId: "rea-np",
      courseName: "Reasoning · NP-B",
      day: "Wednesday",
      startTime: "6:00 AM",
      endTime: "7:30 AM",
      room: "Room 102",
      studentCount: 28,
      type: "lecture",
      isActive: false,
    },
  ]);

  await seed("teacher_content", [
    {
      teacherId: TEACHER_UID,
      courseId: "np-prep",
      courseName: "Nepal Police Preparation",
      title: "Quadratic Equations",
      type: "video",
      description: "Step-by-step video on solving quadratic equations.",
      fileUrl: "https://youtu.be/example1",
      isPublished: true,
    },
    {
      teacherId: TEACHER_UID,
      courseId: "np-prep",
      courseName: "Nepal Police Preparation",
      title: "Algebra Notes Ch.5",
      type: "notes",
      description: "Complete chapter summary with solved examples.",
      fileUrl: "https://example.com/algebra-ch5.pdf",
      isPublished: true,
    },
    {
      teacherId: TEACHER_UID,
      courseId: "np-prep",
      courseName: "Nepal Police Preparation",
      title: "Practice Problem Set",
      type: "assignment",
      description: "Problem set for home practice.",
      fileUrl: "",
      isPublished: true,
    },
    {
      teacherId: TEACHER_UID,
      courseId: "eng-gr",
      courseName: "English Grammar",
      title: "Tenses Quiz",
      type: "quiz",
      description: "Quick tenses assessment.",
      fileUrl: "",
      isPublished: false,
    },
  ]);

  await seed(
    "teacher_student_progress",
    [
      [STUDENT_UID, STUDENT_NAME, 92, 86, 5, 6, "excellent"],
      ["v2u9aBdNsJfQ3kzWmXcYy7tR5gH2nM8p", "Ananya Sharma", 95, 91, 6, 6, "excellent"],
      ["x8e4iQwErT3yUoIpAsDfGhJkLzXcVbN1", "Priya Karki", 88, 78, 4, 6, "good"],
      ["c5t7yUoIpAsDfGhJkLzXcVbN1mQwErT3", "Rohan Thapa", 84, 74, 3, 6, "good"],
      ["s2d4fGhJkLzXcVbN1mQwErT3yUoIpAsD", "Sita Kumari", 90, 81, 5, 6, "good"],
    ].map(([studentId, studentName, attendanceRate, avgMarks, completed, total, status]) => ({
      teacherId: TEACHER_UID,
      studentId,
      studentName,
      courseId: "np-prep",
      courseName: "Nepal Police Preparation",
      attendanceRate,
      avgMarks,
      assignmentsCompleted: completed,
      assignmentsTotal: total,
      lastActive: iso(-1 * D),
      status,
    })),
  );

  /* ---------------- ACCOUNTING (fee_*) ---------------- */
  await seed("fee_invoices", [
    {
      invoiceNumber: "INV-2026-0001",
      studentId: STUDENT_UID,
      studentName: STUDENT_NAME,
      studentEmail: "aarav.sharma@demo.np",
      courseId: "np-prep",
      courseName: "Nepal Police Preparation",
      amount: 20000,
      discount: 1000,
      tax: 0,
      totalAmount: 19000,
      dueDate: "2026-07-15",
      status: "paid",
      paidDate: "2026-07-10",
      items: [{ id: "i1", description: "Quarterly tuition (Ashadh–Bhadra)", amount: 20000 }],
      notes: "Early payment discount applied",
    },
    {
      invoiceNumber: "INV-2026-0002",
      studentId: STUDENT_UID,
      studentName: STUDENT_NAME,
      studentEmail: "aarav.sharma@demo.np",
      courseId: "np-prep",
      courseName: "Nepal Police Preparation",
      amount: 20000,
      discount: 0,
      tax: 2000,
      totalAmount: 22000,
      dueDate: "2026-09-30",
      status: "pending",
      items: [{ id: "i1", description: "Quarterly tuition (Bhadra–Kartik)", amount: 20000 }],
      notes: "",
    },
    {
      invoiceNumber: "INV-2026-0003",
      studentId: STUDENT_UID,
      studentName: STUDENT_NAME,
      studentEmail: "aarav.sharma@demo.np",
      courseId: "np-prep",
      courseName: "Nepal Police Preparation",
      amount: 1500,
      discount: 0,
      tax: 0,
      totalAmount: 1500,
      dueDate: "2026-08-20",
      status: "paid",
      paidDate: "2026-08-18",
      items: [{ id: "i1", description: "Exam fee", amount: 1500 }],
      notes: "",
    },
    {
      invoiceNumber: "INV-2026-0004",
      studentId: "v2u9aBdNsJfQ3kzWmXcYy7tR5gH2nM8p",
      studentName: "Ananya Sharma",
      studentEmail: "ananya.sharma@demo.np",
      courseId: "loksewa-officer",
      courseName: "Loksewa Officer Prep",
      amount: 25000,
      discount: 0,
      tax: 2500,
      totalAmount: 27500,
      dueDate: "2026-09-10",
      status: "pending",
      items: [{ id: "i1", description: "Quarterly tuition", amount: 25000 }],
      notes: "",
    },
  ]);

  await seed("fee_payments", [
    {
      invoiceId: "INV-2026-0001",
      invoiceNumber: "INV-2026-0001",
      studentId: STUDENT_UID,
      studentName: STUDENT_NAME,
      amount: 19000,
      method: "esewa",
      reference: "ESW-883210",
      receivedBy: "Accountant Demo",
      notes: "",
      paymentDate: "2026-07-10",
      receiptNumber: "RCT-2026-0001",
    },
    {
      invoiceId: "INV-2026-0003",
      invoiceNumber: "INV-2026-0003",
      studentId: STUDENT_UID,
      studentName: STUDENT_NAME,
      amount: 1500,
      method: "cash",
      reference: "CASH-0041",
      receivedBy: "Accountant Demo",
      notes: "",
      paymentDate: "2026-08-18",
      receiptNumber: "RCT-2026-0002",
    },
    {
      invoiceId: "INV-2024-0099",
      invoiceNumber: "INV-2024-0099",
      studentId: "x8e4iQwErT3yUoIpAsDfGhJkLzXcVbN1",
      studentName: "Priya Karki",
      amount: 18000,
      method: "bank_transfer",
      reference: "NIB-553219",
      receivedBy: "Accountant Demo",
      notes: "",
      paymentDate: "2026-08-01",
      receiptNumber: "RCT-2026-0003",
    },
  ]);

  await seed("fee_structure", [
    {
      courseId: "np-prep",
      courseName: "Nepal Police Preparation",
      feeType: "tuition",
      amount: 20000,
      frequency: "quarterly",
      isActive: true,
    },
    {
      courseId: "np-prep",
      courseName: "Nepal Police Preparation",
      feeType: "admission",
      amount: 5000,
      frequency: "one_time",
      isActive: true,
    },
    {
      courseId: "loksewa-officer",
      courseName: "Loksewa Officer Prep",
      feeType: "tuition",
      amount: 25000,
      frequency: "quarterly",
      isActive: true,
    },
    {
      courseId: "ioe",
      courseName: "IOE Preparation",
      feeType: "tuition",
      amount: 22000,
      frequency: "quarterly",
      isActive: true,
    },
    {
      courseId: "apf",
      courseName: "APF Constable",
      feeType: "tuition",
      amount: 16000,
      frequency: "quarterly",
      isActive: true,
    },
    {
      courseId: "see",
      courseName: "SEE Bridge Course",
      feeType: "tuition",
      amount: 12000,
      frequency: "monthly",
      isActive: true,
    },
    {
      courseId: "see",
      courseName: "SEE Bridge Course",
      feeType: "exam",
      amount: 1500,
      frequency: "one_time",
      isActive: true,
    },
  ]);

  console.log("\nDone! Portal data is now live in Firestore.");
  console.log(`Parent ${PARENT_EMAIL} can log in and see ${STUDENT_NAME} (${STUDENT_UID}).`);
  console.log(`Teacher/Student UIDs are wired via their Firebase Auth accounts.`);
}

main().catch((e) => {
  console.error(e.message || e);
  process.exit(1);
});
