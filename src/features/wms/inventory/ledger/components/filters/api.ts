// src/features/wms/inventory/ledger/components/filters/api.ts
import { fetchInventoryOptions } from "@/features/wms/inventory/api/options";
import type {
  InventoryItemOption,
  InventoryWarehouseOption,
} from "@/features/wms/inventory/api/contracts";

export type WarehouseOut = {
  id: number;
  name: string;
  code: string | null;
  active: boolean;
};

export type ItemOut = {
  id: number;
  sku: string;
  name: string;
};

function mapWarehouse(x: InventoryWarehouseOption): WarehouseOut {
  return {
    id: x.id,
    name: x.name,
    code: x.code ?? null,
    active: x.active,
  };
}

function mapItem(x: InventoryItemOption): ItemOut {
  return {
    id: x.id,
    sku: x.sku,
    name: x.name,
  };
}

export async function fetchActiveWarehouses(): Promise<WarehouseOut[]> {
  const res = await fetchInventoryOptions({
    warehouses_active_only: true,
    item_limit: 1,
  });

  if (!res || !Array.isArray(res.warehouses)) {
    throw new Error("后端合同不一致：GET /stock/options 必须返回 { warehouses, items }");
  }

  return res.warehouses.map(mapWarehouse);
}

export async function fetchItems(): Promise<ItemOut[]> {
  const res = await fetchInventoryOptions({
    warehouses_active_only: true,
    item_limit: 200,
  });

  if (!res || !Array.isArray(res.items)) {
    throw new Error("后端合同不一致：GET /stock/options 必须返回 { warehouses, items }");
  }

  return res.items.map(mapItem);
}
