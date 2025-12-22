// src/features/admin/suppliers/components/SuppliersToolbar.tsx

import React from "react";

export const SuppliersToolbar: React.FC<{
  onlyActive: boolean;
  onChangeOnlyActive: (v: boolean) => void;
  search: string;
  onChangeSearch: (v: string) => void;
  loading: boolean;
  onRefresh: () => void;
  inputClassName: string;
  btnClassName: string;
  bodyClassName: string;
}> = ({ onlyActive, onChangeOnlyActive, search, onChangeSearch, loading, onRefresh, inputClassName, btnClassName, bodyClassName }) => {
  return (
    <div className={`flex flex-wrap items-center gap-4 ${bodyClassName}`}>
      <label className={`inline-flex items-center gap-3 ${bodyClassName}`}>
        <input type="checkbox" className="scale-125" checked={onlyActive} onChange={(e) => onChangeOnlyActive(e.target.checked)} />
        仅显示合作中
      </label>

      <input
        className={inputClassName}
        style={{ maxWidth: 520 }}
        placeholder="名称 / 编码 / 联系人 / 电话 搜索"
        value={search}
        onChange={(e) => onChangeSearch(e.target.value)}
      />

      <button type="button" onClick={onRefresh} disabled={loading} className={btnClassName}>
        {loading ? "查询中…" : "刷新"}
      </button>
    </div>
  );
};

export default SuppliersToolbar;
