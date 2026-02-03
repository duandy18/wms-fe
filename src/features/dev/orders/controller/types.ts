// src/features/dev/orders/controller/types.ts

import type { DevOrderInfo, DevOrderItemFact, DevOrderReconcileResult, TraceEvent } from "../api/index";

export type DevOrdersTab = "flow" | "scenarios" | "tools";
export type ActionLoading = null | "pick" | "ship" | "full";

export type FormState = {
  platform: string;
  shopId: string;
  extOrderNo: string;
};

export type ControllerState = {
  form: FormState;

  loading: boolean;
  error: string | null;

  order: DevOrderInfo | null;
  orderFacts: DevOrderItemFact[] | null;
  traceEvents: TraceEvent[];

  actionLoading: ActionLoading;
  ensuringWarehouse: boolean;
  creatingRma: boolean;
  reconcileLoading: boolean;
  reconcileResult: DevOrderReconcileResult | null;

  activeTab: DevOrdersTab;
};
