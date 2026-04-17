// src/features/wms/inbound/types.ts

export type InboundMode = "PURCHASE" | "RETURN" | "OTHER";

export type InboundSourceType =
  | "PURCHASE_ORDER"
  | "RETURN"
  | "MANUAL";

export type InboundDraftHead = {
  sourceType: InboundSourceType;
  sourceRef: string | null;
  occurredAt: string | null;
  remark: string;
};

export type InboundDraftLine = {
  localId: string;

  itemId: number | null;
  barcode: string | null;
  uomId: number | null;

  qtyInput: string;
  lotCodeInput: string;
  productionDate: string;
  expiryDate: string;

  poLineId: number | null;
  remark: string;
};

export type InboundEventSummary = {
  eventId: number;
  eventNo: string;
  eventType: "INBOUND";
  sourceType: string | null;
  sourceRef: string | null;
  occurredAt: string;
  committedAt: string | null;
  traceId: string;
  status: string;
};

export type InboundEventLineDetail = {
  lineNo: number;

  itemId: number;
  itemName: string | null;
  sku: string | null;

  uomId: number;
  uomName: string | null;

  barcodeInput: string | null;
  qtyInput: number;
  ratioToBaseSnapshot: number;
  qtyBase: number;

  lotId: number | null;
  lotCode: string | null;
  productionDate: string | null;
  expiryDate: string | null;

  poLineId: number | null;
  remark: string | null;
};

export type InboundEventDetail = {
  event: InboundEventSummary;
  lines: InboundEventLineDetail[];
};

export type InboundWorkbenchState = {
  warehouseId: number | null;
  mode: InboundMode;

  head: InboundDraftHead;
  lines: InboundDraftLine[];

  submitting: boolean;
  submitError: string | null;

  latestEvent: InboundEventDetail | null;
  recentEvents: InboundEventSummary[];
};
