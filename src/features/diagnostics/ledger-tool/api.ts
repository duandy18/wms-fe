// src/features/diagnostics/ledger-tool/api.ts
import { apiPost } from "../../../lib/api";
import type {
  LedgerList,
  LedgerQueryPayload,
  LedgerSummary,
  LedgerReconcileResult,
} from "./types";

export async function fetchLedgerList(
  payload: LedgerQueryPayload,
): Promise<LedgerList> {
  return apiPost<LedgerList>("/stock/ledger/query", payload);
}

export async function fetchLedgerSummary(
  payload: LedgerQueryPayload,
): Promise<LedgerSummary> {
  return apiPost<LedgerSummary>("/stock/ledger/summary", payload);
}

export async function fetchLedgerReconcile(
  payload: LedgerQueryPayload,
): Promise<LedgerReconcileResult> {
  return apiPost<LedgerReconcileResult>("/stock/ledger/reconcile", payload);
}
