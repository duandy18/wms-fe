// src/features/diagnostics/trace/TraceHeader.tsx
//
// Trace Studio 顶部说明区域（事件视图专用）
// 原先的 "Trace 链路 + ApiBadge" 属于调试台风格，这里改成更贴合 Studio 的文案。

import React from "react";

export const TraceHeader: React.FC = () => {
  return (
    <div className="flex items-start justify-between gap-4">
      <div>
        <h2 className="text-base font-semibold text-slate-900">
          Trace 事件流（Events）
        </h2>
        <p className="mt-1 text-xs text-slate-600">
          根据 trace_id 聚合多表事件（event_store / audit_events / stock_ledger 等），
          可按仓库与来源 Source 过滤，支持时间线视图与按 ref 分组视图。
        </p>
      </div>
      <div className="hidden text-[11px] text-slate-500 md:block">
        <div>使用说明：</div>
        <ul className="mt-1 list-disc pl-4 space-y-0.5">
          <li>先在上方输入 trace_id，可从 DevConsole / 订单详情 / Ledger 中复制。</li>
          <li>可选指定仓库 ID，用于过滤多仓环境下的事件。</li>
          <li>查询后可在「操作」列跳转到 Ledger / 库存 / 批次生命周期等工具。</li>
        </ul>
      </div>
    </div>
  );
};
