const { onCall, HttpsError } = require("firebase-functions/v2/https");
const { initializeApp } = require("firebase-admin/app");
const { getAuth } = require("firebase-admin/auth");
const { getFirestore } = require("firebase-admin/firestore");

initializeApp();

/**
 * resetUserPassword({ email, newPassword }) — master-admin password reset.
 *
 * A browser client can NEVER set another user's Firebase Auth password
 * (accounts:update requires that user's idToken; verified 2026-10). Only a
 * server holding the Admin SDK can, so the super-admin dashboard calls this
 * callable function. Guard: the caller must be an authenticated super_admin
 * per their Firestore `users/{uid}` role doc.
 */
exports.resetUserPassword = onCall(async (request) => {
  const callerUid = request.auth?.uid;
  if (!callerUid) {
    throw new HttpsError("unauthenticated", "Sign in first.");
  }
  const callerDoc = await getFirestore().doc(`users/${callerUid}`).get();
  if (callerDoc.data()?.role !== "super_admin") {
    throw new HttpsError("permission-denied", "Super admin only.");
  }

  const { email, newPassword } = request.data || {};
  if (typeof email !== "string" || !email.includes("@")) {
    throw new HttpsError("invalid-argument", "A valid email/username is required.");
  }
  if (typeof newPassword !== "string" || newPassword.length < 6) {
    throw new HttpsError("invalid-argument", "Password must be at least 6 characters.");
  }

  try {
    const user = await getAuth().getUserByEmail(email);
    await getAuth().updateUser(user.uid, { password: newPassword });
    return { ok: true, uid: user.uid, email: user.email || email };
  } catch (e) {
    if (e.code === "auth/user-not-found") {
      throw new HttpsError("not-found", "No account exists for this email.");
    }
    throw new HttpsError("internal", e.message || "Password reset failed.");
  }
});
