const CACHE_NAME = "dar-furniture-v1";
const STATIC_ASSETS = [
  "/",
  "/index.html",
  "/css/style.css",
  "/js/script.js",
  "/js/state.js",
  "/js/catalog.js",
  "/js/cart.js",
  "/js/commerce.js",
  "/js/checkout.js",
  "/js/ui.js",
  "/js/actions.js",
  "/js/analytics.js",
  "/data/products.json",
  "/manifest.json",
  "/assets/images/hero-sofa-360.webp",
  "/assets/images/hero-sofa-560.webp",
  "/assets/images/hero-sofa-900.webp"
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

  // Network-first for API/data requests
  if (request.url.includes("/data/")) {
    event.respondWith(
      fetch(request)
        .then((response) => {
          const clone = response.clone();
          caches.open(CACHE_NAME).then((cache) => cache.put(request, clone));
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
          const clone = response.clone();
          caches.open(CACHE_NAME).then((cache) => cache.put(request, clone));
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
