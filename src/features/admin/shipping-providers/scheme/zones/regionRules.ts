// src/features/admin/shipping-providers/scheme/zones/regionRules.ts
//
// Zone 省份占用规则（纯函数）
// - 计算哪些省份已被“启用/active Zone”占用
// - 支持编辑时放行当前 zone（避免自锁）
// - 兼容 members 结构：[{ level: "province", value: "广东省" }, ...]
// - 尽量兼容后端字段差异：members/provinces/regions 等
//
// ✅ lint 目标：不使用 any

export type ProvinceOccupancy = {
  // 被占用的省份 -> 原因（人话）
  reasonByProvince: Record<string, string>;
};

function isRecord(v: unknown): v is Record<string, unknown> {
  return !!v && typeof v === "object" && !Array.isArray(v);
}

function getZoneId(z: unknown): number | null {
  if (!isRecord(z)) return null;
  const id = z.id;
  return typeof id === "number" && Number.isFinite(id) ? id : null;
}

function isZoneActive(z: unknown): boolean {
  // 兼容字段名：active / enabled（没有字段时按 true 处理，避免误伤）
  if (!isRecord(z)) return true;

  const active = z.active;
  if (typeof active === "boolean") return active;

  const enabled = z.enabled;
  if (typeof enabled === "boolean") return enabled;

  return true;
}

function asStringArray(v: unknown): string[] | null {
  if (!Array.isArray(v)) return null;
  const out: string[] = [];
  for (const x of v) {
    if (typeof x !== "string") continue;
    const s = x.trim();
    if (s) out.push(s);
  }
  return out;
}

function extractZoneProvinces(zone: unknown): string[] {
  if (!isRecord(zone)) return [];
  const z = zone;

  // 1) 直接数组字段（兜底兼容）
  for (const k of ["provinces", "regions", "province_list", "region_list", "scope_provinces"] as const) {
    const arr = asStringArray(z[k]);
    if (arr && arr.length) return Array.from(new Set(arr));
  }

  // 2) members：可能是 string[] 或对象数组
  const members = z.members;

  // 2.1 string[]
  const arrMembers = asStringArray(members);
  if (arrMembers && arrMembers.length) return Array.from(new Set(arrMembers));

  // 2.2 { level, value }[]
  if (Array.isArray(members)) {
    const out: string[] = [];

    for (const m of members) {
      if (!isRecord(m)) continue;

      const level = m.level;
      const value = m.value;

      // ✅ 只认 province 级别的 member
      if (level === "province" && typeof value === "string") {
        const s = value.trim();
        if (s) out.push(s);
        continue;
      }

      // 兼容：有些后端可能不叫 level/value，但仍然把 province 作为字段塞进来
      // 这里仅在“看起来像省份字段”时兜底，不用 name/label（避免误把别的层级塞进来）
      const candidate = m.province;
      if (typeof candidate === "string") {
        const s = candidate.trim();
        if (s) out.push(s);
      }
    }

    return Array.from(new Set(out));
  }

  return [];
}

function zoneDisplayName(zone: unknown): string {
  if (!isRecord(zone)) return "未命名区域";
  const name = zone.name;
  if (typeof name === "string" && name.trim()) return name.trim();

  const title = zone.title;
  if (typeof title === "string" && title.trim()) return title.trim();

  const id = getZoneId(zone);
  if (id != null) return `区域#${id}`;

  return "未命名区域";
}

/**
 * 构建“省份占用图”
 * @param zones PricingSchemeDetail.zones
 * @param opts.editingZoneId 编辑当前 zone 时，放行其自身省份（避免自锁）
 */
export function buildProvinceOccupancy(
  zones: unknown[] | undefined | null,
  opts?: { editingZoneId?: number | null },
): ProvinceOccupancy {
  const reasonByProvince: Record<string, string> = {};
  const editingZoneId = opts?.editingZoneId ?? null;

  const list = Array.isArray(zones) ? zones : [];
  for (const zone of list) {
    if (!isZoneActive(zone)) continue;

    // 放行当前正在编辑的 zone（避免自锁）
    const zid = getZoneId(zone);
    if (editingZoneId != null && zid != null && zid === editingZoneId) {
      continue;
    }

    const provinces = extractZoneProvinces(zone);
    if (!provinces.length) continue;

    const zName = zoneDisplayName(zone);
    for (const p of provinces) {
      const prov = p.trim();
      if (!prov) continue;

      if (!reasonByProvince[prov]) {
        reasonByProvince[prov] = `已在：${zName}`;
      }
    }
  }

  return { reasonByProvince };
}

export default buildProvinceOccupancy;
