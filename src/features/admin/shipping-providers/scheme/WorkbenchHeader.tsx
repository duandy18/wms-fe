// src/features/admin/shipping-providers/scheme/WorkbenchHeader.tsx
//
// 顶部主控区：标题/状态提示/返回按钮（纯展示）

import React from "react";
import { UI } from "./ui";

export const WorkbenchHeader: React.FC<{
  title: string;
  subtitle: string;
  loading: boolean;
  mutating: boolean;
  disabled: boolean;
  onBack: () => void;
}> = ({ title, subtitle, loading, mutating, disabled, onBack }) => {
  return (
    <div className={UI.cardTight}>
      <div className={UI.headerRow}>
        <div>
          <div className={UI.workbenchTitle}>{title}</div>
          {loading || mutating ? (
            <div className={UI.tinyHelpText}>
              {loading ? "加载中…" : null}
              {mutating ? " 正在保存…" : null}
            </div>
          ) : (
            <div className={UI.workbenchSubtitle}>{subtitle}</div>
          )}
        </div>

        <div className={UI.workbenchHeaderActions}>
          <button type="button" className={UI.workbenchBackBtn} onClick={onBack} disabled={disabled}>
            返回
          </button>
        </div>
      </div>
    </div>
  );
};

export default WorkbenchHeader;
