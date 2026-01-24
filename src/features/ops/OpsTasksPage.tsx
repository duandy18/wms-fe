// src/features/ops/OpsTasksPage.tsx
import React from "react";

export default function OpsTasksPage() {
  return (
    <div className="space-y-4 p-6">
      {/* 页面级标题已移除：Topbar 已承担“运维中心 / 后台任务” */}
      <p className="text-sm text-slate-500">
        后台任务（占位页）：后续可接入任务队列、失败重试、定时任务运行情况等。
      </p>

      <section className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
        <div className="text-sm font-semibold text-slate-800">任务队列</div>
        <div className="mt-2 text-xs text-slate-500">尚未接入任务列表。</div>
      </section>
    </div>
  );
}
