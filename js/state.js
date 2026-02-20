export const STORAGE_VERSION = "v2";
const PREFIX = `fw_${STORAGE_VERSION}`;

export const STORAGE_KEYS = {
  cart: `${PREFIX}:cart`,
  wishlist: `${PREFIX}:wishlist`,
  compare: `${PREFIX}:compare`,
  reviews: `${PREFIX}:reviews`,
  theme: `${PREFIX}:theme`,
  coupon: `${PREFIX}:coupon`
};

const LEGACY_KEYS = {
  cart: "cart",
  wishlist: "wishlist",
  compare: "compare",
  reviews: "reviews",
  theme: "theme"
};

export const DEFAULT_FILTERS = {
  category: "all",
  priceRange: [0, 10000],
  rating: 0,
  colors: [],
  inStock: false,
  sortBy: "default"
};

export const state = {
  products: [],
  coupons: [],
  cart: [],
  wishlist: [],
  compare: [],
  reviews: [],
  activeFilters: { ...DEFAULT_FILTERS },
  appliedCoupon: null,
  currentProductId: null,
  isDebug: new URLSearchParams(window.location.search).has("debug")
};

function safeJsonParse(raw, fallback) {
  if (!raw) return fallback;
  try {
    return JSON.parse(raw);
  } catch {
    return fallback;
  }
}

function readStorage(primaryKey, fallbackKey, fallbackValue) {
  const current = localStorage.getItem(primaryKey);
  if (current !== null) return safeJsonParse(current, fallbackValue);

  if (!fallbackKey) return fallbackValue;
  const legacy = localStorage.getItem(fallbackKey);
  return safeJsonParse(legacy, fallbackValue);
}

function writeStorage(key, value) {
  localStorage.setItem(key, JSON.stringify(value));
}

export function debugLog(...args) {
  if (state.isDebug) {
    console.log("[DEBUG]", ...args);
  }
}

export function loadPersistedState() {
  state.cart = readStorage(STORAGE_KEYS.cart, LEGACY_KEYS.cart, []);
  state.wishlist = readStorage(STORAGE_KEYS.wishlist, LEGACY_KEYS.wishlist, []);
  state.compare = readStorage(STORAGE_KEYS.compare, LEGACY_KEYS.compare, []);
  state.reviews = readStorage(STORAGE_KEYS.reviews, LEGACY_KEYS.reviews, []);
  state.appliedCoupon = readStorage(STORAGE_KEYS.coupon, null, null);

  const savedTheme = localStorage.getItem(STORAGE_KEYS.theme) ?? localStorage.getItem(LEGACY_KEYS.theme);
  if (savedTheme) {
    localStorage.setItem(STORAGE_KEYS.theme, savedTheme);
  }
}

export function persistCart() {
  writeStorage(STORAGE_KEYS.cart, state.cart);
}

export function persistWishlist() {
  writeStorage(STORAGE_KEYS.wishlist, state.wishlist);
}

export function persistCompare() {
  writeStorage(STORAGE_KEYS.compare, state.compare);
}

export function persistReviews() {
  writeStorage(STORAGE_KEYS.reviews, state.reviews);
}

export function persistCoupon() {
  writeStorage(STORAGE_KEYS.coupon, state.appliedCoupon);
}

export function setProducts(products) {
  state.products = Array.isArray(products) ? products : [];
}

export function setCoupons(coupons) {
  state.coupons = Array.isArray(coupons) ? coupons : [];
}

export function setAppliedCoupon(coupon) {
  state.appliedCoupon = coupon;
  persistCoupon();
}

export function clearAppliedCoupon() {
  state.appliedCoupon = null;
  persistCoupon();
}

export function migrateLegacyCollections() {
  if (!Array.isArray(state.compare)) {
    state.compare = [];
  } else if (state.compare.length && typeof state.compare[0] === "object") {
    state.compare = state.compare
      .map((item) => Number(item?.id))
      .filter((id) => Number.isFinite(id));
  }

  if (!Array.isArray(state.wishlist)) {
    state.wishlist = [];
  }

  if (!Array.isArray(state.cart)) {
    state.cart = [];
  }

  if (!Array.isArray(state.reviews)) {
    state.reviews = [];
  }
}

export function findProductByName(name) {
  return state.products.find((product) => product.name === name) || null;
}

export function normalizePersistedItemsWithCatalog() {
  state.cart = state.cart
    .map((item) => {
      if (item.productId) return item;
      if (!item.name) return null;
      const product = findProductByName(item.name);
      if (!product) return null;
      return {
        productId: product.id,
        name: product.name,
        price: Number(item.price || product.price),
        image: item.image || product.image,
        category: product.category,
        quantity: Number(item.quantity || 1)
      };
    })
    .filter(Boolean);

  state.wishlist = state.wishlist
    .map((item) => {
      if (typeof item === "number") return item;
      if (item?.productId) return item.productId;
      if (item?.id) return item.id;
      if (item?.name) {
        const product = findProductByName(item.name);
        return product ? product.id : null;
      }
      return null;
    })
    .filter((id) => Number.isFinite(id));

  state.compare = state.compare.filter((id) => Number.isFinite(id));

  persistCart();
  persistWishlist();
  persistCompare();
}

export function getPreferredTheme() {
  const saved = localStorage.getItem(STORAGE_KEYS.theme);
  if (saved === "light" || saved === "dark") return saved;
  return window.matchMedia("(prefers-color-scheme: dark)").matches ? "dark" : "light";
}

export function applyTheme(theme) {
  const nextTheme = theme === "dark" ? "dark" : "light";
  document.documentElement.setAttribute("data-theme", nextTheme);
  localStorage.setItem(STORAGE_KEYS.theme, nextTheme);
}
