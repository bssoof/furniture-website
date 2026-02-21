import fs from "node:fs";
import path from "node:path";

const root = process.cwd();
const htmlPath = path.join(root, "index.html");
const robotsPath = path.join(root, "robots.txt");
const sitemapPath = path.join(root, "sitemap.xml");

const html = fs.readFileSync(htmlPath, "utf8");

const requiredPatterns = [
  { pattern: /<link\s+rel="canonical"\s+href="[^"]+"/i, label: "canonical" },
  { pattern: /<meta\s+property="og:title"\s+content="[^"]+"/i, label: "og:title" },
  { pattern: /<meta\s+property="og:description"\s+content="[^"]+"/i, label: "og:description" },
  { pattern: /<meta\s+name="twitter:card"\s+content="[^"]+"/i, label: "twitter:card" },
  { pattern: /<script\s+type="application\/ld\+json">/i, label: "json-ld" },
  { pattern: /<section\s+class="contact-section"\s+id="contact">/i, label: "contact-section" }
];

const missing = requiredPatterns
  .filter((item) => !item.pattern.test(html))
  .map((item) => item.label);

const canonicalMatch = html.match(/<link\s+rel="canonical"\s+href="([^"]+)"/i);
if (!canonicalMatch || !/^https:\/\/darfurniture\.com\/?$/i.test(canonicalMatch[1])) {
  missing.push("canonical-domain");
}

if (!fs.existsSync(robotsPath)) {
  missing.push("robots.txt");
} else {
  const robots = fs.readFileSync(robotsPath, "utf8");
  if (!/Sitemap:\s*https:\/\/darfurniture\.com\/sitemap\.xml/i.test(robots)) {
    missing.push("robots-sitemap-reference");
  }
}

if (!fs.existsSync(sitemapPath)) {
  missing.push("sitemap.xml");
} else {
  const sitemap = fs.readFileSync(sitemapPath, "utf8");

  if (!/<urlset[\s>]/i.test(sitemap)) {
    missing.push("sitemap-urlset");
  }

  const locations = [...sitemap.matchAll(/<loc>([^<]+)<\/loc>/gi)].map((m) => m[1].trim());
  if (!locations.includes("https://darfurniture.com/")) {
    missing.push("sitemap-root-url");
  }
  if (locations.some((loc) => loc.includes("#"))) {
    missing.push("sitemap-hash-urls");
  }

  const lastmodValues = [...sitemap.matchAll(/<lastmod>([^<]+)<\/lastmod>/gi)].map((m) => m[1].trim());
  if (!lastmodValues.length) {
    missing.push("sitemap-lastmod");
  } else {
    const now = new Date();
    for (const value of lastmodValues) {
      const parsed = new Date(value);
      if (Number.isNaN(parsed.getTime())) {
        missing.push("sitemap-lastmod-format");
        break;
      }
      if (parsed.getTime() > now.getTime()) {
        missing.push("sitemap-lastmod-future");
        break;
      }
    }
  }
}

if (missing.length) {
  console.error("SEO check failed. Missing:");
  missing.forEach((item) => console.error(` - ${item}`));
  process.exit(1);
}

console.log("SEO check passed.");
