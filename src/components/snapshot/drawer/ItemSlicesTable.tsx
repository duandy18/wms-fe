// src/components/snapshot/drawer/ItemSlicesTable.tsx
import React from "react";
import type { ItemSlice } from "../../../features/inventory/snapshot/api";

export function ItemSlicesTable({ slices }: { slices: ItemSlice[] }) {
  return (
    <section className="border border-slate-200 rounded-lg">
      {/* 表头标题 */}
      <div className="px-4 py-3 border-b border-slate-200 text-lg font-semibold text-slate-800">
        仓 + 批次切片
      </div>

      <div className="max-h-[440px] overflow-auto">
        <table className="min-w-full text-base">
          <thead className="bg-slate-50 border-b border-slate-200">
            <tr>
              <th className="px-3 py-2 text-left text-sm text-slate-600">仓库</th>
              <th className="px-3 py-2 text-left text-sm text-slate-600">批次</th>
              <th className="px-3 py-2 text-right text-sm text-slate-600">在库</th>
              <th className="px-3 py-2 text-right text-sm text-slate-600">可用</th>
              <th className="px-3 py-2 text-left text-sm text-slate-600">生产日</th>
              <th className="px-3 py-2 text-left text-sm text-slate-600">到期日</th>
              <th className="px-3 py-2 text-left text-sm text-slate-600">标记</th>
            </tr>
          </thead>
          <tbody>
            {slices.map((s, idx) => (
              <tr key={`${s.warehouse_id}-${s.batch_code}-${idx}`} className="border-b border-slate-100 text-base">
                <td className="px-3 py-2 whitespace-nowrap">{s.warehouse_name}</td>
                <td className="px-3 py-2 whitespace-nowrap">{s.batch_code}</td>
                <td className="px-3 py-2 text-right">{s.on_hand_qty}</td>
                <td className="px-3 py-2 text-right">{s.available_qty}</td>
                <td className="px-3 py-2 whitespace-nowrap">{s.production_date || "-"}</td>
                <td className="px-3 py-2 whitespace-nowrap">{s.expiry_date || "-"}</td>
                <td className="px-3 py-2 whitespace-nowrap">
                  {s.is_top ? (
                    <span className="inline-block px-3 py-1 rounded-full bg-slate-100 text-slate-700 mr-2 text-sm">
                      TOP
                    </span>
                  ) : null}
                  {s.near_expiry ? (
                    <span className="inline-block px-3 py-1 rounded-full bg-amber-100 text-amber-700 text-sm">
                      临期
                    </span>
                  ) : null}
                </td>
              </tr>
            ))}

            {slices.length === 0 ? (
              <tr>
                <td className="px-3 py-4 text-center text-slate-400 text-base" colSpan={7}>
                  无在库批次
                </td>
              </tr>
            ) : null}
          </tbody>
        </table>
      </div>
    </section>
  );
}
