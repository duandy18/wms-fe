// src/features/admin/suppliers/components/SuppliersFiltersBar.tsx

import React from "react";
import { UI } from "../ui";

export const SuppliersFiltersBar: React.FC<{
  onlyActive: boolean;
  onChangeOnlyActive: (v: boolean) => void;

  search: string;
  onChangeSearch: (v: string) => void;

  loading: boolean;
  onRefresh: () => void | Promise<void>;
}> = ({ onlyActive, onChangeOnlyActive, search, onChangeSearch, loading, onRefresh }) => {
  return (
    <div className={UI.filtersRow}>
      <h2 className={UI.h2}>供应商列表</h2>

      <div className={UI.filtersWrap}>
        <label className="inline-flex items-center gap-1">
          <input
            type="checkbox"
            className={UI.checkbox}
            checked={onlyActive}
            onChange={(e) => onChangeOnlyActive(e.target.checked)}
          />
          <span>仅显示启用</span>
        </label>

        <input
          className={UI.searchInput}
          placeholder="名称 / 联系人 搜索"
          value={search}
          onChange={(e) => onChangeSearch(e.target.value)}
        />

        <button type="button" disabled={loading} onClick={() => void onRefresh()} className={UI.btnNeutral}>
          {loading ? "查询中…" : "刷新"}
        </button>
      </div>
    </div>
  );
};

export default SuppliersFiltersBar;
