// src/features/admin/shipping-providers/scheme/overview/exportCsv.ts
//
// 前端导出 CSV（不依赖后端接口）
// - 直接从 PricingSchemeDetail.zones[].brackets[] 拉平
// - 支持中文 Excel：加 BOM

import type { PricingSchemeDetail, PricingSchemeZoneBracket } from "../../api";

function csvEscape(v: unknown): string {
  const s = String(v ?? "");
  if (s.includes('"') || s.includes(",") || s.includes("\n")) {
    return `"${s.replace(/"/g, '""')}"`;
  }
  return s;
}

function bracketToRow(s: PricingSchemeDetail, zoneName: string, b: PricingSchemeZoneBracket) {
  return [
    s.id,
    s.name,
    b.zone_id,
    zoneName,
    b.min_kg,
    b.max_kg ?? "",
    b.pricing_mode ?? "",
    b.flat_amount ?? "",
    b.base_kg ?? "",
    b.base_amount ?? "",
    b.rate_per_kg ?? "",
    b.active ?? "",
  ];
}

export function exportSchemeCsv(detail: PricingSchemeDetail) {
  const header = [
    "scheme_id",
    "scheme_name",
    "zone_id",
    "zone_name",
    "min_kg",
    "max_kg",
    "pricing_mode",
    "flat_amount",
    "base_kg",
    "base_amount",
    "rate_per_kg",
    "active",
  ];

  const rows: unknown[][] = [header];

  for (const z of detail.zones ?? []) {
    for (const b of z.brackets ?? []) {
      rows.push(bracketToRow(detail, z.name, b));
    }
  }

  const csv = rows.map((r) => r.map(csvEscape).join(",")).join("\n");

  // Excel 友好：UTF-8 BOM
  const blob = new Blob(["\uFEFF", csv], { type: "text/csv;charset=utf-8" });
  const url = URL.createObjectURL(blob);

  const a = document.createElement("a");
  const safeName = String(detail.name ?? "scheme").replace(/[\\/:*?"<>|]/g, "_");
  a.href = url;
  a.download = `运输价格_${safeName}_scheme_${detail.id}.csv`;
  document.body.appendChild(a);
  a.click();
  a.remove();

  URL.revokeObjectURL(url);
}
