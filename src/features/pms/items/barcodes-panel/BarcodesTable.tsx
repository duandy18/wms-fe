// src/features/pms/items/barcodes-panel/BarcodesTable.tsx

import React from "react";
import type { ItemBarcodeCompositeRow } from "../api/itemBarcodesOwnerApi";

function renderPackageName(row: ItemBarcodeCompositeRow): React.ReactNode {
  const name = row.display_name?.trim() || row.uom;
  const desc = row.is_base
    ? "基础包装"
    : `${row.ratio_to_base} × 基础包装`;

  return (
    <div className="space-y-1">
      <div className="font-mono text-slate-900">{name}</div>
      <div className="text-xs text-slate-500">{desc}</div>
    </div>
  );
}

function buildRowKey(row: ItemBarcodeCompositeRow): string {
  if (row.barcode_id > 0) return `barcode_${row.barcode_id}`;
  return `item_${row.item_id}_uom_${row.item_uom_id}`;
}

function renderBarcodeCell(row: ItemBarcodeCompositeRow): React.ReactNode {
  const code = row.barcode.trim();
  if (!code) {
    return <span className="text-slate-400">未绑定</span>;
  }
  return <span className="font-mono">{code}</span>;
}

function renderPrimaryCell(row: ItemBarcodeCompositeRow): React.ReactNode {
  if (!row.barcode.trim()) return <span className="text-slate-400">—</span>;
  return row.is_primary ? "是" : "否";
}

function renderWeightCell(row: ItemBarcodeCompositeRow): React.ReactNode {
  if (row.net_weight_kg == null) {
    return <span className="text-slate-400">—</span>;
  }
  return <span className="font-mono">{row.net_weight_kg}</span>;
}

export const BarcodesTable: React.FC<{
  rows: ItemBarcodeCompositeRow[];
  loading?: boolean;
  onModify: (row: ItemBarcodeCompositeRow) => void;
}> = ({ rows, loading = false, onModify }) => {
  return (
    <div className="overflow-auto rounded border border-slate-200">
      <table className="min-w-full text-sm">
        <thead className="bg-slate-50">
          <tr>
            <th className="border-b px-4 py-3 text-left font-semibold">SKU</th>
            <th className="border-b px-4 py-3 text-left font-semibold">商品名称</th>
            <th className="border-b px-4 py-3 text-left font-semibold">包装单位</th>
            <th className="border-b px-4 py-3 text-left font-semibold">重量（kg）</th>
            <th className="border-b px-4 py-3 text-left font-semibold">条码</th>
            <th className="border-b px-4 py-3 text-left font-semibold">是否主条码</th>
            <th className="border-b px-4 py-3 text-left font-semibold">操作</th>
          </tr>
        </thead>

        <tbody>
          {loading ? (
            <tr>
              <td colSpan={7} className="px-4 py-8 text-center text-slate-500">
                条码列表加载中…
              </td>
            </tr>
          ) : rows.length === 0 ? (
            <tr>
              <td colSpan={7} className="px-4 py-8 text-center text-slate-500">
                暂无包装/条码记录
              </td>
            </tr>
          ) : (
            rows.map((row) => (
              <tr key={buildRowKey(row)} className="border-t">
                <td className="px-4 py-3 font-mono">{row.sku}</td>
                <td className="px-4 py-3">{row.item_name}</td>
                <td className="px-4 py-3">{renderPackageName(row)}</td>
                <td className="px-4 py-3 whitespace-nowrap">{renderWeightCell(row)}</td>
                <td className="px-4 py-3">{renderBarcodeCell(row)}</td>
                <td className="px-4 py-3">{renderPrimaryCell(row)}</td>
                <td className="px-4 py-3">
                  <button
                    type="button"
                    onClick={() => onModify(row)}
                    className="rounded border border-slate-300 bg-white px-3 py-1.5 text-sm text-slate-700 hover:bg-slate-50"
                  >
                    修改
                  </button>
                </td>
              </tr>
            ))
          )}
        </tbody>
      </table>
    </div>
  );
};

export default BarcodesTable;
