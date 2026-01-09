// src/features/operations/inbound/inboundTabs.ts

export type InboundTabKey =
  | "PURCHASE_MANUAL"
  | "RETURN";

export const INBOUND_TABS: Array<{ key: InboundTabKey; label: string }> = [
  { key: "PURCHASE_MANUAL", label: "采购收货" },
  { key: "RETURN", label: "退货收货" },
];
