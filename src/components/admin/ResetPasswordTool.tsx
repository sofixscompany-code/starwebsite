import { useMemo, useState } from "react";
import { httpsCallable, getFunctions } from "@/integrations/aws/functions";
import { app, db } from "@/integrations/aws/config";
import { collection, getDocs, limit, query } from "@/integrations/aws/firestore";
import { KeyRound, Loader2, Mail, Search, Send, Copy } from "lucide-react";
import { toast } from "sonner";
import { Modal } from "@/components/admin/ui";
import { sendPasswordReset } from "@/lib/user-accounts";

const functions = getFunctions(app);

/** Default password offered when resetting a portal account. */
const DEFAULT_RESET_PASSWORD = "Star123@";

interface UserRow {
  uid: string;
  fullName: string;
  username: string;
  email: string;
  role: string;
  phone: string;
}

/**
 * Master-admin "Reset Password" tool (dashboard quick action).
 *
 * Sets ANOTHER user's Firebase Auth password — impossible from a browser
 * client (accounts:update needs that user's idToken), so it calls the
 * `resetUserPassword` Cloud Function (Admin SDK; super_admin-only guard
 * inside). Requires the Firebase Blaze plan; until the function is deployed
 * the tool degrades gracefully and offers the reset-EMAIL fallback (works
 * only for real mailboxes — institute `<mobile>@starcoaching.edu.np`
 * addresses have no mail server).
 */
