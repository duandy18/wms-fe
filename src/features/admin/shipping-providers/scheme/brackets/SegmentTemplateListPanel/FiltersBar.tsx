// src/features/admin/shipping-providers/scheme/brackets/SegmentTemplateListPanel/FiltersBar.tsx

import React from "react";

export const FiltersBar: React.FC<{
  disabled: boolean;

  showArchived: boolean;
  setShowArchived: (v: boolean) => void;

  totalCount: number;
  archivedCount: number;

  // ✅ 使用中模板数量（用于快速感知风险面）
  inUseCount: number;
}> = ({ disabled, showArchived, setShowArchived, totalCount, archivedCount, inUseCount }) => {
  return (
    <div className="mt-2 flex flex-wrap items-center justify-between gap-2">
      <div className="flex flex-wrap items-center gap-4">
        <label className="flex items-center gap-2 text-sm text-slate-600">
          <input
            type="checkbox"
            checked={showArchived}
            disabled={disabled}
            onChange={(e) => setShowArchived(e.target.checked)}
          />
          显示已归档
        </label>
      </div>

      <div className="text-xs text-slate-500">
        共 <span className="font-mono">{totalCount}</span> 条{" "}
        {showArchived ? null : (
          <>
            · 已隐藏归档 <span className="font-mono">{archivedCount}</span> 条{" "}
          </>
        )}
        · 使用中 <span className="font-mono">{inUseCount}</span> 条
      </div>
    </div>
  );
};

export default FiltersBar;
