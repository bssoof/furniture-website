import {
  loadPersistedState,
  migrateLegacyCollections,
  normalizePersistedItemsWithCatalog,
  debugLog
} from "./state.js";
import { loadCatalog } from "./catalog.js";
import { initFloatingCartButton, initScrollEnhancements, initTheme, showToast } from "./ui.js";
import { initializeInteractions } from "./actions.js";

function injectProductSchema() {
  try {
    const existing = document.getElementById("products-schema");
    if (existing) existing.remove();

    const listItems = Array.from(document.querySelectorAll(".product-card"))
      .slice(0, 12)
      .map((card, index) => {
        const id = Number(card.dataset.productId);
        const name = card.querySelector(".product-name")?.textContent?.trim();
        const priceText = card.querySelector(".current-price")?.textContent || "";
        const category = card.querySelector(".product-category")?.textContent?.trim() || "";
        const image = card.querySelector("img")?.getAttribute("src") || "";
        const price = Number(priceText.replace(/[^\d]/g, "")) || 0;

        if (!id || !name || !price) return null;

        return {
          "@type": "ListItem",
          position: index + 1,
          item: {
            "@type": "Product",
            name,
            category,
            image,
            sku: `DF-${id}`,
            offers: {
              "@type": "Offer",
              priceCurrency: "SAR",
              price: String(price),
              availability: "https://schema.org/InStock"
            }
          }
        };
      })
      .filter(Boolean);

    if (!listItems.length) return;

    const schema = {
      "@context": "https://schema.org",
      "@type": "ItemList",
      itemListElement: listItems
    };

    const script = document.createElement("script");
    script.id = "products-schema";
    script.type = "application/ld+json";
    script.textContent = JSON.stringify(schema);
    document.head.appendChild(script);
  } catch (error) {
    debugLog("schema injection failed", error);
  }
}

async function initApp() {
  initTheme();
  loadPersistedState();
  migrateLegacyCollections();

  try {
    const { maxPrice } = await loadCatalog();
    normalizePersistedItemsWithCatalog();
    initFloatingCartButton();
    initScrollEnhancements();
    initializeInteractions(maxPrice);
    injectProductSchema();
    debugLog("App initialized");
  } catch (error) {
    console.error(error);
    showToast("تعذر تحميل بيانات المتجر. حاول تحديث الصفحة.", "error");
  }
}

if (document.readyState === "loading") {
  document.addEventListener("DOMContentLoaded", initApp);
} else {
  initApp();
}
