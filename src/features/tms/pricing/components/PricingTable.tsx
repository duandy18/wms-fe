// src/features/tms/pricing/components/PricingTable.tsx

import React, { useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import type { PricingListRow, PricingStatus } from "../types";

type Props = {
  rows: PricingListRow[];
  loading: boolean;
  error: string;
  actionKey: string;
  activateNow: (row: PricingListRow) => Promise<void>;
  scheduleActivate: (
    row: PricingListRow,
    effectiveFrom: string,
  ) => Promise<void>;
  deactivateBinding: (row: PricingListRow) => Promise<void>;
};

function statusBadge(status: PricingStatus) {
  switch (status) {
    case "active":
      return {
        text: "已生效",
        className: "bg-emerald-50 text-emerald-700 border-emerald-200",
      };
    case "scheduled":
      return {
        text: "待生效",
        className: "bg-sky-50 text-sky-700 border-sky-200",
      };
    case "no_active_template":
      return {
        text: "未挂收费表",
        className: "bg-amber-50 text-amber-700 border-amber-200",
      };
    case "binding_disabled":
      return {
        text: "已停止使用收费表",
        className: "bg-slate-50 text-slate-700 border-slate-300",
      };
    case "provider_disabled":
      return {
        text: "网点停用",
        className: "bg-slate-50 text-slate-700 border-slate-300",
      };
    default:
      return {
        text: status,
        className: "bg-slate-50 text-slate-700 border-slate-200",
      };
  }
}

function formatDateTime(value?: string | null): string {
  if (!value) return "-";

  const d = new Date(value);
  if (Number.isNaN(d.getTime())) return value;

  const yyyy = d.getFullYear();
  const mm = String(d.getMonth() + 1).padStart(2, "0");
  const dd = String(d.getDate()).padStart(2, "0");
  const hh = String(d.getHours()).padStart(2, "0");
  const mi = String(d.getMinutes()).padStart(2, "0");
  return `${yyyy}-${mm}-${dd} ${hh}:${mi}`;
}

function toDateTimeLocalValue(value?: string | null): string {
  const date = value ? new Date(value) : new Date(Date.now() + 60 * 60 * 1000);
  if (Number.isNaN(date.getTime())) {
    const fallback = new Date(Date.now() + 60 * 60 * 1000);
    return `${fallback.getFullYear()}-${String(fallback.getMonth() + 1).padStart(2, "0")}-${String(fallback.getDate()).padStart(2, "0")}T${String(fallback.getHours()).padStart(2, "0")}:${String(fallback.getMinutes()).padStart(2, "0")}`;
  }

  const yyyy = date.getFullYear();
  const mm = String(date.getMonth() + 1).padStart(2, "0");
  const dd = String(date.getDate()).padStart(2, "0");
  const hh = String(date.getHours()).padStart(2, "0");
  const mi = String(date.getMinutes()).padStart(2, "0");
  return `${yyyy}-${mm}-${dd}T${hh}:${mi}`;
}

function effectiveTimeText(row: PricingListRow): string {
  switch (row.pricing_status) {
    case "active":
      return `已生效｜${formatDateTime(row.effective_from)}`;
    case "scheduled":
      return `待生效｜${formatDateTime(row.effective_from)}`;
    case "binding_disabled":
      return "未启用";
    case "no_active_template":
      return "未挂收费表";
    case "provider_disabled":
      return "网点停用";
    default:
      return "-";
  }
}

const PricingTable: React.FC<Props> = ({
  rows,
  loading,
  error,
  actionKey,
  activateNow,
  scheduleActivate,
  deactivateBinding,
}) => {
  const nav = useNavigate();

  const [scheduleRowKey, setScheduleRowKey] = useState("");
  const [scheduleValue, setScheduleValue] = useState("");

  const scheduleDefaultMap = useMemo(() => {
    const map = new Map<string, string>();
    for (const row of rows) {
      const key = `${row.provider_id}-${row.warehouse_id}`;
      map.set(key, toDateTimeLocalValue(row.effective_from));
    }
    return map;
  }, [rows]);

  return (
    <section className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
      <div className="mb-3">
        <div className="text-base font-semibold text-slate-900">运价管理</div>
        <div className="mt-1 text-sm text-slate-500">
          仓库 × 快递网点（收费表挂载与运行控制）
        </div>
      </div>

      {error && (
        <div className="rounded-xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-700">
          {error}
        </div>
      )}

      <div className="overflow-x-auto">
        <table className="min-w-full text-sm">
          <thead>
            <tr>
              <th className="px-3 py-3 text-left">网点</th>
              <th className="px-3 py-3 text-left">仓库</th>
              <th className="px-3 py-3 text-left">当前收费表</th>
              <th className="px-3 py-3 text-left">运行状态</th>
              <th className="px-3 py-3 text-left">生效时间</th>
              <th className="px-3 py-3 text-left">操作</th>
            </tr>
          </thead>

          <tbody>
            {loading ? (
              <tr>
                <td colSpan={6} className="px-3 py-8 text-center text-slate-500">
                  加载中...
                </td>
              </tr>
            ) : rows.length === 0 ? (
              <tr>
                <td colSpan={6} className="px-3 py-8 text-center text-slate-500">
                  暂无数据
                </td>
              </tr>
            ) : (
              rows.map((row) => {
                const key = `${row.provider_id}-${row.warehouse_id}`;
                const status = statusBadge(row.pricing_status);
                const rowBusy = actionKey === key;
                const hasTemplate = row.active_template_id != null;
                const scheduleOpen = scheduleRowKey === key;

                const canRunControl =
                  hasTemplate && row.pricing_status !== "provider_disabled";

                const stopLabel =
                  row.pricing_status === "scheduled" ? "取消待生效" : "停用";

                return (
                  <tr key={key} className="border-t border-slate-100">
                    <td className="px-3 py-3 align-top">
                      <div className="font-medium text-slate-900">
                        {row.provider_name}
                      </div>
                      <div className="text-xs text-slate-500">
                        {row.provider_code}
                      </div>
                    </td>

                    <td className="px-3 py-3 align-top">{row.warehouse_name}</td>

                    <td className="px-3 py-3 align-top">
                      {row.active_template_id ? (
                        <div>
                          <div className="font-medium text-slate-900">
                            {row.active_template_name ||
                              `收费表 #${row.active_template_id}`}
                          </div>
                        </div>
                      ) : (
                        <span className="text-slate-400">暂无收费表</span>
                      )}
                    </td>

                    <td className="px-3 py-3 align-top">
                      <span
                        className={`rounded border px-2 py-1 text-xs ${status.className}`}
                      >
                        {status.text}
                      </span>
                    </td>

                    <td className="px-3 py-3 align-top text-sm text-slate-700">
                      {effectiveTimeText(row)}
                    </td>

                    <td className="px-3 py-3 align-top">
                      <div className="flex flex-wrap gap-2">
                        {canRunControl &&
                        (row.pricing_status === "active" ||
                          row.pricing_status === "scheduled") ? (
                          <button
                            className="rounded border px-3 py-1 text-xs disabled:cursor-not-allowed disabled:opacity-50"
                            disabled={rowBusy}
                            onClick={() => void deactivateBinding(row)}
                          >
                            {rowBusy ? "处理中..." : stopLabel}
                          </button>
                        ) : null}

                        {canRunControl &&
                        (row.pricing_status === "binding_disabled" ||
                          row.pricing_status === "no_active_template") ? (
                          <button
                            className="rounded border border-emerald-300 px-3 py-1 text-xs text-emerald-700 disabled:cursor-not-allowed disabled:opacity-50"
                            disabled={rowBusy}
                            onClick={() => void activateNow(row)}
                          >
                            {rowBusy ? "处理中..." : "立即启用"}
                          </button>
                        ) : null}

                        {canRunControl &&
                        (row.pricing_status === "binding_disabled" ||
                          row.pricing_status === "no_active_template") ? (
                          <button
                            className="rounded border border-sky-300 px-3 py-1 text-xs text-sky-700 disabled:cursor-not-allowed disabled:opacity-50"
                            disabled={rowBusy}
                            onClick={() => {
                              setScheduleRowKey(key);
                              setScheduleValue(
                                scheduleDefaultMap.get(key) ??
                                  toDateTimeLocalValue(null),
                              );
                            }}
                          >
                            定时启用
                          </button>
                        ) : null}

                        {row.active_template_id ? (
                          <button
                            className="rounded border border-sky-300 px-3 py-1 text-xs text-sky-700"
                            onClick={() =>
                              nav(
                                `/tms/templates/${row.active_template_id}?provider_id=${row.provider_id}&warehouse_id=${row.warehouse_id}`,
                              )
                            }
                          >
                            查看收费表
                          </button>
                        ) : null}
                      </div>

                      {!hasTemplate ? (
                        <div className="mt-2 text-xs text-amber-600">
                          请先在上方配置关联中挂收费表，再做运行控制。
                        </div>
                      ) : null}

                      {scheduleOpen ? (
                        <div className="mt-3 flex flex-wrap items-center gap-2 rounded-xl border border-sky-200 bg-sky-50 p-3">
                          <input
                            type="datetime-local"
                            value={scheduleValue}
                            onChange={(e) => setScheduleValue(e.target.value)}
                            className="rounded border border-slate-300 bg-white px-3 py-2 text-xs text-slate-900"
                          />

                          <button
                            className="rounded border border-sky-300 bg-white px-3 py-1 text-xs text-sky-700 disabled:cursor-not-allowed disabled:opacity-50"
                            disabled={rowBusy || !scheduleValue}
                            onClick={() => {
                              const iso = new Date(scheduleValue).toISOString();
                              void scheduleActivate(row, iso).then(() => {
                                setScheduleRowKey("");
                                setScheduleValue("");
                              });
                            }}
                          >
                            {rowBusy ? "处理中..." : "确认定时"}
                          </button>

                          <button
                            className="rounded border px-3 py-1 text-xs text-slate-600"
                            disabled={rowBusy}
                            onClick={() => {
                              setScheduleRowKey("");
                              setScheduleValue("");
                            }}
                          >
                            取消
                          </button>
                        </div>
                      ) : null}
                    </td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>
    </section>
  );
};

export default PricingTable;
