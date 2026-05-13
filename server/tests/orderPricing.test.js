import { describe, it, expect, vi, beforeEach } from "vitest";

const findById = vi.hoisted(() => vi.fn());

vi.mock("../src/modules/menu/menu.model.js", () => ({
	default: { findById },
}));

import { normalizeAndPriceOrderItems } from "../src/modules/order/orderPricing.js";
import { HttpError } from "../src/common/httpError.js";

describe("normalizeAndPriceOrderItems", () => {
	beforeEach(() => {
		findById.mockReset();
	});

	it("throws when items missing or empty", async () => {
		await expect(normalizeAndPriceOrderItems(null)).rejects.toThrow(HttpError);
		await expect(normalizeAndPriceOrderItems([])).rejects.toMatchObject({
			status: 400,
		});
	});

	it("throws when menuItemId or quantity missing", async () => {
		await expect(
			normalizeAndPriceOrderItems([{ menuItemId: "507f1f77bcf86cd799439011" }])
		).rejects.toMatchObject({ status: 400 });
	});

	it("throws 404 when menu item not found", async () => {
		findById.mockResolvedValue(null);
		await expect(
			normalizeAndPriceOrderItems([
				{ menuItemId: "507f1f77bcf86cd799439011", quantity: 2 },
			])
		).rejects.toMatchObject({ status: 404 });
	});

	it("normalizes aliases and sums total price", async () => {
		const a = { _id: "507f1f77bcf86cd799439011", price: 10 };
		const b = { _id: "507f1f77bcf86cd799439012", price: 2.5 };
		findById.mockImplementation(async (id) => {
			if (String(id) === String(a._id)) return a;
			if (String(id) === String(b._id)) return b;
			return null;
		});

		const result = await normalizeAndPriceOrderItems([
			{ menuId: a._id, qty: 2 },
			{ id: b._id, count: 1 },
		]);

		expect(result.totalPrice).toBe(22.5);
		expect(result.normalized).toEqual([
			{ menuItemId: a._id, quantity: 2 },
			{ menuItemId: b._id, quantity: 1 },
		]);
	});
});
