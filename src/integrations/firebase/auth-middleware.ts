import { createMiddleware } from "@tanstack/react-start";
import { getRequest } from "@tanstack/react-start/server";
import { getAuth } from "firebase-admin/auth";
import { initializeApp, getApps, cert } from "firebase-admin/app";

function getFirebaseAdminAuth() {
  if (!getApps().length) {
    const projectId = process.env.VITE_FIREBASE_PROJECT_ID;
    const clientEmail = process.env.FIREBASE_CLIENT_EMAIL;
    const privateKey = process.env.FIREBASE_PRIVATE_KEY?.replace(/\\n/g, "\n");

    if (!projectId) {
      throw new Error("Missing FIREBASE_PROJECT_ID for server-side auth.");
    }

    if (clientEmail && privateKey) {
      initializeApp({
        credential: cert({ projectId, clientEmail, privateKey }),
      });
    } else {
      initializeApp({ projectId });
    }
  }
  return getAuth();
}

export const requireFirebaseAuth = createMiddleware({ type: "function" }).server(
  async ({ next }) => {
    const request = getRequest();
    if (!request?.headers) {
      throw new Error("Unauthorized: No request headers available");
    }

    const authHeader = request.headers.get("authorization");
    if (!authHeader) {
      throw new Error("Unauthorized: No authorization header provided");
    }
    if (!authHeader.startsWith("Bearer ")) {
      throw new Error("Unauthorized: Only Bearer tokens are supported");
    }

    const token = authHeader.replace("Bearer ", "");
    if (!token) {
      throw new Error("Unauthorized: No token provided");
    }

    try {
      const adminAuth = getFirebaseAdminAuth();
      const decodedToken = await adminAuth.verifyIdToken(token);
      return next({
        context: {
          userId: decodedToken.uid,
          claims: decodedToken,
        },
      });
    } catch {
      throw new Error("Unauthorized: Invalid token");
    }
  },
);
