// src/features/shipment/cockpit/components/ShipmentOrderSummaryPanel.tsx

import React from "react";
import { UI } from "../ui";
import type { ShipPrepareItem } from "../../api/shipmentPrepareApi";

type Props = {
  orderId: number | null;
  items: ShipPrepareItem[];
  totalQty: number;
  traceId: string | null;
  receiverName: string;
  receiverPhone: string;
  addressDetail: string;
  province: string;
  city: string;
  district: string;
  totalWeightKg: number;
  packagingWeightKg: number;
};

function safeKg(v: number, digits = 3) {
  if (!Number.isFinite(v)) return "-";
  return v.toFixed(digits);
}

function safeText(v: string | null | undefined): string {
  const s = String(v ?? "").trim();
  return s || "—";
}

export const ShipmentOrderSummaryPanel: React.FC<Props> = ({
  orderId,
  items,
  totalQty,
  traceId,
  receiverName,
  receiverPhone,
  addressDetail,
  province,
  city,
  district,
  totalWeightKg,
  packagingWeightKg,
}) => {
  const hasItems = items.length > 0;

  return (
    <section className={UI.card}>
      <div className="mb-3 flex items-center justify-between">
        <h2 className={UI.h2}>订单摘要</h2>
        <div className="text-sm text-slate-600">
          目的地：
          <span className="ml-2 font-mono">
            {province} {city} {district}
          </span>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-3 text-sm text-slate-700 xl:grid-cols-2">
        <div className="rounded-2xl border border-slate-200 bg-slate-50 p-4">
          <div className="space-y-2">
            <div>
              <span className="font-semibold">订单 ID：</span>
              <span className="ml-2 font-mono">
                {orderId != null ? orderId : "—"}
              </span>
            </div>
            <div>
              <span className="font-semibold">Trace ID：</span>
              <span className="ml-2 font-mono">{safeText(traceId)}</span>
            </div>
            <div>
              <span className="font-semibold">收件人：</span>
              <span className="ml-2">{safeText(receiverName)}</span>
            </div>
            <div>
              <span className="font-semibold">联系电话：</span>
              <span className="ml-2 font-mono">{safeText(receiverPhone)}</span>
            </div>
            <div>
              <span className="font-semibold">详细地址：</span>
              <span className="ml-2">{safeText(addressDetail)}</span>
            </div>
          </div>
        </div>

        <div className="rounded-2xl border border-slate-200 bg-slate-50 p-4">
          <div className="space-y-2">
            <div>
              <span className="font-semibold">订单总件数：</span>
              <span className="ml-2 font-mono">{totalQty}</span>
            </div>
            <div>
              <span className="font-semibold">当前毛重：</span>
              <span className="ml-2 font-mono">
                {safeKg(totalWeightKg, 3)} kg
              </span>
            </div>
            <div>
              <span className="font-semibold">包材重量：</span>
              <span className="ml-2 font-mono">
                {safeKg(packagingWeightKg, 3)} kg
              </span>
            </div>
            <div>
              <span className="font-semibold">货件行数：</span>
              <span className="ml-2 font-mono">{items.length}</span>
            </div>
          </div>
        </div>
      </div>

      <div className="mt-4 overflow-hidden rounded-2xl border border-slate-200">
        <table className="min-w-full border-collapse text-sm">
          <thead className="bg-slate-50">
            <tr>
              <th className="px-4 py-3 text-left font-semibold text-slate-600">
                行号
              </th>
              <th className="px-4 py-3 text-left font-semibold text-slate-600">
                item_id
              </th>
              <th className="px-4 py-3 text-right font-semibold text-slate-600">
                数量
              </th>
            </tr>
          </thead>
          <tbody>
            {hasItems ? (
              items.map((item, idx) => (
                <tr key={`${item.item_id}-${idx}`} className="border-t border-slate-100">
                  <td className="px-4 py-3 font-mono text-slate-500">
                    {idx + 1}
                  </td>
                  <td className="px-4 py-3 font-mono">{item.item_id}</td>
                  <td className="px-4 py-3 text-right font-mono">{item.qty}</td>
                </tr>
              ))
            ) : (
              <tr className="border-t border-slate-100">
                <td colSpan={3} className="px-4 py-6 text-center text-slate-500">
                  暂无订单明细。请先执行“准备订单（候选仓扫描）”。
                </td>
              </tr>
            )}
          </tbody>
          <tfoot>
            <tr className="border-t border-slate-200 bg-slate-50">
              <td className="px-4 py-3 text-sm font-semibold text-slate-700">
                合计
              </td>
              <td className="px-4 py-3 text-sm text-slate-500">
                {hasItems ? `${items.length} 行` : "—"}
              </td>
              <td className="px-4 py-3 text-right font-mono text-sm font-semibold">
                {totalQty}
              </td>
            </tr>
          </tfoot>
        </table>
      </div>

      <div className="mt-3 text-sm text-slate-500">
        当前摘要直接使用 prepare-from-order 返回的订单事实，不再展示示例占位数据。
      </div>
    </section>
  );
};

export default ShipmentOrderSummaryPanel;
