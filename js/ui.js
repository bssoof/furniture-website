import { state, STORAGE_KEYS, applyTheme, getPreferredTheme } from "./state.js";
import { getProductById, getProductsByIds, getSimilarProducts } from "./catalog.js";
import { calculateCartTotals, getCartItemsCount, isWishlisted, isCompared } from "./cart.js";
import { trackEvent } from "./analytics.js";

const BODY_SCROLL_LOCK_CLASS = "no-scroll";
const focusableSelectors = 'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])';
const IMAGE_FALLBACK_SRC = "assets/images/hero-sofa-560.webp";

let lastFocusedElement = null;

function qs(selector) {
  return document.querySelector(selector);
}

function qsa(selector) {
  return Array.from(document.querySelectorAll(selector));
}

function byId(id) {
  return document.getElementById(id);
}

export function debounce(fn, delay = 220) {
  let timer = 0;
  return (...args) => {
    window.clearTimeout(timer);
    timer = window.setTimeout(() => fn(...args), delay);
  };
}

export function escapeHTML(text) {
  return String(text)
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;");
}

export function formatPrice(value) {
  return `${Number(value || 0).toLocaleString()} ر.س`;
}

function isUnsplashImage(url) {
  try {
    return new URL(url, window.location.href).hostname.includes("images.unsplash.com");
  } catch {
    return false;
  }
}

function buildOptimizedImageUrl(url, width, quality = 72) {
  if (!isUnsplashImage(url)) return url;
  const parsed = new URL(url, window.location.href);
  parsed.searchParams.set("w", String(width));
  parsed.searchParams.set("q", String(quality));
  parsed.searchParams.set("auto", "format");
  parsed.searchParams.set("fit", "crop");
  return parsed.toString();
}

function buildImageAttributes(url, widths, sizes, quality = 50) {
  const safeUrl = String(url || "");
  if (!safeUrl) return { src: "", srcset: "", sizes: "" };

  if (!isUnsplashImage(safeUrl)) {
    return {
      src: safeUrl,
      srcset: "",
      sizes: sizes || ""
    };
  }

  const srcset = widths
    .map((width) => `${buildOptimizedImageUrl(safeUrl, width, quality)} ${width}w`)
    .join(", ");

  return {
    src: buildOptimizedImageUrl(safeUrl, widths[widths.length - 1], quality),
    srcset,
    sizes
  };
}

function imageAttrsToString(attrs) {
  if (!attrs?.src) return `src="${IMAGE_FALLBACK_SRC}"`;
  const parts = [`src="${escapeHTML(attrs.src)}"`];
  if (attrs.srcset) parts.push(`srcset="${escapeHTML(attrs.srcset)}"`);
  if (attrs.sizes) parts.push(`sizes="${escapeHTML(attrs.sizes)}"`);
  parts.push(`data-fallback-src="${escapeHTML(IMAGE_FALLBACK_SRC)}"`);
  parts.push('onerror="this.onerror=null;this.src=this.dataset.fallbackSrc||\'assets/images/hero-sofa-560.webp\';this.srcset=\'\';"');
  return parts.join(" ");
}

function setBodyScrollLocked(locked) {
  document.body.classList.toggle(BODY_SCROLL_LOCK_CLASS, locked);
}

function createToastContainer() {
  let container = qs(".toast-container");
  if (!container) {
    container = document.createElement("div");
    container.className = "toast-container";
    container.setAttribute("role", "alert");
    container.setAttribute("aria-live", "polite");
    document.body.appendChild(container);
  }
  return container;
}

function announceToScreenReader(message) {
  let announcer = byId("sr-announcer");
  if (!announcer) {
    announcer = document.createElement("div");
    announcer.id = "sr-announcer";
    announcer.setAttribute("role", "status");
    announcer.setAttribute("aria-live", "polite");
    announcer.setAttribute("aria-atomic", "true");
    announcer.className = "sr-only";
    document.body.appendChild(announcer);
  }
  announcer.textContent = "";
  window.setTimeout(() => {
    announcer.textContent = message;
  }, 80);
}

