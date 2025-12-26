// src/features/admin/shipping-providers/scheme/surcharges/create/SectionHeader.tsx
//
// 小节头部（可折叠 + 右侧操作）
// - 纯展示组件：不持有业务状态

import React from "react";
import { UI } from "../../ui";

export function SectionHeader(props: {
  title: string;
  subtitle?: string;
  collapsed: boolean;
  onToggleCollapsed: () => void;
  right?: React.ReactNode;
}) {
  const { title, subtitle, collapsed, onToggleCollapsed, right } = props;

  return (
    <div className={UI.surchargeScopeHeaderRow}>
      <div>
        <div className={UI.sectionTitle}>{title}</div>
        {subtitle ? <div className={`mt-1 ${UI.panelHint}`}>{subtitle}</div> : null}
      </div>

      <div className={UI.surchargeScopeActionsRow}>
        {right}
        <button type="button" className={UI.btnNeutralSm} onClick={onToggleCollapsed}>
          {collapsed ? "展开" : "折叠"}
        </button>
      </div>
    </div>
  );
}

export default SectionHeader;
