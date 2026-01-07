// src/features/operations/outbound-pick/pickTasksCockpitUtils.ts

// 从任务 ref 中解析订单键：ORD:{platform}:{shop_id}:{ext_order_no}
export type OrderRefKey = {
  platform: string;
  shopId: string;
  extOrderNo: string;
};

export function derivePlatformShop(ref: string | null): {
  platform: string;
  shop_id: string;
} {
  if (!ref) return { platform: "PDD", shop_id: "1" };
  const parts = ref.split(":");
  if (parts.length >= 4 && parts[0] === "ORD") {
    return {
      platform: (parts[1] || "PDD").toUpperCase(),
      shop_id: parts[2] || "1",
    };
  }
  return { platform: "PDD", shop_id: "1" };
}

export function parseOrderKeyFromRef(ref: string | null): OrderRefKey | null {
  if (!ref) return null;
  const parts = ref.split(":");
  if (parts.length < 4 || parts[0] !== "ORD") return null;
  const platform = (parts[1] || "PDD").toUpperCase();
  const shopId = parts[2] || "1";
  const extOrderNo = parts.slice(3).join(":") || "";
  if (!extOrderNo) return null;
  return { platform, shopId, extOrderNo };
}
