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

    // ✅ 关闭热更新（HMR）
    hmr: false,

    // ✅ 禁用文件监听：改前端文件不会触发自动刷新/重载
    // 这样只有你“重启前端服务”才会出现新页面/新登录页
    watch: null,

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

  build: {
    // 1) 提高 chunk 大小告警阈值（不再啰嗦）
    chunkSizeWarningLimit: 2000, // kB，= 2MB

    // 2) 手动切块：按 vendor / features 维度拆
    rollupOptions: {
      output: {
        manualChunks(id: string) {
          // node_modules 先大致拆三类：React 栈 / router / 其它 vendor
          if (id.includes("node_modules")) {
            if (id.includes("react-router")) {
              return "vendor-react-router";
            }
            if (id.includes("react")) {
              return "vendor-react";
            }
            return "vendor";
          }

          // 按功能目录拆：诊断工具、DevConsole、Admin、作业区、库存
          if (id.includes("/src/features/diagnostics/")) {
            return "diagnostics";
          }
          if (id.includes("/src/features/dev/")) {
            return "devconsole";
          }
          if (id.includes("/src/features/admin/")) {
            return "admin";
          }
          if (id.includes("/src/features/operations/")) {
            return "operations";
          }
          if (id.includes("/src/features/inventory/")) {
            return "inventory";
          }
          if (id.includes("/src/features/finance/")) {
            return "finance";
          }

          // 其它走默认策略（打进入口 chunk）
          return undefined;
        },
      },
    },
  },

  // ================== Vitest 配置 ==================
  test: {
    globals: true,
    environment: "jsdom",
    setupFiles: "./src/test/setupTests.ts",
    include: ["src/**/*.test.{ts,tsx}"],
  },
});
