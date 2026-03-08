import { state } from "./state.js";
import { buildOrderPayload } from "./cart.js";
import { trackEvent } from "./analytics.js";

export const DEFAULT_WHATSAPP_NUMBER = "972569906492";
export function validateEmail(email) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(String(email || "").trim());
}

export function validatePhone(phone) {
  return /^[\d\s\-+()]{9,}$/.test(String(phone || "").trim());
}

export function formatOrderMessage(payload) {
  const itemsText = payload.items
    .map((item, index) => `${index + 1}. ${item.name} × ${item.qty} = ${(item.price * item.qty).toLocaleString()} ₪`)
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
    `المجموع: ${payload.subtotal.toLocaleString()} ₪`,
    `الخصم: ${payload.discount.toLocaleString()} ₪`,
    `الشحن: ${payload.shipping.toLocaleString()} ₪`,
    `الإجمالي: ${payload.total.toLocaleString()} ₪`
  ].join("\n");
}

export function buildWhatsAppUrl(payload, whatsappNumber = DEFAULT_WHATSAPP_NUMBER) {
  const normalized = String(whatsappNumber || DEFAULT_WHATSAPP_NUMBER).replace(/\D/g, "");
  const message = formatOrderMessage(payload);
  return `https://wa.me/${normalized}?text=${encodeURIComponent(message)}`;
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

  trackEvent("submit_order_whatsapp", {
    total: payload.total,
    items_count: payload.items.length,
    city: payload.customer.city,
    coupon: payload.coupon
  });

  window.location.href = whatsappUrl;

  return {
    ok: true,
    payload,
    whatsappUrl,
    message: "تم فتح واتساب لإرسال طلبك"
  };
}
