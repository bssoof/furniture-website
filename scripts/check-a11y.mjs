import fs from "node:fs";
import path from "node:path";

const html = fs.readFileSync(path.join(process.cwd(), "index.html"), "utf8");
const issues = [];

const placeholderHrefFragment = 'href="' + '#"';
const placeholderLinks = [...html.matchAll(new RegExp(`<a[^>]+${placeholderHrefFragment}[^>]*>`, "g"))];
if (placeholderLinks.length) {
  issues.push(`Found ${placeholderLinks.length} placeholder anchor links.`);
}

const iconButtons = [...html.matchAll(/<button([^>]*)>(\s*<i[^>]+><\/i>\s*)<\/button>/g)];
iconButtons.forEach((match) => {
  const attrs = match[1];
  if (!/aria-label=/.test(attrs)) {
    issues.push("Icon-only button without aria-label detected.");
  }
});

if (issues.length) {
  console.error("Accessibility smoke check failed:");
  issues.forEach((issue) => console.error(` - ${issue}`));
  process.exit(1);
}

console.log("Accessibility smoke check passed.");
