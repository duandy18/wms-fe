// src/features/shipping-assist/handoffs/pages/ShippingHandoffPage.tsx

import React, { useCallback, useEffect, useMemo, useState } from "react";
import { Link, useLocation } from "react-router-dom";
import PageTitle from "../../../../components/ui/PageTitle";
import { fetchShippingHandoffs } from "../api";
import type { ShippingHandoffRow, ShippingHandoffShipmentItem } from "../types";
import {
  formatAddress,
  formatDateTime,
  formatItemLine,
  formatSourceType,
  formatText,
} from "../types";

type HandoffTab = "status" | "payload";

function getActiveTab(pathname: string): HandoffTab {
  return pathname.endsWith("/payload") ? "payload" : "status";
}

function deriveHandoffStage(row: ShippingHandoffRow): string {
  if (row.export_status === "CANCELLED") return "已取消";

  if (row.export_status === "PENDING" && row.logistics_status === "NOT_IMPORTED") {
    return "待 Logistics 导入";
  }

  if (row.export_status === "FAILED" && row.logistics_status === "FAILED") {
    return "导出物流失败";
  }

  if (row.export_status === "EXPORTED" && row.logistics_status === "IMPORTED") {
    return "已导出，待物流处理";
  }

  if (row.export_status === "EXPORTED" && row.logistics_status === "IN_PROGRESS") {
    return "物流处理中";
  }

  if (row.export_status === "EXPORTED" && row.logistics_status === "COMPLETED") {
    return "物流已完成";
  }

  if (row.export_status === "FAILED") return "导出物流失败";
  if (row.logistics_status === "COMPLETED") return "物流已完成";
  if (row.logistics_status === "IN_PROGRESS") return "物流处理中";

  return `${row.export_status} / ${row.logistics_status}`;
}

function handoffStageClass(row: ShippingHandoffRow): string {
  if (row.export_status === "CANCELLED") {
    return "border-slate-300 bg-slate-100 text-slate-700";
  }

  if (row.export_status === "FAILED" || row.logistics_status === "FAILED") {
    return "border-rose-200 bg-rose-50 text-rose-700";
  }

  if (row.logistics_status === "COMPLETED") {
    return "border-emerald-200 bg-emerald-50 text-emerald-700";
  }

  if (row.logistics_status === "IN_PROGRESS") {
    return "border-sky-200 bg-sky-50 text-sky-700";
  }

  if (row.export_status === "EXPORTED") {
    return "border-indigo-200 bg-indigo-50 text-indigo-700";
  }

  return "border-amber-200 bg-amber-50 text-amber-700";
}

function HandoffStageBadge({ row }: { row: ShippingHandoffRow }) {
  return (
    <div className="space-y-1">
      <span
        className={`inline-flex rounded-full border px-2 py-0.5 text-xs font-medium ${handoffStageClass(
          row,
        )}`}
      >
        {deriveHandoffStage(row)}
      </span>
      <div className="font-mono text-[11px] text-slate-500">
        {row.export_status} / {row.logistics_status}
      </div>
    </div>
  );
}

function HandoffTabs({ active }: { active: HandoffTab }) {
  const tabs = [
    {
      key: "status" as const,
      label: "交接状态",
      to: "/shipping-assist/handoffs/status",
      hint: "观察 WMS 与 Logistics 的导出、处理和回写状态。",
    },
    {
      key: "payload" as const,
      label: "交接数据",
      to: "/shipping-assist/handoffs/payload",
      hint: "查看 Logistics 创建发货请求所需的结构化交接数据。",
    },
  ];

  return (
    <section className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
      <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
        <div className="flex flex-wrap gap-2">
          {tabs.map((tab) => {
            const selected = active === tab.key;
            return (
              <Link
                key={tab.key}
                to={tab.to}
                className={
                  selected
                    ? "rounded-lg bg-slate-900 px-4 py-2 text-sm font-medium text-white"
                    : "rounded-lg border border-slate-300 px-4 py-2 text-sm font-medium text-slate-700 hover:bg-slate-50"
                }
              >
                {tab.label}
              </Link>
            );
          })}
        </div>

        <div className="text-sm text-slate-500">
          {tabs.find((tab) => tab.key === active)?.hint}
        </div>
      </div>
    </section>
  );
}

