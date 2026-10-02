import { Navigate } from "react-router-dom";

/**
 * Legacy settings form removed.
 *
 * This page was a duplicate of the site settings UI: it wrote to
 * `settings/institute`, a document nothing in the app reads (integrations,
 * branding, security and the fake "audit log"/"backup history" here were all
 * hardcoded). The real site settings live in the `site-settings` collection
 * and are managed at /admin/site-settings, so this route simply redirects.
 */
export function SettingsPage() {
  return <Navigate to="/admin/site-settings" replace />;
}
