import { execSync } from "node:child_process";
import { existsSync, readFileSync } from "node:fs";
import { resolve } from "node:path";

const envFile = resolve(process.cwd(), ".env");
if (existsSync(envFile)) {
  for (const line of readFileSync(envFile, "utf8").split(/\r?\n/)) {
    const match = line.match(/^([A-Z0-9_]+)=(.*)$/);
    if (match && !process.env[match[1]]) process.env[match[1]] = match[2];
  }
}

const bucket = process.env.VITE_AWS_WEB_BUCKET;
const distribution = process.env.VITE_AWS_DISTRIBUTION_ID;

if (!bucket) {
  console.error("Missing VITE_AWS_WEB_BUCKET in .env — fill it from infra/outputs.json first.");
  process.exit(1);
}

function run(command) {
  console.log(">", command);
  execSync(command, { stdio: "inherit", shell: "powershell.exe" });
}

run(`aws s3 sync dist s3://${bucket} --delete`);
if (distribution) {
  run(`aws cloudfront create-invalidation --distribution-id ${distribution} --paths "/*"`);
}
console.log("Website deployed to AWS (S3 + CloudFront).");
