// src/features/inventory/ledger/components/filters/options.ts
export const CANON_OPTIONS: Array<{ value: string; label: string }> = [
  { value: "", label: "不限" },
  { value: "RECEIPT", label: "入库" },
  { value: "SHIPMENT", label: "出库" },
  { value: "ADJUSTMENT", label: "调整 / 盘点" },
];

export const SUB_REASON_OPTIONS: Array<{ value: string; label: string }> = [
  { value: "", label: "不限" },
  { value: "PO_RECEIPT", label: "采购入库" },
  { value: "ORDER_SHIP", label: "订单出库" },
  { value: "COUNT_ADJUST", label: "盘点确认" },
  { value: "RETURN_RECEIPT", label: "退货入库" },
  { value: "INTERNAL_SHIP", label: "内部出库" },
  { value: "RETURN_TO_VENDOR", label: "退供应商出库" },
];
