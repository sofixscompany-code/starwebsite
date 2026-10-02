# Star Coaching Institute Website

This is the Star Coaching Institute ERP built with React 19, TypeScript, Tailwind CSS, Firebase, and TanStack Query.

## Tech Stack

- React 19 + TypeScript
- Tailwind CSS + Framer Motion
- react-router-dom v7
- Firebase Auth + Firestore + Storage
- TanStack Query (React Query)
- Recharts
- Lucide icons
- Sonner toast

## Architecture

### Role-Based Access

5 roles: super_admin, teacher, student, parent, accountant.

### Routing

- `/admin` — Admin shell (sidebar + content area), available to ALL 5 roles. The shell enforces access: a role can only open routes listed for it in `nav.ts` (plus `/admin` and `/admin/profile`); everything else renders an inline "Access denied" panel. `super_admin` is unrestricted.
- `/dashboard/teacher|student|parent|accountant|super-admin` — all redirect to `/admin`; `admin.index.tsx` renders the matching role dashboard (unknown/missing role → "No role assigned" panel, never the super-admin dashboard).

### Sidebar (`nav.ts`)

Single source of truth for navigation AND route access. Each `NavItem` (and `NavSection`) has an optional `roles` array; `getNavSectionsForRole()` filters both section-level and item-level roles. Missing `roles` = visible to all roles. The same config feeds the sidebar, the command palette (⌘K), breadcrumb linkability, and AdminShell's route enforcement.

Sidebar features:

- Search bar (filters all nav items)
- Accordion sections (auto-expands active section)
- Collapse/expand toggle
- Dark mode toggle
- Role-filtered menu items

### Auth Flow

- `api-auth.ts` handles login: Firebase Auth + role from Firestore users/{uid} only (no offline/hardcoded fallback).
- `demoLogin(role)` signs into Firebase Auth with `{role}@demo.starcoaching.edu.np` / `Star#Demo2026!Kx7` (auto-creates Auth + Firestore doc if missing), then stores `auth_token`, `auth_user`, `demo_role` in localStorage. **Ships in production** (owner's explicit request): the Quick Demo Access buttons and `demoLogin()` are no longer gated by `import.meta.env.DEV`, and the demo password is present in the prod bundle. The demo accounts are dedicated `*@demo.starcoaching.edu.np` users only — never real institute accounts. `verifyToken()` still ignores bare `demo_role`/`super-admin-hardcoded` localStorage entries unless they match a real Firebase session (prod) — demo login works because `demoLogin()` performs a real Firebase sign-in with role docs in `users/{uid}` (verified for all 5 roles).
- All role accounts live in Firebase Auth AND Firestore `users/{uid}` docs (`role` field). Super Admin: Starcoaching@gmail.com.
- `AuthGuard` (async): local session markers → `verifyToken()` which waits for Firebase Auth init (`firebaseAuth.waitForUser()`), then re-fetches the role from Firestore. A tampered localStorage session with no real Firebase sign-in is wiped and redirected to `/auth`. Role mismatches are re-synced from Firestore on entry.
- `Sidebar`/`AdminShell` sign-out goes through `handleSignOut()` (clears localStorage AND ends the Firebase session); `SessionManager` does the same on idle timeout.
- `src/lib/access.ts` — `canCreate()/canManage(collection, role)` mirror `firestore.rules` so the UI never offers an action the backend would reject (e.g. students get read-only Payments, teachers can't edit support tickets).

### Dashboards & Firestore

- `src/hooks/use-dashboard-data.ts` — live Firestore-backed dashboard hooks:
  - `useSuperAdminStats()` — counts, revenue sum, activities, pending admissions
  - `useTeacherDashboard(uid)` — classes/homework/exams filtered by teacherId
  - `useStudentDashboard(uid)` — attendance %, results, enrollments, classes
  - `useParentDashboard(email)` — children matched via students.parentEmail
  - `useAccountantDashboard()` — collections, dues, expenses, transactions
- Queries are composite-index-free (client-side filter/sort) and fall back to static defaults when a collection is empty; dashboards check `hasData` and render honest "No data yet" empty states instead of fabricated numbers.
- Demo seed data lives in `scripts/seed-dashboard-data.mjs` (run with `node scripts/seed-dashboard-data.mjs`); portal seed: `scripts/seed-portal-data.mjs` (signs in as super_admin — staff collections are role-gated).
- `src/hooks/use-module-data.ts` — generic live CRUD hook used by admin module pages. Exposes an `error` flag when the Firestore read fails; `create()` stamps `createdBy`, plus `teacherId`/`studentId` for teacher/student actors (dashboards filter on these).
- Static `rows={[…]}` fallbacks passed to `FirestoreModulePage` render only in dev builds — production shows live data or an empty state.

### Key Files

- `src/components/admin/nav.ts` — Navigation config + route-access source of truth
- `src/components/admin/Sidebar.tsx` — Dynamic sidebar with search + accordion + role filtering
- `src/components/admin/AdminShell.tsx` — Layout wrapper with topbar, sidebar, breadcrumbs, role-gated content, notifications panel
- `src/lib/api-auth.ts` — Auth helpers (login, demoLogin, verifyToken, handleSignOut)
- `src/lib/access.ts` — Role→capability map mirroring firestore.rules (create/manage gating)
- `src/components/auth/AuthGuard.tsx` — Route guard (async session + role validation)
- `src/hooks/use-user-role.ts` — Role constants and helpers
- `src/hooks/use-selections.ts` — public "Top Selections" hook (Firestore `selections` collection, static fallback); used by homepage + `/results`; managed in admin at `/admin/selections`
- `src/hooks/use-live-notices.ts` — real-time homepage notices (`onSnapshot`, no refresh needed); auto-infers category from title when missing; exports `noticeTimeAgo` / `isNewNotice`
- `src/hooks/use-homepage-stats.ts` — homepage stats bar numbers (Firestore `homepage_stats`, static fallback); managed in admin at `/admin/homepage-stats`
- `src/hooks/use-homepage-categories.ts` — homepage course categories with icon mapping (Firestore `homepage_categories`, static fallback); managed in admin at `/admin/homepage-categories`
- `src/hooks/use-homepage-testimonials.ts` — homepage testimonials (Firestore `homepage_testimonials`, static fallback); managed in admin at `/admin/homepage-testimonials`
- `src/hooks/use-homepage-settings.ts` — exports `useWhyChooseUs()` (Firestore `why_choose_us` collection) and `useMdMessage()` (single doc `homepage_settings/md_message`); managed in admin at `/admin/why-choose-us` and `/admin/md-message`
- `firestore.rules` — public read for site content (incl. `selections`); role-gated writes elsewhere. Self-registration may only create `student`/`parent` profiles; `users` profiles are readable by super admin or the owner only.

## Commands

```bash
npm install
npm run dev       # local dev
npm run build     # typecheck + production build
npm run lint      # eslint (0 errors; warnings OK)
npx prettier --write .
npx firebase deploy --only hosting          # deploy website
npx firebase deploy --only firestore:rules  # deploy security rules
```

Deploy target: https://starcoachinginstitutenepal.web.app
