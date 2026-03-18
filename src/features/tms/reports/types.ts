// src/features/tms/reports/types.ts

export type TransportReportsMode = "bill" | "record";

export interface CostAnalysisSummary {
  ticket_count: number;
  total_cost: number;
}

export interface CostAnalysisByCarrierRow {
  carrier_code: string | null;
  ticket_count: number;
  total_cost: number;
}

export interface CostAnalysisByTimeRow {
  bucket: string;
  ticket_count: number;
  total_cost: number;
}

export interface CostAnalysisResponse {
  ok: boolean;
  summary: CostAnalysisSummary;
  by_carrier: CostAnalysisByCarrierRow[];
  by_time: CostAnalysisByTimeRow[];
}

export interface TransportReportsQuery {
  mode: TransportReportsMode;
  carrier_code?: string;
  start_date?: string;
  end_date?: string;
}
