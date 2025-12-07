// src/app/layout/AppLayout.tsx
import React, { Suspense } from "react";
import { Outlet } from "react-router-dom";
import { Sidebar } from "./Sidebar";
import { Topbar } from "./Topbar";

/**
 * AppLayout：
 * - 左侧导航 Sidebar
 * - 上方 Topbar
 * - 右侧主内容区 Outlet
 */
export function AppLayout() {
  return (
    <div className="h-screen w-screen flex bg-slate-50">
      {/* 左侧导航 */}
      <Sidebar />

      {/* 右侧区域（顶部栏 + 主内容） */}
      <div className="flex-1 flex flex-col min-w-0">
        <Topbar />

        {/* 右侧内容区域 */}
        <main className="flex-1 overflow-auto p-6 bg-slate-50 text-base">
          <Suspense fallback={<div className="text-lg">页面加载中…</div>}>
            <Outlet />
          </Suspense>
        </main>
      </div>
    </div>
  );
}
