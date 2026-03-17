// src/features/shipment/cockpit/utils.ts

import type { ShipQuote } from "../api/shipmentQuoteApi";

export type ShipApiErrorShape = { message?: string };

export function parseOrderRef(ref: string): {
  platform: string;
  shopId: string;
  extOrderNo: string;
} {
  const raw = String(ref ?? "").trim();
  if (!raw) {
    throw new Error("订单号 / 业务引用不能为空");
  }

  const parts = raw.split(":");
  if (parts.length < 4 || parts[0] !== "ORD") {
    throw new Error(
      "订单号格式不正确，请使用 ORD:平台:店铺:外部单号，例如 ORD:PDD:1:EXT123",
    );
  }

  const platform = (parts[1] ?? "").trim();
  const shopId = (parts[2] ?? "").trim();
  const extOrderNo = parts.slice(3).join(":").trim();

  if (!platform) {
    throw new Error("订单号格式不正确：缺少平台，请使用 ORD:平台:店铺:外部单号");
  }

  if (!shopId) {
    throw new Error("订单号格式不正确：缺少店铺，请使用 ORD:平台:店铺:外部单号");
  }

  if (!extOrderNo) {
    throw new Error("订单号格式不正确：缺少外部单号，请使用 ORD:平台:店铺:外部单号");
  }

  return { platform, shopId, extOrderNo };
}

export function buildQuoteSnapshot(
  input: {
    dest: { province: string; city: string; district: string };
    real_weight_kg: number;
    packaging_weight_kg: number | null;
    dims_cm: null;
    flags: string[];
  },
  quote: ShipQuote,
) {
  return {
    input,
    selected_quote: {
      provider_id: quote.provider_id,
      scheme_id: quote.scheme_id,
      scheme_name: quote.scheme_name,
      carrier_code: quote.carrier_code,
      carrier_name: quote.carrier_name,
      currency: quote.currency ?? "CNY",
      total_amount: quote.total_amount,
      weight: quote.weight,
      zone: quote.zone ?? null,
      bracket: quote.bracket ?? null,
      breakdown: quote.breakdown,
      reasons: quote.reasons ?? [],
    },
  };
}