export function showToast(message, type = "success", title = "") {
  const titles = {
    success: "تم بنجاح",
    error: "خطأ",
    warning: "تنبيه",
    info: "معلومة"
  };

  const icons = {
    success: "fa-check",
    error: "fa-xmark",
    warning: "fa-triangle-exclamation",
    info: "fa-circle-info"
  };

  const toast = document.createElement("div");
  toast.className = `toast ${type}`;
  toast.innerHTML = `
    <div class="toast-icon"><i class="fas ${icons[type] || icons.info}" aria-hidden="true"></i></div>
    <div class="toast-content">
      <div class="toast-title">${escapeHTML(title || titles[type] || titles.info)}</div>
      <div class="toast-message">${escapeHTML(message)}</div>
    </div>
    <button class="toast-close" type="button" data-action="toast-close" aria-label="إغلاق الإشعار">
      <i class="fas fa-times" aria-hidden="true"></i>
    </button>
    <div class="toast-progress"></div>
  `;

  const container = createToastContainer();
  container.appendChild(toast);
  announceToScreenReader(message);

  window.setTimeout(() => toast.classList.add("show"), 10);
  window.setTimeout(() => {
    toast.classList.remove("show");
    window.setTimeout(() => toast.remove(), 350);
  }, 3200);
}

export function showNotification(message, type = "success") {
  showToast(message, type);
}

function trapFocus(container) {
  const focusables = container.querySelectorAll(focusableSelectors);
  if (!focusables.length) return () => {};

  const first = focusables[0];
  const last = focusables[focusables.length - 1];

  const onTab = (event) => {
    if (event.key !== "Tab") return;

    if (event.shiftKey && document.activeElement === first) {
      event.preventDefault();
      last.focus();
    }

    if (!event.shiftKey && document.activeElement === last) {
      event.preventDefault();
      first.focus();
    }
  };

  container.addEventListener("keydown", onTab);
  first.focus();

  return () => container.removeEventListener("keydown", onTab);
}

export function openDialog(dialogEl, overlayEl = null) {
  if (!dialogEl) return;

  lastFocusedElement = document.activeElement;
  dialogEl.classList.add("active");
  dialogEl.setAttribute("aria-hidden", "false");

  if (overlayEl) {
    overlayEl.classList.add("active");
    overlayEl.setAttribute("aria-hidden", "false");
  }

  setBodyScrollLocked(true);
  dialogEl._cleanupFocusTrap = trapFocus(dialogEl);
}

export function closeDialog(dialogEl, overlayEl = null) {
  if (!dialogEl) return;

  dialogEl.classList.remove("active");
  dialogEl.setAttribute("aria-hidden", "true");

  if (overlayEl) {
    overlayEl.classList.remove("active");
    overlayEl.setAttribute("aria-hidden", "true");
  }

  if (dialogEl._cleanupFocusTrap) {
    dialogEl._cleanupFocusTrap();
  }

  setBodyScrollLocked(false);

  if (lastFocusedElement && typeof lastFocusedElement.focus === "function") {
    lastFocusedElement.focus();
  }
}

function renderStars(rating) {
  const value = Number(rating || 0);
  const full = Math.floor(value);
  const half = value % 1 >= 0.5;

  let html = "";
  for (let i = 0; i < full; i += 1) html += '<i class="fas fa-star"></i>';
  if (half) html += '<i class="fas fa-star-half-alt"></i>';
  for (let i = full + (half ? 1 : 0); i < 5; i += 1) html += '<i class="far fa-star"></i>';
  return html;
}

