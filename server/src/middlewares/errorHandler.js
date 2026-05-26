import { isHttpError } from "../common/httpError.js";
import { apiErrorsTotal } from "../metrics/index.js";

export function errorHandler(err, req, res, _next) {
	let status = 500;
	if (isHttpError(err)) {
		status = err.status;
	} else if (typeof err === "object" && err !== null && "status" in err) {
		const s = err.status;
		if (typeof s === "number") status = s;
	}

	const now = new Date();
	const timestamp = now.toISOString();
	const context = {
		method: req.method,
		path: req.originalUrl ?? req.url,
		ip: req.ip,
		userAgent: req.get("user-agent") ?? undefined
	};

	if (status >= 500) {
		apiErrorsTotal.inc({ type: "server_error" });
		console.error(
			`[${timestamp}] 500 error`,
			JSON.stringify(context),
			err instanceof Error ? err.stack : String(err)
		);
		return res.status(500).json({
			error: "Błąd serwera",
			details: err instanceof Error ? err.message : String(err)
		});
	}

	if (status >= 400) {
		apiErrorsTotal.inc({ type: status === 404 ? "not_found" : "bad_request" });
		console.warn(
			`[${timestamp}] ${status} error`,
			JSON.stringify(context),
			err instanceof Error ? err.message : String(err)
		);
	}

	const message = err instanceof Error ? err.message : String(err);
	return res.status(status).json({
		error: message,
		details: message
	});
}
