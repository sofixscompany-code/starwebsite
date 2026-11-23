/**
 * Shared runtime for the AWS compatibility layer.
 * The rest of the app keeps using the familiar Firebase-style API; every call
 * is translated here into a request to our Lambda API (Cognito + DynamoDB + S3).
 */

export const awsConfig = {
  apiUrl: (import.meta.env.VITE_AWS_API_URL as string) || "",
  userPoolId: (import.meta.env.VITE_AWS_USER_POOL_ID as string) || "",
  appClientId: (import.meta.env.VITE_AWS_APP_CLIENT_ID as string) || "",
  mediaBase: (import.meta.env.VITE_AWS_MEDIA_BASE as string) || "",
};

export interface AwsSession {
  accessToken: string;
  idToken: string;
  refreshToken: string;
  uid: string;
  email: string;
  displayName: string;
  role: string;
}

const SESSION_KEY = "star_aws_session";
let session: AwsSession | null = null;
const listeners = new Set<() => void>();

try {
  const raw = localStorage.getItem(SESSION_KEY);
  if (raw) session = JSON.parse(raw) as AwsSession;
} catch {
  session = null;
}

export function getSession(): AwsSession | null {
  return session;
}

export function setSession(next: AwsSession | null): void {
  session = next;
  try {
    if (next) localStorage.setItem(SESSION_KEY, JSON.stringify(next));
    else localStorage.removeItem(SESSION_KEY);
  } catch {
    /* storage can be disabled — in-memory session still works */
  }
  listeners.forEach((fn) => fn());
}

export function subscribe(fn: () => void): () => void {
  listeners.add(fn);
  return () => listeners.delete(fn);
}

export function validateConfig(): void {
  if (!awsConfig.apiUrl) {
    throw new Error("Missing VITE_AWS_API_URL. Add the AWS API URL to .env.");
  }
}

export async function api<T = Record<string, unknown>>(
  path: "auth" | "data" | "storage",
  body: Record<string, unknown>,
): Promise<T> {
  validateConfig();
  const res = await fetch(`${awsConfig.apiUrl.replace(/\/$/, "")}/${path}`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ token: session?.accessToken || null, ...body }),
  });
  const payload = (await res.json().catch(() => ({}))) as T & {
    ok?: boolean;
    error?: string;
  };
  if (!res.ok || payload.ok === false) {
    const error = new Error(payload.error || `AWS API error (${res.status})`) as Error & {
      code?: string;
    };
    if (/password/i.test(payload.error || "")) error.code = "auth/wrong-password";
    throw error;
  }
  return payload;
}

export function randomId(): string {
  if (typeof crypto !== "undefined" && "randomUUID" in crypto) return crypto.randomUUID();
  return `${Date.now()}-${Math.random().toString(36).slice(2, 11)}`;
}
