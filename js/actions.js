import {
  state,
  DEFAULT_FILTERS,
  persistReviews,
  clearAppliedCoupon,
  debugLog
} from "./state.js";
import { filterProducts, searchProducts, getProductById } from "./catalog.js";
import {
  addProductToCart,
  applyCouponCode,
  decreaseCartQuantity,
  increaseCartQuantity,
  removeCartItem,
  removeCompareItem,
  removeWishlistByIndex,
  toggleCompareItem,
  toggleWishlistItem
} from "./cart.js";
import {
  closeCheckoutModal,
  closeCompareModal,
  closeProductDetails,
  debounce,
  openCheckoutModal,
  openCompareModal,
  openProductDetails,
  openSearchResult,
  renderCompare,
  renderProducts,
  renderReviews,
  renderSearchResults,
  scrollToTop,
  showToast,
  startCountdown,
  syncFilterControlStates,
  toggleCart,
  toggleFiltersModal,
  toggleSearch,
  toggleTheme,
  toggleWishlist,
  updateAppUi,
  updateCheckoutSummary,
  updatePriceSlider
} from "./ui.js";
import { submitOrder, validateEmail } from "./checkout.js";
import { trackEvent } from "./analytics.js";

let maxCatalogPrice = 10000;

function getCurrentCity() {
  return document.getElementById("shippingCity")?.value || "";
}

function refreshProducts() {
  renderProducts(filterProducts());
}

function applyFiltersAndRender() {
  refreshProducts();
  updateAppUi(getCurrentCity());
}

function resetFilters() {
  state.activeFilters = {
    ...DEFAULT_FILTERS,
    priceRange: [0, maxCatalogPrice]
  };

  document.querySelectorAll(".filter-tab").forEach((tab) => {
    tab.classList.toggle("active", tab.dataset.filter === "all");
  });

  const sortDropdown = document.getElementById("sortProducts");
  if (sortDropdown) sortDropdown.value = "default";

  const slider = document.getElementById("priceSlider");
  if (slider) {
    slider.value = String(state.activeFilters.priceRange[1]);
  }

  updatePriceSlider(state.activeFilters.priceRange[1]);
  syncFilterControlStates();
  applyFiltersAndRender();
}

function updateSearchResults() {
  const input = document.getElementById("searchInput");
  if (!input) return;

  const query = input.value.trim();
  if (!query) {
    renderSearchResults([]);
    return;
  }

  renderSearchResults(searchProducts(query));
}

const debouncedSearch = debounce(updateSearchResults, 220);

function handleShare(productId) {
  const product = getProductById(productId);
  if (!product) return;

  const shareData = {
    title: product.name,
    text: `شاهد هذا المنتج: ${product.name}`,
    url: `${window.location.origin}${window.location.pathname}#product-${product.id}`
  };

  if (navigator.share) {
    navigator.share(shareData).catch(() => {});
    return;
  }

  navigator.clipboard
    .writeText(shareData.url)
    .then(() => showToast("تم نسخ رابط المنتج", "success"))
    .catch(() => showToast("تعذر نسخ الرابط", "error"));
}

function submitNewsletter(form) {
  const email = form.querySelector('input[type="email"]')?.value?.trim();
  if (!validateEmail(email || "")) {
    showToast("البريد الإلكتروني غير صالح", "error");
    return;
  }

  showToast("شكراً لاشتراكك في النشرة البريدية", "success");
  form.reset();
}

function submitReview(form) {
  if (!state.currentProductId) {
    showToast("اختر منتجاً أولاً", "warning");
    return;
  }

  const name = form.querySelector("#reviewName")?.value?.trim();
  const rating = Number(form.querySelector('input[name="rating"]:checked')?.value || 0);
  const text = form.querySelector("#reviewText")?.value?.trim();

  if (!name || !rating || !text) {
    showToast("الرجاء تعبئة جميع حقول التقييم", "error");
    return;
  }

  state.reviews.push({
    id: Date.now(),
    productId: state.currentProductId,
    name,
    rating,
    text,
    date: new Date().toISOString()
  });

  persistReviews();
  renderReviews(state.currentProductId);
  form.reset();
  showToast("تم إرسال تقييمك بنجاح", "success");
}

