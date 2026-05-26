import client from "prom-client";

export const register = new client.Registry();

// Domyślne metryki Node.js — CPU, RAM, event loop, GC
client.collectDefaultMetrics({ register });

/** Łączna liczba żądań HTTP (etykiety: method, route, status_code) */
export const httpRequestsTotal = new client.Counter({
	name: "http_requests_total",
	help: "Łączna liczba żądań HTTP",
	labelNames: ["method", "route", "status_code"],
	registers: [register],
});

/** Czas trwania żądania w ms — do liczenia p50/p95 w Grafanie */
export const httpRequestDurationMs = new client.Histogram({
	name: "http_request_duration_ms",
	help: "Czas trwania żądania w milisekundach",
	labelNames: ["method", "route", "status_code"],
	buckets: [5, 10, 25, 50, 100, 250, 500, 1000],
	registers: [register],
});

/** Liczba aktualnie obsługiwanych połączeń HTTP */
export const activeConnections = new client.Gauge({
	name: "active_connections",
	help: "Liczba aktualnie obsługiwanych połączeń",
	registers: [register],
});

/** Liczba błędów API (4xx / 5xx) z typem */
export const apiErrorsTotal = new client.Counter({
	name: "api_errors_total",
	help: "Liczba błędów API (4xx/5xx) pogrupowanych wg typu",
	labelNames: ["type"],
	registers: [register],
});
