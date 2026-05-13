import { defineConfig } from "vitest/config";

const watchUsePolling = process.env.GASTROHUB_VITEST_POLL === "1";

export default defineConfig({
	server: {
		watch: {
			followSymlinks: false,
			ignored: [
				"**/node_modules/**",
				"**/.git/**",
				"**/dist/**",
				"**/coverage/**",
			],
			...(watchUsePolling ? { usePolling: true, interval: 1000 } : {}),
		},
	},
	test: {
		environment: "node",
		globals: true,
		include: ["tests/**/*.test.js"],
	},
});
