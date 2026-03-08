import { test, expect } from "@playwright/test";

test("localhost modular storefront works end-to-end", async ({ page }) => {
  const consoleErrors = [];
  const pageErrors = [];

  page.on("console", (msg) => {
    if (msg.type() === "error") {
      consoleErrors.push(msg.text());
    }
  });

  page.on("pageerror", (error) => {
    pageErrors.push(error.message);
  });

  await page.setViewportSize({ width: 390, height: 844 });
  await page.goto("/", { waitUntil: "networkidle" });
  await page.waitForFunction(async () => Boolean(await navigator.serviceWorker.getRegistration()));
  await page.reload({ waitUntil: "networkidle" });

  const assets = await page.evaluate(async () => {
    const urls = ["/js/main.js", "/sw.js", "/data/products.json", "/data/coupons.json"];
    const results = [];

    for (const url of urls) {
      const response = await fetch(url, { cache: "no-store" });
      results.push({ url, status: response.status, ok: response.ok });
    }

    return results;
  });

  for (const asset of assets) {
    expect(asset.ok, `${asset.url} should load on localhost`).toBeTruthy();
  }

  const serviceWorkerState = await page.evaluate(async () => {
    const registration = await navigator.serviceWorker.getRegistration();
    return {
      hasRegistration: Boolean(registration),
      hasController: Boolean(navigator.serviceWorker.controller)
    };
  });
  expect(serviceWorkerState.hasRegistration).toBeTruthy();

  const cards = page.locator("#productsGrid .product-card");
  await expect(cards.first()).toBeVisible();
  await expect(cards).toHaveCount(20);

  await expect(page.locator("#productsGrid .current-price").first()).toContainText("₪");

  await page.locator('[data-action="add-to-cart"]').first().click();
  await page.locator('[data-action="toggle-cart"]').first().click();
  await expect(page.locator("#cartItems .cart-item")).toHaveCount(1);

  await page.locator(".cart-sidebar .close-cart").click();
  await expect(page.locator(".cart-sidebar")).not.toHaveClass(/active/);
  await page.locator('[data-action="open-product-details"]').first().click();
  await expect(page.locator("#productDetailsModal")).toHaveClass(/active/);
  await page.locator('[data-action="details-add-to-cart"]').click();
  await page.locator('[data-action="details-add-to-wishlist"]').click();
  await page.locator('[data-action="details-add-to-compare"]').click();

  await expect(page.locator("#wishlistCount")).toHaveText("1");
  await expect(page.locator("#compareBadge")).toHaveText("1");

  await page.locator('[data-action="close-product-details"]').click();
  await expect(page.locator("#productDetailsModal")).not.toHaveClass(/active/);

  const firstProductName = (await page.locator("#productsGrid .product-name").first().textContent())?.trim();
  expect(firstProductName).toBeTruthy();

  await page.locator('[data-action="toggle-search"]').last().click();
  await expect(page.locator("#searchOverlay")).toHaveClass(/active/);
  await page.locator("#searchInput").fill(firstProductName);
  await page.locator('[data-action="perform-search"]').click();
  await expect(page.locator("#searchResults .search-result-item").first()).toBeVisible();
  await page.keyboard.press("Escape");
  await expect(page.locator("#searchOverlay")).not.toHaveClass(/active/);

  await page.locator('.filter-tab[data-filter="غرف المعيشة"]').click();
  await expect(page.locator("#productsGrid .product-card").first()).toBeVisible();
  await page.locator("#sortProducts").selectOption("price-high");

  const topTwoPrices = await page.locator("#productsGrid .current-price").evaluateAll((nodes) =>
    nodes.slice(0, 2).map((node) => Number(String(node.textContent || "").replace(/[^\d.]/g, "") || 0))
  );
  expect(topTwoPrices[0]).toBeGreaterThanOrEqual(topTwoPrices[1]);

  await page.locator('[data-action="toggle-cart"]').first().click();
  await page.locator("#couponInput").fill("FREESHIP");
  await page.locator('[data-action="apply-coupon"]').click();
  await expect(page.locator(".toast").last()).toContainText("FREESHIP");

  await page.locator('[data-action="checkout"]').click();
  await expect(page.locator("#checkoutModal")).toHaveClass(/active/);
  await page.locator("#shippingCity").selectOption("غزة");

  await expect(page.locator("#checkoutShipping")).toContainText("40");
  await expect(page.locator("#checkoutShipping")).toContainText("₪");
  await expect(page.locator("#checkoutDiscount")).toContainText("40");
  await expect(page.locator("#checkoutDiscount")).toContainText("₪");

  await page.locator("#checkoutName").fill("اختبار محلي");
  await page.locator("#checkoutPhone").fill("0569906492");
  await page.locator("#checkoutAddress").fill("رام الله - اختبار 1");

  await page.locator('#checkoutForm button[type="submit"]').click();
  await expect
    .poll(() => page.url(), { timeout: 15000 })
    .toMatch(/https:\/\/(wa\.me|api\.whatsapp\.com)\//);

  const whatsappUrl = page.url();
  expect(whatsappUrl).toMatch(/https:\/\/(wa\.me\/972569906492|api\.whatsapp\.com\/send\/\?phone=972569906492)/);
  const decodedMessage = new URL(whatsappUrl).searchParams.get("text") || "";
  expect(decodedMessage).toContain("طلب جديد من موقع دار الأثاث");
  expect(decodedMessage).toContain("الهاتف: 0569906492");
  expect(decodedMessage).toContain("المدينة: غزة");
  expect(decodedMessage).toContain("الكوبون: FREESHIP");
  expect(decodedMessage).toContain("₪");

  expect(pageErrors, `Unexpected page errors: ${pageErrors.join(" | ")}`).toEqual([]);
  expect(consoleErrors, `Unexpected console errors: ${consoleErrors.join(" | ")}`).toEqual([]);
});
