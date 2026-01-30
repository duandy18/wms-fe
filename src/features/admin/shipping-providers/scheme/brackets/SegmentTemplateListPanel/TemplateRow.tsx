// src/features/admin/shipping-providers/scheme/brackets/SegmentTemplateListPanel/TemplateRow.tsx

import React, { useEffect, useMemo, useRef, useState } from "react";
import type { SegmentTemplateOut } from "../segmentTemplates";
import { isTemplateActive } from "../segmentTemplates";
import { UI } from "../../ui";
import { badgeCls, bindableBadge, displayName, rawStatusOf, statusLabel } from "./helpers";

export const TemplateRow: React.FC<{
  disabled: boolean;
  t: SegmentTemplateOut;

  selected: boolean;
  onSelect: () => void;

  onSetBindable: (templateId: number, bindable: boolean) => void | Promise<void>;
  onRenameTemplate: (templateId: number, name: string) => void | Promise<void>;
  onArchiveTemplate: (templateId: number) => void | Promise<void>;
  onUnarchiveTemplate: (templateId: number) => void | Promise<void>;
}> = ({ disabled, t, selected, onSelect, onSetBindable, onRenameTemplate, onArchiveTemplate, onUnarchiveTemplate }) => {
  const st = statusLabel(t);
  const bindable = isTemplateActive(t); // UI 语义：可绑定区域
  const rawStatus = rawStatusOf(t);

  const isDraft = rawStatus === "draft";
  const isArchived = rawStatus === "archived";
  const isPublished = rawStatus === "published";

  const canToggleBindable = isPublished;
  const bindableMeta = bindableBadge(bindable);

  const bindableBtnText = bindable ? "移除可绑定" : "加入可绑定";
  const bindableBtnTitle = isArchived
    ? "已归档方案不参与可绑定管理"
    : isDraft
      ? "草稿方案不可加入可绑定。请先保存为版本（草稿 → 已保存）"
      : bindable
        ? "从可绑定区域移除：之后新区域将无法选择该模板；已绑定的区域不受影响"
        : "加入可绑定区域：之后该模板可被区域（Zone）选择绑定；不会自动影响任何已绑定区域";

  // 归档策略：已保存且不可绑定 才允许归档；可绑定时必须先移除可绑定
  const canArchive = isPublished && !bindable;
  const cannotArchiveBecauseBindable = isPublished && bindable;
  const canUnarchive = isArchived;

  const archiveBtnTitle = canArchive
    ? "归档该方案（归档后默认隐藏，且不可加入可绑定）"
    : cannotArchiveBecauseBindable
      ? "该方案仍处于“可绑定区域”状态，不能归档。请先移除可绑定后再归档。"
      : "仅“已保存且不可绑定”的方案可归档。";

  // ✅ 改名：允许 draft/published，禁止 archived（避免误导“归档也在活跃维护”）
  const canRename = !isArchived;

  const [renaming, setRenaming] = useState(false);
  const [renameInput, setRenameInput] = useState<string>(t.name ?? "");
  const inputRef = useRef<HTMLInputElement | null>(null);

  useEffect(() => {
    // 外部刷新后同步名称（非编辑态才同步，避免用户输入被覆盖）
    if (renaming) return;
    setRenameInput(t.name ?? "");
  }, [t.name, renaming]);

  useEffect(() => {
    if (!renaming) return;
    const id = window.setTimeout(() => {
      inputRef.current?.focus();
      inputRef.current?.select();
    }, 0);
    return () => window.clearTimeout(id);
  }, [renaming]);

  const trimmedRename = useMemo(() => String(renameInput ?? "").trim(), [renameInput]);
  const canSaveRename = useMemo(() => {
    if (disabled) return false;
    if (!renaming) return false;
    if (!trimmedRename) return false;
    if (trimmedRename === String(t.name ?? "").trim()) return false;
    return true;
  }, [disabled, renaming, trimmedRename, t.name]);

  async function doSaveRename() {
    if (!canSaveRename) return;
    await onRenameTemplate(t.id, trimmedRename);
    setRenaming(false);
  }

  function cancelRename() {
    setRenaming(false);
    setRenameInput(t.name ?? "");
  }

  return (
    <div
      className={[
        "w-full rounded-xl border px-3 py-2",
        selected ? "border-blue-200 bg-blue-50" : "border-slate-200 bg-white hover:bg-slate-50",
        disabled ? "opacity-60" : "",
      ].join(" ")}
    >
      <div className="flex items-start justify-between gap-2">
        <button
          type="button"
          disabled={disabled || renaming}
          onClick={onSelect}
          className="min-w-0 text-left flex-1"
          title={renaming ? "正在改名，先保存或取消" : selected ? "当前已选中" : "点击切换到该方案"}
        >
          <div className="flex items-center gap-2">
            {renaming ? (
              <input
                ref={inputRef}
                className="w-full max-w-[360px] rounded-md border border-slate-300 bg-white px-2 py-1 text-sm text-slate-900"
                value={renameInput}
                onChange={(e) => setRenameInput(e.target.value)}
                placeholder="请输入方案名称"
                onKeyDown={(e) => {
                  if (e.key === "Enter") void doSaveRename();
                  if (e.key === "Escape") cancelRename();
                }}
              />
            ) : (
              <div className="truncate text-sm font-semibold text-slate-900">{displayName(t.name ?? "")}</div>
            )}

            <span className={`inline-flex items-center rounded-full border px-2 py-0.5 text-xs font-semibold ${badgeCls(st.tone)}`}>
              {st.text}
            </span>

            {!isArchived ? (
              <span
                className={`inline-flex items-center rounded-full border px-2 py-0.5 text-xs font-semibold ${bindableMeta.cls}`}
                title="说明：这是“可绑定候选池”标记，不等于正在使用。正在使用取决于 Zone 的绑定事实。"
              >
                {bindableMeta.text}
              </span>
            ) : null}
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
        </button>

        <div className="flex flex-col items-end gap-2">
          {/* ✅ 改名按钮组（行内） */}
          {canRename ? (
            renaming ? (
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  className={UI.btnNeutralSm}
                  disabled={disabled}
                  onClick={cancelRename}
                  title="取消改名（Esc）"
                >
                  取消
                </button>
                <button
                  type="button"
                  className={UI.btnNeutralSm}
                  disabled={!canSaveRename}
                  onClick={() => void doSaveRename()}
                  title={!trimmedRename ? "名称不能为空" : trimmedRename === String(t.name ?? "").trim() ? "名称未变化" : "保存改名（Enter）"}
                >
                  保存
                </button>
              </div>
            ) : (
              <button
                type="button"
                className={UI.btnNeutralSm}
                disabled={disabled}
                onClick={() => setRenaming(true)}
                title="修改方案名称（用于绑定与运营识别，不影响算价事实）"
              >
                改名
              </button>
            )
          ) : null}

          {/* ✅ 可绑定区域（可撤销） */}
          {!isArchived ? (
            <button
              type="button"
              className={UI.btnNeutralSm}
              disabled={disabled || !canToggleBindable}
              onClick={() => void onSetBindable(t.id, !bindable)}
              title={bindableBtnTitle}
            >
              {bindableBtnText}
            </button>
          ) : null}

          {/* ✅ 归档 / 取消归档 */}
          {canArchive ? (
            <button
              type="button"
              className={UI.btnNeutralSm}
              disabled={disabled || renaming}
              onClick={() => void onArchiveTemplate(t.id)}
              title={archiveBtnTitle}
            >
              归档
            </button>
          ) : canUnarchive ? (
            <button
              type="button"
              className={UI.btnNeutralSm}
              disabled={disabled || renaming}
              onClick={() => void onUnarchiveTemplate(t.id)}
              title="取消归档（不会自动加入可绑定）"
            >
              取消归档
            </button>
          ) : cannotArchiveBecauseBindable ? (
            <button type="button" className={UI.btnNeutralSm} disabled={true} title={archiveBtnTitle}>
              归档
            </button>
          ) : null}
        </div>
      </div>
    </div>
  );
};

export default TemplateRow;
