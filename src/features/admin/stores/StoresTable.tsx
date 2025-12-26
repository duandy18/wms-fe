// src/features/admin/stores/StoresTable.tsx

import React from "react";
import type { StoreListItem, RouteMode } from "./types";
import type { SortKey } from "./useStoresListPresenter";
import { UI } from "./ui";

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
    <button type="button" onClick={() => onSort(columnKey)} className={`${UI.sortBtnBase} ${isActive ? UI.sortBtnActive : UI.sortBtnIdle}`}>
      <span>{label}</span>
      {arrow ? <span className={UI.sortArrow}>{arrow}</span> : null}
    </button>
  );
}

export const StoresTable: React.FC<StoresTableProps> = ({
  canRead,
  canWrite,
  loading,
  saving,
  error,
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
      <section className={UI.tableSection}>
        <div className={UI.tableEmpty}>你没有 admin.stores 权限。</div>
      </section>
    );
  }

  if (loading) {
    return (
      <section className={UI.tableSection}>
        <div className={UI.tableLoading}>加载中…</div>
      </section>
    );
  }

  if (visibleStores.length === 0) {
    return (
      <section className={UI.tableSection}>
        <div className={UI.tableEmpty}>{showInactive ? "暂无店铺记录。" : "暂无启用的店铺。"}</div>
      </section>
    );
  }

  return (
    <section className={UI.tableSection}>
      <div className={UI.tableToolbar}>
        <div className={UI.tableToolbarText}>
          共 {visibleStores.length} 条（当前仅显示{showInactive ? "全部店铺" : "启用店铺"}）
        </div>
        <label className={UI.tableToolbarToggle}>
          <input type="checkbox" checked={showInactive} onChange={(e) => onToggleShowInactive(e.target.checked)} />
          显示停用店铺
        </label>
      </div>

      {error ? <div className="px-4 pb-3 text-sm text-red-600">{error}</div> : null}

      <table className={UI.table}>
        <thead className={UI.thead}>
          <tr>
            <th className={`${UI.th} ${UI.colW16}`}>
              <SortHeader label="ID" sortKey={sortKey} sortAsc={sortAsc} columnKey="id" onSort={onSort} />
            </th>

            <th className={`${UI.th} ${UI.colW24}`}>
              <SortHeader label="platform" sortKey={sortKey} sortAsc={sortAsc} columnKey="platform" onSort={onSort} />
            </th>

            <th className={`${UI.th} ${UI.colW40}`}>
              <SortHeader label="shop_id" sortKey={sortKey} sortAsc={sortAsc} columnKey="shop_id" onSort={onSort} />
            </th>

            <th className={`${UI.th} ${UI.colW48}`}>
              <SortHeader label="名称" sortKey={sortKey} sortAsc={sortAsc} columnKey="name" onSort={onSort} />
            </th>

            <th className={`${UI.th} ${UI.colW40}`}>
              出库路由模式
              <span className={UI.thHint}>默认：主仓（STRICT_TOP）；可选：主仓+备仓兜底（FALLBACK）</span>
            </th>

            <th className={`${UI.th} ${UI.colW32}`}>联系人</th>
            <th className={`${UI.th} ${UI.colW32}`}>联系电话</th>
            <th className={`${UI.th} ${UI.colW56}`}>Email</th>
            <th className={`${UI.th} ${UI.colW28}`}>状态</th>
            <th className={`${UI.th} ${UI.colW32}`}>操作</th>
          </tr>
        </thead>

        <tbody>
          {visibleStores.map((s) => {
            const inactive = !s.active;

            return (
              <tr key={s.id} className={`${UI.tr} ${inactive ? UI.trInactive : ""}`}>
                <td className={UI.tdStrong}>{s.id}</td>
                <td className={UI.tdText}>{s.platform}</td>
                <td className={UI.tdText}>{s.shop_id}</td>
                <td className={UI.tdText}>{s.name}</td>

                <td className={UI.tdText}>
                  {canWrite && !inactive ? (
                    <select className={UI.routeSelect} value={s.route_mode} onChange={(e) => onRouteModeChange(s, e.target.value as RouteMode)}>
                      <option value="STRICT_TOP">主仓（严格，仅主仓）</option>
                      <option value="FALLBACK">主仓+备仓兜底（FALLBACK）</option>
                    </select>
                  ) : (
                    <span>{renderRouteModeLabel(s.route_mode)}</span>
                  )}
                </td>

                <td className={UI.tdText}>{s.contact_name && s.contact_name.trim() ? s.contact_name : "—"}</td>
                <td className={UI.tdText}>{s.contact_phone && s.contact_phone.trim() ? s.contact_phone : "—"}</td>
                <td className={UI.tdText}>{s.email && s.email.trim() ? s.email : "—"}</td>

                <td className={UI.tdText}>
                  {canWrite ? (
                    <button onClick={() => onToggleActive(s)} className={`${UI.btnSmBase} ${inactive ? UI.btnEnable : UI.btnDisable}`} disabled={saving}>
                      {inactive ? "启用" : "禁用"}
                    </button>
                  ) : s.active ? (
                    "active"
                  ) : (
                    "inactive"
                  )}
                </td>

                <td className={UI.tdText}>
                  <button
                    className={`${UI.btnSmBase} ${inactive ? UI.btnDetailDisabled : UI.btnDetailIdle}`}
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

export default StoresTable;
