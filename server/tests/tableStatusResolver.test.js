import { describe, it, expect } from "vitest";
import { computeEffectiveStatus } from "../src/modules/table/tableStatusResolver.js";

const id = (value) => ({ toString: () => value });

describe("computeEffectiveStatus", () => {
	const table = { _id: id("t1") };

	it("returns occupied when there is an open order for the table", () => {
		const status = computeEffectiveStatus(
			table,
			{
				openOrders: [{ tableId: { _id: id("t1") } }],
				reservations: [],
			},
			new Date("2026-05-13T12:00:00.000Z")
		);
		expect(status).toBe("occupied");
	});

	it("returns occupied when reservation is active", () => {
		const status = computeEffectiveStatus(
			table,
			{
				openOrders: [],
				reservations: [{ tableId: id("t1"), status: "active" }],
			},
			new Date("2026-05-13T12:00:00.000Z")
		);
		expect(status).toBe("occupied");
	});

	it("returns reserved when accepted reservation is in progress", () => {
		const status = computeEffectiveStatus(
			table,
			{
				openOrders: [],
				reservations: [
					{
						tableId: id("t1"),
						status: "accepted",
						reservationDate: "2026-05-13",
						startTime: "11:00",
						endTime: "14:00",
					},
				],
			},
			new Date("2026-05-13T12:00:00.000Z")
		);
		expect(status).toBe("reserved");
	});

	it("returns available when no order, no active hold, no in-window reservation", () => {
		const status = computeEffectiveStatus(
			table,
			{
				openOrders: [{ tableId: { _id: id("other") } }],
				reservations: [
					{
						tableId: id("t1"),
						status: "accepted",
						reservationDate: "2026-05-13",
						startTime: "20:00",
						endTime: "22:00",
					},
				],
			},
			new Date("2026-05-13T12:00:00.000Z")
		);
		expect(status).toBe("available");
	});
});
