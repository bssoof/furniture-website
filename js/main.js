import {
  loadPersistedState,
  migrateLegacyCollections,
  normalizePersistedItemsWithCatalog
} from "./state.js";
import { loadCatalog, filterProducts } from "./catalog.js";
import {
  renderProducts,
  initTheme,
  initFloatingCartButton,
  initScrollEnhancements,
  syncDecorativeIcons
} from "./ui.js";
import { initializeInteractions } from "./actions.js";

async function registerServiceWorker() {
  if (!("serviceWorker" in navigator)) return;

  const protocol = window.location.protocol;
  const isSupportedProtocol = protocol === "https:" || protocol === "http:";
  if (!isSupportedProtocol) return;

  try {
    const swUrl = new URL("sw.js", window.location.href);
    const scopeUrl = new URL("./", window.location.href);
    const registration = await navigator.serviceWorker.register(swUrl, {
      scope: scopeUrl.pathname
    });
    registration.update().catch(() => {});
  } catch (error) {
    console.warn("Service worker registration failed", error);
  }
}

async function bootstrap() {
  loadPersistedState();

  const { maxPrice } = await loadCatalog();

  migrateLegacyCollections();
  normalizePersistedItemsWithCatalog();

  initTheme();
  initFloatingCartButton();
  initScrollEnhancements();

  renderProducts(filterProducts());

  initializeInteractions(maxPrice);
  syncDecorativeIcons();
}

bootstrap()
  .then(() => registerServiceWorker())
  .catch((error) => {
    console.error("App bootstrap failed", error);
  });
