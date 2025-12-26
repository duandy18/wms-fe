// src/features/admin/items/page/types.ts
//
// ItemsPage 拆分：类型声明（无 React）

export type ScanProbeError = {
  stage?: string;
  error?: string;
};

export interface ScanProbeResponse {
  ok: boolean;
  committed: boolean;
  scan_ref: string;
  event_id?: number | null;
  source?: string | null;
  item_id?: number | null;
  qty?: number | null;
  batch_code?: string | null;
  evidence?: Array<Record<string, unknown>>;
  errors?: ScanProbeError[];
}

export type BindInfo =
  | { status: "UNBOUND"; msg: string }
  | { status: "BOUND"; msg: string }
  | { status: "CONFLICT"; msg: string };

export type ProbeInfo = { level: "ok" | "warn" | "error"; msg: string };
