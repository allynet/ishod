/// <reference types="vitest" />
import path from "node:path";

import dts from "vite-plugin-dts";
import { defineConfig } from "vite";

export default defineConfig({
	base: "./",
	plugins: [
		dts({
			rollupTypes: true,
		}),
	],
	build: {
		sourcemap: true,
		lib: {
			entry: [
				path.resolve(__dirname, "src/index.ts"),
				path.resolve(__dirname, "src/result.ts"),
			],
			formats: ["es", "cjs"],
			fileName: (format, entryName) => `${entryName}.${format}.js`,
		},
	},
	test: {
		coverage: {
			reporter: ["text", "json-summary", "json", "html-spa"],
			clean: true,
		},
	},
});
