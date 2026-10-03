// Dev helper: verify the EN and NE admin-i18n blocks define the same keys.
import { readFileSync } from "node:fs";

const src = readFileSync(new URL("../src/lib/admin-i18n.ts", import.meta.url), "utf8");

function keysBetween(startMarker, endMarker) {
  const start = src.indexOf(startMarker);
  if (start < 0) return null;
  const end = src.indexOf(endMarker, start);
  const body = src.slice(start, end < 0 ? undefined : end);
  const keys = new Set();
  for (const m of body.matchAll(/^\s{2}(?:"([^"]+)"|([A-Za-z_$][\w$]*))\s*:/gm)) {
    keys.add(m[1] ?? m[2]);
  }
  return keys;
}

const en = keysBetween("const EN: Record<string, string> = {", "const NE:");
const ne = keysBetween("const NE: Record<string, string> = {", "export const ADMIN_STRINGS");
if (!en || !ne) {
  console.error("Could not locate EN/NE blocks");
  process.exit(1);
}

const missingInNe = [...en].filter((k) => !ne.has(k)).sort();
const missingInEn = [...ne].filter((k) => !en.has(k)).sort();

console.log(`EN keys: ${en.size} | NE keys: ${ne.size}`);
if (missingInNe.length) console.log("Missing in NE:\n  " + missingInNe.join("\n  "));
if (missingInEn.length) console.log("Missing in EN:\n  " + missingInEn.join("\n  "));
if (!missingInNe.length && !missingInEn.length) console.log("✓ Both blocks match");