export function renderProducts(products) {
  const grid = byId("productsGrid");
  if (!grid) return;

  announceToScreenReader(`تم عرض ${products.length} منتج`);

  if (!products.length) {
    grid.innerHTML = '<p class="ui-empty-state products-empty">لا توجد منتجات مطابقة</p>';
    return;
  }

  grid.innerHTML = products
    .map((product) => {
      const badgeClass = String(product.badge || "").includes("%") ? "badge-sale" : "badge-new";
      const isWished = isWishlisted(product.id);
      const isItemCompared = isCompared(product.id);
      const imageAttrs = buildImageAttributes(
        product.image,
        [320, 480, 640, 800],
        "(max-width: 768px) 92vw, (max-width: 1200px) 45vw, 320px"
      );

      return `
        <article class="product-card" data-product-id="${product.id}">
          <div class="product-image" data-action="open-product-details" data-product-id="${product.id}" role="button" tabindex="0" aria-label="عرض تفاصيل ${escapeHTML(product.name)}">
            <img ${imageAttrsToString(imageAttrs)} alt="${escapeHTML(product.name)}" loading="lazy" width="500" height="360" decoding="async">
            ${product.badge ? `<span class="product-badge ${badgeClass}">${escapeHTML(product.badge)}</span>` : ""}
            <div class="product-actions">
              <button class="action-btn wishlist-btn ${isWished ? "active" : ""}" type="button" data-action="toggle-wishlist-item" data-product-id="${product.id}" aria-label="إضافة إلى المفضلة">
                <i class="fas fa-heart"></i>
              </button>
              <button class="action-btn compare-btn ${isItemCompared ? "active" : ""}" type="button" data-action="toggle-compare-item" data-product-id="${product.id}" aria-label="إضافة للمقارنة">
                <i class="fas fa-balance-scale"></i>
              </button>
              <button class="action-btn share-btn" type="button" data-action="share-product" data-product-id="${product.id}" aria-label="مشاركة المنتج">
                <i class="fas fa-share-alt"></i>
              </button>
            </div>
          </div>
          <div class="product-info">
            <div class="product-category">${escapeHTML(product.category)}</div>
            <h3 class="product-name">${escapeHTML(product.name)}</h3>
            <div class="product-rating">
              ${renderStars(product.rating)}
              <span>(${Number(product.reviews || 0)} تقييم)</span>
            </div>
            <div class="product-price">
              <span class="current-price">${formatPrice(product.price)}</span>
              ${product.oldPrice ? `<span class="old-price">${formatPrice(product.oldPrice)}</span>` : ""}
            </div>
            <button class="add-to-cart" type="button" data-action="add-to-cart" data-product-id="${product.id}">
              <i class="fas fa-cart-plus"></i>
              أضف للسلة
            </button>
          </div>
        </article>
      `;
    })
    .join("");
}

export function renderCart() {
  const container = byId("cartItems");
  if (!container) return;

  if (!state.cart.length) {
    container.innerHTML = `
      <div class="ui-empty-state cart-empty-state">
        <i class="fas fa-shopping-cart ui-empty-icon"></i>
        <p>السلة فارغة حالياً</p>
        <button type="button" data-action="toggle-cart" class="ui-empty-action">تابع التسوق</button>
      </div>
    `;
    return;
  }

  container.innerHTML = state.cart
    .map((item, index) => {
      const imageAttrs = buildImageAttributes(item.image, [120, 180, 240], "96px");
      return `
        <div class="cart-item">
          <img ${imageAttrsToString(imageAttrs)} alt="${escapeHTML(item.name)}" width="96" height="96" loading="lazy" decoding="async">
          <div class="cart-item-info">
            <div class="cart-item-name">${escapeHTML(item.name)}</div>
            <div class="cart-item-price">${formatPrice(item.price)}</div>
            <div class="cart-item-qty">
              <button class="qty-btn" type="button" data-action="cart-decrease" data-index="${index}" aria-label="تقليل الكمية">-</button>
              <span>${Number(item.quantity || 1)}</span>
              <button class="qty-btn" type="button" data-action="cart-increase" data-index="${index}" aria-label="زيادة الكمية">+</button>
              <button class="qty-btn ui-btn-danger" type="button" data-action="cart-remove" data-index="${index}" aria-label="حذف المنتج">
                <i class="fas fa-trash"></i>
              </button>
            </div>
          </div>
        </div>
      `
    })
    .join("");
}

