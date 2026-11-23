/** Firebase Callable Functions-compatible client (resetUserPassword etc.). */
import { api } from "./runtime";

export interface Functions {
  __aws?: true;
}

export function getFunctions(_app?: unknown, _region?: string): Functions {
  return { __aws: true };
}

export function httpsCallable<F = Record<string, unknown>, R = Record<string, unknown>>(
  _functions: Functions,
  name: string,
): (data: F) => Promise<{ data: R }> {
  return async (data: F) => {
    const result = await api<R & { ok?: boolean }>("auth", { action: name, ...(data as object) });
    return { data: result };
  };
}
