// src/features/purchase-orders/PurchaseOrderLinksCard.tsx

import React from "react";

interface PurchaseOrderLinksCardProps {
  poRef: string;
  ledgerUrl: string;
  stockUrl?: string;
  warehouseId: number;
  itemId?: number;
}

/**
 * 联动视图卡片：
 * - 从采购单跳台账 / 库存；
 * - 不再包含任何打印 / 预览按钮，避免与“采购报告”混淆。
 */
export const PurchaseOrderLinksCard: React.FC<
  PurchaseOrderLinksCardProps
> = ({ poRef, ledgerUrl, stockUrl, warehouseId, itemId }) => {
  return (
    <section className="bg-white border border-slate-200 rounded-xl p-4 space-y-2">
      <h2 className="text-sm font-semibold text-slate-800">
        联动视图
      </h2>
      <p className="text-xs text-slate-500">
        从采购单视角直接跳转到台账 / 库存诊断工具。
      </p>

      <div className="flex flex-wrap gap-2 mt-1 text-xs">
        <a
          href={ledgerUrl}
          className="inline-flex items-center rounded-full border border-slate-300 px-3 py-1 hover:bg-slate-50"
        >
          查看台账（LedgerTool, ref={poRef}）
        </a>

        {stockUrl && itemId != null && (
          <a
            href={stockUrl}
            className="inline-flex items-center rounded-full border border-slate-300 px-3 py-1 hover:bg-slate-50"
          >
            查看库存（StockTool, wh={warehouseId}, item={itemId}）
          </a>
        )}
      </div>
    </section>
  );
};
