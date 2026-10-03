/**
 * Create simple login accounts for all roles.
 * Uses REST API to create Auth users without switching session.
 * Run: node scripts/seed-simple-accounts.mjs
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

const DOMAIN = "starcoaching.edu.np";
const API_KEY = firebaseConfig.apiKey;

const ACCOUNTS = [
  { username: "admin", password: "admin123", role: "super_admin", name: "Super Admin" },
  { username: "teacher", password: "teacher123", role: "teacher", name: "Demo Teacher" },
  { username: "student", password: "student123", role: "student", name: "Demo Student" },
  { username: "parent", password: "parent123", role: "parent", name: "Demo Parent" },
  {
    username: "accountant",
    password: "accountant123",
    role: "accountant",
    name: "Demo Accountant",
  },
];

/** Create a Firebase Auth user via REST (does NOT switch the current session). */
async function createAuthUser(email, password) {
  const res = await fetch(
    `https://identitytoolkit.googleapis.com/v1/accounts:signUp?key=${API_KEY}`,
    {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email, password, returnSecureToken: false }),
    },
  );
  const json = await res.json();
  if (!res.ok || !json.localId) {
    if (json.error?.message?.includes("EMAIL_EXISTS")) return null; // already exists
    throw new Error(json.error?.message || "Account creation failed");
  }
  return json.localId;
}

async function main() {
  console.log("Creating simple login accounts...\n");

  // Sign in as super_admin so we can write Firestore docs
  try {
    await signInWithEmailAndPassword(
      auth,
      "super_admin@demo.starcoaching.edu.np",
      "Star#Demo2026!Kx7",
    );
    console.log("✅ Signed in as super_admin\n");
  } catch (e) {
    console.log("⚠️  Could not sign in as super_admin:", e.message, "\n");
  }

  for (const acct of ACCOUNTS) {
    const email = `${acct.username}@${DOMAIN}`;
    try {
      const uid = await createAuthUser(email, acct.password);

      if (uid) {
        console.log(`✅ Auth created: ${acct.username} → ${email} (uid: ${uid})`);
      } else {
        console.log(`⏭️  Auth exists: ${acct.username} → ${email}`);
        // Try to get UID from existing sign-in
        // We'll create/update the Firestore doc anyway
      }

      // Write Firestore user doc (need UID — if account existed, we need to find it)
      // For simplicity, use username as doc ID pattern
      const docId = uid || acct.username;

      // Check if doc already exists
      const existingDoc = await getDoc(doc(db, "users", docId)).catch(() => null);

      await setDoc(
        doc(db, "users", docId),
        {
          email,
          role: acct.role,
          fullName: acct.name,
          username: acct.username,
          createdAt: existingDoc?.exists() ? existingDoc.data()?.createdAt : serverTimestamp(),
          updatedAt: serverTimestamp(),
        },
        { merge: true },
      );

      console.log(`   📄 Firestore doc: users/${docId} (${acct.role})\n`);
    } catch (e) {
      console.log(`❌ Failed ${acct.username}: ${e.message}\n`);
    }
  }

  console.log("\n═══════════════════════════════════════════════════");
  console.log("  SIMPLE LOGIN CREDENTIALS");
  console.log("═══════════════════════════════════════════════════");
  console.log("  Website: https://starcoachinginstitutenepal.web.app/admin");
  console.log("  Mobile:  Username = username below, Password = password below");
  console.log("═══════════════════════════════════════════════════\n");
  console.log("  ┌─────────────┬───────────────┬───────────────┐");
  console.log("  │ Username    │ Password      │ Role          │");
  console.log("  ├─────────────┼───────────────┼───────────────┤");
  for (const a of ACCOUNTS) {
    console.log(`  │ ${a.username.padEnd(11)} │ ${a.password.padEnd(13)} │ ${a.role.padEnd(13)} │`);
  }
  console.log("  └─────────────┴───────────────┴───────────────┘");
  console.log("\n  Website also accepts: Starcoaching@gmail.com (super admin)\n");

  process.exit(0);
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
