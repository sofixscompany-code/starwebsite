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
7 roles: super_admin, branch_admin, teacher, student, parent, accountant, receptionist.

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
- `api-auth.ts` handles login (hardcoded super admin credentials for demo, Firebase Auth fallback).
- `demoLogin(role)` sets localStorage `demo_role`, `auth_token`, `auth_user`.
- `AuthGuard` checks auth status and redirects non-super_admin away from `/admin`.
- `Sidebar` reads `getUserRole()` from localStorage and filters nav items.

### Key Files
- `src/components/admin/nav.ts` — Navigation config with role permissions
- `src/components/admin/Sidebar.tsx` — Dynamic sidebar with search + accordion + role filtering
- `src/components/admin/AdminShell.tsx` — Layout wrapper with topbar, sidebar, breadcrumbs
- `src/lib/api-auth.ts` — Auth helpers (login, demoLogin, verifyToken)
- `src/components/auth/AuthGuard.tsx` — Route guard
- `src/hooks/use-user-role.ts` — Role constants and helpers
- `src/lib/permissions.ts` — Flat menu items with role access (legacy, kept for compatibility)

## Getting Started

```bash
bun install
bun dev
```
