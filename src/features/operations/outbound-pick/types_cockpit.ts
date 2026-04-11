// src/features/operations/outbound-pick/types_cockpit.ts

import type { TraceEvent } from "../../diagnostics/trace/types";
import type { LedgerRow } from "../../diagnostics/ledger-tool/types";
import type { InventoryDetailResponse as ItemDetailResponse } from "@/features/wms/inventory/api/contracts";

export type StatusFilter = "ALL" | "READY" | "PICKING" | "DONE";

export type ApiErrorShape = {
  message?: string;
};

export type PickPostCommitInfo = {
  traceEvents: TraceEvent[];
  ledgerRows: LedgerRow[];
  snapshot: ItemDetailResponse | null;
};

export type ScanResponseExtended = {
  ok?: boolean;
  scan_ref?: string | null;
  item_id?: number | null;
};
