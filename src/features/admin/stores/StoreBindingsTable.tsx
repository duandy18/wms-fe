// src/features/admin/stores/StoreBindingsTable.tsx

import React from "react";
import type { StoreBinding } from "./types";
import { UI } from "./ui";

// 增强型绑定行：兼容后端扩展字段（名称 / 编码 / 是否启用）
type StoreBindingRow = StoreBinding & {
  warehouse_name?: string;
  warehouse_code?: string | null;
  warehouse_active?: boolean;
};

type Props = {
  bindings: StoreBindingRow[];
  canWrite: boolean;
  saving: boolean;
  onToggleTop: (b: StoreBindingRow) => void;
  onDelete: (b: StoreBindingRow) => void;
};

export const StoreBindingsTable: React.FC<Props> = ({ bindings, canWrite, saving, onToggleTop, onDelete }) => {
  return (
    <section className={UI.cardP4}>
      <div className={UI.titleBase}>仓库绑定列表</div>

      {bindings.length === 0 ? (
        <div className={UI.hint}>尚未绑定任何仓库。</div>
      ) : (
        <table className={UI.table}>
          <thead className={UI.thead}>
            <tr>
              <th className={UI.th}>仓库</th>
              <th className={UI.th}>是否主仓</th>
              <th className={UI.th}>是否默认</th>
              <th className={UI.th}>优先级</th>
              <th className={UI.thW32}>状态</th>
              <th className={UI.thW36}>操作</th>
            </tr>
          </thead>

          <tbody>
            {bindings.map((b) => {
              const inactive = b.warehouse_active === false; // 未提供则视为启用
              const labelParts = [`WH-${b.warehouse_id}`, b.warehouse_name ? `· ${b.warehouse_name}` : "", b.warehouse_code ? `（${b.warehouse_code}）` : ""].filter(Boolean);

              return (
                <tr key={b.warehouse_id} className={`${UI.tr} ${inactive ? UI.trInactive : ""}`}>
                  <td className={UI.tdStrong}>
                    <div>{labelParts.join(" ") || `WH-${b.warehouse_id}`}</div>
                  </td>

                  <td className={UI.td}>{b.is_top ? <span className={UI.pillTop}>主仓</span> : "否"}</td>

                  <td className={UI.td}>{b.is_default ? "是" : "否"}</td>

                  <td className={UI.td}>{b.priority}</td>

                  <td className={UI.td}>
                    {inactive ? <span className={UI.pillInactive}>仓库已停用</span> : <span className={UI.pillOk}>启用</span>}
                  </td>

                  <td className={UI.td}>
                    {canWrite ? (
                      <div className={UI.rowActions}>
                        <button
                          disabled={saving || inactive}
                          onClick={() => !inactive && onToggleTop(b)}
                          className={`${UI.btnSmBase} ${inactive ? UI.btnSmDisabled : UI.btnSmIdle}`}
                        >
                          {b.is_top ? "取消主仓" : "设为主仓"}
                        </button>

                        <button disabled={saving} onClick={() => onDelete(b)} className={UI.btnDanger}>
                          删除
                        </button>
                      </div>
                    ) : (
                      <span className={UI.readOnlyText}>只读</span>
                    )}
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      )}
    </section>
  );
};

export default StoreBindingsTable;
