// src/features/pms/items/components/ItemsListTable.tsx

import React from "react";
import type { Item } from "../../../../contracts/item/contract";
import {
  asRecord,
  getBoolean,
  getString,
  supplierLabel,
  formatShelfUnitCn,
  formatShelfValue,
  policyCnLotSource,
  policyCnExpiry,
} from "./itemsListTableFormatters";

const StatusBadge: React.FC<{ enabled: boolean }> = ({ enabled }) => {
  return enabled ? (
    <span className="inline-flex items-center rounded px-2 py-1 text-sm font-semibold bg-emerald-100 text-emerald-800">
      有效
    </span>
  ) : (
    <span className="inline-flex items-center rounded px-2 py-1 text-sm font-semibold bg-red-100 text-red-800">
      无效
    </span>
  );
};

export const ItemsListTable: React.FC<{
  rows: Item[];
  primaryBarcodes: Record<number, string>;
  onEdit: (it: Item) => void;
}> = ({ rows, onEdit }) => {
  return (
    <div className="space-y-3">
      <table className="min-w-full border-collapse text-base">
        <thead>
          <tr className="bg-slate-50">
            <th className="border px-4 py-3 text-left font-semibold">SKU</th>
            <th className="border px-4 py-3 text-left font-semibold">商品名称</th>
            <th className="border px-4 py-3 text-left font-semibold">规格</th>
            <th className="border px-4 py-3 text-left font-semibold">品牌</th>
            <th className="border px-4 py-3 text-left font-semibold">品类</th>
            <th className="border px-4 py-3 text-left font-semibold">供货商</th>
            <th className="border px-4 py-3 text-left font-semibold">批次策略</th>
            <th className="border px-4 py-3 text-left font-semibold">有效期策略</th>
            <th className="border px-4 py-3 text-left font-semibold">默认保质期</th>
            <th className="border px-4 py-3 text-left font-semibold">状态</th>
            <th className="border px-4 py-3 text-left font-semibold">编辑</th>
          </tr>
        </thead>

        <tbody>
          {rows.map((it) => {
            const r = asRecord(it);

            const spec = getString(r["spec"]) ?? "—";
            const brand = getString(r["brand"]) ?? "—";
            const category = getString(r["category"]) ?? "—";
            const enabled = Boolean(getBoolean(r["enabled"]) ?? false);

            const lotSourcePolicy = policyCnLotSource(r["lot_source_policy"]);
            const expiryPolicy = policyCnExpiry(r["expiry_policy"]);

            const sv = formatShelfValue(r["shelf_life_value"]);
            const su = formatShelfUnitCn(r["shelf_life_unit"]);
            const shelfText = sv !== "—" && su !== "—" ? `${sv} ${su}` : "—";

            return (
              <tr key={it.id} className="border-t">
                <td className="px-4 py-3 font-mono">{it.sku}</td>
                <td className="px-4 py-3 font-medium">{it.name}</td>
                <td className="px-4 py-3 text-slate-700 whitespace-pre-line">{spec}</td>
                <td className="px-4 py-3">{brand}</td>
                <td className="px-4 py-3">{category}</td>
                <td className="px-4 py-3">{supplierLabel(it)}</td>
                <td className="px-4 py-3">{lotSourcePolicy}</td>
                <td className="px-4 py-3">{expiryPolicy}</td>
                <td className="px-4 py-3 font-mono">{shelfText}</td>
                <td className="px-4 py-3">
                  <StatusBadge enabled={enabled} />
                </td>
                <td className="px-4 py-3">
                  <button
                    className="rounded bg-emerald-100 px-4 py-2 text-sm text-emerald-700 hover:bg-emerald-200"
                    onClick={() => onEdit(it)}
                  >
                    编辑
                  </button>
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
};

export default ItemsListTable;
