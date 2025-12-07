// vite.config.ts
import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import tailwindcss from "@tailwindcss/vite";
import { fileURLToPath, URL } from "node:url";

export default defineConfig({
  plugins: [react(), tailwindcss()],
  resolve: {
    alias: {
      "@": fileURLToPath(new URL("./src", import.meta.url)),
    },
  },
  server: {
    port: 5173,
    strictPort: true,
    proxy: {
      // 登录 / 用户
      "/users": {
        target: "http://127.0.0.1:8000",
        changeOrigin: true,
      },
      // 扫描 / 入库 / 盘点
      "/scan": {
        target: "http://127.0.0.1:8000",
        changeOrigin: true,
      },
      "/count": {
        target: "http://127.0.0.1:8000",
        changeOrigin: true,
      },
      "/putaway": {
        target: "http://127.0.0.1:8000",
        changeOrigin: true,
      },
      // 出库 / 预占
      "/outbound": {
        target: "http://127.0.0.1:8000",
        changeOrigin: true,
      },
      "/reserve": {
        target: "http://127.0.0.1:8000",
        changeOrigin: true,
      },
      "/pick": {
        target: "http://127.0.0.1:8000",
        changeOrigin: true,
      },
      // 指标 / 快照 / Trace
      "/metrics": {
        target: "http://127.0.0.1:8000",
        changeOrigin: true,
      },
      "/snapshot": {
        target: "http://127.0.0.1:8000",
        changeOrigin: true,
      },
      "/debug": {
        target: "http://127.0.0.1:8000",
        changeOrigin: true,
      },
      // 门店 / 可售 / OAuth 授权等
      "/stores": {
        target: "http://127.0.0.1:8000",
        changeOrigin: true,
      },
      "/platform-shops": {
        target: "http://127.0.0.1:8000",
        changeOrigin: true,
      },
      "/channel-inventory": {
        target: "http://127.0.0.1:8000",
        changeOrigin: true,
      },
      "/roles": {
        target: "http://127.0.0.1:8000",
        changeOrigin: true,
      },
      "/permissions": {
        target: "http://127.0.0.1:8000",
        changeOrigin: true,
      },
    },
  },
  // ================== Vitest 配置（新增） ==================
  test: {
    globals: true,
    environment: "jsdom",
    setupFiles: "./src/test/setupTests.ts",
    include: ["src/**/*.test.{ts,tsx}"],
  },
});
