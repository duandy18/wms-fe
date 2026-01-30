// src/features/admin/shipping-providers/scheme/brackets/TemplateWorkbenchSteps/TemplateWorkbenchStep1ChooseDraft.tsx
import React from "react";
import type { SegmentTemplateOut } from "../segmentTemplates";
import { UI } from "../../ui";

export const TemplateWorkbenchStep1ChooseDraft: React.FC<{
  disabled: boolean;
  draftTemplates: SegmentTemplateOut[];
  selectedTemplateId: number | null;
  onSelectTemplateId: (id: number | null) => void;
  onCreateDraft: () => void;

  canGoEdit: boolean;
  onNext: () => void;

  displayName: (name: string) => string;
}> = ({
  disabled,
  draftTemplates,
  selectedTemplateId,
  onSelectTemplateId,
  onCreateDraft,
  canGoEdit,
  onNext,
  displayName,
}) => {
  return (
    <div className="mt-4 rounded-2xl border border-slate-200 bg-white p-4">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <div className="text-sm font-semibold">Step 1：选择草稿方案</div>
          <div className="mt-1 text-xs text-slate-500">
            生效版本方案只读；要修改请新建草稿方案并在草稿中编辑。
          </div>
        </div>

        <div className="flex items-center gap-2">
          <button
            type="button"
            className={UI.btnNeutralSm}
            disabled={disabled}
            onClick={onCreateDraft}
            title="新建草稿方案（自动初始化 3 行默认段）"
          >
            新建草稿
          </button>
        </div>
      </div>

      <div className="mt-3 flex flex-wrap items-center gap-2">
        <select
          className={`${UI.selectBase} min-w-[420px]`}
          disabled={disabled}
          value={selectedTemplateId ?? ""}
          onChange={(e) => onSelectTemplateId(e.target.value ? Number(e.target.value) : null)}
        >
          <option value="">
            {draftTemplates.length ? "请选择一个草稿方案…" : "暂无草稿方案（请先新建）"}
          </option>
          {draftTemplates.map((t) => (
            <option key={t.id} value={t.id}>
              {displayName(t.name ?? "")}
            </option>
          ))}
        </select>

        <button
          type="button"
          className={UI.btnNeutralSm}
          disabled={disabled || !canGoEdit}
          onClick={onNext}
          title={!canGoEdit ? "请选择一个草稿方案" : "进入编辑结构"}
        >
          下一步：编辑结构
        </button>
      </div>
    </div>
  );
};

export default TemplateWorkbenchStep1ChooseDraft;
