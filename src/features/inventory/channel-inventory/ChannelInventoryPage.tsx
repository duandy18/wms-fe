// src/features/inventory/channel-inventory/ChannelInventoryPage.tsx
import React from "react";
import { useNavigate, useSearchParams } from "react-router-dom";

import { useChannelInventoryPresenter } from "./useChannelInventoryPresenter";
import { ChannelInventoryFilters } from "./ChannelInventoryFilters";
import { ChannelInventoryBindingsCard } from "./ChannelInventoryBindingsCard";
import { ChannelInventorySummaryCard } from "./ChannelInventorySummaryCard";
import { ChannelInventoryTable } from "./ChannelInventoryTable";

export default function ChannelInventoryPage() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();

  const initialPlatform = searchParams.get("platform") ?? "PDD";
  const initialShopId = searchParams.get("shop_id") ?? "";
  const initialItemId = searchParams.get("item_id") ?? "";

  const p = useChannelInventoryPresenter({
    initialPlatform,
    initialShopId,
    initialItemId,
  });

  function handleInspectStock(whId: number) {
    if (!p.data) return;
    navigate(`/tools/stocks?item_id=${p.data.item_id}&warehouse_id=${whId}`);
  }

  function handleInspectLedger(whId: number) {
    navigate(`/tools/ledger?warehouse_id=${whId}`);
  }

  return (
    <div className="space-y-6 p-6 text-base">
      {/* 头部（字号提升） */}
      <header className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="text-xl font-semibold text-slate-900">
            渠道库存诊断（Channel Inventory）
          </h1>
          <p className="text-sm text-slate-600 mt-2 leading-6">
            从店铺视角（platform / shop_id / item_id）诊断各仓 on_hand /
            reserved_open / available 的分布情况，并可直接跳转库存工具与台账工具，
            快速排查渠道可售异常、多仓路由异常、预占积压等问题。
          </p>
        </div>
      </header>

      {/* 过滤区 */}
      <ChannelInventoryFilters
        platform={p.platform}
        setPlatform={p.setPlatform}
        shopId={p.shopId}
        setShopId={p.setShopId}
        itemId={p.itemId}
        setItemId={p.setItemId}
        warehouseId={p.warehouseId}
        setWarehouseId={p.setWarehouseId}
        loading={p.loading}
        error={p.error}
        dataSummary={{
          platform: p.data?.platform,
          shop_id: p.data?.shop_id,
          item_id: p.data?.item_id,
          whCount: p.warehousesData.length,
        }}
        stores={p.stores}
        storesLoading={p.storesLoading}
        selectedStoreId={p.selectedStoreId}
        setSelectedStoreId={p.setSelectedStoreId}
        storeDetail={p.storeDetail}
        items={p.items}
        itemsLoading={p.itemsLoading}
        warehouses={p.warehouses}
        warehousesLoading={p.warehousesLoading}
        onQuery={p.query}
      />

      {/* 绑定卡片 */}
      {p.storeDetail && (
        <ChannelInventoryBindingsCard
          bindings={p.bindings}
          loading={p.storeDetailLoading}
        />
      )}

      {/* 汇总指标 */}
      <ChannelInventorySummaryCard
        hasData={p.hasData}
        totals={p.totals}
        warehouseCount={p.warehousesData.length}
      />

      {/* 表格 */}
      <ChannelInventoryTable
        warehouses={p.warehousesData}
        loading={p.loading}
        error={p.error}
        expanded={p.expanded}
        toggleExpand={p.toggleExpand}
        onInspectStock={handleInspectStock}
        onInspectLedger={handleInspectLedger}
      />
    </div>
  );
}
