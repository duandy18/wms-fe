// src/features/admin/warehouses/coverage/deriveWarehouseCoverage.ts
import type {
  WarehouseListItem,
  WarehouseServiceCityOccupancyOut,
  WarehouseServiceCitySplitProvincesOut,
  WarehouseServiceProvinceOccupancyOut,
} from "../types";

export type FulfillmentCoverage = {
  province_n: number;
  // city_n === null 表示“城市规则未启用/不参与履约”，列表页显示为 —
  city_n: number | null;
  fulfill_label: "全国覆盖" | "可命中" | "对外不可命中";
};

function countByWarehouseId(rows: Array<{ warehouse_id: number }>): Record<number, number> {
  const m: Record<number, number> = {};
  for (const r of rows || []) {
    const wid = Number(r.warehouse_id);
    if (!Number.isFinite(wid) || wid <= 0) continue;
    m[wid] = (m[wid] ?? 0) + 1;
  }
  return m;
}

export function deriveWarehouseCoverage(args: {
  warehouses: WarehouseListItem[];
  provincesUniverseN: number; // CN_PROVINCES.length
  provOcc: WarehouseServiceProvinceOccupancyOut | null;
  cityOcc: WarehouseServiceCityOccupancyOut | null;
  split: WarehouseServiceCitySplitProvincesOut | null;
}): { coverageById: Record<number, FulfillmentCoverage>; warning: string | null } {
  const list = args.warehouses ?? [];

  const splitCount = (args.split?.provinces ?? []).length;
  const cityRuleEnabled = splitCount > 0;

  const effectiveProvinceUniverse = Math.max(0, (args.provincesUniverseN ?? 0) - splitCount);

  const provCountByWid = countByWarehouseId(
    (args.provOcc?.rows ?? []).map((r) => ({ warehouse_id: r.warehouse_id })),
  );
  const cityCountByWidRaw = countByWarehouseId(
    (args.cityOcc?.rows ?? []).map((r) => ({ warehouse_id: r.warehouse_id })),
  );

  const cov: Record<number, FulfillmentCoverage> = {};

  for (const w of list) {
    const provN = provCountByWid[w.id] ?? 0;
    const cityN = cityRuleEnabled ? (cityCountByWidRaw[w.id] ?? 0) : null;

    const cityEffectiveN = cityN ?? 0;

    let label: FulfillmentCoverage["fulfill_label"] = "可命中";
    if (provN === 0 && cityEffectiveN === 0) label = "对外不可命中";
    else if (provN >= effectiveProvinceUniverse && effectiveProvinceUniverse > 0) label = "全国覆盖";

    cov[w.id] = { province_n: provN, city_n: cityN, fulfill_label: label };
  }

  // 风险提示：全国覆盖仓存在 + 还有其它运行中仓
  const activeWarehouses = list.filter((w) => !!w.active);
  const national = activeWarehouses.filter((w) => cov[w.id]?.fulfill_label === "全国覆盖");
  let warning: string | null = null;

  if (national.length > 0 && activeWarehouses.length > 1) {
    const names = national.map((w) => w.code || w.name || `#${w.id}`).join("、");
    warning = `当前存在“全国覆盖”的仓库：${names}。其它仓库即使处于运行中，也可能对外不可命中（除非按城市配置或调整省份覆盖）。`;
  }

  return { coverageById: cov, warning };
}
