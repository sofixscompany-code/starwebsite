import { chromium } from "@playwright/test";

async function main() {
  const browser = await chromium.launch({
    channel: "msedge",
    headless: true,
  });
  const context = await browser.newContext();
  const page = await context.newPage();

  const errors = [];
  page.on("console", (msg) => {
    const type = msg.type();
    const text = msg.text();
    console.log(`[${type}] ${text}`);
    if (type === "error") errors.push(text);
  });
  page.on("pageerror", (err) => {
    console.log(`[pageerror] ${err.message}`);
    errors.push(err.message);
  });

  await page.goto("http://localhost:4173/", { waitUntil: "networkidle", timeout: 30000 });
  await page.waitForTimeout(3000);

  const title = await page.title();
  const bodyText = await page.locator("body").innerText({ timeout: 5000 }).catch(() => "");

  console.log("\n--- RESULT ---");
  console.log("Title:", title);
  console.log("Body preview:", bodyText.slice(0, 200).replace(/\s+/g, " "));
  console.log("Errors:", errors.length ? errors.join("\n") : "none");

  await browser.close();
  process.exit(errors.length ? 1 : 0);
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
