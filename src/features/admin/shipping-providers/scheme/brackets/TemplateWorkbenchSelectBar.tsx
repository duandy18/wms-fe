// src/features/admin/shipping-providers/scheme/brackets/TemplateWorkbenchSelectBar.tsx
import React, { useEffect, useMemo, useRef, useState } from "react";
import type { SegmentTemplateOut, SchemeWeightSegment } from "./segmentTemplates";
import { isTemplateActive } from "./segmentTemplates";
import { UI } from "../ui";

function displayName(name: string): string {
  return String(name ?? "")
    .replace(/表头模板/g, "")
    .replace(/\s+/g, " ")
    .trim();
}

function statusLabel(t: SegmentTemplateOut): string {
  const st = String(t.status ?? "");
  if (isTemplateActive(t)) return "当前生效";
  if (st === "draft") return "草稿";
  if (st === "published") return "已保存";
  if (st === "archived") return "已归档";
  return st ? st : "未知";
}

function yyyyMmDd(d: Date): string {
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, "0");
  const dd = String(d.getDate()).padStart(2, "0");
  return `${y}-${m}-${dd}`;
}

export const TemplateWorkbenchSelectBar: React.FC<{
  disabled: boolean;
  templates: SegmentTemplateOut[];
  selectedTemplateId: number | null;
  onSelectTemplateId: (id: number | null) => void;

  // ✅ 兼容：旧用法（直接创建，外部可弹窗/可自动名）
  onCreateDraft: () => void;

  // ✅ 新增：内联命名创建（不弹窗）
  // - 如果提供，则“新建方案”走内联输入；否则 fallback 到 onCreateDraft
  onCreateDraftNamed?: (name: string) => void | Promise<void>;

  mirrorSegmentsJson: SchemeWeightSegment[] | null;

  rightSlot?: React.ReactNode;
}> = ({
  disabled,
  templates,
  selectedTemplateId,
  onSelectTemplateId,
  onCreateDraft,
  onCreateDraftNamed,
  rightSlot,
}) => {
  const [creating, setCreating] = useState(false);
  const [nameInput, setNameInput] = useState("");
  const inputRef = useRef<HTMLInputElement | null>(null);

  const defaultRememberedName = useMemo(() => `${yyyyMmDd(new Date())} 方案`, []);

  useEffect(() => {
    if (!creating) return;
    // 进入创建态时，预填一个默认名（可编辑）
    setNameInput((prev) => (prev.trim() ? prev : defaultRememberedName));
    // 下一帧 focus
    const t = window.setTimeout(() => {
      inputRef.current?.focus();
      inputRef.current?.select();
    }, 0);
    return () => window.clearTimeout(t);
  }, [creating, defaultRememberedName]);

  async function handleCreate() {
    if (disabled) return;
    const name = nameInput.trim();
    if (!name) return;

    if (onCreateDraftNamed) {
      await onCreateDraftNamed(name);
      setCreating(false);
      setNameInput("");
      return;
    }

    // fallback：没有内联创建能力时，走旧逻辑（外部可能弹窗/自动名）
    onCreateDraft();
    setCreating(false);
    setNameInput("");
  }

  function handleCancel() {
    setCreating(false);
    setNameInput("");
  }

  return (
    <>
      <div className={`${UI.sectionTitle} text-[15px] font-semibold`}>正在编辑的方案</div>

      <div className="mt-3 flex flex-wrap items-center justify-between gap-3">
        {/* ✅ 创建态：独占这一行，避免“创建/选择/保存/启用”多主线打架 */}
        {creating ? (
          <div className="flex flex-wrap items-center gap-2 w-full">
            <input
              ref={inputRef}
              className={`${UI.inputBase ?? UI.selectBase} min-w-[420px] text-sm`}
              disabled={disabled}
              value={nameInput}
              onChange={(e) => setNameInput(e.target.value)}
              placeholder="请输入方案名称"
              onKeyDown={(e) => {
                if (e.key === "Enter") void handleCreate();
                if (e.key === "Escape") handleCancel();
              }}
            />

            <button
              type="button"
              className={UI.btnNeutralSm}
              disabled={disabled || !nameInput.trim()}
              onClick={() => void handleCreate()}
              title="创建草稿并进入编辑"
            >
              创建
            </button>

            <button type="button" className={UI.btnNeutralSm} disabled={disabled} onClick={handleCancel} title="取消新建">
              取消
            </button>
          </div>
        ) : (
          <>
            {/* 正常态：左侧 = 新建 + 选择 */}
            <div className="flex flex-wrap items-center gap-2">
              <button
                type="button"
                className={UI.btnNeutral}
                disabled={disabled}
                onClick={() => {
                  if (onCreateDraftNamed) {
                    setCreating(true);
                  } else {
                    onCreateDraft();
                  }
                }}
                title="新建一个方案名，然后在下方编辑重量段结构"
              >
                新建方案
              </button>

              <select
                className={`${UI.selectBase} min-w-[460px] text-sm`}
                disabled={disabled}
                value={selectedTemplateId ?? ""}
                onChange={(e) => onSelectTemplateId(e.target.value ? Number(e.target.value) : null)}
              >
                <option value="">{templates.length ? "请选择一个方案…" : "暂无方案（请先新建）"}</option>

                {templates.map((t) => (
                  <option key={t.id} value={t.id}>
                    {isTemplateActive(t) ? "★ " : ""}
                    {displayName(t.name ?? "")}（{statusLabel(t)}）
                  </option>
                ))}
              </select>
            </div>

            {/* 正常态：右侧 = 外部动作（保存/启用等） */}
            <div className="flex items-center gap-2">{rightSlot ?? null}</div>
          </>
        )}
      </div>
    </>
  );
};

export default TemplateWorkbenchSelectBar;
