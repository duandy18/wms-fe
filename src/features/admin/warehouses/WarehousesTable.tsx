// src/features/admin/warehouses/WarehousesTable.tsx

import React from "react";
import type { WarehouseListItem } from "./types";
import type { WarehouseSortKey } from "./useWarehousesListPresenter";
import { UI } from "./ui";

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
      className={`${UI.sortBtnBase} ${isActive ? UI.sortBtnActive : UI.sortBtnIdle}`}
    >
      <span>{label}</span>
      {arrow ? <span className={UI.sortArrow}>{arrow}</span> : null}
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
      <section className={UI.tableSection}>
        <div className={UI.tableEmpty}>你没有 admin.stores 权限（仓库管理需要该权限）。</div>
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

  if (visibleWarehouses.length === 0) {
    return (
      <section className={UI.tableSection}>
        <div className={UI.tableEmpty}>{showInactive ? "暂无仓库记录。" : "暂无启用的仓库。"}</div>
      </section>
    );
  }

  return (
    <section className={UI.tableSection}>
      <div className={UI.tableToolbar}>
        <div className={UI.tableToolbarText}>
          共 {visibleWarehouses.length} 条（当前仅显示{showInactive ? "全部仓库" : "启用仓库"}）
        </div>
        <label className={UI.tableToolbarToggle}>
          <input type="checkbox" checked={showInactive} onChange={(e) => onToggleShowInactive(e.target.checked)} />
          显示停用仓库
        </label>
      </div>

      <table className={UI.table}>
        <thead className={UI.thead}>
          <tr>
            <th className={`${UI.th} ${UI.colW16}`}>
              <SortHeader label="ID" sortKey={sortKey} sortAsc={sortAsc} columnKey="id" onSort={onSort} />
            </th>

            <th className={`${UI.th} ${UI.colW40}`}>
              <SortHeader label="仓库名称" sortKey={sortKey} sortAsc={sortAsc} columnKey="name" onSort={onSort} />
            </th>

            <th className={`${UI.th} ${UI.colW36}`}>
              <SortHeader label="仓库编码" sortKey={sortKey} sortAsc={sortAsc} columnKey="code" onSort={onSort} />
            </th>

            <th className={`${UI.th} ${UI.colW64}`}>地址</th>
            <th className={`${UI.th} ${UI.colW32}`}>联系人</th>
            <th className={`${UI.th} ${UI.colW32}`}>联系电话</th>
            <th className={`${UI.th} ${UI.colW28}`}>仓库面积(m²)</th>
            <th className={`${UI.th} ${UI.colW28}`}>状态</th>
            <th className={`${UI.th} ${UI.colW32}`}>操作</th>
          </tr>
        </thead>

        <tbody>
          {visibleWarehouses.map((w) => {
            const inactive = !w.active;

            return (
              <tr key={w.id} className={`${UI.tr} ${inactive ? UI.trInactive : ""}`}>
                <td className={UI.tdStrong}>{w.id}</td>
                <td className={UI.td}>{w.name}</td>
                <td className={UI.td}>{w.code || "—"}</td>
                <td className={UI.td}>{w.address && w.address.trim() ? w.address : "—"}</td>
                <td className={UI.td}>{w.contact_name && w.contact_name.trim() ? w.contact_name : "—"}</td>
                <td className={UI.td}>{w.contact_phone && w.contact_phone.trim() ? w.contact_phone : "—"}</td>
                <td className={UI.td}>{typeof w.area_sqm === "number" && !Number.isNaN(w.area_sqm) ? w.area_sqm : "—"}</td>

                <td className={UI.td}>
                  {canWrite ? (
                    <button
                      onClick={() => onToggleActive(w)}
                      className={`${UI.btnCellBase} ${inactive ? UI.btnEnable : UI.btnDisable}`}
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

                <td className={UI.td}>
                  <button
                    className={`${UI.btnCellBase} ${inactive ? UI.btnDetailDisabled : UI.btnDetailIdle}`}
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
