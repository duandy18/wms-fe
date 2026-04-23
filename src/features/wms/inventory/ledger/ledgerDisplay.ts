export function actionLabel(subReason: string | null): string {
  const x = (subReason ?? "").toUpperCase();
  if (!x) return "—";

  if (x === "PO_RECEIPT") return "采购入库";
  if (x === "RETURN_RECEIPT") return "退货入库";
  if (x === "COUNT_CONFIRM") return "盘点确认";
  if (x === "COUNT_ADJUST") return "盘点调整";
  if (x === "ORDER_SHIP") return "订单出库";
  if (x === "INTERNAL_SHIP") return "内部出库";
  if (x === "RETURN_TO_VENDOR") return "退供应商出库";
  if (x === "OUTBOUND_REVERSAL") return "出库冲回";
  if (x === "INBOUND_REVERSAL") return "入库冲回";

  return subReason ?? "—";
}

export function actionPillClass(subReason: string | null): string {
  const x = (subReason ?? "").toUpperCase();

  if (
    x === "PO_RECEIPT" ||
    x === "RETURN_RECEIPT" ||
    x === "INBOUND_REVERSAL"
  ) {
    return "bg-emerald-50 text-emerald-700 border-emerald-200";
  }

  if (
    x === "ORDER_SHIP" ||
    x === "INTERNAL_SHIP" ||
    x === "RETURN_TO_VENDOR" ||
    x === "OUTBOUND_REVERSAL"
  ) {
    return "bg-rose-50 text-rose-700 border-rose-200";
  }

  if (x === "COUNT_CONFIRM" || x === "COUNT_ADJUST") {
    return "bg-slate-50 text-slate-700 border-slate-200";
  }

  return "bg-slate-50 text-slate-600 border-slate-200";
}

export function canonLabel(v: string | null): string {
  const x = (v ?? "").toUpperCase();
  if (x === "RECEIPT") return "入库";
  if (x === "SHIPMENT" || x === "OUTBOUND") return "出库";
  if (x === "ADJUSTMENT") return "调整";
  return v ?? "-";
}

export function movementLabel(v: string | null): string {
  const x = (v ?? "").toUpperCase();
  if (x === "INBOUND") return "入库";
  if (x === "OUTBOUND") return "出库";
  if (x === "COUNT") return "盘点";
  if (x === "ADJUST") return "调整";
  if (x === "RETURN") return "退货";
  return v ?? "-";
}

export function reasonLabel(v: string | null): string {
  const x = (v ?? "").toUpperCase();
  if (!x) return "-";

  if (x === "RECEIPT" || x === "INBOUND" || x === "INBOUND_RECEIPT") return "入库";
  if (x === "OUTBOUND_SHIP" || x === "SHIPMENT" || x === "SHIP") return "出库";
  if (x === "ADJUSTMENT" || x === "ADJUST" || x === "MANUAL_ADJUST") return "调整";
  if (x === "RETURN" || x === "RMA" || x === "INBOUND_RETURN") return "退货";
  if (x === "COUNT" || x === "STOCK_COUNT" || x === "INVENTORY_COUNT") return "盘点";

  return v ?? "-";
}

export function formatQtyWithUnit(qty: number, unit: string | null | undefined): string {
  const u = (unit ?? "").trim();
  return u ? `${qty} ${u}` : String(qty);
}

export function textOrDash(v: string | null | undefined): string {
  const x = (v ?? "").trim();
  return x || "-";
}
