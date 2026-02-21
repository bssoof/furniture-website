import { test, expect } from "@playwright/test";

const MOBILE_VIEWPORTS = [
  { width: 360, height: 800 },
  { width: 390, height: 844 },
  { width: 430, height: 932 }
];

async function expectMenuButtonInsideViewport(page) {
  const rect = await page.locator(".mobile-menu-btn").evaluate((el) => {
    const box = el.getBoundingClientRect();
    return {
      left: box.left,
      right: box.right,
      top: box.top,
      bottom: box.bottom,
      viewportWidth: window.innerWidth,
      viewportHeight: window.innerHeight
    };
  });

  expect(rect.left).toBeGreaterThanOrEqual(0);
  expect(rect.top).toBeGreaterThanOrEqual(0);
  expect(rect.right).toBeLessThanOrEqual(rect.viewportWidth);
  expect(rect.bottom).toBeLessThanOrEqual(rect.viewportHeight);
}

async function openMobileMenu(page) {
  await page.locator(".mobile-menu-btn").click();
  await expect(page.locator("#mobileNavLinks")).toHaveClass(/active/);
  await expect(page.locator("#mobileMenuOverlay")).toHaveClass(/active/);
}

for (const viewport of MOBILE_VIEWPORTS) {
  test(`mobile nav and utilities work at ${viewport.width}x${viewport.height}`, async ({ page }) => {
    await page.setViewportSize(viewport);
    await page.goto("/");

    await expect(page.locator(".mobile-menu-btn")).toBeVisible();
    await expectMenuButtonInsideViewport(page);

    const hasHorizontalOverflow = await page.evaluate(
      () => document.documentElement.scrollWidth > document.documentElement.clientWidth
    );
    expect(hasHorizontalOverflow).toBe(false);

    await openMobileMenu(page);
    await expect(page.locator("#mobileMenuOverlay")).toHaveClass(/active/);
    await expect(page.locator("body")).toHaveClass(/no-scroll/);
    await expect(page.locator(".mobile-menu-btn")).toHaveAttribute("aria-expanded", "true");
    await expect(page.locator("#mobileNavLinks")).toHaveAttribute("aria-hidden", "false");

    await page.keyboard.press("Escape");
    await expect(page.locator("#mobileNavLinks")).not.toHaveClass(/active/);
    await expect(page.locator("#mobileMenuOverlay")).not.toHaveClass(/active/);
    await expect(page.locator(".mobile-menu-btn")).toHaveAttribute("aria-expanded", "false");

    await openMobileMenu(page);
    await page.locator("#mobileMenuOverlay").click({ position: { x: 10, y: 200 } });
    await expect(page.locator("#mobileNavLinks")).not.toHaveClass(/active/);

    await openMobileMenu(page);
    await page.locator('[data-mobile-menu="utility"][data-action="toggle-search"]').click();
    await expect(page.locator("#searchOverlay")).toHaveClass(/active/);
    await expect(page.locator("#mobileNavLinks")).not.toHaveClass(/active/);
    await page.keyboard.press("Escape");
    await expect(page.locator("#searchOverlay")).not.toHaveClass(/active/);

    await openMobileMenu(page);
    await page.locator('[data-mobile-menu="utility"][data-action="toggle-wishlist"]').click();
    await expect(page.locator("#wishlistSidebar")).toHaveClass(/active/);
    await page.keyboard.press("Escape");
    await expect(page.locator("#wishlistSidebar")).not.toHaveClass(/active/);

    await openMobileMenu(page);
    await page.locator('[data-mobile-menu="utility"][data-action="open-filters"]').click();
    await expect(page.locator("#filtersModal")).toHaveClass(/active/);
    await page.keyboard.press("Escape");
    await expect(page.locator("#filtersModal")).not.toHaveClass(/active/);

    await openMobileMenu(page);
    await page.locator('[data-mobile-menu="utility"][data-action="open-compare"]').click();
    await expect(page.locator(".toast")).toBeVisible();

    const initialTheme = await page.locator("html").getAttribute("data-theme");
    await openMobileMenu(page);
    await page.locator('[data-mobile-menu="utility"][data-action="toggle-theme"]').click();
    const updatedTheme = await page.locator("html").getAttribute("data-theme");
    expect(updatedTheme).not.toBe(initialTheme);
  });
}
