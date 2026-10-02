// Seeds the homepage banner via the client SDK, signed in as the super_admin
// demo account (firestore.rules: banners write = super_admin only).
import { initializeApp } from "firebase/app";
import { getFirestore, collection, getDocs, addDoc, serverTimestamp } from "firebase/firestore";
import { getAuth, signInWithEmailAndPassword } from "firebase/auth";

const app = initializeApp({
  apiKey: "AIzaSyC5eZvLkCskpmgeAYBmAPmtOeL_0UsuiMA",
  authDomain: "starcoachinginstitutenepal.firebaseapp.com",
  projectId: "starcoachinginstitutenepal",
});
const db = getFirestore(app);
const auth = getAuth(app);

const IMAGE_URL = "https://starcoachinginstitutenepal.web.app/BANNER/BANNER%201.png";

try {
  await signInWithEmailAndPassword(
    auth,
    "super_admin@demo.starcoaching.edu.np",
    "Star#Demo2026!Kx7",
  );
  console.log("Signed in as super_admin demo");

  const snap = await getDocs(collection(db, "banners"));
  if (snap.empty) {
    const ref = await addDoc(collection(db, "banners"), {
      title: null,
      subtitle: null,
      ctaText: null,
      ctaLink: null,
      sortOrder: 0,
      imageUrl: IMAGE_URL,
      isActive: true,
      createdAt: serverTimestamp(),
    });
    console.log("ADDED banner doc:", ref.id);
  } else {
    console.log(`banners already exist (${snap.size}) — left untouched:`);
    snap.docs.forEach((d) => console.log("-", d.id, String(d.data().imageUrl ?? "").slice(0, 100)));
  }
} catch (e) {
  console.error("ERROR:", e.code ?? "", e.message);
  process.exitCode = 1;
}
process.exit(process.exitCode ?? 0);
