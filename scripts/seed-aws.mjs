/**
 * Fresh-start seed for the AWS backend (replaces the old Firebase seed scripts).
 *
 * Creates the demo role accounts + the super-admin account in Cognito and
 * writes their role profiles to DynamoDB. Safe to re-run: existing users are
 * updated, not duplicated.
 *
 * Run: node scripts/seed-aws.mjs
 */
import { readFileSync, existsSync } from "node:fs";
import { resolve } from "node:path";

const envFile = resolve(process.cwd(), ".env");
if (existsSync(envFile)) {
  for (const line of readFileSync(envFile, "utf8").split(/\r?\n/)) {
    const match = line.match(/^([A-Z0-9_]+)=(.*)$/);
    if (match && !process.env[match[1]]) process.env[match[1]] = match[2];
  }
}

const apiUrl = process.env.VITE_AWS_API_URL;
if (!apiUrl || apiUrl.includes("REPLACE_ME")) {
  console.error("Set VITE_AWS_API_URL in starweb/.env (from infra/outputs.json) first.");
  process.exit(1);
}

const demoPassword = "Star#Demo2026!Kx7";
const users = [
  {
    email: "Starcoaching@gmail.com",
    password: demoPassword,
    name: "Super Admin",
    role: "super_admin",
  },
  {
    email: "super_admin@demo.starcoaching.edu.np",
    password: demoPassword,
    name: "Super Admin",
    role: "super_admin",
  },
  {
    email: "teacher@demo.starcoaching.edu.np",
    password: demoPassword,
    name: "Demo Teacher",
    role: "teacher",
  },
  {
    email: "student@demo.starcoaching.edu.np",
    password: demoPassword,
    name: "Demo Student",
    role: "student",
  },
  {
    email: "parent@demo.starcoaching.edu.np",
    password: demoPassword,
    name: "Demo Parent",
    role: "parent",
  },
  {
    email: "accountant@demo.starcoaching.edu.np",
    password: demoPassword,
    name: "Demo Accountant",
    role: "accountant",
  },
];

const res = await fetch(`${apiUrl.replace(/\/$/, "")}/auth`, {
  method: "POST",
  headers: { "Content-Type": "application/json" },
  body: JSON.stringify({
    action: "seed",
    secret: process.env.AWS_ADMIN_SECRET || "star-coaching-seed-2026",
    users,
  }),
});

const body = await res.json().catch(() => ({}));
if (!res.ok || body.ok === false) {
  console.error("Seed failed:", body.error || `HTTP ${res.status}`);
  process.exit(1);
}

console.log("Seeded users:");
for (const user of body.users || []) console.log(" -", user.email, user.sub || "");
console.log("\nDemo password:", demoPassword);
console.log("Student/parent admission password: Star123@");
