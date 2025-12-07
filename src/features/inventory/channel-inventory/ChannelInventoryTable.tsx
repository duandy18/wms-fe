// src/features/inventory/channel-inventory/ChannelInventoryTable.tsx
import React from "react";
import type { WarehouseInventoryModel, BatchQty } from "./types";

type Props = {
  warehouses: WarehouseInventoryModel[];
  loading: boolean;
  error: string | null;
  expanded: Record<number, boolean>;
  toggleExpand: (warehouseId: number) => void;
  onInspectStock: (warehouseId: number) => void;
  onInspectLedger: (warehouseId: number) => void;
};

export const ChannelInventoryTable: React.FC<Props> = ({
  warehouses,
  loading,
  error,
  expanded,
  toggleExpand,
  onInspectStock,
  onInspectLedger,
}) => {
  const hasData = warehouses.length > 0;

  return (
    <section className="bg-white border border-slate-200 rounded-xl overflow-hidden">
      {!loading && !hasData && !error && (
        <div className="px-4 py-6 text-base text-slate-600">
          暂无数据，请先选择平台 / 店铺 / SKU。
        </div>
      )}

      {loading && (
        <div className="px-4 py-6 text-base text-slate-700">加载中…</div>
      )}

      {!loading && hasData && (
        <div className="max-h-[520px] overflow-auto">
          <table className="min-w-full text-base">
            <thead className="bg-slate-50 border-b border-slate-200">
              <tr className="text-sm font-semibold text-slate-700">
                <th className="px-4 py-3 text-left w-20">仓库</th>
                <th className="px-4 py-3 text-right w-24">on_hand</th>
                <th className="px-4 py-3 text-right w-28">reserved</th>
                <th className="px-4 py-3 text-right w-24">available</th>
                <th className="px-4 py-3 text-left w-32">标记</th>
                <th className="px-4 py-3 text-right w-20">priority</th>
                <th className="px-4 py-3 text-left w-28">批次</th>
                <th className="px-4 py-3 text-left w-40">诊断</th>
              </tr>
            </thead>

            {/* 主表内容 */}
            <tbody>
              {warehouses.map((wh) => (
                <React.Fragment key={wh.warehouse_id}>
                  <tr className="border-b border-slate-100 hover:bg-slate-50">
                    <td className="px-4 py-3 whitespace-nowrap">
                      WH-{wh.warehouse_id}
                    </td>
                    <td className="px-4 py-3 text-right">{wh.on_hand}</td>
                    <td className="px-4 py-3 text-right">
                      {wh.reserved_open}
                    </td>
                    <td className="px-4 py-3 text-right font-semibold text-slate-900">
                      {wh.available}
                    </td>
                    <td className="px-4 py-3">
                      {wh.is_top && (
                        <span className="inline-block px-2 py-0.5 rounded-full bg-slate-900 text-white text-xs mr-1">
                          TOP
                        </span>
                      )}
                      {wh.is_default && (
                        <span className="inline-block px-2 py-0.5 rounded-full bg-slate-200 text-slate-700 text-xs">
                          DEFAULT
                        </span>
                      )}
                    </td>
                    <td className="px-4 py-3 text-right">{wh.priority}</td>

                    {/* 批次按钮 */}
                    <td className="px-4 py-3">
                      <button
                        className="text-sm text-slate-600 hover:text-slate-900"
                        onClick={() => toggleExpand(wh.warehouse_id)}
                      >
                        {expanded[wh.warehouse_id] ? "收起批次" : "展开批次"}
                      </button>
                    </td>

                    {/* 诊断按钮 */}
                    <td className="px-4 py-3">
                      <div className="flex gap-2">
                        <button
                          className="px-3 py-1.5 border border-slate-300 rounded text-sm hover:bg-slate-100"
                          onClick={() => onInspectStock(wh.warehouse_id)}
                        >
                          库存工具
                        </button>
                        <button
                          className="px-3 py-1.5 border border-slate-300 rounded text-sm hover:bg-slate-100"
                          onClick={() => onInspectLedger(wh.warehouse_id)}
                        >
                          账本工具
                        </button>
                      </div>
                    </td>
                  </tr>

                  {/* 批次明细区域（字号提升到 text-sm） */}
                  {expanded[wh.warehouse_id] && (
                    <tr className="border-b border-slate-100 bg-slate-50/60">
                      <td className="px-4 py-4" colSpan={8}>
                        <BatchesTable batches={wh.batches} />
                      </td>
                    </tr>
                  )}
                </React.Fragment>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </section>
  );
};

function BatchesTable({ batches }: { batches: BatchQty[] }) {
  if (!batches || batches.length === 0) {
    return (
      <div className="text-sm text-slate-500">无批次明细（或库存为 0）</div>
    );
  }

  return (
    <table className="min-w-[320px] text-sm">
      <thead>
        <tr className="text-slate-500 text-sm">
          <th className="text-left pr-4 pb-2">batch_code</th>
          <th className="text-right pb-2">qty</th>
        </tr>
      </thead>
      <tbody>
        {batches.map((b, idx) => (
          <tr key={idx}>
            <td className="pr-4 py-1">{b.batch_code || "NO-BATCH"}</td>
            <td className="text-right py-1">{b.qty}</td>
          </tr>
        ))}
      </tbody>
    </table>
  );
}
