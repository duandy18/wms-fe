// src/features/diagnostics/trace/types.ts

export interface TraceEventIssue {
  code: string;
  message: string;
  severity?: "info" | "warn" | "error";
}

// 单条 trace 事件（v2 统一模型）
export interface TraceEvent {
  // 事件时间（业务时间 / occurred_at）
  ts: string | Date | null;

  // 事件来源：ledger / outbound / inbound / snapshot / audit / event_store ...
  source: string;

  // 事件类型：INBOUND / OUTBOUND / SOFT_SHIP / SNAPSHOT_RUN ...
  kind: string;

  // 业务 ref：订单号 / snapshot job id 等
  ref?: string | null;

  // 链路 ID：用于跨 API / 表串联
  trace_id?: string | null;

  // 维度字段
  warehouse_id?: number | null;
  item_id?: number | null;
  batch_code?: string | null;

  // MovementType 等业务枚举
  movement_type?: string | null;

  // 旧字段 + 新字段
  summary?: string | null;
  message?: string | null;
  reason?: string | null;
  type?: string | null; // 兼容某些老 payload

  // 风险 / 异常
  issues?: TraceEventIssue[] | null;

  // 原始 payload
  raw: Record<string, unknown>;
}

export interface TraceResponse {
  trace_id: string;
  warehouse_id?: number | null;
  events: TraceEvent[];
}
