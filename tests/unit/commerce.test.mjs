import test from "node:test";
import assert from "node:assert/strict";

import {
  calculateCouponDiscount,
  calculateShipping,
  computeCartTotals,
  computeSubtotal
} from "../../js/commerce.js";

test("computeSubtotal sums line totals", () => {
  const subtotal = computeSubtotal([
    { price: 100, quantity: 2 },
    { price: 50, quantity: 1 }
  ]);

  assert.equal(subtotal, 250);
});

test("calculateShipping returns free zone for القدس", () => {
  const shipping = calculateShipping("القدس", 2);
  assert.equal(shipping.price, 0);
  assert.equal(shipping.days, "1-2");
});

test("calculateCouponDiscount applies percent coupon", () => {
  const discount = calculateCouponDiscount(
    1000,
    30,
    { code: "WELCOME10", type: "percent", value: 10, minSubtotal: 500 },
    [{ category: "غرف النوم", price: 1000, quantity: 1 }]
  );

  assert.equal(discount, 100);
});

test("calculateCouponDiscount applies shipping coupon", () => {
  const discount = calculateCouponDiscount(
    800,
    40,
    { code: "FREESHIP", type: "shipping", value: 999 },
    [{ category: "غرف النوم", price: 800, quantity: 1 }]
  );

  assert.equal(discount, 40);
});

test("computeCartTotals returns consistent total for رام الله shipping", () => {
  const totals = computeCartTotals(
    [
      { price: 200, quantity: 2, category: "غرف المعيشة" },
      { price: 100, quantity: 1, category: "غرف الطعام" }
    ],
    "رام الله",
    { code: "ROOM15", type: "percent", value: 15, requiredCategory: "غرف المعيشة", minSubtotal: 200 },
    {
      "رام الله": { price: 15, days: "1-2" },
      "أخرى": { price: 35, days: "3-5" }
    }
  );

  assert.equal(totals.subtotal, 500);
  assert.equal(totals.discount, 75);
  assert.equal(totals.shipping.price, 15);
  assert.equal(totals.shipping.days, "1-2");
  assert.equal(totals.total, 440);
});
