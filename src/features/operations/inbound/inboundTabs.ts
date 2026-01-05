// src/features/operations/inbound/inboundTabs.ts

export type InboundTabKey =
  | "PURCHASE_MANUAL"
  | "PURCHASE_SCAN"
  | "RETURN"
  | "MISC";

export const INBOUND_TABS: Array<{ key: InboundTabKey; label: string }> = [
  { key: "PURCHASE_MANUAL", label: "采购手工收货" },
  { key: "PURCHASE_SCAN", label: "采购扫码收货" },
  { key: "RETURN", label: "退货收货" },
  { key: "MISC", label: "样品 / 非采购收货" },
];
