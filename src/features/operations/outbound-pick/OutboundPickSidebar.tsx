// src/features/operations/outbound-pick/OutboundPickSidebar.tsx
//
// 右侧 Sidebar：库存 FEFO 批次 + Trace Timeline

import React from "react";
import type { ItemDetailResponse, ItemSlice } from "../../inventory/snapshot/api";
import type { TraceEvent } from "../../diagnostics/trace/types";
import { TraceTimeline } from "../../diagnostics/trace/TraceTimeline";

type Props = {
  itemDetail: ItemDetailResponse | null;
  snapshotLoading: boolean;
  snapshotError: string | null;

  traceEvents: TraceEvent[];
  traceLoading: boolean;
  traceError: string | null;
  lastScanRef: string | null;
};

function sortFEFO(slices: ItemSlice[]) {
  return [...slices].sort((a, b) => {
    const da = a.expire_at ? Date.parse(a.expire_at) : Infinity;
    const db = b.expire_at ? Date.parse(b.expire_at) : Infinity;
    return da - db;
  });
}

export const OutboundPickSidebar: React.FC<Props> = ({
  itemDetail,
  snapshotLoading,
  snapshotError,
  traceEvents,
  traceLoading,
  traceError,
  lastScanRef,
}) => {
  return (
    <div className="space-y-6">
      {/* 库存 snapshot */}
      <section className="bg-white border border-slate-200 rounded-xl p-4 space-y-3">
        <h2 className="text-sm font-semibold text-slate-800">
          库存与批次（FEFO）
        </h2>

        {snapshotError && (
          <div className="text-xs text-red-600">加载失败：{snapshotError}</div>
        )}

        {snapshotLoading ? (
          <div className="text-xs text-slate-500">加载中…</div>
        ) : itemDetail ? (
          <>
            <div className="text-xs text-slate-600">
              总可用量：{itemDetail.totals.available_qty}（on_hand=
              {itemDetail.totals.on_hand_qty}）
            </div>

            <div className="space-y-2">
              {sortFEFO(itemDetail.slices).map((slice, idx) => (
                <div
                  key={idx}
                  className="border border-slate-200 rounded-lg p-2 text-xs bg-slate-50"
                >
                  <div className="flex justify-between">
                    <span className="font-mono">{slice.batch_code}</span>
                    <span className="font-semibold">
                      可用：{slice.available_qty}
                    </span>
                  </div>
                  <div className="text-slate-600">
                    expire: {slice.expire_at ?? "-"}
                  </div>
                </div>
              ))}
            </div>
          </>
        ) : (
          <div className="text-xs text-slate-500">无数据。</div>
        )}
      </section>

      {/* TraceTimeline */}
      <section className="bg-white border border-slate-200 rounded-xl p-4 space-y-3">
        <h2 className="text-sm font-semibold text-slate-800">
          Trace 事件时间线
        </h2>

        {lastScanRef && (
          <div className="text-[11px] font-mono text-slate-500">
            {lastScanRef}
          </div>
        )}

        {traceError && (
          <div className="text-xs text-red-600">Trace 加载失败：{traceError}</div>
        )}

        {traceLoading ? (
          <div className="text-xs text-slate-500">加载中…</div>
        ) : traceEvents.length > 0 ? (
          <TraceTimeline events={traceEvents} />
        ) : (
          <div className="text-xs text-slate-500">
            尚无 Trace 数据。成功拣货后将自动展示事件时间线。
          </div>
        )}
      </section>
    </div>
  );
};
