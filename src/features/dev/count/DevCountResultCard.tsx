// src/features/dev/count/DevCountResultCard.tsx
// 最近一次 ScanResponse 展示（提炼关键字段：日期 + before/after/delta + Trace/库存跳转）

import React from "react";
import type { DevCountController } from "./types";
import type { ScanResponse } from "../../operations/scan/api";

type ScanResponseExt = ScanResponse & {
  before?: number;
  before_qty?: number;
  after?: number;
  after_qty?: number;
  delta?: number;
  production_date?: string;
  expiry_date?: string;
  warehouse_id?: number;
};

export const DevCountResultCard: React.FC<{ c: DevCountController }> = ({
  c,
}) => {
  const result = c.lastResult;

  if (!result) {
    return (
      <section className="bg-white border border-slate-200 rounded-xl p-4 space-y-2">
        <h2 className="text-sm font-semibold text-slate-800">
          最近一次盘点结果（ScanResponse）
        </h2>
        <div className="text-xs text-slate-500">
          暂无结果。提交一次盘点请求后会显示响应内容。
        </div>
      </section>
    );
  }

  // 用扩展类型读取后端附加字段（保持可选）
  const ext = result as ScanResponseExt;
  const before = ext.before ?? ext.before_qty ?? "-";
  const delta = ext.delta ?? "-";
  const after = ext.after ?? ext.after_qty ?? "-";
  const prod = ext.production_date ?? "-";
  const exp = ext.expiry_date ?? "-";
  const wh = ext.warehouse_id ?? "-";

  const traceLink = result.scan_ref
    ? `/diagnostics/trace?trace_id=${encodeURIComponent(result.scan_ref)}`
    : null;

  const stockLink =
    result.item_id && wh
      ? `/diagnostics/stock-tool?item_id=${result.item_id}&warehouse_id=${wh}&batch_code=${encodeURIComponent(
          (result.batch_code as string | undefined) ?? "",
        )}`
      : null;

  return (
    <section className="bg-white border border-slate-200 rounded-xl p-4 space-y-2">
      <h2 className="text-sm font-semibold text-slate-800">
        最近一次盘点结果（ScanResponse）
      </h2>

      {/* 关键信息一览 */}
      <div className="text-xs text-slate-700 space-y-1">
        <div>
          scan_ref:{" "}
          <span className="font-mono">{result.scan_ref}</span> · ok=
          {String(result.ok)} · committed=
          {String(result.committed)} · source={result.source}
        </div>

        <div className="flex flex-wrap gap-x-4 gap-y-1">
          {result.item_id && (
            <span>
              item_id:{" "}
              <span className="font-mono">{result.item_id}</span>
            </span>
          )}
          {wh && (
            <span>
              warehouse_id: <span className="font-mono">{wh}</span>
            </span>
          )}
          {result.batch_code && (
            <span>
              batch:{" "}
              <span className="font-mono">
                {result.batch_code as string}
              </span>
            </span>
          )}
        </div>

        <div className="flex flex-wrap gap-x-4 gap-y-1">
          <span>
            before: <span className="font-mono">{before}</span>
          </span>
          <span>
            delta: <span className="font-mono">{delta}</span>
          </span>
          <span>
            after: <span className="font-mono">{after}</span>
          </span>
        </div>

        <div className="flex flex-wrap gap-x-4 gap-y-1">
          <span>
            production_date: <span className="font-mono">{prod}</span>
          </span>
          <span>
            expiry_date: <span className="font-mono">{exp}</span>
          </span>
        </div>
      </div>

      {/* 操作按钮：Trace / 库存工具 */}
      <div className="flex flex-wrap items-center gap-2 pt-1 text-[11px]">
        {traceLink && (
          <a
            href={traceLink}
            className="inline-flex items-center rounded-lg border px-2 py-1 text-[11px] text-slate-700 hover:bg-slate-100"
          >
            查看链路（Trace）
          </a>
        )}
        {stockLink && (
          <a
            href={stockLink}
            className="inline-flex items-center rounded-lg border px-2 py-1 text-[11px] text-slate-700 hover:bg-slate-100"
          >
            查看库存（Stock Tool）
          </a>
        )}
      </div>

      {/* 完整 JSON 仍保留，便于深度调试 */}
      <pre className="bg-slate-50 p-3 rounded text-[11px] whitespace-pre-wrap break-all max-h-64 overflow-auto mt-2">
        {JSON.stringify(result, null, 2)}
      </pre>
    </section>
  );
};