function HandoffToolbar({
  rows,
  total,
  loading,
  onReload,
}: {
  rows: ShippingHandoffRow[];
  total: number;
  loading: boolean;
  onReload: () => void;
}) {
  const summary = useMemo(() => {
    const pending = rows.filter((row) => row.export_status === "PENDING").length;
    const exported = rows.filter(
      (row) =>
        row.export_status === "EXPORTED" &&
        ["IMPORTED", "IN_PROGRESS"].includes(row.logistics_status),
    ).length;
    const completed = rows.filter((row) => row.logistics_status === "COMPLETED").length;
    const failed = rows.filter(
      (row) => row.export_status === "FAILED" || row.logistics_status === "FAILED",
    ).length;

    return { pending, exported, completed, failed };
  }, [rows]);

  return (
    <section className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
      <div className="flex flex-col gap-3 xl:flex-row xl:items-center xl:justify-between">
        <div className="grid grid-cols-2 gap-3 text-sm text-slate-600 md:grid-cols-5">
          <div>
            <div className="text-xs text-slate-500">当前结果</div>
            <div className="font-semibold text-slate-900">
              {rows.length} / {total}
            </div>
          </div>
          <div>
            <div className="text-xs text-slate-500">待导入</div>
            <div className="font-semibold text-slate-900">{summary.pending}</div>
          </div>
          <div>
            <div className="text-xs text-slate-500">已导出/处理中</div>
            <div className="font-semibold text-slate-900">{summary.exported}</div>
          </div>
          <div>
            <div className="text-xs text-slate-500">已完成</div>
            <div className="font-semibold text-slate-900">{summary.completed}</div>
          </div>
          <div>
            <div className="text-xs text-slate-500">失败</div>
            <div className="font-semibold text-rose-700">{summary.failed}</div>
          </div>
        </div>

        <button
          type="button"
          className="rounded-lg border border-slate-300 px-3 py-2 text-sm text-slate-700 hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-60"
          onClick={onReload}
          disabled={loading}
        >
          {loading ? "刷新中…" : "刷新"}
        </button>
      </div>
    </section>
  );
}

