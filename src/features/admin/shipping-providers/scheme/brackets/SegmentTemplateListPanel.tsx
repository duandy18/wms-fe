// src/features/admin/shipping-providers/scheme/brackets/SegmentTemplateListPanel.tsx
//
// 方案列表（左侧）
// - 一眼可见：草稿 / 已保存 / 已归档
// - 点击行：切换当前选中方案（右侧进入编辑/启用）
// - 新建：内联输入名称（不弹窗、不打断；创建后自动选中）
// - 归档：已保存且未生效允许归档；默认隐藏已归档，可切换显示
//
// ✅ 本次收敛：is_active 改为「可绑定区域」（候选池，可撤销）

import React, { useEffect, useMemo, useRef, useState } from "react";
import type { SegmentTemplateOut } from "./segmentTemplates";
import { UI } from "../ui";

import FiltersBar from "./SegmentTemplateListPanel/FiltersBar";
import TemplateRow from "./SegmentTemplateListPanel/TemplateRow";
import { buildVisibleTemplates, countArchived, countBindable, yyyyMmDd } from "./SegmentTemplateListPanel/helpers";

export const SegmentTemplateListPanel: React.FC<{
  disabled: boolean;
  templates: SegmentTemplateOut[];
  selectedTemplateId: number | null;
  onSelectTemplateId: (id: number | null) => void;

  onCreateDraftNamed: (name: string) => void | Promise<void>;

  // ✅ 可绑定区域（is_active）切换：true=加入，false=移除（可撤销）
  onSetBindable: (templateId: number, bindable: boolean) => void | Promise<void>;

  // ✅ 改名（用于运营识别，不影响算价事实）
  onRenameTemplate: (templateId: number, name: string) => void | Promise<void>;

  onArchiveTemplate: (templateId: number) => void | Promise<void>;
  onUnarchiveTemplate: (templateId: number) => void | Promise<void>;
}> = ({
  disabled,
  templates,
  selectedTemplateId,
  onSelectTemplateId,
  onCreateDraftNamed,
  onSetBindable,
  onRenameTemplate,
  onArchiveTemplate,
  onUnarchiveTemplate,
}) => {
  const [creating, setCreating] = useState(false);
  const [nameInput, setNameInput] = useState("");
  const inputRef = useRef<HTMLInputElement | null>(null);

  const [showArchived, setShowArchived] = useState(false);
  const [showBindableOnly, setShowBindableOnly] = useState(false);

  const defaultName = useMemo(() => `${yyyyMmDd(new Date())} 方案`, []);

  useEffect(() => {
    if (!creating) return;
    setNameInput((prev) => (prev.trim() ? prev : defaultName));
    const t = window.setTimeout(() => {
      inputRef.current?.focus();
      inputRef.current?.select();
    }, 0);
    return () => window.clearTimeout(t);
  }, [creating, defaultName]);

  async function handleCreate() {
    if (disabled) return;
    const name = nameInput.trim();
    if (!name) return;
    await onCreateDraftNamed(name);
    setCreating(false);
    setNameInput("");
  }

  function handleCancel() {
    setCreating(false);
    setNameInput("");
  }

  const archivedCount = useMemo(() => countArchived(templates), [templates]);
  const bindableCount = useMemo(() => countBindable(templates), [templates]);

  const visibleTemplates = useMemo(() => {
    return buildVisibleTemplates({ templates, showArchived, showBindableOnly });
  }, [templates, showArchived, showBindableOnly]);

  return (
    <div className="rounded-2xl border border-slate-200 bg-white p-4">
      <div className="flex items-center justify-between gap-2">
        <div className="text-[15px] font-semibold text-slate-800">方案列表</div>

        {!creating ? (
          <button
            type="button"
            className={UI.btnNeutralSm}
            disabled={disabled}
            onClick={() => setCreating(true)}
            title="新建一个草稿方案（先命名，再进入编辑）"
          >
            新建方案
          </button>
        ) : null}
      </div>

      <FiltersBar
        disabled={disabled}
        showArchived={showArchived}
        setShowArchived={setShowArchived}
        showBindableOnly={showBindableOnly}
        setShowBindableOnly={setShowBindableOnly}
        totalCount={templates.length}
        archivedCount={archivedCount}
        bindableCount={bindableCount}
      />

      {creating ? (
        <div className="mt-3 flex flex-wrap items-center gap-2">
          <input
            ref={inputRef}
            className={`${UI.inputBase ?? UI.selectBase} w-full text-sm`}
            disabled={disabled}
            value={nameInput}
            onChange={(e) => setNameInput(e.target.value)}
            placeholder="请输入方案名称"
            onKeyDown={(e) => {
              if (e.key === "Enter") void handleCreate();
              if (e.key === "Escape") handleCancel();
            }}
          />

          <div className="flex items-center gap-2">
            <button
              type="button"
              className={UI.btnNeutralSm}
              disabled={disabled || !nameInput.trim()}
              onClick={() => void handleCreate()}
              title="创建草稿并自动选中"
            >
              创建
            </button>
            <button type="button" className={UI.btnNeutralSm} disabled={disabled} onClick={handleCancel} title="取消新建">
              取消
            </button>
          </div>
        </div>
      ) : null}

      <div className="mt-3 space-y-2">
        {visibleTemplates.length === 0 ? (
          <div className="text-sm text-slate-500">
            {templates.length === 0
              ? "暂无方案。请先新建一个草稿方案。"
              : showBindableOnly
                ? "暂无可绑定区域的方案（请先将某条已保存方案加入可绑定区域）。"
                : "暂无可展示方案（可能都已归档）。"}
          </div>
        ) : (
          visibleTemplates.map((t) => (
            <TemplateRow
              key={t.id}
              disabled={disabled}
              t={t}
              selected={selectedTemplateId === t.id}
              onSelect={() => onSelectTemplateId(t.id)}
              onSetBindable={onSetBindable}
              onRenameTemplate={onRenameTemplate}
              onArchiveTemplate={onArchiveTemplate}
              onUnarchiveTemplate={onUnarchiveTemplate}
            />
          ))
        )}
      </div>

      <div className="mt-3 text-xs text-slate-500">
        提示：<span className="font-semibold">可绑定区域</span> 表示该模板可被区域（Zone）选择绑定；并不等于正在使用。正在使用取决于每个 Zone 的绑定事实。
      </div>
    </div>
  );
};

export default SegmentTemplateListPanel;
