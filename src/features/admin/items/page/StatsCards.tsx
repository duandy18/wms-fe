// src/features/admin/items/page/StatsCards.tsx

import React from "react";
import type { ItemsStats } from "./types";

export const StatsCards: React.FC<{ stats: ItemsStats }> = ({ stats }) => {
  return (
    <section className="grid grid-cols-1 gap-3 md:grid-cols-3">
      <div className="rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm">
        <div className="text-[11px] text-slate-500">商品总数</div>
        <div className="mt-1 text-xl font-semibold text-slate-900">{stats.total}</div>
      </div>

      <div className="rounded-xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm">
        <div className="text-[11px] text-emerald-700">已配置主条码</div>
        <div className="mt-1 text-xl font-semibold text-emerald-900">{stats.withPrimary}</div>
      </div>

      <div className="rounded-xl border border-amber-200 bg-amber-50 px-4 py-3 text-sm">
        <div className="text-[11px] text-amber-700">未配置主条码（入库时会失败）</div>
        <div className="mt-1 text-xl font-semibold text-amber-900">{stats.withoutPrimary}</div>
      </div>
    </section>
  );
};

export default StatsCards;
