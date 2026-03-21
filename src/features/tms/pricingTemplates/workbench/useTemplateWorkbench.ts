// src/features/tms/pricingTemplates/workbench/useTemplateWorkbench.ts

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { fetchPricingTemplateDetail } from "../api";
import type { PricingTemplateDetail } from "../types";
import { L } from "./labels";
import { type MutateFn, type WorkbenchTabKey, toErrorMessage } from "./types";

function isGroupActive(group: unknown): boolean {
  if (!group || typeof group !== "object") return true;
  const value = group as { active?: unknown };
  if (typeof value.active === "boolean") return value.active;
  return true;
}

export function useTemplateWorkbench(params: {
  open: boolean;
  templateId: number | null;
}) {
  const { open, templateId } = params;

  const [tab, setTab] = useState<WorkbenchTabKey>("zones");
  const [selectedZoneId, setSelectedZoneId] = useState<number | null>(null);

  const [detail, setDetail] = useState<PricingTemplateDetail | null>(null);

  // loading：只用于“首次进入/还没有 detail”时的加载占位
  const [loading, setLoading] = useState(false);

  // refreshing：已有 detail 时的静默刷新（不卸载页面，不闪）
  const [refreshing, setRefreshing] = useState(false);

  const [mutating, setMutating] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const canLoad = open && !!templateId;

  // ✅ 用 ref 保存“当前 detail / 当前选中 group”，避免 load() 依赖 state 造成循环触发
  const detailRef = useRef<PricingTemplateDetail | null>(null);
  const selectedZoneIdRef = useRef<number | null>(null);

  useEffect(() => {
    detailRef.current = detail;
  }, [detail]);

  useEffect(() => {
    selectedZoneIdRef.current = selectedZoneId;
  }, [selectedZoneId]);

  const load = useCallback(
    async (opts?: { silent?: boolean }) => {
      if (!templateId) return;

      const silent = !!opts?.silent;
      const hasDetail = !!detailRef.current;

      if (silent && hasDetail) {
        setRefreshing(true);
      } else if (!hasDetail) {
        setLoading(true);
      } else {
        setRefreshing(true);
      }

      setError(null);

      try {
        const d = await fetchPricingTemplateDetail(templateId);
        setDetail(d);

        const groups = d.destination_groups ?? [];
        const current = selectedZoneIdRef.current;
        const stillExists = current != null && groups.some((g) => g.id === current);

        if (stillExists) {
          setSelectedZoneId(current);
        } else {
          const firstActive = groups.find((g) => isGroupActive(g)) ?? null;
          const firstGroup = groups[0] ?? null;
          setSelectedZoneId((firstActive ?? firstGroup)?.id ?? null);
        }
      } catch (e: unknown) {
        setError(toErrorMessage(e, L.loadFailed));

        if (!detailRef.current) {
          setDetail(null);
          setSelectedZoneId(null);
        }
      } finally {
        setLoading(false);
        setRefreshing(false);
      }
    },
    [templateId],
  );

  const reload = useCallback(async () => {
    await load({ silent: false });
  }, [load]);

  const reloadSilent = useCallback(async () => {
    await load({ silent: true });
  }, [load]);

  const mutate = useCallback(
    async (fn: MutateFn) => {
      if (!templateId) return;
      setMutating(true);
      setError(null);
      try {
        await fn();
        await reloadSilent();
      } catch (e: unknown) {
        setError(toErrorMessage(e, "操作失败"));
      } finally {
        setMutating(false);
      }
    },
    [reloadSilent, templateId],
  );

  useEffect(() => {
    if (!canLoad) return;
    void load({ silent: false });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [canLoad, templateId]);

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
      status: detail.status,
      configStatus: detail.config_status,
      validationStatus: detail.validation_status,
      usedBindingCount: detail.used_binding_count,
      archived: String(detail.status || "").toLowerCase() === "archived",
      zonesCount: detail.destination_groups?.length ?? 0,
    };
  }, [detail]);

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

export default useTemplateWorkbench;
