// src/features/admin/warehouses/WarehousesTable.tsx
import React from "react";
import type { WarehouseListItem } from "./types";
import type { WarehouseSortKey } from "./useWarehousesListPresenter";
import type { FulfillmentCoverage } from "./useWarehousesListPresenter";

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

function FulfillBadge({ label }: { label: FulfillmentCoverage["fulfill_label"] }) {
  const cls =
    label === "全国覆盖"
      ? "bg-sky-100 text-sky-800"
      : label === "对外不可命中"
        ? "bg-amber-100 text-amber-900"
        : "bg-slate-100 text-slate-800";
  return (
    <span className={`inline-flex items-center rounded-full px-3 py-1 text-sm font-semibold ${cls}`}>
      {label}
    </span>
  );
}

function ActiveCarriersCell({ labels, total }: { labels: string[]; total: number }) {
  if (!labels || labels.length === 0 || total <= 0) return <div className="text-sm text-slate-500">—</div>;

  const shown = labels.slice(0, 2);
  const rest = total - shown.length;

  const text = rest > 0 ? `${shown.join("、")} +${rest}` : shown.join("、");
  const title = labels.join("、");

  return (
    <div className="text-sm text-slate-700" title={title}>
      {text}
    </div>
  );
}

type Props = {
  canRead: boolean;
  canWrite: boolean; // 兼容保留
  loading: boolean;
  saving: boolean; // 兼容保留
  visibleWarehouses: WarehouseListItem[];
  showInactive: boolean;
  onToggleShowInactive: (v: boolean) => void;
  sortKey: WarehouseSortKey;
  sortAsc: boolean;
  onSort: (key: WarehouseSortKey) => void;

  onToggleActive: (wh: WarehouseListItem) => void; // 列表页不允许改状态（兼容保留）
  onOpenDetail: (id: number) => void;

  coverageById: Record<number, FulfillmentCoverage>;

  // ✅ 新增：每个仓库“正在服务的快递公司”（事实汇总）
  activeCarriersByWarehouseId: Record<number, { labels: string[]; total: number }>;
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
  coverageById,
  activeCarriersByWarehouseId,
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

            {/* ✅ 核心：履约覆盖（事实口径） */}
            <th className="px-6 text-left w-72">履约覆盖</th>

            {/* ✅ 新增：正在服务的快递公司（事实口径） */}
            <th className="px-6 text-left w-64">正在服务的快递公司</th>

            <th className="px-6 text-left w-32">运行状态</th>
            <th className="px-6 text-left w-32">操作</th>
          </tr>
        </thead>

        <tbody>
          {visibleWarehouses.map((w) => {
            const inactive = !w.active;
            const cov = coverageById[w.id] ?? null;
            const carriers = activeCarriersByWarehouseId[w.id] ?? { labels: [], total: 0 };

            return (
              <tr
                key={w.id}
                className={
                  "border-b border-slate-200 hover:bg-slate-50 h-14 " + (inactive ? "bg-slate-50 text-slate-400" : "")
                }
              >
                <td className="px-6 font-medium">{w.id}</td>
                <td className="px-6">{renderText(w.name)}</td>
                <td className="px-6 font-mono">{renderText(w.code)}</td>
                <td className="px-6">{renderText(w.address)}</td>
                <td className="px-6">{renderText(w.contact_name)}</td>
                <td className="px-6">{renderText(w.contact_phone)}</td>
                <td className="px-6">{renderNumber(w.area_sqm)}</td>

                <td className="px-6">
                  {!cov ? (
                    <div className="text-sm text-slate-500">—</div>
                  ) : (
                    <div className="space-y-1">
                      <div className="flex items-center gap-3">
                        <div className="text-sm text-slate-700">
                          省:{cov.province_n} / 市:{cov.city_n == null ? "—" : cov.city_n}
                        </div>
                        <FulfillBadge label={cov.fulfill_label} />
                      </div>

                      {cov.fulfill_label === "对外不可命中" && (
                        <div className="text-xs text-amber-900">当前未配置任何可命中的省/市（订单将无法命中服务仓）。</div>
                      )}

                      {cov.fulfill_label === "全国覆盖" && (
                        <div className="text-xs text-sky-800">该仓库在省级口径覆盖全部可用省份（可能压制其它仓库的省级入口）。</div>
                      )}
                    </div>
                  )}
                </td>

                <td className="px-6">
                  <ActiveCarriersCell labels={carriers.labels} total={carriers.total} />
                </td>

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

      <div className="px-6 py-4 text-base text-slate-500">
        说明：「运行状态」是主数据（active）；「履约覆盖」是 Route C 口径下的“订单能否命中该仓库”的事实提示；「正在服务的快递公司」按“具备服务资格 + 正在服务”统计。
      </div>
    </section>
  );
};

export default WarehousesTable;