export function renderWishlist() {
  const container = byId("wishlistItems");
  if (!container) return;

  const products = getProductsByIds(state.wishlist);

  if (!products.length) {
    container.innerHTML = '<p class="ui-empty-state wishlist-empty-state">المفضلة فارغة</p>';
    return;
  }

  container.innerHTML = products
    .map((product, index) => {
      const imageAttrs = buildImageAttributes(product.image, [120, 180, 240], "90px");
      return `
        <div class="cart-item">
          <img ${imageAttrsToString(imageAttrs)} alt="${escapeHTML(product.name)}" width="90" height="90" loading="lazy" decoding="async">
          <div class="cart-item-info">
            <div class="cart-item-name">${escapeHTML(product.name)}</div>
            <div class="cart-item-price">${formatPrice(product.price)}</div>
            <div class="cart-item-qty ui-mt-sm">
              <button class="qty-btn" type="button" data-action="add-to-cart" data-product-id="${product.id}">أضف للسلة</button>
              <button class="qty-btn ui-btn-danger" type="button" data-action="wishlist-remove" data-index="${index}">حذف</button>
            </div>
          </div>
        </div>
      `
    })
    .join("");
}

export function renderCompare() {
  const container = byId("compareContent");
  if (!container) return;

  const products = getProductsByIds(state.compare);

  if (!products.length) {
    container.innerHTML = '<p class="ui-empty-state compare-empty-state">لا توجد منتجات للمقارنة</p>';
    return;
  }

  const imageMap = new Map(
    products.map((product) => [
      product.id,
      buildImageAttributes(product.image, [160, 240, 320], "140px")
    ])
  );

  container.innerHTML = `
    <div class="compare-scroll">
      <table class="compare-table">
        <tr>
          <th class="compare-cell compare-head">المنتج</th>
          ${products
            .map(
              (product) => `
            <td class="compare-cell compare-product-cell">
              <img ${imageAttrsToString(imageMap.get(product.id))} alt="${escapeHTML(product.name)}" class="compare-thumb" width="140" height="140" loading="lazy" decoding="async">
              <h4 class="compare-product-name">${escapeHTML(product.name)}</h4>
              <button type="button" data-action="compare-remove" data-product-id="${product.id}" class="compare-remove-btn">إزالة</button>
            </td>`
            )
            .join("")}
        </tr>
        <tr>
          <th class="compare-cell compare-head">السعر</th>
          ${products.map((product) => `<td class="compare-cell">${formatPrice(product.price)}</td>`).join("")}
        </tr>
        <tr>
          <th class="compare-cell compare-head">المادة</th>
          ${products.map((product) => `<td class="compare-cell">${escapeHTML(product.material || "-")}</td>`).join("")}
        </tr>
        <tr>
          <th class="compare-cell compare-head">الأبعاد</th>
          ${products.map((product) => `<td class="compare-cell">${escapeHTML(product.dimensions || "-")}</td>`).join("")}
        </tr>
        <tr>
          <th class="compare-cell compare-head compare-last-row">الإجراء</th>
          ${products
            .map(
              (product) => `<td class="compare-cell compare-last-row">
                <button type="button" data-action="add-to-cart" data-product-id="${product.id}" class="compare-add-btn">أضف للسلة</button>
              </td>`
            )
            .join("")}
        </tr>
      </table>
    </div>
  `;
}

function renderReviewStars(rating) {
  const safe = Math.max(1, Math.min(5, Number(rating || 0)));
  return `${'<i class="fas fa-star"></i>'.repeat(safe)}${'<i class="far fa-star"></i>'.repeat(5 - safe)}`;
}

