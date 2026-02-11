// admin/shop-bundles/components/FskuListPanel.tsx
import React, { useMemo } from "react";
import type { Fsku } from "../types";
import { cls, shapeLabel } from "../ui";
import { splitSummary, statusPill, type Banner } from "./fskuList/utils";
import { useFskuNameEditor } from "./fskuList/useFskuNameEditor";
import { FskuRow } from "./fskuList/FskuRow";

export const FskuListPanel: React.FC<{
  fskus: Fsku[];
  loading: boolean;
  onRefresh: () => void;

  selectedFskuId: number | null;
  setSelectedFskuId: (v: number | null) => void;

  // ⚠️ 兼容保留：后端已封板（生命周期单向），UI 不再提供“取消归档”
  onRetireSelected: (id: number) => void;
  onUnretireSelected: (id: number) => void;

  onlyUsable: boolean;
  setOnlyUsable: (v: boolean) => void;

  showRetired: boolean;
  setShowRetired: (v: boolean) => void;
}> = (props) => {
  const {
    fskus,
    loading,
    onRefresh,
    selectedFskuId,
    setSelectedFskuId,
    onRetireSelected,
    onlyUsable,
    setOnlyUsable,
    showRetired,
    setShowRetired,
  } = props;

  const fskuById = useMemo(() => {
    const m = new Map<number, Fsku>();
    for (const f of fskus) m.set(f.id, f);
    return m;
  }, [fskus]);

  const editor = useFskuNameEditor({
    fskuById,
    onRefresh,
  });

  const banner: Banner = editor.banner;

  return (
    <section className="rounded-xl border border-slate-200 bg-white p-4 space-y-4">
      <div className="flex items-start justify-between">
        <div className="space-y-1">
          <div className="text-sm font-semibold text-slate-800">① 履约组合库（FSKU）</div>
          <div className="text-[11px] text-slate-500">
            默认只显示“可用”。关闭后可查看草稿；如需回看历史可打开“显示归档”。名称支持在列表行内编辑（归档态只读）。
          </div>
        </div>

        <div className="flex items-center gap-2">
          <button
            type="button"
            className={cls(
              "rounded-md border px-2 py-1 text-[11px] font-medium",
              onlyUsable ? "border-emerald-200 bg-emerald-50 text-emerald-700" : "border-slate-200 bg-slate-50 text-slate-700",
            )}
            onClick={() => {
              const next = !onlyUsable;
              setOnlyUsable(next);
              if (next) setShowRetired(false);
            }}
            title="默认开启：只显示可用（published）"
          >
            只看可用 {onlyUsable ? "ON" : "OFF"}
          </button>

          <button
            type="button"
            className={cls(
              "rounded-md border px-2 py-1 text-[11px] font-medium",
              showRetired ? "border-rose-200 bg-rose-50 text-rose-700" : "border-slate-200 bg-slate-50 text-slate-700",
              onlyUsable && "opacity-50 cursor-not-allowed",
            )}
            disabled={onlyUsable}
            onClick={() => setShowRetired(!showRetired)}
            title={onlyUsable ? "只看可用开启时不展示归档；请先关闭“只看可用”" : "开启后显示归档（retired）"}
          >
            显示归档 {showRetired ? "ON" : "OFF"}
          </button>

          <button
            type="button"
            className="inline-flex items-center rounded-lg border border-slate-300 bg-white px-3 py-2 text-xs font-medium text-slate-700 hover:bg-slate-50 disabled:opacity-60"
            onClick={onRefresh}
            disabled={loading}
          >
            {loading ? "刷新中…" : "刷新列表"}
          </button>
        </div>
      </div>

      {banner ? (
        <div
          className={cls(
            "rounded-lg border px-3 py-2 text-[12px]",
            banner.kind === "success" ? "border-emerald-200 bg-emerald-50 text-emerald-800" : "border-rose-200 bg-rose-50 text-rose-800",
          )}
        >
          {banner.text}
        </div>
      ) : null}

      <div className="rounded-lg border border-slate-200 overflow-x-auto">
        <table className="w-full table-fixed border-collapse text-xs">
          <colgroup>
            <col className="w-[220px]" />
            <col className="w-[360px]" />
            <col className="w-[96px]" />
            <col className="w-auto" />
            <col className="w-[140px]" />
            <col className="w-[160px]" />
          </colgroup>

          <thead className="sticky top-0 bg-white">
            <tr className="border-b border-slate-200 text-[11px] text-slate-600">
              <th className="px-3 py-2 text-left">编码</th>
              <th className="px-3 py-2 text-left">名称</th>
              <th className="px-3 py-2 text-left">形态</th>
              <th className="px-3 py-2 text-left">组合内容摘要</th>
              <th className="px-3 py-2 text-left">状态</th>
              <th className="px-3 py-2 text-left">操作</th>
            </tr>
          </thead>

          <tbody>
            {fskus.map((f) => {
              const active = selectedFskuId === f.id;
              const isRetired = f.status === "retired";
              const lines = splitSummary(f.components_summary);
              const pill = statusPill(f.status);
              const isEditing = editor.editingId === f.id;
              const isSaving = editor.savingId === f.id;

              return (
                <FskuRow
                  key={f.id}
                  fsku={f}
                  active={active}
                  isRetired={isRetired}
                  lines={lines}
                  pill={pill}
                  isEditing={isEditing}
                  isSaving={isSaving}
                  editingName={editor.editingName}
                  setEditingName={editor.setEditingName}
                  onClickRow={() => setSelectedFskuId(f.id)}
                  onStartEdit={() => editor.startEdit(f.id)}
                  onCancelEdit={() => editor.cancelEdit()}
                  onSaveEdit={() => void editor.saveEdit(f.id)}
                  onRetire={() => onRetireSelected(f.id)}
                  shapeLabel={shapeLabel(f.shape)}
                />
              );
            })}
          </tbody>
        </table>

        {!fskus.length ? <div className="px-3 py-3 text-[12px] text-slate-500">当前筛选下暂无数据。</div> : null}
      </div>
    </section>
  );
};
