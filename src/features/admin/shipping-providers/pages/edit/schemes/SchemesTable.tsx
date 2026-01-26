// src/features/admin/shipping-providers/pages/edit/schemes/SchemesTable.tsx
import React from "react";
import { UI } from "../../../ui";
import type { PricingScheme } from "../../../api/types";
import { badge } from "./utils";

function isArchived(s: PricingScheme): boolean {
  return s.archived_at != null;
}

export const SchemesTable: React.FC<{
  list: PricingScheme[];
  disabled: boolean;
  batchBusy: boolean;
  rowBusy: number | null;
  archivingId: number | null;

  onOpenWorkbench: (schemeId: number) => void;
  onSetActive: (schemeId: number, active: boolean) => void | Promise<void>;
  onArchiveScheme: (s: PricingScheme) => void | Promise<void>;
  onUnarchiveScheme: (s: PricingScheme) => void | Promise<void>;
}> = ({ list, disabled, batchBusy, rowBusy, archivingId, onOpenWorkbench, onSetActive, onArchiveScheme, onUnarchiveScheme }) => {
  return (
    <div className="mt-4 overflow-auto rounded-xl border border-slate-200 bg-white">
      <table className="min-w-full text-sm">
        <thead className="bg-slate-50">
          <tr className="border-b">
            <th className="px-3 py-2 text-left">ID</th>
            <th className="px-3 py-2 text-left">名称</th>
            <th className="px-3 py-2 text-left">币种</th>
            <th className="px-3 py-2 text-left">优先级</th>
            {/* ✅ 拆分状态：归档状态 / 启用状态 */}
            <th className="px-3 py-2 text-left">归档</th>
            <th className="px-3 py-2 text-left">启用</th>
            <th className="px-3 py-2 text-right">操作</th>
          </tr>
        </thead>

        <tbody>
          {list.map((s) => {
            const archived = isArchived(s);
            const active = Boolean(s.active);

            return (
              <tr key={s.id} className="border-b">
                <td className="px-3 py-2 font-mono">{s.id}</td>
                <td className="px-3 py-2">{s.name}</td>
                <td className="px-3 py-2 font-mono">{s.currency}</td>
                <td className="px-3 py-2 font-mono">{typeof s.priority === "number" ? s.priority : "—"}</td>

                {/* 归档列 */}
                <td className="px-3 py-2">
                  {archived ? (
                    <span className="rounded-full bg-slate-900 px-3 py-1 text-xs font-semibold text-white">已归档</span>
                  ) : (
                    <span className="rounded-full bg-slate-100 px-3 py-1 text-xs font-semibold text-slate-700">未归档</span>
                  )}
                </td>

                {/* 启用列（归档时仍展示启用/停用，但弱化表达） */}
                <td className="px-3 py-2">
                  {archived ? (
                    <span className="rounded-full bg-slate-100 px-3 py-1 text-xs font-semibold text-slate-400" title="已归档：默认不参与生效">
                      {active ? "启用（异常）" : "停用"}
                    </span>
                  ) : (
                    <span className={`rounded-full px-3 py-1 text-xs font-semibold ${badge(active)}`}>{active ? "启用" : "停用"}</span>
                  )}
                </td>

                <td className="px-3 py-2 text-right">
                  <div className="flex justify-end gap-2">
                    <button type="button" className={UI.btnSecondary} onClick={() => onOpenWorkbench(s.id)}>
                      打开工作台
                    </button>

                    {!archived ? (
                      active ? (
                        <button
                          type="button"
                          className={UI.btnSecondary}
                          disabled={disabled || batchBusy || rowBusy === s.id || archivingId === s.id}
                          onClick={() => void onSetActive(s.id, false)}
                        >
                          {rowBusy === s.id ? "停用中…" : "停用"}
                        </button>
                      ) : (
                        <button
                          type="button"
                          className={UI.btnSecondary}
                          disabled={disabled || batchBusy || rowBusy === s.id || archivingId === s.id}
                          onClick={() => void onSetActive(s.id, true)}
                        >
                          {rowBusy === s.id ? "启用中…" : "设为启用"}
                        </button>
                      )
                    ) : (
                      <button type="button" className={UI.btnSecondary} disabled title="已归档：请先取消归档">
                        已归档
                      </button>
                    )}

                    {!archived ? (
                      <button
                        type="button"
                        className={UI.btnSecondary}
                        disabled={disabled || batchBusy || archivingId === s.id || rowBusy === s.id || active}
                        onClick={() => void onArchiveScheme(s)}
                        title={active ? "启用中的方案不允许归档，请先停用" : "归档后默认隐藏，可取消归档"}
                      >
                        {archivingId === s.id ? "归档中…" : "归档"}
                      </button>
                    ) : (
                      <button
                        type="button"
                        className={UI.btnSecondary}
                        disabled={disabled || batchBusy || archivingId === s.id || rowBusy === s.id}
                        onClick={() => void onUnarchiveScheme(s)}
                        title="取消归档（不会自动启用）"
                      >
                        {archivingId === s.id ? "处理中…" : "取消归档"}
                      </button>
                    )}
                  </div>
                </td>
              </tr>
            );
          })}

          {list.length === 0 ? (
            <tr>
              <td className="px-3 py-6 text-center text-sm text-slate-500" colSpan={7}>
                没有匹配的收费标准
              </td>
            </tr>
          ) : null}
        </tbody>
      </table>
    </div>
  );
};
