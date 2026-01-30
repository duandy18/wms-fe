// src/features/admin/shipping-providers/scheme/workbench/FlowLockedNotice.tsx

import React from "react";
import { UI } from "../ui";

export const FlowLockedNotice: React.FC<{
  open: boolean;
  onGoCreateTemplate: () => void;
}> = ({ open, onGoCreateTemplate }) => {
  if (!open) return null;

  return (
    <div className="rounded-2xl border border-amber-200 bg-amber-50 p-4 text-sm text-amber-900">
      <div className="font-semibold">请先创建重量段模板</div>
      <div className="mt-1 text-amber-900/80">当前方案尚未创建任何重量段模板。为避免区域与录价发生误配，系统已暂时锁定后续步骤。</div>
      <div className="mt-3 flex items-center gap-2">
        <button type="button" className={UI.btnPrimaryGreen} onClick={onGoCreateTemplate}>
          去创建重量段模板
        </button>
        <div className="text-xs text-amber-900/70">完成后将自动解锁后续流程</div>
      </div>
    </div>
  );
};

export default FlowLockedNotice;
