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
    <span className="inline-flex items-center rounded px-2 py-0.5 text-xs font-semibold bg-emerald-100 text-emerald-800">
      有效
    </span>
  ) : (
    <span className="inline-flex items-center rounded px-2 py-0.5 text-xs font-semibold bg-red-100 text-red-800">
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
      <div className="overflow-x-auto rounded-lg border border-slate-200">
        <table className="min-w-[1520px] table-fixed border-collapse text-sm">
          <colgroup>
            <col className="w-[360px]" />
            <col className="w-[190px]" />
            <col className="w-[160px]" />
            <col className="w-[120px]" />
            <col className="w-[120px]" />
            <col className="w-[170px]" />
            <col className="w-[140px]" />
            <col className="w-[140px]" />
            <col className="w-[120px]" />
            <col className="w-[90px]" />
            <col className="w-[90px]" />
          </colgroup>

          <thead>
            <tr className="bg-slate-50 text-xs text-slate-600">
              <th className="border px-3 py-2 text-left font-semibold">SKU</th>
              <th className="border px-3 py-2 text-left font-semibold">商品名称</th>
              <th className="border px-3 py-2 text-left font-semibold">规格</th>
              <th className="border px-3 py-2 text-left font-semibold">品牌</th>
              <th className="border px-3 py-2 text-left font-semibold">品类</th>
              <th className="border px-3 py-2 text-left font-semibold">供货商</th>
              <th className="border px-3 py-2 text-left font-semibold">批次策略</th>
              <th className="border px-3 py-2 text-left font-semibold">有效期策略</th>
              <th className="border px-3 py-2 text-left font-semibold">默认保质期</th>
              <th className="border px-3 py-2 text-left font-semibold">状态</th>
              <th className="border px-3 py-2 text-left font-semibold">编辑</th>
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
                <tr key={it.id} className="border-t text-[13px] text-slate-700">
                  <td className="px-3 py-2 align-top font-mono text-xs leading-5 text-slate-900 break-all">
                    {it.sku}
                  </td>
                  <td className="px-3 py-2 align-top font-medium text-slate-900 break-words">
                    {it.name}
                  </td>
                  <td className="px-3 py-2 align-top whitespace-pre-line break-words">{spec}</td>
                  <td className="px-3 py-2 align-top break-words">{brand}</td>
                  <td className="px-3 py-2 align-top break-words">{category}</td>
                  <td className="px-3 py-2 align-top break-words">{supplierLabel(it)}</td>
                  <td className="px-3 py-2 align-top">{lotSourcePolicy}</td>
                  <td className="px-3 py-2 align-top">{expiryPolicy}</td>
                  <td className="px-3 py-2 align-top font-mono text-xs">{shelfText}</td>
                  <td className="px-3 py-2 align-top">
                    <StatusBadge enabled={enabled} />
                  </td>
                  <td className="px-3 py-2 align-top">
                    <button
                      className="rounded bg-emerald-100 px-3 py-1.5 text-xs text-emerald-700 hover:bg-emerald-200"
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
    </div>
  );
};

export default ItemsListTable;
