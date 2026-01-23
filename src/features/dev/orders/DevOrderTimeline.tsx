// src/features/dev/orders/DevOrderTimeline.tsx
// 订单生命周期 Timeline（仅负责展示 lifecycle v2 的 stages）

import React from "react";
import type { OrderLifecycleStageV2 } from "./api/index";

type Props = {
  stages: OrderLifecycleStageV2[];
  traceId?: string;
  orderRef?: string | null;
};

export const DevOrderTimeline: React.FC<Props> = ({
  stages,
  traceId,
  orderRef,
}) => {
  const hasAny = stages && stages.length > 0;

  return (
    <div className="rounded-md border border-slate-200 bg-white px-4 py-3 text-xs text-slate-700">
      <div className="mb-3 flex flex-wrap items-center justify-between gap-2">
        <div className="font-semibold text-slate-800">
          订单生命周期（阶段视图 · lifecycle v2）
        </div>
        <div className="text-[10px] text-slate-500">
          {traceId && (
            <span className="mr-2">
              trace_id: <span className="font-mono">{traceId}</span>
            </span>
          )}
          {orderRef && (
            <span>
              ref: <span className="font-mono">{orderRef}</span>
            </span>
          )}
        </div>
      </div>

      {!hasAny ? (
        <div className="text-[11px] text-slate-500">
          当前订单暂未获取到 lifecycle v2 阶段数据。
        </div>
      ) : (
        <ol className="flex flex-col gap-2">
          {stages.map((s, idx) => {
            const active = s.present;
            const isLast = idx === stages.length - 1;

            return (
              <li key={s.key} className="flex items-start gap-3">
                {/* 时间线点 + 竖线 */}
                <div className="flex flex-col items-center">
                  <div
                    className={
                      "h-3 w-3 rounded-full border " +
                      (active
                        ? "border-emerald-500 bg-emerald-500"
                        : "border-slate-300 bg-white")
                    }
                  />
                  {!isLast && (
                    <div className="mt-0.5 h-6 w-px bg-slate-200" />
                  )}
                </div>

                {/* 文本内容 */}
                <div className="flex-1">
                  <div className="flex flex-wrap items-center gap-2">
                    <span
                      className={
                        "text-[11px] font-semibold " +
                        (active ? "text-slate-900" : "text-slate-400")
                      }
                    >
                      {s.label || s.key}
                    </span>
                    {s.sla_bucket && active && (
                      <span className="rounded-full border border-slate-200 bg-slate-50 px-2 py-0.5 text-[10px] text-slate-600">
                        SLA: {s.sla_bucket.toUpperCase()}
                      </span>
                    )}
                    {s.ts && (
                      <span className="text-[10px] text-slate-500">
                        {s.ts}
                      </span>
                    )}
                  </div>
                  {s.description && (
                    <div className="mt-0.5 text-[10px] text-slate-600">
                      {s.description}
                    </div>
                  )}
                  {!s.present && (
                    <div className="mt-0.5 text-[10px] text-slate-400">
                      尚未检测到该阶段的证据。
                    </div>
                  )}
                </div>
              </li>
            );
          })}
        </ol>
      )}
    </div>
  );
};
