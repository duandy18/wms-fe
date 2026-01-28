// src/features/admin/shipping-providers/pages/edit/schemes/SchemesTable.tsx
import React, { useMemo, useState } from "react";
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
  onRenameScheme: (s: PricingScheme, nextName: string) => void | Promise<void>;
  onArchiveScheme: (s: PricingScheme) => void | Promise<void>;
  onUnarchiveScheme: (s: PricingScheme) => void | Promise<void>;
}> = ({
  list,
  disabled,
  batchBusy,
  rowBusy,
  archivingId,
  onOpenWorkbench,
  onSetActive,
  onRenameScheme,
  onArchiveScheme,
  onUnarchiveScheme,
}) => {
  const [editingId, setEditingId] = useState<number | null>(null);
  const [draftName, setDraftName] = useState<string>("");

  const editingScheme = useMemo(() => {
    if (!editingId) return null;
    return list.find((x) => x.id === editingId) ?? null;
  }, [editingId, list]);

  function startEdit(s: PricingScheme) {
    setEditingId(s.id);
    setDraftName((s.name ?? "").trim());
  }

  function cancelEdit() {
    setEditingId(null);
    setDraftName("");
  }

  async function saveEdit() {
    if (!editingScheme) return;
    const next = (draftName ?? "").trim();
    await onRenameScheme(editingScheme, next);
    // 成功后 model 会 refresh 列表；这里直接退出编辑态
    cancelEdit();
  }

  function isRowBusy(id: number) {
    return rowBusy === id || archivingId === id;
  }

  return (
    <div className="mt-4 overflow-auto rounded-xl border border-slate-200 bg-white">
      <table className="min-w-full text-sm">
        <thead className="bg-slate-50">
          <tr className="border-b">
            <th className="px-3 py-2 text-left">ID</th>
            <th className="px-3 py-2 text-left">名称</th>
            <th className="px-3 py-2 text-left">币种</th>
            <th className="px-3 py-2 text-left">优先级</th>
            <th className="px-3 py-2 text-left">归档</th>
            <th className="px-3 py-2 text-left">生效</th>
            <th className="px-3 py-2 text-right">操作</th>
          </tr>
        </thead>

        <tbody>
          {list.map((s) => {
            const archived = isArchived(s);
            const active = Boolean(s.active);
            const busyRow = disabled || batchBusy || isRowBusy(s.id);
            const editing = editingId === s.id;

            return (
              <tr key={s.id} className="border-b">
                <td className="px-3 py-2 font-mono">{s.id}</td>

                <td className="px-3 py-2">
                  {!editing ? (
                    <div className="flex items-center gap-2">
                      <div className="min-w-0 truncate">{s.name}</div>
                    </div>
                  ) : (
                    <input
                      className={`${UI.input} h-9`}
                      value={draftName}
                      disabled={busyRow}
                      onChange={(e) => setDraftName(e.target.value)}
                      placeholder="请输入新名称"
                      autoFocus
                    />
                  )}
                </td>

                <td className="px-3 py-2 font-mono">{s.currency}</td>
                <td className="px-3 py-2 font-mono">{typeof s.priority === "number" ? s.priority : "—"}</td>

                <td className="px-3 py-2">
                  {archived ? (
                    <span className="rounded-full bg-slate-900 px-3 py-1 text-xs font-semibold text-white">已归档</span>
                  ) : (
                    <span className="rounded-full bg-slate-100 px-3 py-1 text-xs font-semibold text-slate-700">未归档</span>
                  )}
                </td>

                <td className="px-3 py-2">
                  {archived ? (
                    <span className="rounded-full bg-slate-100 px-3 py-1 text-xs font-semibold text-slate-400" title="已归档：默认不参与生效">
                      {active ? "生效（异常）" : "未生效"}
                    </span>
                  ) : (
                    <span className={`rounded-full px-3 py-1 text-xs font-semibold ${badge(active)}`}>{active ? "生效" : "未生效"}</span>
                  )}
                </td>

                <td className="px-3 py-2 text-right">
                  <div className="flex justify-end gap-2">
                    <button type="button" className={UI.btnSecondary} disabled={editing} onClick={() => onOpenWorkbench(s.id)}>
                      打开工作台
                    </button>

                    {!editing ? (
                      <button
                        type="button"
                        className={UI.btnSecondary}
                        disabled={busyRow}
                        onClick={() => startEdit(s)}
                        title="行内编辑名称（不影响生效状态）"
                      >
                        {rowBusy === s.id ? "处理中…" : "改名"}
                      </button>
                    ) : (
                      <>
                        <button type="button" className={UI.btnSecondary} disabled={busyRow} onClick={cancelEdit}>
                          取消
                        </button>
                        <button type="button" className={UI.btnPrimaryGreen} disabled={busyRow} onClick={() => void saveEdit()}>
                          {rowBusy === s.id ? "保存中…" : "保存"}
                        </button>
                      </>
                    )}

                    {!archived ? (
                      active ? (
                        <button
                          type="button"
                          className={UI.btnSecondary}
                          disabled={busyRow || editing}
                          onClick={() => void onSetActive(s.id, false)}
                        >
                          {rowBusy === s.id ? "处理中…" : "取消生效"}
                        </button>
                      ) : (
                        <button
                          type="button"
                          className={UI.btnSecondary}
                          disabled={busyRow || editing}
                          onClick={() => void onSetActive(s.id, true)}
                        >
                          {rowBusy === s.id ? "处理中…" : "设为生效"}
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
                        disabled={busyRow || active || editing}
                        onClick={() => void onArchiveScheme(s)}
                        title={active ? "生效中的方案不允许归档，请先取消生效" : "归档后默认隐藏，可取消归档"}
                      >
                        {archivingId === s.id ? "归档中…" : "归档"}
                      </button>
                    ) : (
                      <button
                        type="button"
                        className={UI.btnSecondary}
                        disabled={busyRow || editing}
                        onClick={() => void onUnarchiveScheme(s)}
                        title="取消归档（不会自动设为生效）"
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
