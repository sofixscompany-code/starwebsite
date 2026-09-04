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

- `/admin` — Admin shell (sidebar + content area). Only super_admin can access.
- `/dashboard/teacher` — Teacher dashboard
- `/dashboard/student` — Student dashboard
- `/dashboard/parent` — Parent dashboard
- `/dashboard/accountant` — Accountant dashboard

### Sidebar (`nav.ts`)

Single source of truth for all navigation. Each `NavItem` has a `roles` array that defines which roles can see it. The `getNavItemsForRole()` function filters sections + items per role.

Sidebar features:

- Search bar (filters all nav items)
- Accordion sections (auto-expands active section)
- Collapse/expand toggle
- Dark mode toggle
- Role-filtered menu items

### Auth Flow

- `api-auth.ts` handles login: Firebase Auth first + role from Firestore users/{uid}; hardcoded super admin only as offline fallback.
- `demoLogin(role)` signs into Firebase Auth with `{role}@demo.starcoaching.edu.np` / `Demo@2026!` (auto-creates Auth + Firestore doc if missing), then stores `auth_token`, `auth_user`, `demo_role` in localStorage.
- All role accounts live in Firebase Auth AND Firestore `users/{uid}` docs (`role` field). Super Admin: Starcoaching@gmail.com.
- `AuthGuard` checks auth status and redirects unauthenticated users to `/auth`.
- `Sidebar` reads `getUserRole()` from localStorage and filters nav items.

### Dashboards & Firestore

- `src/hooks/use-dashboard-data.ts` — live Firestore-backed dashboard hooks:
  - `useSuperAdminStats()` — counts, revenue sum, activities, pending admissions
  - `useTeacherDashboard(uid)` — classes/homework/exams filtered by teacherId
  - `useStudentDashboard(uid)` — attendance %, results, enrollments, classes
  - `useParentDashboard(email)` — children matched via students.parentEmail
  - `useAccountantDashboard()` — collections, dues, expenses, transactions
- Queries are composite-index-free (client-side filter/sort) and fall back to static defaults when a collection is empty.
- Demo seed data lives in `scripts/seed-dashboard-data.mjs` (run with `node scripts/seed-dashboard-data.mjs`).
- `src/hooks/use-module-data.ts` — generic live CRUD hook used by admin module pages.

### Key Files

- `src/components/admin/nav.ts` — Navigation config with role permissions
- `src/components/admin/Sidebar.tsx` — Dynamic sidebar with search + accordion + role filtering
- `src/components/admin/AdminShell.tsx` — Layout wrapper with topbar, sidebar, breadcrumbs
- `src/lib/api-auth.ts` — Auth helpers (login, demoLogin, verifyToken)
- `src/components/auth/AuthGuard.tsx` — Route guard
- `src/hooks/use-user-role.ts` — Role constants and helpers
- `src/hooks/use-selections.ts` — public "Top Selections" hook (Firestore `selections` collection, static fallback); used by homepage + `/results`; managed in admin at `/admin/selections`
- `src/hooks/use-live-notices.ts` — real-time homepage notices (`onSnapshot`, no refresh needed); auto-infers category from title when missing; exports `noticeTimeAgo` / `isNewNotice`
- `src/hooks/use-homepage-stats.ts` — homepage stats bar numbers (Firestore `homepage_stats`, static fallback); managed in admin at `/admin/homepage-stats`
- `src/hooks/use-homepage-categories.ts` — homepage course categories with icon mapping (Firestore `homepage_categories`, static fallback); managed in admin at `/admin/homepage-categories`
- `src/hooks/use-homepage-testimonials.ts` — homepage testimonials (Firestore `homepage_testimonials`, static fallback); managed in admin at `/admin/homepage-testimonials`
- `src/hooks/use-homepage-settings.ts` — exports `useWhyChooseUs()` (Firestore `why_choose_us` collection) and `useMdMessage()` (single doc `homepage_settings/md_message`); managed in admin at `/admin/why-choose-us` and `/admin/md-message`
- `src/lib/permissions.ts` — Flat menu items with role access (legacy, kept for compatibility)
- `firestore.rules` — public read for site content (incl. `selections`); auth-only for everything else

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
