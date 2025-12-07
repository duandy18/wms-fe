// src/features/admin/stores/StoresTable.tsx

import React from "react";
import type { StoreListItem, RouteMode } from "./types";
import type { SortKey } from "./useStoresListPresenter";

type StoresTableProps = {
  canRead: boolean;
  canWrite: boolean;
  loading: boolean;
  saving: boolean;
  error: string | null;

  visibleStores: StoreListItem[];
  showInactive: boolean;
  onToggleShowInactive: (v: boolean) => void;

  sortKey: SortKey;
  sortAsc: boolean;
  onSort: (key: SortKey) => void;

  onToggleActive: (store: StoreListItem) => void;
  onRouteModeChange: (store: StoreListItem, mode: RouteMode) => void;
  onOpenDetail: (storeId: number) => void;
};

function renderRouteModeLabel(mode: RouteMode) {
  if (mode === "STRICT_TOP") return "主仓（严格，仅主仓）";
  if (mode === "FALLBACK") return "主仓+备仓兜底";
  return mode;
}

function SortHeader({
  label,
  sortKey,
  sortAsc,
  columnKey,
  onSort,
}: {
  label: string;
  sortKey: SortKey;
  sortAsc: boolean;
  columnKey: SortKey;
  onSort: (key: SortKey) => void;
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

export const StoresTable: React.FC<StoresTableProps> = ({
  canRead,
  canWrite,
  loading,
  saving,
  visibleStores,
  showInactive,
  onToggleShowInactive,
  sortKey,
  sortAsc,
  onSort,
  onToggleActive,
  onRouteModeChange,
  onOpenDetail,
}) => {
  if (!canRead) {
    return (
      <section className="bg-white border border-slate-200 rounded-xl overflow-hidden">
        <div className="px-4 py-6 text-base text-slate-500">
          你没有 admin.stores 权限。
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

  if (visibleStores.length === 0) {
    return (
      <section className="bg-white border border-slate-200 rounded-xl overflow-hidden">
        <div className="px-4 py-6 text-base text-slate-500">
          {showInactive ? "暂无店铺记录。" : "暂无启用的店铺。"}
        </div>
      </section>
    );
  }

  return (
    <section className="bg-white border border-slate-200 rounded-xl overflow-hidden">
      {/* 顶部工具条：显示停用店铺 */}
      <div className="px-4 pt-3 pb-2 flex items-center justify-between">
        <div className="text-sm text-slate-500">
          共 {visibleStores.length} 条（当前仅显示
          {showInactive ? "全部店铺" : "启用店铺"}）
        </div>
        <label className="text-sm text-slate-600 flex items-center gap-2">
          <input
            type="checkbox"
            checked={showInactive}
            onChange={(e) => onToggleShowInactive(e.target.checked)}
          />
          显示停用店铺
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
            <th className="px-4 py-3 text-left w-24">
              <SortHeader
                label="platform"
                sortKey={sortKey}
                sortAsc={sortAsc}
                columnKey="platform"
                onSort={onSort}
              />
            </th>
            <th className="px-4 py-3 text-left w-40">
              <SortHeader
                label="shop_id"
                sortKey={sortKey}
                sortAsc={sortAsc}
                columnKey="shop_id"
                onSort={onSort}
              />
            </th>
            <th className="px-4 py-3 text-left w-48">
              <SortHeader
                label="名称"
                sortKey={sortKey}
                sortAsc={sortAsc}
                columnKey="name"
                onSort={onSort}
              />
            </th>
            <th className="px-4 py-3 text-left w-40">
              出库路由模式
              <span className="block text-xs text-slate-500">
                默认：主仓（STRICT_TOP）；可选：主仓+备仓兜底（FALLBACK）
              </span>
            </th>
            <th className="px-4 py-3 text-left w-32">联系人</th>
            <th className="px-4 py-3 text-left w-32">联系电话</th>
            <th className="px-4 py-3 text-left w-56">Email</th>
            <th className="px-4 py-3 text-left w-28">状态</th>
            <th className="px-4 py-3 text-left w-32">操作</th>
          </tr>
        </thead>

        <tbody>
          {visibleStores.map((s) => {
            const inactive = !s.active;
            return (
              <tr
                key={s.id}
                className={
                  "border-b border-slate-200 hover:bg-slate-50 " +
                  (inactive ? "bg-slate-50 text-slate-400" : "")
                }
              >
                <td className="px-4 py-3 font-medium text-sm">{s.id}</td>
                <td className="px-4 py-3 text-sm">{s.platform}</td>
                <td className="px-4 py-3 text-sm">{s.shop_id}</td>
                <td className="px-4 py-3 text-sm">{s.name}</td>

                <td className="px-4 py-3 text-sm">
                  {canWrite && !inactive ? (
                    <select
                      className="border rounded px-3 py-1.5 text-sm"
                      value={s.route_mode}
                      onChange={(e) =>
                        onRouteModeChange(
                          s,
                          e.target.value as RouteMode,
                        )
                      }
                    >
                      <option value="STRICT_TOP">
                        主仓（严格，仅主仓）
                      </option>
                      <option value="FALLBACK">
                        主仓+备仓兜底（FALLBACK）
                      </option>
                    </select>
                  ) : (
                    <span>{renderRouteModeLabel(s.route_mode)}</span>
                  )}
                </td>

                <td className="px-4 py-3 text-sm">
                  {s.contact_name && s.contact_name.trim()
                    ? s.contact_name
                    : "—"}
                </td>
                <td className="px-4 py-3 text-sm">
                  {s.contact_phone && s.contact_phone.trim()
                    ? s.contact_phone
                    : "—"}
                </td>
                <td className="px-4 py-3 text-sm">
                  {s.email && s.email.trim() ? s.email : "—"}
                </td>

                <td className="px-4 py-3 text-sm">
                  {canWrite ? (
                    <button
                      onClick={() => onToggleActive(s)}
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
                  ) : s.active ? (
                    "active"
                  ) : (
                    "inactive"
                  )}
                </td>

                <td className="px-4 py-3 text-sm">
                  <button
                    className={
                      "px-3 py-1.5 rounded-lg border text-xs " +
                      (inactive
                        ? "border-slate-300 text-slate-400 cursor-not-allowed"
                        : "border-slate-400 text-slate-800 hover:bg-slate-100")
                    }
                    onClick={() => !inactive && onOpenDetail(s.id)}
                    disabled={inactive}
                  >
                    店铺详情
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