export function renderReviews(productId) {
  const container = byId("productReviewsList");
  if (!container) return;

  const reviews = state.reviews.filter((review) => Number(review.productId) === Number(productId));

  if (!reviews.length) {
    container.innerHTML = '<p class="ui-empty-state reviews-empty-state">لا توجد تقييمات بعد. كن أول من يقيّم!</p>';
    return;
  }

  container.innerHTML = reviews
    .map(
      (review) => `
        <div class="review-item">
          <div class="review-header">
            <div class="review-author"><i class="fas fa-user-circle"></i> <span>${escapeHTML(review.name)}</span></div>
            <div class="review-rating">${renderReviewStars(review.rating)}</div>
          </div>
          <div class="review-date">${new Date(review.date).toLocaleDateString("ar-SA")}</div>
          <div class="review-text">${escapeHTML(review.text)}</div>
        </div>
      `
    )
    .join("");
}

export function renderSimilarProducts(productId) {
  const section = byId("similarProducts");
  const grid = section?.querySelector(".similar-products-grid");
  if (!section || !grid) return;

  const similar = getSimilarProducts(productId);
  if (!similar.length) {
    section.style.display = "none";
    return;
  }

  section.style.display = "block";
  grid.innerHTML = similar
    .map((product) => {
      const imageAttrs = buildImageAttributes(
        product.image,
        [220, 320, 440],
        "(max-width: 768px) 90vw, 220px"
      );
      return `
        <article class="similar-product-card" data-action="open-product-details" data-product-id="${product.id}" role="button" tabindex="0" aria-label="عرض ${escapeHTML(product.name)}">
          <img ${imageAttrsToString(imageAttrs)} alt="${escapeHTML(product.name)}" loading="lazy" width="220" height="160" decoding="async">
          <div class="similar-product-info">
            <div class="similar-product-name">${escapeHTML(product.name)}</div>
            <div class="similar-product-price">${formatPrice(product.price)}</div>
            <div class="similar-product-rating">${renderStars(product.rating)} <span>${Number(product.rating || 0).toFixed(1)}</span></div>
          </div>
        </article>
      `
    })
    .join("");
}

export function openProductDetails(productId) {
  const product = getProductById(productId);
  if (!product) return;

  state.currentProductId = product.id;

  const modal = byId("productDetailsModal");
  const overlay = byId("productDetailsOverlay");
  const image = byId("detailsProductImage");
  const badge = byId("detailsProductBadge");

  if (!modal || !overlay || !image) return;

  const detailsImage = buildImageAttributes(
    product.image,
    [480, 768, 1024, 1280],
    "(max-width: 768px) 96vw, 620px"
  );

  image.src = detailsImage.src;
  if (detailsImage.srcset) {
    image.setAttribute("srcset", detailsImage.srcset);
  } else {
    image.removeAttribute("srcset");
  }
  if (detailsImage.sizes) {
    image.setAttribute("sizes", detailsImage.sizes);
  } else {
    image.removeAttribute("sizes");
  }
  image.alt = product.name;
  image.width = 620;
  image.height = 460;
  image.dataset.fallbackSrc = IMAGE_FALLBACK_SRC;
  image.onerror = () => {
    image.onerror = null;
    image.src = IMAGE_FALLBACK_SRC;
    image.removeAttribute("srcset");
  };

  byId("detailsProductName").textContent = product.name;
  byId("detailsProductCategory").textContent = product.category;
  byId("detailsProductPrice").textContent = formatPrice(product.price);

  const oldPrice = byId("detailsProductOldPrice");
  if (oldPrice) {
    if (product.oldPrice) {
      oldPrice.textContent = formatPrice(product.oldPrice);
      oldPrice.style.display = "inline";
    } else {
      oldPrice.style.display = "none";
    }
  }

  const ratingEl = byId("detailsProductRating");
  if (ratingEl) {
    ratingEl.innerHTML = `${renderStars(product.rating)} <span>(${Number(product.reviews || 0)} تقييم)</span>`;
  }

  const specs = byId("detailsProductSpecs");
  if (specs) {
    specs.innerHTML = `
      <div class="spec-item"><strong>المادة:</strong> ${escapeHTML(product.material || "-")}</div>
      <div class="spec-item"><strong>الأبعاد:</strong> ${escapeHTML(product.dimensions || "-")}</div>
      <div class="spec-item"><strong>الألوان المتاحة:</strong> ${escapeHTML((product.colors || []).join("، ") || "-")}</div>
      <div class="spec-item"><strong>الحالة:</strong> ${product.inStock ? '<span class="status-in-stock">متوفر</span>' : '<span class="status-out-of-stock">غير متوفر</span>'}</div>
    `;
  }

  if (badge) {
    if (product.badge) {
      badge.textContent = product.badge;
      badge.style.display = "inline-flex";
    } else {
      badge.style.display = "none";
    }
  }

  renderReviews(product.id);
  renderSimilarProducts(product.id);
  openDialog(modal, overlay);

  trackEvent("view_product", {
    product_id: product.id,
    category: product.category,
    price: product.price
  });
}

