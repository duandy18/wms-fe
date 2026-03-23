// src/features/tms/pricing/hooks/usePricingPage.ts

import { useCallback, useEffect, useMemo, useState } from "react";
import {
  activatePricingBinding,
  bindPricing,
  deactivatePricingBinding,
  fetchPricingBindingTemplateCandidates,
  fetchPricingList,
  fetchPricingProviderOptions,
  updatePricingBinding,
  type PricingProviderOption,
} from "../api";
import type {
  PricingBindingTemplateCandidate,
  PricingListRow,
  PricingStatus,
} from "../types";

export type WarehouseOption = {
  warehouse_id: number;
  warehouse_name: string;
};

type StatusOption = {
  value: PricingStatus;
  label: string;
};

const STATUS_OPTIONS: StatusOption[] = [
  { value: "active", label: "已生效" },
  { value: "scheduled", label: "待生效" },
  { value: "no_active_template", label: "未挂收费表" },
  { value: "binding_disabled", label: "已停止使用收费表" },
  { value: "provider_disabled", label: "网点停用" },
];

function rowActionKey(row: PricingListRow): string {
  return `${row.provider_id}-${row.warehouse_id}`;
}

export function usePricingPage() {
  const [rows, setRows] = useState<PricingListRow[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const [providersLoading, setProvidersLoading] = useState(false);
  const [providersError, setProvidersError] = useState("");
  const [providerOptions, setProviderOptions] = useState<PricingProviderOption[]>(
    [],
  );

  const [bindProviderId, setBindProviderId] = useState("");
  const [bindWarehouseId, setBindWarehouseId] = useState("");
  const [bindTemplateId, setBindTemplateId] = useState("");
  const [bindTemplateOptions, setBindTemplateOptions] = useState<
    PricingBindingTemplateCandidate[]
  >([]);
  const [bindTemplateLoading, setBindTemplateLoading] = useState(false);
  const [bindTemplateError, setBindTemplateError] = useState("");
  const [bindingSubmitting, setBindingSubmitting] = useState(false);
  const [bindingError, setBindingError] = useState("");
  const [bindingOk, setBindingOk] = useState("");

  const [actionKey, setActionKey] = useState("");

  const reload = useCallback(async (): Promise<void> => {
    setLoading(true);
    setError("");

    try {
      const res = await fetchPricingList();
      setRows(Array.isArray(res?.rows) ? res.rows : []);
    } catch (err) {
      setRows([]);
      setError(err instanceof Error ? err.message : "加载运价管理列表失败");
    } finally {
      setLoading(false);
    }
  }, []);

  const reloadProviders = useCallback(async (): Promise<void> => {
    setProvidersLoading(true);
    setProvidersError("");

    try {
      const list = await fetchPricingProviderOptions();
      setProviderOptions(list);
    } catch (err) {
      setProviderOptions([]);
      setProvidersError(
        err instanceof Error ? err.message : "加载快递网点选项失败",
      );
    } finally {
      setProvidersLoading(false);
    }
  }, []);

  useEffect(() => {
    void reload();
    void reloadProviders();
  }, [reload, reloadProviders]);

  const existingBinding = useMemo(() => {
    const providerIdNum = Number(bindProviderId);
    const warehouseIdNum = Number(bindWarehouseId);

    if (!Number.isFinite(providerIdNum) || providerIdNum <= 0) return null;
    if (!Number.isFinite(warehouseIdNum) || warehouseIdNum <= 0) return null;

    return (
      rows.find(
        (row) =>
          row.provider_id === providerIdNum &&
          row.warehouse_id === warehouseIdNum,
      ) ?? null
    );
  }, [bindProviderId, bindWarehouseId, rows]);

  useEffect(() => {
    if (!bindProviderId || !bindWarehouseId) {
      setBindTemplateOptions([]);
      setBindTemplateId("");
      setBindTemplateError("");
      return;
    }

    setBindTemplateId(
      existingBinding?.active_template_id != null
        ? String(existingBinding.active_template_id)
        : "",
    );

    let cancelled = false;

    const load = async () => {
      setBindTemplateLoading(true);
      setBindTemplateError("");

      try {
        const providerIdNum = Number(bindProviderId);
        const warehouseIdNum = Number(bindWarehouseId);

        const list = await fetchPricingBindingTemplateCandidates({
          warehouseId: warehouseIdNum,
          providerId: providerIdNum,
        });

        if (cancelled) return;

        let next = list;

        if (
          existingBinding?.active_template_id != null &&
          !list.some((item) => item.id === existingBinding.active_template_id)
        ) {
          next = [
            {
              id: existingBinding.active_template_id,
              shipping_provider_id: providerIdNum,
              shipping_provider_name: "",
              source_template_id: null,
              name:
                existingBinding.active_template_name ||
                `收费表 #${existingBinding.active_template_id}`,
              status: "draft",
              archived_at: null,
              validation_status: "passed",
              created_at: "",
              updated_at: "",
              used_binding_count: 1,
              config_status: "ready",
              ranges_count: 0,
              groups_count: 0,
              matrix_cells_count: 0,
            },
            ...list,
          ];
        }

        setBindTemplateOptions(next);
      } catch (err) {
        if (cancelled) return;
        setBindTemplateOptions([]);
        setBindTemplateError(
          err instanceof Error ? err.message : "加载模板候选失败",
        );
      } finally {
        if (!cancelled) {
          setBindTemplateLoading(false);
        }
      }
    };

    void load();

    return () => {
      cancelled = true;
    };
  }, [bindProviderId, bindWarehouseId, existingBinding]);

  const activateNow = useCallback(
    async (row: PricingListRow) => {
      const key = rowActionKey(row);
      setActionKey(key);
      setError("");

      try {
        await activatePricingBinding({
          warehouseId: row.warehouse_id,
          providerId: row.provider_id,
          effectiveFrom: null,
        });
        await reload();
      } catch (err) {
        setError(err instanceof Error ? err.message : "立即启用失败");
      } finally {
        setActionKey("");
      }
    },
    [reload],
  );

  const scheduleActivate = useCallback(
    async (row: PricingListRow, effectiveFrom: string) => {
      const key = rowActionKey(row);
      setActionKey(key);
      setError("");

      try {
        await activatePricingBinding({
          warehouseId: row.warehouse_id,
          providerId: row.provider_id,
          effectiveFrom,
        });
        await reload();
      } catch (err) {
        setError(err instanceof Error ? err.message : "定时启用失败");
      } finally {
        setActionKey("");
      }
    },
    [reload],
  );

  const deactivateBinding = useCallback(
    async (row: PricingListRow) => {
      const key = rowActionKey(row);
      setActionKey(key);
      setError("");

      try {
        await deactivatePricingBinding({
          warehouseId: row.warehouse_id,
          providerId: row.provider_id,
        });
        await reload();
      } catch (err) {
        setError(err instanceof Error ? err.message : "停用失败");
      } finally {
        setActionKey("");
      }
    },
    [reload],
  );

  const warehouseOptions = useMemo<WarehouseOption[]>(() => {
    const map = new Map<number, string>();

    for (const row of rows) {
      if (!map.has(row.warehouse_id)) {
        map.set(row.warehouse_id, row.warehouse_name);
      }
    }

    return Array.from(map.entries())
      .map(([warehouse_id, warehouse_name]) => ({
        warehouse_id,
        warehouse_name,
      }))
      .sort((a, b) =>
        a.warehouse_name.localeCompare(b.warehouse_name, "zh-CN"),
      );
  }, [rows]);

  const summary = useMemo(() => {
    const activeCount = rows.filter((x) => x.pricing_status === "active").length;
    const scheduledCount = rows.filter(
      (x) => x.pricing_status === "scheduled",
    ).length;
    const noActiveTemplateCount = rows.filter(
      (x) => x.pricing_status === "no_active_template",
    ).length;
    const bindingDisabledCount = rows.filter(
      (x) => x.pricing_status === "binding_disabled",
    ).length;
    const providerDisabledCount = rows.filter(
      (x) => x.pricing_status === "provider_disabled",
    ).length;

    return {
      total: rows.length,
      activeCount,
      scheduledCount,
      noActiveTemplateCount,
      bindingDisabledCount,
      providerDisabledCount,
    };
  }, [rows]);

  useEffect(() => {
    setBindingError("");
    setBindingOk("");
  }, [bindProviderId, bindWarehouseId, bindTemplateId]);

  const submitBindCard = useCallback(async (): Promise<void> => {
    setBindingError("");
    setBindingOk("");

    const providerIdNum = Number(bindProviderId);
    const warehouseIdNum = Number(bindWarehouseId);
    const templateIdNum = Number(bindTemplateId);

    if (!Number.isFinite(providerIdNum) || providerIdNum <= 0) {
      setBindingError("请选择快递网点");
      return;
    }

    if (!Number.isFinite(warehouseIdNum) || warehouseIdNum <= 0) {
      setBindingError("请选择仓库");
      return;
    }

    if (!Number.isFinite(templateIdNum) || templateIdNum <= 0) {
      setBindingError("请选择收费表");
      return;
    }

    const exists = rows.some(
      (row) =>
        row.provider_id === providerIdNum &&
        row.warehouse_id === warehouseIdNum,
    );

    setBindingSubmitting(true);
    try {
      if (exists) {
        await updatePricingBinding({
          warehouseId: warehouseIdNum,
          providerId: providerIdNum,
          activeTemplateId: templateIdNum,
        });
        setBindingOk("已保存关联");
      } else {
        await bindPricing({
          warehouseId: warehouseIdNum,
          providerId: providerIdNum,
          active: false,
          activeTemplateId: templateIdNum,
        });
        setBindingOk("已保存关联");
      }

      await reload();
    } catch (err) {
      setBindingError(err instanceof Error ? err.message : "保存关联失败");
    } finally {
      setBindingSubmitting(false);
    }
  }, [bindProviderId, bindTemplateId, bindWarehouseId, reload, rows]);

  return {
    rows,
    rawRows: rows,
    loading,
    error,

    providersLoading,
    providersError,
    providerOptions,

    warehouseOptions,
    statusOptions: STATUS_OPTIONS,
    summary,

    actionKey,
    activateNow,
    scheduleActivate,
    deactivateBinding,

    bindProviderId,
    bindWarehouseId,
    bindTemplateId,
    bindTemplateOptions,
    bindTemplateLoading,
    bindTemplateError,
    bindingSubmitting,
    bindingError,
    bindingOk,
    setBindProviderId,
    setBindWarehouseId,
    setBindTemplateId,
    submitBindCard,
  };
}
