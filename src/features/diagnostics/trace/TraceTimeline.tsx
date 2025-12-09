// src/features/diagnostics/trace/TraceTimeline.tsx
import React, { useEffect } from "react";
import type { TraceEvent } from "./types";
import { styleTraceEvent, explainTraceEvent } from "./eventStyling";
import { buildDiagnosticUrl } from "../diagNavigation";

type Props = {
  events: TraceEvent[];
  /** 从 URL 或上游传入的 focus_ref，用于高亮 & 自动滚动 */
  focusRef?: string | null;
};

export const TraceTimeline: React.FC<Props> = ({ events, focusRef }) => {
  // 当有 focus_ref 时，自动滚动到第一条匹配的事件
  useEffect(() => {
    if (!focusRef) return;
    const el = document.querySelector<HTMLElement>(
      '[data-trace-focused="true"]',
    );
    if (el && typeof el.scrollIntoView === "function") {
      el.scrollIntoView({ behavior: "smooth", block: "center" });
    }
  }, [focusRef, events.length]);

  if (!events || events.length === 0) {
    return (
      <section className="rounded-xl border border-slate-200 bg-white p-4 text-sm text-slate-500">
        暂无事件，请输入有效的 trace_id 并执行查询。
      </section>
    );
  }

  return (
    <section className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm">
      <div className="mb-3 text-xs text-slate-500">
        按时间顺序展示事件，可按 Source 过滤。点击操作可跳转到 Ledger / 库存 / 批次生命周期等工具。
      </div>

      <div className="space-y-3">
        {events.map((ev, idx) => {
          const styled = styleTraceEvent(ev);
          const isFocused =
            !!focusRef && ev.ref && ev.ref === focusRef;

          const wh = ev.warehouse_id ?? undefined;
          const itemId = ev.item_id ?? undefined;
          const batchCode = ev.batch_code ?? "";

          const hasWhItem =
            typeof wh === "number" && typeof itemId === "number";
          const hasBatch = hasWhItem && !!batchCode;

          const lifelineUrl =
            hasBatch && hasWhItem
              ? buildDiagnosticUrl({
                  kind: "lifeline",
                  warehouseId: wh!,
                  itemId: itemId!,
                  batchCode,
                })
              : null;

          const stockUrl = hasWhItem
            ? buildDiagnosticUrl({
                kind: "stock",
                warehouseId: wh!,
                itemId: itemId!,
                batchCode: batchCode || undefined,
              })
            : null;

          const tsText = ev.ts
            ? ev.ts.replace("T", " ").replace("Z", "")
            : "-";

          const badgeEl = (
            <span className={styled.badgeClassName}>
              <span>{styled.icon}</span>
              <span>{styled.label}</span>
            </span>
          );

          return (
            <div
              key={idx}
              className={
                "flex items-start gap-3 rounded-lg border px-3 py-2 text-sm " +
                (isFocused
                  ? "border-slate-900 bg-slate-900/5"
                  : "border-slate-200 bg-white")
              }
              data-trace-focused={isFocused ? "true" : "false"}
            >
              {/* 左侧：时间 + 类型 + movement_type */}
              <div className="flex-1 space-y-1">
                <div className="flex items-center gap-2 text-xs text-slate-600">
                  <span className="font-mono">{tsText}</span>
                  {badgeEl}
                  {ev.movement_type && (
                    <span className="rounded-full border border-slate-300 bg-slate-50 px-2 py-0.5 text-[10px] text-slate-700">
                      {ev.movement_type}
                    </span>
                  )}
                  {isFocused && (
                    <span className="rounded-full bg-slate-900 text-white px-2 py-0.5 text-[10px]">
                      focus_ref 命中
                    </span>
                  )}
                </div>

                {/* 事件摘要（业务向解释） */}
                <div className="text-xs text-slate-700">
                  {explainTraceEvent(ev)}
                </div>

                {/* WH / ITEM / BATCH 维度展示 */}
                {(ev.warehouse_id != null ||
                  ev.item_id != null ||
                  ev.batch_code) && (
                  <div className="mt-0.5 text-[11px] text-slate-500 space-x-3">
                    {ev.warehouse_id != null && (
                      <span>
                        WH:
                        <span className="ml-1 font-mono">
                          {ev.warehouse_id}
                        </span>
                      </span>
                    )}
                    {ev.item_id != null && (
                      <span>
                        ITEM:
                        <span className="ml-1 font-mono">
                          {ev.item_id}
                        </span>
                      </span>
                    )}
                    {ev.batch_code && (
                      <span>
                        BATCH:
                        <span className="ml-1 font-mono">
                          {ev.batch_code}
                        </span>
                      </span>
                    )}
                  </div>
                )}

                {/* ref / trace_id 展示 */}
                {(ev.ref || ev.trace_id) && (
                  <div className="mt-0.5 text-[11px] text-slate-500">
                    {ev.ref && (
                      <span className="mr-3">
                        ref:
                        <span className="ml-1 font-mono">
                          {ev.ref}
                        </span>
                      </span>
                    )}
                    {ev.trace_id && (
                      <span>
                        trace:
                        <span className="ml-1 font-mono">
                          {ev.trace_id}
                        </span>
                      </span>
                    )}
                  </div>
                )}
              </div>

              {/* 右侧：操作区（跳转库存 / 批次生命周期） */}
              {(stockUrl || lifelineUrl) && (
                <div className="flex flex-col items-end gap-1 text-[11px]">
                  {stockUrl && (
                    <a
                      href={stockUrl}
                      className="inline-flex items-center rounded border border-slate-300 px-2 py-0.5 hover:bg-slate-50"
                    >
                      查看库存
                    </a>
                  )}
                  {lifelineUrl && (
                    <a
                      href={lifelineUrl}
                      className="inline-flex items-center rounded border border-slate-300 px-2 py-0.5 hover:bg-slate-50"
                    >
                      批次生命周期
                    </a>
                  )}
                </div>
              )}
            </div>
          );
        })}
      </div>
    </section>
  );
};
