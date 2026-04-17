// src/features/wms/inbound/utils.ts

import type {
  InboundDraftHead,
  InboundDraftLine,
  InboundMode,
  InboundSourceType,
  InboundWorkbenchState,
} from "./types";

function buildLocalId(): string {
  return `inb-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
}

export function mapModeToSourceType(mode: InboundMode): InboundSourceType {
  switch (mode) {
    case "PURCHASE":
      return "PURCHASE_ORDER";
    case "RETURN":
      return "RETURN";
    case "OTHER":
    default:
      return "MANUAL";
  }
}

export function createEmptyDraftHead(
  mode: InboundMode,
): InboundDraftHead {
  return {
    sourceType: mapModeToSourceType(mode),
    sourceRef: null,
    occurredAt: null,
    remark: "",
  };
}

export function createEmptyDraftLine(): InboundDraftLine {
  return {
    localId: buildLocalId(),

    itemId: null,
    barcode: null,
    uomId: null,

    qtyInput: "",
    lotCodeInput: "",
    productionDate: "",
    expiryDate: "",

    poLineId: null,
    remark: "",
  };
}

export function createInitialWorkbenchState(): InboundWorkbenchState {
  const mode: InboundMode = "PURCHASE";

  return {
    warehouseId: null,
    mode,

    head: createEmptyDraftHead(mode),
    lines: [createEmptyDraftLine()],

    submitting: false,
    submitError: null,

    latestEvent: null,
    recentEvents: [],
  };
}
