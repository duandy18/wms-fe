// src/features/admin/shipping-providers/scheme/brackets/TemplateWorkbenchSteps/TemplateWorkbenchStep3SaveActivate.tsx
import React from "react";
import { UI } from "../../ui";

export const TemplateWorkbenchStep3SaveActivate: React.FC<{
  disabled: boolean;
  isDraft: boolean;
  dirty: boolean;
  summary: string;

  onBack: () => void;
  onSave: () => void;
  onActivate: () => void;
}> = ({ disabled, isDraft, dirty, summary, onBack, onSave, onActivate }) => {
  return (
    <div className="mt-4 rounded-2xl border border-slate-200 bg-white p-4">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <div className="text-sm font-semibold">Step 3：保存并启用</div>
          <div className="mt-1 text-xs text-slate-500">保存仅影响草稿；启用才会替换线上生效方案。</div>
        </div>

        <div className="flex items-center gap-2">
          <button type="button" className={UI.btnNeutralSm} disabled={disabled} onClick={onBack}>
            返回：继续编辑
          </button>
        </div>
      </div>

      <div className="mt-3 text-sm text-slate-700">
        <span className="text-slate-500">摘要：</span>
        {summary}
      </div>

      <div className="mt-3 flex flex-wrap items-start justify-between gap-3">
        {/* 左：保存草稿 */}
        <div className="flex flex-col gap-1">
          <button
            type="button"
            className={UI.btnNeutralSm}
            disabled={disabled || !dirty || !isDraft}
            onClick={onSave}
            title={!dirty ? "无变更无需保存" : "保存草稿（不影响线上）"}
          >
            保存草稿
          </button>
          <div className="text-xs text-slate-500">保存只影响草稿，不影响线上。</div>
        </div>

        {/* 右：启用为当前生效 */}
        <div className="flex flex-col gap-1 items-end">
          <button
            type="button"
            className={UI.btnNeutralSm}
            disabled={disabled || dirty || !isDraft}
            onClick={onActivate}
            title={dirty ? "请先保存草稿，再启用" : "启用为当前生效（整体替换线上方案）"}
          >
            启用为当前生效
          </button>
          <div className="text-xs text-slate-500">启用会立即替换线上生效方案。</div>
        </div>
      </div>

      <div className="mt-2 text-xs text-slate-500">
        {dirty ? "当前有未保存修改：请先点击“保存草稿”。" : "已保存：可直接点击“启用为当前生效”。"}
      </div>
    </div>
  );
};

export default TemplateWorkbenchStep3SaveActivate;
