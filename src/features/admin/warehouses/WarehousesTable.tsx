// src/features/admin/warehouses/WarehousesTable.tsx
import React from "react";
import type { WarehouseListItem } from "./types";
import type { WarehouseSortKey } from "./useWarehousesListPresenter";

function renderText(v: string | null | undefined) {
  return v && v.trim() ? v : "—";
}
function renderNumber(v: number | null | undefined) {
  return typeof v === "number" && !Number.isNaN(v) ? v : "—";
}

function StatusBadge({ active }: { active: boolean }) {
  return (
    <span
      className={
        "inline-flex items-center rounded-full px-4 py-1.5 text-base font-semibold " +
        (active ? "bg-emerald-100 text-emerald-800" : "bg-red-100 text-red-800")
      }
    >
      {active ? "运行中" : "已停运"}
    </span>
  );
}

type Props = {
  canRead: boolean;
  canWrite: boolean; // ✅ 上层仍在传；列表页不使用，但必须保留类型兼容
  loading: boolean;
  saving: boolean; // 兼容保留，列表页不使用
  visibleWarehouses: WarehouseListItem[];
  showInactive: boolean;
  onToggleShowInactive: (v: boolean) => void;
  sortKey: WarehouseSortKey;
  sortAsc: boolean;
  onSort: (key: WarehouseSortKey) => void;

  // ⚠️ 列表页不允许改状态（防误操作）
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
      className={"inline-flex items-center gap-1 " + (isActive ? "text-slate-900 font-semibold" : "text-slate-700")}
    >
      <span>{label}</span>
      {arrow && <span className="text-base">{arrow}</span>}
    </button>
  );
}

export const WarehousesTable: React.FC<Props> = ({
  canRead,
  canWrite: _canWrite,
  loading,
  visibleWarehouses,
  showInactive,
  onToggleShowInactive,
  sortKey,
  sortAsc,
  onSort,
  onOpenDetail,
}) => {
  // ✅ 明确吞掉，避免 unused vars，同时不改变“列表页不可改状态”的裁决
  void _canWrite;

  if (!canRead) {
    return (
      <section className="bg-white border border-slate-200 rounded-xl">
        <div className="px-6 py-8 text-lg text-slate-500">无权限访问仓库管理</div>
      </section>
    );
  }

  if (loading) {
    return (
      <section className="bg-white border border-slate-200 rounded-xl">
        <div className="px-6 py-8 text-lg text-slate-600">加载中…</div>
      </section>
    );
  }

  if (visibleWarehouses.length === 0) {
    return (
      <section className="bg-white border border-slate-200 rounded-xl">
        <div className="px-6 py-8 text-lg text-slate-500">{showInactive ? "暂无仓库记录。" : "暂无运行中的仓库。"}</div>
      </section>
    );
  }

  return (
    <section className="bg-white border border-slate-200 rounded-xl overflow-hidden">
      <div className="px-6 py-4 flex items-center justify-between">
        <div className="text-lg text-slate-600">
          共 {visibleWarehouses.length} 条（当前仅显示{showInactive ? "全部仓库" : "运行中仓库"}）
        </div>
        <label className="text-lg text-slate-700 flex items-center gap-2">
          <input
            type="checkbox"
            checked={showInactive}
            onChange={(e) => onToggleShowInactive(e.target.checked)}
            className="scale-125"
          />
          显示已停运仓库
        </label>
      </div>

      <table className="min-w-full text-lg">
        <thead className="bg-slate-50 border-b border-slate-300">
          <tr className="h-14">
            <th className="px-6 text-left w-20">
              <SortHeader label="ID" sortKey={sortKey} sortAsc={sortAsc} columnKey="id" onSort={onSort} />
            </th>
            <th className="px-6 text-left w-48">
              <SortHeader label="仓库名称" sortKey={sortKey} sortAsc={sortAsc} columnKey="name" onSort={onSort} />
            </th>
            <th className="px-6 text-left w-40">
              <SortHeader label="仓库编码" sortKey={sortKey} sortAsc={sortAsc} columnKey="code" onSort={onSort} />
            </th>
            <th className="px-6 text-left w-72">地址</th>
            <th className="px-6 text-left w-40">联系人</th>
            <th className="px-6 text-left w-44">联系电话</th>
            <th className="px-6 text-left w-40">仓库面积 (㎡)</th>
            <th className="px-6 text-left w-32">运行状态</th>
            <th className="px-6 text-left w-32">操作</th>
          </tr>
        </thead>

        <tbody>
          {visibleWarehouses.map((w) => {
            const inactive = !w.active;

            return (
              <tr
                key={w.id}
                className={"border-b border-slate-200 hover:bg-slate-50 h-14 " + (inactive ? "bg-slate-50 text-slate-400" : "")}
              >
                <td className="px-6 font-medium">{w.id}</td>
                <td className="px-6">{renderText(w.name)}</td>
                <td className="px-6 font-mono">{renderText(w.code)}</td>
                <td className="px-6">{renderText(w.address)}</td>
                <td className="px-6">{renderText(w.contact_name)}</td>
                <td className="px-6">{renderText(w.contact_phone)}</td>
                <td className="px-6">{renderNumber(w.area_sqm)}</td>

                <td className="px-6">
                  <StatusBadge active={w.active} />
                </td>

                <td className="px-6">
                  <button
                    type="button"
                    onClick={() => onOpenDetail(w.id)}
                    className="px-4 py-2 rounded-lg border text-base border-slate-400 text-slate-800 hover:bg-slate-100"
                  >
                    编辑
                  </button>
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>

      <div className="px-6 py-4 text-base text-slate-500">仓库运行状态只能在“编辑”页面中修改，列表页仅用于查看，避免误操作。</div>
    </section>
  );
};

export default WarehousesTable;
