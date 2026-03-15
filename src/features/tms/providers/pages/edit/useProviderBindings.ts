// src/features/tms/providers/pages/edit/useProviderBindings.ts
import { useCallback, useEffect, useMemo, useState } from "react";

import type { WarehouseListItem } from "../../../../admin/warehouses/types";
import {
  bindProviderToWarehouse,
  listWarehouseShippingProviders,
  unbindProviderFromWarehouse,
  updateWarehouseProviderBinding,
  type WarehouseShippingProvider,
} from "../../api/bindings";

function toErrMsg(e: unknown, fallback: string): string {
  if (e instanceof Error) return e.message || fallback;
  return fallback;
}

export type ProviderBindingViewRow = {
  warehouse_id: number;
  warehouse_code: string;
  warehouse_name: string;
  warehouse_label: string;

  bound: boolean;
  active: boolean;
  priority: number;
  pickup_cutoff_time: string | null;
  remark: string | null;

  provider_binding: WarehouseShippingProvider | null;
};

function warehouseLabel(w: WarehouseListItem): string {
  const code = w.code ? String(w.code).trim() : "";
  const name = w.name ? String(w.name).trim() : "";
  return code && name ? `${code} ${name}` : code || name || `WH-${w.id}`;
}

export function useProviderBindings(args: {
  providerId: number | null;
  warehouses: WarehouseListItem[];
}) {
  const { providerId, warehouses } = args;

  const [rows, setRows] = useState<ProviderBindingViewRow[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [savingWarehouseId, setSavingWarehouseId] = useState<number | null>(null);
  const [ok, setOk] = useState<string | null>(null);

  const warehouseOptions = useMemo(() => {
    return [...warehouses].sort((a, b) => {
      const aCode = String(a.code ?? "");
      const bCode = String(b.code ?? "");
      if (aCode !== bCode) return aCode.localeCompare(bCode, "zh-CN");
      return Number(a.id) - Number(b.id);
    });
  }, [warehouses]);

  const refresh = useCallback(async () => {
    if (!providerId) {
      setRows([]);
      setError(null);
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const result = await Promise.all(
        warehouseOptions.map(async (w) => {
          const list = await listWarehouseShippingProviders(w.id);
          const hit = list.find((x) => x.shipping_provider_id === providerId) ?? null;

          return {
            warehouse_id: w.id,
            warehouse_code: String(w.code ?? ""),
            warehouse_name: String(w.name ?? ""),
            warehouse_label: warehouseLabel(w),

            bound: hit != null,
            active: hit?.active ?? false,
            priority: hit?.priority ?? 100,
            pickup_cutoff_time: hit?.pickup_cutoff_time ?? null,
            remark: hit?.remark ?? null,

            provider_binding: hit,
          } satisfies ProviderBindingViewRow;
        }),
      );

      setRows(result);
    } catch (e: unknown) {
      setRows([]);
      setError(toErrMsg(e, "加载仓库绑定失败"));
    } finally {
      setLoading(false);
    }
  }, [providerId, warehouseOptions]);

  useEffect(() => {
    void refresh();
  }, [refresh]);

  const boundCount = useMemo(() => rows.filter((x) => x.bound).length, [rows]);
  const activeCount = useMemo(() => rows.filter((x) => x.bound && x.active).length, [rows]);

  const bindWarehouse = useCallback(
    async (warehouseId: number, payload?: { active?: boolean; priority?: number; pickup_cutoff_time?: string | null; remark?: string | null }) => {
      if (!providerId) return;

      setSavingWarehouseId(warehouseId);
      setError(null);
      setOk(null);

      try {
        await bindProviderToWarehouse(warehouseId, {
          shipping_provider_id: providerId,
          active: payload?.active ?? true,
          priority: payload?.priority ?? 100,
          pickup_cutoff_time: payload?.pickup_cutoff_time ?? null,
          remark: payload?.remark ?? null,
        });
        await refresh();
        setOk("已完成仓库绑定");
      } catch (e: unknown) {
        setError(toErrMsg(e, "绑定仓库失败"));
      } finally {
        setSavingWarehouseId(null);
      }
    },
    [providerId, refresh],
  );

  const saveBinding = useCallback(
    async (warehouseId: number, payload: { active: boolean; priority: number; pickup_cutoff_time?: string | null; remark?: string | null }) => {
      if (!providerId) return;

      setSavingWarehouseId(warehouseId);
      setError(null);
      setOk(null);

      try {
        const current = rows.find((x) => x.warehouse_id === warehouseId) ?? null;
        if (!current) {
          throw new Error(`未找到 warehouse_id=${warehouseId} 的绑定行`);
        }

        if (!current.bound) {
          await bindProviderToWarehouse(warehouseId, {
            shipping_provider_id: providerId,
            active: payload.active,
            priority: payload.priority,
            pickup_cutoff_time: payload.pickup_cutoff_time ?? null,
            remark: payload.remark ?? null,
          });
        } else {
          await updateWarehouseProviderBinding(warehouseId, providerId, {
            active: payload.active,
            priority: payload.priority,
            pickup_cutoff_time: payload.pickup_cutoff_time ?? null,
            remark: payload.remark ?? null,
          });
        }

        await refresh();
        setOk("已保存仓库绑定");
      } catch (e: unknown) {
        setError(toErrMsg(e, "保存仓库绑定失败"));
      } finally {
        setSavingWarehouseId(null);
      }
    },
    [providerId, refresh, rows],
  );

  const removeBinding = useCallback(
    async (warehouseId: number) => {
      if (!providerId) return;

      setSavingWarehouseId(warehouseId);
      setError(null);
      setOk(null);

      try {
        await unbindProviderFromWarehouse(warehouseId, providerId);
        await refresh();
        setOk("已解除仓库绑定");
      } catch (e: unknown) {
        setError(toErrMsg(e, "解除绑定失败"));
      } finally {
        setSavingWarehouseId(null);
      }
    },
    [providerId, refresh],
  );

  return {
    rows,
    loading,
    error,
    ok,
    savingWarehouseId,

    boundCount,
    activeCount,

    refresh,
    bindWarehouse,
    saveBinding,
    removeBinding,
  };
}

export default useProviderBindings;
