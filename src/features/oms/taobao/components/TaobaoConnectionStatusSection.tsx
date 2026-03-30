import React, { useCallback, useEffect, useState } from "react";
import {
  fetchTaobaoAuthorizeStart,
  fetchTaobaoConnection,
} from "../api/appConfig";
import type {
  TaobaoAuthorizeStartResult,
  TaobaoConnectionStatus,
} from "../types/appConfig";

function formatTime(value: string | null): string {
  if (!value) return "—";
  return value.replace("T", " ").slice(0, 19);
}

export default function TaobaoConnectionStatusSection() {
  const [storeIdInput, setStoreIdInput] = useState("917");
  const [connection, setConnection] = useState<TaobaoConnectionStatus | null>(null);
  const [authorizeResult, setAuthorizeResult] =
    useState<TaobaoAuthorizeStartResult | null>(null);

  const [loading, setLoading] = useState(false);
  const [authorizing, setAuthorizing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [ok, setOk] = useState<string | null>(null);

  const loadConnection = useCallback(async () => {
    const storeId = Number(storeIdInput);
    if (!Number.isInteger(storeId) || storeId <= 0) {
      setConnection(null);
      return;
    }

    setLoading(true);
    setError(null);
    try {
      const data = await fetchTaobaoConnection(storeId);
      setConnection(data);
    } catch (err) {
      console.error("load taobao connection failed", err);
      setConnection(null);
      setError("加载淘宝连接状态失败。");
    } finally {
      setLoading(false);
    }
  }, [storeIdInput]);

  useEffect(() => {
    void loadConnection();
  }, [loadConnection]);

  async function handleAuthorizeStart() {
    const storeId = Number(storeIdInput);
    if (!Number.isInteger(storeId) || storeId <= 0) {
      setError("store_id 必须是正整数。");
      return;
    }

    setAuthorizing(true);
    setError(null);
    setOk(null);
    try {
      const data = await fetchTaobaoAuthorizeStart(storeId);
      setAuthorizeResult(data);
      setOk("淘宝授权链接已生成。");
    } catch (err) {
      console.error("generate taobao authorize url failed", err);
      setAuthorizeResult(null);
      setError("生成淘宝授权链接失败。");
    } finally {
      setAuthorizing(false);
    }
  }

  return (
    <section className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm">
      <div>
        <h2 className="text-base font-semibold text-slate-900">
          店铺授权与连接状态
        </h2>
        <div className="mt-1 text-sm text-slate-600">
          这里展示淘宝店铺授权入口与当前连接状态。
        </div>
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

      <div className="mt-4 grid grid-cols-1 gap-4 md:grid-cols-3">
        <div>
          <label className="mb-1 block text-sm font-medium text-slate-700">
            store_id
          </label>
          <input
            className="w-full rounded-md border border-slate-300 px-3 py-2 text-sm outline-none focus:border-slate-400"
            value={storeIdInput}
            onChange={(e) => setStoreIdInput(e.target.value)}
            placeholder="输入店铺ID，例如 917"
          />
        </div>
        <div className="md:col-span-2 flex items-end gap-3">
          <button
            type="button"
            className="inline-flex items-center rounded-md border border-slate-300 bg-white px-4 py-2 text-sm font-medium text-slate-700 hover:bg-slate-50"
            onClick={() => void loadConnection()}
            disabled={loading}
          >
            {loading ? "刷新中…" : "刷新连接状态"}
          </button>
          <button
            type="button"
            className="inline-flex items-center rounded-md bg-slate-900 px-4 py-2 text-sm font-medium text-white hover:bg-slate-800 disabled:cursor-not-allowed disabled:opacity-60"
            onClick={handleAuthorizeStart}
            disabled={authorizing}
          >
            {authorizing ? "生成中…" : "生成淘宝授权链接"}
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
  );
}
