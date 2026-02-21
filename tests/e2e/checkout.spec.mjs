import { test, expect } from "@playwright/test";

test("customer can add product and open checkout", async ({ page }) => {
  await page.setViewportSize({ width: 1600, height: 900 });
  await page.goto("/");

  await page.locator('[data-action="add-to-cart"]').first().click();
  await page.locator('[data-action="toggle-cart"]').first().click();

  await expect(page.locator("#cartItems .cart-item")).toHaveCount(1);

  await page.locator('[data-action="checkout"]').click();
  await expect(page.locator("#checkoutModal")).toHaveClass(/active/);
});
