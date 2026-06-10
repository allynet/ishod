/// <reference types="vitest" />
import path from "node:path";

import { defineConfig } from "vite";
import dts from "vite-plugin-dts";

export default defineConfig({
  base: "./",
  plugins: [
    dts({
      rollupTypes: true,
      beforeWriteFile(filePath, content) {
        return { content: content.replace(/\r\n?/g, "\n") };
      },
    }),
  ],
  build: {
    sourcemap: true,
    lib: {
      entry: [path.resolve(__dirname, "src/index.ts")],
      formats: ["es", "cjs"],
      fileName: (format, entryName) =>
        format === "cjs" ? `${entryName}.cjs` : `${entryName}.js`,
    },
  },
  test: {
    exclude: ["**/node_modules/**", "**/dist/**", "e2e/**"],
    coverage: {
      reporter: ["text", "json-summary", "json", "html-spa"],
      clean: true,
      include: ["src/**/*.ts"],
    },
  },
});
