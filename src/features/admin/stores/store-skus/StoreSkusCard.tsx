// src/features/admin/stores/store-skus/StoreSkusCard.tsx

import React from "react";
import { useStoreSkusModel } from "./useStoreSkusModel";
import { StoreSkuAddPanel } from "./StoreSkuAddPanel";
import { StoreSkuTable } from "./StoreSkuTable";
import type { StoreBinding } from "../types";

type Props = {
  canWrite: boolean;
  store: {
    store_id: number;
    platform: string;
    shop_id: string;
  };
  bindings: StoreBinding[];
};

export function StoreSkusCard({ canWrite, store, bindings }: Props) {
  const m = useStoreSkusModel({
    storeId: store.store_id,
    canWrite,
    platform: store.platform,
    shopId: store.shop_id,
    bindings,
  });

  const busy = m.loading || m.invLoadingAny;

  return (
    <section className="rounded-lg border bg-white p-4 space-y-3">
      <div className="flex items-start justify-between gap-3">
        <div>
          <div className="text-base font-semibold">商铺商品（售卖清单）</div>
        </div>

        <div className="flex items-center gap-2">
          {/* 主按钮：刷新库存 */}
          <button
            type="button"
            onClick={() => void m.reloadAllInventories()}
            disabled={busy}
            className="rounded-md bg-slate-900 px-4 py-2 text-sm font-semibold text-white hover:bg-slate-800 disabled:opacity-60"
            title="批量从后端刷新各仓可售库存"
          >
            {m.invLoadingAny ? "库存刷新中…" : "刷新库存"}
          </button>

          {/* 次按钮：刷新商品 */}
          <button
            type="button"
            onClick={() => void m.reloadStoreSkus()}
            disabled={busy}
            className="rounded-md border border-slate-300 bg-white px-4 py-2 text-sm font-semibold text-slate-700 hover:bg-slate-50 disabled:opacity-60"
          >
            {m.loading ? "刷新中…" : "刷新商品"}
          </button>
        </div>
      </div>

      {m.apiMissing && (
        <div className="rounded-md border border-amber-100 bg-amber-50 px-3 py-2 text-sm text-amber-800">
          当前后端尚未接入“商铺商品绑定”接口，页面仅可预览（无法增删）。
        </div>
      )}

      {m.err && (
        <div className="rounded-md border border-red-100 bg-red-50 px-3 py-2 text-sm text-red-600">
          {m.err}
        </div>
      )}

      {m.invError && (
        <div className="rounded-md border border-amber-100 bg-amber-50 px-3 py-2 text-sm text-amber-800">
          {m.invError}
        </div>
      )}

      <StoreSkuAddPanel
        canWrite={canWrite}
        loading={m.loading}
        kw={m.kw}
        onKwChange={m.setKw}
        cands={m.cands}
        itemsLoading={m.itemsLoading}
        itemsError={m.itemsError}
        selectedItemId={m.selectedItemId}
        onSelectItemId={m.setSelectedItemId}
        onAdd={() => void m.addSelectedSku()}
        onSearch={() => m.triggerSearch()}
      />

      <StoreSkuTable
        rows={m.rows}
        loading={m.loading}
        canWrite={canWrite}
        onRemove={(itemId) => void m.removeSku(itemId)}
        inventoryByItemId={m.inventoryByItemId}
        warehouseOptions={m.warehouseOptions}
        invLoadingItemIds={m.invLoadingItemIds}
      />
    </section>
  );
}
