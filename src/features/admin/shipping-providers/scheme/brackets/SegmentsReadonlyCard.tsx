// src/features/admin/shipping-providers/scheme/brackets/SegmentsReadonlyCard.tsx
//
// 只读态展示卡：提示 + 当前采用口径（预览）+ 空态引导
// UI token：scheme/ui.ts

import React from "react";
import UI from "../ui";

export const SegmentsReadonlyCard: React.FC<{
  adopted: boolean;
  previewLabels: string[] | null;
}> = ({ adopted, previewLabels }) => {
  return (
    <div className={UI.cardSoft}>
      <div className={UI.panelHint}>当前为只读视图。若要修改表头结构，请点击右上角「更多」→「编辑（高风险）」。</div>

      {adopted && previewLabels?.length ? (
        <div className="mt-3">
          <div className={UI.sectionTitle}>当前采用口径（左开右闭）</div>
          <div className="mt-2 flex flex-wrap gap-2">
            {previewLabels.map((t) => (
              <span key={t} className={UI.rowMonoText}>
                {t}
              </span>
            ))}
          </div>
        </div>
      ) : null}

      {!adopted ? (
        <div className="mt-3">
          <div className={UI.helpText}>当前表头为空（未采用）。请通过「更多」→「采用默认模板」或进入编辑后保存。</div>
        </div>
      ) : null}
    </div>
  );
};

export default SegmentsReadonlyCard;
