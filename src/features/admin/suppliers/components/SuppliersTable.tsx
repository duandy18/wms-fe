// src/features/admin/suppliers/components/SuppliersTable.tsx

import React from "react";
import type { Supplier } from "../api";
import { UI } from "../ui";

export const SuppliersTable: React.FC<{
  suppliers: Supplier[];
  onToggleActive: (s: Supplier) => void | Promise<void>;
}> = ({ suppliers, onToggleActive }) => {
  // ✅ 二次兜底：即便上游误传 undefined，也不会在 .length / .map 处炸
  const rows = suppliers ?? [];

  return (
    <div className={UI.tableWrap}>
      <table className={UI.table}>
        <thead>
          <tr className={UI.theadRow}>
            <th className={UI.th}>ID</th>
            <th className={UI.th}>名称</th>
            <th className={UI.th}>编码</th>
            <th className={UI.th}>联系人</th>
            <th className={UI.th}>电话</th>
            <th className={UI.th}>邮箱</th>
            <th className={UI.th}>微信</th>
            <th className={UI.th}>状态</th>
          </tr>
        </thead>

        <tbody>
          {rows.length === 0 ? (
            <tr>
              <td colSpan={8} className={UI.emptyRow}>
                暂无供应商记录
              </td>
            </tr>
          ) : null}

          {rows.map((s) => (
            <tr key={s.id} className={UI.tr}>
              <td className={UI.tdMono}>{s.id}</td>
              <td className={UI.td}>{s.name}</td>
              <td className={UI.td}>{s.code ?? "-"}</td>
              <td className={UI.td}>{s.contact_name ?? "-"}</td>
              <td className={UI.td}>{s.phone ?? "-"}</td>
              <td className={UI.td}>{s.email ?? "-"}</td>
              <td className={UI.td}>{s.wechat ?? "-"}</td>
              <td className={UI.td}>
                <button
                  type="button"
                  onClick={() => void onToggleActive(s)}
                  className={`${UI.statusBtnBase} ${s.active ? UI.statusOn : UI.statusOff}`}
                >
                  {s.active ? "启用中" : "已停用"}
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default SuppliersTable;
