// src/features/admin/shipping-providers/scheme/brackets/TemplateWorkbenchSteps/TemplateWorkbenchStepper.tsx
import React from "react";

function stepPill(active: boolean): string {
  return active
    ? "rounded-full bg-sky-50 text-sky-700 border border-sky-200 px-3 py-1 text-sm font-semibold"
    : "rounded-full bg-slate-50 text-slate-500 border border-slate-200 px-3 py-1 text-sm font-semibold";
}

export const TemplateWorkbenchStepper: React.FC<{
  step: 1 | 2 | 3;
  dirty: boolean;
}> = ({ step, dirty }) => {
  return (
    <div className="mt-3 flex flex-wrap items-center gap-2">
      <span className={stepPill(step === 1)}>1 选择草稿</span>
      <span className="text-slate-300">→</span>
      <span className={stepPill(step === 2)}>2 编辑结构</span>
      <span className="text-slate-300">→</span>
      <span className={stepPill(step === 3)}>3 保存并启用</span>

      <div className="ml-auto flex items-center gap-2">
        <span className={dirty ? "text-sm font-semibold text-red-700" : "text-sm font-semibold text-emerald-700"}>
          {dirty ? "未保存" : "已保存"}
        </span>
      </div>
    </div>
  );
};

export default TemplateWorkbenchStepper;
