// One-off: check whether Firebase Storage is enabled by doing a tiny
// upload+delete as super_admin. Prints SUCCESS (enabled) or the error code.
import { initializeApp } from "firebase/app";
import { getStorage, ref, uploadString, deleteObject } from "firebase/storage";
import { getAuth, signInWithEmailAndPassword } from "firebase/auth";

const app = initializeApp({
  apiKey: "AIzaSyC5eZvLkCskpmgeAYBmAPmtOeL_0UsuiMA",
  authDomain: "starcoachinginstitutenepal.firebaseapp.com",
  projectId: "starcoachinginstitutenepal",
  storageBucket: "starcoachinginstitutenepal.appspot.com",
});
const storage = getStorage(app);
const auth = getAuth(app);

const PNG =
  "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mP8z8BQDwAEhQGAhKmMIQAAAABJRU5ErkJggg==";

async function main() {
  await signInWithEmailAndPassword(
    auth,
    "super_admin@demo.starcoaching.edu.np",
    "Star#Demo2026!Kx7",
  );
  const r = ref(storage, "gallery/__storage_check.png");
  try {
    await uploadString(r, PNG, "data_url");
    console.log("SUCCESS: Firebase Storage is ENABLED (upload worked)");
    await deleteObject(r);
    console.log("cleanup: test object deleted");
  } catch (e) {
    console.log(`FAILED: code=${e.code || "?"} message=${e.message}`);
    if (String(e.code).includes("bucket") || String(e.message).includes("bucket")) {
      console.log("→ Storage likely NOT enabled (bucket missing).");
    } else if (String(e.code).includes("unauthorized") || String(e.code).includes("forbidden")) {
      console.log("→ Storage enabled but rules DENIED (not an enablement issue).");
    }
  }
}

main()
  .then(() => process.exit(0))
  .catch((e) => {
    console.error("FAILED:", e.code || "", e.message);
    process.exit(1);
  });
