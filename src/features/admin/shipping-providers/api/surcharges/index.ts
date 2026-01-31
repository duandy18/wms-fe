// src/features/admin/shipping-providers/api/surcharges/index.ts
import { apiPost, apiPatch, apiDelete } from "../../../../../lib/api";
import type { PricingSchemeSurcharge } from "../../api/types";

function isRecord(v: unknown): v is Record<string, unknown> {
  return typeof v === "object" && v !== null && !Array.isArray(v);
}

/**
 * ✅ 兼容/护栏：amount_json.rounding 已被后端废弃并拒绝写入（422）。
 * 前端这里统一剔除，避免：
 * - 模板/历史草稿携带 rounding 导致保存失败
 * - 用户复制模板后被后端“打脸”
 */
function stripDeprecatedAmountRounding(amountJson: Record<string, unknown>): Record<string, unknown> {
  if (!isRecord(amountJson)) return {};
  if (!("rounding" in amountJson)) return amountJson;

  // shallow clone + drop rounding
  const next: Record<string, unknown> = { ...amountJson };
  delete next["rounding"];
  return next;
}

export async function createSurcharge(
  schemeId: number,
  payload: {
    name: string;
    priority?: number;
    active?: boolean;
    condition_json: Record<string, unknown>;
    amount_json: Record<string, unknown>;
  },
): Promise<PricingSchemeSurcharge> {
  return apiPost<PricingSchemeSurcharge>(`/pricing-schemes/${schemeId}/surcharges`, {
    name: payload.name,
    priority: payload.priority ?? 100,
    active: payload.active ?? true,
    condition_json: payload.condition_json,
    amount_json: stripDeprecatedAmountRounding(payload.amount_json),
  });
}

type PatchSurchargePayload = Partial<{
  name: string;
  priority: number;
  active: boolean;
  condition_json: Record<string, unknown>;
  amount_json: Record<string, unknown>;
}>;

export async function patchSurcharge(
  surchargeId: number,
  payload: PatchSurchargePayload,
): Promise<PricingSchemeSurcharge> {
  const next: PatchSurchargePayload = { ...payload };

  if (isRecord(next.amount_json)) {
    next.amount_json = stripDeprecatedAmountRounding(next.amount_json);
  }

  return apiPatch<PricingSchemeSurcharge>(`/surcharges/${surchargeId}`, next);
}

export async function deleteSurcharge(surchargeId: number): Promise<{ ok: boolean }> {
  return apiDelete<{ ok: boolean }>(`/surcharges/${surchargeId}`);
}

// ✅ 新主入口：新增省/市 + 金额 => 直接写入后端事实（upsert）
export type SurchargeUpsertPayload = {
  scope: "province" | "city";
  province: string;
  city?: string | null;
  amount: number;
  active?: boolean;
  name?: string | null;
};

export async function upsertSurcharge(
  schemeId: number,
  payload: SurchargeUpsertPayload,
): Promise<PricingSchemeSurcharge> {
  const body = {
    scope: payload.scope,
    province: (payload.province || "").trim(),
    city: payload.scope === "city" ? (payload.city || "").trim() : null,
    amount: payload.amount,
    active: typeof payload.active === "boolean" ? payload.active : true,
    name: payload.name ? String(payload.name).trim() : undefined,
  };

  return apiPost<PricingSchemeSurcharge>(`/pricing-schemes/${schemeId}/surcharges:upsert`, body);
}
