import {
	activeConnections,
	httpRequestDurationMs,
	httpRequestsTotal,
} from "../metrics/index.js";

function getRoutePattern(req) {
	if (req.route?.path) {
		const suffix = req.route.path === "/" ? "" : req.route.path;
		return `${req.baseUrl || ""}${suffix}` || req.path;
	}
	return req.path;
}

export function metricsMiddleware(req, res, next) {
	const startMs = Date.now();
	activeConnections.inc();

	res.on("finish", () => {
		const durationMs = Date.now() - startMs;
		const route = getRoutePattern(req);
		const labels = {
			method: req.method,
			route,
			status_code: String(res.statusCode),
		};

		httpRequestsTotal.inc(labels);
		httpRequestDurationMs.observe(labels, durationMs);
		activeConnections.dec();
	});

	next();
}
