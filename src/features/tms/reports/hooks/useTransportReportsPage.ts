// src/features/tms/reports/hooks/useTransportReportsPage.ts

import { useCallback, useEffect, useMemo, useState } from "react";
import { fetchCostAnalysis } from "../api";
import type {
  CostAnalysisByCarrierRow,
  CostAnalysisByTimeRow,
  CostAnalysisSummary,
  TransportReportsMode,
  TransportReportsQuery,
} from "../types";

type DateRange = {
  start_date: string;
  end_date: string;
};

type CarrierOption = {
  value: string;
  label: string;
};

function getDefaultRecordDateRange(): DateRange {
  const today = new Date();
  const endDate = today.toISOString().slice(0, 10);
  const start = new Date(today.getTime() - 6 * 24 * 60 * 60 * 1000);
  const startDate = start.toISOString().slice(0, 10);
  return { start_date: startDate, end_date: endDate };
}

function createDefaultQuery(mode: TransportReportsMode): TransportReportsQuery {
  if (mode === "bill") {
    return {
      mode: "bill",
      carrier_code: "",
      start_date: "",
      end_date: "",
    };
  }

  const range = getDefaultRecordDateRange();
  return {
    mode: "record",
    carrier_code: "",
    start_date: range.start_date,
    end_date: range.end_date,
  };
}

const EMPTY_SUMMARY: CostAnalysisSummary = {
  ticket_count: 0,
  total_cost: 0,
};

export function useTransportReportsPage() {
  const [query, setQuery] = useState<TransportReportsQuery>(
    createDefaultQuery("bill"),
  );
  const [summary, setSummary] = useState<CostAnalysisSummary>(EMPTY_SUMMARY);
  const [carrierRows, setCarrierRows] = useState<CostAnalysisByCarrierRow[]>([]);
  const [timeRows, setTimeRows] = useState<CostAnalysisByTimeRow[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  function setField<K extends keyof TransportReportsQuery>(
    key: K,
    value: TransportReportsQuery[K],
  ): void {
    setQuery((prev) => {
      if (key === "mode") {
        return createDefaultQuery(value as TransportReportsMode);
      }
      return { ...prev, [key]: value };
    });
  }

  function reset(): void {
    setQuery(createDefaultQuery(query.mode));
  }

  const reload = useCallback(async (): Promise<void> => {
    setLoading(true);
    setError("");

    try {
      const data = await fetchCostAnalysis(query);
      setSummary(data.summary ?? EMPTY_SUMMARY);
      setCarrierRows(data.by_carrier ?? []);
      setTimeRows(data.by_time ?? []);
    } catch (err) {
      const message = err instanceof Error ? err.message : "加载快递成本分析失败";
      setError(message);
      setSummary(EMPTY_SUMMARY);
      setCarrierRows([]);
      setTimeRows([]);
    } finally {
      setLoading(false);
    }
  }, [query]);

  useEffect(() => {
    void reload();
  }, [reload]);

  const modeLabel = useMemo(
    () => (query.mode === "bill" ? "账单成本" : "台帐预估成本"),
    [query.mode],
  );

  const carrierOptions = useMemo<CarrierOption[]>(() => {
    return carrierRows
      .filter((row) => (row.carrier_code ?? "").trim() !== "")
      .map((row) => {
        const code = row.carrier_code ?? "";
        return {
          value: code,
          label: code,
        };
      });
  }, [carrierRows]);

  return {
    query,
    summary,
    carrierRows,
    timeRows,
    loading,
    error,
    modeLabel,
    carrierOptions,
    setField,
    reset,
    reload,
  };
}
