// src/features/wms/inbound/components/InboundRecentEventsList.tsx

import React from "react";
import type { InboundEventSummary } from "../types";

const sectionCls = "rounded-xl border border-slate-200 bg-slate-50 p-4";
const itemBtnCls =
  "w-full rounded-lg border border-slate-300 bg-white p-3 text-left text-sm text-slate-700 hover:bg-slate-50";

export interface InboundRecentEventsListProps {
  items: InboundEventSummary[];
  onSelect: (eventId: number) => void;
}

export const InboundRecentEventsList: React.FC<InboundRecentEventsListProps> = ({
  items,
  onSelect,
}) => {
  return (
    <section className={sectionCls}>
      <div className="space-y-1">
        <div className="text-sm font-semibold text-slate-900">最近事件列表</div>
        <div className="text-sm text-slate-500">
          当前先把 recentEvents 真正渲染出来；点击某条事件会读取详情。
        </div>
      </div>

      <div className="mt-4 space-y-3">
        {items.length === 0 ? (
          <div className="rounded-lg border border-dashed border-slate-300 bg-white p-3 text-sm text-slate-600">
            暂无最近事件。
          </div>
        ) : (
          items.map((item) => (
            <button
              key={item.eventId}
              type="button"
              className={itemBtnCls}
              onClick={() => onSelect(item.eventId)}
            >
              <div className="font-medium text-slate-900">{item.eventNo}</div>
              <div className="mt-1 text-slate-600">
                source_type：{item.sourceType ?? "暂无"} 
                source_ref：{item.sourceRef ?? "暂无"}
              </div>
              <div className="mt-1 text-slate-500">
                trace_id：{item.traceId}
              </div>
              <div className="mt-1 text-slate-500">
                occurred_at：{item.occurredAt}
              </div>
            </button>
          ))
        )}
      </div>
    </section>
  );
};

export default InboundRecentEventsList;
