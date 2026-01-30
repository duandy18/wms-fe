// src/features/admin/shipping-providers/scheme/brackets/SegmentTemplateListPanel/FiltersBar.tsx

import React from "react";

export const FiltersBar: React.FC<{
  disabled: boolean;

  showArchived: boolean;
  setShowArchived: (v: boolean) => void;

  showBindableOnly: boolean;
  setShowBindableOnly: (v: boolean) => void;

  totalCount: number;
  archivedCount: number;
  bindableCount: number;
}> = ({
  disabled,
  showArchived,
  setShowArchived,
  showBindableOnly,
  setShowBindableOnly,
  totalCount,
  archivedCount,
  bindableCount,
}) => {
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

        <label className="flex items-center gap-2 text-sm text-slate-600">
          <input
            type="checkbox"
            checked={showBindableOnly}
            disabled={disabled}
            onChange={(e) => setShowBindableOnly(e.target.checked)}
          />
          仅显示可绑定区域
        </label>
      </div>

      <div className="text-xs text-slate-500">
        共 <span className="font-mono">{totalCount}</span> 条{" "}
        {showArchived ? null : (
          <>
            · 已隐藏归档 <span className="font-mono">{archivedCount}</span> 条{" "}
          </>
        )}
        · 可绑定 <span className="font-mono">{bindableCount}</span> 条
      </div>
    </div>
  );
};

export default FiltersBar;
