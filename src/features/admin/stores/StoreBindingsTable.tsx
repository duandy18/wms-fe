// src/features/admin/stores/StoreBindingsTable.tsx

import React, { useMemo } from "react";
import type { StoreBinding, WarehouseRole } from "./types";

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
  onChangeRole: (b: StoreBindingRow, role: WarehouseRole) => void;
  onDelete: (b: StoreBindingRow) => void;
};

function deriveRole(b: StoreBindingRow): WarehouseRole {
  if (b.is_default) return "DEFAULT";
  if (b.is_top) return "TOP";
  return "NORMAL";
}

function roleLabel(role: WarehouseRole) {
  switch (role) {
    case "DEFAULT":
      return "默认兜底仓";
    case "TOP":
      return "主仓";
    case "NORMAL":
    default:
      return "普通仓";
  }
}

export const StoreBindingsTable: React.FC<Props> = ({
  bindings,
  canWrite,
  saving,
  onChangeRole,
  onDelete,
}) => {
  const rows = useMemo(() => {
    // 默认：优先显示默认兜底仓，其次主仓，最后普通仓；同组按 priority
    return [...bindings].sort((a, b) => {
      const ra = deriveRole(a);
      const rb = deriveRole(b);
      const rank = (r: WarehouseRole) => (r === "DEFAULT" ? 0 : r === "TOP" ? 1 : 2);
      const da = rank(ra);
      const db = rank(rb);
      if (da !== db) return da - db;
      return (a.priority ?? 0) - (b.priority ?? 0);
    });
  }, [bindings]);

  return (
    <section className="bg-white border border-slate-200 rounded-xl p-4 space-y-3">
      <div className="text-base font-semibold text-slate-900">仓库绑定列表</div>

      {rows.length === 0 ? (
        <div className="text-sm text-slate-500">尚未绑定任何仓库。</div>
      ) : (
        <table className="min-w-full text-sm">
          <thead className="bg-slate-50 border-b border-slate-200">
            <tr>
              <th className="px-3 py-2 text-left">仓库</th>
              <th className="px-3 py-2 text-left">角色</th>
              <th className="px-3 py-2 text-left">优先级</th>
              <th className="px-3 py-2 text-left w-32">状态</th>
              <th className="px-3 py-2 text-left w-44">操作</th>
            </tr>
          </thead>

          <tbody>
            {rows.map((b) => {
              const inactive = b.warehouse_active === false; // 未提供则视为启用

              const role = deriveRole(b);

              return (
                <tr
                  key={b.warehouse_id}
                  className={
                    "border-b border-slate-100 hover:bg-slate-50 " +
                    (inactive ? "bg-slate-50 text-slate-400" : "")
                  }
                >
                  <td className="px-3 py-2 font-medium">
                    <div>{(b.warehouse_name && b.warehouse_name.trim()) || `WH-${b.warehouse_id}`}</div>
                  </td>

                  <td className="px-3 py-2">
                    {role === "DEFAULT" ? (
                      <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-semibold bg-sky-50 text-sky-700 border border-sky-200">
                        {roleLabel(role)}
                      </span>
                    ) : role === "TOP" ? (
                      <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200">
                        {roleLabel(role)}
                      </span>
                    ) : (
                      <span className="text-slate-600">{roleLabel(role)}</span>
                    )}
                  </td>

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
                      <div className="flex flex-wrap items-center gap-2">
                        <label className="flex items-center gap-2">
                          <span className="text-xs text-slate-500">角色</span>
                          <select
                            value={role}
                            onChange={(e) => onChangeRole(b, e.target.value as WarehouseRole)}
                            disabled={saving || inactive}
                            className="border rounded px-2 py-1 text-xs bg-white disabled:opacity-60"
                            title={inactive ? "仓库已停用，不能修改角色" : "修改仓库角色"}
                          >
                            <option value="NORMAL">普通仓</option>
                            <option value="TOP">主仓（TOP）</option>
                            <option value="DEFAULT">默认兜底仓</option>
                          </select>
                        </label>

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
