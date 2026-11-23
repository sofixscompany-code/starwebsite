/** Minimal Firebase App shim — the AWS backend needs no client app instance. */
const apps: Record<string, unknown> = {};

export function initializeApp(_config?: unknown, name = "[DEFAULT]"): unknown {
  apps[name] = { name, options: _config };
  return apps[name];
}

export function getApps(): unknown[] {
  return Object.values(apps);
}

export function getApp(name = "[DEFAULT]"): unknown {
  return apps[name] || initializeApp(undefined, name);
}
