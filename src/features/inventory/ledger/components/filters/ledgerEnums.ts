// src/features/inventory/ledger/components/filters/ledgerEnums.ts

export const REASON_CANON = ["RECEIPT", "SHIPMENT", "ADJUSTMENT"] as const;
export type ReasonCanon = (typeof REASON_CANON)[number];

export const SUB_REASON = [
  "PO_RECEIPT",
  "RETURN_RECEIPT",
  "ORDER_SHIP",
  "INTERNAL_SHIP",
  "RETURN_TO_VENDOR",
  "COUNT_ADJUST",
] as const;
export type SubReason = (typeof SUB_REASON)[number];

export const REASON_CANON_LABEL: Record<ReasonCanon, string> = {
  RECEIPT: "入库",
  SHIPMENT: "出库",
  ADJUSTMENT: "调整 / 盘点",
};

export const SUB_REASON_LABEL: Record<SubReason, string> = {
  PO_RECEIPT: "采购入库",
  RETURN_RECEIPT: "退货入库",
  ORDER_SHIP: "订单出库",
  INTERNAL_SHIP: "内部出库",
  RETURN_TO_VENDOR: "退供应商出库",
  COUNT_ADJUST: "盘点确认",
};

export const REASON_CANON_OPTIONS: Array<{ value: "" | ReasonCanon; label: string }> = [
  { value: "", label: "不限" },
  { value: "RECEIPT", label: REASON_CANON_LABEL.RECEIPT },
  { value: "SHIPMENT", label: REASON_CANON_LABEL.SHIPMENT },
  { value: "ADJUSTMENT", label: REASON_CANON_LABEL.ADJUSTMENT },
];

export const SUB_REASON_OPTIONS: Array<{ value: "" | SubReason; label: string }> = [
  { value: "", label: "不限" },
  { value: "PO_RECEIPT", label: SUB_REASON_LABEL.PO_RECEIPT },
  { value: "RETURN_RECEIPT", label: SUB_REASON_LABEL.RETURN_RECEIPT },
  { value: "ORDER_SHIP", label: SUB_REASON_LABEL.ORDER_SHIP },
  { value: "INTERNAL_SHIP", label: SUB_REASON_LABEL.INTERNAL_SHIP },
  { value: "RETURN_TO_VENDOR", label: SUB_REASON_LABEL.RETURN_TO_VENDOR },
  { value: "COUNT_ADJUST", label: SUB_REASON_LABEL.COUNT_ADJUST },
];
