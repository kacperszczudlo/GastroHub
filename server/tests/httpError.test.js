import { describe, it, expect } from "vitest";
import { HttpError, createHttpError, isHttpError } from "../src/common/httpError.js";

describe("httpError", () => {
	it("createHttpError sets status and message", () => {
		const err = createHttpError(404, "Nie znaleziono");
		expect(err).toBeInstanceOf(HttpError);
		expect(err.status).toBe(404);
		expect(err.message).toBe("Nie znaleziono");
		expect(err.name).toBe("HttpError");
	});

	it("isHttpError returns true only for HttpError", () => {
		expect(isHttpError(createHttpError(400, "x"))).toBe(true);
		expect(isHttpError(new Error("x"))).toBe(false);
		expect(isHttpError(null)).toBe(false);
	});
});
