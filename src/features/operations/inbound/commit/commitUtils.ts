// src/features/operations/inbound/commit/commitUtils.ts

import type { ReceiveTask, ReceiveTaskLine } from "../../../receive-tasks/api";

export function buildTraceQuery(traceId: string): string {
  const id = (traceId ?? "").trim();
  if (!id) return "";
  return `/trace?trace_id=${encodeURIComponent(id)}`;
}

export function getMismatchLines(task: ReceiveTask | null): ReceiveTaskLine[] {
  if (!task) return [];
  return task.lines.filter(
    (l) => l.expected_qty != null && (l.scanned_qty ?? 0) !== (l.expected_qty ?? 0),
  );
}

export function calcLineVariance(l: ReceiveTaskLine): number {
  const scanned = l.scanned_qty ?? 0;
  const expected = l.expected_qty ?? 0;
  if (l.expected_qty == null) return scanned;
  return scanned - expected;
}

export function varianceClass(v: number): string {
  return v === 0 ? "text-emerald-700" : v > 0 ? "text-amber-700" : "text-rose-700";
}
