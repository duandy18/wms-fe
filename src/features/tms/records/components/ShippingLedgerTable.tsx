// src/features/tms/records/components/ShippingLedgerTable.tsx

import React from "react";
import type { ShippingLedgerRow } from "../types";
import type { ShippingLedgerWarehouseOption } from "../hooks/useShippingLedgerOptions";

function formatDateTime(value: string | null | undefined): string {
  if (!value) return "-";
  return value.replace("T", " ").replace("Z", "");
}

function formatMoney(value: number | null | undefined): string {
  if (value == null) return "-";
  return `￥${value.toFixed(2)}`;
}

function formatWeight(value: number | null | undefined): string {
  if (value == null) return "-";
  return String(value);
}

function formatDimensions(
  lengthCm: number | null | undefined,
  widthCm: number | null | undefined,
  heightCm: number | null | undefined,
): string {
  if (lengthCm == null || widthCm == null || heightCm == null) {
    return "-";
  }
  return `${lengthCm} × ${widthCm} × ${heightCm}`;
}

function formatProvider(
  carrierName: string | null | undefined,
  carrierCode: string | null | undefined,
): string {
  if (carrierName && carrierCode) {
    return `${carrierName}（${carrierCode}）`;
  }
  if (carrierName) return carrierName;
  if (carrierCode) return carrierCode;
  return "-";
}

function formatWarehouse(
  warehouseId: number | null | undefined,
  warehouses: ShippingLedgerWarehouseOption[],
): string {
  if (warehouseId == null) return "-";
  const hit = warehouses.find((item) => item.id === warehouseId);
  return hit?.name ?? String(warehouseId);
}

interface ShippingLedgerTableProps {
  rows: ShippingLedgerRow[];
  warehouses: ShippingLedgerWarehouseOption[];
  loading: boolean;
  error: string;
  offset: number;
}

const ShippingLedgerTable: React.FC<ShippingLedgerTableProps> = ({
  rows,
  warehouses,
  loading,
  error,
  offset,
}) => {
  return (
    <section className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
      {error ? (
        <div className="rounded-lg border border-rose-200 bg-rose-50 px-3 py-2 text-sm text-rose-700">
          {error}
        </div>
      ) : null}

      {!error && loading ? (
        <div className="text-sm text-slate-500">正在加载发货记录…</div>
      ) : null}

      {!error && !loading && rows.length === 0 ? (
        <div className="text-sm text-slate-500">暂无发货记录。</div>
      ) : null}

      {!error && rows.length > 0 ? (
        <div className="overflow-x-auto">
          <table className="min-w-full border-collapse text-sm">
            <thead className="bg-slate-50">
              <tr>
                <th className="px-3 py-2 text-right">序号</th>
                <th className="px-3 py-2 text-left">运单号</th>
                <th className="px-3 py-2 text-left">快递网点</th>
                <th className="px-3 py-2 text-left">订单号</th>
                <th className="px-3 py-2 text-right">预估运费</th>
                <th className="px-3 py-2 text-right">附加费</th>
                <th className="px-3 py-2 text-right">预估总费用</th>
                <th className="px-3 py-2 text-right">毛重(kg)</th>
                <th className="px-3 py-2 text-left">长×宽×高(cm)</th>
                <th className="px-3 py-2 text-left">仓库</th>
                <th className="px-3 py-2 text-left">目的省</th>
                <th className="px-3 py-2 text-left">目的市</th>
                <th className="px-3 py-2 text-left">寄件人</th>
                <th className="px-3 py-2 text-left">发货时间</th>
              </tr>
            </thead>

            <tbody>
              {rows.map((row, index) => (
                <tr key={row.id} className="border-t">
                  <td className="px-3 py-2 text-right font-mono text-xs text-slate-500">
                    {offset + index + 1}
                  </td>

                  <td className="px-3 py-2 font-mono text-xs">
                    {row.tracking_no ?? "-"}
                  </td>

                  <td className="px-3 py-2 text-xs">
                    {formatProvider(row.carrier_name, row.carrier_code)}
                  </td>

                  <td className="px-3 py-2 font-mono text-xs">
                    {row.order_ref}
                  </td>

                  <td className="px-3 py-2 text-right font-mono text-xs">
                    {formatMoney(row.freight_estimated)}
                  </td>

                  <td className="px-3 py-2 text-right font-mono text-xs">
                    {formatMoney(row.surcharge_estimated)}
                  </td>

                  <td className="px-3 py-2 text-right font-mono text-xs">
                    {formatMoney(row.cost_estimated)}
                  </td>

                  <td className="px-3 py-2 text-right font-mono text-xs">
                    {formatWeight(row.gross_weight_kg)}
                  </td>

                  <td className="px-3 py-2 font-mono text-xs">
                    {formatDimensions(
                      row.length_cm,
                      row.width_cm,
                      row.height_cm,
                    )}
                  </td>

                  <td className="px-3 py-2 text-xs">
                    {formatWarehouse(row.warehouse_id, warehouses)}
                  </td>

                  <td className="px-3 py-2 text-xs">
                    {row.dest_province ?? "-"}
                  </td>

                  <td className="px-3 py-2 text-xs">
                    {row.dest_city ?? "-"}
                  </td>

                  <td className="px-3 py-2 text-xs">
                    {row.sender ?? "-"}
                  </td>

                  <td className="px-3 py-2 font-mono text-xs">
                    {formatDateTime(row.created_at)}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      ) : null}
    </section>
  );
};

export default ShippingLedgerTable;
