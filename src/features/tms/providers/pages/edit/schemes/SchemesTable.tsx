// src/features/tms/providers/pages/edit/schemes/SchemesTable.tsx
import React, { useMemo, useState } from "react";
import { UI } from "../../../ui";
import type { PricingScheme } from "../../../api/types";

function isArchived(s: PricingScheme): boolean {
  return s.archived_at != null || s.status === "archived";
}

function getSchemeStatusLabel(s: PricingScheme): {
  text: string;
  className: string;
} {
  if (isArchived(s)) {
    return {
      text: "已归档",
      className: "bg-slate-900 text-white",
    };
  }

  if (s.status === "active") {
    return {
      text: "生效中",
      className: "bg-emerald-100 text-emerald-800",
    };
  }

  return {
    text: "草稿",
    className: "bg-amber-100 text-amber-800",
  };
}

function formatDateTime(v?: string | null): string {
  if (!v) return "—";
  const ts = Date.parse(v);
  if (!Number.isFinite(ts)) return v;
  return new Intl.DateTimeFormat("zh-CN", {
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
  }).format(new Date(ts));
}

export const SchemesTable: React.FC<{
  list: PricingScheme[];
  disabled: boolean;
  batchBusy: boolean;
  rowBusy: number | null;
  archivingId: number | null;

  onOpenWorkbench: (schemeId: number) => void;
  onRenameScheme: (s: PricingScheme, nextName: string) => void | Promise<void>;
  onPublishScheme: (s: PricingScheme) => void | Promise<void>;
  onCloneScheme: (s: PricingScheme) => void | Promise<void>;
}> = ({
  list,
  disabled,
  batchBusy,
  rowBusy,
  archivingId,
  onOpenWorkbench,
  onRenameScheme,
  onPublishScheme,
  onCloneScheme,
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
            <th className="px-3 py-2 text-left">生效时间</th>
            <th className="px-3 py-2 text-left">优先级</th>
            <th className="px-3 py-2 text-left">状态</th>
            <th className="px-3 py-2 text-right">操作</th>
          </tr>
        </thead>

        <tbody>
          {list.map((s) => {
            const archived = isArchived(s);
            const isDraft = !archived && (s.status ?? "draft") === "draft";
            const isActive = !archived && s.status === "active";
            const busyRow = disabled || batchBusy || isRowBusy(s.id);
            const editing = editingId === s.id;
            const statusBadge = getSchemeStatusLabel(s);

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

                <td className="px-3 py-2 font-mono">{s.currency ?? "—"}</td>
                <td className="px-3 py-2 font-mono">{formatDateTime(s.effective_from)}</td>
                <td className="px-3 py-2 font-mono">{typeof s.priority === "number" ? s.priority : "—"}</td>

                <td className="px-3 py-2">
                  <span className={`rounded-full px-3 py-1 text-xs font-semibold ${statusBadge.className}`}>
                    {statusBadge.text}
                  </span>
                </td>

                <td className="px-3 py-2 text-right">
                  <div className="flex justify-end gap-2">
                    <button
                      type="button"
                      className={UI.btnSecondary}
                      disabled={editing}
                      onClick={() => onOpenWorkbench(s.id)}
                    >
                      编辑方案
                    </button>

                    {!editing ? (
                      isDraft ? (
                        <button
                          type="button"
                          className={UI.btnSecondary}
                          disabled={busyRow}
                          onClick={() => startEdit(s)}
                          title="仅草稿允许改名"
                        >
                          {rowBusy === s.id ? "处理中…" : "改名"}
                        </button>
                      ) : (
                        <button
                          type="button"
                          className={UI.btnSecondary}
                          disabled
                          title="仅草稿允许改名"
                        >
                          改名
                        </button>
                      )
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

                    {isDraft ? (
                      <button
                        type="button"
                        className={UI.btnPrimaryGreen}
                        disabled={busyRow || editing}
                        onClick={() => void onPublishScheme(s)}
                        title="发布后将成为当前网点的生效方案；后端会自动归档同仓同承运商下其他 active 方案"
                      >
                        {rowBusy === s.id ? "发布中…" : "发布"}
                      </button>
                    ) : null}

                    {(isActive || archived) ? (
                      <button
                        type="button"
                        className={UI.btnSecondary}
                        disabled={busyRow || editing}
                        onClick={() => void onCloneScheme(s)}
                        title="将当前方案完整复制为新的 draft"
                      >
                        {rowBusy === s.id ? "复制中…" : "复制方案"}
                      </button>
                    ) : null}
                  </div>
                </td>
              </tr>
            );
          })}

          {list.length === 0 ? (
            <tr>
              <td className="px-3 py-6 text-center text-sm text-slate-500" colSpan={7}>
                没有匹配的运价方案
              </td>
            </tr>
          ) : null}
        </tbody>
      </table>
    </div>
  );
};

export default SchemesTable;