function submitCheckoutForm(form) {
  const submitBtn = form.querySelector('button[type="submit"]');
  const originalText = submitBtn?.innerHTML;

  if (submitBtn) {
    submitBtn.disabled = true;
    submitBtn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> جاري تجهيز الطلب...';
  }

  const customer = {
    name: form.querySelector("#checkoutName")?.value?.trim(),
    phone: form.querySelector("#checkoutPhone")?.value?.trim(),
    city: form.querySelector("#shippingCity")?.value,
    address: form.querySelector("#checkoutAddress")?.value?.trim()
  };

  const result = submitOrder(customer);

  if (!result.ok) {
    showToast(result.message, "error");
    if (submitBtn) {
      submitBtn.disabled = false;
      submitBtn.innerHTML = originalText;
    }
    return;
  }

  showToast("تم تحويلك إلى واتساب لإكمال الطلب", "success");
  form.reset();
  closeCheckoutModal();
  if (document.querySelector(".cart-sidebar.active")) {
    toggleCart();
  }
  clearAppliedCoupon();
  updateAppUi("");

  if (submitBtn) {
    submitBtn.disabled = false;
    submitBtn.innerHTML = originalText;
  }
}

function handleAction(action, trigger) {
  switch (action) {
    case "toggle-theme":
      toggleTheme();
      break;
    case "toggle-cart":
      toggleCart();
      break;
    case "toggle-wishlist":
      toggleWishlist();
      break;
    case "toggle-search":
      toggleSearch();
      break;
    case "toggle-mobile-menu":
      document.querySelector(".nav-links")?.classList.toggle("active");
      document.querySelector(".mobile-menu-btn")?.classList.toggle("active");
      break;
    case "open-compare":
      if (!state.compare.length) {
        showToast("لا توجد منتجات للمقارنة", "warning");
      } else {
        renderCompare();
        openCompareModal();
      }
      break;
    case "open-filters":
      toggleFiltersModal();
      break;
    case "close-checkout":
      closeCheckoutModal();
      break;
    case "close-product-details":
      closeProductDetails();
      break;
    case "close-compare":
      closeCompareModal();
      break;
    case "close-filters":
      toggleFiltersModal();
      break;
    case "toast-close":
      trigger.closest(".toast")?.remove();
      break;
    case "open-product-details": {
      const id = Number(trigger.dataset.productId);
      openProductDetails(id);
      break;
    }
    case "open-search-result": {
      const id = Number(trigger.dataset.productId);
      openSearchResult(id);
      break;
    }
    case "add-to-cart": {
      const id = Number(trigger.dataset.productId || state.currentProductId);
      const result = addProductToCart(id);
      if (!result.ok) {
        showToast(result.message, "error");
      } else {
        showToast(`تمت إضافة ${result.product.name} إلى السلة`, "success");
        trackEvent("add_to_cart", {
          product_id: id,
          category: result.product.category,
          price: result.product.price
        });
      }
      updateAppUi(getCurrentCity());
      break;
    }
    case "details-add-to-cart": {
      const id = Number(state.currentProductId);
      const result = addProductToCart(id);
      if (result.ok) {
        showToast(`تمت إضافة ${result.product.name} إلى السلة`, "success");
        updateAppUi(getCurrentCity());
      }
      break;
    }
    case "details-add-to-wishlist": {
      const id = Number(state.currentProductId);
      const added = toggleWishlistItem(id);
      const product = getProductById(id);
      showToast(added ? `تمت إضافة ${product?.name || "المنتج"} إلى المفضلة` : `تمت إزالة ${product?.name || "المنتج"} من المفضلة`, added ? "success" : "info");
      updateAppUi(getCurrentCity());
      refreshProducts();
      break;
    }
    case "details-add-to-compare": {
      const id = Number(state.currentProductId);
      const result = toggleCompareItem(id);
      showToast(result.message, result.ok ? "success" : "warning");
      updateAppUi(getCurrentCity());
      renderCompare();
      break;
    }
    case "toggle-wishlist-item": {
      const id = Number(trigger.dataset.productId);
      const added = toggleWishlistItem(id);
      const product = getProductById(id);
      showToast(added ? `تمت إضافة ${product?.name || "المنتج"} إلى المفضلة` : `تمت إزالة ${product?.name || "المنتج"} من المفضلة`, added ? "success" : "info");
      updateAppUi(getCurrentCity());
      refreshProducts();
      break;
    }
    case "toggle-compare-item": {
      const id = Number(trigger.dataset.productId);
      const result = toggleCompareItem(id);
      showToast(result.message, result.ok ? "success" : "warning");
      updateAppUi(getCurrentCity());
      renderCompare();
      refreshProducts();
      break;
    }
    case "compare-remove": {
      const id = Number(trigger.dataset.productId);
      removeCompareItem(id);
      renderCompare();
      updateAppUi(getCurrentCity());
      refreshProducts();
      break;
    }
    case "wishlist-remove": {
      const removedId = removeWishlistByIndex(Number(trigger.dataset.index));
      const product = getProductById(removedId);
      if (product) showToast(`تم حذف ${product.name} من المفضلة`, "info");
      updateAppUi(getCurrentCity());
      refreshProducts();
      break;
    }
    case "cart-increase":
      increaseCartQuantity(Number(trigger.dataset.index));
      updateAppUi(getCurrentCity());
      break;
    case "cart-decrease":
      decreaseCartQuantity(Number(trigger.dataset.index));
      updateAppUi(getCurrentCity());
      break;
    case "cart-remove": {
      const removed = removeCartItem(Number(trigger.dataset.index));
      if (removed) showToast(`تم حذف ${removed.name} من السلة`, "info");
      updateAppUi(getCurrentCity());
      break;
    }
    case "share-product":
      handleShare(Number(trigger.dataset.productId));
      break;
    case "perform-search":
      updateSearchResults();
      break;
    case "apply-coupon": {
      const code = document.getElementById("couponInput")?.value || "";
      const result = applyCouponCode(code, getCurrentCity());
      showToast(result.message, result.ok ? "success" : "error");
      updateAppUi(getCurrentCity());
      updateCheckoutSummary(getCurrentCity());
      break;
    }
    case "checkout":
      if (!state.cart.length) {
        showToast("السلة فارغة", "warning");
        break;
      }
      if (document.querySelector(".cart-sidebar.active")) {
        toggleCart();
      }
      openCheckoutModal();
      updateCheckoutSummary(getCurrentCity());
      trackEvent("begin_checkout", {
        items_count: state.cart.length
      });
      break;
    case "apply-filters":
      applyFiltersAndRender();
      toggleFiltersModal();
      break;
    case "reset-filters":
      resetFilters();
      break;
    case "scroll-top":
      scrollToTop();
      break;
    default:
      break;
  }
}