export function closeProductDetails() {
  closeDialog(byId("productDetailsModal"), byId("productDetailsOverlay"));
}

export function renderSearchResults(products) {
  const container = byId("searchResults");
  if (!container) return;

  if (!products.length) {
    container.innerHTML = '<p class="search-empty">لا توجد نتائج</p>';
    return;
  }

  container.innerHTML = products
    .map((product) => {
      const imageAttrs = buildImageAttributes(product.image, [60, 120, 180], "60px");
      return `
        <article class="search-result-item" data-action="open-search-result" data-product-id="${product.id}" role="button" tabindex="0" aria-label="فتح ${escapeHTML(product.name)}">
          <img ${imageAttrsToString(imageAttrs)} alt="${escapeHTML(product.name)}" width="60" height="60" loading="lazy" decoding="async" class="search-result-thumb">
          <div>
            <div class="search-result-name">${escapeHTML(product.name)}</div>
            <div class="search-result-price">${formatPrice(product.price)}</div>
            <div class="search-result-category">${escapeHTML(product.category)}</div>
          </div>
        </article>
      `
    })
    .join("");
}

export function updateCounts() {
  const cartCount = getCartItemsCount();
  const wishlistCount = state.wishlist.length;
  const compareCount = state.compare.length;

  const cartCountEl = byId("cartCount");
  const wishlistCountEl = byId("wishlistCount");
  const compareBadge = byId("compareBadge");
  const fabBadge = byId("fabCartBadge");

  if (cartCountEl) cartCountEl.textContent = String(cartCount);
  if (wishlistCountEl) wishlistCountEl.textContent = String(wishlistCount);
  if (compareBadge) {
    compareBadge.textContent = String(compareCount);
    compareBadge.style.display = compareCount ? "flex" : "none";
  }
  if (fabBadge) {
    fabBadge.textContent = String(cartCount);
    fabBadge.style.display = cartCount ? "flex" : "none";
  }
}

export function updateFilterBadge() {
  const badge = byId("filterBadge");
  if (!badge) return;

  let count = 0;
  if (state.activeFilters.rating > 0) count += 1;
  if (state.activeFilters.colors.length > 0) count += 1;
  if (state.activeFilters.inStock) count += 1;

  badge.textContent = String(count);
  badge.style.display = count ? "flex" : "none";
}

export function updatePriceSlider(maxPrice) {
  const slider = byId("priceSlider");
  const value = byId("priceValue");
  if (!slider || !value) return;

  slider.max = String(maxPrice);
  slider.value = String(state.activeFilters.priceRange[1]);
  value.textContent = formatPrice(state.activeFilters.priceRange[1]);
}

export function updateCartTotals(city) {
  const totals = calculateCartTotals(city || byId("shippingCity")?.value);

  const subtotalEl = byId("cartSubtotal");
  const discountRow = byId("discountRow");
  const discountAmount = byId("discountAmount");
  const shippingCost = byId("cartShippingCost");
  const totalEl = byId("cartTotal");

  if (subtotalEl) subtotalEl.textContent = formatPrice(totals.subtotal);
  if (discountRow && discountAmount) {
    if (totals.discount > 0) {
      discountRow.style.display = "flex";
      discountAmount.textContent = `-${formatPrice(totals.discount)}`;
    } else {
      discountRow.style.display = "none";
    }
  }
  if (shippingCost) shippingCost.textContent = totals.shipping.price === 0 ? "مجاني" : formatPrice(totals.shipping.price);
  if (totalEl) totalEl.textContent = formatPrice(totals.total);

  return totals;
}

