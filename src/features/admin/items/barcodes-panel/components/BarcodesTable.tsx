// src/features/admin/items/barcodes-panel/components/BarcodesTable.tsx

import React from "react";
import type { ItemBarcode } from "../../barcodesApi";
import { UI } from "../ui";

export const BarcodesTable: React.FC<{
  barcodes: ItemBarcode[];
  onSetPrimary: (id: number) => void;
  onDelete: (id: number) => void;
}> = ({ barcodes, onSetPrimary, onDelete }) => {
  return (
    <div className={UI.tableWrap}>
      <table className={UI.table}>
        <thead className={UI.thead}>
          <tr>
            <th className={UI.th}>ID</th>
            <th className={UI.th}>条码</th>
            <th className={UI.th}>类型</th>
            <th className={UI.th}>主条码</th>
            <th className={UI.th}>操作</th>
          </tr>
        </thead>
        <tbody>
          {barcodes.map((b) => (
            <tr key={b.id} className={UI.tr}>
              <td className={UI.td}>{b.id}</td>
              <td className={UI.tdMono}>{b.barcode}</td>
              <td className={UI.td}>{b.kind}</td>
              <td className={UI.td}>
                {b.is_primary ? (
                  <span className={UI.primaryPill}>主条码</span>
                ) : (
                  <button type="button" onClick={() => void onSetPrimary(b.id)} className={UI.btnSetPrimary}>
                    设为主条码
                  </button>
                )}
              </td>
              <td className={UI.td}>
                <button type="button" className={UI.btnDelete} onClick={() => void onDelete(b.id)}>
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
