// src/features/shipment/components/ShippingStatusStatsCards.tsx
//
// 分拆说明：
// - 本文件从 ShippingReportsPage.tsx 中拆出“状态分布小卡片”区域。
// - 目标是把 Shipment 状态统计展示独立出去，减少主页面体积，便于后续继续拆分。
// - 当前只负责纯展示，不承载数据请求与路由逻辑。

import React from "react";

export type ShippingStatusStats = {
  inTransit: number;
  delivered: number;
  lost: number;
  returned: number;
  other: number;
  pctInTransit: number;
  pctDelivered: number;
  pctLost: number;
  pctReturned: number;
  pctOther: number;
};

type Props = {
  stats: ShippingStatusStats;
};

const ShippingStatusStatsCards: React.FC<Props> = ({ stats }) => {
  return (
    <section className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
      <div className="mb-3 flex items-center justify-between">
        <h2 className="text-sm font-semibold text-slate-800">
          状态分布（当前页）
        </h2>
        <span className="text-[11px] text-slate-500">
          基于当前页明细记录统计：运输中 / 已签收 / 丢失 / 已退回
        </span>
      </div>
      <div className="grid grid-cols-2 gap-3 md:grid-cols-5">
        <div className="rounded-xl border border-sky-100 bg-sky-50 px-3 py-2 text-xs">
          <div className="text-[11px] text-sky-700">运输中</div>
          <div className="mt-1 flex items-baseline gap-1">
            <span className="font-mono text-lg font-semibold text-sky-800">
              {stats.inTransit}
            </span>
            <span className="text-[11px] text-slate-500">
              {stats.pctInTransit.toFixed(1)}%
            </span>
          </div>
        </div>

        <div className="rounded-xl border border-emerald-100 bg-emerald-50 px-3 py-2 text-xs">
          <div className="text-[11px] text-emerald-700">已签收</div>
          <div className="mt-1 flex items-baseline gap-1">
            <span className="font-mono text-lg font-semibold text-emerald-800">
              {stats.delivered}
            </span>
            <span className="text-[11px] text-slate-500">
              {stats.pctDelivered.toFixed(1)}%
            </span>
          </div>
        </div>

        <div className="rounded-xl border border-rose-100 bg-rose-50 px-3 py-2 text-xs">
          <div className="text-[11px] text-rose-700">丢失</div>
          <div className="mt-1 flex items-baseline gap-1">
            <span className="font-mono text-lg font-semibold text-rose-800">
              {stats.lost}
            </span>
            <span className="text-[11px] text-slate-500">
              {stats.pctLost.toFixed(1)}%
            </span>
          </div>
        </div>

        <div className="rounded-xl border border-amber-100 bg-amber-50 px-3 py-2 text-xs">
          <div className="text-[11px] text-amber-700">已退回</div>
          <div className="mt-1 flex items-baseline gap-1">
            <span className="font-mono text-lg font-semibold text-amber-800">
              {stats.returned}
            </span>
            <span className="text-[11px] text-slate-500">
              {stats.pctReturned.toFixed(1)}%
            </span>
          </div>
        </div>

        <div className="rounded-xl border border-slate-100 bg-slate-50 px-3 py-2 text-xs">
          <div className="text-[11px] text-slate-700">其他 / 未设置</div>
          <div className="mt-1 flex items-baseline gap-1">
            <span className="font-mono text-lg font-semibold text-slate-800">
              {stats.other}
            </span>
            <span className="text-[11px] text-slate-500">
              {stats.pctOther.toFixed(1)}%
            </span>
          </div>
        </div>
      </div>
    </section>
  );
};

export default ShippingStatusStatsCards;
