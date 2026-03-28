// src/features/oms/platforms/PlatformIntegrationDetailPage.tsx

import React, { useCallback, useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import PageTitle from "../../../components/ui/PageTitle";
import {
  fetchCurrentTaobaoAppConfig,
  fetchPlatformIntegrationDetail,
  saveCurrentTaobaoAppConfig,
  savePlatformIntegrationCredential,
} from "./api";
import type {
  PlatformIntegrationDetail,
  TaobaoAppConfigCurrent,
} from "./types";

function formatExpiry(value: string | null): string {
  if (!value) return "—";
  return value.replace("T", " ").slice(0, 19);
}

function normalizePlatformCode(value: string | null | undefined): string {
  return String(value ?? "").trim().toLowerCase();
}

function isTaobaoPlatform(value: string | null | undefined): boolean {
  const code = normalizePlatformCode(value);
  return code === "taobao" || code === "tb";
}

export default function PlatformIntegrationDetailPage() {
  const { storeId } = useParams<{ storeId: string }>();
  const navigate = useNavigate();

  const parsedId = storeId ? Number(storeId) : NaN;
  const invalidId = !storeId || Number.isNaN(parsedId);

  const [detail, setDetail] = useState<PlatformIntegrationDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [tokenInput, setTokenInput] = useState("");
  const [saving, setSaving] = useState(false);
  const [saveError, setSaveError] = useState<string | null>(null);
  const [saveOk, setSaveOk] = useState<string | null>(null);

  const [taobaoConfig, setTaobaoConfig] = useState<TaobaoAppConfigCurrent | null>(null);
  const [taobaoConfigLoading, setTaobaoConfigLoading] = useState(false);
  const [taobaoConfigError, setTaobaoConfigError] = useState<string | null>(null);
  const [taobaoConfigOk, setTaobaoConfigOk] = useState<string | null>(null);
  const [taobaoConfigSaving, setTaobaoConfigSaving] = useState(false);

  const [appKeyInput, setAppKeyInput] = useState("");
  const [appSecretInput, setAppSecretInput] = useState("");
  const [callbackUrlInput, setCallbackUrlInput] = useState("");
  const [apiBaseUrlInput, setApiBaseUrlInput] = useState("https://eco.taobao.com/router/rest");
  const [signMethodInput, setSignMethodInput] = useState("md5");

  const isTaobao = isTaobaoPlatform(detail?.summary.platform);

  const loadTaobaoConfig = useCallback(async function loadTaobaoConfig() {
    setTaobaoConfigLoading(true);
    setTaobaoConfigError(null);
    try {
      const data = await fetchCurrentTaobaoAppConfig();
      setTaobaoConfig(data);
      setAppKeyInput(data.app_key || "");
      setAppSecretInput("");
      setCallbackUrlInput(data.callback_url || "");
      setApiBaseUrlInput(data.api_base_url || "https://eco.taobao.com/router/rest");
      setSignMethodInput(data.sign_method || "md5");
    } catch (err) {
      console.error("load taobao app config failed", err);
      setTaobaoConfig(null);
      setTaobaoConfigError("加载淘宝系统配置失败。");
    } finally {
      setTaobaoConfigLoading(false);
    }
  }, []);

  const loadDetail = useCallback(
    async function loadDetail(id: number) {
      setLoading(true);
      setError(null);
      try {
        const data = await fetchPlatformIntegrationDetail(id);
        setDetail(data);

        if (isTaobaoPlatform(data.summary.platform)) {
          await loadTaobaoConfig();
        } else {
          setTaobaoConfig(null);
          setTaobaoConfigError(null);
          setTaobaoConfigOk(null);
          setAppKeyInput("");
          setAppSecretInput("");
          setCallbackUrlInput("");
          setApiBaseUrlInput("https://eco.taobao.com/router/rest");
          setSignMethodInput("md5");
        }
      } catch (err) {
        console.error("load platform integration detail failed", err);
        setDetail(null);
        setError("加载平台接入详情失败。");
      } finally {
        setLoading(false);
      }
    },
    [loadTaobaoConfig],
  );

  useEffect(() => {
    if (invalidId) return;
    void loadDetail(parsedId);
  }, [invalidId, parsedId, loadDetail]);

  async function handleSaveToken() {
    if (!detail) return;

    setSaveError(null);
    setSaveOk(null);

    if (!tokenInput.trim()) {
      setSaveError("access_token 不能为空。");
      return;
    }

    setSaving(true);
    try {
      await savePlatformIntegrationCredential({
        platform: detail.summary.platform,
        shopId: detail.summary.shop_id,
        accessToken: tokenInput.trim(),
      });
      setSaveOk("平台凭据已保存。");
      setTokenInput("");
      await loadDetail(detail.summary.store_id);
    } catch (err) {
      console.error("save platform integration credential failed", err);
      setSaveError("保存平台凭据失败。");
    } finally {
      setSaving(false);
    }
  }

  async function handleSaveTaobaoConfig() {
    setTaobaoConfigError(null);
    setTaobaoConfigOk(null);

    if (!appKeyInput.trim()) {
      setTaobaoConfigError("app_key 不能为空。");
      return;
    }
    if (!callbackUrlInput.trim()) {
      setTaobaoConfigError("callback_url 不能为空。");
      return;
    }
    if (!apiBaseUrlInput.trim()) {
      setTaobaoConfigError("api_base_url 不能为空。");
      return;
    }
    if (!signMethodInput.trim()) {
      setTaobaoConfigError("sign_method 不能为空。");
      return;
    }

    setTaobaoConfigSaving(true);
    try {
      const saved = await saveCurrentTaobaoAppConfig({
        app_key: appKeyInput.trim(),
        app_secret: appSecretInput.trim(),
        callback_url: callbackUrlInput.trim(),
        api_base_url: apiBaseUrlInput.trim(),
        sign_method: signMethodInput.trim().toLowerCase(),
      });
      setTaobaoConfig(saved);
      setAppSecretInput("");
      setTaobaoConfigOk("淘宝系统配置已保存。");
    } catch (err) {
      console.error("save taobao app config failed", err);
      setTaobaoConfigError("保存淘宝系统配置失败。");
    } finally {
      setTaobaoConfigSaving(false);
    }
  }

  if (invalidId) {
    return <div className="p-4 text-sm text-red-600">缺少 storeId 参数（或参数非法）</div>;
  }

  return (
    <div className="space-y-4 p-4">
      <div className="flex items-center justify-between">
        <PageTitle title="平台接入详情" />
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={() => navigate("/platforms")}
            className="inline-flex items-center rounded-md border border-slate-300 bg-white px-3 py-1.5 text-sm text-slate-700 hover:bg-slate-50"
          >
            返回平台接入
          </button>
        </div>
      </div>

      {error ? (
        <div className="rounded border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700">
          {error}
        </div>
      ) : null}

      {loading && !detail ? (
        <div className="text-sm text-slate-500">加载中…</div>
      ) : !detail ? (
        <div className="text-sm text-slate-500">未找到接入详情。</div>
      ) : (
        <>
          <section className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm">
            <h2 className="text-base font-semibold text-slate-900">接入概览</h2>
            <div className="mt-4 grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-4">
              <div className="rounded-lg border border-slate-200 bg-slate-50 p-3">
                <div className="text-xs text-slate-500">平台 / 店铺号</div>
                <div className="mt-1 text-sm font-medium text-slate-900">
                  {String(detail.summary.platform).toUpperCase()} / {detail.summary.shop_id}
                </div>
              </div>
              <div className="rounded-lg border border-slate-200 bg-slate-50 p-3">
                <div className="text-xs text-slate-500">内部店铺</div>
                <div className="mt-1 text-sm font-medium text-slate-900">
                  {detail.summary.store_name || "未命名店铺"}
                </div>
                <div className="mt-1 text-xs text-slate-500">
                  store_id={detail.summary.store_id}
                </div>
              </div>
              <div className="rounded-lg border border-slate-200 bg-slate-50 p-3">
                <div className="text-xs text-slate-500">平台代码</div>
                <div className="mt-1 text-sm font-medium text-slate-900">
                  {String(detail.summary.platform).toUpperCase()}
                </div>
              </div>
              <div className="rounded-lg border border-slate-200 bg-slate-50 p-3">
                <div className="text-xs text-slate-500">店铺类型</div>
                <div className="mt-1 text-sm font-medium text-slate-900">
                  {detail.summary.shop_type || "—"}
                </div>
              </div>
            </div>
          </section>

          {isTaobao ? (
            <section className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm">
              <div className="flex items-center justify-between gap-3">
                <div>
                  <h2 className="text-base font-semibold text-slate-900">淘宝系统配置</h2>
                  <div className="mt-1 text-sm text-slate-600">
                    这是系统级淘宝开放平台配置，不是当前店铺的 token。
                  </div>
                </div>
                {taobaoConfigLoading ? (
                  <div className="text-sm text-slate-500">加载中…</div>
                ) : null}
              </div>

              {taobaoConfigError ? (
                <div className="mt-3 rounded border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700">
                  {taobaoConfigError}
                </div>
              ) : null}
              {taobaoConfigOk ? (
                <div className="mt-3 rounded border border-emerald-200 bg-emerald-50 px-3 py-2 text-sm text-emerald-700">
                  {taobaoConfigOk}
                </div>
              ) : null}

              <div className="mt-4 grid grid-cols-1 gap-4 md:grid-cols-2">
                <div>
                  <label className="mb-1 block text-sm font-medium text-slate-700">app_key</label>
                  <input
                    className="w-full rounded-md border border-slate-300 px-3 py-2 text-sm outline-none focus:border-slate-400"
                    value={appKeyInput}
                    onChange={(e) => setAppKeyInput(e.target.value)}
                    placeholder="输入淘宝开放平台 app_key"
                  />
                </div>

                <div>
                  <label className="mb-1 block text-sm font-medium text-slate-700">
                    sign_method
                  </label>
                  <select
                    className="w-full rounded-md border border-slate-300 px-3 py-2 text-sm outline-none focus:border-slate-400"
                    value={signMethodInput}
                    onChange={(e) => setSignMethodInput(e.target.value)}
                  >
                    <option value="md5">md5</option>
                    <option value="hmac">hmac</option>
                  </select>
                </div>

                <div className="md:col-span-2">
                  <label className="mb-1 block text-sm font-medium text-slate-700">
                    app_secret
                  </label>
                  <input
                    className="w-full rounded-md border border-slate-300 px-3 py-2 text-sm outline-none focus:border-slate-400"
                    value={appSecretInput}
                    onChange={(e) => setAppSecretInput(e.target.value)}
                    placeholder={
                      taobaoConfig?.app_secret_present
                        ? `当前已保存：${taobaoConfig.app_secret_masked}；留空表示不修改`
                        : "输入淘宝开放平台 app_secret"
                    }
                  />
                </div>

                <div className="md:col-span-2">
                  <label className="mb-1 block text-sm font-medium text-slate-700">
                    callback_url
                  </label>
                  <input
                    className="w-full rounded-md border border-slate-300 px-3 py-2 text-sm outline-none focus:border-slate-400"
                    value={callbackUrlInput}
                    onChange={(e) => setCallbackUrlInput(e.target.value)}
                    placeholder="输入淘宝 OAuth 回调地址"
                  />
                </div>

                <div className="md:col-span-2">
                  <label className="mb-1 block text-sm font-medium text-slate-700">
                    api_base_url
                  </label>
                  <input
                    className="w-full rounded-md border border-slate-300 px-3 py-2 text-sm outline-none focus:border-slate-400"
                    value={apiBaseUrlInput}
                    onChange={(e) => setApiBaseUrlInput(e.target.value)}
                    placeholder="输入 TOP API Base URL"
                  />
                </div>
              </div>

              <div className="mt-4 grid grid-cols-1 gap-4 md:grid-cols-3">
                <div className="rounded-lg border border-slate-200 bg-slate-50 p-3">
                  <div className="text-xs text-slate-500">当前启用</div>
                  <div className="mt-1 text-sm font-medium text-slate-900">
                    {taobaoConfig?.is_enabled ? "是" : "否"}
                  </div>
                </div>
                <div className="rounded-lg border border-slate-200 bg-slate-50 p-3">
                  <div className="text-xs text-slate-500">创建时间</div>
                  <div className="mt-1 text-sm font-medium text-slate-900">
                    {formatExpiry(taobaoConfig?.created_at ?? null)}
                  </div>
                </div>
                <div className="rounded-lg border border-slate-200 bg-slate-50 p-3">
                  <div className="text-xs text-slate-500">更新时间</div>
                  <div className="mt-1 text-sm font-medium text-slate-900">
                    {formatExpiry(taobaoConfig?.updated_at ?? null)}
                  </div>
                </div>
              </div>

              <div className="mt-4 flex justify-end gap-3">
                <button
                  type="button"
                  className="inline-flex items-center rounded-md border border-slate-300 bg-white px-4 py-2 text-sm font-medium text-slate-700 hover:bg-slate-50"
                  onClick={() => void loadTaobaoConfig()}
                  disabled={taobaoConfigLoading || taobaoConfigSaving}
                >
                  刷新配置
                </button>
                <button
                  type="button"
                  className="inline-flex items-center rounded-md bg-slate-900 px-4 py-2 text-sm font-medium text-white hover:bg-slate-800 disabled:cursor-not-allowed disabled:opacity-60"
                  onClick={handleSaveTaobaoConfig}
                  disabled={taobaoConfigSaving}
                >
                  {taobaoConfigSaving ? "保存中…" : "保存淘宝系统配置"}
                </button>
              </div>
            </section>
          ) : null}

          <section className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm">
            <h2 className="text-base font-semibold text-slate-900">手工凭据</h2>

            {saveError ? (
              <div className="mt-3 rounded border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700">
                {saveError}
              </div>
            ) : null}
            {saveOk ? (
              <div className="mt-3 rounded border border-emerald-200 bg-emerald-50 px-3 py-2 text-sm text-emerald-700">
                {saveOk}
              </div>
            ) : null}

            <div className="mt-4 space-y-3">
              <div>
                <label className="mb-1 block text-sm font-medium text-slate-700">
                  access_token
                </label>
                <textarea
                  className="min-h-[120px] w-full rounded-md border border-slate-300 px-3 py-2 text-sm outline-none focus:border-slate-400"
                  placeholder="输入平台 access_token"
                  value={tokenInput}
                  onChange={(e) => setTokenInput(e.target.value)}
                />
              </div>

              <div className="flex justify-end">
                <button
                  type="button"
                  disabled={saving}
                  onClick={handleSaveToken}
                  className="inline-flex items-center rounded-md bg-slate-900 px-4 py-2 text-sm font-medium text-white hover:bg-slate-800 disabled:cursor-not-allowed disabled:opacity-60"
                >
                  {saving ? "保存中…" : "保存手工凭据"}
                </button>
              </div>
            </div>
          </section>
        </>
      )}
    </div>
  );
}
