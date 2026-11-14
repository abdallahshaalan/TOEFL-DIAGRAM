import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import { VitePWA } from "vite-plugin-pwa";
import path from "path";
import fs from "fs";
import { fileURLToPath } from "url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const DEBUG_LOG = path.resolve(__dirname, ".cursor/debug-c572a0.log");

function agentDebugLog(payload) {
  // #region agent log
  try {
    fs.mkdirSync(path.dirname(DEBUG_LOG), { recursive: true });
    fs.appendFileSync(
      DEBUG_LOG,
      JSON.stringify({
        sessionId: "c572a0",
        timestamp: Date.now(),
        runId: "post-fix",
        ...payload,
      }) + "\n"
    );
  } catch {
    /* ignore debug log failures */
  }
  // #endregion
}

function agentDeployDiagnostics() {
  return {
    name: "agent-deploy-diagnostics",
    enforce: "post",
    configResolved(config) {
      // #region agent log
      agentDebugLog({
        hypothesisId: "B",
        location: "vite.config.js:configResolved",
        message: "vite config resolved",
        data: {
          command: config.command,
          mode: config.mode,
          outDir: config.build?.outDir,
          absOutDir: path.resolve(config.root, config.build?.outDir || "dist"),
        },
      });
      // #endregion
    },
    closeBundle: {
      sequential: true,
      order: "post",
      handler() {
        const distDir = path.resolve(__dirname, "dist");
        const buildDir = path.resolve(__dirname, "build");
        const walk = (dir) => {
          if (!fs.existsSync(dir)) return [];
          const out = [];
          for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
            const full = path.join(dir, entry.name);
            if (entry.isDirectory()) out.push(...walk(full));
            else {
              const size = fs.statSync(full).size;
              out.push({
                rel: path.relative(dir, full).replace(/\\/g, "/"),
                size,
              });
            }
          }
          return out;
        };
        const files = walk(distDir);
        const over2MiB = files.filter((f) => f.size > 2 * 1024 * 1024);
        const largest = [...files].sort((a, b) => b.size - a.size).slice(0, 8);
        // #region agent log
        agentDebugLog({
          hypothesisId: "A",
          location: "vite.config.js:closeBundle:post",
          message: "post-PWA artifact scan",
          data: {
            distExists: fs.existsSync(distDir),
            buildExists: fs.existsSync(buildDir),
            fileCount: files.length,
            swExists: fs.existsSync(path.join(distDir, "sw.js")),
            workboxExists: files.some((f) => f.rel.startsWith("workbox-")),
            webmanifestExists: fs.existsSync(path.join(distDir, "manifest.webmanifest")),
            craManifestExists: fs.existsSync(path.join(distDir, "manifest.json")),
            junkHtmlExists: fs.existsSync(path.join(distDir, "blue_brand_notification_system.html")),
            craBackupExists: fs.existsSync(path.join(distDir, "index.html.cra-backup")),
            over2MiB: over2MiB.map((f) => ({ rel: f.rel, size: f.size })),
            largest,
          },
        });
        // #endregion
        // #region agent log
        agentDebugLog({
          hypothesisId: "C",
          location: "vite.config.js:closeBundle:post",
          message: "public leftover / manifest conflict check",
          data: {
            publicManifest: fs.existsSync(path.resolve(__dirname, "public/manifest.json")),
            publicJunkHtml: fs.existsSync(
              path.resolve(__dirname, "public/blue_brand_notification_system.html")
            ),
            publicCraBackup: fs.existsSync(path.resolve(__dirname, "public/index.html.cra-backup")),
            publicColorTokens: fs.existsSync(path.resolve(__dirname, "public/COLOR_TOKENS.txt")),
          },
        });
        // #endregion
        // #region agent log
        agentDebugLog({
          hypothesisId: "E",
          location: "vite.config.js:closeBundle:post",
          message: "PWA generateSW completion marker",
          data: {
            pwaBannerExpected: "PWA v0.21.2",
            swBytes: fs.existsSync(path.join(distDir, "sw.js"))
              ? fs.statSync(path.join(distDir, "sw.js")).size
              : 0,
          },
        });
        // #endregion
      },
    },
  };
}

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
        globPatterns: ["**/*.{js,css,html,ico,png,svg,woff2,jpg,jpeg,webp}"],
        globIgnores: [
          "**/index.html.cra-backup",
          "**/COLOR_TOKENS.txt",
          "**/blue_brand_notification_system.html",
          "**/manifest.json",
        ],
        maximumFileSizeToCacheInBytes: 3 * 1024 * 1024,
        navigateFallback: "/index.html",
        navigateFallbackDenylist: [/^\/sw\.js$/, /^\/workbox-.*\.js$/, /^\/manifest\.webmanifest$/],
        runtimeCaching: [
          {
            urlPattern: /^https:\/\/fonts\.googleapis\.com\/.*/i,
            handler: "CacheFirst",
            options: {
              cacheName: "google-fonts-cache",
              expiration: { maxEntries: 10, maxAgeSeconds: 60 * 60 * 24 * 365 },
            },
          },
        ],
      },
      devOptions: { enabled: false },
    }),
    agentDeployDiagnostics(),
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
  },
});
