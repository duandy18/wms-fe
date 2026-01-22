// src/features/admin/warehouses/detail/useWarehouseShippingProvidersModel.ts
import { useEffect, useMemo, useState } from "react";
import {
  bindWarehouseShippingProvider,
  fetchShippingProviders,
  fetchWarehouseShippingProviders,
  patchWarehouseShippingProvider,
  unbindWarehouseShippingProvider,
} from "../api";
import type {
  ShippingProviderListItem,
  WarehouseShippingProviderBindPayload,
  WarehouseShippingProviderListItem,
  WarehouseShippingProviderPatchPayload,
} from "../types";

type UnknownRecord = Record<string, unknown>;
function isRecord(v: unknown): v is UnknownRecord {
  return typeof v === "object" && v !== null;
}

function toHumanError(e: unknown, fallback: string): string {
  if (!e) return fallback;
  if (typeof e === "string") return e;
  if (e instanceof Error && e.message) return e.message;
  if (isRecord(e) && typeof e.message === "string") return e.message;
  return fallback;
}

export function useWarehouseShippingProvidersModel(args: { warehouseId: number; canWrite: boolean }) {
  const { warehouseId, canWrite } = args;

  const [loading, setLoading] = useState(false);

  // 全局 busy：绑定/解绑/刷新等操作用
  const [busy, setBusy] = useState(false);

  // 行内 busy：切换启用时用（避免用户连点）
  const [togglingProviderId, setTogglingProviderId] = useState<number | null>(null);

  const [error, setError] = useState<string | null>(null);
  const [saveOk, setSaveOk] = useState(false);

  const [items, setItems] = useState<WarehouseShippingProviderListItem[]>([]);
  const [providers, setProviders] = useState<ShippingProviderListItem[]>([]);

  const [selectedProviderId, setSelectedProviderId] = useState<string>("");

  const providerOptions = useMemo(() => {
    const bound = new Set(items.map((x) => x.shipping_provider_id));

    return providers
      .map((p) => {
        const disabledBecauseBound = bound.has(p.id);
        const disabledBecauseInactive = !p.active;

        const disabled = disabledBecauseBound || disabledBecauseInactive;

        const disabled_reason = disabledBecauseBound
          ? "已具备资格"
          : disabledBecauseInactive
          ? "主数据已禁用"
          : null;

        return {
          ...p,
          disabled,
          disabled_reason,
        };
      })
      .sort((a, b) => a.name.localeCompare(b.name, "zh"));
  }, [providers, items]);

  async function reload() {
    if (!warehouseId) return;
    setLoading(true);
    setError(null);
    setSaveOk(false);

    try {
      const [bound, ps] = await Promise.all([
        fetchWarehouseShippingProviders(warehouseId),
        fetchShippingProviders(),
      ]);
      setItems(bound);
      setProviders(ps);
    } catch (err) {
      setError(toHumanError(err, "加载可用快递公司失败"));
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    void reload();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [warehouseId]);

  useEffect(() => {
    if (saveOk) setSaveOk(false);
    if (error) setError(null);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedProviderId]);

  async function bindSelected() {
    if (!warehouseId) return;
    if (!canWrite) return;

    const pid = Number(selectedProviderId);
    if (!Number.isFinite(pid) || pid <= 0) {
      setError("请选择要具备服务资格的快递公司");
      return;
    }

    const picked = providers.find((x) => x.id === pid) ?? null;
    if (!picked) {
      setError("所选快递公司不存在，请刷新后重试");
      return;
    }
    if (!picked.active) {
      setError("该快递公司主数据已禁用，不能授予服务资格");
      return;
    }

    setBusy(true);
    setError(null);
    setSaveOk(false);
    try {
      const payload: WarehouseShippingProviderBindPayload = {
        shipping_provider_id: pid,

        // ✅ 关键：不再默认“开始服务”
        // “具备服务资格”只写入资格事实；开始服务必须由用户显式勾选。
        active: false,

        // 仍需显式传入（后端 schema 必填）
        priority: 0,
        pickup_cutoff_time: null,
        remark: null,
      };
      await bindWarehouseShippingProvider(warehouseId, payload);
      setSelectedProviderId("");
      await reload();
      setSaveOk(true);
    } catch (err) {
      setError(toHumanError(err, "操作失败"));
    } finally {
      setBusy(false);
    }
  }

  async function toggleActive(item: WarehouseShippingProviderListItem, nextActive: boolean) {
    if (!warehouseId) return;
    if (!canWrite) return;

    // ✅ 合同语义：主数据 inactive 时，禁止开启服务
    if (!item.provider.active && nextActive) {
      setError("该快递公司主数据已禁用，不能开启服务");
      return;
    }

    // optimistic update
    const before = item.active;
    setItems((prev) =>
      prev.map((x) =>
        x.shipping_provider_id === item.shipping_provider_id ? { ...x, active: nextActive } : x,
      ),
    );

    setTogglingProviderId(item.shipping_provider_id);
    setError(null);
    setSaveOk(false);
    try {
      const patchIn: WarehouseShippingProviderPatchPayload = { active: nextActive };
      await patchWarehouseShippingProvider(warehouseId, item.shipping_provider_id, patchIn);
      setSaveOk(true);
    } catch (err) {
      // revert
      setItems((prev) =>
        prev.map((x) =>
          x.shipping_provider_id === item.shipping_provider_id ? { ...x, active: before } : x,
        ),
      );
      setError(toHumanError(err, "保存失败"));
    } finally {
      setTogglingProviderId(null);
    }
  }

  async function remove(item: WarehouseShippingProviderListItem) {
    if (!warehouseId) return;
    if (!canWrite) return;

    setBusy(true);
    setError(null);
    setSaveOk(false);
    try {
      await unbindWarehouseShippingProvider(warehouseId, item.shipping_provider_id);
      await reload();
      setSaveOk(true);
    } catch (err) {
      setError(toHumanError(err, "操作失败"));
    } finally {
      setBusy(false);
    }
  }

  return {
    loading,
    busy,
    togglingProviderId,

    error,
    saveOk,

    items,
    providerOptions,

    selectedProviderId,
    setSelectedProviderId,

    reload,
    bindSelected,
    toggleActive,
    remove,

    setError,
    setSaveOk,
  };
}
