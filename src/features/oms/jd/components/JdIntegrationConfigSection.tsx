import React, { useCallback, useEffect, useState } from "react";
import {
  fetchCurrentJdAppConfig,
  fetchJdAuthorizeStart,
  fetchJdConnection,
  saveCurrentJdAppConfig,
} from "../api/appConfig";
import type {
  JdAppConfigCurrent,
  JdAuthorizeStartResult,
  JdConnectionStatus,
} from "../types/appConfig";

function formatTime(value: string | null): string {
  if (!value) return "—";
  return value.replace("T", " ").slice(0, 19);
}

export default function JdIntegrationConfigSection() {
  const [jdConfig, setJdConfig] = useState<JdAppConfigCurrent | null>(null);
  const [connection, setConnection] = useState<JdConnectionStatus | null>(null);
  const [authorizeResult, setAuthorizeResult] = useState<JdAuthorizeStartResult | null>(null);

  const [loading, setLoading] = useState(false);
  const [connectionLoading, setConnectionLoading] = useState(false);
  const [authorizing, setAuthorizing] = useState(false);
  const [saving, setSaving] = useState(false);

  const [error, setError] = useState<string | null>(null);
  const [ok, setOk] = useState<string | null>(null);

  const [clientIdInput, setClientIdInput] = useState("");
  const [clientSecretInput, setClientSecretInput] = useState("");
  const [callbackUrlInput, setCallbackUrlInput] = useState("");
  const [gatewayUrlInput, setGatewayUrlInput] = useState("https://api.jd.com/routerjson");
  const [signMethodInput, setSignMethodInput] = useState("md5");
  const [storeIdInput, setStoreIdInput] = useState("919");

  const loadConfig = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await fetchCurrentJdAppConfig();
      setJdConfig(data);
      setClientIdInput(data.client_id || "");
      setClientSecretInput("");
      setCallbackUrlInput(data.callback_url || "");
      setGatewayUrlInput(data.gateway_url || "https://api.jd.com/routerjson");
      setSignMethodInput(data.sign_method || "md5");
    } catch (err) {
      console.error("load jd app config failed", err);
      setJdConfig(null);
      setError("加载京东系统配置失败。");
    } finally {
      setLoading(false);
    }
  }, []);

  const loadConnection = useCallback(async () => {
    const storeId = Number(storeIdInput);
    if (!Number.isInteger(storeId) || storeId <= 0) {
      setConnection(null);
      return;
    }

    setConnectionLoading(true);
    try {
      const data = await fetchJdConnection(storeId);
      setConnection(data);
    } catch (err) {
      console.error("load jd connection failed", err);
      setConnection(null);
    } finally {
      setConnectionLoading(false);
    }
  }, [storeIdInput]);

  useEffect(() => {
    void loadConfig();
  }, [loadConfig]);

  useEffect(() => {
    void loadConnection();
  }, [loadConnection]);

  async function handleSave() {
    setError(null);
    setOk(null);

    if (!clientIdInput.trim()) {
      setError("client_id 不能为空。");
      return;
    }
    if (!callbackUrlInput.trim()) {
      setError("callback_url 不能为空。");
      return;
    }
    if (!gatewayUrlInput.trim()) {
      setError("gateway_url 不能为空。");
      return;
    }
    if (!signMethodInput.trim()) {
      setError("sign_method 不能为空。");
      return;
    }

    setSaving(true);
    try {
      const saved = await saveCurrentJdAppConfig({
        client_id: clientIdInput.trim(),
        client_secret: clientSecretInput.trim(),
        callback_url: callbackUrlInput.trim(),
        gateway_url: gatewayUrlInput.trim(),
        sign_method: signMethodInput.trim().toLowerCase(),
      });
      setJdConfig(saved);
      setClientSecretInput("");
      setOk("京东系统配置已保存。");
    } catch (err) {
      console.error("save jd app config failed", err);
      setError("保存京东系统配置失败。");
    } finally {
      setSaving(false);
    }
  }

  async function handleAuthorizeStart() {
    setError(null);
    setOk(null);

    const storeId = Number(storeIdInput);
    if (!Number.isInteger(storeId) || storeId <= 0) {
      setError("store_id 必须是正整数。");
      return;
    }

    setAuthorizing(true);
    try {
      const data = await fetchJdAuthorizeStart(storeId);
      setAuthorizeResult(data);
      setOk("京东授权链接已生成。");
      await loadConnection();
    } catch (err) {
      console.error("generate jd authorize url failed", err);
      setAuthorizeResult(null);
      setError("生成京东授权链接失败。");
    } finally {
      setAuthorizing(false);
    }
  }

  return (
    <div className="space-y-4">
      <section className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm">
        <div className="flex items-center justify-between gap-3">
          <div>
            <h2 className="text-base font-semibold text-slate-900">京东系统配置</h2>
            <div className="mt-1 text-sm text-slate-600">
              这是系统级京东开放平台配置，不是当前店铺的 token。
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
            <label className="mb-1 block text-sm font-medium text-slate-700">
              client_id
            </label>
            <input
              className="w-full rounded-md border border-slate-300 px-3 py-2 text-sm outline-none focus:border-slate-400"
              value={clientIdInput}
              onChange={(e) => setClientIdInput(e.target.value)}
              placeholder="输入京东开放平台 client_id"
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
            </select>
          </div>

          <div className="md:col-span-2">
            <label className="mb-1 block text-sm font-medium text-slate-700">
              client_secret
            </label>
            <input
              className="w-full rounded-md border border-slate-300 px-3 py-2 text-sm outline-none focus:border-slate-400"
              value={clientSecretInput}
              onChange={(e) => setClientSecretInput(e.target.value)}
              placeholder={
                jdConfig?.client_secret_present
                  ? `当前已保存：${jdConfig.client_secret_masked}；留空表示不修改`
                  : "输入京东开放平台 client_secret"
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
              placeholder="输入京东 OAuth 回调地址"
            />
          </div>

          <div className="md:col-span-2">
            <label className="mb-1 block text-sm font-medium text-slate-700">
              gateway_url
            </label>
            <input
              className="w-full rounded-md border border-slate-300 px-3 py-2 text-sm outline-none focus:border-slate-400"
              value={gatewayUrlInput}
              onChange={(e) => setGatewayUrlInput(e.target.value)}
              placeholder="输入 JD gateway_url"
            />
          </div>
        </div>

        <div className="mt-4 grid grid-cols-1 gap-4 md:grid-cols-4">
          <div className="rounded-lg border border-slate-200 bg-slate-50 p-3">
            <div className="text-xs text-slate-500">当前启用</div>
            <div className="mt-1 text-sm font-medium text-slate-900">
              {jdConfig?.is_enabled ? "是" : "否"}
            </div>
          </div>
          <div className="rounded-lg border border-slate-200 bg-slate-50 p-3">
            <div className="text-xs text-slate-500">配置ID</div>
            <div className="mt-1 text-sm font-medium text-slate-900">
              {jdConfig?.id ?? "—"}
            </div>
          </div>
          <div className="rounded-lg border border-slate-200 bg-slate-50 p-3">
            <div className="text-xs text-slate-500">创建时间</div>
            <div className="mt-1 text-sm font-medium text-slate-900">
              {formatTime(jdConfig?.created_at ?? null)}
            </div>
          </div>
          <div className="rounded-lg border border-slate-200 bg-slate-50 p-3">
            <div className="text-xs text-slate-500">更新时间</div>
            <div className="mt-1 text-sm font-medium text-slate-900">
              {formatTime(jdConfig?.updated_at ?? null)}
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
            {saving ? "保存中…" : "保存京东系统配置"}
          </button>
        </div>
      </section>

      <section className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm">
        <div>
          <h2 className="text-base font-semibold text-slate-900">店铺授权与连接状态</h2>
          <div className="mt-1 text-sm text-slate-600">
            这里先按单店铺最小闭环展示授权入口与连接状态。
          </div>
        </div>

        <div className="mt-4 grid grid-cols-1 gap-4 md:grid-cols-3">
          <div>
            <label className="mb-1 block text-sm font-medium text-slate-700">
              store_id
            </label>
            <input
              className="w-full rounded-md border border-slate-300 px-3 py-2 text-sm outline-none focus:border-slate-400"
              value={storeIdInput}
              onChange={(e) => setStoreIdInput(e.target.value)}
              placeholder="输入店铺ID，例如 919"
            />
          </div>

          <div className="md:col-span-2 flex items-end gap-3">
            <button
              type="button"
              className="inline-flex items-center rounded-md border border-slate-300 bg-white px-4 py-2 text-sm font-medium text-slate-700 hover:bg-slate-50"
              onClick={() => void loadConnection()}
              disabled={connectionLoading}
            >
              {connectionLoading ? "刷新中…" : "刷新连接状态"}
            </button>
            <button
              type="button"
              className="inline-flex items-center rounded-md bg-slate-900 px-4 py-2 text-sm font-medium text-white hover:bg-slate-800 disabled:cursor-not-allowed disabled:opacity-60"
              onClick={handleAuthorizeStart}
              disabled={authorizing}
            >
              {authorizing ? "生成中…" : "生成京东授权链接"}
            </button>
          </div>
        </div>

        <div className="mt-4 grid grid-cols-1 gap-4 md:grid-cols-4">
          <div className="rounded-lg border border-slate-200 bg-slate-50 p-3">
            <div className="text-xs text-slate-500">auth_source</div>
            <div className="mt-1 text-sm font-medium text-slate-900">
              {connection?.auth_source || "—"}
            </div>
          </div>
          <div className="rounded-lg border border-slate-200 bg-slate-50 p-3">
            <div className="text-xs text-slate-500">connection_status</div>
            <div className="mt-1 text-sm font-medium text-slate-900">
              {connection?.connection_status || "—"}
            </div>
          </div>
          <div className="rounded-lg border border-slate-200 bg-slate-50 p-3">
            <div className="text-xs text-slate-500">credential_status</div>
            <div className="mt-1 text-sm font-medium text-slate-900">
              {connection?.credential_status || "—"}
            </div>
          </div>
          <div className="rounded-lg border border-slate-200 bg-slate-50 p-3">
            <div className="text-xs text-slate-500">pull_ready</div>
            <div className="mt-1 text-sm font-medium text-slate-900">
              {connection ? (connection.pull_ready ? "是" : "否") : "—"}
            </div>
          </div>
          <div className="rounded-lg border border-slate-200 bg-slate-50 p-3">
            <div className="text-xs text-slate-500">status</div>
            <div className="mt-1 text-sm font-medium text-slate-900">
              {connection?.status || "—"}
            </div>
          </div>
          <div className="rounded-lg border border-slate-200 bg-slate-50 p-3">
            <div className="text-xs text-slate-500">status_reason</div>
            <div className="mt-1 text-sm font-medium text-slate-900">
              {connection?.status_reason || "—"}
            </div>
          </div>
          <div className="rounded-lg border border-slate-200 bg-slate-50 p-3">
            <div className="text-xs text-slate-500">授权身份</div>
            <div className="mt-1 text-sm font-medium text-slate-900">
              {connection?.granted_identity_display ||
                connection?.granted_identity_value ||
                "—"}
            </div>
          </div>
          <div className="rounded-lg border border-slate-200 bg-slate-50 p-3">
            <div className="text-xs text-slate-500">reauth_required</div>
            <div className="mt-1 text-sm font-medium text-slate-900">
              {connection ? (connection.reauth_required ? "是" : "否") : "—"}
            </div>
          </div>
        </div>

        <div className="mt-4 grid grid-cols-1 gap-4 md:grid-cols-3">
          <div className="rounded-lg border border-slate-200 bg-slate-50 p-3">
            <div className="text-xs text-slate-500">last_authorized_at</div>
            <div className="mt-1 text-sm font-medium text-slate-900">
              {formatTime(connection?.last_authorized_at ?? null)}
            </div>
          </div>
          <div className="rounded-lg border border-slate-200 bg-slate-50 p-3">
            <div className="text-xs text-slate-500">last_pull_checked_at</div>
            <div className="mt-1 text-sm font-medium text-slate-900">
              {formatTime(connection?.last_pull_checked_at ?? null)}
            </div>
          </div>
          <div className="rounded-lg border border-slate-200 bg-slate-50 p-3">
            <div className="text-xs text-slate-500">last_error_at</div>
            <div className="mt-1 text-sm font-medium text-slate-900">
              {formatTime(connection?.last_error_at ?? null)}
            </div>
          </div>
        </div>

        {authorizeResult ? (
          <div className="mt-4 rounded-lg border border-slate-200 bg-slate-50 p-4">
            <div className="text-sm font-medium text-slate-900">授权链接结果</div>
            <div className="mt-3 grid grid-cols-1 gap-4">
              <div>
                <div className="text-xs text-slate-500">authorize_url</div>
                <div className="mt-1 break-all text-sm text-slate-900">
                  <a
                    href={authorizeResult.authorize_url}
                    target="_blank"
                    rel="noreferrer"
                    className="text-blue-600 hover:underline"
                  >
                    {authorizeResult.authorize_url}
                  </a>
                </div>
              </div>
              <div>
                <div className="text-xs text-slate-500">state</div>
                <div className="mt-1 break-all font-mono text-xs text-slate-900">
                  {authorizeResult.state}
                </div>
              </div>
            </div>
          </div>
        ) : null}
      </section>
    </div>
  );
}