function bindClickActions() {
  document.addEventListener("click", (event) => {
    const trigger = event.target.closest("[data-action]");
    if (!trigger) return;

    const action = trigger.dataset.action;

    if (trigger.tagName === "A" && trigger.getAttribute("href") === "#") {
      event.preventDefault();
    }

    handleAction(action, trigger);
  });
}

function bindOverlayClicks() {
  const overlayMap = [
    { overlay: "cartOverlay", handler: () => toggleCart() },
    { overlay: "wishlistOverlay", handler: () => toggleWishlist() },
    { overlay: "productDetailsOverlay", handler: () => closeProductDetails() },
    { overlay: "searchOverlay", handler: () => toggleSearch() },
    { overlay: "filtersOverlay", handler: () => toggleFiltersModal() },
    { overlay: "compareOverlay", handler: () => closeCompareModal() },
    { overlay: "checkoutOverlay", handler: () => closeCheckoutModal() },
  ];

  overlayMap.forEach(({ overlay, handler }) => {
    const el = document.getElementById(overlay);
    if (el) {
      el.addEventListener("click", (event) => {
        if (event.target === el) handler();
      });
    }
  });
}

function bindKeyboardActions() {
  document.addEventListener("keydown", (event) => {
    if (event.key === "Escape") {
      document.querySelectorAll(".active").forEach((el) => {
        if (el.id === "searchOverlay") toggleSearch();
        if (el.id === "filtersModal") toggleFiltersModal();
        if (el.id === "compareModal") closeCompareModal();
        if (el.id === "productDetailsModal") closeProductDetails();
        if (el.id === "checkoutModal") closeCheckoutModal();
      });

      if (document.querySelector(".cart-sidebar.active")) toggleCart();
      if (document.querySelector("#wishlistSidebar.active")) toggleWishlist();
      if (document.querySelector(".nav-links.active")) {
        document.querySelector(".nav-links")?.classList.remove("active");
        document.querySelector(".mobile-menu-btn")?.classList.remove("active");
      }
    }

    if (event.key === "Enter" || event.key === " ") {
      const trigger = event.target.closest('[data-action="open-product-details"], [data-action="open-search-result"]');
      if (trigger) {
        event.preventDefault();
        handleAction(trigger.dataset.action, trigger);
      }
    }
  });
}

