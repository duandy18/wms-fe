// src/features/admin/stores/useStoreDetailPresenter.ts

import { useEffect, useState } from "react";
import {
  fetchStoreDetail,
  fetchStorePlatformAuth,
  saveStorePlatformCredentials,
} from "./api";
import type { StoreDetailData, StorePlatformAuthStatus } from "./types";
import { apiGet } from "../../../lib/api";
import { assertOk } from "../../../lib/assertOk";

type ApiErrorShape = {
  message?: string;
};

type OAuthStartOut = { ok: boolean; data: { authorize_url: string } };

export function useStoreDetailPresenter(storeId: number) {
  const id = storeId;
  // TODO：后续接 RBAC，这里先保持原行为（不做权限判断漂移）
  const canWrite = true;

  const [detail, setDetail] = useState<StoreDetailData | null>(null);

  const [platformAuth, setPlatformAuth] = useState<StorePlatformAuthStatus | null>(null);

  const [loading, setLoading] = useState(true);
  const [authLoading, setAuthLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // OAuth 跳转状态（避免重复点）
  const [oauthStarting, setOauthStarting] = useState(false);
  const [oauthError, setOauthError] = useState<string | null>(null);

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
      const detailResp = await fetchStoreDetail(id);
      setDetail(detailResp.data);
    } catch (err: unknown) {
      console.error("loadDetail failed", err);
      const e = err as ApiErrorShape;
      setDetail(null);
      setError(e?.message ?? "加载失败");
    } finally {
      setLoading(false);
    }
  }

  async function reloadDetail() {
    await loadDetail();
  }

  useEffect(() => {
    if (!id) return;

    setDetail(null);
    setPlatformAuth(null);

    setError(null);
    setCredentialsOpen(false);
    setCredentialsToken("");
    setCredentialsError(null);

    setOauthStarting(false);
    setOauthError(null);

    void reloadDetail();
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
      setCredentialsError("访问令牌不能为空");
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

  // ✅ 真实 OAuth：点击后拿 authorize_url 并跳转
  async function startOAuth() {
    if (!detail) return;
    if (oauthStarting) return;

    setOauthStarting(true);
    setOauthError(null);

    try {
      const platformNorm = (detail.platform ?? "").trim().toLowerCase(); // e.g. pdd/tb/jd
      if (!platformNorm) {
        setOauthError("平台信息缺失，无法发起授权");
        return;
      }

      // 回跳到当前店铺详情页（需在后端 allowlist 内：localhost/127.0.0.1）
      const redirectUri = `${window.location.origin}/stores/${detail.store_id}`;

      const resp = await apiGet<OAuthStartOut>(
        `/oauth/${encodeURIComponent(platformNorm)}/start?store_id=${encodeURIComponent(
          String(detail.store_id),
        )}&redirect_uri=${encodeURIComponent(redirectUri)}`,
      );

      const out = assertOk(resp, "GET /oauth/{platform}/start");
      const url = (out.authorize_url ?? "").trim();

      if (!url) {
        setOauthError("授权入口返回为空");
        return;
      }

      window.location.href = url;
    } catch (err: unknown) {
      console.error("oauth start failed", err);
      const e = err as ApiErrorShape;
      setOauthError(e?.message ?? "发起平台授权失败");
    } finally {
      setOauthStarting(false);
    }
  }
  return {
    id,
    canWrite,

    detail,
    loading,
    error,

    platformAuth,
    authLoading,

    oauthStarting,
    oauthError,
    startOAuth,

    credentialsOpen,
    credentialsToken,
    credentialsError,
    credentialsSaving,
    setCredentialsToken,
    openCredentials,
    closeCredentials,
    submitCredentials,

    reloadDetail,
    reloadPlatformAuth,
  };
}
