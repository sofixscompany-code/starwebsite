import { firebaseConfig } from "@/integrations/firebase/config";

/**
 * Admin-assigned login credentials.
 *
 * The admin panel lets a super admin hand out a **username + password** for
 * any role. Firebase Auth only understands e-mail addresses, so a username is
 * mapped to an institute e-mail (`ram.teacher` → `ram.teacher@starcoaching.edu.np`).
 * The login form accepts either the bare username or a full e-mail.
 */
export const LOGIN_EMAIL_DOMAIN = "starcoaching.edu.np";

/** 3–30 chars, starts with a letter/number, then letters/numbers `. _ -`. */
export const USERNAME_PATTERN = /^[a-z0-9][a-z0-9._-]{2,29}$/;

export function usernameToLoginEmail(username: string): string {
  return `${username.trim().toLowerCase()}@${LOGIN_EMAIL_DOMAIN}`;
}

/** Accepts a full e-mail as-is, or maps a bare username to the institute domain. */
export function normalizeLoginId(input: string): string {
  const value = input.trim().toLowerCase();
  if (!value) return value;
  return value.includes("@") ? value : usernameToLoginEmail(value);
}

interface IdentityToolkitError {
  error?: { message?: string };
}

function identityErrorMessage(message: string, fallback: string): string {
  if (message.includes("EMAIL_EXISTS")) return "This username/email is already registered";
  if (message.includes("WEAK_PASSWORD")) return "Password is too weak (minimum 6 characters)";
  if (message.includes("INVALID_EMAIL")) return "Invalid email address";
  if (message.includes("EMAIL_NOT_FOUND")) return "No account found for this email";
  if (message.includes("INVALID_PASSWORD")) return "Incorrect password";
  if (message.includes("TOO_MANY_ATTEMPTS")) {
    return "Too many attempts — please wait a moment and try again";
  }
  return fallback;
}

/**
 * Create a Firebase Auth account from the client **without** switching the
 * current session to the new user. The SDK's `createUserWithEmailAndPassword`
 * would sign the admin out and sign in as the freshly created account, so we
 * call the public Identity Toolkit REST endpoint instead — the admin stays
 * logged in while the account is provisioned.
 *
 * @returns the new account's Firebase UID.
 */
export async function createAuthUser({
  email,
  password,
}: {
  email: string;
  password: string;
}): Promise<string> {
  const res = await fetch(
    `https://identitytoolkit.googleapis.com/v1/accounts:signUp?key=${firebaseConfig.apiKey}`,
    {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email, password, returnSecureToken: false }),
    },
  );
  const json = (await res.json().catch(() => ({}))) as {
    localId?: string;
  } & IdentityToolkitError;
  if (!res.ok || !json.localId) {
    throw new Error(
      identityErrorMessage(json.error?.message || "", "Account creation failed — please retry"),
    );
  }
  return json.localId;
}

/**
 * Send Firebase's password-reset e-mail. A client cannot force-set another
 * user's password (that requires the Admin SDK), so after creation this is
 * how the admin hands a user a new password later — the user clicks the link
 * and chooses it. Needs only the public API key.
 */
export async function sendPasswordReset(email: string): Promise<void> {
  const res = await fetch(
    `https://identitytoolkit.googleapis.com/v1/accounts:sendOobCode?key=${firebaseConfig.apiKey}`,
    {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ requestType: "PASSWORD_RESET", email }),
    },
  );
  const json = (await res.json().catch(() => ({}))) as IdentityToolkitError;
  if (!res.ok) {
    throw new Error(
      identityErrorMessage(json.error?.message || "", "Could not send the reset email"),
    );
  }
}
