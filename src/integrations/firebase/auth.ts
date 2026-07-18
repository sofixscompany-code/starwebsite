import {
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  signOut,
  onAuthStateChanged,
  updateProfile,
  sendPasswordResetEmail,
  updatePassword as firebaseUpdatePassword,
  reauthenticateWithCredential,
  EmailAuthProvider,
  type User,
} from "firebase/auth";
import { auth, validateConfig } from "./config";
import { doc, setDoc, getDoc } from "firebase/firestore";
import { db } from "./config";

export type FirebaseUser = User;

export interface AuthSession {
  user: FirebaseUser | null;
}

export interface AuthResult {
  data: { user: FirebaseUser | null };
  error: Error | null;
}

async function safe<T>(fn: () => Promise<T>): Promise<{ data: T | null; error: Error | null }> {
  try {
    const data = await fn();
    return { data, error: null };
  } catch (err) {
    return { data: null, error: err instanceof Error ? err : new Error(String(err)) };
  }
}

export const firebaseAuth = {
  async getUser(): Promise<AuthResult> {
    try {
      validateConfig();
      const user = auth.currentUser;
      return { data: { user }, error: null };
    } catch (err) {
      return { data: { user: null }, error: err instanceof Error ? err : new Error(String(err)) };
    }
  },

  async getSession(): Promise<AuthResult> {
    try {
      validateConfig();
      const user = auth.currentUser;
      return { data: { user }, error: null };
    } catch (err) {
      return { data: { user: null }, error: err instanceof Error ? err : new Error(String(err)) };
    }
  },

  async signInWithPassword({ email, password }: { email: string; password: string }): Promise<{ data: { user: FirebaseUser | null } | null; error: Error | null }> {
    return safe(async () => {
      validateConfig();
      const cred = await signInWithEmailAndPassword(auth, email, password);
      return { user: cred.user as FirebaseUser | null };
    });
  },

  async signUp({ email, password, options }: {
    email: string;
    password: string;
    options?: {
      emailRedirectTo?: string;
      data?: Record<string, unknown>;
    };
  }): Promise<{ data: { user: FirebaseUser | null } | null; error: Error | null }> {
    return safe(async () => {
      validateConfig();
      const cred = await createUserWithEmailAndPassword(auth, email, password);
      if (options?.data?.full_name) {
        await updateProfile(cred.user, { displayName: options.data.full_name as string });
      }
      if (options?.data) {
        await setDoc(doc(db, "users", cred.user.uid), {
          uid: cred.user.uid,
          email: cred.user.email,
          ...options.data,
          createdAt: new Date().toISOString(),
        });
      }
      return { user: cred.user as FirebaseUser | null };
    });
  },

  async signOut(): Promise<{ error: Error | null }> {
    return safe(async () => {
      validateConfig();
      await signOut(auth);
      return null;
    });
  },

  async resetPassword(email: string): Promise<{ error: Error | null }> {
    return safe(async () => {
      validateConfig();
      await sendPasswordResetEmail(auth, email);
      return null;
    });
  },

  async updatePassword(newPassword: string): Promise<{ error: Error | null }> {
    return safe(async () => {
      validateConfig();
      const user = auth.currentUser;
      if (!user) throw new Error("No user logged in");
      await firebaseUpdatePassword(user, newPassword);
      return null;
    });
  },

  async reauthenticate(currentPassword: string): Promise<{ error: Error | null }> {
    return safe(async () => {
      validateConfig();
      const user = auth.currentUser;
      if (!user || !user.email) throw new Error("No user logged in");
      const credential = EmailAuthProvider.credential(user.email, currentPassword);
      await reauthenticateWithCredential(user, credential);
      return null;
    });
  },

  onAuthStateChange(callback: (event: string, user: FirebaseUser | null) => void) {
    return onAuthStateChanged(auth, (user) => {
      callback("SIGNED_IN", user);
    });
  },
};

export { auth, db };
