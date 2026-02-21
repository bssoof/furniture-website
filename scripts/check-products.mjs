import fs from "node:fs";
import path from "node:path";

const filePath = path.join(process.cwd(), "data/products.json");

if (!fs.existsSync(filePath)) {
  console.error("Products check failed: missing data/products.json");
  process.exit(1);
}

const products = JSON.parse(fs.readFileSync(filePath, "utf8"));
const errors = [];
const warnings = [];

if (!Array.isArray(products) || products.length === 0) {
  console.error("Products check failed: products.json must be a non-empty array.");
  process.exit(1);
}

const requiredString = ["name", "category", "image"];
const requiredArray = ["colors", "tags"];
const seenIds = new Set();
const seenNames = new Set();
const imageUsage = new Map();

function isFiniteNumber(value) {
  return typeof value === "number" && Number.isFinite(value);
}

async function validateImageReachable(url) {
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), 12000);
  try {
    const response = await fetch(url, {
      method: "GET",
      signal: controller.signal
    });
    if (!response.ok) return false;
    await response.arrayBuffer();
    return true;
  } catch {
    return false;
  } finally {
    clearTimeout(timeout);
  }
}

for (const product of products) {
  const id = product?.id;
  if (!Number.isInteger(id) || id <= 0) {
    errors.push(`Invalid id: ${id}`);
    continue;
  }

  if (seenIds.has(id)) {
    errors.push(`Duplicate product id: ${id}`);
  } else {
    seenIds.add(id);
  }

  for (const key of requiredString) {
    if (typeof product[key] !== "string" || !product[key].trim()) {
      errors.push(`Product ${id}: invalid ${key}`);
    }
  }

  const normalizedName = String(product.name || "").trim();
  if (seenNames.has(normalizedName)) {
    warnings.push(`Duplicate product name: "${normalizedName}" (id ${id})`);
  } else {
    seenNames.add(normalizedName);
  }

  if (!isFiniteNumber(product.price) || product.price <= 0) {
    errors.push(`Product ${id}: invalid price`);
  }

  if (product.oldPrice !== undefined && (!isFiniteNumber(product.oldPrice) || product.oldPrice <= 0)) {
    errors.push(`Product ${id}: invalid oldPrice`);
  }

  if (!isFiniteNumber(product.rating) || product.rating < 0 || product.rating > 5) {
    errors.push(`Product ${id}: rating must be between 0 and 5`);
  }

  if (!Number.isInteger(product.reviews) || product.reviews < 0) {
    errors.push(`Product ${id}: reviews must be a non-negative integer`);
  }

  if (typeof product.inStock !== "boolean") {
    errors.push(`Product ${id}: inStock must be boolean`);
  }

  for (const key of requiredArray) {
    if (!Array.isArray(product[key]) || product[key].length === 0 || product[key].some((v) => typeof v !== "string")) {
      errors.push(`Product ${id}: invalid ${key}`);
    }
  }

  const image = String(product.image || "").trim();
  try {
    const parsed = new URL(image);
    if (!/^https?:$/i.test(parsed.protocol)) {
      errors.push(`Product ${id}: image must be http/https URL`);
    }
  } catch {
    errors.push(`Product ${id}: invalid image URL`);
  }

  if (image) {
    imageUsage.set(image, (imageUsage.get(image) || 0) + 1);
  }
}

if (!errors.length) {
  for (const [url, count] of imageUsage.entries()) {
    if (count > 1) {
      warnings.push(`Image reused ${count} times: ${url}`);
    }
  }
}

if (!errors.length) {
  for (const product of products) {
    const ok = await validateImageReachable(product.image);
    if (!ok) {
      errors.push(`Product ${product.id}: image is not reachable (${product.image})`);
    }
  }
}

if (warnings.length) {
  console.warn("Products check warnings:");
  warnings.forEach((warning) => console.warn(` - ${warning}`));
}

if (errors.length) {
  console.error("Products check failed:");
  errors.forEach((error) => console.error(` - ${error}`));
  process.exit(1);
}

console.log(`Products check passed (${products.length} products).`);
