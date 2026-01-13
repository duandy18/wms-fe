// src/features/admin/items/barcodes-panel/BarcodesTable.tsx

import React from "react";
import type { ItemBarcode } from "../../../../master-data/itemBarcodesApi";

export const BarcodesTable: React.FC<{
  barcodes: ItemBarcode[];
  onSetPrimary: (id: number) => void;
  onDelete: (id: number) => void;
}> = ({ barcodes, onSetPrimary, onDelete }) => {
  return (
    <div className="overflow-auto rounded border border-slate-200">
      <table className="min-w-full text-lg">
        <thead className="bg-slate-50">
          <tr>
            <th className="border-b px-4 py-3 text-left">ID</th>
            <th className="border-b px-4 py-3 text-left">条码</th>
            <th className="border-b px-4 py-3 text-left">类型</th>
            <th className="border-b px-4 py-3 text-left">主条码</th>
            <th className="border-b px-4 py-3 text-left">操作</th>
          </tr>
        </thead>

        <tbody>
          {barcodes.map((b) => (
            <tr key={b.id} className="border-t">
              <td className="px-4 py-3">{b.id}</td>
              <td className="px-4 py-3 font-mono">{b.barcode}</td>
              <td className="px-4 py-3">{b.kind}</td>
              <td className="px-4 py-3">
                {b.is_primary ? (
                  <span className="rounded bg-emerald-100 px-3 py-1 text-base text-emerald-700">
                    主条码
                  </span>
                ) : (
                  <button
                    type="button"
                    onClick={() => onSetPrimary(b.id)}
                    className="rounded border px-3 py-1 text-base hover:bg-slate-50"
                  >
                    设为主条码
                  </button>
                )}
              </td>
              <td className="px-4 py-3">
                <button
                  type="button"
                  onClick={() => onDelete(b.id)}
                  className="text-base text-red-600 hover:underline"
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
