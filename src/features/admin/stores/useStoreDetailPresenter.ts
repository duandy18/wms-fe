// src/features/admin/stores/useStoreDetailPresenter.ts

import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../../../app/auth/useAuth";
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

export function useStoreDetailPresenter(storeId: number) {
  const id = storeId;
  const navigate = useNavigate();
  const { can } = useAuth();
  const canWrite = can("admin.stores");

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

  // ------------------------------
  // 加载店铺详情 + 默认仓
  // ------------------------------
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
    } catch (err: any) {
      console.error("loadDetail failed", err);
      setDetail(null);
      setDefaultWarehouseId(null);
      setError(err?.message ?? "加载失败");
    } finally {
      setLoading(false);
    }
  }

  // 切换 storeId 时，先清空状态再加载，避免串店
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

  // ------------------------------
  // 加载平台授权状态
  // ------------------------------
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

  // ------------------------------
  // 事件：新增绑定（含前端重复绑定拦截）
  // ------------------------------
  async function handleBindSubmit(payload: {
    warehouseId: number;
    isTop: boolean;
    priority: number;
  }) {
    if (!detail || !canWrite) return;

    // 前端快速重复拦截：同一仓库已绑定时，不再提交请求
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
    } catch (err: any) {
      console.error(err);
      setError(err?.message ?? "绑定失败");
    } finally {
      setSaving(false);
    }
  }

  // ------------------------------
  // 事件：切换主/备 / 删除绑定
  // ------------------------------
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
    } catch (err: any) {
      console.error(err);
      setError(err?.message ?? "更新失败");
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
    } catch (err: any) {
      console.error(err);
      setError(err?.message ?? "删除失败");
    } finally {
      setSaving(false);
    }
  }

  // ------------------------------
  // 手工凭据表单
  // ------------------------------
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
    } catch (err: any) {
      console.error("save credentials failed", err);
      setCredentialsError(err?.message ?? "保存凭据失败");
    } finally {
      setCredentialsSaving(false);
    }
  }

  // ------------------------------
  // 查看渠道库存：带 platform / shop_id 跳转
  // ------------------------------
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

    // 手工凭据表单 state + handler
    credentialsOpen,
    credentialsToken,
    credentialsError,
    credentialsSaving,
    setCredentialsToken,
    openCredentials,
    closeCredentials,
    submitCredentials,

    // 绑定相关 handler
    handleBindSubmit,
    handleToggleTop,
    handleDelete,

    // 其它动作
    viewChannelInventory,
  };
}
