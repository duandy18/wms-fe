// src/features/system/shop-bundles/useShopBundles.ts
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

function isObject(v: unknown): v is Record<string, unknown> {
  return typeof v === "object" && v !== null;
}

function kindOf(x: unknown): string {
  if (x === null) return "null";
  if (Array.isArray(x)) return "array";
  return typeof x;
}

function toInt(v: unknown): number | null {
  if (typeof v === "number" && Number.isFinite(v)) {
    const i = Math.trunc(v);
    return i > 0 ? i : null;
  }
  if (typeof v === "string" && v.trim()) {
    const n = Number(v);
    if (!Number.isFinite(n)) return null;
    const i = Math.trunc(n);
    return i > 0 ? i : null;
  }
  return null;
}

function toStr(v: unknown): string | null {
  return typeof v === "string" ? v : null;
}

function toStrOrNull(v: unknown): string | null {
  if (v === null) return null;
  return typeof v === "string" ? v : null;
}

function toShape(v: unknown): "single" | "bundle" | null {
  return v === "single" || v === "bundle" ? v : null;
}

function toStatus(v: unknown): "draft" | "published" | "retired" | null {
  return v === "draft" || v === "published" || v === "retired" ? v : null;
}

function parseFskuRow(r: unknown, idx: number): Fsku {
  if (!isObject(r)) {
    throw new Error(`合同不匹配：/fskus.items[${idx}] 为 ${kindOf(r)}，期望对象`);
  }

  const id = toInt(r.id);
  if (id == null) throw new Error(`合同不匹配：/fskus.items[${idx}].id 非法`);

  const code = toStr(r.code);
  if (!code) throw new Error(`合同不匹配：/fskus.items[${idx}].code 缺失或非法`);

  const name = toStr(r.name);
  if (!name) throw new Error(`合同不匹配：/fskus.items[${idx}].name 缺失或非法`);

  const shape = toShape(r.shape);
  if (shape == null) throw new Error(`合同不匹配：/fskus.items[${idx}].shape 非法（仅允许 single/bundle）`);

  const status = toStatus(r.status);
  if (status == null) throw new Error(`合同不匹配：/fskus.items[${idx}].status 非法（draft/published/retired）`);

  const componentsSummary = toStr(r.components_summary);
  if (componentsSummary == null) {
    throw new Error(`合同不匹配：/fskus.items[${idx}].components_summary 缺失或非法`);
  }

  const publishedAt = toStrOrNull(r.published_at);
  const retiredAt = toStrOrNull(r.retired_at);

  const updatedAt = toStr(r.updated_at);
  if (!updatedAt) throw new Error(`合同不匹配：/fskus.items[${idx}].updated_at 缺失或非法`);

  // unit_label：列表不依赖，但创建草稿/编辑区可能用到；允许缺省
  const unitLabel = toStr((r as { unit_label?: unknown }).unit_label) ?? undefined;

  return {
    id,
    code,
    name,
    shape,
    status,
    components_summary: componentsSummary,
    published_at: publishedAt,
    retired_at: retiredAt,
    updated_at: updatedAt,
    unit_label: unitLabel,
  };
}

function unwrapFskusList(data: unknown): Fsku[] {
  // 合同允许：{items:[...], total, limit, offset} 或直接数组（兼容）
  const arr: unknown[] | null = Array.isArray(data)
    ? data
    : isObject(data) && Array.isArray(data.items)
      ? (data.items as unknown[])
      : null;

  if (arr == null) {
    throw new Error(`合同不匹配：GET /fskus 返回 ${kindOf(data)}，期望数组或 { items: [...] }`);
  }

  const out: Fsku[] = [];
  for (let i = 0; i < arr.length; i += 1) {
    out.push(parseFskuRow(arr[i], i));
  }
  return out;
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
      // ✅ 刚性合同：对 list 字段做校验，确保 code/shape/components_summary/time 都可用
      const raw = await apiFetchJson<unknown>("/fskus", { method: "GET" });
      const list = unwrapFskusList(raw);
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
