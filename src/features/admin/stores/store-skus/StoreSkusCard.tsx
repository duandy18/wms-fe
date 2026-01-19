// src/features/admin/stores/store-skus/StoreSkusCard.tsx

import React from "react";
import { useStoreSkusModel } from "./useStoreSkusModel";
import { StoreSkuAddPanel } from "./StoreSkuAddPanel";
import { StoreSkuTable } from "./StoreSkuTable";

type Props = {
  canWrite: boolean;
  store: {
    store_id: number;
    platform: string;
    shop_id: string;
  };
};

export function StoreSkusCard({ canWrite, store }: Props) {
  const m = useStoreSkusModel({ storeId: store.store_id, canWrite });

  return (
    <section className="rounded-lg border bg-white p-4 space-y-3">
      <div className="flex items-start justify-between gap-3">
        <div>
          <div className="text-base font-semibold">商铺 SKU</div>
          <div className="mt-1 text-sm text-slate-600">
            这张表回答：这个店铺卖哪些 SKU，以及每个 SKU 的履约仓是否已设置（缺失=硬缺口，不兜底）。
          </div>
        </div>

        <button
          type="button"
          onClick={() => void m.reloadStoreSkus()}
          disabled={m.loading}
          className="text-[11px] px-2 py-1 rounded border border-slate-300 text-slate-600 hover:bg-slate-50 disabled:opacity-60"
        >
          {m.loading ? "刷新中…" : "刷新"}
        </button>
      </div>

      {m.apiMissing && (
        <div className="rounded-md border border-amber-100 bg-amber-50 px-3 py-2 text-sm text-amber-800">
          后端尚未提供 store_items 接口：需要补齐
          <span className="font-mono mx-1">GET/POST/DELETE /stores/{store.store_id}/items</span>。
        </div>
      )}

      {m.err && (
        <div className="rounded-md border border-red-100 bg-red-50 px-3 py-2 text-sm text-red-600">
          {m.err}
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
      />
    </section>
  );
}
