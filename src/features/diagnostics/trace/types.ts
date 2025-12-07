// src/features/diagnostics/trace/types.ts

// 单条 trace 事件（v2 统一模型）
// - 后端应尽量填充这些标准字段
// - raw 用来保留原始 payload 以便调试
export interface TraceEvent {
  // 事件时间（业务时间 / occurred_at）
  ts: string | null;

  // 事件来源：ledger / reservation / outbound / inbound / snapshot / audit ...
  source: string;

  // 事件类型：INBOUND / OUTBOUND / SOFT_SHIP / RESERVE_PERSIST / SNAPSHOT_RUN ...
  kind: string;

  // 业务 ref：订单号 / reservation ref / snapshot job id 等
  ref?: string | null;

  // 链路 ID：用于跨 API / 表串联
  trace_id?: string | null;

  // 三维库存维度（如果相关）
  warehouse_id?: number | null;
  item_id?: number | null;
  batch_code?: string | null;

  // 业务含义：比如枚举化的 MovementType（INBOUND / OUTBOUND / ADJUST / SNAPSHOT 等）
  movement_type?: string | null;

  // 人类可读摘要（优先展示这个）
  message?: string | null;

  // 原因 / reason（通常与 ledger reason 对齐）
  reason?: string | null;

  // 原始 payload（供调试深入查看）
  raw: Record<string, unknown>;
}

// /debug/trace/{trace_id} 响应结构
export interface TraceResponse {
  trace_id: string;
  warehouse_id?: number | null;
  events: TraceEvent[];
}
