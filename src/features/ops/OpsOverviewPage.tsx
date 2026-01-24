// src/features/ops/OpsOverviewPage.tsx
import React from "react";

export default function OpsOverviewPage() {
  return (
    <div className="space-y-4 p-6">
      {/* 页面级标题已移除：Topbar 已承担“运维中心 / 运维概览” */}
      <p className="text-sm text-slate-500">
        运维中心入口页：集中入口到诊断工具、开发者调试台与系统运维能力（系统状态 / 后台任务等）。
      </p>

      <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
        <section className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
          <div className="text-sm font-semibold text-slate-800">诊断与分析</div>
          <div className="mt-1 text-xs text-slate-500">
            Trace / Ledger / Inventory 等诊断工具入口。
          </div>
        </section>

        <section className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
          <div className="text-sm font-semibold text-slate-800">开发者工具</div>
          <div className="mt-1 text-xs text-slate-500">
            DevConsole 调试台：用于联调、复现、证据查看。
          </div>
        </section>

        <section className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
          <div className="text-sm font-semibold text-slate-800">运维</div>
          <div className="mt-1 text-xs text-slate-500">
            系统状态、后台任务、告警等（逐步接入）。
          </div>
        </section>
      </div>
    </div>
  );
}
