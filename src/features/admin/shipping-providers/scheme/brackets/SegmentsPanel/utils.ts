// src/features/admin/shipping-providers/scheme/brackets/SegmentsPanel/utils.ts
//
// SegmentsPanel 纯工具：转换 / PUT items（避免主文件膨胀）

import type { SchemeWeightSegment, SegmentTemplateOut } from "../../../api/types";
import type { WeightSegment } from "../PricingRuleEditor";

// ---- conversions ----
export function segmentsJsonToWeightSegments(v?: SchemeWeightSegment[] | null): WeightSegment[] {
  if (!Array.isArray(v)) return [];
  return v
    .map((x) => ({ min: String(x.min ?? "").trim(), max: String(x.max ?? "").trim() }))
    .filter((x) => Boolean(x.min || x.max));
}

export function templateItemsToWeightSegments(items: Array<{ ord: number; min_kg: string; max_kg: string | null }>): WeightSegment[] {
  const rows = (items ?? []).slice().sort((a, b) => (a.ord ?? 0) - (b.ord ?? 0));
  return rows.map((it) => ({
    min: String(it.min_kg ?? "").trim(),
    max: it.max_kg == null ? "" : String(it.max_kg ?? "").trim(),
  }));
}

/**
 * ✅ 草稿保存：只提交“连续可用的前缀段”，避免后端强校验 422
 *
 * 规则：
 * - 只要遇到某行 max 为空，就停止（该行及后续不提交）
 * - min_kg 自动按上一段 max 接续（严格连续）
 * - 至少提交 1 段（若第 0 行 max 也为空，则返回空数组，让上层提示用户先填写）
 *
 * 说明：
 * - 草稿阶段允许不完整：用户还没填完，就先保存已经填好的部分
 * - “∞段（max 为空）”建议放到发布前最后一步再处理（发布/启用时要求完整）
 */
export function weightSegmentsToPutItemsDraftPrefix(
  seg: WeightSegment[],
): Array<{ ord: number; min_kg: string; max_kg: string | null; active: boolean }> {
  const rows: Array<{ ord: number; min_kg: string; max_kg: string | null; active: boolean }> = [];

  const safe = (seg ?? []).map((s) => ({
    max: String(s?.max ?? "").trim(),
  }));

  let prevMax = "0";
  for (let i = 0; i < safe.length; i += 1) {
    const maxText = safe[i].max;

    // 草稿保存：max 未填就停止（不提交这一行）
    if (!maxText) break;

    const minKg = i === 0 ? "0" : prevMax;

    rows.push({
      ord: i,
      min_kg: minKg,
      max_kg: maxText,
      active: true,
    });

    prevMax = maxText;
  }

  return rows;
}

// ---- API (PUT items) ----
export async function apiPutTemplateItems(
  templateId: number,
  items: Array<{ ord: number; min_kg: string | number; max_kg: string | number | null; active: boolean }>,
): Promise<SegmentTemplateOut> {
  const { API_BASE_URL, getAccessToken } = await import("../../../../../../lib/api");

  const token = getAccessToken();
  const url = `${API_BASE_URL}/segment-templates/${templateId}/items`;

  const resp = await fetch(url, {
    method: "PUT",
    headers: {
      "Content-Type": "application/json",
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
    },
    body: JSON.stringify({ items }),
    credentials: "include",
  });

  if (!resp.ok) {
    const text = await resp.text();
    throw new Error(`HTTP ${resp.status}: ${text}`);
  }

  const json = (await resp.json()) as { ok: boolean; data: SegmentTemplateOut };
  return json.data;
}
