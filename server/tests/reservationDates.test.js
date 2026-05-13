import { describe, it, expect } from "vitest";
import {
	buildReservationStart,
	buildReservationEnd,
} from "../src/modules/reservation/reservation.service.js";

describe("buildReservationStart", () => {
	it("returns null for invalid date", () => {
		expect(buildReservationStart("not-a-date", "12:00")).toBeNull();
	});

	it("parses UTC date parts and local wall time", () => {
		const d = buildReservationStart("2026-06-01T00:00:00.000Z", "14:30");
		expect(d.getFullYear()).toBe(2026);
		expect(d.getMonth()).toBe(5);
		expect(d.getDate()).toBe(1);
		expect(d.getHours()).toBe(14);
		expect(d.getMinutes()).toBe(30);
	});
});

describe("buildReservationEnd", () => {
	it("uses same rules as start", () => {
		const end = buildReservationEnd("2026-06-01T00:00:00.000Z", "16:00");
		expect(end.getHours()).toBe(16);
		expect(end.getMinutes()).toBe(0);
	});
});
