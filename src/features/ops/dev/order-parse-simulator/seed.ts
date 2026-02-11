// src/features/ops/dev/order-parse-simulator/seed.ts

import type { JsonObject, VariantRow } from "./types";

export function defaultVariantRows(): VariantRow[] {
  return [
    { variant_name: "1.5KG", filled_code: "FSKU-1" },
    { variant_name: "1.5KG*2袋", filled_code: "FSKU-2" },
    { variant_name: "8KG", filled_code: "UT-REPLAY-FSKU-1" },
    { variant_name: "试吃装", filled_code: "FAKE-UNBOUND-001" },
    { variant_name: "归档规格", filled_code: "FAKE-UNBOUND-002" },
    { variant_name: "组合装", filled_code: "FSKU-17" },
  ];
}

export function buildSeed(args: { shopId: string; title: string; variants: VariantRow[] }): JsonObject {
  const shopId = (args.shopId || "").trim() || "12345";
  const title = (args.title || "").trim() || "模拟商品（拼多多后台）";

  const variants = args.variants
    .map((v) => ({
      variant_name: (v.variant_name || "").trim(),
      filled_code: (v.filled_code || "").trim(),
    }))
    .filter((v) => v.variant_name || v.filled_code)
    .map((v, idx) => ({
      variant_name: v.variant_name || `规格${idx + 1}`,
      filled_code: v.filled_code || `FAKE-UNBOUND-${String(idx + 1).padStart(3, "0")}`,
    }));

  return {
    platform: "PDD",
    shops: [
      {
        shop_id: shopId,
        title_prefix: "【FAKE-PDD】",
        links: [
          {
            spu_key: `PDD-LINK-${shopId}-001`,
            title,
            variants,
          },
        ],
      },
    ],
  };
}

export function seedToText(seed: JsonObject): string {
  return JSON.stringify(seed, null, 2);
}
