import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import tailwindcss from "@tailwindcss/vite";
import tsconfigPaths from "vite-tsconfig-paths";
import { resolve } from "path";
import { sitemap } from "./vite-plugins/sitemap";

export default defineConfig({
  plugins: [react(), tailwindcss(), tsconfigPaths(), sitemap()],
  resolve: {
    alias: {
      "@": resolve(__dirname, "./src"),
    },
  },
  build: {
    // Split vendor code into stable, cacheable chunks so no single chunk
    // exceeds the 500 kB warning and library updates don't bust app cache.
    // Rolldown: first matching group (array order) wins — specific groups
    // must come before the node_modules catch-all.
    rolldownOptions: {
      output: {
        codeSplitting: {
          groups: [
            {
              name: "vendor-charts",
              test: /[\\/]node_modules[\\/](recharts|victory-vendor|d3-[a-z-]+|vdate|internmap|delaunator|robust-predicates)[\\/]/,
            },
            { name: "vendor-firebase", test: /[\\/]node_modules[\\/]firebase[\\/]/ },
            {
              name: "vendor-react",
              test: /[\\/]node_modules[\\/](@remix-run|react|react-dom|react-router)[-/]/,
            },
            {
              name: "vendor-motion",
              test: /[\\/]node_modules[\\/](framer-motion|motion-dom|motion-utils)[\\/]/,
            },
            { name: "vendor", test: /[\\/]node_modules[\\/]/ },
          ],
        },
      },
    },
  },
});
