// src/features/inventory/channel-inventory/useChannelInventoryPresenter.ts
import { useEffect, useMemo, useState } from "react";
import { fetchMultiInventory, fetchSingleInventory } from "./api";
import type {
  ChannelInventoryMultiModel,
  WarehouseInventoryModel,
} from "./types";

import { fetchStores, fetchStoreDetail } from "../../admin/stores/api";
import type {
  StoreListItem,
  StoreDetailData,
  StoreBinding,
} from "../../admin/stores/types";

import { fetchItems, type Item } from "../../admin/items/api";
import { apiGet } from "../../../lib/api";

type WarehouseOption = {
  id: number;
  name: string;
  code?: string | null;
  active?: boolean;
};

type WarehouseApiRow = {
  id: number;
  name?: string | null;
  code?: string | null;
  active?: boolean;
};

export type ChannelInventoryPresenter = ReturnType<
  typeof useChannelInventoryPresenter
>;

export function useChannelInventoryPresenter(params: {
  initialPlatform: string;
  initialShopId: string;
  initialItemId: string;
}) {
  const { initialPlatform, initialShopId, initialItemId } = params;

  // 查询条件
  const [platform, setPlatform] = useState(initialPlatform);
  const [shopId, setShopId] = useState(initialShopId);
  const [itemId, setItemId] = useState(initialItemId);
  const [warehouseId, setWarehouseId] = useState("");

  // 渠道库存数据
  const [data, setData] = useState<ChannelInventoryMultiModel | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [expanded, setExpanded] = useState<Record<number, boolean>>({});

  // 店铺列表 & 详情
  const [stores, setStores] = useState<StoreListItem[]>([]);
  const [storesLoading, setStoresLoading] = useState(false);
  const [selectedStoreId, setSelectedStoreId] = useState<number | null>(null);

  const [storeDetail, setStoreDetail] = useState<StoreDetailData | null>(null);
  const [storeDetailLoading, setStoreDetailLoading] = useState(false);

  // 商品列表（用于 item_id 下拉）
  const [items, setItems] = useState<Item[]>([]);
  const [itemsLoading, setItemsLoading] = useState(false);

  // 仓库列表（用于 warehouse_id 下拉）
  const [warehouses, setWarehouses] = useState<WarehouseOption[]>([]);
  const [warehousesLoading, setWarehousesLoading] = useState(false);

  // ===== 加载店铺列表 =====
  useEffect(() => {
    async function loadStores() {
      setStoresLoading(true);
      try {
        const res = await fetchStores();
        const list = res.data ?? [];
        setStores(list);

        // URL 已带 platform+shop_id 时，尝试自动定位店铺
        if (initialPlatform && initialShopId) {
          const match = list.find(
            (s) =>
              s.platform === initialPlatform &&
              s.shop_id === initialShopId,
          );
          if (match) {
            setSelectedStoreId(match.id);
          }
        }
      } catch (err) {
        console.error("loadStores failed", err);
      } finally {
        setStoresLoading(false);
      }
    }

    void loadStores();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // ===== 选中店铺 → 加载店铺详情（仓库绑定） =====
  useEffect(() => {
    async function loadDetail() {
      if (!selectedStoreId) {
        setStoreDetail(null);
        return;
      }
      setStoreDetailLoading(true);
      try {
        const res = await fetchStoreDetail(selectedStoreId);
        const detail = res.data;
        setStoreDetail(detail);

        // 同步 platform/shop_id 到查询条件
        setPlatform(detail.platform);
        setShopId(detail.shop_id);
      } catch (err) {
        console.error("loadStoreDetail failed", err);
        setStoreDetail(null);
      } finally {
        setStoreDetailLoading(false);
      }
    }

    void loadDetail();
  }, [selectedStoreId]);

  // ===== 加载 Items 列表，用于 item_id 下拉 =====
  useEffect(() => {
    async function loadItemsInner() {
      setItemsLoading(true);
      try {
        const list = await fetchItems();
        setItems(list);
      } catch (err) {
        console.error("loadItems for channel-inventory failed", err);
      } finally {
        setItemsLoading(false);
      }
    }

    void loadItemsInner();
  }, []);

  // ===== 加载 Warehouses 列表，用于 warehouse 下拉 =====
  useEffect(() => {
    async function loadWarehouses() {
      setWarehousesLoading(true);
      try {
        const raw = await apiGet<WarehouseApiRow[] | { data: WarehouseApiRow[] }>(
          "/warehouses",
        );

        const list: WarehouseApiRow[] = Array.isArray(raw)
          ? raw
          : Array.isArray(raw.data)
            ? raw.data
            : [];

        const mapped: WarehouseOption[] = list.map((w) => ({
          id: w.id,
          name: w.name ?? `WH-${w.id}`,
          code: w.code ?? null,
          active: w.active,
        }));
        setWarehouses(mapped);
      } catch (err) {
        console.error("loadWarehouses for channel-inventory failed", err);
      } finally {
        setWarehousesLoading(false);
      }
    }

    void loadWarehouses();
  }, []);

  // ===== 查询渠道库存 =====
  async function query() {
    setError(null);
    setData(null);
    setExpanded({});

    const platformTrimmed = platform.trim();
    const shopIdTrimmed = shopId.trim();
    const itemIdTrimmed = itemId.trim();

    if (!platformTrimmed) {
      setError("platform 必填");
      return;
    }
    if (!shopIdTrimmed) {
      setError("shop_id 必填");
      return;
    }
    if (!itemIdTrimmed) {
      setError("item_id 必填");
      return;
    }

    const itemIdNum = Number(itemIdTrimmed);
    if (!Number.isFinite(itemIdNum) || itemIdNum <= 0) {
      setError("item_id 必须为正整数");
      return;
    }

    setLoading(true);
    try {
      const baseParams = {
        platform: platformTrimmed.toUpperCase(),
        shopId: shopIdTrimmed,
      };

      let res: ChannelInventoryMultiModel;

      const warehouseTrimmed = warehouseId.trim();

      if (warehouseTrimmed) {
        const whIdNum = Number(warehouseTrimmed);
        if (!Number.isFinite(whIdNum) || whIdNum <= 0) {
          setError("warehouse_id 必须为正整数");
          setLoading(false);
          return;
        }

        const single = await fetchSingleInventory({
          ...baseParams,
          warehouseId: whIdNum,
          itemId: itemIdNum,
        });

        res = {
          platform: single.platform,
          shop_id: single.shop_id,
          item_id: single.item_id,
          warehouses: [
            {
              warehouse_id: single.warehouse_id,
              on_hand: single.on_hand,
              reserved_open: single.reserved_open,
              available: single.available,
              batches: single.batches,
              is_top: false,
              is_default: false,
              priority: 0,
            },
          ],
        };
      } else {
        res = await fetchMultiInventory({
          ...baseParams,
          itemId: itemIdNum,
        });
      }

      setData(res);
    } catch (err) {
      const message =
        err instanceof Error ? err.message : "查询失败";
      setError(message);
    } finally {
      setLoading(false);
    }
  }

  function toggleExpand(targetWarehouseId: number) {
    setExpanded((prev) => ({
      ...prev,
      [targetWarehouseId]: !prev[targetWarehouseId],
    }));
  }

  const warehousesData: WarehouseInventoryModel[] = useMemo(
    () => data?.warehouses ?? [],
    [data],
  );

  const hasData = warehousesData.length > 0;
  const bindings: StoreBinding[] = storeDetail?.bindings ?? [];

  const totals = useMemo(
    () => ({
      totalOnHand: warehousesData.reduce((acc, w) => acc + w.on_hand, 0),
      totalReserved: warehousesData.reduce(
        (acc, w) => acc + w.reserved_open,
        0,
      ),
      totalAvailable: warehousesData.reduce(
        (acc, w) => acc + w.available,
        0,
      ),
    }),
    [warehousesData],
  );

  return {
    // 查询条件
    platform,
    setPlatform,
    shopId,
    setShopId,
    itemId,
    setItemId,
    warehouseId,
    setWarehouseId,

    // 渠道库存数据
    data,
    warehousesData,
    hasData,
    loading,
    error,
    setError,

    // 展开状态
    expanded,
    toggleExpand,

    // 店铺
    stores,
    storesLoading,
    selectedStoreId,
    setSelectedStoreId,
    storeDetail,
    storeDetailLoading,
    bindings,

    // Items & Warehouses 下拉数据
    items,
    itemsLoading,
    warehouses,
    warehousesLoading,

    // 汇总
    totals,

    // 行为
    query,
  };
}
