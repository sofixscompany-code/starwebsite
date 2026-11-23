/** Firebase Auth-compatible client backed by Cognito through our Lambda API. */
import { api, getSession, setSession, subscribe, type AwsSession } from "./runtime";

export interface User {
  uid: string;
  email: string | null;
  displayName: string | null;
  photoURL: string | null;
  emailVerified: boolean;
  providerId: string;
  getIdToken: (forceRefresh?: boolean) => Promise<string>;
  delete: () => Promise<void>;
}

export interface Auth {
  currentUser: User | null;
  app: unknown;
  authStateReady: () => Promise<void>;
}

export interface UserCredential {
  user: User;
  credential: unknown;
}

export interface AuthCredential {
  email: string;
  password: string;
}

let lastPassword = "";

function makeUser(session: AwsSession): User {
  return {
    uid: session.uid,
    email: session.email || null,
    displayName: session.displayName || null,
    photoURL: null,
    emailVerified: true,
    providerId: "cognito",
    getIdToken: async () => session.idToken,
    delete: async () => {
      await api("auth", { action: "deleteUser" });
      setSession(null);
    },
  };
}

const authInstance: Auth = {
  currentUser: getSession() ? makeUser(getSession()!) : null,
  app: null,
  authStateReady: async () => {
    // Session is restored synchronously from localStorage on module load.
  },
};
const authListeners = new Set<(user: User | null) => void>();

subscribe(() => {
  const current = getSession();
  authInstance.currentUser = current ? makeUser(current) : null;
  authListeners.forEach((cb) => cb(authInstance.currentUser));
});

export function getAuth(app?: unknown): Auth {
  if (app) authInstance.app = app;
  return authInstance;
}

export function onAuthStateChanged(
  _auth: Auth,
  next: (user: User | null) => void,
  error?: (err: Error) => void,
): () => void {
  authListeners.add(next);
  // Firebase invokes the callback once immediately with the restored session.
  Promise.resolve().then(() => {
    try {
      next(authInstance.currentUser);
    } catch (err) {
      error?.(err instanceof Error ? err : new Error(String(err)));
    }
  });
  return () => authListeners.delete(next);
}

interface AuthResponse {
  ok?: boolean;
  IdToken?: string;
  AccessToken?: string;
  RefreshToken?: string;
  user?: { uid?: string; email?: string; name?: string; role?: string };
}

function applyTokens(res: AuthResponse, password?: string): User {
  if (!res.AccessToken || !res.IdToken || !res.user?.uid) {
    throw new Error("Authentication response was incomplete");
  }
  if (password !== undefined) lastPassword = password;
  setSession({
    accessToken: res.AccessToken,
    idToken: res.IdToken,
    refreshToken: res.RefreshToken || "",
    uid: res.user.uid,
    email: res.user.email || "",
    displayName: res.user.name || "",
    role: res.user.role || "student",
  });
  return makeUser(getSession()!);
}

export async function signInWithEmailAndPassword(
  _auth: Auth,
  email: string,
  password: string,
): Promise<UserCredential> {
  const res = await api<AuthResponse>("auth", { action: "signin", email, password });
  const user = applyTokens(res, password);
  return { user, credential: {} };
}

export async function createUserWithEmailAndPassword(
  _auth: Auth,
  email: string,
  password: string,
): Promise<UserCredential> {
  const res = await api<AuthResponse>("auth", {
    action: "signup",
    email,
    password,
    profile: { name: email.split("@")[0] },
  });
  const user = applyTokens(res, password);
  return { user, credential: {} };
}

export async function signOut(_auth: Auth): Promise<void> {
  lastPassword = "";
  setSession(null);
}

export async function updateProfile(
  user: User,
  updates: { displayName?: string | null; photoURL?: string | null },
): Promise<void> {
  await api("auth", {
    action: "profile",
    displayName: updates.displayName ?? undefined,
    photoURL: updates.photoURL ?? undefined,
  });
  const current = getSession();
  if (current) {
    setSession({
      ...current,
      displayName: updates.displayName ? String(updates.displayName) : current.displayName,
    });
  }
  void user;
}

export async function sendPasswordResetEmail(_auth: Auth, email: string): Promise<void> {
  await api("auth", { action: "reset", email });
}

export async function updatePassword(user: User, password: string): Promise<void> {
  await api("auth", {
    action: "changePassword",
    oldPassword: lastPassword,
    newPassword: password,
  });
  lastPassword = password;
  void user;
}

export const EmailAuthProvider = {
  credential: (email: string, password: string): AuthCredential => ({ email, password }),
};

export async function reauthenticateWithCredential(
  user: User,
  credential: AuthCredential,
): Promise<UserCredential> {
  const res = await api<AuthResponse>("auth", {
    action: "signin",
    email: credential.email,
    password: credential.password,
  });
  const refreshed = applyTokens(res, credential.password);
  void user;
  return { user: refreshed, credential: {} };
}

export async function sendEmailVerification(_user: User): Promise<void> {
  // Cognito accounts are created pre-verified by the provisioning API.
}
