import fs from "node:fs";
import path from "node:path";

const htmlPath = path.join(process.cwd(), "index.html");
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

if (missing.length) {
  console.error("SEO check failed. Missing:");
  missing.forEach((item) => console.error(` - ${item}`));
  process.exit(1);
}

console.log("SEO check passed.");