export function ResetPasswordTool() {
  const [open, setOpen] = useState(false);
  const [users, setUsers] = useState<UserRow[] | null>(null);
  const [loading, setLoading] = useState(false);
  const [search, setSearch] = useState("");
  const [selected, setSelected] = useState<UserRow | null>(null);
  const [newPassword, setNewPassword] = useState(DEFAULT_RESET_PASSWORD);
  const [running, setRunning] = useState(false);
  const [done, setDone] = useState(false);

  const loadUsers = async () => {
    setLoading(true);
    try {
      const snap = await getDocs(query(collection(db, "users"), limit(300)));
      const rows = snap.docs
        .map((d) => {
          const v = d.data() as Record<string, unknown>;
          return {
            uid: d.id,
            fullName: String(v.full_name ?? v.fullName ?? ""),
            username: String(v.username ?? ""),
            email: String(v.email ?? ""),
            role: String(v.role ?? ""),
            phone: String(v.phone ?? ""),
          } satisfies UserRow;
        })
        .filter((r) => r.email || r.username)
        .sort((a, b) => a.fullName.localeCompare(b.fullName));
      setUsers(rows);
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Could not load users");
    } finally {
      setLoading(false);
    }
  };

  const openModal = () => {
    setOpen(true);
    setSelected(null);
    setDone(false);
    setNewPassword(DEFAULT_RESET_PASSWORD);
    if (users === null) void loadUsers();
  };

  const filtered = useMemo(() => {
    if (!users) return [];
    const s = search.trim().toLowerCase();
    if (!s) return users.slice(0, 40);
    return users
      .filter((u) =>
        [u.fullName, u.username, u.email, u.phone, u.role].some((v) => v.toLowerCase().includes(s)),
      )
      .slice(0, 40);
  }, [users, search]);

  const resetNow = async () => {
    if (!selected) return;
    if (newPassword.trim().length < 6) {
      toast.error("Password must be at least 6 characters.");
      return;
    }
    setRunning(true);
    try {
      const callable = httpsCallable(functions, "resetUserPassword");
      await callable({ email: selected.email, newPassword: newPassword.trim() });
      setDone(true);
      toast.success(`Password reset for ${selected.username || selected.email}`);
    } catch (e) {
      const code = (e as { code?: string }).code ?? "";
      if (code.includes("not-found") || code.includes("functions/not-found")) {
        toast.error(
          "Password-reset service is not live yet — enable the Firebase Blaze plan, then it works instantly.",
          { duration: 6000 },
        );
      } else {
        const msg = (e as Error).message || "Password reset failed";
        toast.error(msg);
      }
    } finally {
      setRunning(false);
    }
  };

  const sendResetEmail = async () => {
    if (!selected) return;
    setRunning(true);
    try {
      await sendPasswordReset(selected.email);
      toast.success("Reset e-mail sent — only reaches real mailboxes.");
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Could not send reset e-mail");
    } finally {
      setRunning(false);
    }
  };

  return (
    <>
      <button
        type="button"
        onClick={openModal}
        className="inline-flex items-center gap-1.5 px-4 py-2 bg-white/10 hover:bg-white/20 rounded-lg text-sm font-medium transition backdrop-blur-sm text-white"
      >
        <KeyRound className="w-4 h-4" /> Reset Password
      </button>

      <Modal open={open} onClose={() => setOpen(false)} size="lg" title="Reset User Password">
        <div>
          <p className="mb-4 rounded-lg border border-blue-200 bg-blue-50 px-3 py-2 text-xs text-blue-700 dark:border-blue-900 dark:bg-blue-900/20 dark:text-blue-300">
            Pick any student / parent / staff account and set a fresh password — the user signs in
            with their username (mobile number) + the new password immediately.
          </p>

          {!selected ? (
            <>
              <div className="relative mb-3">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                <input
                  autoFocus
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  placeholder="Search by name, username / mobile, role…"
                  className="ap-input w-full pl-9"
                  aria-label="Search users"
                />
              </div>
              <div className="max-h-72 overflow-y-auto rounded-lg border border-gray-200 divide-y dark:border-gray-700">
                {loading && (
                  <p className="flex items-center gap-2 p-4 text-sm text-gray-500">
                    <Loader2 className="h-4 w-4 animate-spin" /> Loading users…
                  </p>
                )}
                {!loading && filtered.length === 0 && (
                  <p className="p-4 text-sm text-gray-500">No users match your search.</p>
                )}
                {!loading &&
                  filtered.map((u) => (
                    <button
                      key={u.uid}
                      type="button"
                      onClick={() => setSelected(u)}
                      className="flex w-full items-center gap-3 px-4 py-2.5 text-left hover:bg-gray-50 dark:hover:bg-gray-700/50"
                    >
                      <span className="min-w-0 flex-1">
                        <span className="block truncate text-sm font-semibold">
                          {u.fullName || u.username || u.email}
                        </span>
                        <span className="block truncate font-mono text-xs text-gray-500">
                          {u.username || u.email}
                          {u.phone ? ` · ${u.phone}` : ""}
                        </span>
                      </span>
                      <span className="shrink-0 rounded-full bg-gray-100 px-2 py-0.5 text-[11px] font-bold uppercase text-gray-600 dark:bg-gray-700 dark:text-gray-300">
                        {u.role || "user"}
                      </span>
                    </button>
                  ))}
              </div>
            </>
          ) : (
            <div>
              <div className="mb-4 flex flex-wrap items-center gap-2 text-sm text-gray-500 dark:text-gray-400">
                <span className="font-semibold text-gray-900 dark:text-white">
                  {selected.fullName || selected.username}
                </span>
                <span className="font-mono text-xs">{selected.email}</span>
                <span className="rounded-full bg-gray-100 px-2 py-0.5 text-[11px] font-bold uppercase text-gray-600 dark:bg-gray-700 dark:text-gray-300">
                  {selected.role || "user"}
                </span>
              </div>

              {done ? (
                <div className="rounded-xl border border-green-200 bg-green-50 p-4 dark:border-green-800 dark:bg-green-900/20">
                  <p className="text-sm font-bold text-green-700 dark:text-green-300">
                    Password updated
                  </p>
                  <div className="mt-2 space-y-1 text-sm">
                    <div className="flex items-center justify-between gap-3">
                      <span className="text-gray-600 dark:text-gray-300">Username</span>
                      <button
                        type="button"
                        onClick={() => {
                          navigator.clipboard.writeText(selected.username || selected.email);
                          toast.success("Username copied");
                        }}
                        className="inline-flex items-center gap-1.5 font-mono font-semibold text-green-800 hover:underline dark:text-green-300"
                      >
                        {selected.username || selected.email} <Copy className="h-3.5 w-3.5" />
                      </button>
                    </div>
                    <div className="flex items-center justify-between gap-3">
                      <span className="text-gray-600 dark:text-gray-300">New password</span>
                      <button
                        type="button"
                        onClick={() => {
                          navigator.clipboard.writeText(newPassword.trim());
                          toast.success("Password copied");
                        }}
                        className="inline-flex items-center gap-1.5 font-mono font-semibold text-green-800 hover:underline dark:text-green-300"
                      >
                        {newPassword.trim()} <Copy className="h-3.5 w-3.5" />
                      </button>
                    </div>
                  </div>
                  <p className="mt-2 text-[11px] text-gray-500 dark:text-gray-400">
                    Share these with the user over WhatsApp / in person — they sign in with the bare
                    username + this password.
                  </p>
                </div>
              ) : (
                <>
                  <label className="block text-xs font-bold uppercase tracking-wider text-gray-500 dark:text-gray-400">
                    New password
                    <input
                      value={newPassword}
                      onChange={(e) => setNewPassword(e.target.value)}
                      className="ap-input mt-1.5 w-full font-mono"
                      aria-label="New password"
                    />
                  </label>
                  <p className="mt-1.5 text-[11px] text-gray-500 dark:text-gray-400">
                    Institute default: <b className="font-mono">{DEFAULT_RESET_PASSWORD}</b> — share
                    it over WhatsApp / in person, never e-mail.
                  </p>
                </>
              )}

              <div className="mt-6 flex flex-wrap justify-end gap-3 border-t border-gray-200 pt-4 dark:border-gray-700">
                <button
                  type="button"
                  className="ap-btn-ghost"
                  onClick={() => (done ? (setSelected(null), setDone(false)) : setSelected(null))}
                  disabled={running}
                >
                  {done ? "Reset another" : "Back"}
                </button>
                {!done && (
                  <>
                    <button
                      type="button"
                      className="ap-btn-ghost"
                      onClick={sendResetEmail}
                      disabled={running}
                    >
                      <Mail className="h-4 w-4" /> Send reset e-mail
                    </button>
                    <button type="button" className="ap-btn" onClick={resetNow} disabled={running}>
                      {running ? (
                        <Loader2 className="h-4 w-4 animate-spin" />
                      ) : (
                        <Send className="h-4 w-4" />
                      )}
                      Set new password
                    </button>
                  </>
                )}
              </div>
            </div>
          )}
        </div>
      </Modal>
    </>
  );
}
