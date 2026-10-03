/**
 * Fix: ensure Firestore user docs exist at the correct UID path.
 * Run: node scripts/fix-account-uids.mjs
 */
import { initializeApp } from "firebase/app";
import { getAuth, signInWithEmailAndPassword } from "firebase/auth";
import { getFirestore, doc, setDoc, getDoc, serverTimestamp } from "firebase/firestore";

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

const ACCOUNTS = [
  {
    email: "admin@starcoaching.edu.np",
    password: "admin123",
    role: "super_admin",
    name: "Super Admin",
  },
  {
    email: "teacher@starcoaching.edu.np",
    password: "teacher123",
    role: "teacher",
    name: "Demo Teacher",
  },
  {
    email: "student@starcoaching.edu.np",
    password: "student123",
    role: "student",
    name: "Demo Student",
  },
  {
    email: "parent@starcoaching.edu.np",
    password: "parent123",
    role: "parent",
    name: "Demo Parent",
  },
  {
    email: "accountant@starcoaching.edu.np",
    password: "accountant123",
    role: "accountant",
    name: "Demo Accountant",
  },
];

async function main() {
  console.log("Fixing Firestore user docs at correct UIDs...\n");

  for (const acct of ACCOUNTS) {
    try {
      // Sign in as this user to get their UID
      const cred = await signInWithEmailAndPassword(auth, acct.email, acct.password);
      const uid = cred.user.uid;

      // Check if doc already exists at correct UID
      const existing = await getDoc(doc(db, "users", uid));

      if (existing.exists()) {
        const data = existing.data();
        if (data.role === acct.role) {
          console.log(
            `✅ ${acct.email} → uid:${uid} — doc exists with correct role (${acct.role})`,
          );
        } else {
          // Update role
          await setDoc(
            doc(db, "users", uid),
            { role: acct.role, updatedAt: serverTimestamp() },
            { merge: true },
          );
          console.log(`🔧 ${acct.email} → uid:${uid} — updated role to ${acct.role}`);
        }
      } else {
        // Create doc at correct UID
        await setDoc(doc(db, "users", uid), {
          email: acct.email,
          role: acct.role,
          fullName: acct.name,
          createdAt: serverTimestamp(),
        });
        console.log(`✅ ${acct.email} → uid:${uid} — created doc (${acct.role})`);
      }
    } catch (e) {
      console.log(`❌ ${acct.email}: ${e.message}`);
    }
  }

  // Sign back in as super_admin for the session
  try {
    await signInWithEmailAndPassword(
      auth,
      "super_admin@demo.starcoaching.edu.np",
      "Star#Demo2026!Kx7",
    );
  } catch {}

  console.log("\nDone!");
  process.exit(0);
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
