import {
  state,
  persistCart,
  persistWishlist,
  persistCompare,
  setAppliedCoupon,
  clearAppliedCoupon,
  debugLog
} from "./state.js";
import { getProductById } from "./catalog.js";
import {
  DEFAULT_SHIPPING_ZONES,
  calculateCouponDiscount,
  calculateShipping as computeShipping,
  computeCartTotals,
  computeSubtotal,
  isCouponExpired
} from "./commerce.js";

export const SHIPPING_ZONES = DEFAULT_SHIPPING_ZONES;

function toNumber(value, fallback = 0) {
  const n = Number(value);
  return Number.isFinite(n) ? n : fallback;
}

function sanitizeQuantity(value) {
  const n = Math.floor(toNumber(value, 1));
  return n > 0 ? n : 1;
}

export function getCartItemsCount() {
  return state.cart.reduce((sum, item) => sum + sanitizeQuantity(item.quantity), 0);
}

export function getSubtotal(items = state.cart) {
  return computeSubtotal(items);
}

export function calculateShipping(city, itemCount = getCartItemsCount()) {
  return computeShipping(city, itemCount, SHIPPING_ZONES);
}

function couponMeetsCategoryRequirement(coupon, items) {
  if (!coupon?.requiredCategory) return true;
  return items.some((item) => item.category === coupon.requiredCategory);
}

export { calculateCouponDiscount, isCouponExpired };

export function calculateCartTotals(city) {
  return computeCartTotals(state.cart, city, state.appliedCoupon, SHIPPING_ZONES);
}

export function findCoupon(code) {
  const normalized = String(code || "").trim().toUpperCase();
  if (!normalized) return null;
  return state.coupons.find((coupon) => String(coupon.code || "").trim().toUpperCase() === normalized) || null;
}

export function applyCouponCode(code, city) {
  const normalized = String(code || "").trim().toUpperCase();
  if (!normalized) {
    clearAppliedCoupon();
    return { ok: false, message: "أدخل كود الخصم أولاً" };
  }

  const coupon = findCoupon(normalized);
  if (!coupon) {
    clearAppliedCoupon();
    return { ok: false, message: "كود الخصم غير صالح" };
  }

  if (isCouponExpired(coupon)) {
    clearAppliedCoupon();
    return { ok: false, message: "انتهت صلاحية هذا الكود" };
  }

  const subtotal = getSubtotal(state.cart);
  if (!subtotal) {
    return { ok: false, message: "أضف منتجات إلى السلة أولاً" };
  }

  if (coupon.minSubtotal && subtotal < toNumber(coupon.minSubtotal)) {
    clearAppliedCoupon();
    return {
      ok: false,
      message: `الحد الأدنى لتفعيل الكود هو ${toNumber(coupon.minSubtotal).toLocaleString()} ₪`
    };
  }

  if (!couponMeetsCategoryRequirement(coupon, state.cart)) {
    clearAppliedCoupon();
    return { ok: false, message: `الكود مخصص لتصنيف ${coupon.requiredCategory}` };
  }

  setAppliedCoupon(coupon);

  const totals = calculateCartTotals(city);
  if (!totals.discount) {
    clearAppliedCoupon();
    return { ok: false, message: "لا يمكن تطبيق هذا الكود على سلتك الحالية" };
  }

  debugLog("coupon applied", coupon.code, totals.discount);

  return {
    ok: true,
    coupon,
    totals,
    message: `تم تطبيق الكوبون ${coupon.code}`
  };
}

export function addProductToCart(productId) {
  const product = getProductById(productId);
  if (!product) {
    return { ok: false, message: "المنتج غير موجود" };
  }

  const existing = state.cart.find((item) => item.productId === product.id);
  if (existing) {
    existing.quantity = sanitizeQuantity(existing.quantity) + 1;
  } else {
    state.cart.push({
      productId: product.id,
      name: product.name,
      category: product.category,
      price: toNumber(product.price),
      image: product.image,
      quantity: 1
    });
  }

  persistCart();
  return { ok: true, product };
}

export function removeCartItem(index) {
  const i = Number(index);
  if (!Number.isInteger(i) || i < 0 || i >= state.cart.length) return null;
  const [removed] = state.cart.splice(i, 1);
  persistCart();
  return removed;
}

export function increaseCartQuantity(index) {
  const item = state.cart[Number(index)];
  if (!item) return null;
  item.quantity = sanitizeQuantity(item.quantity) + 1;
  persistCart();
  return item;
}

export function decreaseCartQuantity(index) {
  const item = state.cart[Number(index)];
  if (!item) return null;

  if (sanitizeQuantity(item.quantity) <= 1) {
    return removeCartItem(index);
  }

  item.quantity = sanitizeQuantity(item.quantity) - 1;
  persistCart();
  return item;
}

export function clearCart() {
  state.cart = [];
  clearAppliedCoupon();
  persistCart();
}

export function toggleWishlistItem(productId) {
  const id = Number(productId);
  const exists = state.wishlist.includes(id);
  if (exists) {
    state.wishlist = state.wishlist.filter((itemId) => itemId !== id);
  } else {
    state.wishlist.push(id);
  }
  persistWishlist();
  return !exists;
}

export function removeWishlistByIndex(index) {
  const i = Number(index);
  if (!Number.isInteger(i) || i < 0 || i >= state.wishlist.length) return null;
  const [removedId] = state.wishlist.splice(i, 1);
  persistWishlist();
  return removedId;
}

export function isWishlisted(productId) {
  return state.wishlist.includes(Number(productId));
}

export function toggleCompareItem(productId, maxItems = 4) {
  const id = Number(productId);
  const already = state.compare.includes(id);

  if (already) {
    state.compare = state.compare.filter((itemId) => itemId !== id);
    persistCompare();
    return { ok: true, added: false, message: "تمت إزالة المنتج من المقارنة" };
  }

  if (state.compare.length >= maxItems) {
    return { ok: false, added: false, message: "يمكنك مقارنة 4 منتجات كحد أقصى" };
  }

  state.compare.push(id);
  persistCompare();
  return { ok: true, added: true, message: "تمت إضافة المنتج للمقارنة" };
}

export function removeCompareItem(productId) {
  const id = Number(productId);
  state.compare = state.compare.filter((itemId) => itemId !== id);
  persistCompare();
}

export function isCompared(productId) {
  return state.compare.includes(Number(productId));
}

export function buildOrderPayload(customer) {
  const city = customer?.city || "";
  const totals = calculateCartTotals(city);

  return {
    items: state.cart.map((item) => ({
      id: item.productId,
      name: item.name,
      qty: sanitizeQuantity(item.quantity),
      price: toNumber(item.price)
    })),
    subtotal: totals.subtotal,
    discount: totals.discount,
    shipping: totals.shipping.price,
    total: totals.total,
    customer: {
      name: customer?.name || "",
      phone: customer?.phone || "",
      city,
      address: customer?.address || ""
    },
    coupon: state.appliedCoupon?.code || null,
    channel: "whatsapp",
    createdAt: new Date().toISOString()
  };
}
