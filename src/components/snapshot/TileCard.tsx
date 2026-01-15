// src/components/snapshot/TileCard.tsx
import React from "react";
import type { InventoryRow } from "../../features/inventory/snapshot/api";

type Props = {
  item: InventoryRow;
  onClick?: () => void;
};

const TileCard: React.FC<Props> = ({ item, onClick }) => {
  const whLabel = `WH${item.warehouse_id}`;
  const batchLabel = (item.batch_code ?? "NO-BATCH").trim() || "NO-BATCH";

  return (
    <div
      className="flex h-full flex-col rounded-2xl border border-slate-200 bg-white p-4 text-sm shadow-sm transition hover:-translate-y-0.5 hover:shadow-md"
      onClick={onClick}
    >
      {/* 顶部：名称 + 批次库存 */}
      <div className="mb-2 flex items-start justify-between gap-2">
        <div>
          <div className="text-sm font-semibold text-slate-900">{item.item_name}</div>
          <div className="text-[11px] text-slate-400">
            item_id: {item.item_id} · {whLabel} · {batchLabel}
          </div>
        </div>
        <div className="text-right">
          <div className="text-[11px] uppercase tracking-wide text-slate-400">批次库存</div>
          <div className="text-lg font-semibold text-slate-900">{item.qty}</div>
        </div>
      </div>

      {/* 中间：到期信息 + 风险 */}
      <div className="mb-3 flex items-center justify-between text-xs">
        <div className="truncate text-slate-500">
          {item.expiry_date ? `到期日：${item.expiry_date}` : "无到期日"}
        </div>
        {item.near_expiry ? (
          <span className="inline-flex shrink-0 rounded-full bg-amber-100 px-2 py-0.5 text-[11px] font-medium text-amber-800">
            临期风险
          </span>
        ) : (
          <span className="inline-flex shrink-0 rounded-full bg-emerald-50 px-2 py-0.5 text-[11px] font-medium text-emerald-700">
            状态良好
          </span>
        )}
      </div>

      {/* 底部：事实标签 */}
      <div className="mt-auto space-y-1">
        <div className="inline-flex rounded-full bg-slate-50 px-2 py-0.5 text-[11px] text-slate-600">
          <span className="font-medium text-slate-700">{whLabel}</span>
          <span className="mx-1 text-slate-300">·</span>
          <span className="font-mono">{batchLabel}</span>
          <span className="mx-1 text-slate-300">·</span>
          <span>{item.qty}</span>
        </div>
        <div className="pt-1 text-[11px] text-slate-400">点击查看该商品的仓 + 批次明细</div>
      </div>
    </div>
  );
};

export default TileCard;