function bindFormActions() {
  document.addEventListener("submit", (event) => {
    const action = event.target.dataset.action;
    if (!action) return;

    event.preventDefault();

    if (action === "submit-order") {
      submitCheckoutForm(event.target);
      return;
    }

    if (action === "subscribe-newsletter") {
      submitNewsletter(event.target);
      return;
    }

    if (action === "submit-review") {
      submitReview(event.target);
    }
  });
}

function bindControlEvents() {
  const searchInput = document.getElementById("searchInput");
  if (searchInput) {
    searchInput.addEventListener("input", () => debouncedSearch());
    searchInput.addEventListener("keydown", (event) => {
      if (event.key === "Enter") {
        event.preventDefault();
        updateSearchResults();
      }
    });
  }

  const sortDropdown = document.getElementById("sortProducts");
  if (sortDropdown) {
    sortDropdown.addEventListener("change", (event) => {
      state.activeFilters.sortBy = event.target.value;
      applyFiltersAndRender();
    });
  }

  const priceSlider = document.getElementById("priceSlider");
  if (priceSlider) {
    priceSlider.addEventListener("input", (event) => {
      const value = Number(event.target.value || state.activeFilters.priceRange[1]);
      state.activeFilters.priceRange = [0, value];
      updatePriceSlider(value);
    });
  }

  const stockCheck = document.getElementById("inStockOnly");
  if (stockCheck) {
    stockCheck.addEventListener("change", (event) => {
      state.activeFilters.inStock = event.target.checked;
    });
  }

  document.querySelectorAll(".filter-tab").forEach((tab) => {
    tab.addEventListener("click", () => {
      document.querySelectorAll(".filter-tab").forEach((item) => item.classList.remove("active"));
      tab.classList.add("active");
      state.activeFilters.category = tab.dataset.filter;
      applyFiltersAndRender();
    });
  });

  document.querySelectorAll(".rating-filter-btn").forEach((btn) => {
    btn.addEventListener("click", () => {
      document.querySelectorAll(".rating-filter-btn").forEach((item) => item.classList.remove("active"));
      btn.classList.add("active");
      state.activeFilters.rating = Number(btn.dataset.rating || 0);
    });
  });

  document.querySelectorAll(".color-filter-btn").forEach((btn) => {
    btn.addEventListener("click", () => {
      btn.classList.toggle("active");
      const color = btn.dataset.color;
      if (!color) return;

      if (btn.classList.contains("active")) {
        if (!state.activeFilters.colors.includes(color)) {
          state.activeFilters.colors.push(color);
        }
      } else {
        state.activeFilters.colors = state.activeFilters.colors.filter((item) => item !== color);
      }
    });
  });

  document.addEventListener("change", (event) => {
    if (event.target.id === "shippingCity") {
      updateAppUi(getCurrentCity());
    }
  });

  document.querySelectorAll('a[href^="#"]').forEach((anchor) => {
    anchor.addEventListener("click", (event) => {
      const href = anchor.getAttribute("href");
      if (!href || href === "#") return;

      const target = document.querySelector(href);
      if (!target) return;

      event.preventDefault();
      target.scrollIntoView({ behavior: "smooth", block: "start" });
      document.querySelector(".nav-links")?.classList.remove("active");
      document.querySelector(".mobile-menu-btn")?.classList.remove("active");
    });
  });
}

function bindStorageSync() {
  window.addEventListener("storage", () => {
    updateAppUi(getCurrentCity());
    refreshProducts();
  });
}

export function initializeInteractions(maxPrice) {
  maxCatalogPrice = Number(maxPrice || maxCatalogPrice);
  state.activeFilters.priceRange = [0, maxCatalogPrice];
  updatePriceSlider(maxPrice);
  refreshProducts();
  updateAppUi(getCurrentCity());
  bindClickActions();
  bindOverlayClicks();
  bindKeyboardActions();
  bindFormActions();
  bindControlEvents();
  bindStorageSync();
  startCountdown();
  debugLog("Interactions bound");
}
