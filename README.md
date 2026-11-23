# Star Coaching Institute — Website & ERP

Official website + ERP/LMS for **Star Coaching Institute, Janakpurdham, Nepal**.

Built with Vite, React 19, TypeScript, Tailwind CSS, AWS (Cognito + DynamoDB + S3/CloudFront) and TanStack Query.

The live URL is the `WebsiteUrl` value in `../infra/outputs.json` after provisioning.

## Getting started

```bash
npm install
npm run dev
```

Copy the values from `../infra/outputs.json` into `.env`:

```
VITE_AWS_API_URL=<ApiUrl>
VITE_AWS_USER_POOL_ID=<UserPoolId>
VITE_AWS_APP_CLIENT_ID=<AppClientId>
VITE_AWS_MEDIA_BASE=<WebsiteUrl>/media
VITE_AWS_WEB_BUCKET=<WebBucketName>
VITE_AWS_DISTRIBUTION_ID=<DistributionId>
```

## Roles

5 roles: `super_admin`, `teacher`, `student`, `parent`, `accountant`.

- Demo accounts: `{role}@demo.starcoaching.edu.np` / `Star#Demo2026!Kx7`
- Super Admin: `Starcoaching@gmail.com`
- New student/parent accounts created on admission verification use `<mobile>@starcoaching.edu.np` / `Star123@`

Accounts live in Cognito with their role stored in the `users` DynamoDB collection. All other collections (students, classes, payments, attendance, results, notices, …) are in DynamoDB, read through the Lambda `/data` endpoint.

## Commands

```bash
npm run build                               # typecheck + production build
npm run lint                                # eslint (0 errors)
npx prettier --write .                      # format
node scripts/seed-aws.mjs                   # seed demo role accounts (once backend is live)
npm run deploy                              # build + S3 sync + CloudFront invalidation
```

Infrastructure is provisioned from the repository root with `python infra/provision.py` (see `infra/`). CDK cannot be used in this AWS organisation because an SCP denies CloudFormation/SSM bootstrap actions.

See `AGENTS.md` for architecture details.
