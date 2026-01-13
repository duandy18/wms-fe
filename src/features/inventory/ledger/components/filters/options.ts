// src/features/inventory/ledger/components/filters/options.ts
import { apiPost } from "../../../../../lib/api";

export type Option = { value: string; label: string };

export type LedgerEnumsResp = {
  reason_canons: string[];
  sub_reasons: string[];
};

export async function fetchLedgerEnums(): Promise<LedgerEnumsResp> {
  const data = await apiPost<LedgerEnumsResp>("/stock/ledger/enums", {});
  return {
    reason_canons: Array.isArray(data.reason_canons) ? data.reason_canons : [],
    sub_reasons: Array.isArray(data.sub_reasons) ? data.sub_reasons : [],
  };
}

// ====== 中文标签映射（UI 语义，不暴露后端枚举名）======

export function labelReasonCanon(v: string): string {
  switch ((v ?? "").trim()) {
    case "RECEIPT":
      return "入库";
    case "SHIPMENT":
      return "出库";
    case "ADJUSTMENT":
      return "调整 / 盘点";
    default:
      return v ? `未知：${v}` : "不限";
  }
}

export function labelSubReason(v: string): string {
  switch ((v ?? "").trim()) {
    case "PO_RECEIPT":
      return "采购入库";
    case "ORDER_SHIP":
      return "订单出库";
    case "COUNT_ADJUST":
      return "盘点确认";
    case "RETURN_RECEIPT":
      return "退货入库";
    case "INTERNAL_SHIP":
      return "内部出库";
    case "RETURN_TO_VENDOR":
      return "退供应商出库";
    default:
      return v ? `未知：${v}` : "不限";
  }
}

export function buildCanonOptions(values: string[]): Option[] {
  const xs = (values ?? []).map((v) => String(v || "").trim()).filter(Boolean);
  // 去重 + 稳定排序（不“自作主张”改顺序：按后端给的顺序走）
  const uniq: string[] = [];
  for (const x of xs) {
    if (!uniq.includes(x)) uniq.push(x);
  }
  return [{ value: "", label: "不限" }, ...uniq.map((v) => ({ value: v, label: labelReasonCanon(v) }))];
}

export function buildSubReasonOptions(values: string[]): Option[] {
  const xs = (values ?? []).map((v) => String(v || "").trim()).filter(Boolean);
  const uniq: string[] = [];
  for (const x of xs) {
    if (!uniq.includes(x)) uniq.push(x);
  }
  return [{ value: "", label: "不限" }, ...uniq.map((v) => ({ value: v, label: labelSubReason(v) }))];
}