export function updateCheckoutSummary(city) {
  const itemsContainer = byId("checkoutItems");
  const subtotalEl = byId("checkoutSubtotal");
  const discountEl = byId("checkoutDiscount");
  const shippingEl = byId("checkoutShipping");
  const totalEl = byId("checkoutTotal");

  const totals = calculateCartTotals(city || byId("shippingCity")?.value);

  if (itemsContainer) {
    itemsContainer.innerHTML = state.cart.length
      ? state.cart
          .map(
            (item) => `
            <div class="checkout-item">
              <span>${escapeHTML(item.name)} × ${Number(item.quantity || 1)}</span>
              <span>${formatPrice(item.price * Number(item.quantity || 1))}</span>
            </div>
          `
          )
          .join("")
      : '<p class="checkout-empty-state">لا توجد عناصر في السلة</p>';
  }

  if (subtotalEl) subtotalEl.textContent = formatPrice(totals.subtotal);
  if (discountEl) discountEl.textContent = totals.discount ? `-${formatPrice(totals.discount)}` : formatPrice(0);
  if (shippingEl) shippingEl.textContent = totals.shipping.price === 0 ? "مجاني" : formatPrice(totals.shipping.price);
  if (totalEl) totalEl.textContent = formatPrice(totals.total);

  return totals;
}

export function toggleCart() {
  const sidebar = qs(".cart-sidebar");
  const overlay = byId("cartOverlay");
  if (!sidebar) return;

  if (sidebar.classList.contains("active")) {
    closeDialog(sidebar, overlay);
  } else {
    openDialog(sidebar, overlay);
  }
}

export function toggleWishlist() {
  const sidebar = byId("wishlistSidebar");
  const overlay = byId("wishlistOverlay");
  if (!sidebar) return;

  if (sidebar.classList.contains("active")) {
    closeDialog(sidebar, overlay);
  } else {
    openDialog(sidebar, overlay);
  }
}

export function toggleSearch() {
  const overlay = byId("searchOverlay");
  if (!overlay) return;

  if (overlay.classList.contains("active")) {
    closeDialog(overlay);
  } else {
    openDialog(overlay);
    byId("searchInput")?.focus();
  }
}

export function toggleFiltersModal() {
  const modal = byId("filtersModal");
  const overlay = byId("filtersOverlay");
  if (!modal) return;

  if (modal.classList.contains("active")) {
    closeDialog(modal, overlay);
  } else {
    openDialog(modal, overlay);
  }
}

export function openCompareModal() {
  const modal = byId("compareModal");
  const overlay = byId("compareOverlay");
  if (!modal) return;

  renderCompare();
  openDialog(modal, overlay);
}

export function closeCompareModal() {
  closeDialog(byId("compareModal"), byId("compareOverlay"));
}

export function openCheckoutModal() {
  openDialog(byId("checkoutModal"), byId("checkoutOverlay"));
}

export function closeCheckoutModal() {
  closeDialog(byId("checkoutModal"), byId("checkoutOverlay"));
}

export function scrollToTop() {
  window.scrollTo({ top: 0, behavior: "smooth" });
}

export function initTheme() {
  applyTheme(getPreferredTheme());

  const media = window.matchMedia("(prefers-color-scheme: dark)");
  media.addEventListener("change", (event) => {
    const saved = localStorage.getItem(STORAGE_KEYS.theme);
    if (!saved) {
      applyTheme(event.matches ? "dark" : "light");
    }
  });
}

export function toggleTheme() {
  const current = document.documentElement.getAttribute("data-theme") || "light";
  const next = current === "dark" ? "light" : "dark";
  applyTheme(next);
  showToast(next === "dark" ? "تم تفعيل الوضع الليلي" : "تم تفعيل الوضع النهاري", "success");
}

