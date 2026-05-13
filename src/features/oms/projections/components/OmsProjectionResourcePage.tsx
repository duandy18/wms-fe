import React, { useCallback, useEffect, useMemo, useState } from "react";

import {
  checkOmsProjectionResource,
  getOmsProjectionStatus,
  listOmsProjectionRows,
  listOmsProjectionSyncRuns,
  syncOmsFulfillmentReadyOrders,
} from "../api/fulfillmentProjectionApi";
import {
  OMS_PROJECTION_RESOURCE_LABELS,
  type OmsProjectionListOut,
  type OmsProjectionResource,
  type OmsProjectionStatusOut,
  type OmsProjectionSyncRunListOut,
} from "../types";

type Banner = {
  kind: "success" | "error" | "info";
  text: string;
};

const RESOURCE_HINTS: Record<OmsProjectionResource, string> = {
  orders: "来自 OMS fulfillment-ready read API 的订单级只读投影，用于 WMS 侧快速查订单履约准备状态。",
  lines: "来自 OMS 的订单行级只读投影，用于查看平台订单行身份、数量和解析状态。",
  components: "来自 OMS 的履约组件只读投影，用于查看订单行拆解到 WMS 商品 / SKU 编码后的结果。",
};

function formatValue(value: unknown): string {
  if (value == null) return "—";
  if (typeof value === "string") return value || "—";
  if (typeof value === "number" || typeof value === "boolean") return String(value);
  if (value instanceof Date) return value.toISOString();
  try {
    return JSON.stringify(value);
  } catch {
    return String(value);
  }
}

function selectColumns(items: Array<Record<string, unknown>>): string[] {
  const preferred = [
    "id",
    "platform",
    "store_code",
    "platform_order_no",
    "source_order_no",
    "source_line_id",
    "ready_status",
    "identity_kind",
    "identity_value",
    "item_id",
    "sku_code_id",
    "required_qty",
    "synced_at",
  ];

  const existing = new Set(items.flatMap((row) => Object.keys(row)));
  const selected = preferred.filter((key) => existing.has(key));
  if (selected.length >= 4) return selected.slice(0, 8);

  for (const key of existing) {
    if (!selected.includes(key)) selected.push(key);
    if (selected.length >= 8) break;
  }
  return selected;
}

function buildOmsSyncDisabledReason(status: OmsProjectionStatusOut | null): string | null {
  if (status == null) {
    return "OMS projection 状态尚未加载，先刷新页面获取同步配置状态。";
  }

  const missing: string[] = [];
  if (!status.oms_api_base_url_configured) missing.push("OMS_API_BASE_URL");
  if (!status.oms_api_token_configured) missing.push("OMS_API_TOKEN");

  if (missing.length === 0) return null;

  return `OMS read API 同步配置未完成：WMS 后端缺少 ${missing.join("、")}。请在 wms-api 的 .env.local 配置后重启服务。`;
}

