import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";

vi.mock("../src/modules/order/order.repository.js", () => ({
	markOrderPaid: vi.fn(),
}));
vi.mock("../src/modules/table/table.repository.js", () => ({
	unlinkOrderFromTable: vi.fn(),
}));
vi.mock("../src/modules/reservation/reservation.port.js", () => ({
	closeActiveReservationForTable: vi.fn(),
}));

import { executeCompleteOrder } from "../src/modules/order/completeOrder.useCase.js";
import * as orderRepository from "../src/modules/order/order.repository.js";
import * as tableRepository from "../src/modules/table/table.repository.js";
import * as reservationPort from "../src/modules/reservation/reservation.port.js";

describe("executeCompleteOrder", () => {
	let logSpy;

	beforeEach(() => {
		vi.clearAllMocks();
		logSpy = vi.spyOn(console, "log").mockImplementation(() => {});
	});

	afterEach(() => {
		logSpy.mockRestore();
	});

	it("throws 404 when order not found", async () => {
		orderRepository.markOrderPaid.mockResolvedValue(null);
		await expect(executeCompleteOrder("id")).rejects.toMatchObject({
			status: 404,
			message: expect.stringContaining("Zamówienie"),
		});
		expect(tableRepository.unlinkOrderFromTable).not.toHaveBeenCalled();
	});

	it("unlinks table and closes reservation when order has tableId", async () => {
		const tableId = { toString: () => "tbl1" };
		orderRepository.markOrderPaid.mockResolvedValue({
			_id: "ord1",
			tableId,
			status: "paid",
		});

		const result = await executeCompleteOrder("ord1");

		expect(result.message).toContain("opłacone");
		expect(tableRepository.unlinkOrderFromTable).toHaveBeenCalledWith(tableId);
		expect(reservationPort.closeActiveReservationForTable).toHaveBeenCalledWith(tableId);
	});

	it("skips table cleanup when order has no tableId", async () => {
		orderRepository.markOrderPaid.mockResolvedValue({
			_id: "ord2",
			tableId: null,
			status: "paid",
		});

		await executeCompleteOrder("ord2");

		expect(tableRepository.unlinkOrderFromTable).not.toHaveBeenCalled();
		expect(reservationPort.closeActiveReservationForTable).not.toHaveBeenCalled();
	});
});
