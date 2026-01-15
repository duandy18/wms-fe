// src/features/inventory/snapshot/SnapshotFilters.tsx
import React from "react";

type SnapshotFiltersProps = {
  searchInput: string;
  nearOnly: boolean;
  loading?: boolean;
  onChangeSearchInput: (value: string) => void;
  onChangeNearOnly: (value: boolean) => void;
  onSubmit: () => void;
  onReset: () => void;
};

export const SnapshotFilters: React.FC<SnapshotFiltersProps> = ({
  searchInput,
  nearOnly,
  loading = false,
  onChangeSearchInput,
  onChangeNearOnly,
  onSubmit,
  onReset,
}) => {
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit();
  };

  const canReset = Boolean(searchInput.trim()) || nearOnly;

  return (
    <div className="flex flex-wrap items-center justify-between gap-3">
      {/* 搜索框 */}
      <form onSubmit={handleSubmit} className="flex items-center gap-2">
        <input
          type="text"
          value={searchInput}
          onChange={(e) => onChangeSearchInput(e.target.value)}
          placeholder="搜索：编码 / 名称（模糊）"
          className="h-9 w-56 rounded-full border border-slate-200 bg-white px-3 text-sm text-slate-900 shadow-sm focus:border-slate-400 focus:outline-none focus:ring-1 focus:ring-slate-300"
        />
        <button
          type="submit"
          disabled={loading}
          className="inline-flex h-9 items-center rounded-full bg-slate-900 px-3 text-xs font-medium text-white hover:bg-slate-800 disabled:opacity-60"
        >
          {loading ? "搜索中…" : "搜索"}
        </button>

        <button
          type="button"
          disabled={loading || !canReset}
          onClick={onReset}
          className="inline-flex h-9 items-center rounded-full bg-slate-100 px-3 text-xs font-medium text-slate-700 hover:bg-slate-200 disabled:cursor-not-allowed disabled:opacity-50"
        >
          返回全部
        </button>
      </form>

      {/* 只看临期 */}
      <label className="flex cursor-pointer items-center gap-1 text-xs text-slate-600">
        <input
          type="checkbox"
          className="h-3 w-3 rounded border-slate-300"
          checked={nearOnly}
          onChange={(e) => onChangeNearOnly(e.target.checked)}
        />
        <span>只看临期（near_expiry = true）</span>
      </label>
    </div>
  );
};
