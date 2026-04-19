import { useCallback, useEffect, useState } from "react";
import {
  fetchOutboundSummary,
  fetchOutboundSummaryDetail,
} from "../api/outboundApi";
import type {
  OutboundSummaryDetailOut,
  OutboundSummaryRowOut,
} from "../contracts/outbound";

function getErrorMessage(error: unknown, fallback: string): string {
  if (error instanceof Error && error.message.trim()) {
    return error.message;
  }
  return fallback;
}

type DetailMap = Record<number, OutboundSummaryDetailOut | undefined>;
type DetailLoadingMap = Record<number, boolean>;
type DetailErrorMap = Record<number, string>;

export function useOutboundSummaryPage() {
  const [rows, setRows] = useState<OutboundSummaryRowOut[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [reloadToken, setReloadToken] = useState(0);

  const [expandedEventId, setExpandedEventId] = useState<number | null>(null);
  const [detailByEventId, setDetailByEventId] = useState<DetailMap>({});
  const [detailLoadingByEventId, setDetailLoadingByEventId] =
    useState<DetailLoadingMap>({});
  const [detailErrorByEventId, setDetailErrorByEventId] =
    useState<DetailErrorMap>({});

  const loadSummary = useCallback(async () => {
    setLoading(true);
    setError("");
    try {
      const data = await fetchOutboundSummary({ limit: 50, offset: 0 });
      setRows(Array.isArray(data.items) ? data.items : []);
    } catch (err) {
      setRows([]);
      setError(getErrorMessage(err, "加载出库汇总失败"));
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void loadSummary();
  }, [loadSummary, reloadToken]);

  const loadDetail = useCallback(
    async (eventId: number, force = false) => {
      if (!Number.isFinite(eventId) || eventId <= 0) return;

      if (!force) {
        if (detailByEventId[eventId] || detailLoadingByEventId[eventId]) {
          return;
        }
      }

      setDetailLoadingByEventId((prev) => ({ ...prev, [eventId]: true }));
      setDetailErrorByEventId((prev) => ({ ...prev, [eventId]: "" }));

      try {
        const detail = await fetchOutboundSummaryDetail(eventId);
        setDetailByEventId((prev) => ({ ...prev, [eventId]: detail }));
      } catch (err) {
        setDetailErrorByEventId((prev) => ({
          ...prev,
          [eventId]: getErrorMessage(err, "加载当前出库明细失败"),
        }));
      } finally {
        setDetailLoadingByEventId((prev) => ({ ...prev, [eventId]: false }));
      }
    },
    [detailByEventId, detailLoadingByEventId],
  );

  const toggleExpand = useCallback(
    async (eventId: number) => {
      if (expandedEventId === eventId) {
        setExpandedEventId(null);
        return;
      }
      setExpandedEventId(eventId);
      await loadDetail(eventId, false);
    },
    [expandedEventId, loadDetail],
  );

  return {
    rows,
    loading,
    error,
    expandedEventId,
    detailByEventId,
    detailLoadingByEventId,
    detailErrorByEventId,
    reload: () => setReloadToken((v) => v + 1),
    toggleExpand,
    refreshDetail: async (eventId: number) => {
      await loadDetail(eventId, true);
    },
  };
}
