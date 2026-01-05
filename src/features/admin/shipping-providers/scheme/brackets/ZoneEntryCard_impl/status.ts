// src/features/admin/shipping-providers/scheme/brackets/ZoneEntryCard_impl/status.ts
//
// 状态判定器（终极稳定态）
// - 锁定态：只看后端 bracket（真相）
// - 编辑态：缺字段/需补录/已保存/未保存（与后端一致性对比）

import type { PricingSchemeZoneBracket } from "../../../api";
import type { RowDraft, CellMode } from "../quoteModel";
import { draftFromBracket } from "../quoteModel";
import type { StatusView } from "./types";

function isBlank(v: string | null | undefined): boolean {
  return (v ?? "").trim().length === 0;
}

export function requiredMissingZh(d: RowDraft): string[] {
  const miss: string[] = [];
  if (d.mode === "flat") {
    if (isBlank(d.flatAmount)) miss.push("金额");
  } else if (d.mode === "linear_total") {
    if (isBlank(d.ratePerKg)) miss.push("单价");
  } else if (d.mode === "step_over") {
    if (isBlank(d.baseKg)) miss.push("首重重量");
    if (isBlank(d.baseAmount)) miss.push("首重费用");
    if (isBlank(d.ratePerKg)) miss.push("续重单价");
  } else {
    // manual：路线A为需补录
  }
  return miss;
}

export function draftsEqual(a: RowDraft, b: RowDraft): boolean {
  if (a.mode !== b.mode) return false;
  if (a.mode === "flat") return (a.flatAmount ?? "") === (b.flatAmount ?? "");
  if (a.mode === "linear_total") return (a.baseAmount ?? "") === (b.baseAmount ?? "") && (a.ratePerKg ?? "") === (b.ratePerKg ?? "");
  if (a.mode === "step_over") {
    return (
      (a.baseKg ?? "") === (b.baseKg ?? "") &&
      (a.baseAmount ?? "") === (b.baseAmount ?? "") &&
      (a.ratePerKg ?? "") === (b.ratePerKg ?? "")
    );
  }
  return true;
}

export function bracketModeOf(b?: PricingSchemeZoneBracket): string {
  if (!b) return "";
  return String((b as unknown as Record<string, unknown>)["pricing_mode"] ?? "").toLowerCase();
}

export function backendStatusZh(b?: PricingSchemeZoneBracket): StatusView {
  if (!b) return { text: "未设", tone: "empty" };

  const m = bracketModeOf(b);
  if (m === "manual_quote") return { text: "需补录", tone: "warn" };

  const rec = b as unknown as Record<string, unknown>;
  const flatAmount = rec["flat_amount"];
  const baseAmount = rec["base_amount"];
  const ratePerKg = rec["rate_per_kg"];
  const baseKg = rec["base_kg"];

  if (m === "flat") {
    if (flatAmount == null) return { text: "后端缺字段", tone: "warn" };
    return { text: "已配置", tone: "ok" };
  }
  if (m === "linear_total") {
    if (ratePerKg == null) return { text: "后端缺字段", tone: "warn" };
    return { text: "已配置", tone: "ok" };
  }
  if (m === "step_over") {
    if (baseKg == null || baseAmount == null || ratePerKg == null) return { text: "后端缺字段", tone: "warn" };
    return { text: "已配置", tone: "ok" };
  }

  return { text: "需检查", tone: "warn" };
}

export function editingStatusZh(args: {
  draft: RowDraft;
  backend: PricingSchemeZoneBracket | undefined;
}): StatusView {
  const { draft, backend } = args;

  if (draft.mode === "manual") return { text: "需补录", tone: "warn" };

  const miss = requiredMissingZh(draft);
  if (miss.length) return { text: `缺：${miss.join(" / ")}`, tone: "warn" };

  if (!backend) return { text: "未保存", tone: "warn" };

  const bd = draftFromBracket(backend);
  return draftsEqual(draft, bd) ? { text: "已保存", tone: "ok" } : { text: "未保存", tone: "warn" };
}

export function modeLabelZh(mode: CellMode): string {
  if (mode === "flat") return "固定价";
  if (mode === "linear_total") return "票费 + 单价";
  if (mode === "step_over") return "首重 / 续重";
  return "需补录";
}
