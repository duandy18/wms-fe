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

// =====================================================
// WMS 订单确认码（前端 v1：不含签名）
// - 用于“打印 → 出库口扫码确认”这一收官动作
// - 多平台/多店铺：必须把 platform + shop_id + ext_order_no 全带上
// - 注意：验签/防伪会在后端 v2 再补齐（本文件仅负责语义格式）
// =====================================================

export type WmsOrderConfirmKey = {
  platform: string;
  shopId: string;
  extOrderNo: string;
};

const WMS_ORDER_PREFIX = "WMS:ORDER:v1:";

export function buildWmsOrderConfirmCodeFromOrderKey(k: WmsOrderConfirmKey): string {
  const plat = (k.platform || "PDD").toUpperCase();
  const shop = String(k.shopId || "1");
  const ext = String(k.extOrderNo || "").trim();
  return `${WMS_ORDER_PREFIX}${plat}:${shop}:${ext}`;
}

export function buildWmsOrderConfirmCodeFromTaskRef(taskRef: string | null): string | null {
  const k = parseOrderKeyFromRef(taskRef);
  if (!k) return null;
  return buildWmsOrderConfirmCodeFromOrderKey(k);
}

export function parseWmsOrderConfirmCode(codeRaw: string): WmsOrderConfirmKey | null {
  const raw = String(codeRaw || "").trim();
  if (!raw.startsWith(WMS_ORDER_PREFIX)) return null;

  // 期待：WMS:ORDER:v1:{platform}:{shop_id}:{ext_order_no}
  const body = raw.slice(WMS_ORDER_PREFIX.length);
  const parts = body.split(":");
  if (parts.length < 3) return null;

  const platform = (parts[0] || "").toUpperCase();
  const shopId = parts[1] || "";
  const extOrderNo = parts.slice(2).join(":") || "";

  if (!platform || !shopId || !extOrderNo) return null;
  return { platform, shopId, extOrderNo };
}

export function isSameOrderConfirmCodeForTaskRef(args: { code: string; taskRef: string | null }): boolean {
  const code = String(args.code || "").trim();
  if (!code) return false;

  const expect = buildWmsOrderConfirmCodeFromTaskRef(args.taskRef);
  if (!expect) return false;

  return code === expect;
}
