// src/features/diagnostics/intelligence-dashboard/HotItemsCard.tsx
import React from "react";
import { SectionCard } from "../../../components/wmsdu/SectionCard";
import type { HotItem } from "./api";

type HotItemsProps = { hotItems: HotItem[] };

export const HotItemsCard: React.FC<HotItemsProps> = ({ hotItems }) => {
  return (
    <SectionCard
      title="高流量商品（最近 7 天）"
      description="按出库台账统计的 Top 出库量商品"
      className="h-full p-6 space-y-4"
    >
      {hotItems.length === 0 ? (
        <div className="text-xs text-slate-500">暂无数据。</div>
      ) : (
        <div className="text-xs">
          <table className="min-w-full border-collapse">
            <thead>
              <tr className="border-b bg-slate-50 text-[11px] text-slate-500">
                <th className="px-2 py-1 text-left">Item ID</th>
                <th className="px-2 py-1 text-right">出库总量</th>
                <th className="px-2 py-1 text-right">事件数</th>
              </tr>
            </thead>
            <tbody>
              {hotItems.map((h) => (
                <tr key={h.item_id} className="border-b last:border-0">
                  <td className="px-2 py-1">{h.item_id}</td>
                  <td className="px-2 py-1 text-right">
                    {h.total_outbound}
                  </td>
                  <td className="px-2 py-1 text-right">{h.events}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </SectionCard>
  );
};
