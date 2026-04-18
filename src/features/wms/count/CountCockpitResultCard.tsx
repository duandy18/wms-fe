// src/features/wms/count/CountCockpitResultCard.tsx
// 最近一次盘点结果（/count 响应）

import React from "react";
import type { CountCockpitController } from "./types";
import type { CountCommitResponse } from "./api";

export const CountCockpitResultCard: React.FC<{ c: CountCockpitController }> = ({
  c,
}) => {
  const result = c.lastResult as CountCommitResponse | null;

  if (!result) {
    return (
      <section className="space-y-2 rounded-xl border border-slate-200 bg-white p-4">
        <h2 className="text-sm font-semibold text-slate-800">
          最近一次盘点结果
        </h2>
        <div className="text-xs text-slate-500">
          暂无结果。提交一次盘点请求后会显示响应内容。
        </div>
      </section>
    );
  }

  const stockLink =
    result.item_id && result.warehouse_id
      ? `/diagnostics/stock-tool?item_id=${
          result.item_id
        }&warehouse_id=${result.warehouse_id}&batch_code=${encodeURIComponent(
          result.batch_code ?? result.lot_code ?? "",
        )}`
      : null;

  return (
    <section className="space-y-4 rounded-xl border border-slate-200 bg-white p-4">
      <h2 className="text-sm font-semibold text-slate-800">
        最近一次盘点结果
      </h2>

      <div className="space-y-1 rounded-lg border border-slate-200 bg-slate-50 p-3 text-xs">
        <div>
          <span className="font-semibold">ref：</span>
          <span className="font-mono">{result.ref}</span>
        </div>

        <div className="flex flex-wrap gap-4">
          <span>
            状态：
            <span className="font-mono">{result.ok ? "OK" : "FAIL"}</span>
          </span>
        </div>

        <div className="border-t border-slate-200 pt-2">
          <div className="mb-1 font-semibold">基本信息</div>
          <div className="flex flex-wrap gap-4">
            <span>
              item_id：<span className="font-mono">{result.item_id}</span>
            </span>
            <span>
              warehouse_id：
              <span className="font-mono">{result.warehouse_id}</span>
            </span>
            <span>
              batch：
              <span className="font-mono">
                {result.batch_code ?? result.lot_code ?? "-"}
              </span>
            </span>
          </div>
        </div>

        <div className="border-t border-slate-200 pt-2">
          <div className="mb-1 font-semibold">结果</div>
          <div className="flex flex-wrap gap-4">
            <span>
              after：<span className="font-mono">{result.after}</span>
            </span>
            <span>
              occurred_at：
              <span className="font-mono">{result.occurred_at}</span>
            </span>
          </div>
        </div>

        <div className="flex flex-wrap gap-2 pt-3">
          {stockLink && (
            <a
              href={stockLink}
              className="inline-flex items-center rounded border px-2 py-1 text-[11px] text-slate-700 hover:bg-slate-100"
            >
              查看库存（Stock Tool）
            </a>
          )}
        </div>
      </div>

      <pre className="max-h-64 overflow-auto whitespace-pre-wrap break-all rounded bg-slate-50 p-3 text-[11px]">
        {JSON.stringify(result, null, 2)}
      </pre>
    </section>
  );
};
