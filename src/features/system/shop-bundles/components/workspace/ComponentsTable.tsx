// src/features/system/shop-bundles/components/build/ComponentsTable.tsx
import React, { useMemo } from "react";
import type { FskuComponentRole, MasterItem } from "../../types";
import type { UseFskuComponentsState } from "../../useFskuComponents";
import { toIntOrNull } from "./buildUtils";

function roleLabel(r: FskuComponentRole): string {
  return r === "gift" ? "赠品" : "主销";
}

export const ComponentsTable: React.FC<{
  fskuId: number | null;
  readOnly: boolean;
  C: UseFskuComponentsState;
  items: MasterItem[];
}> = ({ fskuId, readOnly, C, items }) => {
  const itemMap = useMemo(() => {
    const m = new Map<number, MasterItem>();
    for (const it of items) m.set(it.id, it);
    return m;
  }, [items]);

  if (fskuId == null) {
    return <div className="px-3 py-3 text-[12px] text-slate-500">未选择 FSKU。</div>;
  }

  if (!C.components.length) {
    return <div className="px-3 py-3 text-[12px] text-slate-500">暂无 components。</div>;
  }

  return (
    <div className="max-h-[320px] overflow-auto">
      <table className="min-w-full table-fixed border-collapse text-xs">
        <thead className="sticky top-0 bg-white z-10">
          <tr className="border-b border-slate-200 text-[11px] text-slate-600">
            {/* SKU */}
            <th className="px-2 py-2 text-left border-r border-slate-200 w-[120px]">
              SKU
            </th>

            {/* 商品名称（重点列，加宽） */}
            <th className="px-2 py-2 text-left border-r border-slate-200 w-[420px]">
              商品名称
            </th>

            {/* 数量（极窄，个位数） */}
            <th className="px-2 py-2 text-left border-r border-slate-200 w-[40px]">
              数量
            </th>

            {/* 单位 */}
            <th className="px-2 py-2 text-left border-r border-slate-200 w-[72px]">
              单位
            </th>

            {/* 类型 */}
            <th className="px-2 py-2 text-left border-r border-slate-200 w-[96px]">
              类型
            </th>

            {/* 操作 */}
            <th className="px-2 py-2 text-left w-[72px]">
              操作
            </th>
          </tr>
        </thead>

        <tbody>
          {C.components.map((row, idx) => {
            const it = typeof row.item_id === "number" ? itemMap.get(row.item_id) ?? null : null;

            return (
              <tr key={idx} className="border-b border-slate-100">
                {/* SKU */}
                <td className="px-2 py-2 align-top border-r border-slate-100 font-mono text-[11px] text-slate-900 break-words">
                  {it?.sku ?? "—"}
                </td>

                {/* 商品名称（多行、主视觉） */}
                <td className="px-2 py-2 align-top border-r border-slate-100 text-[12px] text-slate-900 break-words">
                  {it?.name ?? "—"}
                </td>

                {/* 数量输入（极窄） */}
                <td className="px-2 py-2 align-top border-r border-slate-100">
                  <input
                    className="w-[20px] rounded-md border border-slate-300 px-[2px] py-1 text-sm text-right disabled:bg-slate-50"
                    value={row.qty == null ? "" : String(row.qty)}
                    onChange={(e) => C.setQty(idx, toIntOrNull(e.target.value))}
                    placeholder="1"
                    disabled={readOnly || C.loading}
                  />
                </td>

                {/* 单位 */}
                <td className="px-2 py-2 align-top border-r border-slate-100 text-[11px] text-slate-700">
                  {it?.uom ?? "—"}
                </td>

                {/* 类型 */}
                <td className="px-2 py-2 align-top border-r border-slate-100">
                  {readOnly ? (
                    <span
                      className={
                        row.role === "gift"
                          ? "text-[11px] text-amber-700"
                          : "text-[11px] text-slate-700"
                      }
                    >
                      {roleLabel(row.role)}
                    </span>
                  ) : (
                    <select
                      className="w-full rounded-md border border-slate-300 bg-white px-2 py-1 text-sm"
                      value={row.role}
                      onChange={(e) => C.setRole(idx, e.target.value as FskuComponentRole)}
                      disabled={C.loading}
                    >
                      <option value="primary">主销</option>
                      <option value="gift">赠品</option>
                    </select>
                  )}
                </td>

                {/* 操作 */}
                <td className="px-2 py-2 align-top">
                  {!readOnly ? (
                    <button
                      type="button"
                      className="inline-flex items-center rounded-md border border-slate-300 bg-white px-2 py-1 text-[11px] font-medium text-slate-700 hover:bg-slate-50 disabled:opacity-60"
                      onClick={() => C.removeRow(idx)}
                      disabled={C.loading}
                    >
                      删除
                    </button>
                  ) : (
                    <span className="text-[11px] text-slate-400">—</span>
                  )}
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
};
