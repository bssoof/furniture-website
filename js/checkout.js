import { state } from "./state.js";
import { buildOrderPayload, clearCart } from "./cart.js";
import { trackEvent } from "./analytics.js";

export const DEFAULT_WHATSAPP_NUMBER = "966501234567";
export const DEFAULT_ORDERS_EMAIL = "orders@darfurniture.com";

export function validateEmail(email) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(String(email || "").trim());
}

export function validatePhone(phone) {
  return /^[\d\s\-+()]{9,}$/.test(String(phone || "").trim());
}

export function formatOrderMessage(payload) {
  const itemsText = payload.items
    .map((item, index) => `${index + 1}. ${item.name} × ${item.qty} = ${(item.price * item.qty).toLocaleString()} ر.س`)
    .join("\n");

  return [
    "طلب جديد من موقع دار الأثاث",
    "",
    `الاسم: ${payload.customer.name}`,
    `الهاتف: ${payload.customer.phone}`,
    `المدينة: ${payload.customer.city}`,
    `العنوان: ${payload.customer.address}`,
    payload.coupon ? `الكوبون: ${payload.coupon}` : "الكوبون: لا يوجد",
    "",
    "المنتجات:",
    itemsText,
    "",
    `المجموع: ${payload.subtotal.toLocaleString()} ر.س`,
    `الخصم: ${payload.discount.toLocaleString()} ر.س`,
    `الشحن: ${payload.shipping.toLocaleString()} ر.س`,
    `الإجمالي: ${payload.total.toLocaleString()} ر.س`
  ].join("\n");
}

export function buildWhatsAppUrl(payload, whatsappNumber = DEFAULT_WHATSAPP_NUMBER) {
  const normalized = String(whatsappNumber || DEFAULT_WHATSAPP_NUMBER).replace(/\D/g, "");
  const message = formatOrderMessage(payload);
  return `https://wa.me/${normalized}?text=${encodeURIComponent(message)}`;
}

export function buildFallbackMailto(payload, toEmail = DEFAULT_ORDERS_EMAIL) {
  const subject = encodeURIComponent(`طلب جديد - ${payload.customer.name}`);
  const body = encodeURIComponent(formatOrderMessage(payload));
  return `mailto:${toEmail}?subject=${subject}&body=${body}`;
}

export function submitOrder(customer, options = {}) {
  if (!state.cart.length) {
    return { ok: false, message: "السلة فارغة" };
  }

  if (!customer?.name || !customer?.phone || !customer?.city || !customer?.address) {
    return { ok: false, message: "الرجاء تعبئة جميع الحقول" };
  }

  if (!validatePhone(customer.phone)) {
    return { ok: false, message: "رقم الهاتف غير صالح" };
  }

  const payload = buildOrderPayload(customer);
  const whatsappUrl = buildWhatsAppUrl(payload, options.whatsappNumber || DEFAULT_WHATSAPP_NUMBER);

  let opened = false;
  try {
    const popup = window.open(whatsappUrl, "_blank", "noopener,noreferrer");
    opened = Boolean(popup);
  } catch {
    opened = false;
  }

  if (!opened) {
    window.location.href = buildFallbackMailto(payload, options.fallbackEmail || DEFAULT_ORDERS_EMAIL);
  }

  trackEvent("submit_order_whatsapp", {
    total: payload.total,
    items_count: payload.items.length,
    city: payload.customer.city,
    coupon: payload.coupon
  });

  clearCart();

  return {
    ok: true,
    payload,
    whatsappUrl,
    message: "تم إرسال الطلب بنجاح"
  };
}
