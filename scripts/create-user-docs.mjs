/**
 * Create Firestore user docs while signed in as super_admin.
 * Run: node scripts/create-user-docs.mjs
 */
import { initializeApp } from "firebase/app";
import { getAuth, signInWithEmailAndPassword } from "firebase/auth";
import { getFirestore, doc, setDoc, serverTimestamp } from "firebase/firestore";

const firebaseConfig = {
  apiKey: "AIzaSyC5eZvLkCskpmgeAYBmAPmtOeL_0UsuiMA",
  authDomain: "starcoachinginstitutenepal.firebaseapp.com",
  projectId: "starcoachinginstitutenepal",
  storageBucket: "starcoachinginstitutenepal.firebasestorage.app",
  messagingSenderId: "804111153367",
  appId: "1:804111153367:web:3f331f12df5b4c31be5892",
};

const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const db = getFirestore(app);
const API_KEY = firebaseConfig.apiKey;

const ACCOUNTS = [
  { username: "admin", password: "admin123", role: "super_admin", name: "Super Admin" },
  { username: "teacher", password: "teacher123", role: "teacher", name: "Demo Teacher" },
  {
    username: "accountant",
    password: "accountant123",
    role: "accountant",
    name: "Demo Accountant",
  },
];

/** Get UID for an email/password by signing in via REST (doesn't affect current session). */
async function getUidForAccount(email, password) {
  const res = await fetch(
    `https://identitytoolkit.googleapis.com/v1/accounts:signInWithPassword?key=${API_KEY}`,
    {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email, password, returnSecureToken: true }),
    },
  );
  const json = await res.json();
  return json.localId || null;
}

async function main() {
  // Sign in as the existing demo super_admin
  console.log("Signing in as demo super_admin...");
  await signInWithEmailAndPassword(
    auth,
    "super_admin@demo.starcoaching.edu.np",
    "Star#Demo2026!Kx7",
  );
  console.log("✅ Signed in as super_admin\n");

  for (const acct of ACCOUNTS) {
    const email = `${acct.username}@starcoaching.edu.np`;
    try {
      // Get the UID via REST API (doesn't switch session)
      const uid = await getUidForAccount(email, acct.password);
      if (!uid) {
        console.log(`❌ Could not get UID for ${email}`);
        continue;
      }

      // Create Firestore doc as super_admin (has write permission)
      await setDoc(
        doc(db, "users", uid),
        {
          email,
          role: acct.role,
          fullName: acct.name,
          username: acct.username,
          createdAt: serverTimestamp(),
        },
        { merge: true },
      );

      console.log(
        `✅ ${acct.username} / ${acct.password} → ${email} (uid: ${uid}, role: ${acct.role})`,
      );
    } catch (e) {
      console.log(`❌ ${acct.username}: ${e.message}`);
    }
  }

  console.log("\nDone!");
  process.exit(0);
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
