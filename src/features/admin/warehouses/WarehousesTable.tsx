// src/features/admin/warehouses/WarehousesTable.tsx

import React from "react";
import type { WarehouseListItem } from "./types";
import type { WarehouseSortKey } from "./useWarehousesListPresenter";

type Props = {
  canRead: boolean;
  canWrite: boolean;
  loading: boolean;
  saving: boolean;
  visibleWarehouses: WarehouseListItem[];
  showInactive: boolean;
  onToggleShowInactive: (v: boolean) => void;
  sortKey: WarehouseSortKey;
  sortAsc: boolean;
  onSort: (key: WarehouseSortKey) => void;
  onToggleActive: (wh: WarehouseListItem) => void;
  onOpenDetail: (id: number) => void;
};

function SortHeader({
  label,
  sortKey,
  sortAsc,
  columnKey,
  onSort,
}: {
  label: string;
  sortKey: WarehouseSortKey;
  sortAsc: boolean;
  columnKey: WarehouseSortKey;
  onSort: (key: WarehouseSortKey) => void;
}) {
  const isActive = sortKey === columnKey;
  const arrow = isActive ? (sortAsc ? " ↑" : " ↓") : "";

  return (
    <button
      type="button"
      onClick={() => onSort(columnKey)}
      className={
        "inline-flex items-center gap-0.5 " +
        (isActive ? "text-slate-900 font-semibold" : "text-slate-700")
      }
    >
      <span>{label}</span>
      {arrow && <span className="text-[11px]">{arrow}</span>}
    </button>
  );
}

export const WarehousesTable: React.FC<Props> = ({
  canRead,
  canWrite,
  loading,
  saving,
  visibleWarehouses,
  showInactive,
  onToggleShowInactive,
  sortKey,
  sortAsc,
  onSort,
  onToggleActive,
  onOpenDetail,
}) => {
  if (!canRead) {
    return (
      <section className="bg-white border border-slate-200 rounded-xl overflow-hidden">
        <div className="px-4 py-6 text-base text-slate-500">
          你没有 admin.stores 权限（仓库管理需要该权限）。
        </div>
      </section>
    );
  }

  if (loading) {
    return (
      <section className="bg-white border border-slate-200 rounded-xl overflow-hidden">
        <div className="px-4 py-6 text-base text-slate-600">加载中…</div>
      </section>
    );
  }

  if (visibleWarehouses.length === 0) {
    return (
      <section className="bg-white border border-slate-200 rounded-xl overflow-hidden">
        <div className="px-4 py-6 text-base text-slate-500">
          {showInactive ? "暂无仓库记录。" : "暂无启用的仓库。"}
        </div>
      </section>
    );
  }

  return (
    <section className="bg-white border border-slate-200 rounded-xl overflow-hidden">
      {/* 顶部工具条 */}
      <div className="px-4 pt-3 pb-2 flex items-center justify-between">
        <div className="text-sm text-slate-500">
          共 {visibleWarehouses.length} 条（当前仅显示
          {showInactive ? "全部仓库" : "启用仓库"}）
        </div>
        <label className="text-sm text-slate-600 flex items-center gap-2">
          <input
            type="checkbox"
            checked={showInactive}
            onChange={(e) => onToggleShowInactive(e.target.checked)}
          />
          显示停用仓库
        </label>
      </div>

      <table className="min-w-full text-sm">
        <thead className="bg-slate-50 border-b border-slate-300">
          <tr>
            <th className="px-4 py-3 text-left w-16">
              <SortHeader
                label="ID"
                sortKey={sortKey}
                sortAsc={sortAsc}
                columnKey="id"
                onSort={onSort}
              />
            </th>
            <th className="px-4 py-3 text-left w-40">
              <SortHeader
                label="仓库名称"
                sortKey={sortKey}
                sortAsc={sortAsc}
                columnKey="name"
                onSort={onSort}
              />
            </th>
            <th className="px-4 py-3 text-left w-36">
              <SortHeader
                label="仓库编码"
                sortKey={sortKey}
                sortAsc={sortAsc}
                columnKey="code"
                onSort={onSort}
              />
            </th>
            <th className="px-4 py-3 text-left w-64">地址</th>
            <th className="px-4 py-3 text-left w-32">联系人</th>
            <th className="px-4 py-3 text-left w-32">联系电话</th>
            <th className="px-4 py-3 text-left w-28">仓库面积(m²)</th>
            <th className="px-4 py-3 text-left w-28">状态</th>
            <th className="px-4 py-3 text-left w-32">操作</th>
          </tr>
        </thead>
        <tbody>
          {visibleWarehouses.map((w) => {
            const inactive = !w.active;
            return (
              <tr
                key={w.id}
                className={
                  "border-b border-slate-200 hover:bg-slate-50 " +
                  (inactive ? "bg-slate-50 text-slate-400" : "")
                }
              >
                <td className="px-4 py-3 font-medium">{w.id}</td>
                <td className="px-4 py-3">{w.name}</td>
                <td className="px-4 py-3">{w.code || "—"}</td>
                <td className="px-4 py-3">
                  {w.address && w.address.trim()
                    ? w.address
                    : "—"}
                </td>
                <td className="px-4 py-3">
                  {w.contact_name && w.contact_name.trim()
                    ? w.contact_name
                    : "—"}
                </td>
                <td className="px-4 py-3">
                  {w.contact_phone && w.contact_phone.trim()
                    ? w.contact_phone
                    : "—"}
                </td>
                <td className="px-4 py-3">
                  {typeof w.area_sqm === "number" &&
                  !Number.isNaN(w.area_sqm)
                    ? w.area_sqm
                    : "—"}
                </td>
                <td className="px-4 py-3">
                  {canWrite ? (
                    <button
                      onClick={() => onToggleActive(w)}
                      className={
                        "px-3 py-1.5 rounded-lg border text-xs " +
                        (inactive
                          ? "border-emerald-400 text-emerald-700 hover:bg-emerald-50"
                          : "border-slate-400 text-slate-800 hover:bg-slate-100")
                      }
                      disabled={saving}
                    >
                      {inactive ? "启用" : "禁用"}
                    </button>
                  ) : w.active ? (
                    "active"
                  ) : (
                    "inactive"
                  )}
                </td>
                <td className="px-4 py-3">
                  <button
                    className={
                      "px-3 py-1.5 rounded-lg border text-xs " +
                      (inactive
                        ? "border-slate-300 text-slate-400 cursor-not-allowed"
                        : "border-slate-400 text-slate-800 hover:bg-slate-100")
                    }
                    onClick={() => !inactive && onOpenDetail(w.id)}
                    disabled={inactive}
                  >
                    仓库详情
                  </button>
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </section>
  );
};
