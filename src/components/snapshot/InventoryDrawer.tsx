// src/components/snapshot/InventoryDrawer.tsx
import React from "react";
import type { ItemDetailResponse } from "../../features/inventory/snapshot/api";
import { InventoryDrawerShell } from "./drawer/InventoryDrawerShell";
import { LatestLedgerExplainCard } from "./drawer/LatestLedgerExplainCard";
import { ItemSlicesTable } from "./drawer/ItemSlicesTable";

interface Props {
  open: boolean;
  loading?: boolean;
  item: ItemDetailResponse | null;
  onClose: () => void;
  onRefresh?: () => void;
}

export default function InventoryDrawer({
  open,
  loading = false,
  item,
  onClose,
  onRefresh,
}: Props) {
  const subtitle = item ? `#${item.item_id} ${item.item_name}` : null;

  return (
    <InventoryDrawerShell
      open={open}
      loading={loading}
      title="单品明细"
      subtitle={subtitle}
      onClose={onClose}
      onRefresh={onRefresh}
    >
      {!loading && item ? (
        <>
          {/* 最小解释：最近一条台账（事实来源） */}
          <LatestLedgerExplainCard open={open} item={item} />

          {/* 汇总区域 */}
          <section className="border border-slate-200 rounded-lg p-4">
            <div className="text-lg font-semibold text-slate-800 mb-3">汇总</div>
            <div className="flex gap-8 text-base">
              <div>
                <div className="text-sm text-slate-500 mb-1">在库 on_hand</div>
                <div className="text-xl font-semibold text-slate-900">{item.totals.on_hand_qty}</div>
              </div>
              <div>
                <div className="text-sm text-slate-500 mb-1">可用 available</div>
                <div className="text-xl font-semibold text-slate-900">{item.totals.available_qty}</div>
              </div>
              <div>
                <div className="text-sm text-slate-500 mb-1">预占 reserved</div>
                <div className="text-xl font-semibold text-slate-900">{item.totals.reserved_qty}</div>
              </div>
            </div>
          </section>

          {/* 仓 + 批次切片列表 */}
          <ItemSlicesTable slices={item.slices} />
        </>
      ) : null}

      {!loading && !item ? <div className="text-base text-slate-500">暂无数据。</div> : null}
    </InventoryDrawerShell>
  );
}
