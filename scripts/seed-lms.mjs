import { initializeApp } from "firebase/app";
import { getFirestore, collection, getDocs, query, orderBy, addDoc } from "firebase/firestore";
import { getAuth, signInWithEmailAndPassword } from "firebase/auth";

const app = initializeApp({
  apiKey: "AIzaSyC5eZvLkCskpmgeAYBmAPmtOeL_0UsuiMA",
  authDomain: "starcoachinginstitutenepal.firebaseapp.com",
  projectId: "starcoachinginstitutenepal",
});
const db = getFirestore(app);
const auth = getAuth(app);

const STUDENT_UID = "oYgl1Ki6oBaNW78aVqisx2gph7i2";

async function seedIfEmpty(name, docs) {
  const snap = await getDocs(collection(db, name));
  if (snap.size > 0) {
    console.log(`${name}: already has ${snap.size} docs — skipping`);
    return;
  }
  for (const d of docs) {
    await addDoc(collection(db, name), d);
  }
  console.log(`${name}: ${docs.length} seeded`);
}

const LESSON_NAMES = [
  "Introduction & Overview",
  "Chapter 1: Core Concepts",
  "Chapter 2: Practice Problems",
  "Chapter 3: Advanced Topics",
  "Mock Test Walkthrough",
];

async function main() {
  await signInWithEmailAndPassword(
    auth,
    "super_admin@demo.starcoaching.edu.np",
    "Star#Demo2026!Kx7",
  );
  console.log("Signed in");

  const courseSnap = await getDocs(query(collection(db, "lms_courses"), orderBy("order", "asc")));
  const courseById = new Map();
  for (const d of courseSnap.docs) {
    courseById.set(d.data().slug, { id: d.id, title: d.data().title });
  }
  console.log(`lms_courses: ${courseById.size} available`);

  const lessons = [];
  const quizzes = [];
  for (const [slug, course] of courseById.entries()) {
    LESSON_NAMES.forEach((name, i) => {
      lessons.push({
        courseId: course.id,
        title: `${course.title} — ${name}`,
        description: `Self-paced lesson ${i + 1} for ${course.title}. Includes notes and practice material curated by Star Coaching Institute.`,
        videoUrl: "",
        documentUrl: "",
        duration: i % 2 === 0 ? "45 min" : "60 min",
        order: i,
        isPublished: true,
        isFree: i === 0,
        createdAt: new Date().toISOString(),
      });
    });
    quizzes.push({
      courseId: course.id,
      title: `${course.title} — Unit Quiz`,
      description: `Quick knowledge check covering the core ${course.title} syllabus topics.`,
      timeLimit: 15,
      passingScore: 60,
      totalQuestions: 5,
      isPublished: true,
      createdAt: new Date().toISOString(),
      questions: [
        {
          id: "q1",
          question: `Which subject area is most important for ${course.title} preparation?`,
          type: "mcq",
          options: ["General Knowledge", "Mathematics", "English", "All of the above"],
          correctAnswer: "All of the above",
          points: 10,
        },
        {
          id: "q2",
          question: "What is the capital of Nepal?",
          type: "mcq",
          options: ["Pokhara", "Kathmandu", "Lalitpur", "Biratnagar"],
          correctAnswer: "Kathmandu",
          points: 10,
        },
        {
          id: "q3",
          question: "The national bird of Nepal is the ...",
          type: "fill_blank",
          options: ["Danphe", "Sparrow", "Eagle", "Parrot"],
          correctAnswer: "Danphe",
          points: 10,
        },
        {
          id: "q4",
          question: "Current Affairs are essential for competitive exams.",
          type: "true_false",
          options: ["True", "False"],
          correctAnswer: "True",
          points: 10,
        },
        {
          id: "q5",
          question: "Regular mock tests improve exam performance.",
          type: "true_false",
          options: ["True", "False"],
          correctAnswer: "True",
          points: 10,
        },
      ],
    });
  }

  await seedIfEmpty("lms_lessons", lessons);
  await seedIfEmpty("lms_quizzes", quizzes);

  const firstCourse = courseById.values().next().value;
  const secondCourse = [...courseById.values()][1];

  await seedIfEmpty("lms_enrollments", [
    {
      studentId: STUDENT_UID,
      studentName: "Aarav Sharma",
      studentEmail: "aarav.sharma@demo.np",
      courseId: firstCourse.id,
      courseName: firstCourse.title,
      progress: 40,
      completedLessons: [],
      enrolledAt: new Date(Date.now() - 30 * 86400000).toISOString(),
      status: "active",
    },
    {
      studentId: STUDENT_UID,
      studentName: "Aarav Sharma",
      studentEmail: "aarav.sharma@demo.np",
      courseId: secondCourse.id,
      courseName: secondCourse.title,
      progress: 15,
      completedLessons: [],
      enrolledAt: new Date(Date.now() - 12 * 86400000).toISOString(),
      status: "active",
    },
    {
      studentId: "oYgl1Ki6oBaNW78aVqisx2gph7i2",
      studentName: "Ananya Sharma",
      studentEmail: "ananya.sharma@demo.np",
      courseId: firstCourse.id,
      courseName: firstCourse.title,
      progress: 75,
      completedLessons: [],
      enrolledAt: new Date(Date.now() - 45 * 86400000).toISOString(),
      status: "active",
    },
  ]);

  const quizSnap = await getDocs(collection(db, "lms_quizzes"));
  const firstQuiz = quizSnap.docs[0];
  if (firstQuiz) {
    await seedIfEmpty("lms_quiz_attempts", [
      {
        studentId: STUDENT_UID,
        studentName: "Aarav Sharma",
        quizId: firstQuiz.id,
        quizTitle: firstQuiz.data().title || "Unit Quiz",
        courseId: firstQuiz.data().courseId || "",
        score: 40,
        totalPoints: 50,
        answers: { q1: "All of the above", q2: "Kathmandu" },
        startedAt: new Date().toISOString(),
        completedAt: new Date().toISOString(),
      },
    ]);
  } else {
    console.log("lms_quiz_attempts: skipped (no quizzes found)");
  }

  console.log("ALL DONE");
}

main()
  .then(() => process.exit(0))
  .catch((e) => {
    console.error("SEED FAILED:", e.message);
    process.exit(1);
  });
