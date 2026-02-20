import fs from "node:fs";
import path from "node:path";

const root = process.cwd();
const htmlPath = path.join(root, "index.html");
const html = fs.readFileSync(htmlPath, "utf8");

const missing = new Set();

function isLocal(value) {
  return !/^(https?:|#|mailto:|tel:|javascript:)/i.test(value);
}

function ensureExists(relativePath) {
  const normalized = relativePath.replace(/\\/g, "/");
  const absolutePath = path.resolve(root, normalized);
  if (!fs.existsSync(absolutePath)) {
    missing.add(normalized);
  }
  return absolutePath;
}

function collectHtmlAssets() {
  const refs = [...html.matchAll(/(?:href|src)="([^"]+)"/g)].map((m) => m[1]);
  return refs.filter(isLocal);
}

function collectJsDependencies(entryRelativePath, visited = new Set()) {
  const normalized = entryRelativePath.replace(/\\/g, "/");
  if (visited.has(normalized)) return [];
  visited.add(normalized);

  const absolutePath = ensureExists(normalized);
  if (!fs.existsSync(absolutePath)) return [];

  const content = fs.readFileSync(absolutePath, "utf8");
  const deps = [];

  const importMatches = [...content.matchAll(/import\s+(?:[^"']+from\s+)?["']([^"']+)["']/g)].map((m) => m[1]);
  importMatches
    .filter((value) => isLocal(value) && !value.startsWith("/"))
    .forEach((relative) => {
      const resolved = path.posix.normalize(path.posix.join(path.posix.dirname(normalized), relative));
      deps.push(resolved);
    });

  const fetchMatches = [...content.matchAll(/fetch\(\s*["']([^"']+)["']/g)].map((m) => m[1]);
  fetchMatches
    .filter((value) => isLocal(value))
    .forEach((relative) => {
      const resolved = relative.startsWith("/")
        ? relative.slice(1)
        : path.posix.normalize(path.posix.join(path.posix.dirname(normalized), relative));
      deps.push(resolved);
    });

  const nested = [];
  deps.forEach((dep) => {
    ensureExists(dep);
    if (dep.endsWith(".js") || dep.endsWith(".mjs")) {
      nested.push(...collectJsDependencies(dep, visited));
    }
  });

  return [...deps, ...nested];
}

const htmlAssets = collectHtmlAssets();
htmlAssets.forEach((asset) => ensureExists(asset));

const moduleEntries = htmlAssets.filter((asset) => asset.endsWith(".js") || asset.endsWith(".mjs"));
moduleEntries.forEach((entry) => {
  collectJsDependencies(entry);
});

if (missing.size) {
  console.error("Missing local assets:");
  [...missing].sort().forEach((item) => console.error(` - ${item}`));
  process.exit(1);
}

console.log(`Asset check passed (${htmlAssets.length} direct local references).`);
