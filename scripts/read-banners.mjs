import { initializeApp } from "firebase/app";
import { getFirestore, collection, getDocs } from "firebase/firestore";

const app = initializeApp({
  apiKey: "AIzaSyC5eZvLkCskpmgeAYBmAPmtOeL_0UsuiMA",
  authDomain: "starcoachinginstitutenepal.firebaseapp.com",
  projectId: "starcoachinginstitutenepal",
});

const db = getFirestore(app);

const snap = await getDocs(collection(db, "banners"));
console.log(`banners docs: ${snap.size}`);
snap.docs.forEach((d) => {
  const b = d.data();
  console.log("-", d.id, {
    title: b.title,
    isActive: b.isActive,
    sortOrder: b.sortOrder,
    storagePath: b.storagePath ?? "(none)",
    imageUrl: String(b.imageUrl ?? "").slice(0, 140),
  });
});
