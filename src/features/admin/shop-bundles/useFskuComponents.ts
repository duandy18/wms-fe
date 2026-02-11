// admin/shop-bundles/useFskuComponents.ts
import { useCallback, useEffect, useMemo, useState } from "react";
import type { FskuComponent, FskuComponentRole } from "./types";
import { apiGetFskuComponents, apiReplaceFskuComponents } from "./api";

type DraftComponent = {
  item_id: number | null;
  qty: number | null;
  role: FskuComponentRole;
};

function isRole(v: unknown): v is FskuComponentRole {
  return v === "primary" || v === "gift";
}

function toDraft(items: FskuComponent[]): DraftComponent[] {
  return (items ?? []).map((x) => ({
    item_id: Number.isFinite(x.item_id) ? x.item_id : null,
    qty: Number.isFinite(x.qty) ? x.qty : null,
    role: isRole((x as unknown as { role?: unknown }).role) ? x.role : "primary",
  }));
}

/**
 * 请求体级校验（契约刚性）：
 * - 空行（item_id/qty 都为空）忽略
 * - 半空行直接报错
 * - item_id/qty 必须正整数
 * - (item_id + role) 不允许重复（对齐后端）
 */
function validateAndBuild(components: DraftComponent[]): FskuComponent[] {
  const out: FskuComponent[] = [];
  const seen = new Set<string>();

  for (const c of components) {
    const itemId = c.item_id;
    const qty = c.qty;
    const role = c.role;

    const isEmptyRow = itemId == null && qty == null;
    if (isEmptyRow) continue;

    if (itemId == null || qty == null) {
      throw new Error("components 校验失败：存在未填写完整的行（item_id/qty 必须同时填写）。");
    }

    if (!Number.isFinite(itemId) || Math.trunc(itemId) !== itemId || itemId <= 0) {
      throw new Error("components 校验失败：item_id 必须为正整数。");
    }
    if (!Number.isFinite(qty) || Math.trunc(qty) !== qty || qty <= 0) {
      throw new Error("components 校验失败：qty 必须为正整数。");
    }
    if (!isRole(role)) {
      throw new Error("components 校验失败：role 非法（仅允许 primary/gift）。");
    }

    const key = `${itemId}|${role}`;
    if (seen.has(key)) {
      throw new Error("components 校验失败：同一个 item_id + role 不允许重复，请合并 qty 或删除重复行。");
    }
    seen.add(key);

    out.push({ item_id: itemId, qty, role });
  }

  return out;
}

export type UseFskuComponentsState = {
  components: DraftComponent[];
  loading: boolean;
  error: string | null;

  // ✅ 是否有未保存修改（用于发布门禁）
  dirty: boolean;

  setItemId: (idx: number, v: number | null) => void;
  setQty: (idx: number, v: number | null) => void;
  setRole: (idx: number, v: FskuComponentRole) => void;

  // ✅ 兼容旧编辑器：允许新增空行（空行会被 validateAndBuild 忽略）
  addRow: () => void;

  removeRow: (idx: number) => void;

  // ✅ 供右侧 checkbox 使用
  addItem: (itemId: number, qty?: number) => void;
  removeItem: (itemId: number) => void;

  reload: () => Promise<void>;

  // ✅ 成功返回 true；失败返回 false（并设置 error）
  save: () => Promise<boolean>;
};

export function useFskuComponents(fskuId: number | null): UseFskuComponentsState {
  const [components, setComponents] = useState<DraftComponent[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [dirty, setDirty] = useState(false);

  const reload = useCallback(async () => {
    if (fskuId == null) {
      setComponents([]);
      setError(null);
      setDirty(false);
      return;
    }
    setLoading(true);
    setError(null);
    try {
      const list = await apiGetFskuComponents(fskuId);
      setComponents(toDraft(list));
      setDirty(false); // ✅ 回读后视为干净（与后端一致）
    } catch (e: unknown) {
      const msg = e instanceof Error ? e.message : "加载 components 失败";
      setError(msg);
      setComponents([]);
      setDirty(false);
    } finally {
      setLoading(false);
    }
  }, [fskuId]);

  useEffect(() => {
    void reload();
  }, [reload]);

  const setItemId = useCallback((idx: number, v: number | null) => {
    setComponents((prev) => {
      if (idx < 0 || idx >= prev.length) return prev;
      const next = prev.slice();
      next[idx] = { ...next[idx], item_id: v };
      return next;
    });
    setDirty(true);
  }, []);

  const setQty = useCallback((idx: number, v: number | null) => {
    setComponents((prev) => {
      if (idx < 0 || idx >= prev.length) return prev;
      const next = prev.slice();
      next[idx] = { ...next[idx], qty: v };
      return next;
    });
    setDirty(true);
  }, []);

  const setRole = useCallback((idx: number, v: FskuComponentRole) => {
    setComponents((prev) => {
      if (idx < 0 || idx >= prev.length) return prev;
      const next = prev.slice();
      next[idx] = { ...next[idx], role: v };
      return next;
    });
    setDirty(true);
  }, []);

  const addRow = useCallback(() => {
    setComponents((prev) => [...prev, { item_id: null, qty: null, role: "primary" }]);
    setDirty(true);
  }, []);

  const removeRow = useCallback((idx: number) => {
    setComponents((prev) => prev.filter((_, i) => i !== idx));
    setDirty(true);
  }, []);

  const addItem = useCallback((itemId: number, qty?: number) => {
    const q = qty ?? 1;
    setComponents((prev) => {
      // ✅ 防重复：如果已存在该 item_id，直接返回（不做合并，避免业务裁决）
      if (prev.some((r) => r.item_id === itemId)) return prev;
      return [...prev, { item_id: itemId, qty: q, role: "primary" }];
    });
    setDirty(true);
  }, []);

  const removeItem = useCallback((itemId: number) => {
    setComponents((prev) => prev.filter((r) => r.item_id !== itemId));
    setDirty(true);
  }, []);

  const save = useCallback(async () => {
    if (fskuId == null) return false;

    setLoading(true);
    setError(null);
    try {
      const payload = validateAndBuild(components);
      await apiReplaceFskuComponents(fskuId, payload);

      // ✅ 回读一次，保证页面与后端一致
      await reload();

      // ✅ 发一个全局事件：让上层（FSKU 列表）刷新，反映 updated_at 变化
      try {
        window.dispatchEvent(new CustomEvent("fsku:components_saved", { detail: { fsku_id: fskuId } }));
      } catch {
        // ignore
      }

      setDirty(false); // ✅ save 成功视为干净
      return true;
    } catch (e: unknown) {
      const msg = e instanceof Error ? e.message : "保存 components 失败";
      setError(msg);
      return false;
    } finally {
      setLoading(false);
    }
  }, [components, fskuId, reload]);

  return useMemo(
    () => ({
      components,
      loading,
      error,
      dirty,
      setItemId,
      setQty,
      setRole,
      addRow,
      removeRow,
      addItem,
      removeItem,
      reload,
      save,
    }),
    [components, loading, error, dirty, setItemId, setQty, setRole, addRow, removeRow, addItem, removeItem, reload, save],
  );
}
