# Star Coaching Institute — Website & ERP

Official website + ERP/LMS for **Star Coaching Institute, Janakpurdham, Nepal**.

Live: https://starcoachinginstitutenepal.web.app

Built with Vite, React 19, TypeScript, Tailwind CSS, Firebase (Auth + Firestore + Storage) and TanStack Query.

## Getting started

```bash
npm install
npm run dev
```

## Roles

5 roles: `super_admin`, `teacher`, `student`, `parent`, `accountant`.

- Login: https://starcoachinginstitutenepal.web.app/auth
- Demo accounts: `{role}@demo.starcoaching.edu.np` / password `Demo@2026!`
- Super Admin: Starcoaching@gmail.com

All accounts live in Firebase Auth with role stored in Firestore `users/{uid}`.
Dashboards read live data from Firestore collections (students, classes,
payments, attendance, results, notices, ...).

## Commands

```bash
npm run build                               # typecheck + production build
npm run lint                                # eslint (0 errors)
npx prettier --write .                      # format
npx firebase deploy --only hosting          # deploy website
npx firebase deploy --only firestore:rules  # deploy security rules
node scripts/seed-dashboard-data.mjs        # re-seed demo data
```

See `AGENTS.md` for architecture details.
