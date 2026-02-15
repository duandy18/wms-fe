// admin/shop-bundles/useShopBundles.ts
import { useCallback, useEffect, useMemo, useState } from "react";
import type { Fsku, Platform, PlatformMirror, PlatformSkuBinding } from "./types";
import {
  apiCreateFskuDraft,
  apiFetchPlatformMirror,
  apiGetBindingHistory,
  apiGetCurrentBinding,
  apiPatchFskuName,
  apiPublishFsku,
  apiRetireFsku,
  apiUnretireFsku,
  apiUpsertBinding,
} from "./api";
import { apiListFskusGlobal } from "./api_fsku";

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
  unretireFsku: (id: number) => Promise<void>;

  updateFskuName: (id: number, name: string) => Promise<void>;

  upsertBinding: (args: {
    platform: Platform;
    shop_id: number;
    platform_sku_id: string;
    fsku_id: number;
    reason: string;
  }) => Promise<void>;
};

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
      // ✅ 终态 C：全局主数据只走 Global API（不带 store_id）
      const list = await apiListFskusGlobal({ limit: 200, offset: 0 });
      setFskus(list);
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
      const [cur, hist] = await Promise.all([apiGetCurrentBinding(args), apiGetBindingHistory({ ...args, limit: 50, offset: 0 })]);
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
      await refreshFskus();
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

  const unretireFsku = useCallback(
    async (id: number) => {
      await apiUnretireFsku(id);
      await refreshFskus();
    },
    [refreshFskus],
  );

  const updateFskuName = useCallback(
    async (id: number, name: string) => {
      await apiPatchFskuName(id, name);
      await refreshFskus();
    },
    [refreshFskus],
  );

  const upsertBinding = useCallback(async (args: { platform: Platform; shop_id: number; platform_sku_id: string; fsku_id: number; reason: string }) => {
    await apiUpsertBinding(args);
  }, []);

  useEffect(() => {
    void refreshFskus();
  }, [refreshFskus]);

  // ✅ components 保存成功后，刷新上方 FSKU 列表（updated_at / 排序会变化）
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
      unretireFsku,
      updateFskuName,

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
      unretireFsku,
      updateFskuName,
      upsertBinding,
    ],
  );
}
