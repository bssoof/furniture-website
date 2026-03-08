export const DEFAULT_SHIPPING_ZONES = {
  "القدس": { price: 0, days: "1-2" },
  "رام الله": { price: 15, days: "1-2" },
  "بيت لحم": { price: 15, days: "1-2" },
  "نابلس": { price: 20, days: "2-3" },
  "الخليل": { price: 20, days: "2-3" },
  "أريحا": { price: 20, days: "2-3" },
  "جنين": { price: 25, days: "2-3" },
  "طولكرم": { price: 25, days: "2-3" },
  "قلقيلية": { price: 25, days: "2-3" },
  "سلفيت": { price: 25, days: "2-3" },
  "طوباس": { price: 30, days: "3-4" },
  "غزة": { price: 40, days: "4-6" },
  "أخرى": { price: 35, days: "3-5" }
};

function toNumber(value, fallback = 0) {
  const n = Number(value);
  return Number.isFinite(n) ? n : fallback;
}

function safeQty(value) {
  const qty = Math.floor(toNumber(value, 1));
  return qty > 0 ? qty : 1;
}

export function computeSubtotal(items = []) {
  return items.reduce((sum, item) => sum + toNumber(item.price) * safeQty(item.quantity), 0);
}

export function calculateShipping(city, itemCount, zones = DEFAULT_SHIPPING_ZONES) {
  if (!itemCount) return { price: 0, days: "1-2" };
  if (!city) return { ...(zones["أخرى"] || { price: 35, days: "3-5" }) };
  return { ...(zones[city] || zones["أخرى"] || { price: 35, days: "3-5" }) };
}

export function isCouponExpired(coupon, now = Date.now()) {
  if (!coupon?.expiresAt) return false;
  const expiresAt = new Date(coupon.expiresAt).getTime();
  return Number.isFinite(expiresAt) ? expiresAt < now : false;
}

function couponMeetsCategoryRequirement(coupon, items) {
  if (!coupon?.requiredCategory) return true;
  return items.some((item) => item.category === coupon.requiredCategory);
}

export function calculateCouponDiscount(subtotal, shippingCost, coupon, items = []) {
  if (!coupon) return 0;

  const safeSubtotal = toNumber(subtotal);
  const safeShipping = toNumber(shippingCost);

  if (isCouponExpired(coupon)) return 0;
  if (coupon.minSubtotal && safeSubtotal < toNumber(coupon.minSubtotal)) return 0;
  if (!couponMeetsCategoryRequirement(coupon, items)) return 0;

  switch (coupon.type) {
    case "percent":
      return Math.min(safeSubtotal, safeSubtotal * (toNumber(coupon.value) / 100));
    case "fixed":
      return Math.min(safeSubtotal, toNumber(coupon.value));
    case "shipping":
      return Math.min(safeShipping, toNumber(coupon.value || safeShipping));
    default:
      return 0;
  }
}

export function computeCartTotals(items = [], city = "", coupon = null, zones = DEFAULT_SHIPPING_ZONES) {
  const subtotal = computeSubtotal(items);
  const itemCount = items.reduce((sum, item) => sum + safeQty(item.quantity), 0);
  const shipping = calculateShipping(city, itemCount, zones);
  const discount = calculateCouponDiscount(subtotal, shipping.price, coupon, items);
  const total = Math.max(0, subtotal + shipping.price - discount);

  return {
    subtotal,
    shipping,
    discount,
    total
  };
}
