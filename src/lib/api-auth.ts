import { fetchUserRole, ROLE_DASHBOARD_ROUTES, ROLE_LABELS } from "@/hooks/use-user-role";
import { firebaseAuth } from "@/integrations/firebase/auth";

// Super Admin credentials (use env vars in production)
const SUPER_ADMIN_EMAIL = "Starcoaching@gmail.com";
const SUPER_ADMIN_PASSWORD = "Star2026@$";

export interface AuthUser {
  uid: string;
  email: string;
  role: string;
  name: string;
  dashboard: string;
}

export interface AuthResponse {
  token: string;
  user: AuthUser;
}

export interface VerifyResponse {
  valid: boolean;
  user: {
    uid: string;
    email: string;
    role: string;
    name: string;
  };
  dashboard: string;
}

function getToken(): string | null {
  return localStorage.getItem("auth_token");
}

export function setToken(token: string): void {
  localStorage.setItem("auth_token", token);
}

function getStoredUser(): AuthUser | null {
  const raw = localStorage.getItem("auth_user");
  if (!raw) return null;
  try {
    return JSON.parse(raw);
  } catch {
    return null;
  }
}

function setStoredUser(user: AuthUser): void {
  localStorage.setItem("auth_user", JSON.stringify(user));
}

export function clearAuthData(): void {
  localStorage.removeItem("auth_token");
  localStorage.removeItem("auth_user");
  localStorage.removeItem("demo_role");
  localStorage.removeItem("remember_email");
}

export function clearToken(): void {
  clearAuthData();
}

export function getUserRole(): string | null {
  const storedUser = getStoredUser();
  return storedUser?.role || null;
}

export function isAuthenticated(): boolean {
  return !!getToken() || !!getStoredUser() || !!localStorage.getItem("demo_role");
}

export async function login(email: string, password: string): Promise<AuthResponse> {
  // Check Super Admin hardcoded credentials
  const cleanEmail = email.trim().toLowerCase();
  const cleanPassword = password.trim();

  if (cleanEmail === SUPER_ADMIN_EMAIL.toLowerCase() && cleanPassword === SUPER_ADMIN_PASSWORD) {
    const user: AuthUser = {
      uid: "super-admin-hardcoded",
      email: SUPER_ADMIN_EMAIL,
      role: "super_admin",
      name: "Super Admin",
      dashboard: ROLE_DASHBOARD_ROUTES.super_admin,
    };
    setToken("super-admin-token");
    setStoredUser(user);
    return { token: "super-admin-token", user };
  }

  // Try Firebase Auth as fallback for other users
  try {
    const { data, error } = await firebaseAuth.signInWithPassword({ email: cleanEmail, password: cleanPassword });
    if (error) throw error;
    if (!data?.user) throw new Error("Invalid email or password");

    const role = await fetchUserRole(data.user.uid);
    if (!role) throw new Error("No role assigned. Contact administrator.");

    const user: AuthUser = {
      uid: data.user.uid,
      email: data.user.email || email,
      role,
      name: data.user.displayName || email.split("@")[0],
      dashboard: ROLE_DASHBOARD_ROUTES[role] || "/auth",
    };
    setToken("firebase-session");
    setStoredUser(user);
    return { token: "firebase-session", user };
  } catch (err) {
    if (err instanceof Error && err.message.includes("Invalid email or password")) {
      throw new Error("Invalid email or password");
    }
    throw new Error("Invalid email or password");
  }
}

export async function demoLogin(role: string): Promise<AuthResponse> {
  if (!ROLE_DASHBOARD_ROUTES[role]) throw new Error("Invalid demo role");

  const user: AuthUser = {
    uid: `demo-${role}`,
    email: `demo_${role}@sofixs.com`,
    role,
    name: ROLE_LABELS[role] || role,
    dashboard: ROLE_DASHBOARD_ROUTES[role],
  };
  setToken("demo-token");
  setStoredUser(user);
  localStorage.setItem("demo_role", role);
  return { token: "demo-token", user };
}

export async function verifyToken(): Promise<VerifyResponse> {
  // Check demo role
  const demoRole = localStorage.getItem("demo_role");
  const storedUser = getStoredUser();

  if (demoRole && storedUser) {
    return {
      valid: true,
      user: { uid: storedUser.uid, email: storedUser.email, role: storedUser.role, name: storedUser.name },
      dashboard: storedUser.dashboard,
    };
  }

  // Check Super Admin
  if (storedUser?.uid === "super-admin-hardcoded") {
    return {
      valid: true,
      user: { uid: storedUser.uid, email: storedUser.email, role: storedUser.role, name: storedUser.name },
      dashboard: storedUser.dashboard,
    };
  }

  // Check Firebase session
  try {
    const fbUser = await firebaseAuth.getUser();
    if (fbUser.data?.user) {
      const role = await fetchUserRole(fbUser.data.user.uid);
      if (role) {
        return {
          valid: true,
          user: { 
            uid: fbUser.data.user.uid, 
            email: fbUser.data.user.email || '', 
            role, 
            name: fbUser.data.user.displayName || '' 
          },
          dashboard: ROLE_DASHBOARD_ROUTES[role] || "/auth",
        };
      }
    }
  } catch {
    // Ignore Firebase errors
  }

  return { valid: false, user: { uid: '', email: '', role: '', name: '' }, dashboard: '/auth' };
}

export function getStoredRole(): string | null {
  const user = getStoredUser();
  return user?.role || localStorage.getItem("demo_role");
}

export async function handleSignOut(navigate: (to: string) => void): Promise<void> {
  clearAuthData();
  try {
    await firebaseAuth.signOut();
  } catch {
    // Ignore sign-out errors
  }
  navigate("/auth");
}