export function initFloatingCartButton() {
  let container = qs(".fab-container");
  if (!container) {
    container = document.createElement("div");
    container.className = "fab-container";
    container.innerHTML = `
      <button class="fab fab-cart" type="button" data-action="toggle-cart" aria-label="سلة التسوق العائمة">
        <i class="fas fa-shopping-cart"></i>
        <span class="fab-badge" id="fabCartBadge">0</span>
      </button>
    `;
    document.body.appendChild(container);
  }
}

export function initScrollEnhancements() {
  const progressBar = byId("scrollProgress");
  const backToTop = byId("backToTop");
  const fabCart = qs(".fab-cart");
  let ticking = false;

  window.addEventListener(
    "scroll",
    () => {
      if (ticking) return;
      ticking = true;
      requestAnimationFrame(() => {
        const scrollTop = window.scrollY;
        const scrollHeight = document.documentElement.scrollHeight - window.innerHeight;

        if (progressBar) {
          const progress = scrollHeight > 0 ? (scrollTop / scrollHeight) * 100 : 0;
          progressBar.style.width = `${Math.min(100, Math.max(0, progress))}%`;
        }

        if (backToTop) {
          backToTop.classList.toggle("visible", scrollTop > 500);
        }

        if (fabCart) {
          fabCart.classList.toggle("visible", scrollTop > 600);
        }

        ticking = false;
      });
    },
    { passive: true }
  );
}

export function startCountdown() {
  const STORAGE_KEY = 'fw_v2:countdown_end';
  let saved = localStorage.getItem(STORAGE_KEY);
  let endDate;
  if (saved && new Date(saved).getTime() > Date.now()) {
    endDate = new Date(saved);
  } else {
    endDate = new Date();
    endDate.setDate(endDate.getDate() + 5);
    localStorage.setItem(STORAGE_KEY, endDate.toISOString());
  }

  const render = () => {
    const distance = endDate.getTime() - Date.now();
    if (distance <= 0) return;

    const days = Math.floor(distance / (1000 * 60 * 60 * 24));
    const hours = Math.floor((distance % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
    const minutes = Math.floor((distance % (1000 * 60 * 60)) / (1000 * 60));
    const seconds = Math.floor((distance % (1000 * 60)) / 1000);

    const map = {
      days,
      hours,
      minutes,
      seconds
    };

    Object.entries(map).forEach(([key, value]) => {
      const el = byId(key);
      if (el) el.textContent = String(value).padStart(2, "0");
    });
  };

  render();
  window.setInterval(render, 1000);
}

export function closeAllOverlays() {
  closeDialog(qs(".cart-sidebar"), byId("cartOverlay"));
  closeDialog(byId("wishlistSidebar"), byId("wishlistOverlay"));
  closeDialog(byId("searchOverlay"));
  closeDialog(byId("filtersModal"), byId("filtersOverlay"));
  closeDialog(byId("compareModal"), byId("compareOverlay"));
  closeDialog(byId("productDetailsModal"), byId("productDetailsOverlay"));
  closeDialog(byId("checkoutModal"), byId("checkoutOverlay"));
}

export function openSearchResult(productId) {
  toggleSearch();
  openProductDetails(productId);
}

export function updateAppUi(city) {
  updateCounts();
  renderCart();
  renderWishlist();
  updateCartTotals(city);
  updateCheckoutSummary(city);
  updateFilterBadge();
}

export function syncFilterControlStates() {
  qsa(".rating-filter-btn").forEach((btn) => {
    btn.classList.toggle("active", Number(btn.dataset.rating) === Number(state.activeFilters.rating));
  });

  qsa(".color-filter-btn").forEach((btn) => {
    btn.classList.toggle("active", state.activeFilters.colors.includes(btn.dataset.color));
  });

  const stock = byId("inStockOnly");
  if (stock) stock.checked = Boolean(state.activeFilters.inStock);
}
