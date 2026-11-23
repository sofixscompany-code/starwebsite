# Star Coaching Institute Website

This is the Star Coaching Institute ERP built with React 19, TypeScript, Tailwind CSS, AWS (Cognito + DynamoDB + S3/CloudFront) and TanStack Query.

## Tech Stack

- React 19 + TypeScript
- Tailwind CSS + Framer Motion
- react-router-dom v7
- AWS Cognito (auth) + DynamoDB (data) + S3/CloudFront (media + hosting)
- TanStack Query (React Query)
- Recharts
- Lucide icons
- Sonner toast

## Architecture

### Backend adapters

All browser code talks to Firebase-compatible adapters in `src/integrations/aws/`:

- `auth.ts` / `auth-wrapper.ts` — Cognito sign-in, token storage, `firebaseAuth`-shaped API
- `firestore.ts` — collection/doc/getDoc/setDoc/onSnapshot helpers backed by the Lambda `/data` endpoint
- `storage.ts` — S3 uploads through the Lambda `/storage` endpoint
- `runtime.ts` — shared `POST {API_BASE}/{auth,data,storage}` transport

The Lambda implementation lives in `../infra/lambda/api/index.js`. Provisioning is in `../infra/provision.py` (raw boto3, because CDK/CloudFormation/SSM are denied by the organisation SCP).

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

- `api-auth.ts` handles login: Cognito through the AWS adapter + role from the `users` DynamoDB collection only (no offline/hardcoded fallback).
- `demoLogin(role)` signs in as `{role}@demo.starcoaching.edu.np` / `Star#Demo2026!Kx7`, then stores `auth_token`, `auth_user`, `demo_role` in localStorage. Ships in production by owner's explicit request. Demo accounts are dedicated `*@demo.starcoaching.edu.np` users only — never real institute accounts.
- All role accounts live in Cognito AND the `users` DynamoDB collection (`role` field). Super Admin: Starcoaching@gmail.com.
- `AuthGuard` (async): local session markers → `verifyToken()` which waits for adapter auth init, then re-fetches the role from DynamoDB. A tampered localStorage session with no real Cognito sign-in is wiped and redirected to `/auth`.
- `Sidebar`/`AdminShell` sign-out goes through `handleSignOut()` (clears localStorage AND ends the Cognito session); `SessionManager` does the same on idle timeout.
- `src/lib/access.ts` — `canCreate()/canManage(collection, role)` mirror the Lambda role rules so the UI never offers an action the backend would reject.

### Dashboards & data

- `src/hooks/use-dashboard-data.ts` — live DynamoDB-backed dashboard hooks:
  - `useSuperAdminStats()` — counts, revenue sum, activities, pending admissions
  - `useTeacherDashboard(uid)` — classes/homework/exams filtered by teacherId
  - `useStudentDashboard(uid)` — attendance %, results, enrollments, classes
  - `useParentDashboard(email)` — children matched via students.parentEmail
  - `useAccountantDashboard()` — collections, dues, expenses, transactions
- Queries are composite-index-free (client-side filter/sort) and fall back to static defaults when a collection is empty; dashboards check `hasData` and render honest "No data yet" empty states instead of fabricated numbers.
- `src/hooks/use-module-data.ts` — generic live CRUD hook used by admin module pages. Exposes an `error` flag when the data read fails; `create()` stamps `createdBy`, plus `teacherId`/`studentId` for teacher/student actors.
- Static `rows={[…]}` fallbacks passed to `FirestoreModulePage` render only in dev builds — production shows live data or an empty state.
- Fresh-start seed: `scripts/seed-aws.mjs` (demo role accounts + super admin).

### Key Files

- `src/components/admin/nav.ts` — Navigation config + route-access source of truth
- `src/components/admin/Sidebar.tsx` — Dynamic sidebar with search + accordion + role filtering
- `src/components/admin/AdminShell.tsx` — Layout wrapper with topbar, sidebar, breadcrumbs, role-gated content, notifications panel
- `src/lib/api-auth.ts` — Auth helpers (login, demoLogin, verifyToken, handleSignOut)
- `src/lib/access.ts` — Role→capability map mirroring the Lambda role rules
- `src/components/auth/AuthGuard.tsx` — Route guard (async session + role validation)
- `src/hooks/use-user-role.ts` — Role constants and helpers
- `src/integrations/aws/` — Firebase-compatible AWS adapters (runtime, auth, firestore, storage)
- `src/hooks/use-live-notices.ts` — real-time homepage notices (adapter `onSnapshot`), auto-infers category from title when missing

## Commands

```bash
npm install
npm run dev       # local dev
npm run build     # typecheck + production build
npm run lint      # eslint (0 errors; warnings OK)
npx prettier --write .
npm run deploy    # build + sync dist/ to S3 + CloudFront invalidation
node scripts/seed-aws.mjs   # seed Cognito users (after infrastructure is live)
```

Configure `VITE_AWS_API_URL`, `VITE_AWS_USER_POOL_ID`, `VITE_AWS_APP_CLIENT_ID`, `VITE_AWS_MEDIA_BASE`, `VITE_AWS_WEB_BUCKET` and `VITE_AWS_DISTRIBUTION_ID` in `.env` from `../infra/outputs.json`.

Deploy target: `WebsiteUrl` from `../infra/outputs.json` (CloudFront distribution).
