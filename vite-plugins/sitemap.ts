import type { Plugin } from "vite";
import { writeFileSync } from "fs";
import { resolve } from "path";

const SITE_URL = "https://starcoachinginstitute.com.np";

interface SitemapEntry {
  path: string;
  changefreq: string;
  priority: number;
}

const PUBLIC_ROUTES: SitemapEntry[] = [
  { path: "/", changefreq: "daily", priority: 1.0 },
  { path: "/about", changefreq: "monthly", priority: 0.8 },
  { path: "/courses", changefreq: "weekly", priority: 0.9 },
  { path: "/faculty", changefreq: "monthly", priority: 0.7 },
  { path: "/results", changefreq: "weekly", priority: 0.8 },
  { path: "/gallery", changefreq: "monthly", priority: 0.6 },
  { path: "/contact", changefreq: "monthly", priority: 0.8 },
  { path: "/admission", changefreq: "weekly", priority: 0.9 },
  { path: "/auth", changefreq: "yearly", priority: 0.3 },
];

function generateSitemapXml(): string {
  const today = new Date().toISOString().split("T")[0];

  const urls = PUBLIC_ROUTES.map(
    (entry) => `  <url>
    <loc>${SITE_URL}${entry.path}</loc>
    <lastmod>${today}</lastmod>
    <changefreq>${entry.changefreq}</changefreq>
    <priority>${entry.priority}</priority>
  </url>`
  ).join("\n");

  return `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9"
        xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance"
        xsi:schemaLocation="http://www.sitemaps.org/schemas/sitemap/0.9
          http://www.sitemaps.org/schemas/sitemap/0.9/sitemap.xsd">
${urls}
</urlset>`;
}

export function sitemap(): Plugin {
  return {
    name: "vite-plugin-sitemap",
    enforce: "post",
    closeBundle() {
      const xml = generateSitemapXml();
      const outDir = resolve(__dirname, "../dist");
      writeFileSync(resolve(outDir, "sitemap.xml"), xml, "utf-8");
      console.log(`\n✅ sitemap.xml generated at ${outDir}/sitemap.xml`);
      console.log(`   ${PUBLIC_ROUTES.length} URLs included for ${SITE_URL}`);
    },
  };
}
