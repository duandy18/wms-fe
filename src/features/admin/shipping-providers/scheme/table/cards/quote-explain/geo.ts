// src/features/admin/shipping-providers/scheme/table/cards/quote-explain/geo.ts

export function isMunicipalityProvinceCode(provinceCode: string): boolean {
  const pc = (provinceCode || "").trim();
  return pc === "110000" || pc === "120000" || pc === "310000" || pc === "500000";
}

export function municipalityCityCodeFromProvinceCode(provinceCode: string): string {
  // ✅ 规则：直辖市“省码 xx0000” → “市码 xx0100”
  // 110000 → 110100, 120000 → 120100, 310000 → 310100, 500000 → 500100
  const n = Number((provinceCode || "").trim());
  if (!Number.isFinite(n)) return "";
  const city = n + 100;
  const s = String(city);
  return s.length >= 6 ? s : s.padStart(6, "0");
}
