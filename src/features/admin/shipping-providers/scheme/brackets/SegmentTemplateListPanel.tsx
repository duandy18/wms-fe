// src/features/admin/shipping-providers/scheme/brackets/SegmentTemplateListPanel.tsx
//
// 方案列表（左侧）
// - 一眼可见：草稿 / 已保存 / 已生效 / 已归档
// - 点击行：切换当前选中方案（右侧进入编辑/启用）
// - 新建：内联输入名称（不弹窗、不打断；创建后自动选中）
// - 归档：已保存且未生效允许归档；默认隐藏已归档，可切换显示
//
// 约束：
// - “设为生效”不在列表行做（避免并发/竞态），统一在右侧编辑区执行
// - 已支持多条同时生效：active=true 不互斥

import React, { useEffect, useMemo, useRef, useState } from "react";
import type { SegmentTemplateOut } from "./segmentTemplates";
import { isTemplateActive } from "./segmentTemplates";
import { UI } from "../ui";

function displayName(name: string): string {
  return String(name ?? "")
    .replace(/表头模板/g, "")
    .replace(/\s+/g, " ")
    .trim();
}

function yyyyMmDd(d: Date): string {
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, "0");
  const dd = String(d.getDate()).padStart(2, "0");
  return `${y}-${m}-${dd}`;
}

function statusLabel(t: SegmentTemplateOut): { text: string; tone: "ok" | "draft" | "saved" | "archived" } {
  const st = String(t.status ?? "");
  if (isTemplateActive(t)) return { text: "已生效", tone: "ok" };
  if (st === "draft") return { text: "草稿", tone: "draft" };
  if (st === "published") return { text: "已保存", tone: "saved" };
  if (st === "archived") return { text: "已归档", tone: "archived" };
  return { text: st ? st : "未知", tone: "saved" };
}

function badgeCls(tone: "ok" | "draft" | "saved" | "archived"): string {
  if (tone === "ok") return "border-emerald-200 bg-emerald-50 text-emerald-700";
  if (tone === "draft") return "border-amber-200 bg-amber-50 text-amber-700";
  if (tone === "archived") return "border-slate-200 bg-slate-50 text-slate-500";
  return "border-slate-200 bg-white text-slate-600";
}

export const SegmentTemplateListPanel: React.FC<{
  disabled: boolean;
  templates: SegmentTemplateOut[];
  selectedTemplateId: number | null;
  onSelectTemplateId: (id: number | null) => void;

  onCreateDraftNamed: (name: string) => void | Promise<void>;
  onArchiveTemplate: (templateId: number) => void | Promise<void>;
  onUnarchiveTemplate: (templateId: number) => void | Promise<void>;
}> = ({
  disabled,
  templates,
  selectedTemplateId,
  onSelectTemplateId,
  onCreateDraftNamed,
  onArchiveTemplate,
  onUnarchiveTemplate,
}) => {
  const [creating, setCreating] = useState(false);
  const [nameInput, setNameInput] = useState("");
  const inputRef = useRef<HTMLInputElement | null>(null);

  const [showArchived, setShowArchived] = useState(false);

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

  const visibleTemplates = useMemo(() => {
    if (showArchived) return templates;
    return templates.filter((t) => String(t.status ?? "") !== "archived");
  }, [templates, showArchived]);

  const activeCount = useMemo(() => templates.filter((t) => isTemplateActive(t)).length, [templates]);

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

      <div className="mt-2 flex items-center justify-between gap-2">
        <label className="flex items-center gap-2 text-sm text-slate-600">
          <input
            type="checkbox"
            checked={showArchived}
            disabled={disabled}
            onChange={(e) => setShowArchived(e.target.checked)}
          />
          显示已归档
        </label>

        <div className="text-xs text-slate-500">
          共 <span className="font-mono">{templates.length}</span> 条
          {" "}
          · 已生效 <span className="font-mono">{activeCount}</span> 条
          {showArchived ? null : (
            <>
              {" "}
              · 已隐藏归档{" "}
              <span className="font-mono">{templates.filter((t) => String(t.status ?? "") === "archived").length}</span>{" "}
              条
            </>
          )}
        </div>
      </div>

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
            {templates.length === 0 ? "暂无方案。请先新建一个草稿方案。" : "暂无可展示方案（可能都已归档）。"}
          </div>
        ) : (
          visibleTemplates.map((t) => {
            const st = statusLabel(t);
            const active = isTemplateActive(t);
            const selected = selectedTemplateId === t.id;

            const rawStatus = String(t.status ?? "");
            const canArchive = rawStatus === "published" && !active;
            const canUnarchive = rawStatus === "archived";

            return (
              <div
                key={t.id}
                className={[
                  "w-full rounded-xl border px-3 py-2",
                  selected ? "border-blue-200 bg-blue-50" : "border-slate-200 bg-white hover:bg-slate-50",
                  disabled ? "opacity-60" : "",
                ].join(" ")}
              >
                <div className="flex items-start justify-between gap-2">
                  <button
                    type="button"
                    disabled={disabled}
                    onClick={() => onSelectTemplateId(t.id)}
                    className="min-w-0 text-left flex-1"
                    title={selected ? "当前已选中" : "点击切换到该方案"}
                  >
                    <div className="flex items-center gap-2">
                      <div className="truncate text-sm font-semibold text-slate-900">
                        {active ? "★ " : ""}
                        {displayName(t.name ?? "")}
                      </div>

                      <span className={`inline-flex items-center rounded-full border px-2 py-0.5 text-xs font-semibold ${badgeCls(st.tone)}`}>
                        {st.text}
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
                  </button>

                  <div className="flex items-center gap-2">
                    {canArchive ? (
                      <button
                        type="button"
                        className={UI.btnNeutralSm}
                        disabled={disabled}
                        onClick={() => void onArchiveTemplate(t.id)}
                        title="归档该方案（归档后默认隐藏，且不可启用）"
                      >
                        归档
                      </button>
                    ) : canUnarchive ? (
                      <button
                        type="button"
                        className={UI.btnNeutralSm}
                        disabled={disabled}
                        onClick={() => void onUnarchiveTemplate(t.id)}
                        title="取消归档（不会自动启用）"
                      >
                        取消归档
                      </button>
                    ) : null}
                  </div>
                </div>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
};

export default SegmentTemplateListPanel;
