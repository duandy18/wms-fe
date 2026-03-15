// src/features/tms/providers/pages/edit/WarehouseBindingsCard.tsx
import React, { useEffect, useMemo, useState } from "react";

import type { WarehouseListItem } from "../../../../admin/warehouses/types";
import { UI } from "../../ui";
import { useProviderBindings, type ProviderBindingViewRow } from "./useProviderBindings";

type DraftRow = {
  active: boolean;
  priority: string;
  pickup_cutoff_time: string;
  remark: string;
};

function toDraftRow(row: ProviderBindingViewRow): DraftRow {
  return {
    active: row.active,
    priority: String(row.priority ?? 100),
    pickup_cutoff_time: row.pickup_cutoff_time ?? "",
    remark: row.remark ?? "",
  };
}

export const WarehouseBindingsCard: React.FC<{
  canWrite: boolean;
  busy: boolean;
  providerId: number | null;
  warehouses: WarehouseListItem[];
}> = ({ canWrite, busy, providerId, warehouses }) => {
  const m = useProviderBindings({ providerId, warehouses });

  const [drafts, setDrafts] = useState<Record<number, DraftRow>>({});

  useEffect(() => {
    const next: Record<number, DraftRow> = {};
    for (const row of m.rows) {
      next[row.warehouse_id] = toDraftRow(row);
    }
    setDrafts(next);
  }, [m.rows]);

  const disabled = busy || !canWrite || !providerId;
  const hasRows = m.rows.length > 0;

  const activeRows = useMemo(() => m.rows.filter((x) => x.bound && x.active), [m.rows]);

  function patchDraft(warehouseId: number, patch: Partial<DraftRow>) {
    setDrafts((prev) => {
      const base = prev[warehouseId] ?? {
        active: true,
        priority: "100",
        pickup_cutoff_time: "",
        remark: "",
      };
      return {
        ...prev,
        [warehouseId]: {
          ...base,
          ...patch,
        },
      };
    });
  }

  async function onSaveRow(row: ProviderBindingViewRow) {
    const draft = drafts[row.warehouse_id] ?? toDraftRow(row);
    const priorityNum = Number(draft.priority);

    if (!Number.isFinite(priorityNum) || priorityNum < 0) {
      window.alert(`仓库「${row.warehouse_label}」的优先级必须是大于等于 0 的数字`);
      return;
    }

    await m.saveBinding(row.warehouse_id, {
      active: draft.active,
      priority: priorityNum,
      pickup_cutoff_time: draft.pickup_cutoff_time.trim() || null,
      remark: draft.remark.trim() || null,
    });
  }

  async function onBindRow(row: ProviderBindingViewRow) {
    const draft = drafts[row.warehouse_id] ?? toDraftRow(row);
    const priorityNum = Number(draft.priority);

    if (!Number.isFinite(priorityNum) || priorityNum < 0) {
      window.alert(`仓库「${row.warehouse_label}」的优先级必须是大于等于 0 的数字`);
      return;
    }

    await m.bindWarehouse(row.warehouse_id, {
      active: draft.active,
      priority: priorityNum,
      pickup_cutoff_time: draft.pickup_cutoff_time.trim() || null,
      remark: draft.remark.trim() || null,
    });
  }

  async function onRemoveRow(row: ProviderBindingViewRow) {
    const ok = window.confirm(`确定解除与仓库「${row.warehouse_label}」的绑定吗？`);
    if (!ok) return;
    await m.removeBinding(row.warehouse_id);
  }

  return (
    <section className={UI.card}>
      <div className="flex items-start justify-between gap-3">
        <div>
          <div className={`${UI.h2} font-semibold text-slate-900`}>可服务仓库</div>
          <div className="mt-2 text-sm text-slate-700">
            当前配置 <span className="font-semibold">{m.boundCount}</span> 个仓库，启用中{" "}
            <span className="font-semibold">{m.activeCount}</span> 个。
          </div>
        </div>

        <button type="button" className={UI.btnSecondary} disabled={m.loading} onClick={() => void m.refresh()}>
          刷新
        </button>
      </div>

      {!providerId ? (
        <div className="mt-4 rounded-lg border border-slate-200 bg-slate-50 px-3 py-2 text-sm text-slate-600">
          请先保存网点基础信息，再维护可服务仓库。
        </div>
      ) : null}

      {m.error ? <div className={`mt-3 ${UI.error}`}>{m.error}</div> : null}
      {m.ok ? (
        <div className="mt-3 rounded-lg border border-emerald-200 bg-emerald-50 px-3 py-2 text-sm text-emerald-800">
          {m.ok}
        </div>
      ) : null}

      {activeRows.length > 0 ? (
        <div className="mt-4 rounded-xl border border-sky-200 bg-sky-50 px-3 py-2 text-sm text-sky-900">
          运价方案只能创建在“已绑定且启用”的仓库上。当前可用仓库：{" "}
          {activeRows.map((x) => x.warehouse_label).join("、")}
        </div>
      ) : providerId ? (
        <div className="mt-4 rounded-xl border border-amber-200 bg-amber-50 px-3 py-2 text-sm text-amber-900">
          当前没有任何“已绑定且启用”的仓库，所以创建收费标准时会返回 409。这个不是闹鬼，是合同在说实话。
        </div>
      ) : null}

      {!hasRows ? (
        <div className="mt-4 text-sm text-slate-500">{m.loading ? "加载中…" : "暂无仓库数据"}</div>
      ) : (
        <div className="mt-4 overflow-auto rounded-xl border border-slate-200 bg-white">
          <table className="min-w-full text-sm">
            <thead className="bg-slate-50">
              <tr className="border-b">
                <th className="px-3 py-2 text-left">仓库</th>
                <th className="px-3 py-2 text-left">绑定</th>
                <th className="px-3 py-2 text-left">启用</th>
                <th className="px-3 py-2 text-left">优先级</th>
                <th className="px-3 py-2 text-left">截单时间</th>
                <th className="px-3 py-2 text-left">备注</th>
                <th className="px-3 py-2 text-right">操作</th>
              </tr>
            </thead>
            <tbody>
              {m.rows.map((row) => {
                const draft = drafts[row.warehouse_id] ?? toDraftRow(row);
                const rowBusy = m.savingWarehouseId === row.warehouse_id;

                return (
                  <tr key={row.warehouse_id} className="border-b align-top">
                    <td className="px-3 py-3">
                      <div className="font-medium text-slate-900">{row.warehouse_label}</div>
                      <div className="mt-1 text-xs font-mono text-slate-500">warehouse_id={row.warehouse_id}</div>
                    </td>

                    <td className="px-3 py-3">
                      {row.bound ? (
                        <span className="rounded-full bg-emerald-100 px-3 py-1 text-xs font-semibold text-emerald-800">
                          已绑定
                        </span>
                      ) : (
                        <span className="rounded-full bg-slate-100 px-3 py-1 text-xs font-semibold text-slate-600">
                          未绑定
                        </span>
                      )}
                    </td>

                    <td className="px-3 py-3">
                      <label className="flex items-center gap-2 text-sm text-slate-700">
                        <input
                          type="checkbox"
                          checked={draft.active}
                          disabled={disabled || rowBusy}
                          onChange={(e) => patchDraft(row.warehouse_id, { active: e.target.checked })}
                        />
                        {draft.active ? "启用" : "停用"}
                      </label>
                    </td>

                    <td className="px-3 py-3">
                      <input
                        className={UI.inputMono}
                        value={draft.priority}
                        disabled={disabled || rowBusy}
                        onChange={(e) => patchDraft(row.warehouse_id, { priority: e.target.value })}
                      />
                    </td>

                    <td className="px-3 py-3">
                      <input
                        className={UI.inputMono}
                        value={draft.pickup_cutoff_time}
                        disabled={disabled || rowBusy}
                        placeholder="例如 18:00"
                        onChange={(e) => patchDraft(row.warehouse_id, { pickup_cutoff_time: e.target.value })}
                      />
                    </td>

                    <td className="px-3 py-3">
                      <input
                        className={UI.input}
                        value={draft.remark}
                        disabled={disabled || rowBusy}
                        placeholder="可选备注"
                        onChange={(e) => patchDraft(row.warehouse_id, { remark: e.target.value })}
                      />
                    </td>

                    <td className="px-3 py-3 text-right">
                      <div className="flex justify-end gap-2">
                        {!row.bound ? (
                          <button
                            type="button"
                            className={UI.btnPrimaryGreen}
                            disabled={disabled || rowBusy}
                            onClick={() => void onBindRow(row)}
                          >
                            {rowBusy ? "绑定中…" : "绑定并保存"}
                          </button>
                        ) : (
                          <>
                            <button
                              type="button"
                              className={UI.btnSecondary}
                              disabled={disabled || rowBusy}
                              onClick={() => void onSaveRow(row)}
                            >
                              {rowBusy ? "保存中…" : "保存"}
                            </button>
                            <button
                              type="button"
                              className="rounded-lg border border-red-300 bg-red-50 px-3 py-2 text-sm font-semibold text-red-700 hover:bg-red-100 disabled:cursor-not-allowed disabled:opacity-60"
                              disabled={disabled || rowBusy}
                              onClick={() => void onRemoveRow(row)}
                            >
                              解绑
                            </button>
                          </>
                        )}
                      </div>
                    </td>
                  </tr>
                );
              })}

              {m.rows.length === 0 ? (
                <tr>
                  <td colSpan={7} className="px-3 py-6 text-center text-sm text-slate-500">
                    暂无可服务仓库数据
                  </td>
                </tr>
              ) : null}
            </tbody>
          </table>
        </div>
      )}
    </section>
  );
};

export default WarehouseBindingsCard;
