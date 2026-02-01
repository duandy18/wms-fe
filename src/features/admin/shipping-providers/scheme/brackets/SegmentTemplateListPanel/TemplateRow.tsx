// src/features/admin/shipping-providers/scheme/brackets/SegmentTemplateListPanel/TemplateRow.tsx

import React, { useMemo } from "react";
import type { SegmentTemplateOut } from "../segmentTemplates";
import { UI } from "../../ui";
import { badgeCls, displayName, rawStatusOf, statusLabel } from "./helpers";

export const TemplateRow: React.FC<{
  disabled: boolean;
  t: SegmentTemplateOut;

  selected: boolean;
  onSelect: () => void;

  // ✅ 使用事实：被 Zone 引用数量
  inUseCount: number;

  onArchiveTemplate: (templateId: number) => void | Promise<void>;
  onUnarchiveTemplate: (templateId: number) => void | Promise<void>;
}> = ({ disabled, t, selected, onSelect, inUseCount, onArchiveTemplate, onUnarchiveTemplate }) => {
  const st = statusLabel(t);
  const rawStatus = rawStatusOf(t);

  const isDraft = rawStatus === "draft";
  const isArchived = rawStatus === "archived";
  const isPublished = rawStatus === "published";

  // ✅ 使用中是“稳定事实态”，不是错误态 → 用绿色
  const inUseBadge = useMemo(() => {
    if (inUseCount <= 0) {
      return { text: "未使用", cls: "border-slate-200 bg-white text-slate-600" };
    }
    return { text: `使用中(${inUseCount})`, cls: "border-emerald-200 bg-emerald-50 text-emerald-700" };
  }, [inUseCount]);

  // ✅ 归档：后端已有“使用中禁止归档(409)”护栏，这里前端也禁用防误触
  const canArchive = isPublished && inUseCount === 0;
  const canUnarchive = isArchived;

  const archiveBtnTitle = !isPublished
    ? "仅“已保存”的模板允许归档"
    : inUseCount > 0
      ? "该模板正在被区域使用，禁止归档（请先解绑相关区域）"
      : "归档该模板（归档后隐藏，且不可再被区域绑定）";

  const rowTitle = useMemo(() => displayName(t.name ?? ""), [t.name]);

  return (
    <div
      className={[
        "w-full rounded-xl border px-3 py-2",
        selected ? "border-blue-200 bg-blue-50" : "border-slate-200 bg-white hover:bg-slate-50",
        disabled ? "opacity-60" : "",
      ].join(" ")}
    >
      <div className="flex items-start justify-between gap-3">
        <button
          type="button"
          disabled={disabled}
          onClick={onSelect}
          className="min-w-0 text-left flex-1"
          title={selected ? "当前已选中" : "点击切换到该方案"}
        >
          <div className="flex flex-wrap items-center gap-2">
            <div className="truncate text-sm font-semibold text-slate-900">{rowTitle}</div>

            <span className={`inline-flex items-center rounded-full border px-2 py-0.5 text-xs font-semibold ${badgeCls(st.tone)}`}>
              {st.text}
            </span>

            <span
              className={`inline-flex items-center rounded-full border px-2 py-0.5 text-xs font-semibold ${inUseBadge.cls}`}
              title={inUseCount > 0 ? "该模板已被区域绑定，结构已锁定" : "该模板未被任何区域绑定，可修改结构"}
            >
              {inUseBadge.text}
            </span>
          </div>

          <div className="mt-1 text-xs text-slate-500">
            ID: <span className="font-mono">{t.id}</span>
            {t.items?.length != null ? (
              <>
                {" "}
                · 段数: <span className="font-mono">{t.items.length}</span>
              </>
            ) : null}
          </div>

          {isDraft ? <div className="mt-1 text-xs text-slate-500">草稿可直接编辑与保存。</div> : null}
        </button>

        <div className="flex flex-wrap items-center justify-end gap-2">
          {canArchive ? (
            <button
              type="button"
              className={UI.btnNeutralSm}
              disabled={disabled}
              onClick={() => void onArchiveTemplate(t.id)}
              title={archiveBtnTitle}
            >
              归档
            </button>
          ) : canUnarchive ? (
            <button
              type="button"
              className={UI.btnNeutralSm}
              disabled={disabled}
              onClick={() => void onUnarchiveTemplate(t.id)}
              title="取消归档（不会自动绑定任何区域）"
            >
              取消归档
            </button>
          ) : (
            <button type="button" className={UI.btnNeutralSm} disabled={true} title={archiveBtnTitle}>
              归档
            </button>
          )}
        </div>
      </div>
    </div>
  );
};

export default TemplateRow;
