import { initializeApp } from "firebase/app";
import { getAuth, createUserWithEmailAndPassword, signInWithEmailAndPassword } from "firebase/auth";
import { getFirestore, doc, setDoc, getDoc } from "firebase/firestore";

const cfg = {
  apiKey: "AIzaSyC5eZvLkCskpmgeAYBmAPmtOeL_0UsuiMA",
  authDomain: "starcoachinginstitutenepal.firebaseapp.com",
  projectId: "starcoachinginstitutenepal",
  storageBucket: "starcoachinginstitutenepal.firebasestorage.app",
  messagingSenderId: "804111153367",
  appId: "1:804111153367:web:3f331f12df5b4c31be5892",
};

const app = initializeApp(cfg);
const auth = getAuth(app);
const db = getFirestore(app);

const role = process.argv[2] || "teacher";
const email = `${role}@demo.starcoaching.edu.np`;
const password = "Demo@2026!";

try {
  let cred;
  try {
    cred = await createUserWithEmailAndPassword(auth, email, password);
    console.log("AUTH: created new user", cred.user.uid);
    await setDoc(doc(db, "users", cred.user.uid), {
      uid: cred.user.uid,
      email,
      full_name: role,
      role,
      branch: "Main Branch",
      status: "active",
      createdAt: new Date().toISOString(),
    });
    console.log("FIRESTORE: profile written");
  } catch (e) {
    if (e.code === "auth/email-already-in-use") {
      cred = await signInWithEmailAndPassword(auth, email, password);
      console.log("AUTH: signed in existing user", cred.user.uid);
    } else throw e;
  }
  const snap = await getDoc(doc(db, "users", cred.user.uid));
  console.log("FIRESTORE role:", snap.exists() ? snap.data().role : "NO DOC");
  console.log("RESULT: OK");
} catch (e) {
  console.log("RESULT: FAIL -", e.code || e.message);
}
process.exit(0);
