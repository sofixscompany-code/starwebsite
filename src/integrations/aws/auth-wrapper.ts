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
} from "./auth";
import { auth, db, validateConfig } from "./config";
import { api } from "./runtime";
import { doc, setDoc } from "./firestore";

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
      return { data: { user: auth.currentUser }, error: null };
    } catch (err) {
      return { data: { user: null }, error: err instanceof Error ? err : new Error(String(err)) };
    }
  },

  /** Waits for the restored AWS/Cognito session before reading currentUser. */
  async waitForUser(): Promise<AuthResult> {
    try {
      validateConfig();
      const user = await new Promise<FirebaseUser | null>((resolve) => {
        const unsub = onAuthStateChanged(
          auth,
          (u) => {
            unsub();
            resolve(u);
          },
          () => {
            unsub();
            resolve(null);
          },
        );
      });
      return { data: { user }, error: null };
    } catch (err) {
      return { data: { user: null }, error: err instanceof Error ? err : new Error(String(err)) };
    }
  },

  async getSession(): Promise<AuthResult> {
    return this.getUser();
  },

  async signInWithPassword({ email, password }: { email: string; password: string }) {
    return safe(async () => {
      validateConfig();
      const cred = await signInWithEmailAndPassword(auth, email, password);
      return { user: cred.user as FirebaseUser | null };
    });
  },

  async signUp({
    email,
    password,
    options,
  }: {
    email: string;
    password: string;
    options?: { emailRedirectTo?: string; data?: Record<string, unknown> };
  }) {
    return safe(async () => {
      validateConfig();
      const cred = await createUserWithEmailAndPassword(auth, email, password);
      if (options?.data?.full_name) {
        await updateProfile(cred.user, { displayName: options.data.full_name as string });
      }
      if (options?.data) {
        try {
          await setDoc(doc(db, "users", cred.user.uid), {
            uid: cred.user.uid,
            email: cred.user.email,
            ...options.data,
            createdAt: new Date().toISOString(),
          });
        } catch {
          // Profile doc will be created/adjusted later by an admin.
        }
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
      await reauthenticateWithCredential(
        user,
        EmailAuthProvider.credential(user.email, currentPassword),
      );
      return null;
    });
  },

  onAuthStateChange(callback: (event: string, user: FirebaseUser | null) => void) {
    return onAuthStateChanged(auth, (user) => callback("SIGNED_IN", user));
  },

  /** Provision an account without changing the current session. */
  async createUser(email: string, password: string, name?: string): Promise<string | null> {
    const res = await apiCreateUser(email, password, name);
    return res;
  },
};

async function apiCreateUser(
  email: string,
  password: string,
  name?: string,
): Promise<string | null> {
  const res = await api<{ ok: boolean; uid: string | null }>("auth", {
    action: "createUser",
    email,
    password,
    name,
  });
  return res.uid || null;
}

export { auth, db };
