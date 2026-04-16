// src/features/wms/inbound/components/InboundEventCard.tsx

import React from "react";
import InboundRecentEventsList from "./InboundRecentEventsList";
import type { InboundEventLineDetail, InboundEventSummary } from "../types";

const cardCls = "rounded-2xl border border-slate-200 bg-white p-5";
const btnCls =
  "rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm text-slate-700 hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-50";

export interface InboundEventCardProps {
  recentItems: InboundEventSummary[];
  latestEventNo: string | null;
  latestTraceId: string | null;
  latestLines: InboundEventLineDetail[];
  loading: boolean;
  error: string | null;
  detailLoading: boolean;
  detailError: string | null;
  onLoadRecent: () => void;
  onSelectEvent: (eventId: number) => void;
}

export const InboundEventCard: React.FC<InboundEventCardProps> = ({
  recentItems,
  latestEventNo,
  latestTraceId,
  latestLines,
  loading,
  error,
  detailLoading,
  detailError,
  onLoadRecent,
  onSelectEvent,
}) => {
  return (
    <section className={cardCls}>
      <div className="flex flex-col gap-3 md:flex-row md:items-start md:justify-between">
        <div className="space-y-2">
          <div className="text-base font-semibold text-slate-900">
            入库事件卡
          </div>
          <div className="text-sm text-slate-500">
            这一张卡继续收口为：最近事件列表、事件摘要、事件行明细。
          </div>
        </div>

        <button
          type="button"
          className={btnCls}
          onClick={onLoadRecent}
          disabled={loading}
        >
          {loading ? "读取中…" : "读取最近事件"}
        </button>
      </div>

      {error ? (
        <div className="mt-4 rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700">
          {error}
        </div>
      ) : null}

      {detailError ? (
        <div className="mt-4 rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700">
          {detailError}
        </div>
      ) : null}

      <div className="mt-5 space-y-4">
        <InboundRecentEventsList
          items={recentItems}
          onSelect={onSelectEvent}
        />

        <section className="rounded-xl border border-slate-200 bg-slate-50 p-4">
          <div className="space-y-1">
            <div className="text-sm font-semibold text-slate-900">事件摘要</div>
            <div className="text-sm text-slate-500">
              当前点击最近事件后，会把详情写入 latestEvent。
            </div>
          </div>

          <div className="mt-4 rounded-lg border border-dashed border-slate-300 bg-white p-3 text-sm text-slate-600">
            {detailLoading ? (
              <>正在读取事件详情…</>
            ) : (
              <>
                latest event_no：{latestEventNo ?? "暂无"}
                <br />
                latest trace_id：{latestTraceId ?? "暂无"}
              </>
            )}
          </div>
        </section>

        <section className="rounded-xl border border-slate-200 bg-slate-50 p-4">
          <div className="space-y-1">
            <div className="text-sm font-semibold text-slate-900">事件行明细</div>
            <div className="text-sm text-slate-500">
              当前这一步把 latestEvent.lines 真正渲染出来。
            </div>
          </div>

          <div className="mt-4 space-y-3">
            {detailLoading ? (
              <div className="rounded-lg border border-dashed border-slate-300 bg-white p-3 text-sm text-slate-600">
                正在读取事件行明细…
              </div>
            ) : latestLines.length === 0 ? (
              <div className="rounded-lg border border-dashed border-slate-300 bg-white p-3 text-sm text-slate-600">
                暂无事件行明细。
              </div>
            ) : (
              latestLines.map((line) => (
                <section
                  key={line.lineNo}
                  className="rounded-lg border border-slate-300 bg-white p-3 text-sm text-slate-700"
                >
                  <div className="font-medium text-slate-900">
                    第 {line.lineNo} 行
                  </div>
                  <div className="mt-1 text-slate-600">
                    商品：{line.itemName ?? "暂无"} / SKU：{line.sku ?? "暂无"}
                  </div>
                  <div className="mt-1 text-slate-600">
                    单位：{line.uomName ?? "暂无"} 
                    qty_input：{line.qtyInput} 
                    qty_base：{line.qtyBase}
                  </div>
                  <div className="mt-1 text-slate-500">
                    lot_code：{line.lotCode ?? "暂无"} 
                    production_date：{line.productionDate ?? "暂无"} 
                    expiry_date：{line.expiryDate ?? "暂无"}
                  </div>
                  <div className="mt-1 text-slate-500">
                    remark：{line.remark ?? "暂无"}
                  </div>
                </section>
              ))
            )}
          </div>
        </section>
      </div>
    </section>
  );
};

export default InboundEventCard;
