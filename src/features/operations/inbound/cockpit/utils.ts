// src/features/operations/inbound/cockpit/utils.ts

import type { ReceiveTask } from "../../../receive-tasks/api";
import type { InboundVarianceSummary } from "../types";

let nextHistoryId = 1;

export function allocHistoryId(): number {
  return nextHistoryId++;
}

export function fmt(d: Date): string {
  return d.toISOString().replace("T", " ").slice(0, 19);
}

type ApiErrorShape = {
  message?: string;
};

export function getErrMsg(err: unknown, fallback: string): string {
  const e = err as ApiErrorShape;
  return e?.message ?? fallback;
}

export function makeDefaultTraceId(taskId: number): string {
  return `inbound:cockpit:${taskId}:${Date.now()}`;
}

export function calcVariance(task: ReceiveTask | null): InboundVarianceSummary {
  if (!task) return { totalExpected: 0, totalScanned: 0, totalVariance: 0 };

  let expected = 0;
  let scanned = 0;

  for (const l of task.lines) {
    scanned += (l.scanned_qty ?? 0);
    if (l.expected_qty != null) expected += l.expected_qty;
  }

  return {
    totalExpected: expected,
    totalScanned: scanned,
    totalVariance: scanned - expected,
  };
}
