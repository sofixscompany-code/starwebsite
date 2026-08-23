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

const now = Date.now();
const iso = (offsetMs = 0) => new Date(now + offsetMs).toISOString();

async function seed(name, docs) {
  for (const d of docs) {
    await addDoc(collection(db, name), { ...d, createdAt: d.createdAt || iso() });
  }
  console.log(`${name}: ${docs.length} seeded`);
}

async function main() {
  await signInWithEmailAndPassword(auth, "accountant@demo.starcoaching.edu.np", "Demo@2026!");
  console.log("Signed in");

  const students = [
    ["Aarav Sharma", "Nepal Police Preparation", "NP-A", true, 92, 86],
    ["Ananya Sharma", "Loksewa Officer Prep", "LS-B", true, 95, 91],
    ["Priya Karki", "IOE Preparation", "IOE-A", false, 88, 78],
    ["Rohan Thapa", "Nepal Police Preparation", "NP-A", false, 84, 74],
    ["Sita Kumari", "APF Constable", "APF-A", false, 90, 81],
    ["Ram Prasad", "Loksewa Officer Prep", "LS-B", false, 87, 79],
    ["Anita Thapa", "IOE Preparation", "IOE-A", false, 93, 88],
    ["Kiran Basnet", "Nepal Police Preparation", "NP-B", false, 65, 62],
    ["Nabin Poudel", "SEE Bridge Course", "SEE-A", false, 91, 83],
    ["Sunita Yadav", "Loksewa Officer Prep", "LS-A", false, 89, 85],
  ].map(([fullName, course, batch, isDemo, att, score], i) => ({
    fullName,
    email: fullName.toLowerCase().replace(" ", ".") + "@demo.np",
    phone: "+977 980100000" + i,
    course,
    batch,
    status: i === 7 ? "inactive" : "active",
    attendancePercent: att,
    avgScore: score,
    ...(isDemo ? { studentId: STUDENT_UID, parentEmail: PARENT_EMAIL } : {}),
  }));
  await seed("students", students);

  await seed(
    "teachers",
    [
      [TEACHER_UID, "Ramesh Sharma", "teacher@demo.starcoaching.edu.np", "Mathematics"],
      [null, "Gita Thapa", "gita@demo.np", "Physics"],
      [null, "Suresh Adhikari", "suresh@demo.np", "English"],
      [null, "Kamala Devi", "kamala@demo.np", "General Knowledge"],
      [null, "Bikash Mandal", "bikash@demo.np", "Reasoning"],
      [null, "Pooja Sah", "pooja@demo.np", "Nepali"],
    ].map(([tid, fullName, email, subject], i) => ({
      ...(tid ? { teacherId: tid } : {}),
      fullName,
      email,
      subject,
      phone: "+977 981200000" + i,
      status: "active",
    })),
  );

  const H = 3600000;
  const D = 86400000;
  await seed("classes", [
    {
      name: "Mathematics · NP-A",
      subject: "Mathematics",
      teacherId: TEACHER_UID,
      teacherName: "Ramesh Sharma",
      room: "Room 101",
      startTime: iso(1 * H),
      durationMin: 90,
    },
    {
      name: "Physics · IOE-A",
      subject: "Physics",
      teacherName: "Gita Thapa",
      room: "Room 203",
      startTime: iso(3 * H),
      durationMin: 90,
    },
    {
      name: "English Grammar · LS-B",
      subject: "English",
      teacherId: TEACHER_UID,
      teacherName: "Suresh Adhikari",
      room: "Room 105",
      startTime: iso(5 * H),
      durationMin: 60,
    },
    {
      name: "GK Session · APF-A",
      subject: "General Knowledge",
      teacherName: "Kamala Devi",
      room: "Room 108",
      startTime: iso(22 * H),
      durationMin: 60,
    },
    {
      name: "Reasoning · NP-B",
      subject: "Reasoning",
      teacherId: TEACHER_UID,
      teacherName: "Bikash Mandal",
      room: "Room 102",
      startTime: iso(1 * D + 2 * H),
      durationMin: 90,
    },
    {
      name: "Mathematics · IOE-A",
      subject: "Mathematics",
      teacherId: TEACHER_UID,
      teacherName: "Ramesh Sharma",
      room: "Room 101",
      startTime: iso(1 * D + 4 * H),
      durationMin: 90,
    },
    {
      name: "Nepali · SEE-A",
      subject: "Nepali",
      teacherName: "Pooja Sah",
      room: "Room 110",
      startTime: iso(2 * D),
      durationMin: 60,
    },
    {
      name: "Mock Test Review · LS-A",
      subject: "Mixed",
      teacherName: "Kamala Devi",
      room: "Hall A",
      startTime: iso(2 * D + 3 * H),
      durationMin: 120,
    },
  ]);

  await seed("homework", [
    {
      title: "Algebra Problem Set Ch.5",
      subject: "Mathematics",
      teacherId: TEACHER_UID,
      studentId: STUDENT_UID,
      dueDate: iso(2 * D),
      status: "pending",
    },
    {
      title: "Motion Numericals Ch.3",
      subject: "Physics",
      studentId: STUDENT_UID,
      dueDate: iso(3 * D),
      status: "pending",
    },
    {
      title: "Essay: Democracy in Nepal",
      subject: "English",
      teacherId: TEACHER_UID,
      dueDate: iso(-1 * D),
      status: "submitted",
    },
    {
      title: "GK Quiz Practice Set 8",
      subject: "General Knowledge",
      teacherId: TEACHER_UID,
      dueDate: iso(4 * D),
      status: "pending",
    },
    {
      title: "Trigonometry Worksheet",
      subject: "Mathematics",
      teacherId: TEACHER_UID,
      studentId: STUDENT_UID,
      dueDate: iso(5 * D),
      status: "pending",
    },
  ]);

  await seed("exams", [
    {
      title: "NP Mock Test #15",
      subject: "Mixed",
      scheduledAt: iso(3 * D),
      durationMin: 120,
      totalMarks: 100,
    },
    {
      title: "IOE Weekly Quiz",
      subject: "Physics",
      scheduledAt: iso(5 * D),
      durationMin: 60,
      totalMarks: 50,
    },
    {
      title: "LS Prelims Paper 1",
      subject: "GK",
      scheduledAt: iso(7 * D),
      durationMin: 180,
      totalMarks: 200,
    },
    {
      title: "Math Unit Test Ch.4-6",
      subject: "Mathematics",
      teacherId: TEACHER_UID,
      scheduledAt: iso(6 * D),
      durationMin: 90,
      totalMarks: 75,
    },
  ]);

  await seed("results", [
    { studentId: STUDENT_UID, subject: "Mathematics", exam: "Unit Test 4", score: 85, total: 100 },
    { studentId: STUDENT_UID, subject: "Physics", exam: "Mock Test #14", score: 72, total: 100 },
    { studentId: STUDENT_UID, subject: "English", exam: "Grammar Quiz", score: 91, total: 100 },
  ]);

  const attendance = [];
  for (let i = 1; i <= 20; i++) {
    attendance.push({
      studentId: STUDENT_UID,
      date: iso(-i * D),
      status: i % 10 === 0 ? "absent" : i % 7 === 0 ? "late" : "present",
      markedBy: TEACHER_UID,
    });
  }
  await seed("attendance", attendance);

  await seed("enrollments", [
    {
      studentId: STUDENT_UID,
      course: "Nepal Police Preparation",
      enrolledAt: iso(-30 * D),
      status: "active",
    },
    {
      studentId: STUDENT_UID,
      course: "Mathematics Special",
      enrolledAt: iso(-20 * D),
      status: "active",
    },
    {
      studentId: STUDENT_UID,
      course: "English Grammar",
      enrolledAt: iso(-15 * D),
      status: "active",
    },
    {
      studentId: STUDENT_UID,
      course: "GK & Current Affairs",
      enrolledAt: iso(-10 * D),
      status: "active",
    },
  ]);

  const pay = [
    ["Priya Karki", 18500, "eSewa", "tuition"],
    ["Rohan Thapa", 12000, "Khalti", "hostel"],
    ["Anita Shrestha", 9500, "Cash", "exam"],
    ["Ram Prasad", 22000, "Bank Transfer", "tuition"],
    ["Sita Kumari", 25000, "eSewa", "admission"],
    ["Sunita Yadav", 7500, "Khalti", "tuition"],
    ["Nabin Poudel", 15000, "Cash", "tuition"],
    ["Ananya Sharma", 5000, "eSewa", "monthly fee"],
  ];
  await seed(
    "payments",
    pay.map(([student, amount, method, type], i) => ({
      studentName: student,
      amount,
      method,
      type,
      status: "completed",
      receiptNo: "RCP-" + (1000 + i),
      createdAt: i < 2 ? iso(-i * 600000) : iso(-(i * 26) * H),
    })),
  );

  await seed("expenses", [
    {
      title: "Stationery purchase",
      category: "Supplies",
      amount: 3200,
      createdAt: iso(-25 * 60000),
    },
    { title: "Staff salary advance", category: "Salary", amount: 45000, createdAt: iso(-1 * D) },
    { title: "Electricity bill", category: "Utilities", amount: 12800, createdAt: iso(-2 * D) },
    { title: "Whiteboards x4", category: "Furniture", amount: 21000, createdAt: iso(-4 * D) },
    { title: "Internet recharge", category: "Utilities", amount: 3500, createdAt: iso(-5 * D) },
  ]);

  await seed("fees", [
    {
      studentName: "Kiran Basnet",
      course: "Nepal Police Preparation",
      amount: 18000,
      status: "pending",
      dueDate: iso(2 * D),
    },
    {
      studentName: "Rohan Thapa",
      course: "Hostel",
      amount: 12000,
      status: "pending",
      dueDate: iso(4 * D),
    },
    {
      studentName: "Sunita Yadav",
      course: "Exam Fee",
      amount: 3500,
      status: "pending",
      dueDate: iso(6 * D),
    },
    {
      studentName: "Aarav Sharma",
      course: "Monthly Tuition",
      amount: 5000,
      status: "paid",
      dueDate: iso(-3 * D),
    },
  ]);

  await seed("admissions", [
    {
      name: "Sita Kumari",
      course: "Nepal Police",
      amount: 25000,
      date: "18 Jan",
      status: "pending",
    },
    {
      name: "Ram Prasad",
      course: "Loksewa Officer",
      amount: 18000,
      date: "17 Jan",
      status: "pending",
    },
    {
      name: "Anita Thapa",
      course: "APF Constable",
      amount: 22000,
      date: "16 Jan",
      status: "pending",
    },
    {
      name: "Kiran Basnet",
      course: "IOE Preparation",
      amount: 15000,
      date: "15 Jan",
      status: "pending",
    },
    {
      name: "Nabin Poudel",
      course: "Nepal Police",
      amount: 20000,
      date: "14 Jan",
      status: "approved",
    },
  ]);

  await seed("notices", [
    {
      title: "Scholarship deadline extended",
      body: "Merit scholarship applications now close on Jan 31.",
      category: "Scholarship",
      isPublished: true,
      publishedAt: iso(-30 * 60000),
    },
    {
      title: "NP Mock Test #15 schedule",
      body: "Mock test will be held this Saturday at 8 AM, Hall A.",
      category: "Exam",
      isPublished: true,
      publishedAt: iso(-2 * H),
    },
    {
      title: "New IOE batch starting",
      body: "Evening IOE preparation batch starts next Monday.",
      category: "Admission",
      isPublished: true,
      publishedAt: iso(-1 * D),
    },
    {
      title: "Fee payment reminder",
      body: "Monthly tuition fees are due by the 10th of each month.",
      category: "Fees",
      isPublished: true,
      publishedAt: iso(-3 * D),
    },
  ]);

  console.log("ALL DONE");
}

main()
  .then(() => process.exit(0))
  .catch((e) => {
    console.error("SEED FAILED:", e.message);
    process.exit(1);
  });
