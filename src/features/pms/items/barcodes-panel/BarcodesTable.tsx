// src/features/pms/items/barcodes-panel/BarcodesTable.tsx

import React from "react";
import type { ItemBarcodeCompositeRow } from "../api/itemBarcodesOwnerApi";

function renderUomLabel(row: ItemBarcodeCompositeRow): React.ReactNode {
  const name = row.display_name?.trim() || row.uom;
  const tags: string[] = [];
  if (row.is_base) tags.push("最小单位");
  if (row.is_purchase_default) tags.push("采购默认");

  return (
    <div className="space-y-1">
      <div className="font-mono">{name}</div>
      {tags.length > 0 ? (
        <div className="text-xs text-slate-500">{tags.join(" / ")}</div>
      ) : null}
    </div>
  );
}

export const BarcodesTable: React.FC<{
  rows: ItemBarcodeCompositeRow[];
  onSetPrimary: (id: number) => void;
  onDelete: (id: number) => void;
}> = ({ rows, onSetPrimary, onDelete }) => {
  return (
    <div className="overflow-auto rounded border border-slate-200">
      <table className="min-w-full text-sm">
        <thead className="bg-slate-50">
          <tr>
            <th className="border-b px-4 py-3 text-left font-semibold">单位</th>
            <th className="border-b px-4 py-3 text-left font-semibold">倍率</th>
            <th className="border-b px-4 py-3 text-left font-semibold">条码</th>
            <th className="border-b px-4 py-3 text-left font-semibold">码制</th>
            <th className="border-b px-4 py-3 text-left font-semibold">主条码</th>
            <th className="border-b px-4 py-3 text-left font-semibold">状态</th>
            <th className="border-b px-4 py-3 text-left font-semibold">操作</th>
          </tr>
        </thead>

        <tbody>
          {rows.map((row) => (
            <tr key={row.barcode_id} className="border-t">
              <td className="px-4 py-3">{renderUomLabel(row)}</td>
              <td className="px-4 py-3 font-mono">{row.ratio_to_base}</td>
              <td className="px-4 py-3 font-mono">{row.barcode}</td>
              <td className="px-4 py-3">{row.symbology}</td>
              <td className="px-4 py-3">
                {row.is_primary ? (
                  <span className="rounded bg-emerald-100 px-3 py-1 text-sm text-emerald-700">
                    主条码
                  </span>
                ) : (
                  <button
                    type="button"
                    onClick={() => onSetPrimary(row.barcode_id)}
                    className="rounded border px-3 py-1 text-sm hover:bg-slate-50"
                  >
                    设为主条码
                  </button>
                )}
              </td>
              <td className="px-4 py-3">
                {row.active ? (
                  <span className="rounded bg-sky-100 px-3 py-1 text-sm text-sky-700">
                    启用
                  </span>
                ) : (
                  <span className="rounded bg-slate-100 px-3 py-1 text-sm text-slate-600">
                    停用
                  </span>
                )}
              </td>
              <td className="px-4 py-3">
                <button
                  type="button"
                  onClick={() => onDelete(row.barcode_id)}
                  className="text-sm text-red-600 hover:underline"
                >
                  删除
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default BarcodesTable;
