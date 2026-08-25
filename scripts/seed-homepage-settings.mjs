import { initializeApp } from "firebase/app";
import { getFirestore, doc, setDoc, getDoc, getDocs, collection } from "firebase/firestore";
import { getAuth, signInWithEmailAndPassword } from "firebase/auth";

const app = initializeApp({
  apiKey: "AIzaSyC5eZvLkCskpmgeAYBmAPmtOeL_0UsuiMA",
  authDomain: "starcoachinginstitutenepal.firebaseapp.com",
  projectId: "starcoachinginstitutenepal",
});
const db = getFirestore(app);
const auth = getAuth(app);

async function main() {
  await signInWithEmailAndPassword(auth, "super_admin@demo.starcoaching.edu.np", "Demo@2026!");
  console.log("Signed in");

  // why_choose_us
  const wcuSnap = await getDocs(collection(db, "why_choose_us"));
  if (wcuSnap.empty) {
    const items = [
      "Experienced faculty from real service backgrounds",
      "Daily physical + written training",
      "Regular mock tests & OMR-based practice",
      "Hostel for both boys and girls",
      "Super 40 Scholarship — up to 40% off",
    ];
    let i = 1;
    for (const text of items) {
      await setDoc(doc(db, "why_choose_us", `wcu-${i}`), { text, order: i });
      i++;
    }
    console.log(`why_choose_us: ${items.length} seeded`);
  } else {
    console.log(`why_choose_us: already has ${wcuSnap.size} docs`);
  }

  // md_message
  const mdSnap = await getDoc(doc(db, "homepage_settings", "md_message"));
  if (!mdSnap.exists()) {
    await setDoc(doc(db, "homepage_settings", "md_message"), {
      name: "Er. Bablu Yadav",
      initials: "BY",
      message:
        "Dear students and parents, as the Managing Director of Star Coaching Institute, I want to say that education is not just about academics — it's a journey of personal growth, skill development, and pursuit of dreams. Our dedicated team is committed to your success. Stay focused, work hard, and never hesitate to reach out. We are here for you.",
    });
    console.log("homepage_settings/md_message seeded");
  } else {
    console.log("homepage_settings/md_message already exists");
  }
}

main()
  .then(() => process.exit(0))
  .catch((e) => {
    console.error(e);
    process.exit(1);
  });
