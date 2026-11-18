import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import { VitePWA } from "vite-plugin-pwa";
import path from "path";
import { fileURLToPath } from "url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));

export default defineConfig({
  plugins: [
    react(),
    VitePWA({
      registerType: "autoUpdate",
      includeAssets: ["favicon.ico", "192.png", "512.png"],
      manifest: {
        name: "ABOOD | TOEFL Companion",
        short_name: "TOEFL",
        description: "Offline-first TOEFL vocabulary and study companion",
        theme_color: "#185FA5",
        background_color: "#F8FAFD",
        display: "standalone",
        start_url: "/",
        icons: [
          { src: "192.png", sizes: "192x192", type: "image/png" },
          { src: "512.png", sizes: "512x512", type: "image/png" },
        ],
      },
      workbox: {
        // Prefer runtime caching for huge vocab chunks over bloating first install
        globPatterns: ["**/*.{js,css,html,ico,png,svg,woff2,jpg,jpeg,webp}"],
        globIgnores: [
          "**/index.html.cra-backup",
          "**/COLOR_TOKENS.txt",
          "**/blue_brand_notification_system.html",
          "**/manifest.json",
          "**/assets/businessVocabulary-*.js",
          "**/assets/vocabAdapters-*.js",
          "**/assets/toeflVocabulary-*.js",
        ],
        maximumFileSizeToCacheInBytes: 3 * 1024 * 1024,
        navigateFallback: "/index.html",
        navigateFallbackDenylist: [/^\/sw\.js$/, /^\/workbox-.*\.js$/, /^\/manifest\.webmanifest$/],
        runtimeCaching: [
          {
            urlPattern: ({ url }) =>
              /\/assets\/(businessVocabulary|vocabAdapters|toeflVocabulary)-.*\.js$/.test(
                url.pathname
              ),
            handler: "CacheFirst",
            options: {
              cacheName: "vocab-chunks",
              expiration: { maxEntries: 12, maxAgeSeconds: 60 * 60 * 24 * 30 },
            },
          },
        ],
      },
      devOptions: { enabled: false },
    }),
  ],
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
  },
  build: {
    chunkSizeWarningLimit: 1500,
    rollupOptions: {
      output: {
        manualChunks: {
          vendor: ["react", "react-dom", "react-router-dom"],
          charts: ["recharts"],
          motion: ["motion"],
        },
      },
    },
  },
  test: {
    environment: "jsdom",
    globals: true,
    setupFiles: ["./vitest.setup.js"],
  },
});