export const OmsProjectionResourcePage: React.FC<{ resource: OmsProjectionResource }> = ({
  resource,
}) => {
  const [q, setQ] = useState("");
  const [rows, setRows] = useState<OmsProjectionListOut | null>(null);
  const [status, setStatus] = useState<OmsProjectionStatusOut | null>(null);
  const [runs, setRuns] = useState<OmsProjectionSyncRunListOut | null>(null);
  const [loading, setLoading] = useState(false);
  const [banner, setBanner] = useState<Banner | null>(null);

  const title = OMS_PROJECTION_RESOURCE_LABELS[resource];

  const load = useCallback(async () => {
    setLoading(true);
    setBanner(null);
    try {
      const [nextStatus, nextRows, nextRuns] = await Promise.all([
        getOmsProjectionStatus(),
        listOmsProjectionRows({ resource, q: q.trim(), limit: 20, offset: 0 }),
        listOmsProjectionSyncRuns({ limit: 5, offset: 0 }),
      ]);
      setStatus(nextStatus);
      setRows(nextRows);
      setRuns(nextRuns);
    } catch (error) {
      setBanner({
        kind: "error",
        text: error instanceof Error ? error.message : "加载 OMS 投影失败",
      });
    } finally {
      setLoading(false);
    }
  }, [q, resource]);

  useEffect(() => {
    void load();
  }, [load]);

  const rowItems = useMemo(() => (Array.isArray(rows?.items) ? rows.items : []), [rows]);
  const runItems = useMemo(() => (Array.isArray(runs?.items) ? runs.items : []), [runs]);
  const columns = useMemo(() => selectColumns(rowItems), [rowItems]);
  const syncDisabledReason = useMemo(() => buildOmsSyncDisabledReason(status), [status]);
  const syncConfigWarning = status == null ? null : syncDisabledReason;

  async function handleCheck(): Promise<void> {
    setLoading(true);
    setBanner(null);
    try {
      const result = await checkOmsProjectionResource(resource);
      setBanner({
        kind: result.ok ? "success" : "error",
        text: result.ok
          ? `${title}一致性检查通过`
          : `${title}一致性检查存在问题：${result.issue_count ?? 0}`,
      });
      await load();
    } catch (error) {
      setBanner({
        kind: "error",
        text: error instanceof Error ? error.message : "一致性检查失败",
      });
    } finally {
      setLoading(false);
    }
  }

  async function handleSync(): Promise<void> {
    if (syncDisabledReason) {
      setBanner({
        kind: "info",
        text: syncDisabledReason,
      });
      return;
    }

    setLoading(true);
    setBanner(null);
    try {
      const result = await syncOmsFulfillmentReadyOrders();
      setBanner({
        kind: result.ok ? "success" : "info",
        text: result.message || `同步已触发：${result.status ?? "unknown"}`,
      });
      await load();
    } catch (error) {
      setBanner({
        kind: "error",
        text: error instanceof Error ? error.message : "同步失败",
      });
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="space-y-4 p-6">
      <section className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
        <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
          <div>
            <div className="text-sm font-medium text-slate-500">订单管理 / OMS fulfillment projection</div>
            <h1 className="mt-1 text-2xl font-semibold text-slate-900">{title}</h1>
            <p className="mt-2 max-w-3xl text-sm leading-6 text-slate-600">{RESOURCE_HINTS[resource]}</p>
          </div>
          <div className="flex flex-wrap gap-2">
            <button
              type="button"
              className="rounded-lg border border-slate-300 px-3 py-2 text-sm font-medium text-slate-700 hover:bg-slate-50 disabled:opacity-50"
              disabled={loading}
              onClick={() => void load()}
            >
              刷新
            </button>
            <button
              type="button"
              className="rounded-lg border border-slate-300 px-3 py-2 text-sm font-medium text-slate-700 hover:bg-slate-50 disabled:opacity-50"
              disabled={loading}
              onClick={() => void handleCheck()}
            >
              一致性检查
            </button>
            <button
              type="button"
              className="rounded-lg bg-slate-900 px-3 py-2 text-sm font-medium text-white hover:bg-slate-800 disabled:cursor-not-allowed disabled:opacity-50"
              disabled={loading || Boolean(syncDisabledReason)}
              title={syncDisabledReason ?? undefined}
              onClick={() => void handleSync()}
            >
              同步 OMS
            </button>
          </div>
        </div>

        {syncConfigWarning ? (
          <div className="mt-4 rounded-xl bg-amber-50 px-4 py-3 text-sm text-amber-800">
            {syncConfigWarning}
          </div>
        ) : null}

        {banner ? (
          <div
            className={[
              "mt-4 rounded-xl px-4 py-3 text-sm",
              banner.kind === "error"
                ? "bg-red-50 text-red-700"
                : banner.kind === "success"
                  ? "bg-emerald-50 text-emerald-700"
                  : "bg-slate-50 text-slate-700",
            ].join(" ")}
          >
            {banner.text}
          </div>
        ) : null}

        <div className="mt-5 grid gap-3 md:grid-cols-4">
          <div className="rounded-xl bg-slate-50 p-4">
            <div className="text-xs text-slate-500">订单</div>
            <div className="mt-1 text-xl font-semibold text-slate-900">{status?.order_count ?? "—"}</div>
          </div>
          <div className="rounded-xl bg-slate-50 p-4">
            <div className="text-xs text-slate-500">订单行</div>
            <div className="mt-1 text-xl font-semibold text-slate-900">{status?.line_count ?? "—"}</div>
          </div>
          <div className="rounded-xl bg-slate-50 p-4">
            <div className="text-xs text-slate-500">组件</div>
            <div className="mt-1 text-xl font-semibold text-slate-900">{status?.component_count ?? "—"}</div>
          </div>
          <div className="rounded-xl bg-slate-50 p-4">
            <div className="text-xs text-slate-500">最近同步</div>
            <div className="mt-1 truncate text-sm font-medium text-slate-900">{status?.last_synced_at ?? "—"}</div>
          </div>
        </div>
      </section>

      <section className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
        <div className="mb-4 flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
          <div>
            <h2 className="text-base font-semibold text-slate-900">投影数据</h2>
            <p className="mt-1 text-sm text-slate-500">只读当前态，不在 WMS 维护 OMS owner 数据。</p>
          </div>
          <input
            value={q}
            onChange={(event) => setQ(event.target.value)}
            onKeyDown={(event) => {
              if (event.key === "Enter") void load();
            }}
            placeholder="搜索订单号 / 店铺 / 身份值"
            className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm md:w-80"
          />
        </div>

        <div className="overflow-x-auto rounded-xl border border-slate-200">
          <table className="min-w-full divide-y divide-slate-200 text-sm">
            <thead className="bg-slate-50">
              <tr>
                {columns.length > 0 ? (
                  columns.map((column) => (
                    <th key={column} className="whitespace-nowrap px-3 py-3 text-left font-medium text-slate-600">
                      {column}
                    </th>
                  ))
                ) : (
                  <th className="px-3 py-3 text-left font-medium text-slate-600">数据</th>
                )}
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 bg-white">
              {rowItems.map((row, index) => (
                <tr key={`${formatValue(row.id)}-${index}`}>
                  {columns.map((column) => (
                    <td key={column} className="max-w-[280px] truncate px-3 py-3 text-slate-700">
                      {formatValue(row[column])}
                    </td>
                  ))}
                </tr>
              ))}
              {rows && rowItems.length === 0 ? (
                <tr>
                  <td className="px-3 py-8 text-center text-slate-500" colSpan={Math.max(columns.length, 1)}>
                    暂无数据
                  </td>
                </tr>
              ) : null}
            </tbody>
          </table>
        </div>

        <div className="mt-3 text-xs text-slate-500">
          total={rows?.total ?? "—"} / limit={rows?.limit ?? "—"} / offset={rows?.offset ?? "—"}
        </div>
      </section>

      <section className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
        <h2 className="text-base font-semibold text-slate-900">最近同步运行</h2>
        <div className="mt-3 space-y-2">
          {runItems.map((run) => (
            <div key={String(run.id)} className="rounded-xl bg-slate-50 px-4 py-3 text-sm text-slate-700">
              <span className="font-medium">#{String(run.id)}</span>
              <span className="ml-3">{run.status ?? "unknown"}</span>
              <span className="ml-3 text-slate-500">{run.started_at ?? "—"}</span>
              {run.error_message ? <span className="ml-3 text-red-600">{run.error_message}</span> : null}
            </div>
          ))}
          {runs && runItems.length === 0 ? <div className="text-sm text-slate-500">暂无同步记录</div> : null}
        </div>
      </section>
    </div>
  );
};
