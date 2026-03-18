// src/features/tms/reports/api.ts

import { apiGet } from "../../../lib/api";
import type {
  CostAnalysisResponse,
  TransportReportsMode,
  TransportReportsQuery,
} from "./types";

function buildCostAnalysisPath(mode: TransportReportsMode): string {
  return mode === "bill"
    ? "/tms/billing/cost-analysis"
    : "/tms/records/cost-analysis";
}

export async function fetchCostAnalysis(
  query: TransportReportsQuery,
): Promise<CostAnalysisResponse> {
  const { mode, ...rest } = query;
  return await apiGet<CostAnalysisResponse>(buildCostAnalysisPath(mode), rest);
}
