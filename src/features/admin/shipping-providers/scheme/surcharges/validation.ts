// src/features/admin/shipping-providers/scheme/surcharges/validation.ts

export type JsonParseResult =
  | { ok: true; value: Record<string, unknown> }
  | { ok: false; error: string };

export function parseJsonObject(input: string): JsonParseResult {
  const t = input.trim();
  if (!t) return { ok: true, value: {} };
  try {
    const v = JSON.parse(t) as unknown;
    if (!v || typeof v !== "object" || Array.isArray(v)) {
      return { ok: false, error: "必须是 JSON 对象（{...}），不能是数组/字符串/数字。" };
    }
    return { ok: true, value: v as Record<string, unknown> };
  } catch {
    return { ok: false, error: "JSON 解析失败：请检查逗号/引号/括号是否正确。" };
  }
}

function isRecord(v: unknown): v is Record<string, unknown> {
  return typeof v === "object" && v !== null && !Array.isArray(v);
}

export function validateAmountJson(obj: Record<string, unknown>): string | null {
  // ✅ rounding 已废弃（后端也会 422），前端提前提示避免打脸
  if (isRecord(obj) && "rounding" in obj && obj["rounding"] != null) {
    return "amount_json.rounding 已废弃且不再生效，请改用 scheme.billable_weight_rule.rounding";
  }

  const kind = String(obj["kind"] ?? "flat").toLowerCase();
  if (!["flat", "per_kg", "table"].includes(kind)) return "amount_json.kind 必须是 flat / per_kg / table";

  if (kind === "flat") {
    const amt = obj["amount"];
    if (typeof amt !== "number" || !Number.isFinite(amt) || amt < 0) return "flat 需要 amount（>=0 数字）";
  }

  if (kind === "per_kg") {
    const rate = obj["rate_per_kg"];
    if (typeof rate !== "number" || !Number.isFinite(rate) || rate < 0) return "per_kg 需要 rate_per_kg（>=0 数字）";
  }

  if (kind === "table") {
    const rules = obj["rules"];
    if (!Array.isArray(rules)) return "table 需要 rules 数组，例如 [{\"max_kg\":1,\"amount\":2.0}]";
  }

  return null;
}
