// src/features/operations/count/CountCockpitResultCard.tsx
// 最近一次盘点结果（结构化摘要 + Trace/库存跳转 + JSON）

import React from "react";
import type { CountCockpitController } from "./types";
import type { ScanResponse as BaseScanResponse } from "../scan/api";

type ExtendedScanResponse = BaseScanResponse & {
  before?: number | null;
  before_qty?: number | null;
  after?: number | null;
  after_qty?: number | null;
  delta?: number | null;
  production_date?: string | null;
  expiry_date?: string | null;
  warehouse_id?: number | null;
};

export const CountCockpitResultCard: React.FC<{ c: CountCockpitController }> = ({
  c,
}) => {
  const result = c.lastResult as ExtendedScanResponse | null;

  if (!result) {
    return (
      <section className="space-y-2 rounded-xl border border-slate-200 bg-white p-4">
        <h2 className="text-sm font-semibold text-slate-800">
          最近一次盘点结果（ScanResponse）
        </h2>
        <div className="text-xs text-slate-500">
          暂无结果。提交一次盘点请求后会显示响应内容。
        </div>
      </section>
    );
  }

  const {
    before,
    before_qty,
    after,
    after_qty,
    delta,
    production_date,
    expiry_date,
    warehouse_id,
  } = result;

  const beforeDisplay = before ?? before_qty ?? "-";
  const deltaDisplay = delta ?? "-";
  const afterDisplay = after ?? after_qty ?? "-";
  const prodDisplay = production_date ?? "-";
  const expDisplay = expiry_date ?? "-";
  const whDisplay = warehouse_id ?? "-";

  const traceLink = result.scan_ref
    ? `/diagnostics/trace?trace_id=${encodeURIComponent(result.scan_ref)}`
    : null;

  const stockLink =
    result.item_id && warehouse_id
      ? `/diagnostics/stock-tool?item_id=${
          result.item_id
        }&warehouse_id=${warehouse_id}&batch_code=${encodeURIComponent(
          (result.batch_code as string | undefined) ?? "",
        )}`
      : null;

  return (
    <section className="space-y-4 rounded-xl border border-slate-200 bg-white p-4">
      <h2 className="text-sm font-semibold text-slate-800">
        最近一次盘点结果（ScanResponse）
      </h2>

      {/* 顶部状态区域 */}
      <div className="space-y-1 rounded-lg border border-slate-200 bg-slate-50 p-3 text-xs">
        <div>
          <span className="font-semibold">scan_ref：</span>
          <span className="font-mono">{result.scan_ref}</span>
        </div>

        <div className="flex flex-wrap gap-4">
          <span>
            状态：
            <span className="font-mono">
              {result.ok ? "OK" : "FAIL"}（committed={String(
                result.committed,
              )}）
            </span>
          </span>

          <span>
            来源：<span className="font-mono">{result.source}</span>
          </span>
        </div>

        {/* 基本信息 */}
        <div className="border-t border-slate-200 pt-2">
          <div className="mb-1 font-semibold">基本信息</div>
          <div className="flex flex-wrap gap-4">
            {result.item_id && (
              <span>
                item_id：
                <span className="font-mono">{result.item_id}</span>
              </span>
            )}
            <span>
              warehouse_id：<span className="font-mono">{whDisplay}</span>
            </span>
            {result.batch_code && (
              <span>
                batch：{" "}
                <span className="font-mono">
                  {result.batch_code as string}
                </span>
              </span>
            )}
          </div>
        </div>

        {/* 数量变化 */}
        <div className="border-t border-slate-200 pt-2">
          <div className="mb-1 font-semibold">数量变化</div>
          <div className="flex flex-wrap gap-4">
            <span>
              before：<span className="font-mono">{beforeDisplay}</span>
            </span>
            <span>
              delta：<span className="font-mono">{deltaDisplay}</span>
            </span>
            <span>
              after：<span className="font-mono">{afterDisplay}</span>
            </span>
          </div>
        </div>

        {/* 日期 */}
        <div className="border-t border-slate-200 pt-2">
          <div className="mb-1 font-semibold">日期信息</div>
          <div className="flex flex-wrap gap-4">
            <span>
              production_date：
              <span className="font-mono">{prodDisplay}</span>
            </span>
            <span>
              expiry_date：
              <span className="font-mono">{expDisplay}</span>
            </span>
          </div>
        </div>

        {/* 按钮区 */}
        <div className="flex flex-wrap gap-2 pt-3">
          {traceLink && (
            <a
              href={traceLink}
              className="inline-flex items-center rounded border px-2 py-1 text-[11px] text-slate-700 hover:bg-slate-100"
            >
              查看链路（Trace）
            </a>
          )}

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

      {/* JSON 原文 */}
      <pre className="max-h-64 overflow-auto whitespace-pre-wrap break-all rounded bg-slate-50 p-3 text-[11px]">
        {JSON.stringify(result, null, 2)}
      </pre>
    </section>
  );
};
