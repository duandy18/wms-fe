// src/features/inventory/snapshot/SnapshotTable.tsx
import React from "react";
import type { InventoryRow } from "./api";
import type { SortKey } from "./SnapshotPage";

type Props = {
  items: InventoryRow[];
  loading?: boolean;
  onRowClick?: (row: InventoryRow) => void;
  sortKey: SortKey;
  sortDir: "asc" | "desc";
  onChangeSort: (key: SortKey) => void;
};

const SnapshotTable: React.FC<Props> = ({
  items,
  loading,
  onRowClick,
  sortKey,
  sortDir,
  onChangeSort,
}) => {
  if (loading) {
    return <div className="py-8 text-sm text-slate-500">正在加载库存快照……</div>;
  }

  if (!items.length) {
    return <div className="py-8 text-sm text-slate-500">当前条件下没有库存记录。</div>;
  }

  /** ======================
   *  表头排序工具
   *  ====================== */
  const renderSortArrow = (key: SortKey) => {
    if (sortKey !== key) return <span className="ml-1 text-slate-300">↕</span>;
    return <span className="ml-1">{sortDir === "asc" ? "▲" : "▼"}</span>;
  };

  const headerButton = (
    label: string,
    key: SortKey,
    align: "left" | "right" = "left",
  ) => (
    <button
      type="button"
      onPointerDown={(e) => e.preventDefault()}
      onClick={(e) => {
        e.preventDefault();
        e.stopPropagation();
        onChangeSort(key);
      }}
      className={`select-none flex w-full items-center ${
        align === "right" ? "justify-end" : "justify-start"
      } font-semibold ${
        sortKey === key ? "text-slate-900" : "text-slate-500 hover:text-slate-700"
      }`}
    >
      <span>{label}</span>
      {renderSortArrow(key)}
    </button>
  );

  /** ======================
   *  单元格展示工具
   *  ====================== */
  const showText = (v: string | null | undefined) => (v && v.trim() ? v : "-");

  const formatDays = (v: number | null | undefined) => {
    if (v === null || v === undefined) return "-";
    if (v < 0) return "已过期";
    return `${v} 天`;
  };

  const rowKey = (row: InventoryRow) =>
    `${row.warehouse_id}-${row.item_id}-${row.batch_code ?? "NOEXP"}`;

  return (
    <div className="mt-4 overflow-x-auto rounded-xl border border-slate-200 bg-white shadow-sm">
      {/* 视口自适应高度：尽量铺满屏幕，必要时才滚动 */}
      <div className="max-h-[calc(100vh-280px)] overflow-y-auto">
        <table className="min-w-full text-sm">
          <thead className="bg-slate-50 sticky top-0 z-10">
            <tr>
              <th className="px-4 py-3 text-left">
                {headerButton("编码", "item_code")}
              </th>
              <th className="px-4 py-3 text-left">
                {headerButton("名称", "item_name")}
              </th>

              <th className="px-4 py-3 text-left text-slate-500">最小包装</th>
              <th className="px-4 py-3 text-left text-slate-500">规格</th>
              <th className="px-4 py-3 text-left text-slate-500">品牌</th>
              <th className="px-4 py-3 text-left text-slate-500">品类</th>

              <th className="px-4 py-3 text-left border-l border-slate-200">
                {headerButton("仓库", "warehouse_id")}
              </th>
              <th className="px-4 py-3 text-left">
                {headerButton("批次", "batch_code")}
              </th>

              <th className="px-4 py-3 text-right">
                {headerButton("批次库存", "total_qty", "right")}
              </th>

              <th className="px-4 py-3 text-left border-l border-slate-200">
                {headerButton("到期日", "expiry_date")}
              </th>
              <th className="px-4 py-3 text-left text-slate-500">剩余天数</th>
              <th className="px-4 py-3 text-left">
                {headerButton("风险", "near_expiry")}
              </th>
            </tr>
          </thead>

          <tbody className="divide-y divide-slate-100 text-slate-700">
            {items.map((row) => {
              const wh = `WH${row.warehouse_id}`;
              const batch = showText(row.batch_code);
              return (
                <tr
                  key={rowKey(row)}
                  className="cursor-pointer hover:bg-slate-50"
                  onClick={() => onRowClick?.(row)}
                >
                  <td className="px-4 py-2 font-semibold text-slate-900">
                    {showText(row.item_code)}
                    <div className="text-xs text-slate-400">ID: {row.item_id}</div>
                  </td>

                  <td className="px-4 py-2">{row.item_name}</td>

                  <td className="px-4 py-2">{showText(row.uom)}</td>
                  <td className="px-4 py-2">{showText(row.spec)}</td>
                  <td className="px-4 py-2">{showText(row.brand)}</td>
                  <td className="px-4 py-2">{showText(row.category)}</td>

                  <td className="px-4 py-2 border-l border-slate-100">{wh}</td>
                  <td className="px-4 py-2 font-mono text-xs">{batch}</td>

                  <td className="px-4 py-2 text-right font-semibold">
                    {row.qty}
                  </td>

                  <td className="px-4 py-2 border-l border-slate-100">
                    {row.expiry_date ?? "无到期日"}
                  </td>
                  <td className="px-4 py-2">{formatDays(row.days_to_expiry)}</td>
                  <td className="px-4 py-2">
                    {row.near_expiry ? (
                      <span className="rounded-full bg-amber-100 px-2 py-0.5 text-xs text-amber-800">
                        临期
                      </span>
                    ) : (
                      <span className="rounded-full bg-emerald-50 px-2 py-0.5 text-xs text-emerald-700">
                        安全
                      </span>
                    )}
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default SnapshotTable;
