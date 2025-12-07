// src/features/admin/stores/StoreBindingsTable.tsx

import React from "react";
import type { StoreBinding } from "./types";

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

export const StoreBindingsTable: React.FC<Props> = ({
  bindings,
  canWrite,
  saving,
  onToggleTop,
  onDelete,
}) => {
  return (
    <section className="bg-white border border-slate-200 rounded-xl p-4 space-y-3">
      <div className="text-base font-semibold text-slate-900">
        仓库绑定列表
      </div>

      {bindings.length === 0 ? (
        <div className="text-sm text-slate-500">尚未绑定任何仓库。</div>
      ) : (
        <table className="min-w-full text-sm">
          <thead className="bg-slate-50 border-b border-slate-200">
            <tr>
              <th className="px-3 py-2 text-left">仓库</th>
              <th className="px-3 py-2 text-left">是否主仓</th>
              <th className="px-3 py-2 text-left">是否默认</th>
              <th className="px-3 py-2 text-left">优先级</th>
              <th className="px-3 py-2 text-left w-32">状态</th>
              <th className="px-3 py-2 text-left w-36">操作</th>
            </tr>
          </thead>

          <tbody>
            {bindings.map((b) => {
              const inactive = b.warehouse_active === false; // 未提供则视为启用
              const labelParts = [
                `WH-${b.warehouse_id}`,
                b.warehouse_name ? `· ${b.warehouse_name}` : "",
                b.warehouse_code ? `（${b.warehouse_code}）` : "",
              ].filter(Boolean);

              return (
                <tr
                  key={b.warehouse_id}
                  className={
                    "border-b border-slate-100 hover:bg-slate-50 " +
                    (inactive ? "bg-slate-50 text-slate-400" : "")
                  }
                >
                  <td className="px-3 py-2 font-medium">
                    <div>{labelParts.join(" ") || `WH-${b.warehouse_id}`}</div>
                  </td>

                  <td className="px-3 py-2">
                    {b.is_top ? (
                      <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200">
                        主仓
                      </span>
                    ) : (
                      "否"
                    )}
                  </td>

                  <td className="px-3 py-2">{b.is_default ? "是" : "否"}</td>

                  <td className="px-3 py-2">{b.priority}</td>

                  <td className="px-3 py-2">
                    {inactive ? (
                      <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs bg-slate-100 text-slate-500 border border-slate-200">
                        仓库已停用
                      </span>
                    ) : (
                      <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs bg-emerald-50 text-emerald-700 border border-emerald-200">
                        启用
                      </span>
                    )}
                  </td>

                  <td className="px-3 py-2">
                    {canWrite ? (
                      <div className="flex gap-2">
                        <button
                          disabled={saving || inactive}
                          onClick={() => !inactive && onToggleTop(b)}
                          className={
                            "px-3 py-1 rounded border text-xs " +
                            (inactive
                              ? "border-slate-200 text-slate-300 cursor-not-allowed"
                              : "border-slate-300 text-slate-800 hover:bg-slate-100")
                          }
                        >
                          {b.is_top ? "取消主仓" : "设为主仓"}
                        </button>

                        <button
                          disabled={saving}
                          onClick={() => onDelete(b)}
                          className="px-3 py-1 rounded border border-red-300 text-xs text-red-700 hover:bg-red-50 disabled:opacity-60"
                        >
                          删除
                        </button>
                      </div>
                    ) : (
                      <span className="text-slate-400 text-xs">只读</span>
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
