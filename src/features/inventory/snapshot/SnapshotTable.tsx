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

  const renderSortArrow = (key: SortKey) => {
    if (sortKey !== key) {
      return <span className="ml-1 text-[14px] text-slate-300">↕</span>;
    }
    return (
      <span className="ml-1 text-[14px] text-slate-800">
        {sortDir === "asc" ? "▲" : "▼"}
      </span>
    );
  };

  const headerButton = (
    label: string,
    key: SortKey,
    align: "left" | "right" = "left",
  ) => (
    <button
      type="button"
      onClick={() => onChangeSort(key)}
      className={`flex w-full items-center ${
        align === "right" ? "justify-end" : "justify-start"
      } text-base font-semibold ${
        sortKey === key ? "text-slate-800" : "text-slate-500 hover:text-slate-700"
      }`}
    >
      <span>{label}</span>
      {renderSortArrow(key)}
    </button>
  );

  const plainHeader = (label: string, align: "left" | "right" = "left") => (
    <div
      className={`w-full text-base font-semibold ${
        align === "right" ? "text-right" : "text-left"
      } text-slate-500`}
    >
      {label}
    </div>
  );

  const formatDays = (v: number | null | undefined) => {
    if (v === null || v === undefined) return "-";
    if (!Number.isFinite(v)) return "-";
    if (v < 0) return "已过期";
    return `${v} 天`;
  };

  const showText = (v: string | null | undefined) => (v && v.trim() ? v.trim() : "-");

  return (
    <div className="mt-4 overflow-x-auto rounded-xl border border-slate-200 bg-white shadow-sm">
      <div className="max-h-[540px] overflow-y-auto">
        <table className="min-w-full text-sm">
          <thead className="bg-slate-50">
            <tr>
              {/* 编码 / 名称 分列 */}
              <th className="px-4 py-3 text-left">
                {headerButton("编码", "item_code")}
              </th>
              <th className="px-4 py-3 text-left">
                {headerButton("名称", "item_name")}
              </th>

              <th className="px-4 py-3 text-left">{plainHeader("单位")}</th>
              <th className="px-4 py-3 text-left">{plainHeader("规格")}</th>
              <th className="px-4 py-3 text-left">{plainHeader("品牌")}</th>
              <th className="px-4 py-3 text-left">{plainHeader("品类")}</th>

              <th className="px-4 py-3 text-right">
                {headerButton("总库存", "total_qty", "right")}
              </th>

              <th className="px-4 py-3 text-left">
                {headerButton("最早到期", "earliest_expiry")}
              </th>

              <th className="px-4 py-3 text-left">{plainHeader("剩余天数")}</th>

              <th className="px-4 py-3 text-left">
                {headerButton("风险", "near_expiry")}
              </th>

              <th className="px-4 py-3 text-left">
                {headerButton("TOP 批次", "top_qty")}
              </th>
            </tr>
          </thead>

          <tbody className="divide-y divide-slate-100 text-[15px] text-slate-700">
            {items.map((row) => {
              const first = row.top2_locations[0];
              const second = row.top2_locations[1];

              const firstLabel = first
                ? `WH${first.warehouse_id} · ${first.batch_code} · ${first.qty}`
                : "-";

              const secondLabel = second
                ? `WH${second.warehouse_id} · ${second.batch_code} · ${second.qty}`
                : "";

              const code = showText(row.item_code);
              const uom = showText(row.uom);
              const spec = showText(row.spec);
              const brand = showText(row.brand);
              const category = showText(row.category);
              const barcode = row.main_barcode?.trim() || "";

              return (
                <tr
                  key={row.item_id}
                  className="cursor-pointer hover:bg-slate-50"
                  onClick={() => onRowClick?.(row)}
                >
                  {/* 编码 */}
                  <td className="px-4 py-2 whitespace-nowrap">
                    <div className="text-[15px] font-semibold text-slate-900">{code}</div>
                    <div className="mt-0.5 text-xs text-slate-400">
                      商品ID：{row.item_id}
                      {barcode ? ` · 条码：${barcode}` : ""}
                    </div>
                  </td>

                  {/* 名称 */}
                  <td className="px-4 py-2">
                    <div className="text-[15px] font-medium text-slate-900">
                      {row.item_name}
                    </div>
                  </td>

                  {/* 单位 */}
                  <td className="px-4 py-2 whitespace-nowrap">
                    <span className="text-[14px] text-slate-700">{uom}</span>
                  </td>

                  {/* 规格 */}
                  <td className="px-4 py-2 whitespace-nowrap">
                    <span className="text-[14px] text-slate-700">{spec}</span>
                  </td>

                  {/* 品牌 */}
                  <td className="px-4 py-2 whitespace-nowrap">
                    <span className="text-[14px] text-slate-700">{brand}</span>
                  </td>

                  {/* 品类 */}
                  <td className="px-4 py-2 whitespace-nowrap">
                    <span className="text-[14px] text-slate-700">{category}</span>
                  </td>

                  {/* 总库存 */}
                  <td className="px-4 py-2 text-right">
                    <span className="text-[15px] font-semibold text-slate-900">
                      {row.total_qty}
                    </span>
                  </td>

                  {/* 最早到期 */}
                  <td className="px-4 py-2">{row.earliest_expiry ?? "无到期日"}</td>

                  {/* 剩余天数 */}
                  <td className="px-4 py-2">{formatDays(row.days_to_expiry)}</td>

                  {/* 风险 */}
                  <td className="px-4 py-2">
                    {row.near_expiry ? (
                      <span className="inline-flex rounded-full bg-amber-100 px-2 py-0.5 text-xs font-medium text-amber-800">
                        临期
                      </span>
                    ) : (
                      <span className="inline-flex rounded-full bg-emerald-50 px-2 py-0.5 text-xs font-medium text-emerald-700">
                        安全
                      </span>
                    )}
                  </td>

                  {/* TOP 批次 */}
                  <td className="px-4 py-2 text-[14px]">
                    <div>{firstLabel}</div>
                    {secondLabel && <div className="text-slate-400">{secondLabel}</div>}
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
