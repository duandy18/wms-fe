// src/features/admin/shipping-providers/scheme/useSchemeWorkbench.ts

import { useCallback, useEffect, useMemo, useState } from "react";
import { fetchPricingSchemeDetail, type PricingSchemeDetail } from "../api";
import { L } from "./labels";
import { type MutateFn, type SchemeTabKey, toErrorMessage } from "./types";

export function useSchemeWorkbench(params: { open: boolean; schemeId: number | null }) {
  const { open, schemeId } = params;

  const [tab, setTab] = useState<SchemeTabKey>("zones");
  const [selectedZoneId, setSelectedZoneId] = useState<number | null>(null);

  const [detail, setDetail] = useState<PricingSchemeDetail | null>(null);
  const [loading, setLoading] = useState(false);
  const [mutating, setMutating] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const canLoad = open && !!schemeId;

  const load = useCallback(async () => {
    if (!schemeId) return;
    setLoading(true);
    setError(null);
    try {
      const d = await fetchPricingSchemeDetail(schemeId);
      setDetail(d);

      const firstZone = d.zones?.[0] ?? null;
      setSelectedZoneId(firstZone?.id ?? null);
    } catch (e: unknown) {
      setError(toErrorMessage(e, L.loadFailed));
      setDetail(null);
      setSelectedZoneId(null);
    } finally {
      setLoading(false);
    }
  }, [schemeId]);

  const reload = useCallback(async () => {
    await load();
  }, [load]);

  const mutate = useCallback(
    async (fn: MutateFn) => {
      if (!schemeId) return;
      setMutating(true);
      setError(null);
      try {
        await fn();
        await load();
      } catch (e: unknown) {
        setError(toErrorMessage(e, "操作失败"));
      } finally {
        setMutating(false);
      }
    },
    [load, schemeId],
  );

  useEffect(() => {
    if (!canLoad) return;
    void load();
  }, [canLoad, load]);

  useEffect(() => {
    if (open) return;
    setDetail(null);
    setError(null);
    setLoading(false);
    setMutating(false);
    setTab("zones");
    setSelectedZoneId(null);
  }, [open]);

  const summary = useMemo(() => {
    if (!detail) return null;
    return {
      id: detail.id,
      name: detail.name,
      active: detail.active,
      priority: detail.priority,
      currency: detail.currency,
      effective_from: detail.effective_from ?? null,
      effective_to: detail.effective_to ?? null,
      zonesCount: detail.zones?.length ?? 0,
      surchargesCount: detail.surcharges?.length ?? 0,
    };
  }, [detail]);

  return {
    tab,
    setTab,
    selectedZoneId,
    setSelectedZoneId,

    detail,
    summary,

    loading,
    mutating,
    error,
    setError,

    load,
    reload,
    mutate,
  };
}
