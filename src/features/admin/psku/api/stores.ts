// src/features/admin/psku/api/stores.ts

import { apiGet } from "@/lib/api";
import { isObj, pickNum, pickStr, type JsonObj } from "./_common";

/**
 * ✅ 平台枚举由后端提供（/meta/platforms），前端不再维护隐式常量。
 * - PSKU 页内部仅要求 platform 是字符串（后端输出应为大写）。
 */
export type PlatformCode = string;

export type StorePickerOption = {
  id: number;
  platform: string;
  shop_id: string;
  name: string;
  label: string;
};

export type PlatformOption = {
  platform: string;
  label: string;
  enabled: boolean;
};

export async function fetchPlatformOptions(): Promise<PlatformOption[]> {
  const raw = await apiGet<unknown>("/meta/platforms", {});

  let arr: unknown = raw;
  if (isObj(raw)) {
    if (Array.isArray(raw["data"])) arr = raw["data"];
    if (Array.isArray(raw["items"])) arr = raw["items"];
    if (isObj(raw["data"]) && Array.isArray((raw["data"] as JsonObj)["items"])) arr = (raw["data"] as JsonObj)["items"];
  }
  if (!Array.isArray(arr)) return [];

  const items = arr
    .map((x): PlatformOption | null => {
      if (!isObj(x)) return null;
      const platform = (pickStr(x, ["platform"]) ?? "").trim().toUpperCase();
      const label = (pickStr(x, ["label", "name"]) ?? "").trim();
      const enabledRaw = x["enabled"];
      const enabled = typeof enabledRaw === "boolean" ? enabledRaw : true;
      if (!platform) return null;
      return { platform, label: label || platform, enabled };
    })
    .filter((x): x is PlatformOption => x != null);

  // ✅ 仅显示 enabled 平台（后端如果未来支持下线/灰度，这里自然生效）
  const enabledItems = items.filter((x) => x.enabled);

  // ✅ 稳定排序：按 platform 字母序
  enabledItems.sort((a, b) => a.platform.localeCompare(b.platform));

  return enabledItems;
}

export async function fetchStoresForPicker(args: {
  platform: PlatformCode;
  q?: string | null;
  limit?: number;
  offset?: number;
}): Promise<StorePickerOption[]> {
  const raw = await apiGet<unknown>("/stores", {
    platform: args.platform,
    q: args.q ?? null,
    limit: args.limit ?? 200,
    offset: args.offset ?? 0,
  });

  // ✅ 后端真实结构：{ ok: true, data: [...] }
  let arr: unknown = raw;
  if (isObj(raw)) {
    if (Array.isArray(raw["data"])) arr = raw["data"];
    // 兼容历史结构
    if (Array.isArray(raw["items"])) arr = raw["items"];
    if (isObj(raw["data"]) && Array.isArray((raw["data"] as JsonObj)["items"])) arr = (raw["data"] as JsonObj)["items"];
  }
  if (!Array.isArray(arr)) return [];

  return arr
    .map((x): StorePickerOption | null => {
      if (!isObj(x)) return null;

      const id = pickNum(x, ["id", "store_id", "storeId"]);
      const platform = (pickStr(x, ["platform"]) ?? "").trim();
      const shop_id = pickStr(x, ["shop_id", "shopId"]) ?? "";
      const name = pickStr(x, ["name", "store_name", "storeName"]) ?? "";

      if (id == null || !platform) return null;

      const safeName = name || `${platform}-${shop_id || "?"}`;
      const label = `${safeName} #${id}`;

      return { id, platform, shop_id, name: safeName, label };
    })
    .filter((x): x is StorePickerOption => x != null);
}
