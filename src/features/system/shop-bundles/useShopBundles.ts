// src/features/system/shop-bundles/useShopBundles.ts
import { useCallback, useEffect, useMemo, useState } from "react";
import type { Fsku, Platform, PlatformMirror, PlatformSkuBinding } from "./types";
import {
  apiCreateFskuDraft,
  apiFetchPlatformMirror,
  apiGetBindingHistory,
  apiGetCurrentBinding,
  apiPublishFsku,
  apiRetireFsku,
  apiUpsertBinding,
} from "./api";
import { apiFetchJson } from "./http";

export type ShopBundlesState = {
  fskus: Fsku[];
  fskusLoading: boolean;
  fskusError: string | null;
  refreshFskus: () => Promise<void>;

  mirror: PlatformMirror | null;
  mirrorLoading: boolean;
  mirrorError: string | null;
  loadMirror: (args: { platform: Platform; shop_id: number; platform_sku_id: string }) => Promise<void>;

  currentBinding: PlatformSkuBinding | null;
  historyBindings: PlatformSkuBinding[];
  bindingsLoading: boolean;
  bindingsError: string | null;
  loadBindings: (args: { platform: Platform; shop_id: number; platform_sku_id: string }) => Promise<void>;

  createFskuDraft: (args: { name: string; unit_label: string }) => Promise<Fsku>;
  publishFsku: (id: number) => Promise<void>;
  retireFsku: (id: number) => Promise<void>;

  upsertBinding: (args: {
    platform: Platform;
    shop_id: number;
    platform_sku_id: string;
    fsku_id: number;
    reason: string;
  }) => Promise<void>;
};

function isObject(v: unknown): v is Record<string, unknown> {
  return typeof v === "object" && v !== null;
}

function unwrapFskus(data: unknown): Fsku[] {
  // 合同允许：{items:[...], total, limit, offset}
  if (Array.isArray(data)) return data as Fsku[];
  if (isObject(data) && Array.isArray(data.items)) return data.items as Fsku[];
  const kind = Object.prototype.toString.call(data);
  throw new Error(`合同不匹配：GET /fskus 返回 ${kind}，期望 { items: Fsku[] }`);
}

export function useShopBundles(): ShopBundlesState {
  const [fskus, setFskus] = useState<Fsku[]>([]);
  const [fskusLoading, setFskusLoading] = useState(false);
  const [fskusError, setFskusError] = useState<string | null>(null);

  const [mirror, setMirror] = useState<PlatformMirror | null>(null);
  const [mirrorLoading, setMirrorLoading] = useState(false);
  const [mirrorError, setMirrorError] = useState<string | null>(null);

  const [currentBinding, setCurrentBinding] = useState<PlatformSkuBinding | null>(null);
  const [historyBindings, setHistoryBindings] = useState<PlatformSkuBinding[]>([]);
  const [bindingsLoading, setBindingsLoading] = useState(false);
  const [bindingsError, setBindingsError] = useState<string | null>(null);

  const refreshFskus = useCallback(async () => {
    setFskusLoading(true);
    setFskusError(null);
    try {
      // ✅ 强制按契约解包：永远把 fskus 收敛成数组
      const raw = await apiFetchJson<unknown>("/fskus", { method: "GET" });
      const list = unwrapFskus(raw);
      setFskus(list ?? []);
    } catch (e: unknown) {
      const msg = e instanceof Error ? e.message : "加载 FSKU 列表失败";
      setFskusError(msg);
      setFskus([]);
    } finally {
      setFskusLoading(false);
    }
  }, []);

  const loadMirror = useCallback(async (args: { platform: Platform; shop_id: number; platform_sku_id: string }) => {
    setMirrorLoading(true);
    setMirrorError(null);
    try {
      const m = await apiFetchPlatformMirror(args);
      setMirror(m);
    } catch (e: unknown) {
      const msg = e instanceof Error ? e.message : "加载镜像失败";
      setMirrorError(msg);
      setMirror(null);
    } finally {
      setMirrorLoading(false);
    }
  }, []);

  const loadBindings = useCallback(async (args: { platform: Platform; shop_id: number; platform_sku_id: string }) => {
    setBindingsLoading(true);
    setBindingsError(null);
    try {
      const [cur, hist] = await Promise.all([
        apiGetCurrentBinding(args),
        apiGetBindingHistory({ ...args, limit: 50, offset: 0 }),
      ]);
      setCurrentBinding(cur);
      setHistoryBindings(hist);
    } catch (e: unknown) {
      const msg = e instanceof Error ? e.message : "加载绑定信息失败";
      setBindingsError(msg);
      setCurrentBinding(null);
      setHistoryBindings([]);
    } finally {
      setBindingsLoading(false);
    }
  }, []);

  const createFskuDraft = useCallback(
    async (args: { name: string; unit_label: string }) => {
      const created = await apiCreateFskuDraft(args);
      await refreshFskus(); // ✅ refresh 后仍保证是数组
      return created;
    },
    [refreshFskus],
  );

  const publishFsku = useCallback(
    async (id: number) => {
      await apiPublishFsku(id);
      await refreshFskus();
    },
    [refreshFskus],
  );

  const retireFsku = useCallback(
    async (id: number) => {
      await apiRetireFsku(id);
      await refreshFskus();
    },
    [refreshFskus],
  );

  const upsertBinding = useCallback(async (args: {
    platform: Platform;
    shop_id: number;
    platform_sku_id: string;
    fsku_id: number;
    reason: string;
  }) => {
    await apiUpsertBinding(args);
  }, []);

  useEffect(() => {
    void refreshFskus();
  }, [refreshFskus]);

  // ✅ 关键补齐：components 保存成功后，刷新上方 FSKU 列表（updated_at / 排序会变化）
  useEffect(() => {
    const onSaved = () => {
      void refreshFskus();
    };
    window.addEventListener("fsku:components_saved", onSaved as EventListener);
    return () => window.removeEventListener("fsku:components_saved", onSaved as EventListener);
  }, [refreshFskus]);

  return useMemo(
    () => ({
      fskus,
      fskusLoading,
      fskusError,
      refreshFskus,

      mirror,
      mirrorLoading,
      mirrorError,
      loadMirror,

      currentBinding,
      historyBindings,
      bindingsLoading,
      bindingsError,
      loadBindings,

      createFskuDraft,
      publishFsku,
      retireFsku,
      upsertBinding,
    }),
    [
      fskus,
      fskusLoading,
      fskusError,
      refreshFskus,
      mirror,
      mirrorLoading,
      mirrorError,
      loadMirror,
      currentBinding,
      historyBindings,
      bindingsLoading,
      bindingsError,
      loadBindings,
      createFskuDraft,
      publishFsku,
      retireFsku,
      upsertBinding,
    ],
  );
}
