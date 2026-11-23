import { api } from "@/integrations/aws/runtime";

/**
 * Admin-assigned login credentials.
 *
 * The admin panel lets a super admin hand out a **username + password** for
 * any role. Cognito only understands e-mail addresses, so a username is
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

function identityErrorMessage(message: string, fallback: string): string {
  if (/already exists|usernameexists/i.test(message))
    return "This username/email is already registered";
  if (/password/i.test(message) && /weak|policy|short/i.test(message)) {
    return "Password is too weak (minimum 8 characters)";
  }
  if (/invalid email|InvalidEmail/i.test(message)) return "Invalid email address";
  if (/user not found|usernotfound|email not found/i.test(message))
    return "No account found for this email";
  if (/incorrect password|not authorized/i.test(message)) return "Incorrect password";
  if (/too many|throttl/i.test(message))
    return "Too many attempts — please wait a moment and try again";
  return fallback;
}

/**
 * Create a Cognito account through the API **without** switching the
 * current session to the new user — the admin stays logged in while the
 * account is provisioned.
 *
 * @returns the new account's Cognito sub.
 */
export async function createAuthUser({
  email,
  password,
}: {
  email: string;
  password: string;
}): Promise<string> {
  try {
    const res = await api<{ ok: boolean; uid: string | null }>("auth", {
      action: "createUser",
      email,
      password,
    });
    if (!res.uid) throw new Error("Account creation failed — no user id returned");
    return res.uid;
  } catch (err) {
    throw new Error(
      identityErrorMessage(
        err instanceof Error ? err.message : String(err),
        "Account creation failed — please retry",
      ),
    );
  }
}

/**
 * Send the Cognito password-reset e-mail. A client cannot force-set another
 * user's password, so after creation this is how the admin hands a user a
 * new password later — the user clicks the link and chooses it.
 */
export async function sendPasswordReset(email: string): Promise<void> {
  try {
    await api("auth", { action: "reset", email });
  } catch (err) {
    throw new Error(
      identityErrorMessage(
        err instanceof Error ? err.message : String(err),
        "Could not send the reset email",
      ),
    );
  }
}
