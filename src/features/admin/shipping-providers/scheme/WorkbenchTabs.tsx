// src/features/admin/shipping-providers/scheme/WorkbenchTabs.tsx
//
// Tabs 行（纯展示）
// - 不含业务逻辑，只负责渲染与点击回调

import React from "react";
import { UI } from "./ui";

export const WorkbenchTabs: React.FC<{
  active: string;
  disabled: boolean;

  tabs: Array<{ key: string; label: string }>;
  onClickTab: (key: string) => void;
}> = ({ active, disabled, tabs, onClickTab }) => {
  return (
    <div className="mt-3 flex flex-wrap gap-2">
      {tabs.map((t) => (
        <button
          key={t.key}
          type="button"
          disabled={disabled}
          onClick={() => onClickTab(t.key)}
          className={`${UI.tabBtn} ${active === t.key ? UI.tabBtnActive : UI.tabBtnIdle} ${disabled ? UI.regionItemDisabledOpacity : ""}`}
        >
          {t.label}
        </button>
      ))}
    </div>
  );
};

export default WorkbenchTabs;
