// src/features/operations/outbound-pick/order-pick-sidebar/AutoPickControls.tsx

import React from "react";
import type { AutoLast } from "./storage";

export const AutoPickControls: React.FC<{
  enabled: boolean;
  onToggle: (v: boolean) => void;
  busy: boolean;
  error: string | null;
  last: AutoLast | null;
}> = ({ enabled, onToggle, busy, error, last }) => {
  return (
    <div className="rounded-lg border border-slate-200 bg-slate-50 px-3 py-2 text-[11px] text-slate-700 space-y-1">
      <div className="flex items-center justify-between gap-2">
        <div className="font-semibold text-slate-800">自动处理新订单</div>
        <label className="inline-flex items-center gap-2">
          <span className="text-slate-600">关闭</span>
          <input
            type="checkbox"
            checked={enabled}
            onChange={(e) => onToggle(e.target.checked)}
          />
          <span className="text-slate-600">开启</span>
        </label>
      </div>

      <div className="text-slate-600">
        开启后：发现新订单会自动创建拣货任务，并触发拣货单打印入队（真实吐纸需要打印代理消费 print_jobs）。
      </div>

      {busy && <div className="text-slate-500">自动处理中…</div>}
      {error && <div className="text-red-700">自动处理失败：{error}</div>}
      {last && <div className="text-slate-500">最近一次：{last.msg}</div>}
    </div>
  );
};
