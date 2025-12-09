// src/features/admin/stores/useStoreDetailPresenter.ts

import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  fetchStoreDetail,
  fetchDefaultWarehouse,
  fetchStorePlatformAuth,
  bindWarehouse,
  updateBinding,
  deleteBinding,
  saveStorePlatformCredentials,
} from "./api";
import type {
  StoreDetailData,
  StoreBinding,
  StorePlatformAuthStatus,
} from "./types";

type ApiErrorShape = {
  message?: string;
};

export function useStoreDetailPresenter(storeId: number) {
  const id = storeId;
  const navigate = useNavigate();

  // 简化：前端不查 can("admin.stores")，后端自己兜权限
  const canWrite = true;

  const [detail, setDetail] = useState<StoreDetailData | null>(null);
  const [defaultWarehouseId, setDefaultWarehouseId] =
    useState<number | null>(null);

  const [platformAuth, setPlatformAuth] =
    useState<StorePlatformAuthStatus | null>(null);

  const [loading, setLoading] = useState(true);
  const [authLoading, setAuthLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // 手工凭据“小弹窗”状态
  const [credentialsOpen, setCredentialsOpen] = useState(false);
  const [credentialsToken, setCredentialsToken] = useState("");
  const [credentialsError, setCredentialsError] = useState<string | null>(null);
  const [credentialsSaving, setCredentialsSaving] = useState(false);

  async function loadDetail() {
    if (!id) return;

    setLoading(true);
    setError(null);

    try {
      const [detailResp, defResp] = await Promise.all([
        fetchStoreDetail(id),
        fetchDefaultWarehouse(id),
      ]);
      setDetail(detailResp.data);
      setDefaultWarehouseId(defResp.data.warehouse_id);
    } catch (err: unknown) {
       
      console.error("loadDetail failed", err);
      const e = err as ApiErrorShape;
      setDetail(null);
      setDefaultWarehouseId(null);
      setError(e?.message ?? "加载失败");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    if (!id) return;

    setDetail(null);
    setDefaultWarehouseId(null);
    setPlatformAuth(null);
    setError(null);
    setSaving(false);
    setCredentialsOpen(false);
    setCredentialsToken("");
    setCredentialsError(null);

    void loadDetail();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [id]);

  useEffect(() => {
    if (!id) return;

    let cancelled = false;
    setPlatformAuth(null);
    setAuthLoading(true);

    fetchStorePlatformAuth(id)
      .then((data) => {
        if (!cancelled) setPlatformAuth(data);
      })
      .catch((err) => {
         
        console.warn("load platform-auth failed", err);
        if (!cancelled) setPlatformAuth(null);
      })
      .finally(() => {
        if (!cancelled) setAuthLoading(false);
      });

    return () => {
      cancelled = true;
    };
  }, [id]);

  async function reloadPlatformAuth() {
    if (!id) return;
    setAuthLoading(true);
    try {
      const data = await fetchStorePlatformAuth(id);
      setPlatformAuth(data);
    } catch (err) {
       
      console.warn("reload platform-auth failed", err);
      setPlatformAuth(null);
    } finally {
      setAuthLoading(false);
    }
  }

  async function handleBindSubmit(payload: {
    warehouseId: number;
    isTop: boolean;
    priority: number;
  }) {
    if (!detail || !canWrite) return;

    const duplicated = detail.bindings.some(
      (b: StoreBinding) => b.warehouse_id === payload.warehouseId,
    );
    if (duplicated) {
      setError("该仓库已绑定，请不要重复绑定。");
      return;
    }

    setSaving(true);
    setError(null);

    try {
      await bindWarehouse(detail.store_id, {
        warehouse_id: payload.warehouseId,
        is_top: payload.isTop,
        priority: payload.priority,
      });
      await loadDetail();
    } catch (err: unknown) {
       
      console.error(err);
      const e = err as ApiErrorShape;
      setError(e?.message ?? "绑定失败");
    } finally {
      setSaving(false);
    }
  }

  async function handleToggleTop(binding: StoreBinding) {
    if (!detail || !canWrite) return;

    setSaving(true);
    setError(null);

    try {
      await updateBinding(detail.store_id, binding.warehouse_id, {
        is_top: !binding.is_top,
        priority: binding.priority,
      });
      await loadDetail();
    } catch (err: unknown) {
       
      console.error(err);
      const e = err as ApiErrorShape;
      setError(e?.message ?? "更新失败");
    } finally {
      setSaving(false);
    }
  }

  async function handleDelete(binding: StoreBinding) {
    if (!detail || !canWrite) return;

    setSaving(true);
    setError(null);

    try {
      await deleteBinding(detail.store_id, binding.warehouse_id);
      await loadDetail();
    } catch (err: unknown) {
       
      console.error(err);
      const e = err as ApiErrorShape;
      setError(e?.message ?? "删除失败");
    } finally {
      setSaving(false);
    }
  }

  function openCredentials() {
    if (!detail) return;
    setCredentialsOpen(true);
    setCredentialsToken("");
    setCredentialsError(null);
  }

  function closeCredentials() {
    setCredentialsOpen(false);
    setCredentialsError(null);
  }

  async function submitCredentials(e: React.FormEvent) {
    e.preventDefault();
    if (!detail) return;

    if (!credentialsToken.trim()) {
      setCredentialsError("access_token 不能为空");
      return;
    }

    setCredentialsSaving(true);
    setCredentialsError(null);

    try {
      await saveStorePlatformCredentials({
        platform: detail.platform,
        shopId: detail.shop_id,
        accessToken: credentialsToken.trim(),
      });
      await reloadPlatformAuth();
      setCredentialsOpen(false);
      setCredentialsToken("");
    } catch (err: unknown) {
       
      console.error("save credentials failed", err);
      const e = err as ApiErrorShape;
      setCredentialsError(e?.message ?? "保存凭据失败");
    } finally {
      setCredentialsSaving(false);
    }
  }

  function viewChannelInventory() {
    if (!detail) return;
    const search = new URLSearchParams({
      platform: detail.platform,
      shop_id: detail.shop_id,
    }).toString();
    navigate(`/inventory/channel-inventory?${search}`);
  }

  return {
    id,
    canWrite,
    detail,
    defaultWarehouseId,
    platformAuth,
    loading,
    authLoading,
    saving,
    error,

    credentialsOpen,
    credentialsToken,
    credentialsError,
    credentialsSaving,
    setCredentialsToken,
    openCredentials,
    closeCredentials,
    submitCredentials,

    handleBindSubmit,
    handleToggleTop,
    handleDelete,

    viewChannelInventory,
  };
}
