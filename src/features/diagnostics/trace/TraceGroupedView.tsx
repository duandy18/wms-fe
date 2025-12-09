// src/features/diagnostics/trace/TraceGroupedView.tsx
import React from "react";
import type { TraceEvent } from "./types";
import { buildDiagnosticUrl } from "../diagNavigation";

export type GroupedByRef = {
  ref: string;
  events: TraceEvent[];
};

type Props = {
  groups: GroupedByRef[];
  expanded: Record<number, boolean>;
  onToggle: (i: number) => void;
  formatTs: (ts: string | Date | null) => string;
  focusRef?: string | null;
};

export const TraceGroupedView: React.FC<Props> = ({
  groups,
  expanded,
  onToggle,
  formatTs,
  focusRef,
}) => {
  if (!groups || groups.length === 0) {
    return (
      <section className="rounded-xl border border-slate-200 bg白 p-4 text-sm text-slate-500">
        暂无事件，请先执行查询。
      </section>
    );
  }

  return (
    <section className="space-y-3 rounded-xl border border-slate-200 bg白 p-4">
      <div className="text-xs text-slate-500">
        按 ref 分组查看事件。支持从每一行跳转到 Ledger / 库存 / 批次生命周期。
      </div>

      {groups.map((g, idx) => {
        const isOpen = expanded[idx];
        const isFocused = focusRef && focusRef === g.ref;

        return (
          <div
            key={g.ref + ":" + idx}
            className={
              "mb-2 rounded-lg border " +
              (isFocused
                ? "border-slate-900 bg-slate-900/5"
                : "border-slate-200 bg白")
            }
          >
            <button
              type="button"
              onClick={() => onToggle(idx)}
              className="flex w-full items-center justify-between px-3 py-2 text-left text-sm"
            >
              <div className="flex flex-col">
                <span className="text-xs text-slate-500">ref</span>
                <span className="font-mono text-[12px] text-slate-900">
                  {g.ref}
                </span>
              </div>
              <div className="flex items-center gap-3 text-xs text-slate-600">
                <span>事件数：{g.events.length}</span>
                <span
                  className={
                    "inline-flex items-center rounded-full px-2 py-0.5 text-[11px] " +
                    (isOpen
                      ? "bg-slate-900 text-white"
                      : "bg-slate-100 text-slate-700")
                  }
                >
                  {isOpen ? "收起" : "展开"}
                </span>
              </div>
            </button>

            {isOpen && (
              <div className="border-t border-slate-200 px-3 py-2 text-[11px]">
                {g.events.map((ev, i) => {
                  const ts = formatTs(ev.ts ?? null);

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

                  return (
                    <div
                      key={i}
                      className="flex items-start justify-between gap-2 border-t border-slate-100 py-1"
                    >
                      <div className="flex-1 space-y-0.5">
                        <div className="text-slate-700">
                          {ev.message || ev.reason || ev.kind || "-"}
                        </div>
                        <div className="flex flex-wrap gap-3 text-[10px] text-slate-500">
                          <span className="font-mono">{ts}</span>
                          {ev.source && <span>source: {ev.source}</span>}
                          {ev.movement_type && (
                            <span>movement: {ev.movement_type}</span>
                          )}
                          {batchCode && (
                            <span>
                              batch:
                              <span className="ml-1 font-mono">
                                {batchCode}
                              </span>
                            </span>
                          )}
                        </div>
                      </div>

                      {(stockUrl || lifelineUrl) && (
                        <div className="flex flex-col items-end gap-1 whitespace-nowrap">
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
            )}
          </div>
        );
      })}
    </section>
  );
};
