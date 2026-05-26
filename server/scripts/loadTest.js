/**
 * Prosty test obciążeniowy bez zależności zewnętrznych (Node 20+).
 *
 * Użycie:
 *   node scripts/loadTest.js --url http://localhost:5000/api/menu --duration 15 --concurrency 25
 *
 * Opcjonalnie (żeby wygenerować błędy i nabić api_errors_total):
 *   node scripts/loadTest.js --url http://localhost:5000/api/tables/000000000000000000000000/ --duration 10 --concurrency 10
 */
const args = process.argv.slice(2);
const getArg = (name, fallback) => {
	const idx = args.indexOf(name);
	if (idx === -1) return fallback;
	const val = args[idx + 1];
	return val ?? fallback;
};

const url = getArg("--url", "http://localhost:5000/api/menu");
const durationSec = Number(getArg("--duration", "15"));
const concurrency = Number(getArg("--concurrency", "25"));

if (!Number.isFinite(durationSec) || durationSec <= 0) {
	throw new Error("--duration musi być > 0");
}
if (!Number.isFinite(concurrency) || concurrency <= 0) {
	throw new Error("--concurrency musi być > 0");
}

const endAt = Date.now() + durationSec * 1000;

let ok = 0;
let non2xx = 0;
let errors = 0;
let total = 0;
let totalLatencyMs = 0;
let maxLatencyMs = 0;

async function worker() {
	while (Date.now() < endAt) {
		const start = Date.now();
		try {
			const res = await fetch(url);
			await res.arrayBuffer();
			const ms = Date.now() - start;
			totalLatencyMs += ms;
			if (ms > maxLatencyMs) maxLatencyMs = ms;
			total += 1;
			if (res.status >= 200 && res.status < 300) ok += 1;
			else non2xx += 1;
		} catch {
			const ms = Date.now() - start;
			totalLatencyMs += ms;
			if (ms > maxLatencyMs) maxLatencyMs = ms;
			total += 1;
			errors += 1;
		}
	}
}

console.log(`Load test: ${url}`);
console.log(`duration=${durationSec}s concurrency=${concurrency}`);

await Promise.all(Array.from({ length: concurrency }, () => worker()));

const avgLatency = total ? totalLatencyMs / total : 0;
const rps = total / durationSec;

console.log("\n--- results ---");
console.log(`requests_total: ${total}`);
console.log(`2xx: ${ok}`);
console.log(`non2xx: ${non2xx}`);
console.log(`errors: ${errors}`);
console.log(`rps: ${rps.toFixed(2)}`);
console.log(`latency_avg_ms: ${avgLatency.toFixed(2)}`);
console.log(`latency_max_ms: ${maxLatencyMs}`);
