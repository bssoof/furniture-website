import fs from "node:fs";
import path from "node:path";

const root = process.cwd();
const dist = path.join(root, "dist");

const entries = [
  "index.html",
  "css",
  "js",
  "data",
  "assets",
  "manifest.json",
  "robots.txt",
  "sitemap.xml",
  "sw.js"
];

fs.rmSync(dist, { recursive: true, force: true });
fs.mkdirSync(dist, { recursive: true });

for (const entry of entries) {
  const source = path.join(root, entry);
  const target = path.join(dist, entry);

  if (!fs.existsSync(source)) {
    throw new Error(`Build source missing: ${entry}`);
  }

  const stats = fs.statSync(source);
  if (stats.isDirectory()) {
    fs.cpSync(source, target, { recursive: true });
  } else {
    fs.mkdirSync(path.dirname(target), { recursive: true });
    fs.copyFileSync(source, target);
  }
}

fs.writeFileSync(path.join(dist, ".nojekyll"), "");

console.log(`Static build completed: ${entries.length} entries copied to dist/`);
