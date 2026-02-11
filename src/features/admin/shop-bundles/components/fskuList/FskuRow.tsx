import React from "react";
import type { Fsku } from "../../types";
import { cls } from "../../ui";

export const FskuRow: React.FC<{
  fsku: Fsku;
  active: boolean;
  isRetired: boolean;
  lines: string[];
  pill: { label: string; clsName: string; code: string };

  isEditing: boolean;
  isSaving: boolean;

  editingName: string;
  setEditingName: (v: string) => void;

  onClickRow: () => void;
  onStartEdit: () => void;
  onCancelEdit: () => void;
  onSaveEdit: () => void;
  onRetire: () => void;

  shapeLabel: string;
}> = (p) => {
  const {
    fsku,
    active,
    isRetired,
    lines,
    pill,
    isEditing,
    isSaving,
    editingName,
    setEditingName,
    onClickRow,
    onStartEdit,
    onCancelEdit,
    onSaveEdit,
    onRetire,
    shapeLabel,
  } = p;

  return (
    <tr
      className={cls(
        "border-b border-slate-100 cursor-pointer hover:bg-slate-50",
        active && "bg-slate-50",
        isRetired && "opacity-60",
      )}
      onClick={onClickRow}
    >
      <td className="px-3 py-2 font-mono text-[11px] truncate" title={fsku.code}>
        {fsku.code}
      </td>

      <td className="px-3 py-2" onClick={(e) => isEditing && e.stopPropagation()}>
        {isEditing ? (
          <input
            className="w-full rounded-md border border-slate-300 px-2 py-1 text-sm"
            value={editingName}
            onChange={(e) => setEditingName(e.target.value)}
            autoFocus
            onKeyDown={(e) => {
              if (e.key === "Enter") {
                e.preventDefault();
                onSaveEdit();
              } else if (e.key === "Escape") {
                e.preventDefault();
                onCancelEdit();
              }
            }}
          />
        ) : (
          <div className="truncate" title={fsku.name}>
            {fsku.name}
          </div>
        )}
      </td>

      <td className="px-3 py-2">{shapeLabel}</td>

      <td className="px-3 py-2">
        {lines.length ? (
          <div className="space-y-0.5">
            {lines.map((ln) => (
              <div key={`${fsku.id}-${ln}`} className="leading-5 break-words">
                {ln}
              </div>
            ))}
          </div>
        ) : (
          <div className="text-slate-400">—</div>
        )}
      </td>

      <td className="px-3 py-2">
        <span className={cls("inline-flex items-center rounded-full border px-2 py-0.5 text-[11px] font-medium", pill.clsName)}>
          {pill.label}
        </span>
        <span className="ml-2 font-mono text-[11px] text-slate-400">{pill.code}</span>
      </td>

      <td className="px-3 py-2" onClick={(e) => e.stopPropagation()}>
        <div className="flex items-center gap-2">
          {isEditing ? (
            <>
              <button
                className={cls(
                  "rounded-md border px-2 py-1 text-[11px]",
                  "border-emerald-200 bg-emerald-50 text-emerald-700 hover:bg-emerald-100",
                  isSaving && "opacity-60 cursor-not-allowed",
                )}
                disabled={isSaving}
                onClick={onSaveEdit}
              >
                {isSaving ? "保存中…" : "保存"}
              </button>
              <button
                className="rounded-md border border-slate-200 bg-slate-50 px-2 py-1 text-[11px] text-slate-700 hover:bg-slate-100"
                disabled={isSaving}
                onClick={onCancelEdit}
              >
                取消
              </button>
            </>
          ) : (
            <button
              className={cls(
                "rounded-md border px-2 py-1 text-[11px]",
                fsku.status === "retired"
                  ? "border-slate-200 bg-slate-50 text-slate-400 cursor-not-allowed"
                  : "border-slate-200 bg-white text-slate-700 hover:bg-slate-50",
              )}
              disabled={fsku.status === "retired"}
              onClick={onStartEdit}
              title={fsku.status === "retired" ? "归档态只读" : "行内编辑名称"}
            >
              修改名称
            </button>
          )}

          {fsku.status === "published" ? (
            <button className="rounded-md border border-rose-200 bg-rose-50 px-2 py-1 text-[11px] text-rose-700 hover:bg-rose-100" onClick={onRetire}>
              归档
            </button>
          ) : fsku.status === "retired" ? (
            <button className="rounded-md border border-slate-200 bg-slate-50 px-2 py-1 text-[11px] text-slate-500 cursor-not-allowed" disabled title="已归档（不支持取消归档）">
              已归档
            </button>
          ) : (
            <span className="text-slate-400 text-[11px]">—</span>
          )}
        </div>
      </td>
    </tr>
  );
};
