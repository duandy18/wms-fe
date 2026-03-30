// src/features/oms/platforms/detailSections/TaobaoIntegrationDetailSection.tsx

import React, { useCallback, useEffect, useState } from "react";
import {
  fetchCurrentTaobaoAppConfig,
  saveCurrentTaobaoAppConfig,
} from "../api_taobao";
import type { TaobaoAppConfigCurrent } from "../types_taobao";

function formatExpiry(value: string | null): string {
  if (!value) return "—";
  return value.replace("T", " ").slice(0, 19);
}

export default function TaobaoIntegrationDetailSection() {
  const [taobaoConfig, setTaobaoConfig] = useState<TaobaoAppConfigCurrent | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [ok, setOk] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);

  const [appKeyInput, setAppKeyInput] = useState("");
  const [appSecretInput, setAppSecretInput] = useState("");
  const [callbackUrlInput, setCallbackUrlInput] = useState("");
  const [apiBaseUrlInput, setApiBaseUrlInput] = useState(
    "https://eco.taobao.com/router/rest",
  );
  const [signMethodInput, setSignMethodInput] = useState("md5");

  const loadConfig = useCallback(async () => {
    setLoading(true);
    setError(null);
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
      setError("加载淘宝系统配置失败。");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void loadConfig();
  }, [loadConfig]);

  async function handleSave() {
    setError(null);
    setOk(null);

    if (!appKeyInput.trim()) {
      setError("app_key 不能为空。");
      return;
    }
    if (!callbackUrlInput.trim()) {
      setError("callback_url 不能为空。");
      return;
    }
    if (!apiBaseUrlInput.trim()) {
      setError("api_base_url 不能为空。");
      return;
    }
    if (!signMethodInput.trim()) {
      setError("sign_method 不能为空。");
      return;
    }

    setSaving(true);
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
      setOk("淘宝系统配置已保存。");
    } catch (err) {
      console.error("save taobao app config failed", err);
      setError("保存淘宝系统配置失败。");
    } finally {
      setSaving(false);
    }
  }

  return (
    <section className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm">
      <div className="flex items-center justify-between gap-3">
        <div>
          <h2 className="text-base font-semibold text-slate-900">淘宝系统配置</h2>
          <div className="mt-1 text-sm text-slate-600">
            这是系统级淘宝开放平台配置，不是当前店铺的 token。
          </div>
        </div>
        {loading ? <div className="text-sm text-slate-500">加载中…</div> : null}
      </div>

      {error ? (
        <div className="mt-3 rounded border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700">
          {error}
        </div>
      ) : null}
      {ok ? (
        <div className="mt-3 rounded border border-emerald-200 bg-emerald-50 px-3 py-2 text-sm text-emerald-700">
          {ok}
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
          onClick={() => void loadConfig()}
          disabled={loading || saving}
        >
          刷新配置
        </button>
        <button
          type="button"
          className="inline-flex items-center rounded-md bg-slate-900 px-4 py-2 text-sm font-medium text-white hover:bg-slate-800 disabled:cursor-not-allowed disabled:opacity-60"
          onClick={handleSave}
          disabled={saving}
        >
          {saving ? "保存中…" : "保存淘宝系统配置"}
        </button>
      </div>
    </section>
  );
}
