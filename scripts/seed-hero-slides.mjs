import { initializeApp } from "firebase/app";
import { getFirestore, collection, getDocs, updateDoc, doc } from "firebase/firestore";
import { getAuth, signInWithEmailAndPassword } from "firebase/auth";

const app = initializeApp({
  apiKey: "AIzaSyC5eZvLkCskpmgeAYBmAPmtOeL_0UsuiMA",
  authDomain: "starcoachinginstitutenepal.firebaseapp.com",
  projectId: "starcoachinginstitutenepal",
});

const db = getFirestore(app);
const auth = getAuth(app);

const SLIDES = [
  {
    id: "hero-1",
    desktopImage: "/images/hero/feature-1.svg",
    mobileImage: "",
    description: "",
    buttonType: "solid",
    overlay: 70,
    alignment: "left",
    duration: 4500,
    status: "published",
  },
  {
    id: "hero-2",
    desktopImage: "/images/hero/feature-2.svg",
    mobileImage: "",
    description: "",
    buttonType: "solid",
    overlay: 70,
    alignment: "left",
    duration: 4500,
    status: "published",
  },
  {
    id: "hero-3",
    desktopImage: "/images/hero/feature-3.svg",
    mobileImage: "",
    description: "",
    buttonType: "solid",
    overlay: 70,
    alignment: "left",
    duration: 4500,
    status: "published",
  },
  {
    id: "hero-4",
    desktopImage: "/images/hero/feature-4.svg",
    mobileImage: "",
    description: "",
    buttonType: "solid",
    overlay: 70,
    alignment: "left",
    duration: 4500,
    status: "published",
  },
  {
    id: "hero-5",
    desktopImage: "/images/hero/feature-5.svg",
    mobileImage: "",
    description: "",
    buttonType: "solid",
    overlay: 70,
    alignment: "left",
    duration: 4500,
    status: "published",
  },
];

async function main() {
  await signInWithEmailAndPassword(
    auth,
    "super_admin@demo.starcoaching.edu.np",
    "Star#Demo2026!Kx7",
  );
  console.log("Signed in");

  const existing = await getDocs(collection(db, "hero_slides"));
  const existingIds = new Set(existing.docs.map((d) => d.id));

  let updated = 0;
  let added = 0;

  for (const s of SLIDES) {
    if (existingIds.has(s.id)) {
      await updateDoc(doc(db, "hero_slides", s.id), {
        desktopImage: s.desktopImage,
        mobileImage: s.mobileImage,
        description: s.description,
        buttonType: s.buttonType,
        overlay: s.overlay,
        alignment: s.alignment,
        duration: s.duration,
        status: s.status,
        isActive: true,
        updatedAt: new Date().toISOString(),
      });
      updated++;
    }
  }

  console.log(`hero_slides: ${updated} updated in place`);
}

main()
  .then(() => process.exit(0))
  .catch((e) => {
    console.error(e);
    process.exit(1);
  });
