// src/features/admin/shipping-providers/scheme/zones/segmentTemplatesApi.ts
import { apiGet } from "../../../../../lib/api";

export type SegmentTemplateLite = {
  id: number;
  name: string;
  status: string | null;
  is_active: boolean;
};

export type SegmentTemplateItemLite = {
  id: number;
  ord: number;
  min_kg: string;
  max_kg: string | null;
  active: boolean;
};

export type SegmentTemplateDetailLite = {
  id: number;
  name: string;
  status: string | null;
  is_active: boolean;
  items: SegmentTemplateItemLite[];
};

function isRecord(v: unknown): v is Record<string, unknown> {
  return typeof v === "object" && v !== null;
}

function unwrapData(payload: unknown): unknown {
  if (isRecord(payload) && "data" in payload) return (payload as Record<string, unknown>).data;
  return payload;
}

function readNum(v: unknown, k: string): number | null {
  if (!isRecord(v)) return null;
  const x = v[k];
  return typeof x === "number" && Number.isFinite(x) ? x : null;
}

function readText(v: unknown, k: string): string | null {
  if (!isRecord(v)) return null;
  const x = v[k];
  return typeof x === "string" ? x : null;
}

function readBool(v: unknown, k: string): boolean | null {
  if (!isRecord(v)) return null;
  const x = v[k];
  return typeof x === "boolean" ? x : null;
}

export async function fetchSchemeSegmentTemplatesLite(schemeId: number): Promise<SegmentTemplateLite[]> {
  const res = await apiGet<unknown>(`/pricing-schemes/${schemeId}/segment-templates`);
  const data = unwrapData(res);

  if (!Array.isArray(data)) return [];

  const out: SegmentTemplateLite[] = [];
  for (const it of data) {
    const id = readNum(it, "id");
    const name = readText(it, "name");
    if (id == null || !name || !name.trim()) continue;

    const status = readText(it, "status");
    const isActive = readBool(it, "is_active") ?? false;

    out.push({
      id,
      name: name.trim(),
      status: status ?? null,
      is_active: isActive,
    });
  }
  return out;
}

export async function fetchSegmentTemplateDetailLite(templateId: number): Promise<SegmentTemplateDetailLite> {
  const res = await apiGet<unknown>(`/segment-templates/${templateId}`);
  const data = unwrapData(res);

  if (!isRecord(data)) throw new Error("Segment template detail payload invalid");

  const id = readNum(data, "id");
  const name = readText(data, "name");
  const status = readText(data, "status");
  const isActive = readBool(data, "is_active") ?? false;

  if (id == null || !name || !name.trim()) {
    throw new Error("Segment template detail missing id/name");
  }

  const itemsRaw = (data as Record<string, unknown>).items;
  const items: SegmentTemplateItemLite[] = [];

  if (Array.isArray(itemsRaw)) {
    for (const it of itemsRaw) {
      const itemId = readNum(it, "id") ?? -1;
      const ord = readNum(it, "ord") ?? 0;

      // 后端 Decimal 可能序列化成 string / number，这里统一转 string
      const min = readText(it, "min_kg") ?? String((isRecord(it) ? it["min_kg"] : "") ?? "");
      const maxTxt = readText(it, "max_kg");
      const maxVal = maxTxt == null ? (isRecord(it) ? it["max_kg"] : null) : maxTxt;
      const max = maxVal == null ? null : String(maxVal);

      const active = readBool(it, "active") ?? true;

      items.push({
        id: itemId,
        ord,
        min_kg: String(min),
        max_kg: max,
        active,
      });
    }
  }

  return {
    id,
    name: name.trim(),
    status: status ?? null,
    is_active: isActive,
    items,
  };
}
