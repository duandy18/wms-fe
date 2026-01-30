// src/features/admin/shipping-providers/scheme/workbench/WorkbenchTabs.tsx

import React from "react";
import type { SchemeTabKey } from "../types";
import { UI } from "../ui";
import { L } from "../labels";

function TabButton(props: { label: string; active: boolean; disabled?: boolean; onClick: () => void }) {
  const { label, active, disabled, onClick } = props;
  return (
    <button
      type="button"
      disabled={disabled}
      onClick={onClick}
      className={`${UI.tabBtn} ${active ? UI.tabBtnActive : UI.tabBtnIdle} ${disabled ? "opacity-60" : ""}`}
    >
      {label}
    </button>
  );
}

export const WorkbenchTabs: React.FC<{
  tab: SchemeTabKey;
  pageDisabled: boolean;
  checkingTemplates: boolean;
  flowLocked: boolean;
  onGoTab: (k: SchemeTabKey) => void;
}> = ({ tab, pageDisabled, checkingTemplates, flowLocked, onGoTab }) => {
  return (
    <div className={UI.tabsWrap}>
      {/* ✅ 新主入口：二维价格表工作台（Zone × 模板行 × 单元格价格） */}
      <TabButton label="二维价格表" active={tab === "table"} disabled={pageDisabled} onClick={() => onGoTab("table")} />

      <TabButton label={L.tabSegments} active={tab === "segments"} disabled={pageDisabled} onClick={() => onGoTab("segments")} />
      <TabButton label={L.tabZones} active={tab === "zones"} disabled={pageDisabled || checkingTemplates || flowLocked} onClick={() => onGoTab("zones")} />
      <TabButton label={L.tabBrackets} active={tab === "brackets"} disabled={pageDisabled || checkingTemplates || flowLocked} onClick={() => onGoTab("brackets")} />

      {/* ✅ 附加费不依赖模板 gate：允许先配附加费再补模板/区域 */}
      <TabButton label={L.tabSurcharges} active={tab === "surcharges"} disabled={pageDisabled} onClick={() => onGoTab("surcharges")} />
      <TabButton label={L.tabPreview} active={tab === "preview"} disabled={pageDisabled || checkingTemplates || flowLocked} onClick={() => onGoTab("preview")} />
    </div>
  );
};

export default WorkbenchTabs;
