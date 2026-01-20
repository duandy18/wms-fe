// src/features/admin/stores/store-skus/StoreSkuTable.tsx

import React, { useMemo } from "react";
import type { StoreSkuListItem } from "../types";
import type { WarehouseAvailableModel } from "../../../inventory/global-available/types";
import type { WarehouseOption } from "./useStoreSkusModel";

export function StoreSkuTable(props: {
  rows: StoreSkuListItem[];
  loading: boolean;
  canWrite: boolean;
  onRemove: (itemId: number) => void;

  inventoryByItemId: Record<number, WarehouseAvailableModel[]>;
  warehouseOptions: WarehouseOption[];
  invLoadingItemIds: Record<number, boolean>;
}) {
  const { rows, loading, canWrite, onRemove, inventoryByItemId, warehouseOptions, invLoadingItemIds } =
    props;

  const warehouses = warehouseOptions;

  const inventoryIndex = useMemo(() => {
    const map = new Map<string, number>();
    for (const [itemIdStr, list] of Object.entries(inventoryByItemId)) {
      const itemId = Number(itemIdStr);
      for (const w of list ?? []) {
        map.set(`${itemId}:${w.warehouse_id}`, w.available);
      }
    }
    return map;
  }, [inventoryByItemId]);

  return (
    <div className="overflow-x-auto rounded-lg border border-slate-200">
      <table className="min-w-full border-collapse text-base">
        <thead className="bg-slate-50 border-b border-slate-200">
          <tr>
            <th className="px-3 py-3 text-left font-semibold whitespace-nowrap">商品</th>

            {warehouses.map((wh) => (
              <th
                key={wh.warehouse_id}
                className="px-3 py-3 text-center font-semibold whitespace-nowrap"
                title={wh.label || wh.code}
              >
                {wh.code}
              </th>
            ))}

            <th className="px-3 py-3 text-right font-semibold w-24">操作</th>
          </tr>
        </thead>

        <tbody>
          {rows.length === 0 ? (
            <tr>
              <td colSpan={warehouses.length + 2} className="px-3 py-4 text-slate-500">
                {loading ? "加载中…" : "暂无商品。请先搜索并加入商品到商铺。"}
              </td>
            </tr>
          ) : (
            rows.map((r) => {
              const name = (r.item_name ?? "").trim();
              const sku = (r.platform_sku ?? "").trim();
              const invLoading = !!invLoadingItemIds[r.item_id];

              return (
                <tr key={r.item_id} className="border-b border-slate-100 hover:bg-slate-50">
                  <td className="px-3 py-3 align-top whitespace-nowrap">
                    <div className="font-semibold text-slate-900">{name || `商品 #${r.item_id}`}</div>
                    <div className="mt-0.5 text-xs text-slate-500">
                      商品编号：<span className="font-mono">{r.item_id}</span>
                      {sku ? (
                        <>
                          {" "}
                          · SKU：<span className="font-mono">{sku}</span>
                        </>
                      ) : null}
                    </div>
                  </td>

                  {warehouses.map((wh) => {
                    const key = `${r.item_id}:${wh.warehouse_id}`;
                    const available = inventoryIndex.get(key);

                    return (
                      <td key={wh.warehouse_id} className="px-3 py-3 text-center font-mono">
                        {invLoading ? (
                          <span className="text-slate-400">…</span>
                        ) : available == null ? (
                          <span className="text-slate-400">—</span>
                        ) : (
                          <span className={available === 0 ? "text-rose-600 font-semibold" : "text-slate-800"}>
                            {available}
                          </span>
                        )}
                      </td>
                    );
                  })}

                  <td className="px-3 py-3 text-right">
                    <button
                      type="button"
                      disabled={!canWrite || loading}
                      onClick={() => onRemove(r.item_id)}
                      className="rounded-md border border-rose-200 px-3 py-1.5 text-sm font-semibold text-rose-700 hover:bg-rose-50 disabled:opacity-60"
                    >
                      移除
                    </button>
                  </td>
                </tr>
              );
            })
          )}
        </tbody>
      </table>
    </div>
  );
}
