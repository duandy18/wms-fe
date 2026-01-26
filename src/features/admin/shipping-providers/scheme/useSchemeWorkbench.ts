// src/features/admin/shipping-providers/scheme/useSchemeWorkbench.ts

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { fetchPricingSchemeDetail, type PricingSchemeDetail } from "../api";
import { L } from "./labels";
import { type MutateFn, type SchemeTabKey, toErrorMessage } from "./types";

function isZoneActive(z: unknown): boolean {
  // 兼容字段名：active / enabled（没有字段时按 true 处理，避免误伤）
  if (!z || typeof z !== "object") return true;
  const anyZ = z as Record<string, unknown>;
  if (typeof anyZ.active === "boolean") return anyZ.active;
  if (typeof anyZ.enabled === "boolean") return anyZ.enabled;
  return true;
}

export function useSchemeWorkbench(params: { open: boolean; schemeId: number | null }) {
  const { open, schemeId } = params;

  const [tab, setTab] = useState<SchemeTabKey>("zones");
  const [selectedZoneId, setSelectedZoneId] = useState<number | null>(null);

  const [detail, setDetail] = useState<PricingSchemeDetail | null>(null);

  // loading：只用于“首次进入/还没有 detail”时的加载占位
  const [loading, setLoading] = useState(false);

  // refreshing：已有 detail 时的静默刷新（不卸载页面，不闪）
  const [refreshing, setRefreshing] = useState(false);

  const [mutating, setMutating] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const canLoad = open && !!schemeId;

  // ✅ 用 ref 保存“当前 detail / 当前选中 zone”，避免 load() 依赖 state 造成循环触发
  const detailRef = useRef<PricingSchemeDetail | null>(null);
  const selectedZoneIdRef = useRef<number | null>(null);

  useEffect(() => {
    detailRef.current = detail;
  }, [detail]);

  useEffect(() => {
    selectedZoneIdRef.current = selectedZoneId;
  }, [selectedZoneId]);

  const load = useCallback(
    async (opts?: { silent?: boolean }) => {
      if (!schemeId) return;

      const silent = !!opts?.silent;
      const hasDetail = !!detailRef.current;

      // ✅ 有 detail 时静默刷新；没 detail 才显示 loading 占位
      if (silent && hasDetail) {
        setRefreshing(true);
      } else if (!hasDetail) {
        setLoading(true);
      } else {
        // 有 detail 但不是 silent：也走 refreshing，避免闪
        setRefreshing(true);
      }

      setError(null);

      try {
        const d = await fetchPricingSchemeDetail(schemeId);
        setDetail(d);

        const zones = d.zones ?? [];

        // ✅ 保留用户当前选中的 Zone（如果还存在）
        const current = selectedZoneIdRef.current;
        const stillExists = current != null && zones.some((z) => z.id === current);

        if (stillExists) {
          setSelectedZoneId(current);
        } else {
          // ✅ 默认优先选第一个“启用 Zone”，没有启用的再退回第一个
          const firstActive = zones.find((z) => isZoneActive(z)) ?? null;
          const firstZone = zones[0] ?? null;
          setSelectedZoneId((firstActive ?? firstZone)?.id ?? null);
        }
      } catch (e: unknown) {
        setError(toErrorMessage(e, L.loadFailed));

        // ❗刷新失败不清空 detail，避免页面闪回空态
        if (!detailRef.current) {
          setDetail(null);
          setSelectedZoneId(null);
        }
      } finally {
        setLoading(false);
        setRefreshing(false);
      }
    },
    [schemeId],
  );

  const reload = useCallback(async () => {
    await load({ silent: false });
  }, [load]);

  const reloadSilent = useCallback(async () => {
    await load({ silent: true });
  }, [load]);

  const mutate = useCallback(
    async (fn: MutateFn) => {
      if (!schemeId) return;
      setMutating(true);
      setError(null);
      try {
        await fn();
        // ✅ mutate 完成后静默刷新（不闪）
        await reloadSilent();
      } catch (e: unknown) {
        setError(toErrorMessage(e, "操作失败"));
      } finally {
        setMutating(false);
      }
    },
    [reloadSilent, schemeId],
  );

  useEffect(() => {
    if (!canLoad) return;
    void load({ silent: false });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [canLoad, schemeId]);

  useEffect(() => {
    if (open) return;
    setDetail(null);
    setError(null);
    setLoading(false);
    setRefreshing(false);
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
      currency: detail.currency,
      effective_from: detail.effective_from ?? null,
      effective_to: detail.effective_to ?? null,
      zonesCount: detail.zones?.length ?? 0,
      surchargesCount: detail.surcharges?.length ?? 0,
    };
  }, [detail]);

  // ✅ 刚性契约：由后端直接提供（不推导）
  const providerName = useMemo(() => {
    if (!detail) return null;
    const v = (detail.shipping_provider_name ?? "").trim();
    return v ? v : null;
  }, [detail]);

  return {
    tab,
    setTab,
    selectedZoneId,
    setSelectedZoneId,

    detail,
    summary,
    providerName,

    loading,
    refreshing,
    mutating,
    error,
    setError,

    load,
    reload,
    reloadSilent,
    mutate,
  };
}
