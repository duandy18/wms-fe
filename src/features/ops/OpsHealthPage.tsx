// src/features/ops/OpsHealthPage.tsx
import React from "react";

export default function OpsHealthPage() {
  return (
    <div className="space-y-4 p-6">
      {/* 页面级标题已移除：Topbar 已承担“运维中心 / 系统状态” */}
      <p className="text-sm text-slate-500">
        系统状态（占位页）：后续可接入服务版本、运行时间、关键依赖（DB/Redis）连通性、错误率等指标。
      </p>

      <section className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
        <div className="text-sm font-semibold text-slate-800">当前状态</div>
        <div className="mt-2 text-xs text-slate-500">尚未接入健康检查数据。</div>
      </section>
    </div>
  );
}
