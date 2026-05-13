import { isHttpError } from "../common/httpError.js";

export function errorHandler(err, req, res, _next) {
	let status = 500;
	if (isHttpError(err)) {
		status = err.status;
	} else if (typeof err === "object" && err !== null && "status" in err) {
		const s = err.status;
		if (typeof s === "number") status = s;
	}

	if (status >= 500) {
		console.error(err);
		return res.status(500).json({
			error: "Błąd serwera",
			details: err instanceof Error ? err.message : String(err)
		});
	}

	const message = err instanceof Error ? err.message : String(err);
	return res.status(status).json({
		error: message,
		details: message
	});
}
