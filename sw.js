const CACHE_NAME = "dar-furniture-v11";
const SCOPE_URL = new URL(self.registration.scope);

function scopedPath(relativePath) {
  return new URL(relativePath, SCOPE_URL).pathname;
}

const INDEX_FALLBACK = scopedPath("./index.html");
const STATIC_ASSETS = [
  scopedPath("./"),
  INDEX_FALLBACK,
  scopedPath("./css/style.css"),
  scopedPath("./css/tokens-base.css"),
  scopedPath("./css/layout.css"),
  scopedPath("./css/components.css"),
  scopedPath("./css/utilities-state.css"),
  scopedPath("./css/theme-dark.css"),
  scopedPath("./css/responsive.css"),
  scopedPath("./js/main.js"),
  scopedPath("./js/state.js"),
  scopedPath("./js/catalog.js"),
  scopedPath("./js/cart.js"),
  scopedPath("./js/commerce.js"),
  scopedPath("./js/checkout.js"),
  scopedPath("./js/ui.js"),
  scopedPath("./js/actions.js"),
  scopedPath("./js/analytics.js"),
  scopedPath("./data/products.json"),
  scopedPath("./data/coupons.json"),
  scopedPath("./manifest.json"),
  scopedPath("./assets/icons/icon-192.svg"),
  scopedPath("./assets/icons/icon-512.svg"),
  scopedPath("./assets/images/hero-room-bg.jpg"),
  scopedPath("./assets/images/hero-sofa-360.webp"),
  scopedPath("./assets/images/hero-sofa-560.webp"),
  scopedPath("./assets/images/hero-sofa-900.webp")
];

self.addEventListener("install", (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => cache.addAll(STATIC_ASSETS))
  );
  self.skipWaiting();
});

self.addEventListener("activate", (event) => {
  event.waitUntil(
    caches.keys().then((keys) =>
      Promise.all(
        keys
          .filter((key) => key !== CACHE_NAME)
          .map((key) => caches.delete(key))
      )
    )
  );
  self.clients.claim();
});

self.addEventListener("fetch", (event) => {
  const { request } = event;

  // Skip non-GET and chrome-extension requests
  if (request.method !== "GET" || request.url.startsWith("chrome-extension")) {
    return;
  }

  // Network-first for navigation with cached homepage fallback
  if (request.mode === "navigate") {
    event.respondWith(
      fetch(request).catch(() => caches.match(INDEX_FALLBACK))
    );
    return;
  }

  // Network-first for API/data requests
  if (request.url.includes("/data/")) {
    event.respondWith(
      fetch(request)
        .then((response) => {
          if (response.ok) {
            const clone = response.clone();
            caches.open(CACHE_NAME).then((cache) => cache.put(request, clone));
          }
          return response;
        })
        .catch(() => caches.match(request))
    );
    return;
  }

  // Stale-while-revalidate for Unsplash images
  if (request.url.includes("images.unsplash.com")) {
    event.respondWith(
      caches.match(request).then((cached) => {
        const networkFetch = fetch(request).then((response) => {
          if (response.ok) {
            const clone = response.clone();
            caches.open(CACHE_NAME).then((cache) => cache.put(request, clone));
          }
          return response;
        });
        return cached || networkFetch;
      })
    );
    return;
  }

  // Cache-first for static assets
  event.respondWith(
    caches.match(request).then((cached) => {
      if (cached) return cached;
      return fetch(request).then((response) => {
        if (response.ok && response.type === "basic") {
          const clone = response.clone();
          caches.open(CACHE_NAME).then((cache) => cache.put(request, clone));
        }
        return response;
      });
    })
  );
});