function StatusTable({
  rows,
  loading,
  error,
}: {
  rows: ShippingHandoffRow[];
  loading: boolean;
  error: string;
}) {
  return (
    <section className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
      <div className="mb-3 text-sm font-semibold text-slate-800">交接状态表</div>

      {error ? (
        <div className="rounded-lg border border-rose-200 bg-rose-50 px-3 py-2 text-sm text-rose-700">
          {error}
        </div>
      ) : null}

      {!error && loading ? (
        <div className="text-sm text-slate-500">正在加载交接状态…</div>
      ) : null}

      {!error && !loading && rows.length === 0 ? (
        <div className="text-sm text-slate-500">暂无交接状态记录。</div>
      ) : null}

      {!error && rows.length > 0 ? (
        <div className="overflow-x-auto">
          <table className="min-w-full border-collapse text-sm">
            <thead className="bg-slate-50">
              <tr>
                <th className="px-3 py-2 text-right">ID</th>
                <th className="px-3 py-2 text-left">来源</th>
                <th className="px-3 py-2 text-left">来源单号</th>
                <th className="px-3 py-2 text-left">交接键</th>
                <th className="px-3 py-2 text-left">当前阶段</th>
                <th className="px-3 py-2 text-left">物流请求单</th>
                <th className="px-3 py-2 text-left">导出回写时间</th>
                <th className="px-3 py-2 text-left">物流完成时间</th>
                <th className="px-3 py-2 text-left">异常信息</th>
              </tr>
            </thead>

            <tbody>
              {rows.map((row) => (
                <tr key={row.id} className="border-t align-top">
                  <td className="px-3 py-2 text-right font-mono text-xs">
                    {row.id}
                  </td>
                  <td className="px-3 py-2 text-xs">
                    <div className="font-medium text-slate-800">
                      {formatSourceType(row.source_doc_type)}
                    </div>
                    <div className="font-mono text-slate-500">
                      #{row.source_doc_id}
                    </div>
                  </td>
                  <td className="px-3 py-2 font-mono text-xs">
                    {row.source_doc_no}
                  </td>
                  <td className="max-w-[280px] break-all px-3 py-2 font-mono text-xs">
                    {row.source_ref}
                  </td>
                  <td className="px-3 py-2">
                    <HandoffStageBadge row={row} />
                  </td>
                  <td className="px-3 py-2 text-xs">
                    <div className="font-mono">
                      {formatText(row.logistics_request_no)}
                    </div>
                    <div className="font-mono text-slate-500">
                      {row.logistics_request_id ?? "-"}
                    </div>
                  </td>
                  <td className="px-3 py-2 font-mono text-xs">
                    {formatDateTime(row.exported_at)}
                  </td>
                  <td className="px-3 py-2 font-mono text-xs">
                    {formatDateTime(row.logistics_completed_at)}
                  </td>
                  <td className="max-w-[360px] break-words px-3 py-2 text-xs text-rose-700">
                    {row.last_error || "-"}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      ) : null}
    </section>
  );
}

function ItemList({ items }: { items: ShippingHandoffShipmentItem[] }) {
  if (!items.length) {
    return <span className="text-xs text-slate-400">无商品行</span>;
  }

  return (
    <div className="space-y-1">
      {items.map((item, index) => (
        <div
          key={`${item.source_line_type}-${item.source_line_id ?? "x"}-${index}`}
          className="rounded-lg border border-slate-200 bg-slate-50 px-2 py-1"
        >
          <div className="text-xs font-medium text-slate-800">
            {formatItemLine(item)}
          </div>
          <div className="font-mono text-[11px] text-slate-500">
            {item.source_line_type} #{item.source_line_id ?? "-"}
          </div>
        </div>
      ))}
    </div>
  );
}

function PayloadTable({
  rows,
  loading,
  error,
}: {
  rows: ShippingHandoffRow[];
  loading: boolean;
  error: string;
}) {
  return (
    <section className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
      <div className="mb-3 text-sm font-semibold text-slate-800">交接数据表</div>

      {error ? (
        <div className="rounded-lg border border-rose-200 bg-rose-50 px-3 py-2 text-sm text-rose-700">
          {error}
        </div>
      ) : null}

      {!error && loading ? (
        <div className="text-sm text-slate-500">正在加载交接数据…</div>
      ) : null}

      {!error && !loading && rows.length === 0 ? (
        <div className="text-sm text-slate-500">暂无交接数据。</div>
      ) : null}

      {!error && rows.length > 0 ? (
        <div className="overflow-x-auto">
          <table className="min-w-full border-collapse text-sm">
            <thead className="bg-slate-50">
              <tr>
                <th className="px-3 py-2 text-left">出库事件ID</th>
                <th className="px-3 py-2 text-left">来源</th>
                <th className="px-3 py-2 text-left">来源单号</th>
                <th className="px-3 py-2 text-left">平台 / 店铺</th>
                <th className="px-3 py-2 text-left">订单引用</th>
                <th className="px-3 py-2 text-left">仓库</th>
                <th className="px-3 py-2 text-left">收件人</th>
                <th className="px-3 py-2 text-left">收件地址</th>
                <th className="px-3 py-2 text-left">商品行</th>
                <th className="px-3 py-2 text-left">出库时间</th>
              </tr>
            </thead>

            <tbody>
              {rows.map((row) => (
                <tr key={row.id} className="border-t align-top">
                  <td className="px-3 py-2 font-mono text-xs">
                    {row.outbound_event_id ?? "-"}
                  </td>
                  <td className="px-3 py-2 text-xs">
                    {formatSourceType(row.source_doc_type)}
                  </td>
                  <td className="px-3 py-2 font-mono text-xs">
                    {row.source_doc_no}
                  </td>
                  <td className="px-3 py-2 text-xs">
                    <div>{formatText(row.platform)}</div>
                    <div className="font-mono text-slate-500">
                      {formatText(row.store_code)}
                    </div>
                  </td>
                  <td className="max-w-[260px] break-all px-3 py-2 font-mono text-xs">
                    {formatText(row.order_ref)}
                  </td>
                  <td className="px-3 py-2 text-xs">
                    <div>{formatText(row.warehouse_name_snapshot)}</div>
                    <div className="font-mono text-slate-500">
                      {row.warehouse_id ?? "-"}
                    </div>
                  </td>
                  <td className="px-3 py-2 text-xs">
                    <div>{formatText(row.receiver_name)}</div>
                    <div className="font-mono text-slate-500">
                      {formatText(row.receiver_phone)}
                    </div>
                  </td>
                  <td className="min-w-[360px] max-w-[560px] break-words px-3 py-2 text-xs">
                    {formatAddress(row)}
                  </td>
                  <td className="min-w-[320px] px-3 py-2">
                    <ItemList items={row.shipment_items} />
                  </td>
                  <td className="px-3 py-2 font-mono text-xs">
                    {formatDateTime(row.outbound_completed_at)}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      ) : null}
    </section>
  );
}


const ShippingHandoffPage: React.FC = () => {
  const location = useLocation();
  const activeTab = getActiveTab(location.pathname);

  const [rows, setRows] = useState<ShippingHandoffRow[]>([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const reload = useCallback(async (): Promise<void> => {
    setLoading(true);
    setError("");

    try {
      const res = await fetchShippingHandoffs({ limit: 500, offset: 0 });
      setRows(Array.isArray(res.rows) ? res.rows : []);
      setTotal(typeof res.total === "number" ? res.total : 0);
    } catch (err) {
      setRows([]);
      setTotal(0);
      setError(err instanceof Error ? err.message : "加载发货交接记录失败");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void reload();
  }, [reload]);

  return (
    <div className="space-y-4 p-6">
      <PageTitle
        title="发货交接"
        description="侧边菜单只显示发货交接；页内用独立路由区分交接状态和交接数据。"
      />

      <HandoffTabs active={activeTab} />

      <HandoffToolbar
        rows={rows}
        total={total}
        loading={loading}
        onReload={() => void reload()}
      />

      {activeTab === "status" ? (
        <StatusTable rows={rows} loading={loading} error={error} />
      ) : (
        <PayloadTable rows={rows} loading={loading} error={error} />
      )}
    </div>
  );
};

export default ShippingHandoffPage;
