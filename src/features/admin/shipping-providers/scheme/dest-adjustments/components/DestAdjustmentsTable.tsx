// src/features/admin/shipping-providers/scheme/dest-adjustments/components/DestAdjustmentsTable.tsx
import React, { useMemo } from "react";
import type { PricingSchemeDestAdjustment } from "../../../api/types";
import { displayCity, displayProvince } from "../utils/display";

function safeText(v: unknown): string {
  return typeof v === "string" ? v : v == null ? "" : String(v);
}

export const DestAdjustmentsTable: React.FC<{
  list: PricingSchemeDestAdjustment[];
  disabled: boolean;
  busy: boolean;
  onEdit: (x: PricingSchemeDestAdjustment) => void;
  onToggle: (x: PricingSchemeDestAdjustment) => Promise<void>;
  onDelete: (x: PricingSchemeDestAdjustment) => Promise<void>;
}> = (p) => {
  const rows = useMemo(() => {
    const arr = Array.isArray(p.list) ? [...p.list] : [];
    arr.sort((a, b) => {
      const aa = Boolean(a.active);
      const bb = Boolean(b.active);
      if (aa !== bb) return aa ? -1 : 1;
      return Number(a.id) - Number(b.id);
    });
    return arr;
  }, [p.list]);

  return (
    <div className="mt-4 rounded-2xl border border-slate-200 bg-white p-4">
      <div className="text-sm font-semibold text-slate-800">当前列表</div>

      {rows.length ? (
        <div className="mt-3 overflow-x-auto">
          <table className="min-w-full border-collapse">
            <thead>
              <tr className="border-b border-slate-200 text-left text-sm font-semibold text-slate-700">
                <th className="px-3 py-2 w-[90px]">ID</th>
                <th className="px-3 py-2 w-[90px]">范围</th>
                <th className="px-3 py-2 w-[260px]">省份</th>
                <th className="px-3 py-2 w-[260px]">城市</th>
                <th className="px-3 py-2 w-[140px]">金额（元）</th>
                <th className="px-3 py-2 w-[120px]">状态</th>
                <th className="px-3 py-2 w-[320px]">操作</th>
              </tr>
            </thead>
            <tbody>
              {rows.map((x) => {
                const editDisabled = p.disabled || p.busy || !!x.active;
                const editTitle = x.active ? "启用状态不可编辑：请先停用" : "回填到上方表单编辑金额（保存不改变启用状态）";

                return (
                  <tr key={x.id} className="border-b border-slate-100 align-top text-sm">
                    <td className="px-3 py-2 font-mono text-slate-900">{x.id}</td>
                    <td className="px-3 py-2">{x.scope === "city" ? "市" : "省"}</td>

                    <td className="px-3 py-2 text-slate-900">
                      <div>{displayProvince(x)}</div>
                      <div className="mt-0.5 text-xs font-mono text-slate-500">{x.province_code ? safeText(x.province_code) : "—"}</div>
                    </td>

                    <td className="px-3 py-2 text-slate-900">
                      <div>{x.scope === "city" ? displayCity(x) || "—" : "—"}</div>
                      <div className="mt-0.5 text-xs font-mono text-slate-500">{x.city_code ? safeText(x.city_code) : "—"}</div>
                    </td>

                    <td className="px-3 py-2 font-mono text-slate-900">{x.amount}</td>

                    <td className="px-3 py-2">
                      {x.active ? (
                        <span className="rounded-xl bg-emerald-50 px-3 py-1 text-sm font-semibold text-emerald-700">启用</span>
                      ) : (
                        <span className="rounded-xl bg-slate-100 px-3 py-1 text-sm font-semibold text-slate-600">停用</span>
                      )}
                    </td>

                    <td className="px-3 py-2">
                      <div className="flex flex-wrap gap-2">
                        <button
                          type="button"
                          className="rounded-xl border border-slate-300 bg-white px-3 py-1.5 text-sm font-semibold text-slate-700 hover:bg-slate-50 disabled:opacity-60"
                          disabled={editDisabled}
                          onClick={() => p.onEdit(x)}
                          title={editTitle}
                        >
                          编辑
                        </button>

                        <button
                          type="button"
                          className="rounded-xl border border-slate-300 bg-white px-3 py-1.5 text-sm font-semibold text-slate-700 hover:bg-slate-50 disabled:opacity-60"
                          disabled={p.disabled || p.busy}
                          onClick={() => void p.onToggle(x)}
                        >
                          {x.active ? "停用" : "启用"}
                        </button>

                        <button
                          type="button"
                          className="rounded-xl border border-red-200 bg-white px-3 py-1.5 text-sm font-semibold text-red-700 hover:bg-red-50 disabled:opacity-60"
                          disabled={p.disabled || p.busy || x.active}
                          title={x.active ? "请先停用再删除" : "删除后端事实行"}
                          onClick={() => void p.onDelete(x)}
                        >
                          删除
                        </button>
                      </div>
                      <div className="mt-1 text-xs text-slate-500">{safeText(x.updated_at)}</div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      ) : (
        <div className="mt-2 text-sm font-mono text-slate-600">—</div>
      )}
    </div>
  );
};

export default DestAdjustmentsTable;
