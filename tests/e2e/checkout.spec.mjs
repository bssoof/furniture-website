import { test, expect } from "@playwright/test";

test("customer can add product and open checkout", async ({ page }) => {
  await page.goto("/");

  await page.getByRole("button", { name: "أضف للسلة" }).first().click();
  await page.getByRole("button", { name: "فتح السلة" }).click();

  await expect(page.locator("#cartItems .cart-item")).toHaveCount(1);

  await page.getByRole("button", { name: /الدفع الآن|checkout/i }).click();
  await expect(page.locator("#checkoutModal")).toHaveClass(/active/);
});
