import { state, setProducts, setCoupons, debugLog } from "./state.js";

export function normalizeSearchText(text) {
  return String(text || "")
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[أإآ]/g, "ا")
    .replace(/ة/g, "ه")
    .replace(/ى/g, "ي");
}

async function readJson(path) {
  const response = await fetch(path);
  if (!response.ok) {
    throw new Error(`Failed to load ${path}: ${response.status}`);
  }
  return response.json();
}

export async function loadCatalog() {
  const [products, coupons] = await Promise.all([
    readJson("data/products.json"),
    readJson("data/coupons.json")
  ]);

  setProducts(products);
  setCoupons(coupons);

  const maxPrice = state.products.reduce((max, p) => Math.max(max, Number(p.price) || 0), 10000);
  state.activeFilters.priceRange = [0, maxPrice];

  debugLog("Catalog loaded", {
    products: state.products.length,
    coupons: state.coupons.length,
    maxPrice
  });

  return { maxPrice };
}

export function getProductById(productId) {
  const id = Number(productId);
  return state.products.find((product) => product.id === id) || null;
}

export function getProductsByIds(ids) {
  const set = new Set((ids || []).map((id) => Number(id)));
  return state.products.filter((product) => set.has(product.id));
}

export function getSimilarProducts(productId, limit = 4) {
  const target = getProductById(productId);
  if (!target) return [];

  return state.products
    .filter((product) => product.id !== target.id)
    .sort((a, b) => {
      let scoreA = 0;
      let scoreB = 0;

      if (a.category === target.category) scoreA += 3;
      if (b.category === target.category) scoreB += 3;

      if (a.material === target.material) scoreA += 2;
      if (b.material === target.material) scoreB += 2;

      const tagOverlapA = (a.tags || []).filter((tag) => (target.tags || []).includes(tag)).length;
      const tagOverlapB = (b.tags || []).filter((tag) => (target.tags || []).includes(tag)).length;

      scoreA += tagOverlapA;
      scoreB += tagOverlapB;

      return scoreB - scoreA;
    })
    .slice(0, limit);
}

export function filterProducts() {
  const { category, priceRange, rating, colors, inStock, sortBy } = state.activeFilters;

  let filtered = [...state.products];

  if (category && category !== "all") {
    filtered = filtered.filter((product) => product.category === category);
  }

  filtered = filtered.filter((product) => {
    const price = Number(product.price) || 0;
    return price >= Number(priceRange[0] || 0) && price <= Number(priceRange[1] || Number.MAX_SAFE_INTEGER);
  });

  if (Number(rating) > 0) {
    filtered = filtered.filter((product) => Number(product.rating || 0) >= Number(rating));
  }

  if (colors.length) {
    filtered = filtered.filter((product) =>
      Array.isArray(product.colors) && product.colors.some((color) => colors.includes(color))
    );
  }

  if (inStock) {
    filtered = filtered.filter((product) => Boolean(product.inStock));
  }

  switch (sortBy) {
    case "price-low":
      filtered.sort((a, b) => (a.price || 0) - (b.price || 0));
      break;
    case "price-high":
      filtered.sort((a, b) => (b.price || 0) - (a.price || 0));
      break;
    case "rating":
      filtered.sort((a, b) => (b.rating || 0) - (a.rating || 0));
      break;
    case "newest":
      filtered.sort((a, b) => (b.id || 0) - (a.id || 0));
      break;
    case "name":
      filtered.sort((a, b) => String(a.name || "").localeCompare(String(b.name || ""), "ar"));
      break;
    default:
      filtered.sort((a, b) => (a.id || 0) - (b.id || 0));
      break;
  }

  return filtered;
}

export function searchProducts(query) {
  const normalizedQuery = normalizeSearchText(query);
  if (!normalizedQuery) return [];

  return state.products.filter((product) => {
    const byName = normalizeSearchText(product.name).includes(normalizedQuery);
    const byCategory = normalizeSearchText(product.category).includes(normalizedQuery);
    const byTags = (product.tags || []).some((tag) => normalizeSearchText(tag).includes(normalizedQuery));
    return byName || byCategory || byTags;
  });
}
