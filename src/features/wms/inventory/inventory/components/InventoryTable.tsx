import React from "react";
import type {
  InventoryDetailResponse,
  InventoryRow,
} from "@/features/wms/inventory/api/contracts";
import type { SortKey } from "@/features/wms/inventory/inventory/model/inventorySort";
import InventoryInlineDetail from "./InventoryInlineDetail";

type Props = {
  items: InventoryRow[];
  loading?: boolean;
  expandedRowKey: string | null;
  detailByRowKey: Record<string, InventoryDetailResponse | undefined>;
  detailLoadingByRowKey: Record<string, boolean>;
  detailErrorByRowKey: Record<string, string>;
  onToggleExpand: (row: InventoryRow) => void;
  onRefreshDetail: (row: InventoryRow) => void;
  sortKey: SortKey;
  sortDir: "asc" | "desc";
  onChangeSort: (key: SortKey) => void;
};

function buildRowKey(row: InventoryRow): string {
  return `${row.warehouse_id}-${row.item_id}-${row.lot_code ?? "NOLOT"}`;
}

function showText(v: string | null | undefined): string {
  return v && v.trim() ? v : "-";
}

function formatDays(v: number | null | undefined): string {
  if (v === null || v === undefined) return "-";
  if (v < 0) return "已过期";
  return `${v} 天`;
}

function formatQtyWithUnit(qty: number, unit: string | null | undefined): string {
  const u = unit && unit.trim() ? unit.trim() : "";
  return u ? `${qty} ${u}` : String(qty);
}

const InventoryTable: React.FC<Props> = ({
  items,
  loading,
  expandedRowKey,
  detailByRowKey,
  detailLoadingByRowKey,
  detailErrorByRowKey,
  onToggleExpand,
  onRefreshDetail,
  sortKey,
  sortDir,
  onChangeSort,
}) => {
  if (loading) {
    return <div className="py-8 text-sm text-slate-500">正在加载库存……</div>;
  }

  if (!items.length) {
    return <div className="py-8 text-sm text-slate-500">当前条件下没有库存记录。</div>;
  }

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
      className={`flex w-full select-none items-center ${
        align === "right" ? "justify-end" : "justify-start"
      } font-semibold ${
        sortKey === key ? "text-slate-900" : "text-slate-500 hover:text-slate-700"
      }`}
    >
      <span>{label}</span>
      {renderSortArrow(key)}
    </button>
  );

  return (
    <div className="mt-4 overflow-x-auto rounded-xl border border-slate-200 bg-white shadow-sm">
      <div className="max-h-[calc(100vh-280px)] overflow-y-auto">
        <table className="min-w-full text-sm">
          <thead className="sticky top-0 z-10 bg-slate-50">
            <tr>
              <th className="px-4 py-3 text-left">{headerButton("编码", "item_code")}</th>
              <th className="px-4 py-3 text-left">{headerButton("名称", "item_name")}</th>
              <th className="px-4 py-3 text-left text-slate-500">规格</th>
              <th className="px-4 py-3 text-left text-slate-500">品牌</th>
              <th className="px-4 py-3 text-left text-slate-500">品类</th>
              <th className="border-l border-slate-200 px-4 py-3 text-left">
                {headerButton("仓库", "warehouse_id")}
              </th>
              <th className="px-4 py-3 text-left">{headerButton("批次", "lot_code")}</th>
              <th className="px-4 py-3 text-right">{headerButton("库存", "qty", "right")}</th>
              <th className="px-4 py-3 text-left text-slate-500">单位</th>
              <th className="border-l border-slate-200 px-4 py-3 text-left">
                {headerButton("到期日", "expiry_date")}
              </th>
              <th className="px-4 py-3 text-left text-slate-500">剩余天数</th>
              <th className="px-4 py-3 text-left">
                {headerButton("风险", "near_expiry")}
              </th>
              <th className="px-4 py-3 text-left text-slate-500">操作</th>
            </tr>
          </thead>

          <tbody className="divide-y divide-slate-100 text-slate-700">
            {items.map((row) => {
              const rowKey = buildRowKey(row);
              const warehouseText =
                row.warehouse_name && row.warehouse_name.trim()
                  ? row.warehouse_name
                  : `仓库 ${row.warehouse_id}`;
              const lot = showText(row.lot_code);
              const isExpanded = expandedRowKey === rowKey;

              return (
                <React.Fragment key={rowKey}>
                  <tr
                    className={`cursor-pointer ${isExpanded ? "bg-slate-50" : "hover:bg-slate-50"}`}
                    onClick={() => {
                      void onToggleExpand(row);
                    }}
                  >
                    <td className="px-4 py-2 font-semibold text-slate-900">
                      {showText(row.item_code)}
                      <div className="text-xs text-slate-400">ID: {row.item_id}</div>
                    </td>

                    <td className="px-4 py-2">{row.item_name}</td>
                    <td className="px-4 py-2">{showText(row.spec)}</td>
                    <td className="px-4 py-2">{showText(row.brand)}</td>
                    <td className="px-4 py-2">{showText(row.category)}</td>

                    <td className="border-l border-slate-100 px-4 py-2">{warehouseText}</td>
                    <td className="px-4 py-2 font-mono text-xs">{lot}</td>

                    <td className="px-4 py-2 text-right font-semibold">{row.qty}</td>
                    <td className="px-4 py-2">{showText(row.base_uom_name)}</td>

                    <td className="border-l border-slate-100 px-4 py-2">
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
                    <td className="px-4 py-2">
                      <button
                        type="button"
                        className="rounded-md border border-slate-300 px-2 py-1 text-xs hover:bg-slate-50"
                        onClick={(e) => {
                          e.preventDefault();
                          e.stopPropagation();
                          void onToggleExpand(row);
                        }}
                      >
                        {isExpanded ? "收起" : "查看"}
                      </button>
                    </td>
                  </tr>

                  {isExpanded ? (
                    <tr>
                      <td colSpan={13} className="bg-white px-4 py-3">
                        <div className="mb-3 text-xs text-slate-500">
                          当前行摘要：{warehouseText} / 批次 {lot} / 数量{" "}
                          {formatQtyWithUnit(row.qty, row.base_uom_name)}
                        </div>

                        <InventoryInlineDetail
                          detail={detailByRowKey[rowKey] ?? null}
                          loading={Boolean(detailLoadingByRowKey[rowKey])}
                          error={detailErrorByRowKey[rowKey] ?? ""}
                          onRefresh={() => {
                            void onRefreshDetail(row);
                          }}
                        />
                      </td>
                    </tr>
                  ) : null}
                </React.Fragment>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default InventoryTable;
