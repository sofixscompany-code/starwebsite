/**
 * Legacy `/admin/notices` route.
 *
 * This page used to ship a second, divergent implementation of the notices
 * editor (different field set, missing `publishedAt`, etc). Both routes now
 * share the single implementation from `admin.communication.notices` so the
 * `notices` collection is always written with the same fields.
 */
export { default as NoticesEventsPage } from "./admin.communication.notices";
